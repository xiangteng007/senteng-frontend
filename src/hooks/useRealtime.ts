/**
 * useRealtime.ts
 *
 * React hook for WebSocket real-time subscriptions.
 * Connects to the /realtime namespace and handles sync status updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_HOST } from '../config/api';

const SOCKET_URL = API_HOST;

export interface RealtimeEvent {
    event: string;
    payload: unknown;
    timestamp: Date;
}

export interface RealtimeHook {
    isConnected: boolean;
    lastEvent: RealtimeEvent | null;
    subscribe: (entityType: string, entityId?: string) => void;
    unsubscribe: (entityType: string, entityId?: string) => void;
    on: (event: string, callback: (payload: unknown) => void) => () => void;
}

export interface SyncStatusPayload {
    entityType: string;
    entityId?: string;
    data: unknown;
}

export function useRealtime(token: string | null): RealtimeHook {
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const listenersRef = useRef<Map<string, Array<(payload: unknown) => void>>>(new Map());

    useEffect(() => {
        if (!token) return;

        const socket = io(`${SOCKET_URL}/realtime`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('[Realtime] Connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('[Realtime] Disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error: Error) => {
            console.error('[Realtime] Connection error:', error.message);
        });

        ['sync:status', 'sync:complete', 'sync:error', 'data:update', 'notification'].forEach(event => {
            socket.on(event, (payload: unknown) => {
                setLastEvent({ event, payload, timestamp: new Date() });
                const listeners = listenersRef.current.get(event) || [];
                listeners.forEach(callback => callback(payload));
            });
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token]);

    const subscribe = useCallback((entityType: string, entityId?: string): void => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('subscribe', { entityType, entityId });
        }
    }, []);

    const unsubscribe = useCallback((entityType: string, entityId?: string): void => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('unsubscribe', { entityType, entityId });
        }
    }, []);

    const on = useCallback((event: string, callback: (payload: unknown) => void): () => void => {
        if (!listenersRef.current.has(event)) {
            listenersRef.current.set(event, []);
        }
        listenersRef.current.get(event)!.push(callback);

        return () => {
            const listeners = listenersRef.current.get(event);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }, []);

    return {
        isConnected,
        lastEvent,
        subscribe,
        unsubscribe,
        on,
    };
}

export function useSyncStatus(entityType: string, entityId?: string): unknown {
    const [syncStatus, setSyncStatus] = useState<unknown>(null);
    const { isConnected, subscribe, unsubscribe, on } = useRealtime(localStorage.getItem('token'));

    useEffect(() => {
        if (isConnected && entityType) {
            subscribe(entityType, entityId);

            const cleanup = on('sync:status', (payload: unknown) => {
                const p = payload as SyncStatusPayload;
                if (p.entityType === entityType && (!entityId || p.entityId === entityId)) {
                    setSyncStatus(p.data);
                }
            });

            return () => {
                unsubscribe(entityType, entityId);
                cleanup();
            };
        }
    }, [isConnected, entityType, entityId, subscribe, unsubscribe, on]);

    return syncStatus;
}
