/**
 * MasonryCalculator (TypeScript)
 * 從 MaterialCalculator.jsx 提取
 */
import React, { useState, type FC, type ChangeEvent } from 'react';
import { Info, Plus, Trash2 } from 'lucide-react';

import { DEFAULT_WASTAGE, BRICK_PER_SQM, PLASTER_RATIOS } from '../constants';
import {
  InputField,
  SelectField,
  WastageControl,
  ResultDisplay,
  CostInput,
} from './SharedComponents';
import type { Vendor, CostValue } from '../types';

// Row types
interface MortarRow {
  id: number;
  name: string;
  area: string;
  thickness: string;
}

interface MortarRowResult extends MortarRow {
  cement: number;
  sand: number;
}

interface BrickRow {
  id: number;
  name: string;
  area: string;
  wallType: string;
}

interface BrickRowResult extends BrickRow {
  count: number;
}

// 工具函數
const formatNumber = (num: number | null | undefined, decimals: number = 2): string => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return Number(num).toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

const applyWastage = (value: number, wastagePercent: number): number => {
  return value * (1 + wastagePercent / 100);
};

type CalcType = 'mortar' | 'plaster' | 'brick' | 'quick';

interface MasonryCalculatorProps {
  onAddRecord?: (
    subType: string,
    label: string,
    value: number,
    unit: string,
    wastageValue: number,
    cost?: CostValue | null
  ) => void;
  vendors?: Vendor[];
}

// 2️⃣ 泥作工程計算器 (支援多列輸入)
const MasonryCalculator: FC<MasonryCalculatorProps> = ({ onAddRecord, vendors = [] }) => {
  const [calcType, setCalcType] = useState<CalcType>('mortar');

  // 打底砂漿 - 多列支援
  const [mortarRows, setMortarRows] = useState<MortarRow[]>([
    { id: 1, name: '', area: '', thickness: '2.5' },
  ]);
  const [mortarWastage, setMortarWastage] = useState(DEFAULT_WASTAGE.cement);
  const [mortarCustomWastage, setMortarCustomWastage] = useState(false);
  const [mortarCost, setMortarCost] = useState<CostValue | null>(null);

  // 紅磚 - 多列支援
  const [brickRows, setBrickRows] = useState<BrickRow[]>([
    { id: 1, name: '', area: '', wallType: '24' },
  ]);
  const [brickWastage, setBrickWastage] = useState(DEFAULT_WASTAGE.brick);
  const [brickCustomWastage, setBrickCustomWastage] = useState(false);
  const [brickCost, setBrickCost] = useState<CostValue | null>(null);

  // 快速估算
  const [quickArea, setQuickArea] = useState('');

  // 粉光配比計算器
  const [plasterRatio, setPlasterRatio] = useState('1:3');
  const [plasterArea, setPlasterArea] = useState('');
  const [plasterThickness, setPlasterThickness] = useState('1.5');
  const [plasterCost, setPlasterCost] = useState<CostValue | null>(null);

  // 計算每列砂漿結果
  const mortarRowResults: MortarRowResult[] = mortarRows.map(row => {
    const thicknessRatio = parseFloat(row.thickness) / 2.5;
    const area = parseFloat(row.area) || 0;
    const cement = area * 10.6 * thicknessRatio;
    const sand = area * 42.8 * thicknessRatio;
    return { ...row, cement, sand };
  });

  // 總計砂漿
  const totalCement = mortarRowResults.reduce((sum, row) => sum + row.cement, 0);
  const totalSand = mortarRowResults.reduce((sum, row) => sum + row.sand, 0);
  const currentMortarWastage = mortarCustomWastage ? mortarWastage : DEFAULT_WASTAGE.cement;
  const totalCementWithWastage = applyWastage(totalCement, currentMortarWastage);
  const totalSandWithWastage = applyWastage(totalSand, currentMortarWastage);

  // 砂漿列操作
  const addMortarRow = (): void => {
    const newId = Math.max(...mortarRows.map(r => r.id), 0) + 1;
    setMortarRows([...mortarRows, { id: newId, name: '', area: '', thickness: '2.5' }]);
  };
  const removeMortarRow = (id: number): void => {
    if (mortarRows.length <= 1) return;
    setMortarRows(mortarRows.filter(row => row.id !== id));
  };
  const updateMortarRow = (id: number, field: keyof MortarRow, value: string): void => {
    setMortarRows(mortarRows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };
  const clearMortarRows = (): void => {
    setMortarRows([{ id: 1, name: '', area: '', thickness: '2.5' }]);
  };

  // 計算每列紅磚結果
  const brickRowResults: BrickRowResult[] = brickRows.map(row => {
    const area = parseFloat(row.area) || 0;
    const brickData = (BRICK_PER_SQM as Record<string, { count: number; label: string }>)[
      row.wallType
    ];
    const count = area * (brickData?.count || 128);
    return { ...row, count };
  });

  // 總計紅磚
  const totalBricks = brickRowResults.reduce((sum, row) => sum + row.count, 0);
  const currentBrickWastage = brickCustomWastage ? brickWastage : DEFAULT_WASTAGE.brick;
  const totalBricksWithWastage = applyWastage(totalBricks, currentBrickWastage);

  // 紅磚列操作
  const addBrickRow = (): void => {
    const newId = Math.max(...brickRows.map(r => r.id), 0) + 1;
    setBrickRows([...brickRows, { id: newId, name: '', area: '', wallType: '24' }]);
  };
  const removeBrickRow = (id: number): void => {
    if (brickRows.length <= 1) return;
    setBrickRows(brickRows.filter(row => row.id !== id));
  };
  const updateBrickRow = (id: number, field: keyof BrickRow, value: string): void => {
    setBrickRows(brickRows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };
  const clearBrickRows = (): void => {
    setBrickRows([{ id: 1, name: '', area: '', wallType: '24' }]);
  };

  // 快速估算
  const quickCement = (parseFloat(quickArea) || 0) * 0.4;
  const quickSand = (parseFloat(quickArea) || 0) * 0.05;

  // 粉光配比計算
  const selectedPlaster = (
    PLASTER_RATIOS as Record<string, { label: string; cementPerM3: number; sandPerM3: number }>
  )[plasterRatio];
  const plasterAreaNum = parseFloat(plasterArea) || 0;
  const plasterThicknessNum = parseFloat(plasterThickness) / 100; // cm to m
  const plasterVolume = plasterAreaNum * plasterThicknessNum; // m³
  const plasterCement = plasterVolume * (selectedPlaster?.cementPerM3 || 0);
  const plasterSand = plasterVolume * (selectedPlaster?.sandPerM3 || 0);

  const calcTypeButtons = [
    { id: 'mortar' as const, label: '打底砂漿' },
    { id: 'plaster' as const, label: '粉光配比' },
    { id: 'brick' as const, label: '紅磚用量' },
    { id: 'quick' as const, label: '快速估算' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {calcTypeButtons.map(item => (
          <button
            key={item.id}
            onClick={() => setCalcType(item.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${calcType === item.id ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 粉光配比計算器 */}
      {calcType === 'plaster' && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info size={16} />
            <div>
              <p>1:2 粉光: 水泥 650kg/m³ + 砂 800kg/m³ (細緻)</p>
              <p>1:3 打底: 水泥 450kg/m³ + 砂 950kg/m³ (一般)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectField
              label="配比選擇"
              value={plasterRatio}
              onChange={setPlasterRatio}
              options={Object.entries(PLASTER_RATIOS).map(([k, v]) => ({
                value: k,
                label: (v as { label: string }).label,
              }))}
            />
            <InputField
              label="施作面積"
              value={plasterArea}
              onChange={setPlasterArea}
              unit="m²"
              placeholder="0"
            />
            <InputField
              label="塗抹厚度"
              value={plasterThickness}
              onChange={setPlasterThickness}
              unit="cm"
              placeholder="1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ResultDisplay
              label="水泥用量"
              value={plasterCement}
              unit="kg"
              showWastage={false}
              onAddRecord={
                onAddRecord
                  ? (label, value, unit, wastageValue, subType) =>
                    onAddRecord(
                      subType || `粉光 ${plasterRatio}`,
                      label,
                      Number(value),
                      unit,
                      wastageValue || 0,
                      plasterCost
                    )
                  : undefined
              }
              subType={`粉光 ${plasterRatio}`}
            />
            <ResultDisplay
              label="砂用量"
              value={plasterSand}
              unit="kg"
              showWastage={false}
              onAddRecord={
                onAddRecord
                  ? (label, value, unit, wastageValue, subType) =>
                    onAddRecord(
                      subType || `粉光 ${plasterRatio}`,
                      label,
                      Number(value),
                      unit,
                      wastageValue || 0,
                      plasterCost
                    )
                  : undefined
              }
              subType={`粉光 ${plasterRatio}`}
            />
          </div>

          <CostInput
            label="水泥/砂"
            quantity={plasterCement + plasterSand}
            unit="kg"
            vendors={vendors.filter(
              v => v.category === '建材供應' || (v as any).tradeType?.includes('水泥')
            )}
            onChange={setPlasterCost}
            placeholder={{ spec: '例：水泥+砂' }}
          />
        </div>
      )}

      {/* 打底砂漿 - 多列模式 */}
      {calcType === 'mortar' && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info size={16} />
              公式: 1:3 砂漿, 基準: 2.5cm厚 → 水泥 10.6kg/m², 砂 42.8kg/m²
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{mortarRows.length} 列</span>
              <button
                onClick={() =>
                  mortarRows.length > 1 && removeMortarRow(mortarRows[mortarRows.length - 1].id)
                }
                disabled={mortarRows.length <= 1}
                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-lg font-bold leading-none">−</span>
              </button>
              <button
                onClick={addMortarRow}
                title="新增砂漿列"
                aria-label="新增砂漿列"
                className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
              >
                <Plus size={16} />
              </button>
              {mortarRows.length > 1 && (
                <button
                  onClick={clearMortarRows}
                  className="text-xs text-gray-500 hover:text-gray-700 ml-1"
                >
                  清空
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {mortarRows.map((row, index) => (
              <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 sm:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">名稱</label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMortarRow(row.id, 'name', e.target.value)
                      }
                      placeholder={`區域 ${index + 1}`}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">施作面積</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={row.area}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateMortarRow(row.id, 'area', e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        m²
                      </span>
                    </div>
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">厚度</label>
                    <select
                      value={row.thickness}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateMortarRow(row.id, 'thickness', e.target.value)
                      }
                      aria-label="砂漿厚度"
                      title="砂漿厚度"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="1.5">1.5cm</option>
                      <option value="2.0">2.0cm</option>
                      <option value="2.5">2.5cm</option>
                      <option value="3.0">3.0cm</option>
                      <option value="4.0">4.0cm</option>
                    </select>
                  </div>
                  <div className="col-span-10 sm:col-span-3 flex items-center gap-2">
                    <div className="flex-1 text-xs">
                      <span className="text-gray-500">水泥:</span>{' '}
                      <span className="font-bold text-orange-600">
                        {formatNumber(mortarRowResults[index].cement, 1)}kg
                      </span>
                      <span className="text-gray-500 ml-2">砂:</span>{' '}
                      <span className="font-bold text-orange-600">
                        {formatNumber(mortarRowResults[index].sand, 1)}kg
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeMortarRow(row.id)}
                      disabled={mortarRows.length <= 1}
                      title="刪除此列"
                      aria-label="刪除此列"
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addMortarRow}
            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            +增加新欄位
          </button>

          <WastageControl
            wastage={mortarWastage}
            setWastage={setMortarWastage}
            defaultValue={DEFAULT_WASTAGE.cement}
            useCustom={mortarCustomWastage}
            setUseCustom={setMortarCustomWastage}
          />

          <div className="grid grid-cols-2 gap-3">
            <ResultDisplay
              label={`水泥用量 (共 ${mortarRowResults.filter(r => r.cement > 0).length} 項)`}
              value={totalCement}
              unit="kg"
              wastageValue={totalCementWithWastage}
              onAddRecord={
                onAddRecord
                  ? (label, value, unit, wastageValue, subType) =>
                    onAddRecord(
                      subType || '打底砂漿',
                      label,
                      Number(value),
                      unit,
                      wastageValue || 0,
                      mortarCost
                    )
                  : undefined
              }
              subType="打底砂漿"
            />
            <ResultDisplay
              label={`砂用量 (共 ${mortarRowResults.filter(r => r.sand > 0).length} 項)`}
              value={totalSand}
              unit="kg"
              wastageValue={totalSandWithWastage}
              onAddRecord={
                onAddRecord
                  ? (label, value, unit, wastageValue, subType) =>
                    onAddRecord(
                      subType || '打底砂漿',
                      label,
                      Number(value),
                      unit,
                      wastageValue || 0,
                      mortarCost
                    )
                  : undefined
              }
              subType="打底砂漿"
            />
          </div>

          <CostInput
            label="水泥/砂"
            quantity={totalCementWithWastage + totalSandWithWastage}
            unit="kg"
            vendors={vendors.filter(
              v => v.category === '建材供應' || (v as any).tradeType?.includes('水泥')
            )}
            onChange={setMortarCost}
            placeholder={{ spec: '例：水泥+砂' }}
          />
        </div>
      )}

      {/* 紅磚用量 - 多列模式 */}
      {calcType === 'brick' && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info size={16} />
              12牆=64塊/m², 18牆=96塊/m², 24牆=128塊/m², 37牆=192塊/m²
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{brickRows.length} 列</span>
              <button
                onClick={() =>
                  brickRows.length > 1 && removeBrickRow(brickRows[brickRows.length - 1].id)
                }
                disabled={brickRows.length <= 1}
                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-lg font-bold leading-none">−</span>
              </button>
              <button
                onClick={addBrickRow}
                title="新增紅磚列"
                aria-label="新增紅磚列"
                className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
              >
                <Plus size={16} />
              </button>
              {brickRows.length > 1 && (
                <button
                  onClick={clearBrickRows}
                  className="text-xs text-gray-500 hover:text-gray-700 ml-1"
                >
                  清空
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {brickRows.map((row, index) => (
              <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 sm:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">名稱</label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateBrickRow(row.id, 'name', e.target.value)
                      }
                      placeholder={`牆面 ${index + 1}`}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">牆面面積</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={row.area}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateBrickRow(row.id, 'area', e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        m²
                      </span>
                    </div>
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">牆厚</label>
                    <select
                      value={row.wallType}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateBrickRow(row.id, 'wallType', e.target.value)
                      }
                      aria-label="牆厚"
                      title="牆厚"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                    >
                      {Object.entries(BRICK_PER_SQM).map(([k, v]) => (
                        <option key={k} value={k}>
                          {(v as { label: string }).label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-10 sm:col-span-3 flex items-center">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">數量</label>
                      <div className="text-sm font-bold text-orange-600">
                        {brickRowResults[index].count > 0
                          ? `${formatNumber(brickRowResults[index].count, 0)} 塊`
                          : '--'}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeBrickRow(row.id)}
                      disabled={brickRows.length <= 1}
                      title="刪除此列"
                      aria-label="刪除此列"
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addBrickRow}
            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            +增加新欄位
          </button>

          <WastageControl
            wastage={brickWastage}
            setWastage={setBrickWastage}
            defaultValue={DEFAULT_WASTAGE.brick}
            useCustom={brickCustomWastage}
            setUseCustom={setBrickCustomWastage}
          />

          <ResultDisplay
            label={`紅磚數量 (共 ${brickRowResults.filter(r => r.count > 0).length} 項)`}
            value={totalBricks}
            unit="塊"
            wastageValue={totalBricksWithWastage}
            onAddRecord={
              onAddRecord
                ? (label, value, unit, wastageValue, subType) =>
                  onAddRecord(
                    subType || '紅磚',
                    label,
                    Number(value),
                    unit,
                    wastageValue || 0,
                    brickCost
                  )
                : undefined
            }
            subType="紅磚"
          />

          <CostInput
            label="紅磚"
            quantity={totalBricksWithWastage}
            unit="塊"
            vendors={vendors.filter(
              v => v.category === '建材供應' || (v as any).tradeType?.includes('磚')
            )}
            onChange={setBrickCost}
            placeholder={{ spec: '例：2寸紅磚' }}
          />
        </div>
      )}

      {/* 快速估算 */}
      {calcType === 'quick' && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info size={16} />
            裝修口訣: 水泥=面積×0.4, 砂=面積×0.05
          </div>
          <InputField
            label="建築面積"
            value={quickArea}
            onChange={setQuickArea}
            unit="m²"
            placeholder="0"
          />
          <div className="grid grid-cols-2 gap-3">
            <ResultDisplay
              label="水泥概估"
              value={quickCement}
              unit="包"
              showWastage={false}
              onAddRecord={
                onAddRecord
                  ? (label, value, unit, wastageValue, subType) =>
                    onAddRecord(
                      subType || '快速估算',
                      label,
                      Number(value),
                      unit,
                      wastageValue || 0
                    )
                  : undefined
              }
              subType="快速估算"
            />
            <ResultDisplay
              label="砂概估"
              value={quickSand}
              unit="m³"
              showWastage={false}
              onAddRecord={
                onAddRecord
                  ? (label, value, unit, wastageValue, subType) =>
                    onAddRecord(
                      subType || '快速估算',
                      label,
                      Number(value),
                      unit,
                      wastageValue || 0
                    )
                  : undefined
              }
              subType="快速估算"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MasonryCalculator;
