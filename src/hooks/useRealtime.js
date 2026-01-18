/**
 * useRealtime.js
 * 
 * React hook for WebSocket real-time subscriptions.
 * Connects to the /realtime namespace and handles sync status updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Hook for real-time subscriptions
 */
export function useRealtime(token) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState(null);
    const socketRef = useRef(null);
    const listenersRef = useRef(new Map());

    // Connect to WebSocket
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

        socket.on('connect_error', (error) => {
            console.error('[Realtime] Connection error:', error.message);
        });

        // Handle all realtime events
        ['sync:status', 'sync:complete', 'sync:error', 'data:update', 'notification'].forEach(event => {
            socket.on(event, (payload) => {
                setLastEvent({ event, payload, timestamp: new Date() });

                // Notify all listeners for this event
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

    /**
     * Subscribe to entity updates
     */
    const subscribe = useCallback((entityType, entityId) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('subscribe', { entityType, entityId });
        }
    }, []);

    /**
     * Unsubscribe from entity updates
     */
    const unsubscribe = useCallback((entityType, entityId) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('unsubscribe', { entityType, entityId });
        }
    }, []);

    /**
     * Add event listener
     */
    const on = useCallback((event, callback) => {
        if (!listenersRef.current.has(event)) {
            listenersRef.current.set(event, []);
        }
        listenersRef.current.get(event).push(callback);

        // Return cleanup function
        return () => {
            const listeners = listenersRef.current.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
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

/**
 * Hook for sync status subscription  
 */
export function useSyncStatus(entityType, entityId) {
    const [syncStatus, setSyncStatus] = useState(null);
    const { isConnected, subscribe, unsubscribe, on } = useRealtime(
        localStorage.getItem('token')
    );

    useEffect(() => {
        if (isConnected && entityType) {
            subscribe(entityType, entityId);

            const cleanup = on('sync:status', (payload) => {
                if (payload.entityType === entityType &&
                    (!entityId || payload.entityId === entityId)) {
                    setSyncStatus(payload.data);
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
