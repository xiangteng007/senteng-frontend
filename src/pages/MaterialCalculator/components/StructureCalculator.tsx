/**
 * StructureCalculator (TypeScript Wrapper)
 * 結構工程計算器 - TypeScript 類型包裝器
 * 
 * 採用包裝器模式：
 * - TypeScript 類型定義在此檔案
 * - 實際 JSX 實作在 StructureCalculatorImpl.jsx
 */
import React, { type FC } from 'react';
import type { Vendor, CostValue } from '../types';

// Re-export the JSX implementation with TypeScript types
// @ts-expect-error JSX implementation
import StructureCalculatorImpl from './StructureCalculatorImpl';

// TypeScript Interface Definitions
export interface ConcreteRow {
    id: number;
    name: string;
    length: string;
    width: string;
    height: string;
}

export interface RebarEstimate {
    wallType: number;
    wallArea: string;
    floorType: number;
    floorArea: string;
    stairType: number;
    stairArea: string;
}

export type CalcType = 'concrete' | 'rebar' | 'formwork' | 'component';
export type RebarMode = 'exact' | 'estimate';
export type FormworkMode = 'estimate' | 'structure';
export type StructureType = 'parapet' | 'beam' | 'column' | 'wall' | 'floor' | 'groundbeam' | 'foundation';

export interface StructureCalculatorProps {
    onAddRecord?: (
        category: string,
        subType: string,
        label: string,
        value: number,
        unit: string,
        wastageValue: number,
        cost: CostValue | null
    ) => void;
    vendors?: Vendor[];
    rebarSpecs?: Array<{ label: string; weight: number }>;
}

/**
 * StructureCalculator Component
 * 
 * 結構工程計算器，支援：
 * - 混凝土體積計算 (多列輸入)
 * - 鋼筋重量計算 (精確/概估模式)
 * - 模板面積計算 (估算/結構模式)
 * - 構件計算 (女兒牆/樑/柱/牆/樓板/地梁/基礎)
 */
const StructureCalculator: FC<StructureCalculatorProps> = (props) => {
    return <StructureCalculatorImpl {...props} />;
};

export default StructureCalculator;
