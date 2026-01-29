/**
 * MaterialCalculator TypeScript Types
 *
 * 材料計算器相關的類型定義
 */

import type { ReactNode } from 'react';

// ==========================================
// Vendor Types
// ==========================================

export interface Vendor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  category?: string;
}

// ==========================================
// Tile Calculator Types
// ==========================================

export interface TileRow {
  id: number;
  name: string;
  area: string;
  unit: 'ping' | 'sqm';
  sizeIdx: number;
  method: string;
}

export interface TileRowResult extends TileRow {
  count: number;
  tileL: number;
  tileW: number;
}

export interface TileSize {
  label: string;
  l: number | null;
  w: number | null;
}

export interface TileMethod {
  label: string;
  value: string;
  wasteAdd?: number;
}

// ==========================================
// Grout (填縫劑) Types
// ==========================================

export interface GroutRow {
  id: number;
  name: string;
  area: string;
}

// ==========================================
// Adhesive (黏著劑) Types
// ==========================================

export interface AdhesiveRow {
  id: number;
  name: string;
  area: string;
  trowel: string;
}

// ==========================================
// Masonry (砌磚) Types
// ==========================================

export interface MasonryRow {
  id: number;
  name: string;
  area: string;
  brickType: string;
}

export interface BrickConfig {
  label: string;
  perSqm: number;
  mortar: number;
}

// ==========================================
// Finish (粉刷/油漆) Types
// ==========================================

export interface FinishRow {
  id: number;
  name: string;
  area: string;
  coats: number;
}

export interface PlasterRatio {
  label: string;
  cement: number;
  sand: number;
  thickness: number;
}

export interface PaintConfig {
  label: string;
  coverage: number;
  coats: number;
}

// ==========================================
// Structure (結構) Types
// ==========================================

export interface StructureComponent {
  id: number;
  type: 'slab' | 'beam' | 'column' | 'wall' | 'stair';
  name: string;
  dimensions: ComponentDimensions;
  rebar?: RebarConfig;
}

export interface ComponentDimensions {
  length?: number;
  width?: number;
  height?: number;
  thickness?: number;
  area?: number;
}

export interface RebarConfig {
  mainBar: string;
  stirrup?: string;
  spacing?: number;
  coverage?: number;
}

// ==========================================
// Calculation Result Types
// ==========================================

export interface CalculationResult {
  materialName: string;
  quantity: number;
  unit: string;
  withWastage?: number;
  wastagePercent?: number;
  estimatedCost?: number;
  notes?: string;
}

export interface MaterialRecord {
  id: string;
  timestamp: Date;
  calculatorType: 'tile' | 'masonry' | 'finish' | 'structure';
  subType?: string;
  results: CalculationResult[];
  totalCost?: number;
}

// ==========================================
// Shared Component Props
// ==========================================

export interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
}

export interface SelectOption {
  label: string;
  value?: string | number;
}

export interface WastageControlProps {
  wastage: number;
  setWastage: (value: number) => void;
  defaultValue: number;
  useCustom: boolean;
  setUseCustom: (value: boolean) => void;
}

export interface ResultDisplayProps {
  label: string;
  value: number | string;
  unit: string;
  wastageValue?: number;
  showWastage?: boolean;
  onAddRecord?: (record: Partial<CalculationResult>) => void;
  estimatedCost?: number;
  subType?: string;
}

export interface CostInputProps {
  label: string;
  quantity: number;
  unit: string;
  unitLabel?: string;
  vendors?: Vendor[];
  onChange: (cost: CostValue | null) => void;
  placeholder?: {
    price?: string;
    source?: string;
  };
}

export interface CostValue {
  unitPrice: number;
  source: string;
  totalCost: number;
}

export interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export interface RowActionsProps {
  onAdd: () => void;
  onRemove?: () => void;
  onClear?: () => void;
  canRemove?: boolean;
}

// ==========================================
// Calculator Component Props
// ==========================================

export interface TileCalculatorProps {
  onAddRecord?: (record: MaterialRecord) => void;
  vendors?: Vendor[];
}

export interface MasonryCalculatorProps {
  onAddRecord?: (record: MaterialRecord) => void;
  vendors?: Vendor[];
}

export interface FinishCalculatorProps {
  onAddRecord?: (record: MaterialRecord) => void;
  vendors?: Vendor[];
}

export interface StructureCalculatorProps {
  onAddRecord?: (record: MaterialRecord) => void;
  vendors?: Vendor[];
}

// ==========================================
// Building Type
// ==========================================

export interface BuildingType {
  label: string;
  code: string;
  floorHeight: number;
  loadFactor: number;
}

// ==========================================
// Regulation Reference
// ==========================================

export interface RegulationRef {
  title: string;
  code: string;
  articles?: string[];
  notes?: string[];
}

// ==========================================
// Utility Types
// ==========================================

export type CalculatorType =
  | 'tile'
  | 'grout'
  | 'adhesive'
  | 'masonry'
  | 'plaster'
  | 'paint'
  | 'structure';

export type UnitType = 'ping' | 'sqm' | 'piece' | 'kg' | 'bag' | 'm' | 'set';
