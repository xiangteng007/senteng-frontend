/**
 * MaterialCalculator 共用 UI 組件
 */
import React, { useState, forwardRef } from 'react';
import { Copy, Check, Plus, Trash2, Info, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import { REGULATION_REFS } from '../constants';

/**
 * 輸入欄位組件 - 支援鍵盤導航
 */
export const InputField = forwardRef(
  (
    {
      label,
      value,
      onChange,
      unit,
      placeholder,
      type = 'number',
      min = 0,
      step = 'any',
      onKeyDown,
      className = '',
    },
    ref
  ) => (
    <div className={`flex-1 ${className}`}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          step={step}
          onKeyDown={onKeyDown}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
);

InputField.displayName = 'InputField';

/**
 * 下拉選單組件
 */
export const SelectField = React.memo(({ label, value, onChange, options, className = '' }) => (
  <div className={`flex-1 ${className}`}>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value ?? opt.label}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
));

SelectField.displayName = 'SelectField';

/**
 * 損耗率控制組件
 */
export const WastageControl = React.memo(
  ({ wastage, setWastage, defaultValue, useCustom, setUseCustom }) => (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500">損耗率</label>
      <div className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={useCustom}
          onChange={e => {
            setUseCustom(e.target.checked);
            if (!e.target.checked) setWastage(defaultValue);
          }}
          className="w-3 h-3"
        />
        <span className="text-xs text-gray-400">自訂</span>
      </div>
      <input
        type="number"
        value={wastage}
        onChange={e => setWastage(Number(e.target.value))}
        disabled={!useCustom}
        min={0}
        max={50}
        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center disabled:bg-gray-50"
      />
      <span className="text-xs text-gray-400">%</span>
    </div>
  )
);

WastageControl.displayName = 'WastageControl';

/**
 * 法規參照顯示組件
 */
export const RegulationReference = React.memo(({ componentType, showRules = true }) => {
  const ref = REGULATION_REFS[componentType];
  if (!ref) return null;

  return (
    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-start gap-2">
        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <span className="font-medium text-blue-700">{ref.code}</span>
          <span className="text-blue-600 ml-1">{ref.title}</span>
          {showRules && (
            <ul className="mt-1 space-y-0.5 text-blue-600">
              {ref.rules.map((rule, i) => (
                <li key={i}>• {rule}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
});

RegulationReference.displayName = 'RegulationReference';

/**
 * 結果顯示組件
 */
export const ResultDisplay = React.memo(
  ({
    label,
    value,
    unit,
    wastageValue,
    showWastage = true,
    onAddRecord,
    estimatedCost,
    subType = '',
  }) => {
    const [copied, setCopied] = useState(false);

    const copyValue = () => {
      navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };

    const handleAddRecord = () => {
      if (onAddRecord && value && value !== '-') {
        onAddRecord(label, value, unit, wastageValue, subType);
      }
    };

    return (
      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">{label}</div>
          {showWastage && wastageValue && (
            <div className="text-xs text-gray-400">
              含損耗: {wastageValue} {unit}
            </div>
          )}
          {estimatedCost && (
            <div className="text-xs text-green-600">預估: NT$ {estimatedCost.toLocaleString()}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">{unit}</span>
          <button
            onClick={copyValue}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="複製"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-gray-400" />
            )}
          </button>
          {onAddRecord && (
            <button
              onClick={handleAddRecord}
              className="p-1 hover:bg-orange-100 rounded transition-colors"
              title="加入記錄"
            >
              <Plus size={14} className="text-orange-500" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

ResultDisplay.displayName = 'ResultDisplay';

/**
 * 可收合區塊組件
 */
export const CollapsibleSection = React.memo(({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div className="p-3">{children}</div>}
    </div>
  );
});

CollapsibleSection.displayName = 'CollapsibleSection';

/**
 * 列管理按鈕組
 */
export const RowActions = React.memo(({ onAdd, onRemove, onClear, canRemove = true }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onAdd}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
    >
      <Plus size={12} />
      新增
    </button>
    {canRemove && (
      <button
        onClick={onRemove}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
      >
        <Trash2 size={12} />
        刪除
      </button>
    )}
  </div>
));

RowActions.displayName = 'RowActions';

/**
 * 格式化數字
 */
export const formatNumber = (num, decimals = 2) => {
  if (num === undefined || num === null || isNaN(num)) return '-';
  return Number(num).toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * 成本輸入組件 - 用於材料成本估算
 */
export const CostInput = ({
  label,
  quantity,
  unit,
  unitLabel,
  vendors = [],
  onChange,
  placeholder = {},
}) => {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [spec, setSpec] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');

  const subtotal = (parseFloat(price) || 0) * (parseFloat(quantity) || 0);

  // 當數值變更時通知父組件
  React.useEffect(() => {
    onChange?.({
      vendor: vendors.find(v => v.id === selectedVendor)?.name || '',
      vendorId: selectedVendor,
      spec,
      price: parseFloat(price) || 0,
      subtotal,
      note,
    });
  }, [selectedVendor, spec, price, note, quantity]);

  return (
    <div className="bg-orange-50 rounded-lg p-3 space-y-3 border border-orange-100 mt-2">
      <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
        <span className="bg-orange-200 text-orange-700 p-1 rounded">
          <Calculator size={14} />
        </span>
        {label}成本估算
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">廠商選擇</label>
          <select
            value={selectedVendor}
            onChange={e => setSelectedVendor(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-white"
          >
            <option value="">選擇廠商...</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">規格/種類</label>
          <input
            type="text"
            value={spec}
            onChange={e => setSpec(e.target.value)}
            placeholder={placeholder.spec || '例：3000psi'}
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">
            單價 ({unitLabel || (unit ? `元/${unit}` : '元')})
          </label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0"
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">備註</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="備註說明"
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
          />
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-orange-200/50">
        <div className="text-xs text-orange-600">
          數量: {formatNumber(quantity)} {unit}
        </div>
        <div className="text-sm font-bold text-orange-700">小計: $ {formatNumber(subtotal, 0)}</div>
      </div>
    </div>
  );
};

CostInput.displayName = 'CostInput';
