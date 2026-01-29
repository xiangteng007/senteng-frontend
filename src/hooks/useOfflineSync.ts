/**
 * useOfflineSync.ts
 *
 * React hook for offline-aware API calls.
 * Automatically queues mutations when offline and syncs when back online.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    initOfflineQueue,
    queueRequest,
    getQueueStats,
    processPendingRequests,
    QueueStats,
    QueuedRequest,
} from '../services/offlineQueue';

export interface OfflineFetchResponse extends Response {
    queued?: boolean;
    message?: string;
}

export interface OfflineSyncHook {
    isOnline: boolean;
    queueStats: QueueStats;
    isSyncing: boolean;
    offlineFetch: (url: string, options?: RequestInit) => Promise<Response | OfflineFetchResponse>;
    syncPending: () => Promise<unknown>;
    refreshStats: () => Promise<void>;
}

export interface ConflictInfo<T> {
    type: 'server_wins';
    message: string;
    localData: T;
    serverData: T;
}

export function useOfflineSync(): OfflineSyncHook {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [queueStats, setQueueStats] = useState<QueueStats>({ total: 0, pending: 0, failed: 0 });
    const [isSyncing, setIsSyncing] = useState(false);

    const loadStats = async (): Promise<void> => {
        const stats = await getQueueStats();
        setQueueStats(stats);
    };

    const syncPending = useCallback(async (): Promise<unknown> => {
        if (!navigator.onLine || isSyncing) return;

        setIsSyncing(true);
        try {
            const results = await processPendingRequests((progress: { success: number }) => {
                setQueueStats(prev => ({
                    ...prev,
                    pending: prev.pending - progress.success,
                }));
            });
            await loadStats();
            return results;
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing]);

    useEffect(() => {
        initOfflineQueue();

        const handleOnline = (): void => {
            setIsOnline(true);
            syncPending();
        };

        const handleOffline = (): void => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        loadStats();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncPending]);

    const offlineFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response | OfflineFetchResponse> => {
        const method = options.method?.toUpperCase() || 'GET';
        const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

        if (navigator.onLine) {
            try {
                const response = await fetch(url, options);
                return response;
            } catch {
                if (isMutation) {
                    const request: Omit<QueuedRequest, 'id' | 'status' | 'createdAt' | 'idempotencyKey'> = {
                        method,
                        url,
                        headers: options.headers as Record<string, string>,
                        body: options.body as string,
                    };
                    await queueRequest(request);
                    await loadStats();
                    return {
                        ok: false,
                        queued: true,
                        message: '已加入離線佇列，將在恢復連線後自動送出',
                    } as OfflineFetchResponse;
                }
                throw new Error('Network error');
            }
        } else {
            if (isMutation) {
                const request: Omit<QueuedRequest, 'id' | 'status' | 'createdAt' | 'idempotencyKey'> = {
                    method,
                    url,
                    headers: options.headers as Record<string, string>,
                    body: options.body as string,
                };
                await queueRequest(request);
                await loadStats();
                return {
                    ok: false,
                    queued: true,
                    message: '已加入離線佇列，將在恢復連線後自動送出',
                } as OfflineFetchResponse;
            }
            throw new Error('目前離線中，無法取得資料');
        }
    }, []);

    return {
        isOnline,
        queueStats,
        isSyncing,
        offlineFetch,
        syncPending,
        refreshStats: loadStats,
    };
}

export function resolveConflict<T extends { updatedAt?: string }>(
    localData: T,
    serverData: T,
    onConflict?: (info: ConflictInfo<T>) => void
): T {
    if (localData.updatedAt && serverData.updatedAt) {
        const localTime = new Date(localData.updatedAt).getTime();
        const serverTime = new Date(serverData.updatedAt).getTime();

        if (serverTime > localTime) {
            if (onConflict) {
                onConflict({
                    type: 'server_wins',
                    message: '資料已被其他使用者更新，顯示最新版本',
                    localData,
                    serverData,
                });
            }
            return serverData;
        }
    }
    return localData;
}
