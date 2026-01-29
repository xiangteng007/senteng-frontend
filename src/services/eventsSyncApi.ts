/**
 * eventsSyncApi.ts
 *
 * Events 同步 API 封裝 - TypeScript 版本
 */

import { api } from './api';

// ==========================================
// Types
// ==========================================

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

// ==========================================
// API Functions
// ==========================================

/**
 * 同步事件到 Google Calendar
 */
export async function syncEventToGoogle(eventId: string): Promise<SyncResult> {
    return api.post(`/integrations/google/calendar/sync/events/${eventId}`);
}

/**
 * 批量同步事件
 */
export async function syncCalendarBulk(): Promise<BulkSyncResult> {
    return api.post('/integrations/google/calendar/sync/bulk');
}

/**
 * 重試失敗的同步
 */
export async function retryCalendarSync(): Promise<BulkSyncResult> {
    return api.post('/integrations/google/calendar/retry');
}

export default {
    syncEventToGoogle,
    syncCalendarBulk,
    retryCalendarSync,
};
