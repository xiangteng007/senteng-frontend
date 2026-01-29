/**
 * useCmmData.ts
 *
 * 從 CMM API 獲取建築參數和物料數據
 * 若 API 不可用則 fallback 到硬編碼常量
 */

import { useState, useEffect } from 'react';
import { cmmProfilesApi, cmmMaterialsApi } from '../services/cmmApi';

// ==========================================
// Types
// ==========================================

export interface BuildingType {
    code?: string;
    label: string;
    rebar: number;
    concrete: number;
    formwork: number;
    sand: number;
    structure: string;
    wallThickness: number;
    description?: string;
}

export interface RebarSpec {
    label: string;
    d: number;
    weight: number;
}

export interface CmmMaterial {
    id: string;
    name: string;
    category?: string;
    unit?: string;
    [key: string]: unknown;
}

export interface CmmProfile {
    code: string;
    label: string;
    rebarFactor: number;
    concreteFactor: number;
    formworkFactor: number;
    sandFactor?: number;
    structureType: string;
    defaultWallThickness?: number;
    description?: string;
}

export interface UseCmmDataResult {
    buildingTypes: BuildingType[];
    rebarSpecs: RebarSpec[];
    materials: CmmMaterial[];
    loading: boolean;
    error: string | null;
    apiAvailable: boolean;
    refresh: () => Promise<void>;
}

export interface UseCmmCalculateResult {
    calculate: (params: unknown) => Promise<unknown>;
    calculating: boolean;
    result: unknown;
    error: string | null;
    clear: () => void;
}

export interface UseCmmTaxonomyResult {
    taxonomy: unknown[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export interface UseCmmRunsResult {
    runs: unknown[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    executeRun: (runData: unknown) => Promise<unknown>;
}

// ==========================================
// Fallback Constants
// ==========================================

const FALLBACK_BUILDING_TYPES: BuildingType[] = [
    { label: 'RC透天 (2-3F)', rebar: 100, concrete: 0.73, formwork: 3.0, sand: 0.18, structure: 'RC', wallThickness: 15 },
    { label: 'RC透天 (4-5F)', rebar: 112, concrete: 0.79, formwork: 3.2, sand: 0.2, structure: 'RC', wallThickness: 18 },
    { label: '別墅 (RC)', rebar: 106, concrete: 0.76, formwork: 3.0, sand: 0.18, structure: 'RC', wallThickness: 18 },
    { label: '公寓 (5-6F)', rebar: 109, concrete: 0.79, formwork: 3.3, sand: 0.2, structure: 'RC', wallThickness: 18 },
    { label: '大樓 (7-12F)', rebar: 112, concrete: 0.82, formwork: 3.4, sand: 0.22, structure: 'RC', wallThickness: 20 },
    { label: '高層 (13-20F)', rebar: 115, concrete: 0.85, formwork: 3.5, sand: 0.24, structure: 'RC', wallThickness: 25 },
    { label: '高層 (21-30F)', rebar: 121, concrete: 0.91, formwork: 3.6, sand: 0.26, structure: 'RC', wallThickness: 30 },
    { label: '超高層 (30F+)', rebar: 130, concrete: 0.95, formwork: 3.8, sand: 0.28, structure: 'SRC', wallThickness: 35 },
    { label: '辦公大樓', rebar: 115, concrete: 0.85, formwork: 3.5, sand: 0.24, structure: 'RC/SRC', wallThickness: 25 },
    { label: '工業廠房 (SC)', rebar: 45, concrete: 0.35, formwork: 2.0, sand: 0.12, structure: 'SC', wallThickness: 15 },
    { label: '地下室 (每層)', rebar: 145, concrete: 1.1, formwork: 4.0, sand: 0.3, structure: 'RC', wallThickness: 30 },
    { label: '透天厝 (RB 3F)', rebar: 55, concrete: 0.45, formwork: 2.2, sand: 0.25, structure: 'RB', wallThickness: 24 },
    { label: '農舍/倉庫 (RB)', rebar: 45, concrete: 0.38, formwork: 1.8, sand: 0.22, structure: 'RB', wallThickness: 24 },
];

const FALLBACK_REBAR_SPECS: RebarSpec[] = [
    { label: '#3 D10 (9.53mm)', d: 9.53, weight: 0.56 },
    { label: '#4 D13 (12.7mm)', d: 12.7, weight: 0.99 },
    { label: '#5 D16 (15.9mm)', d: 15.9, weight: 1.56 },
    { label: '#6 D19 (19.1mm)', d: 19.1, weight: 2.25 },
    { label: '#7 D22 (22.2mm)', d: 22.2, weight: 3.04 },
    { label: '#8 D25 (25.4mm)', d: 25.4, weight: 3.98 },
    { label: '#9 D29 (28.7mm)', d: 28.7, weight: 5.08 },
    { label: '#10 D32 (32.2mm)', d: 32.2, weight: 6.39 },
];

function mapProfileToType(profile: CmmProfile): BuildingType {
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

// ==========================================
// Hooks
// ==========================================

export function useCmmData(): UseCmmDataResult {
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>(FALLBACK_BUILDING_TYPES);
    const [rebarSpecs] = useState<RebarSpec[]>(FALLBACK_REBAR_SPECS);
    const [materials, setMaterials] = useState<CmmMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [apiAvailable, setApiAvailable] = useState(false);

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const profiles = await cmmProfilesApi.getAll() as CmmProfile[];
            if (profiles && profiles.length > 0) {
                const mapped = profiles.map(mapProfileToType);
                setBuildingTypes(mapped);
                setApiAvailable(true);
            }
        } catch (err) {
            const e = err as Error;
            console.warn('CMM API 不可用，使用 fallback 數據:', e.message);
            setBuildingTypes(FALLBACK_BUILDING_TYPES);
            setApiAvailable(false);
        }

        try {
            const materialsData = await cmmMaterialsApi.getAll() as { data?: CmmMaterial[] };
            if (materialsData?.data) {
                setMaterials(materialsData.data);
            }
        } catch (err) {
            const e = err as Error;
            console.warn('無法獲取物料數據:', e.message);
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

export function useCmmCalculate(): UseCmmCalculateResult {
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);

    const calculate = async (params: unknown): Promise<unknown> => {
        setCalculating(true);
        setError(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'https://erp-api-381507943724.asia-east1.run.app'}/v2/cmm/calculate`,
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
            const e = err as Error;
            setError(e.message);
            console.warn('CMM 計算 API 失敗:', e.message);
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

export function useCmmTaxonomy(l1Code: string | null = null): UseCmmTaxonomyResult {
    const [taxonomy, setTaxonomy] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTaxonomy = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const { cmmTaxonomyApi } = await import('../services/cmmApi');

            if (l1Code) {
                const data = await cmmTaxonomyApi.getByL1(l1Code);
                setTaxonomy(data as unknown[]);
            } else {
                const data = await cmmTaxonomyApi.getAll();
                setTaxonomy(data as unknown[]);
            }
        } catch (err) {
            const e = err as Error;
            console.warn('CMM Taxonomy API 失敗:', e.message);
            setError(e.message);
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

export interface CmmRunsQuery {
    categoryL1?: string;
    page?: number;
    limit?: number;
}

export function useCmmRuns(query: CmmRunsQuery = {}): UseCmmRunsResult {
    const [runs, setRuns] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRuns = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const { cmmRunsApi } = await import('../services/cmmApi');
            const data = await cmmRunsApi.getHistory(query) as { data?: unknown[] } | unknown[];
            setRuns((data as { data?: unknown[] })?.data || data as unknown[] || []);
        } catch (err) {
            const e = err as Error;
            console.warn('CMM Runs API 失敗:', e.message);
            setError(e.message);
            setRuns([]);
        } finally {
            setLoading(false);
        }
    };

    const executeRun = async (runData: unknown): Promise<unknown> => {
        try {
            const { cmmRunsApi } = await import('../services/cmmApi');
            const result = await cmmRunsApi.execute(runData);
            await fetchRuns();
            return result;
        } catch (err) {
            const e = err as Error;
            setError(e.message);
            return null;
        }
    };

    useEffect(() => {
        fetchRuns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
