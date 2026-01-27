/**
 * useCmmData Hook
 * 
 * 從 CMM API 獲取建築參數和物料數據
 * 若 API 不可用則 fallback 到硬編碼常量
 */

import { useState, useEffect } from 'react';
import { cmmProfilesApi, cmmMaterialsApi } from '../services/cmmApi';

// Fallback 常量 - 與原 MaterialCalculator.jsx 相同
const FALLBACK_BUILDING_TYPES = [
    { label: '多層砌體住宅', rebar: 30, concrete: 0.315, formwork: 2.0, sand: 0.5, structure: 'RC', wallThickness: 20 },
    { label: '多層框架結構', rebar: 40, concrete: 0.34, formwork: 2.2, sand: 0.55, structure: 'RC', wallThickness: 20 },
    { label: '小高層 (11-12F)', rebar: 51, concrete: 0.35, formwork: 2.3, sand: 0.6, structure: 'RC', wallThickness: 20 },
    { label: '高層 (17-18F)', rebar: 57, concrete: 0.36, formwork: 2.4, sand: 0.65, structure: 'RC', wallThickness: 25 },
    { label: '高層 (30F)', rebar: 70, concrete: 0.445, formwork: 2.6, sand: 0.75, structure: 'RC', wallThickness: 30 },
    { label: '別墅', rebar: 40, concrete: 0.33, formwork: 2.0, sand: 0.5, structure: 'RC', wallThickness: 18 },
    { label: '公寓 (5-6F)', rebar: 38, concrete: 0.32, formwork: 2.1, sand: 0.52, structure: 'RC', wallThickness: 18 },
    { label: '辦公大樓', rebar: 55, concrete: 0.38, formwork: 2.5, sand: 0.68, structure: 'RC/SRC', wallThickness: 25 },
    { label: 'RC透天 (2-3F)', rebar: 35, concrete: 0.28, formwork: 1.8, sand: 0.48, structure: 'RC', wallThickness: 15 },
    { label: 'RC透天 (4-5F)', rebar: 42, concrete: 0.32, formwork: 2.0, sand: 0.52, structure: 'RC', wallThickness: 18 },
    { label: '工業廠房', rebar: 25, concrete: 0.25, formwork: 1.5, sand: 0.4, structure: 'SC', wallThickness: 15 },
    { label: '地下室 (1層)', rebar: 80, concrete: 0.5, formwork: 3.0, sand: 0.85, structure: 'RC', wallThickness: 30 },
    { label: '透天厝 (3F)', rebar: 18, concrete: 0.18, formwork: 1.2, sand: 0.65, structure: 'RB', wallThickness: 24 },
    { label: '農舍/倉庫', rebar: 15, concrete: 0.15, formwork: 1.0, sand: 0.6, structure: 'RB', wallThickness: 24 },
    { label: '加強磚造公寓', rebar: 20, concrete: 0.20, formwork: 1.4, sand: 0.7, structure: 'RB', wallThickness: 24 },
];

const FALLBACK_REBAR_SPECS = [
    { label: '#3 D10 (9.53mm)', d: 9.53, weight: 0.56 },
    { label: '#4 D13 (12.7mm)', d: 12.7, weight: 0.99 },
    { label: '#5 D16 (15.9mm)', d: 15.9, weight: 1.56 },
    { label: '#6 D19 (19.1mm)', d: 19.1, weight: 2.25 },
    { label: '#7 D22 (22.2mm)', d: 22.2, weight: 3.04 },
    { label: '#8 D25 (25.4mm)', d: 25.4, weight: 3.98 },
    { label: '#9 D29 (28.7mm)', d: 28.7, weight: 5.08 },
    { label: '#10 D32 (32.2mm)', d: 32.2, weight: 6.39 },
];

/**
 * 轉換 API 回傳的 profile 為組件格式
 */
function mapProfileToType(profile) {
    return {
        code: profile.code,
        label: profile.label,
        rebar: profile.rebarFactor,
        concrete: profile.concreteFactor,
        formwork: profile.formworkFactor,
        sand: profile.sandFactor || 0.5,
        structure: profile.structureType,
        wallThickness: profile.defaultWallThickness || 20,
        description: profile.description,
    };
}

/**
 * useCmmData Hook
 * 
 * @returns {Object} { buildingTypes, rebarSpecs, materials, loading, error, refresh }
 */
export function useCmmData() {
    const [buildingTypes, setBuildingTypes] = useState(FALLBACK_BUILDING_TYPES);
    const [rebarSpecs, setRebarSpecs] = useState(FALLBACK_REBAR_SPECS);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiAvailable, setApiAvailable] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            // 嘗試獲取建築參數
            const profiles = await cmmProfilesApi.getAll();
            if (profiles && profiles.length > 0) {
                const mapped = profiles.map(mapProfileToType);
                setBuildingTypes(mapped);
                setApiAvailable(true);
            }
        } catch (err) {
            console.warn('CMM API 不可用，使用 fallback 數據:', err.message);
            setBuildingTypes(FALLBACK_BUILDING_TYPES);
            setApiAvailable(false);
        }

        try {
            // 嘗試獲取物料列表
            const materialsData = await cmmMaterialsApi.getAll();
            if (materialsData && materialsData.data) {
                setMaterials(materialsData.data);
            }
        } catch (err) {
            // 物料非必要，忽略錯誤
            console.warn('無法獲取物料數據:', err.message);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        buildingTypes,
        rebarSpecs,
        materials,
        loading,
        error,
        apiAvailable,
        refresh: fetchData,
    };
}

/**
 * useCmmCalculate Hook
 * 
 * 執行物料計算
 */
export function useCmmCalculate() {
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const calculate = async (params) => {
        setCalculating(true);
        setError(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3030'}/v2/cmm/calculate`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(params),
                }
            );

            if (!response.ok) {
                throw new Error(`計算失敗: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
            return data;
        } catch (err) {
            setError(err.message);
            console.warn('CMM 計算 API 失敗:', err.message);
            return null;
        } finally {
            setCalculating(false);
        }
    };

    return {
        calculate,
        calculating,
        result,
        error,
        clear: () => setResult(null),
    };
}

/**
 * useCmmTaxonomy Hook
 * 
 * 從 Taxonomy API 獲取分類體系
 */
export function useCmmTaxonomy(l1Code = null) {
    const [taxonomy, setTaxonomy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTaxonomy = async () => {
        setLoading(true);
        setError(null);

        try {
            // 動態引入避免循環依賴
            const { cmmTaxonomyApi } = await import('../services/cmmApi');

            if (l1Code) {
                const data = await cmmTaxonomyApi.getByL1(l1Code);
                setTaxonomy(data);
            } else {
                const data = await cmmTaxonomyApi.getAll();
                setTaxonomy(data);
            }
        } catch (err) {
            console.warn('CMM Taxonomy API 失敗:', err.message);
            setError(err.message);
            // Fallback 空數據
            setTaxonomy([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxonomy();
    }, [l1Code]);

    return {
        taxonomy,
        loading,
        error,
        refresh: fetchTaxonomy,
    };
}

/**
 * useCmmRuns Hook
 * 
 * 計算歷史記錄
 */
export function useCmmRuns(query = {}) {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRuns = async () => {
        setLoading(true);
        setError(null);

        try {
            const { cmmRunsApi } = await import('../services/cmmApi');
            const data = await cmmRunsApi.getHistory(query);
            setRuns(data?.data || data || []);
        } catch (err) {
            console.warn('CMM Runs API 失敗:', err.message);
            setError(err.message);
            setRuns([]);
        } finally {
            setLoading(false);
        }
    };

    const executeRun = async (runData) => {
        try {
            const { cmmRunsApi } = await import('../services/cmmApi');
            const result = await cmmRunsApi.execute(runData);
            // 執行後刷新列表
            await fetchRuns();
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    useEffect(() => {
        fetchRuns();
    }, [query.categoryL1, query.page, query.limit]);

    return {
        runs,
        loading,
        error,
        refresh: fetchRuns,
        executeRun,
    };
}

export default useCmmData;

