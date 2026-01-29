/**
 * contactsSyncApi.ts
 *
 * Contacts 同步 API 封裝 - TypeScript 版本
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
 * 同步單一聯絡人到 Google Contacts
 */
export async function syncContactToGoogle(contactId: string): Promise<SyncResult> {
    return api.post(`/integrations/google/contacts/sync/contact/${contactId}`);
}

/**
 * 同步客戶所有聯絡人
 */
export async function syncClientContactsToGoogle(clientId: string): Promise<BulkSyncResult> {
    return api.post(`/integrations/google/contacts/sync/client/${clientId}`);
}

/**
 * 同步廠商所有聯絡人
 */
export async function syncVendorContactsToGoogle(vendorId: string): Promise<BulkSyncResult> {
    return api.post(`/integrations/google/contacts/sync/vendor/${vendorId}`);
}

/**
 * 刪除客戶所有聯絡人從 Google Contacts
 */
export async function deleteClientContactsFromGoogle(clientId: string): Promise<BulkSyncResult> {
    return api.post(`/integrations/google/contacts/delete/client/${clientId}`);
}

/**
 * 刪除廠商所有聯絡人從 Google Contacts
 */
export async function deleteVendorContactsFromGoogle(vendorId: string): Promise<BulkSyncResult> {
    return api.post(`/integrations/google/contacts/delete/vendor/${vendorId}`);
}

export default {
    syncContactToGoogle,
    syncClientContactsToGoogle,
    syncVendorContactsToGoogle,
    deleteClientContactsFromGoogle,
    deleteVendorContactsFromGoogle,
};
