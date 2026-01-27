/**
 * CMM API Service - 營建物料估算系統
 * 
 * 連接 senteng-erp-api /v2/cmm 端點
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://erp-api-381507943724.asia-east1.run.app';
const CMM_BASE = `${API_BASE}/v2/cmm`;

/**
 * 通用請求處理
 */
async function request(url, options = {}) {
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
        return null;
    }

    return response.json();
}

/**
 * CMM Materials API
 * 物料主檔管理
 */
export const cmmMaterialsApi = {
    /**
     * 取得物料清單
     * @param {Object} query - 查詢參數 { category?, search?, page?, limit? }
     */
    async getAll(query = {}) {
        const params = new URLSearchParams();
        if (query.category) params.append('category', query.category);
        if (query.search) params.append('search', query.search);
        if (query.page) params.append('page', query.page.toString());
        if (query.limit) params.append('limit', query.limit.toString());

        const url = `${CMM_BASE}/materials${params.toString() ? '?' + params.toString() : ''}`;
        return request(url);
    },

    /**
     * 取得單一物料
     * @param {string} id - 物料 UUID
     */
    async getById(id) {
        return request(`${CMM_BASE}/materials/${id}`);
    },

    /**
     * 新增物料
     * @param {Object} data - 物料資料
     */
    async create(data) {
        return request(`${CMM_BASE}/materials`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * 更新物料
     * @param {string} id - 物料 UUID
     * @param {Object} data - 更新資料
     */
    async update(id, data) {
        return request(`${CMM_BASE}/materials/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * 刪除物料
     * @param {string} id - 物料 UUID
     */
    async delete(id) {
        return request(`${CMM_BASE}/materials/${id}`, {
            method: 'DELETE',
        });
    },

    /**
     * 單位換算
     * @param {string} id - 物料 UUID
     * @param {string} from - 來源單位
     * @param {string} to - 目標單位
     * @param {number} value - 數值
     */
    async convert(id, from, to, value) {
        const params = new URLSearchParams({ from, to, value: value.toString() });
        return request(`${CMM_BASE}/materials/${id}/convert?${params.toString()}`);
    },
};

/**
 * CMM Building Profiles API
 * 建築參數設定
 */
export const cmmProfilesApi = {
    /**
     * 取得所有建築參數
     */
    async getAll() {
        return request(`${CMM_BASE}/profiles`);
    },

    /**
     * 取得單一建築參數
     * @param {string} code - 參數代碼
     */
    async getByCode(code) {
        return request(`${CMM_BASE}/profiles/${code}`);
    },
};

/**
 * CMM Calculation API
 * 物料計算引擎
 */
export const cmmCalculateApi = {
    /**
     * 執行計算（不儲存）
     * @param {Object} data - 計算請求
     * @param {string} data.buildingType - 建築類型代碼
     * @param {number} data.floorArea - 樓地板面積 (m²)
     * @param {number} data.floorCount - 樓層數
     * @param {string} [data.structureType] - 結構類型 (RC/SC/SRC/RB)
     * @param {number} [data.wastagePercent] - 損耗率 %
     */
    async calculate(data) {
        return request(`${CMM_BASE}/calculate`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * 執行計算並儲存
     * @param {Object} data - 計算請求
     */
    async calculateAndSave(data) {
        return request(`${CMM_BASE}/calculate/save`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

/**
 * CMM Taxonomy API
 * 物料分類體系
 */
export const cmmTaxonomyApi = {
    /**
     * 取得完整分類體系
     */
    async getAll() {
        return request(`${CMM_BASE}/taxonomy`);
    },

    /**
     * 取得指定 L1 分類的子分類
     * @param {string} l1Code - L1 分類代碼 (e.g., 'CON', 'INT')
     */
    async getByL1(l1Code) {
        return request(`${CMM_BASE}/taxonomy/${l1Code}`);
    },
};

/**
 * CMM Calculation Runs API
 * 計算執行記錄
 */
export const cmmRunsApi = {
    /**
     * 執行計算 (新 API)
     * @param {Object} data - 計算請求
     * @param {string} data.categoryL1 - L1 分類代碼
     * @param {string} data.ruleSetVersion - 規則集版本
     * @param {Array} data.workItems - 工項列表
     */
    async execute(data) {
        return request(`${CMM_BASE}/runs`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * 取得計算歷史
     * @param {Object} query - 查詢參數 { categoryL1?, page?, limit? }
     */
    async getHistory(query = {}) {
        const params = new URLSearchParams();
        if (query.categoryL1) params.append('categoryL1', query.categoryL1);
        if (query.page) params.append('page', query.page.toString());
        if (query.limit) params.append('limit', query.limit.toString());

        const url = `${CMM_BASE}/runs${params.toString() ? '?' + params.toString() : ''}`;
        return request(url);
    },

    /**
     * 取得特定計算結果
     * @param {string} runId - 計算 Run UUID
     */
    async getById(runId) {
        return request(`${CMM_BASE}/runs/${runId}`);
    },
};

/**
 * CMM Rulesets API
 * 規則集管理
 */
export const cmmRulesetsApi = {
    /**
     * 取得所有規則集
     */
    async getAll() {
        return request(`${CMM_BASE}/rulesets`);
    },

    /**
     * 取得當前規則集
     */
    async getCurrent() {
        return request(`${CMM_BASE}/rulesets/current`);
    },
};

/**
 * 合併匯出
 */
export const cmmApi = {
    materials: cmmMaterialsApi,
    profiles: cmmProfilesApi,
    calculate: cmmCalculateApi,
    taxonomy: cmmTaxonomyApi,
    runs: cmmRunsApi,
    rulesets: cmmRulesetsApi,
};

export default cmmApi;

