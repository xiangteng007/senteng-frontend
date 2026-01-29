/**
 * TileCalculator (TypeScript)
 * 從 MaterialCalculator.jsx 提取
 */
import React, { useState, type FC, type ChangeEvent } from 'react';
import { Info, Plus, Trash2, Layers } from 'lucide-react';

import { DEFAULT_WASTAGE, TILE_SIZES, TILE_METHODS } from '../constants';
import { InputField, WastageControl, ResultDisplay, CostInput } from './SharedComponents';
import type { Vendor, CostValue } from '../types';

// Row types
interface TileRow {
  id: number;
  name: string;
  area: string;
  unit: 'ping' | 'sqm';
  sizeIdx: number;
  method: string;
}

interface TileRowResult extends TileRow {
  count: number;
  tileL: number;
  tileW: number;
}

interface GroutRow {
  id: number;
  name: string;
  area: string;
}

interface GroutRowResult extends GroutRow {
  amount: number;
}

interface AdhesiveRow {
  id: number;
  name: string;
  area: string;
  trowel: string;
}

interface AdhesiveRowResult extends AdhesiveRow {
  amount: number;
}

interface LaborCost {
  subtotal?: number;
  [key: string]: any;
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

type CalcType = 'tiles' | 'grout' | 'adhesive';

interface TileCalculatorProps {
  onAddRecord?: (
    subType: string,
    label: string,
    value: number,
    unit: string,
    wastageValue: number,
    cost?: CostValue | LaborCost | null
  ) => void;
  vendors?: Vendor[];
}

// 3️⃣ 磁磚工程計算器 (支援多列輸入)
const TileCalculator: FC<TileCalculatorProps> = ({ onAddRecord, vendors = [] }) => {
  const [calcType, setCalcType] = useState<CalcType>('tiles');

  // 磁磚片數 - 多列支援
  const [tileRows, setTileRows] = useState<TileRow[]>([
    { id: 1, name: '', area: '', unit: 'ping', sizeIdx: 3, method: 'none' },
  ]);
  const [customTileL, setCustomTileL] = useState('60');
  const [customTileW, setCustomTileW] = useState('60');
  const [tileWastage, setTileWastage] = useState(DEFAULT_WASTAGE.tile);
  const [tileCustomWastage, setTileCustomWastage] = useState(false);
  const [tileCost, setTileCost] = useState<CostValue | null>(null);

  // 填縫劑 - 多列支援
  const [groutRows, setGroutRows] = useState<GroutRow[]>([{ id: 1, name: '', area: '' }]);
  const [groutTileL, setGroutTileL] = useState('60');
  const [groutTileW, setGroutTileW] = useState('60');
  const [groutWidth, setGroutWidth] = useState('3');
  const [groutDepth, setGroutDepth] = useState('5');
  const [groutWastage, setGroutWastage] = useState(DEFAULT_WASTAGE.grout);
  const [groutCustomWastage, setGroutCustomWastage] = useState(false);
  const [groutCost, setGroutCost] = useState<CostValue | null>(null);

  // 黏著劑 - 多列支援
  const [adhesiveRows, setAdhesiveRows] = useState<AdhesiveRow[]>([
    { id: 1, name: '', area: '', trowel: '4' },
  ]);
  const [adhesiveWastage, setAdhesiveWastage] = useState(DEFAULT_WASTAGE.adhesive);
  const [adhesiveCustomWastage, setAdhesiveCustomWastage] = useState(false);
  const [adhesiveCost, setAdhesiveCost] = useState<CostValue | null>(null);

  // 磁磚鋪貼工資
  const [tileLaborCost, setTileLaborCost] = useState<LaborCost | null>(null);

  // 計算每列磁磚結果
  const tileSizesTyped = TILE_SIZES as Array<{ label: string; l: number | null; w: number | null }>;
  const tileRowResults: TileRowResult[] = tileRows.map(row => {
    const selectedTile = tileSizesTyped[row.sizeIdx] || tileSizesTyped[3];
    const tileL = selectedTile.l || parseFloat(customTileL) || 60;
    const tileW = selectedTile.w || parseFloat(customTileW) || 60;
    const areaSqm =
      row.unit === 'ping' ? (parseFloat(row.area) || 0) * 3.30579 : parseFloat(row.area) || 0;
    const tilesPerSqm = 10000 / (tileL * tileW);
    const count = areaSqm * tilesPerSqm;
    return { ...row, count, tileL, tileW };
  });

  // 總計磁磚
  const totalTiles = tileRowResults.reduce((sum, row) => sum + row.count, 0);
  const currentTileWastage = tileCustomWastage ? tileWastage : DEFAULT_WASTAGE.tile;
  const totalTilesWithWastage = applyWastage(totalTiles, currentTileWastage);
  const selectedTileForDisplay = tileSizesTyped[tileRows[0]?.sizeIdx || 3];
  const displayTileL = selectedTileForDisplay.l || parseFloat(customTileL) || 60;
  const displayTileW = selectedTileForDisplay.w || parseFloat(customTileW) || 60;
  const tileCountPerPing = 32400 / (displayTileL * displayTileW);

  // 計算總坪數 (用於工資計算)
  const totalAreaPing = tileRowResults.reduce((sum, row) => {
    const area = parseFloat(row.area) || 0;
    return sum + (row.unit === 'ping' ? area : area * 0.3025);
  }, 0);

  // 磁磚列操作
  const addTileRow = (): void => {
    const newId = Math.max(...tileRows.map(r => r.id), 0) + 1;
    setTileRows([
      ...tileRows,
      { id: newId, name: '', area: '', unit: 'ping', sizeIdx: 3, method: 'none' },
    ]);
  };
  const removeTileRow = (id: number): void => {
    if (tileRows.length <= 1) return;
    setTileRows(tileRows.filter(row => row.id !== id));
  };
  const updateTileRow = (id: number, field: keyof TileRow, value: string | number): void => {
    setTileRows(tileRows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };
  const clearTileRows = (): void => {
    setTileRows([{ id: 1, name: '', area: '', unit: 'ping', sizeIdx: 3, method: 'none' }]);
  };

  // 計算填縫劑結果
  const L = parseFloat(groutTileL) * 10 || 600;
  const W = parseFloat(groutTileW) * 10 || 600;
  const D = parseFloat(groutWidth) || 3;
  const C = parseFloat(groutDepth) || 5;
  const groutPerSqm = ((L + W) / (L * W)) * D * C * 1.7;

  const groutRowResults: GroutRowResult[] = groutRows.map(row => {
    const area = parseFloat(row.area) || 0;
    const amount = area * groutPerSqm;
    return { ...row, amount };
  });

  const totalGrout = groutRowResults.reduce((sum, row) => sum + row.amount, 0);
  const currentGroutWastage = groutCustomWastage ? groutWastage : DEFAULT_WASTAGE.grout;
  const totalGroutWithWastage = applyWastage(totalGrout, currentGroutWastage);

  // 填縫劑列操作
  const addGroutRow = (): void => {
    const newId = Math.max(...groutRows.map(r => r.id), 0) + 1;
    setGroutRows([...groutRows, { id: newId, name: '', area: '' }]);
  };
  const removeGroutRow = (id: number): void => {
    if (groutRows.length <= 1) return;
    setGroutRows(groutRows.filter(row => row.id !== id));
  };
  const updateGroutRow = (id: number, field: keyof GroutRow, value: string): void => {
    setGroutRows(groutRows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };
  const clearGroutRows = (): void => {
    setGroutRows([{ id: 1, name: '', area: '' }]);
  };

  // 計算黏著劑結果
  const adhesiveRowResults: AdhesiveRowResult[] = adhesiveRows.map(row => {
    const perSqm = parseFloat(row.trowel) === 4 ? 2.5 : parseFloat(row.trowel) === 6 ? 6.25 : 4;
    const area = parseFloat(row.area) || 0;
    const amount = area * perSqm;
    return { ...row, amount };
  });

  const totalAdhesive = adhesiveRowResults.reduce((sum, row) => sum + row.amount, 0);
  const currentAdhesiveWastage = adhesiveCustomWastage ? adhesiveWastage : DEFAULT_WASTAGE.adhesive;
  const totalAdhesiveWithWastage = applyWastage(totalAdhesive, currentAdhesiveWastage);

  // 黏著劑列操作
  const addAdhesiveRow = (): void => {
    const newId = Math.max(...adhesiveRows.map(r => r.id), 0) + 1;
    setAdhesiveRows([...adhesiveRows, { id: newId, name: '', area: '', trowel: '4' }]);
  };
  const removeAdhesiveRow = (id: number): void => {
    if (adhesiveRows.length <= 1) return;
    setAdhesiveRows(adhesiveRows.filter(row => row.id !== id));
  };
  const updateAdhesiveRow = (id: number, field: keyof AdhesiveRow, value: string): void => {
    setAdhesiveRows(adhesiveRows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };
  const clearAdhesiveRows = (): void => {
    setAdhesiveRows([{ id: 1, name: '', area: '', trowel: '4' }]);
  };

  const tileMethodsTyped = TILE_METHODS as Array<{ label: string; value: string }>;

  const calcTypeButtons = [
    { id: 'tiles' as const, label: '磁磚片數' },
    { id: 'grout' as const, label: '填縫劑' },
    { id: 'adhesive' as const, label: '黏著劑' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {calcTypeButtons.map(item => (
          <button
            key={item.id}
            onClick={() => setCalcType(item.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              calcType === item.id ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 磁磚片數 - 多列模式 */}
      {calcType === 'tiles' && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info size={16} />
              公式: 每坪片數 = 32400 ÷ (長cm × 寬cm)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{tileRows.length} 列</span>
              <button
                onClick={() =>
                  tileRows.length > 1 && removeTileRow(tileRows[tileRows.length - 1].id)
                }
                disabled={tileRows.length <= 1}
                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="移除列"
              >
                <span className="text-lg font-bold leading-none">−</span>
              </button>
              <button
                onClick={addTileRow}
                className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                aria-label="新增列"
              >
                <Plus size={16} />
              </button>
              {tileRows.length > 1 && (
                <button
                  onClick={clearTileRows}
                  className="text-xs text-gray-500 hover:text-gray-700 ml-1"
                >
                  清空
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {tileRows.map((row, index) => (
              <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">名稱</label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateTileRow(row.id, 'name', e.target.value)
                      }
                      placeholder={`區域 ${index + 1}`}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">面積</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={row.area}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateTileRow(row.id, 'area', e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {row.unit === 'ping' ? '坪' : 'm²'}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block text-xs text-gray-500 mb-1">單位</label>
                    <select
                      value={row.unit}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateTileRow(row.id, 'unit', e.target.value)
                      }
                      className="w-full px-1.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500"
                      aria-label="面積單位"
                    >
                      <option value="ping">坪</option>
                      <option value="sqm">m²</option>
                    </select>
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">磁磚尺寸</label>
                    <select
                      value={row.sizeIdx}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateTileRow(row.id, 'sizeIdx', parseInt(e.target.value))
                      }
                      className="w-full px-1.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500"
                      aria-label="磁磚尺寸"
                    >
                      {tileSizesTyped.map((t, i) => (
                        <option key={i} value={i}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">施工方法</label>
                    <select
                      value={row.method}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateTileRow(row.id, 'method', e.target.value)
                      }
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                      aria-label="施工方法"
                    >
                      {tileMethodsTyped.map(m => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-9 sm:col-span-2 flex items-center">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">片數</label>
                      <div className="text-sm font-bold text-orange-600">
                        {tileRowResults[index].count > 0
                          ? `${formatNumber(tileRowResults[index].count, 0)} 片`
                          : '--'}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeTileRow(row.id)}
                      disabled={tileRows.length <= 1}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="刪除此列"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addTileRow}
            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            +增加新欄位
          </button>

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            60×60cm 磁磚每坪約 <strong>{formatNumber(tileCountPerPing, 1)}</strong> 片
          </div>

          <WastageControl
            wastage={tileWastage}
            setWastage={setTileWastage}
            defaultValue={DEFAULT_WASTAGE.tile}
            useCustom={tileCustomWastage}
            setUseCustom={setTileCustomWastage}
          />

          <ResultDisplay
            label={`磁磚片數 (共 ${tileRowResults.filter(r => r.count > 0).length} 項)`}
            value={totalTiles}
            unit="片"
            wastageValue={totalTilesWithWastage}
            onAddRecord={
              onAddRecord
                ? (label, value, unit, wastageValue, subType) =>
                    onAddRecord(
                      subType || '磁磚',
                      label,
                      Number(value),
                      unit,
                      wastageValue || 0,
                      tileCost
                    )
                : undefined
            }
            subType="磁磚"
          />

          <CostInput
            label="磁磚"
            quantity={totalTilesWithWastage}
            unit="片"
            vendors={vendors.filter(
              v => v.category === '建材供應' || (v as any).tradeType?.includes('磁磚')
            )}
            onChange={setTileCost as any}
            placeholder={{ spec: '例：60x60cm 拋光石英磚' }}
          />

          {/* 磁磚鋪貼工資 */}
          <div className="bg-orange-50 rounded-lg p-3 space-y-3 border border-orange-100 mt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
              <span className="bg-orange-200 text-orange-700 p-1 rounded">
                <Layers size={14} />
              </span>
              磁磚鋪貼工資
            </div>

            <ResultDisplay
              label="鋪貼工資合計"
              value={tileLaborCost?.subtotal || 0}
              unit="元"
              showWastage={false}
              onAddRecord={
                onAddRecord
                  ? (label, value, unit, wastageValue, subType) =>
                      onAddRecord(
                        subType || '鋪貼工資',
                        label,
                        Number(value),
                        unit,
                        Number(value),
                        tileLaborCost
                      )
                  : undefined
              }
              subType="鋪貼工資"
            />

            <CostInput
              label="施工"
              quantity={totalAreaPing}
              unit="坪"
              vendors={vendors.filter(
                v =>
                  v.category === '工程工班' &&
                  ((v as any).tradeType?.includes('泥作') || (v as any).tradeType?.includes('磁磚'))
              )}
              onChange={setTileLaborCost as any}
              placeholder={{ spec: '例：60x60cm 貼工' }}
            />
          </div>
        </div>
      )}

      {/* 填縫劑 - 多列模式 */}
      {calcType === 'grout' && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info size={16} />
              公式: U = (L+W)/(L×W) × 縫寬 × 縫深 × 1.7
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{groutRows.length} 列</span>
              <button
                onClick={() =>
                  groutRows.length > 1 && removeGroutRow(groutRows[groutRows.length - 1].id)
                }
                disabled={groutRows.length <= 1}
                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="移除列"
              >
                <span className="text-lg font-bold leading-none">−</span>
              </button>
              <button
                onClick={addGroutRow}
                className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                aria-label="新增列"
              >
                <Plus size={16} />
              </button>
              {groutRows.length > 1 && (
                <button
                  onClick={clearGroutRows}
                  className="text-xs text-gray-500 hover:text-gray-700 ml-1"
                >
                  清空
                </button>
              )}
            </div>
          </div>

          {/* 共用設定 */}
          <div className="grid grid-cols-4 gap-2 bg-blue-50 p-3 rounded-lg">
            <InputField label="磚長" value={groutTileL} onChange={setGroutTileL} unit="cm" />
            <InputField label="磚寬" value={groutTileW} onChange={setGroutTileW} unit="cm" />
            <InputField label="縫寬" value={groutWidth} onChange={setGroutWidth} unit="mm" />
            <InputField label="縫深" value={groutDepth} onChange={setGroutDepth} unit="mm" />
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            此規格每平方公尺約 <strong>{formatNumber(groutPerSqm, 2)}</strong> kg
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {groutRows.map((row, index) => (
              <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-xs text-gray-500 mb-1">名稱</label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateGroutRow(row.id, 'name', e.target.value)
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
                          updateGroutRow(row.id, 'area', e.target.value)
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
                  <div className="col-span-5 sm:col-span-4 flex items-center">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">填縫劑用量</label>
                      <div className="text-sm font-bold text-orange-600">
                        {groutRowResults[index].amount > 0
                          ? `${formatNumber(groutRowResults[index].amount, 2)} kg`
                          : '--'}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeGroutRow(row.id)}
                      disabled={groutRows.length <= 1}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="刪除此列"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addGroutRow}
            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            +增加新欄位
          </button>

          <WastageControl
            wastage={groutWastage}
            setWastage={setGroutWastage}
            defaultValue={DEFAULT_WASTAGE.grout}
            useCustom={groutCustomWastage}
            setUseCustom={setGroutCustomWastage}
          />

          <ResultDisplay
            label={`填縫劑用量 (共 ${groutRowResults.filter(r => r.amount > 0).length} 項)`}
            value={totalGrout}
            unit="kg"
            wastageValue={totalGroutWithWastage}
            onAddRecord={
              onAddRecord
                ? (label, value, unit, wastageValue, subType) =>
                    onAddRecord(
                      subType || '填縫劑',
                      label,
                      Number(value),
                      unit,
                      wastageValue || 0,
                      groutCost
                    )
                : undefined
            }
            subType="填縫劑"
          />

          <CostInput
            label="填縫劑"
            quantity={totalGroutWithWastage}
            unit="kg"
            vendors={vendors.filter(
              v => v.category === '建材供應' || (v as any).tradeType?.includes('磁磚')
            )}
            onChange={setGroutCost as any}
            placeholder={{ spec: '例：本色填縫劑' }}
          />
        </div>
      )}

      {/* 黏著劑 - 多列模式 */}
      {calcType === 'adhesive' && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info size={16} />
              4mm鏝刀 ≈ 2.5kg/m², 6mm鏝刀 ≈ 6.25kg/m²
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{adhesiveRows.length} 列</span>
              <button
                onClick={() =>
                  adhesiveRows.length > 1 &&
                  removeAdhesiveRow(adhesiveRows[adhesiveRows.length - 1].id)
                }
                disabled={adhesiveRows.length <= 1}
                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="移除列"
              >
                <span className="text-lg font-bold leading-none">−</span>
              </button>
              <button
                onClick={addAdhesiveRow}
                className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                aria-label="新增列"
              >
                <Plus size={16} />
              </button>
              {adhesiveRows.length > 1 && (
                <button
                  onClick={clearAdhesiveRows}
                  className="text-xs text-gray-500 hover:text-gray-700 ml-1"
                >
                  清空
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {adhesiveRows.map((row, index) => (
              <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 sm:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">名稱</label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateAdhesiveRow(row.id, 'name', e.target.value)
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
                          updateAdhesiveRow(row.id, 'area', e.target.value)
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
                    <label className="block text-xs text-gray-500 mb-1">鏝刀規格</label>
                    <select
                      value={row.trowel}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateAdhesiveRow(row.id, 'trowel', e.target.value)
                      }
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                      aria-label="鏝刀規格"
                    >
                      <option value="4">4mm</option>
                      <option value="6">6mm</option>
                    </select>
                  </div>
                  <div className="col-span-10 sm:col-span-3 flex items-center">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">黏著劑用量</label>
                      <div className="text-sm font-bold text-orange-600">
                        {adhesiveRowResults[index].amount > 0
                          ? `${formatNumber(adhesiveRowResults[index].amount, 2)} kg`
                          : '--'}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeAdhesiveRow(row.id)}
                      disabled={adhesiveRows.length <= 1}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="刪除此列"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addAdhesiveRow}
            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            +增加新欄位
          </button>

          <WastageControl
            wastage={adhesiveWastage}
            setWastage={setAdhesiveWastage}
            defaultValue={DEFAULT_WASTAGE.adhesive}
            useCustom={adhesiveCustomWastage}
            setUseCustom={setAdhesiveCustomWastage}
          />

          <ResultDisplay
            label={`黏著劑用量 (共 ${adhesiveRowResults.filter(r => r.amount > 0).length} 項)`}
            value={totalAdhesive}
            unit="kg"
            wastageValue={totalAdhesiveWithWastage}
            onAddRecord={
              onAddRecord
                ? (label, value, unit, wastageValue, subType) =>
                    onAddRecord(
                      subType || '黏著劑',
                      label,
                      Number(value),
                      unit,
                      wastageValue || 0,
                      adhesiveCost
                    )
                : undefined
            }
            subType="黏著劑"
          />

          <CostInput
            label="黏著劑"
            quantity={totalAdhesiveWithWastage}
            unit="kg"
            vendors={vendors.filter(
              v => v.category === '建材供應' || (v as any).tradeType?.includes('磁磚')
            )}
            onChange={setAdhesiveCost as any}
            placeholder={{ spec: '例：高分子益膠泥' }}
          />
        </div>
      )}
    </div>
  );
};

export default TileCalculator;
