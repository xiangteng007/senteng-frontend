/**
 * integrationsApi.ts
 *
 * Google Integrations API 封裝 - TypeScript 版本
 */

import { api } from './api';

// ==========================================
// Types
// ==========================================

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

export interface GoogleConfigureRequest {
    autoSyncEvents?: boolean;
    autoSyncContacts?: boolean;
    calendarId?: string;
    contactsLabel?: string;
}

export interface SyncResult {
    success: boolean;
    syncedAt?: string;
    googleId?: string;
    error?: string;
}

export interface BulkSyncResult {
    total: number;
    synced: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
}

export interface ConnectResult {
    success: boolean;
    redirectUrl?: string;
    error?: string;
}

// ==========================================
// API Functions
// ==========================================

export const integrationsApi = {
    // OAuth 管理
    getStatus: (): Promise<GoogleIntegrationStatus> => api.get('/integrations/google/status'),

    connect: (): Promise<ConnectResult> => api.post('/integrations/google/connect'),

    disconnect: (): Promise<{ success: boolean }> => api.post('/integrations/google/disconnect'),

    configure: (config: GoogleConfigureRequest): Promise<GoogleIntegrationStatus> =>
        api.post('/integrations/google/configure', config),

    // Calendar Sync
    syncEvent: (eventId: string): Promise<SyncResult> =>
        api.post(`/integrations/google/calendar/sync/events/${eventId}`),

    syncCalendarBulk: (): Promise<BulkSyncResult> =>
        api.post('/integrations/google/calendar/sync/bulk'),

    retryCalendarSync: (): Promise<BulkSyncResult> =>
        api.post('/integrations/google/calendar/retry'),

    // Contacts Sync
    syncContact: (contactId: string): Promise<SyncResult> =>
        api.post(`/integrations/google/contacts/sync/contact/${contactId}`),

    syncClientContacts: (clientId: string): Promise<BulkSyncResult> =>
        api.post(`/integrations/google/contacts/sync/client/${clientId}`),

    syncVendorContacts: (vendorId: string): Promise<BulkSyncResult> =>
        api.post(`/integrations/google/contacts/sync/vendor/${vendorId}`),
};

export default integrationsApi;
