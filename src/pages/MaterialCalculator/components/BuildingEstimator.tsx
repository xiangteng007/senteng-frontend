/**
 * BuildingEstimator - 建築概估計算器 (TypeScript)
 * 從 MaterialCalculator.jsx 提取
 */
import React, { useState, type FC, type ChangeEvent } from 'react';
import { Info } from 'lucide-react';

import { WALL_THICKNESS_OPTIONS } from '../constants';
import { InputField, SelectField, ResultDisplay } from './SharedComponents';
import type { BuildingType, SelectOption } from '../types';

// Extended building type with original index
interface FilteredBuildingType extends BuildingType {
  originalIndex: number;
  structure: string;
  wallThickness: number;
  rebar: number;
  concrete: number;
  formwork: number;
  sand: number;
}

// 工具函數
const formatNumber = (num: number | null | undefined, decimals: number = 2): string => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return Number(num).toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

// Extended BuildingType for this component
interface ExtendedBuildingType {
  label: string;
  structure: string;
  wallThickness: number;
  rebar: number;
  concrete: number;
  formwork: number;
  sand: number;
}

interface BuildingEstimatorProps {
  onAddRecord?: (
    category: string,
    material: string,
    value: number,
    unit: string,
    wastageValue: number
  ) => void;
  buildingTypes?: ExtendedBuildingType[];
}

// 5️⃣ 建築概估計算器
const BuildingEstimator: FC<BuildingEstimatorProps> = ({ onAddRecord, buildingTypes = [] }) => {
  const [buildingType, setBuildingType] = useState(0);
  const [floorArea, setFloorArea] = useState('');
  const [wallThicknessFilter, setWallThicknessFilter] = useState('all');

  // 根據牆壁厚度篩選建築類型
  const filteredTypes = buildingTypes
    .map((t, i) => ({ ...t, originalIndex: i }))
    .filter(
      t => wallThicknessFilter === 'all' || t.wallThickness === parseInt(wallThicknessFilter)
    );

  // 確保選中的類型在過濾後仍然有效
  const selectedIndex = filteredTypes.findIndex(t => t.originalIndex === buildingType);
  const validSelectedIndex =
    selectedIndex >= 0 ? buildingType : (filteredTypes[0]?.originalIndex ?? 0);
  const selected = buildingTypes[validSelectedIndex] ||
    buildingTypes[0] || {
      rebar: 0,
      concrete: 0,
      formwork: 0,
      sand: 0,
      structure: '',
      wallThickness: 0,
    };

  const areaValue = parseFloat(floorArea) || 0;
  const totalRebar = areaValue * selected.rebar;
  const totalConcrete = areaValue * selected.concrete;
  const totalFormwork = areaValue * selected.formwork;
  const totalSand = areaValue * selected.sand;

  // 當篩選改變時，自動選擇篩選後的第一個類型
  const handleWallThicknessChange = (value: string): void => {
    setWallThicknessFilter(value);
    if (value !== 'all') {
      const newFiltered = buildingTypes
        .map((t, i) => ({ ...t, originalIndex: i }))
        .filter(t => t.wallThickness === parseInt(value));
      if (newFiltered.length > 0) {
        setBuildingType(newFiltered[0].originalIndex);
      }
    }
  };

  const createAddRecordHandler = (material: string, value: number, unit: string) => {
    return onAddRecord ? () => onAddRecord('建築概估', material, value, unit, value) : undefined;
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800">
            <p className="font-medium">建築概估說明</p>
            <p className="text-orange-600 mt-1">
              依據建築類型與樓地板面積，快速估算整棟建築的主要結構材料用量。數據來源為抗震7度區規則結構設計經驗值。
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectField
            label="牆壁厚度篩選"
            value={wallThicknessFilter}
            onChange={handleWallThicknessChange}
            options={WALL_THICKNESS_OPTIONS as SelectOption[]}
          />
          <SelectField
            label="建築類型"
            value={validSelectedIndex}
            onChange={(v: string) => setBuildingType(parseInt(v))}
            options={filteredTypes.map(t => ({
              value: t.originalIndex,
              label: `${t.label} (${t.structure})`,
            }))}
          />
          <InputField
            label="總樓地板面積"
            value={floorArea}
            onChange={setFloorArea}
            unit="m²"
            placeholder="0"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-gray-600">
            <span>
              結構: <strong className="text-gray-800">{selected.structure}</strong>
            </span>
            <span>
              牆厚: <strong className="text-gray-800">{selected.wallThickness} cm</strong>
            </span>
            <span>鋼筋: {selected.rebar} kg/m²</span>
            <span>混凝土: {selected.concrete} m³/m²</span>
            <span>模板: {selected.formwork} m²/m²</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ResultDisplay
            label="鋼筋用量"
            value={formatNumber(totalRebar)}
            unit="kg"
            showWastage={false}
            onAddRecord={createAddRecordHandler('鋼筋', totalRebar, 'kg')}
          />
          <ResultDisplay
            label="混凝土用量"
            value={formatNumber(totalConcrete)}
            unit="m³"
            showWastage={false}
            onAddRecord={createAddRecordHandler('混凝土', totalConcrete, 'm³')}
          />
          <ResultDisplay
            label="模板面積"
            value={formatNumber(totalFormwork)}
            unit="m²"
            showWastage={false}
            onAddRecord={createAddRecordHandler('模板', totalFormwork, 'm²')}
          />
          <ResultDisplay
            label="砂石用量"
            value={formatNumber(totalSand)}
            unit="m³"
            showWastage={false}
            onAddRecord={createAddRecordHandler('砂石', totalSand, 'm³')}
          />
        </div>
      </div>

      {/* 建築類型參照表 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-3">建築類型材料用量參照表</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2">類型</th>
                <th className="text-left py-2 px-2">結構</th>
                <th className="text-right py-2 px-2">牆厚</th>
                <th className="text-right py-2 px-2">鋼筋 (kg/m²)</th>
                <th className="text-right py-2 px-2">混凝土 (m³/m²)</th>
                <th className="text-right py-2 px-2">模板 (m²/m²)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((t, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-50 ${t.originalIndex === validSelectedIndex ? 'bg-orange-50' : ''}`}
                >
                  <td className="py-2 px-2 font-medium">{t.label}</td>
                  <td className="py-2 px-2">{t.structure}</td>
                  <td className="py-2 px-2 text-right">{t.wallThickness} cm</td>
                  <td className="py-2 px-2 text-right">{t.rebar}</td>
                  <td className="py-2 px-2 text-right">{t.concrete}</td>
                  <td className="py-2 px-2 text-right">{t.formwork}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-amber-100 rounded"></span>
            RB = 加強磚造
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-gray-100 rounded"></span>
            RC = 鋼筋混凝土 | SRC = 鋼骨鋼筋混凝土 | SC = 鋼構
          </span>
        </div>
      </div>
    </div>
  );
};

export default BuildingEstimator;
