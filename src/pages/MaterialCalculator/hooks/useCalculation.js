/**
 * useCalculation Hook
 * 統一管理計算邏輯與結果快取
 */
import { useMemo, useCallback } from 'react';
import { REBAR_SPECS, REBAR_SIZES, CONCRETE_GRADES, REBAR_PRICES } from '../constants';

/**
 * 取得鋼筋單位重量 (kg/m)
 */
export const getRebarUnitWeight = size => {
  const spec = REBAR_SIZES.find(r => r.value === size);
  return spec?.unitWeight || 0;
};

/**
 * 鋼筋搭接長度計算 (建技規§407: 搭接長度 ≥ 40d)
 */
export const getLapLength = rebarSpec => {
  const spec = REBAR_SPECS.find(r => r.label.includes(rebarSpec));
  if (!spec) return 500;
  return Math.ceil(spec.d * 40);
};

/**
 * 取得混凝土參考單價
 */
export const getConcretePrice = grade => {
  const spec = CONCRETE_GRADES.find(g => g.value === grade);
  return spec?.price || 2600;
};

/**
 * 取得鋼筋參考單價
 */
export const getRebarPrice = rebarSize => {
  return REBAR_PRICES[rebarSize] || 25;
};

/**
 * 計算板類構件鋼筋 (樓板、牆、女兒牆) - 雙向配筋
 */
export const calculateSlabRebar = (length, width, spacing, layer, rebarSize) => {
  const unitWeight = getRebarUnitWeight(rebarSize);
  const layerOption = layer === 'double' ? 2 : 1;

  // 雙向配筋根數
  const barsX = Math.ceil((width * 1000) / spacing) + 1;
  const barsY = Math.ceil((length * 1000) / spacing) + 1;

  // 總長度 (m)
  const totalLength = barsX * length + barsY * width;
  return totalLength * unitWeight * layerOption;
};

/**
 * 計算柱鋼筋 (主筋 + 箍筋)
 */
export const calculateColumnRebar = (
  height,
  count,
  mainBarSize,
  mainBarCount,
  stirrupSize,
  stirrupSpacing,
  perimeter
) => {
  const mainWeight = getRebarUnitWeight(mainBarSize);
  const stirrupWeight = getRebarUnitWeight(stirrupSize);

  // 主筋
  const mainRebarWeight = mainBarCount * height * mainWeight * count;

  // 箍筋
  const stirrupCount = Math.ceil((height * 1000) / stirrupSpacing);
  const stirrupRebarWeight = stirrupCount * perimeter * stirrupWeight * count;

  return mainRebarWeight + stirrupRebarWeight;
};

/**
 * 計算梁鋼筋 (上筋 + 下筋 + 箍筋)
 */
export const calculateBeamRebar = (
  length,
  count,
  topSize,
  topCount,
  bottomSize,
  bottomCount,
  stirrupSize,
  stirrupSpacing,
  perimeter
) => {
  const topWeight = getRebarUnitWeight(topSize);
  const bottomWeight = getRebarUnitWeight(bottomSize);
  const stirrupWeight = getRebarUnitWeight(stirrupSize);

  // 主筋
  const topRebarWeight = topCount * length * topWeight * count;
  const bottomRebarWeight = bottomCount * length * bottomWeight * count;

  // 箍筋
  const stirrupCount = Math.ceil((length * 1000) / stirrupSpacing);
  const stirrupRebarWeight = stirrupCount * perimeter * stirrupWeight * count;

  return topRebarWeight + bottomRebarWeight + stirrupRebarWeight;
};

/**
 * 格式化數字
 */
export const formatNumber = (num, decimals = 2) => {
  if (isNaN(num) || num === null) return '-';
  return Number(num).toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

/**
 * 套用損耗率
 */
export const applyWastage = (value, wastagePercent) => {
  return value * (1 + wastagePercent / 100);
};

/**
 * useCalculation Hook - 計算摘要
 */
export const useCalculationSummary = records => {
  return useMemo(() => {
    if (!records || records.length === 0) {
      return { concrete: 0, rebar: 0, formwork: 0, total: 0, items: 0 };
    }

    const summary = {
      concrete: 0,
      rebar: 0,
      formwork: 0,
      tile: 0,
      paint: 0,
      total: 0,
      items: records.length,
    };

    records.forEach(record => {
      const value = parseFloat(record.value) || 0;
      const cost = record.costData?.totalCost || 0;

      switch (record.category) {
        case '結構':
          if (record.unit === 'm³') summary.concrete += value;
          if (record.unit === 'kg') summary.rebar += value;
          if (record.unit === 'm²') summary.formwork += value;
          break;
        case '磁磚':
          summary.tile += value;
          break;
        case '裝修':
          summary.paint += value;
          break;
      }
      summary.total += cost;
    });

    return summary;
  }, [records]);
};

export default {
  getRebarUnitWeight,
  getLapLength,
  getConcretePrice,
  getRebarPrice,
  calculateSlabRebar,
  calculateColumnRebar,
  calculateBeamRebar,
  formatNumber,
  applyWastage,
  useCalculationSummary,
};
