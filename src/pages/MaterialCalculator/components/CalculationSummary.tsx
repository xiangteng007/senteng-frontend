/**
 * 計算摘要面板 (TypeScript)
 * 顯示當前所有計算結果的總覽與預估成本
 */
import React, { memo, type FC } from 'react';
import { BarChart3, FileSpreadsheet, Download, Save, Trash2 } from 'lucide-react';
import { useCalculationSummary, formatNumber } from '../hooks';
import type { MaterialRecord } from '../types';

// Summary data from hook
interface SummaryData {
  items: number;
  concrete: number;
  rebar: number;
  formwork: number;
  tile: number;
  paint: number;
  total: number;
}

interface CalculationSummaryProps {
  records?: MaterialRecord[];
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onSaveHistory?: () => void;
  onClearRecords?: () => void;
  show?: boolean;
}

/**
 * CalculationSummary 組件
 * 固定顯示在頁面底部或側邊，提供快速總覽
 */
const CalculationSummary: FC<CalculationSummaryProps> = ({
  records = [],
  onExportExcel,
  onExportPdf,
  onSaveHistory,
  onClearRecords,
  show = true,
}) => {
  const summary = useCalculationSummary(records) as SummaryData;

  if (!show || records.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex items-center gap-2">
        <BarChart3 size={18} className="text-white" />
        <span className="text-white font-medium">計算摘要</span>
        <span className="ml-auto text-xs text-gray-300">{summary.items} 筆記錄</span>
      </div>

      {/* Summary Content */}
      <div className="p-4 space-y-2">
        {summary.concrete > 0 && (
          <SummaryRow label="混凝土" value={summary.concrete} unit="m³" color="blue" />
        )}
        {summary.rebar > 0 && (
          <SummaryRow label="鋼筋" value={summary.rebar} unit="kg" color="orange" />
        )}
        {summary.formwork > 0 && (
          <SummaryRow label="模板" value={summary.formwork} unit="m²" color="green" />
        )}
        {summary.tile > 0 && (
          <SummaryRow label="磁磚" value={summary.tile} unit="片" color="purple" />
        )}
        {summary.paint > 0 && (
          <SummaryRow label="塗料" value={summary.paint} unit="L" color="pink" />
        )}

        {/* Total Cost */}
        {summary.total > 0 && (
          <div className="pt-2 mt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">預估總成本</span>
              <span className="text-lg font-bold text-gray-900">
                NT$ {formatNumber(summary.total, 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={onExportExcel}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          <FileSpreadsheet size={14} />
          Excel
        </button>
        <button
          onClick={onExportPdf}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Download size={14} />
          PDF
        </button>
        <button
          onClick={onSaveHistory}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Save size={14} />
          儲存
        </button>
        <button
          onClick={onClearRecords}
          className="px-2 py-2 text-xs bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
          title="清空記錄"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

type SummaryRowColor = 'blue' | 'orange' | 'green' | 'purple' | 'pink';

interface SummaryRowProps {
  label: string;
  value: number;
  unit: string;
  color: SummaryRowColor;
}

/**
 * 摘要列組件
 */
const SummaryRow = memo<SummaryRowProps>(({ label, value, unit, color }) => {
  const colorMap: Record<SummaryRowColor, string> = {
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    pink: 'bg-pink-50 text-pink-700',
  };

  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs px-2 py-0.5 rounded ${colorMap[color]}`}>{label}</span>
      <span className="text-sm font-medium text-gray-800">
        {formatNumber(value)} <span className="text-xs text-gray-500">{unit}</span>
      </span>
    </div>
  );
});

SummaryRow.displayName = 'SummaryRow';

export default CalculationSummary;
