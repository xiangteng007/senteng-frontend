/**
 * useGoogleIntegrationStatus.ts
 *
 * Google Integration 狀態快取 Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { integrationsApi } from '../services/integrationsApi';

export interface GoogleIntegrationStatus {
    connected: boolean;
    googleAccountEmail: string | null;
    calendarId: string | null;
    contactsLabel: string | null;
    autoSyncEvents: boolean;
    autoSyncContacts: boolean;
    lastSyncedAt: string | null;
    lastSyncError: string | null;
}

export interface UseGoogleIntegrationStatusResult {
    data: GoogleIntegrationStatus | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useGoogleIntegrationStatus(): UseGoogleIntegrationStatusResult {
    const [data, setData] = useState<GoogleIntegrationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const status = await integrationsApi.getStatus();
            setData(status as GoogleIntegrationStatus);
        } catch (e) {
            const err = e as Error;
            setError(err?.message || 'Failed to load Google integration status');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

export default useGoogleIntegrationStatus;
