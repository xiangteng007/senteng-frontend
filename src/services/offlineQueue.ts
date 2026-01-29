/**
 * offlineQueue.ts
 *
 * IndexedDB-based offline queue for storing mutations when network is unavailable.
 * Automatically syncs when back online.
 */

// ==========================================
// Constants
// ==========================================

const DB_NAME = 'senteng-erp-offline';
const DB_VERSION = 1;
const QUEUE_STORE = 'offline-queue';

// ==========================================
// Types
// ==========================================

export type QueueItemStatus = 'pending' | 'failed' | 'completed';

export interface QueueRequest {
    method: string;
    url: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
}

export interface QueueItem {
    id?: number;
    method: string;
    url: string;
    headers: Record<string, string>;
    body: BodyInit | null;
    idempotencyKey: string;
    createdAt: string;
    updatedAt?: string;
    status: QueueItemStatus;
    retryCount: number;
    lastError: string | null;
}

export interface QueueResult {
    id?: number;
    skipped?: boolean;
    reason?: string;
}

export interface ProcessResults {
    success: number;
    failed: number;
    skipped: number;
}

export interface QueueStats {
    total: number;
    pending: number;
    failed: number;
}

// ==========================================
// Module State
// ==========================================

let db: IDBDatabase | null = null;

// ==========================================
// Helper Functions
// ==========================================

/**
 * Generate idempotency key for a request
 */
function generateIdempotencyKey(request: QueueRequest): string {
    const data = JSON.stringify({
        method: request.method,
        url: request.url,
        body: request.body,
        timestamp: Math.floor(Date.now() / 60000), // 1-minute granularity
    });
    // Simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return `idem_${Math.abs(hash).toString(36)}`;
}

// ==========================================
// Database Functions
// ==========================================

/**
 * Initialize IndexedDB
 */
export async function initOfflineQueue(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            if (!database.objectStoreNames.contains(QUEUE_STORE)) {
                const store = database.createObjectStore(QUEUE_STORE, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('createdAt', 'createdAt', { unique: false });
                store.createIndex('status', 'status', { unique: false });
            }
        };
    });
}

/**
 * Add a request to the offline queue
 */
export async function queueRequest(request: QueueRequest): Promise<QueueResult> {
    if (!db) await initOfflineQueue();

    const queueItem: Omit<QueueItem, 'id'> = {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(
            request.headers instanceof Headers
                ? request.headers.entries()
                : Object.entries(request.headers || {})
        ),
        body: request.body ?? null,
        idempotencyKey: generateIdempotencyKey(request),
        createdAt: new Date().toISOString(),
        status: 'pending',
        retryCount: 0,
        lastError: null,
    };

    return new Promise((resolve, reject) => {
        const tx = db!.transaction(QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE);

        // Check for duplicate idempotency key
        const index = store.index('status');
        const pendingRequest = index.openCursor(IDBKeyRange.only('pending'));

        pendingRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                if ((cursor.value as QueueItem).idempotencyKey === queueItem.idempotencyKey) {
                    resolve({ skipped: true, reason: 'duplicate' });
                    return;
                }
                cursor.continue();
            } else {
                const addRequest = store.add(queueItem);
                addRequest.onsuccess = () => resolve({ id: addRequest.result as number });
                addRequest.onerror = () => reject(addRequest.error);
            }
        };
    });
}

/**
 * Get all pending requests
 */
export async function getPendingRequests(): Promise<QueueItem[]> {
    if (!db) await initOfflineQueue();

    return new Promise((resolve, reject) => {
        const tx = db!.transaction(QUEUE_STORE, 'readonly');
        const store = tx.objectStore(QUEUE_STORE);
        const index = store.index('status');
        const request = index.getAll(IDBKeyRange.only('pending'));

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Update request status
 */
export async function updateRequestStatus(
    id: number,
    status: QueueItemStatus,
    error: string | null = null
): Promise<QueueItem> {
    if (!db) await initOfflineQueue();

    return new Promise((resolve, reject) => {
        const tx = db!.transaction(QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const item = getRequest.result as QueueItem | undefined;
            if (item) {
                item.status = status;
                item.lastError = error;
                item.retryCount = (item.retryCount || 0) + (status === 'pending' ? 1 : 0);
                item.updatedAt = new Date().toISOString();

                const putRequest = store.put(item);
                putRequest.onsuccess = () => resolve(item);
                putRequest.onerror = () => reject(putRequest.error);
            } else {
                reject(new Error('Request not found'));
            }
        };
    });
}

/**
 * Remove completed request
 */
export async function removeRequest(id: number): Promise<void> {
    if (!db) await initOfflineQueue();

    return new Promise((resolve, reject) => {
        const tx = db!.transaction(QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Process all pending requests when back online
 */
export async function processPendingRequests(
    onProgress?: (results: ProcessResults) => void
): Promise<ProcessResults> {
    const pending = await getPendingRequests();
    const results: ProcessResults = { success: 0, failed: 0, skipped: 0 };

    for (const item of pending) {
        // Skip if too many retries
        if (item.retryCount >= 3) {
            await updateRequestStatus(item.id!, 'failed', 'Max retries exceeded');
            results.skipped++;
            continue;
        }

        try {
            const response = await fetch(item.url, {
                method: item.method,
                headers: {
                    ...item.headers,
                    'X-Idempotency-Key': item.idempotencyKey,
                },
                body: item.body,
            });

            if (response.ok) {
                await removeRequest(item.id!);
                results.success++;
            } else {
                const errorText = await response.text();
                await updateRequestStatus(item.id!, 'pending', `HTTP ${response.status}: ${errorText}`);
                results.failed++;
            }
        } catch (error) {
            await updateRequestStatus(item.id!, 'pending', (error as Error).message);
            results.failed++;
        }

        if (onProgress) {
            onProgress(results);
        }
    }

    return results;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<QueueStats> {
    if (!db) await initOfflineQueue();

    return new Promise((resolve, reject) => {
        const tx = db!.transaction(QUEUE_STORE, 'readonly');
        const store = tx.objectStore(QUEUE_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
            const items = request.result as QueueItem[];
            resolve({
                total: items.length,
                pending: items.filter(i => i.status === 'pending').length,
                failed: items.filter(i => i.status === 'failed').length,
            });
        };
        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// Auto-sync when back online
// ==========================================

if (typeof window !== 'undefined') {
    window.addEventListener('online', async () => {
        console.log('[OfflineQueue] Back online, processing pending requests...');
        const results = await processPendingRequests();
        console.log('[OfflineQueue] Sync complete:', results);
    });
}
