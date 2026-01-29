/**
 * API Configuration - 統一 API 版本與路由配置
 *
 * 所有 API URL 定義的單一真相來源
 * 更換 API 版本或主機只需修改此檔案
 */

// ==========================================
// Core Configuration
// ==========================================

/** 後端 API 版本 */
export const API_VERSION = 'v1';

/** 基礎 URL (不含路徑) */
export const API_HOST =
    import.meta.env.VITE_API_URL || 'https://erp-api-381507943724.asia-east1.run.app';

/** 完整 API 基礎路徑 */
export const API_BASE_URL = `${API_HOST}/api/${API_VERSION}`;

// ==========================================
// WebSocket Configuration
// ==========================================

/** WebSocket 端點 */
export const WS_URL = API_HOST.replace('https://', 'wss://').replace('http://', 'ws://');

// ==========================================
// Module Endpoints
// ==========================================

export const API_ENDPOINTS = {
    // 核心業務
    projects: `${API_BASE_URL}/projects`,
    clients: `${API_BASE_URL}/clients`,
    vendors: `${API_BASE_URL}/vendors`,
    contracts: `${API_BASE_URL}/contracts`,
    quotations: `${API_BASE_URL}/quotations`,
    changeOrders: `${API_BASE_URL}/change-orders`,
    costEntries: `${API_BASE_URL}/cost-entries`,

    // CMM 材料估算
    cmm: `${API_BASE_URL}/cmm`,
    cmmProfiles: `${API_BASE_URL}/cmm/profiles`,
    cmmMaterials: `${API_BASE_URL}/cmm/materials`,
    cmmCalculate: `${API_BASE_URL}/cmm/calculate`,
    cmmTaxonomy: `${API_BASE_URL}/cmm/taxonomy`,
    cmmRuns: `${API_BASE_URL}/cmm/runs`,
    cmmRulesets: `${API_BASE_URL}/cmm/rulesets`,

    // 財務
    finance: `${API_BASE_URL}/finance`,
    payments: `${API_BASE_URL}/payments`,
    invoices: `${API_BASE_URL}/invoices`,

    // 庫存/採購
    inventory: `${API_BASE_URL}/inventory`,
    procurements: `${API_BASE_URL}/procurements`,

    // 行事曆/事件
    events: `${API_BASE_URL}/events`,

    // 工地/日誌
    sites: `${API_BASE_URL}/sites`,
    siteLogs: `${API_BASE_URL}/site-logs`,

    // 整合
    integrations: `${API_BASE_URL}/integrations`,

    // 使用者/權限
    auth: `${API_BASE_URL}/auth`,
    users: `${API_BASE_URL}/users`,
    permissions: `${API_BASE_URL}/permissions`,

    // 報表
    reports: `${API_BASE_URL}/reports`,
    profitAnalysis: `${API_BASE_URL}/profit-analysis`,

    // 儲存
    storage: `${API_BASE_URL}/storage`,
} as const;

// Type for endpoint keys
export type ApiEndpointKey = keyof typeof API_ENDPOINTS;
