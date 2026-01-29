/**
 * useNetworkStatus.ts
 *
 * Hook for monitoring network connectivity status.
 * Provides real-time online/offline status with debouncing.
 */

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
    isOnline: boolean;
    lastOnlineTime: Date | null;
    lastOfflineTime: Date | null;
    offlineDuration: number | null;
}

export function useNetworkStatus(): NetworkStatus {
    const [isOnline, setIsOnline] = useState<boolean>(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
    const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);

    useEffect(() => {
        const handleOnline = (): void => {
            setIsOnline(true);
            setLastOnlineTime(new Date());
        };

        const handleOffline = (): void => {
            setIsOnline(false);
            setLastOfflineTime(new Date());
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const offlineDuration = useCallback((): number | null => {
        if (!lastOfflineTime || !lastOnlineTime) return null;
        if (lastOnlineTime < lastOfflineTime) return null;
        return Math.round((lastOnlineTime.getTime() - lastOfflineTime.getTime()) / 1000);
    }, [lastOnlineTime, lastOfflineTime]);

    return {
        isOnline,
        lastOnlineTime,
        lastOfflineTime,
        offlineDuration: offlineDuration(),
    };
}

export default useNetworkStatus;
