/**
 * smartHomeApi.ts
 *
 * Smart Home API 封裝 - 產品瀏覽與報價匯出
 */

import { api } from './api';

// ==========================================
// Types
// ==========================================

export interface SmartHomeProduct {
    id: string;
    productId: string;
    name: string;
    nameCn?: string;
    category: string;
    subcategory?: string;
    brand: string;
    price?: number;
    originalPrice?: number;
    imageUrl?: string;
    productUrl?: string;
    specifications?: Record<string, string>;
    supportedPlatforms?: string[];
    isAvailable: boolean;
    lastSyncedAt?: string;
}

export interface SmartHomeQueryParams {
    search?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    page?: number;
    limit?: number;
}

export interface CategoryCount {
    category: string;
    count: number;
}

export interface SubcategoryCount {
    subcategory: string;
    count: number;
}

export interface SyncStatus {
    isSyncing: boolean;
    lastSync: string | null;
}

export interface SyncResult {
    success: boolean;
    newProducts: number;
    updatedProducts: number;
    errors: string[];
}

export interface ExportSmartHomeItem {
    productId: string;
    name: string;
    subcategory?: string;
    spec?: string;
    quantity: number;
    unitPrice: number;
}

export interface ExportSmartHomeOptions {
    title?: string;
    projectName?: string;
}

export interface ExportSmartHomeRequest {
    items: ExportSmartHomeItem[];
    options?: ExportSmartHomeOptions;
}

export interface ExportSmartHomeResponse {
    success: boolean;
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    message?: string;
}

// ==========================================
// Helper
// ==========================================

function buildQueryString(params?: Record<string, unknown>): string {
    if (!params) return '';
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            search.append(key, String(value));
        }
    });
    const query = search.toString();
    return query ? `?${query}` : '';
}

// ==========================================
// API Functions
// ==========================================

export const smartHomeApi = {
    // Products
    getProducts: (params?: SmartHomeQueryParams): Promise<SmartHomeProduct[]> =>
        api.get(`/api/v1/smart-home/products${buildQueryString(params)}`),

    getProduct: (id: string): Promise<SmartHomeProduct | null> =>
        api.get(`/api/v1/smart-home/products/${id}`),

    // Categories
    getCategories: (): Promise<CategoryCount[]> =>
        api.get('/api/v1/smart-home/categories'),

    getSubcategories: (category: string): Promise<SubcategoryCount[]> =>
        api.get(`/api/v1/smart-home/categories/${encodeURIComponent(category)}/subcategories`),

    // Sync
    getSyncStatus: (): Promise<SyncStatus> =>
        api.get('/api/v1/smart-home/sync/status'),

    triggerSync: (): Promise<SyncResult> =>
        api.post('/api/v1/smart-home/sync'),

    // Export
    exportToGoogleSheets: (request: ExportSmartHomeRequest): Promise<ExportSmartHomeResponse> =>
        api.post('/api/v1/smart-home/export', request),
};

export default smartHomeApi;
