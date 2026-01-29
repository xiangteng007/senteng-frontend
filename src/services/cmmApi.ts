/**
 * cmmApi.ts
 *
 * CMM API Service - 營建物料估算系統 - TypeScript 版本
 * 連接 senteng-erp-api /v2/cmm 端點
 */

// ==========================================
// Configuration
// ==========================================

const API_BASE =
    import.meta.env.VITE_API_URL || 'https://erp-api-381507943724.asia-east1.run.app';
const CMM_BASE = `${API_BASE}/v2/cmm`;

// ==========================================
// Types
// ==========================================

export interface CMMMaterial {
    id: string;
    name: string;
    category: string;
    unit: string;
    unitPrice: number;
    description?: string;
    specifications?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
}

export interface CMMProfile {
    code: string;
    name: string;
    description?: string;
    parameters: Record<string, number>;
}

export interface CMMTaxonomyL1 {
    code: string;
    name: string;
    children: CMMTaxonomyL2[];
}

export interface CMMTaxonomyL2 {
    code: string;
    name: string;
    children: CMMTaxonomyL3[];
}

export interface CMMTaxonomyL3 {
    code: string;
    name: string;
}

export interface CMMCalculateRequest {
    buildingType: string;
    floorArea: number;
    floorCount: number;
    structureType?: 'RC' | 'SC' | 'SRC' | 'RB';
    wastagePercent?: number;
}

export interface CMMCalculateResult {
    id?: string;
    buildingType: string;
    floorArea: number;
    floorCount: number;
    materials: Array<{
        materialId: string;
        name: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
    }>;
    totalCost: number;
    calculatedAt: string;
}

export interface CMMRunRequest {
    categoryL1: string;
    ruleSetVersion: string;
    workItems: Array<{
        code: string;
        quantity: number;
        parameters?: Record<string, number>;
    }>;
}

export interface CMMRun {
    id: string;
    categoryL1: string;
    ruleSetVersion: string;
    results: CMMCalculateResult;
    createdAt: string;
}

export interface CMMRuleset {
    version: string;
    name: string;
    description?: string;
    rules: Record<string, unknown>;
}

export interface PaginatedQuery {
    page?: number;
    limit?: number;
}

export interface MaterialQuery extends PaginatedQuery {
    category?: string;
    search?: string;
}

export interface RunsQuery extends PaginatedQuery {
    categoryL1?: string;
}

export interface ConvertResult {
    from: string;
    to: string;
    originalValue: number;
    convertedValue: number;
}

// ==========================================
// Request Helper
// ==========================================

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    // 處理 204 No Content
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

// ==========================================
// CMM Materials API
// ==========================================

export const cmmMaterialsApi = {
    async getAll(query: MaterialQuery = {}): Promise<CMMMaterial[]> {
        const params = new URLSearchParams();
        if (query.category) params.append('category', query.category);
        if (query.search) params.append('search', query.search);
        if (query.page) params.append('page', query.page.toString());
        if (query.limit) params.append('limit', query.limit.toString());

        const url = `${CMM_BASE}/materials${params.toString() ? '?' + params.toString() : ''}`;
        return request<CMMMaterial[]>(url);
    },

    async getById(id: string): Promise<CMMMaterial> {
        return request<CMMMaterial>(`${CMM_BASE}/materials/${id}`);
    },

    async create(data: Partial<CMMMaterial>): Promise<CMMMaterial> {
        return request<CMMMaterial>(`${CMM_BASE}/materials`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id: string, data: Partial<CMMMaterial>): Promise<CMMMaterial> {
        return request<CMMMaterial>(`${CMM_BASE}/materials/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id: string): Promise<void> {
        return request<void>(`${CMM_BASE}/materials/${id}`, {
            method: 'DELETE',
        });
    },

    async convert(id: string, from: string, to: string, value: number): Promise<ConvertResult> {
        const params = new URLSearchParams({ from, to, value: value.toString() });
        return request<ConvertResult>(`${CMM_BASE}/materials/${id}/convert?${params.toString()}`);
    },
};

// ==========================================
// CMM Building Profiles API
// ==========================================

export const cmmProfilesApi = {
    async getAll(): Promise<CMMProfile[]> {
        return request<CMMProfile[]>(`${CMM_BASE}/profiles`);
    },

    async getByCode(code: string): Promise<CMMProfile> {
        return request<CMMProfile>(`${CMM_BASE}/profiles/${code}`);
    },
};

// ==========================================
// CMM Calculation API
// ==========================================

export const cmmCalculateApi = {
    async calculate(data: CMMCalculateRequest): Promise<CMMCalculateResult> {
        return request<CMMCalculateResult>(`${CMM_BASE}/calculate`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async calculateAndSave(data: CMMCalculateRequest): Promise<CMMCalculateResult> {
        return request<CMMCalculateResult>(`${CMM_BASE}/calculate/save`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// ==========================================
// CMM Taxonomy API
// ==========================================

export const cmmTaxonomyApi = {
    async getAll(): Promise<CMMTaxonomyL1[]> {
        return request<CMMTaxonomyL1[]>(`${CMM_BASE}/taxonomy`);
    },

    async getByL1(l1Code: string): Promise<CMMTaxonomyL1> {
        return request<CMMTaxonomyL1>(`${CMM_BASE}/taxonomy/${l1Code}`);
    },
};

// ==========================================
// CMM Calculation Runs API
// ==========================================

export const cmmRunsApi = {
    async execute(data: CMMRunRequest): Promise<CMMRun> {
        return request<CMMRun>(`${CMM_BASE}/runs`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async getHistory(query: RunsQuery = {}): Promise<CMMRun[]> {
        const params = new URLSearchParams();
        if (query.categoryL1) params.append('categoryL1', query.categoryL1);
        if (query.page) params.append('page', query.page.toString());
        if (query.limit) params.append('limit', query.limit.toString());

        const url = `${CMM_BASE}/runs${params.toString() ? '?' + params.toString() : ''}`;
        return request<CMMRun[]>(url);
    },

    async getById(runId: string): Promise<CMMRun> {
        return request<CMMRun>(`${CMM_BASE}/runs/${runId}`);
    },
};

// ==========================================
// CMM Rulesets API
// ==========================================

export const cmmRulesetsApi = {
    async getAll(): Promise<CMMRuleset[]> {
        return request<CMMRuleset[]>(`${CMM_BASE}/rulesets`);
    },

    async getCurrent(): Promise<CMMRuleset> {
        return request<CMMRuleset>(`${CMM_BASE}/rulesets/current`);
    },
};

// ==========================================
// Combined Export
// ==========================================

export const cmmApi = {
    materials: cmmMaterialsApi,
    profiles: cmmProfilesApi,
    calculate: cmmCalculateApi,
    taxonomy: cmmTaxonomyApi,
    runs: cmmRunsApi,
    rulesets: cmmRulesetsApi,
};

export default cmmApi;
