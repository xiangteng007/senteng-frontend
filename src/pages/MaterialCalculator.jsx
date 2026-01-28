
import React, { useState } from 'react';
import {
    Calculator, Building2, Layers, Grid3X3, Paintbrush, BarChart3,
    Info, RotateCcw, Settings2, ChevronDown, ChevronUp, Copy, Check,
    FileSpreadsheet, Plus, Trash2, ExternalLink, RefreshCw, Download, History, Save
} from 'lucide-react';
import { SectionTitle } from '../components/common/Indicators';
import { GoogleService } from '../services/GoogleService';
import { useCmmData } from '../hooks/useCmmData';
import { exportToExcel, exportToPDF, saveToHistory } from '../utils/exportUtils';

// 新模組化架構導入
import { CalculationSummary, StructureCalculator, MasonryCalculator, TileCalculator, FinishCalculator, BuildingEstimator } from './MaterialCalculator/components';
import * as CONST from './MaterialCalculator/constants';

// ============================================
// 從模組導入常數 (避免重複定義)
// ============================================
const {
    DEFAULT_WASTAGE,
    BRICK_PER_SQM,
    TILE_SIZES,
    TILE_METHODS,
    PLASTER_RATIOS,
    WALL_THICKNESS_OPTIONS,
    BUILDING_TYPES,
    REBAR_SPECS,
    REBAR_SIZES,
    REBAR_SPACING_OPTIONS,
    REBAR_LAYER_OPTIONS,
    REBAR_PRICES,
    REBAR_USAGE_BY_COMPONENT,
    REBAR_RATIO_BY_COMPONENT,
    CONCRETE_GRADES,
    PARAPET_THICKNESS_OPTIONS,
    GROUND_BEAM_PRESETS,
    COLUMN_PRESETS,
    WALL_THICKNESS_PRESETS,
    FLOOR_THICKNESS_PRESETS,
    COLUMN_MAIN_BAR_COUNT,
    FORMWORK_TYPES,
    CONSTRUCTION_CONDITIONS,
    REGULATION_REFS,
    GROUNDBEAM_PRESETS_REBAR,
    COLUMN_PRESETS_REBAR,
    BEAM_PRESETS_REBAR,
    SLAB_PRESETS_REBAR,
} = CONST;

// ============================================
// 工具函數
// ============================================

const formatNumber = (num, decimals = 2) => {
    if (isNaN(num) || num === null) return '-';
    return Number(num).toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
};

const applyWastage = (value, wastagePercent) => {
    return value * (1 + wastagePercent / 100);
};

// ============================================
// 子組件
// ============================================

// 匯出工具列組件
const ExportToolbar = ({ data, elementRef, title = '計算結果', onSaveToHistory }) => {
    const [exporting, setExporting] = useState(null);

    const handleExcelExport = async () => {
        if (!data || data.length === 0) return;
        setExporting('excel');
        try {
            await exportToExcel(data, title);
        } catch (e) {
            console.error('Excel export failed:', e);
        }
        setExporting(null);
    };

    const handlePdfExport = async () => {
        if (!elementRef?.current) return;
        setExporting('pdf');
        try {
            await exportToPDF(elementRef.current, title);
        } catch (e) {
            console.error('PDF export failed:', e);
        }
        setExporting(null);
    };

    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
                onClick={handleExcelExport}
                disabled={exporting || !data?.length}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <FileSpreadsheet size={14} />
                {exporting === 'excel' ? '匯出中...' : 'Excel'}
            </button>
            <button
                onClick={handlePdfExport}
                disabled={exporting === 'pdf'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Download size={14} />
                {exporting === 'pdf' ? '匯出中...' : 'PDF'}
            </button>
            {onSaveToHistory && (
                <button
                    onClick={onSaveToHistory}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors ml-auto"
                >
                    <Save size={14} />
                    儲存記錄
                </button>
            )}
        </div>
    );
};

// 輸入欄位組件
const InputField = ({ label, value, onChange, unit, placeholder, type = 'number', min = 0, step = 'any' }) => (
    <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                step={step}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            {unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>
            )}
        </div>
    </div>
);

// 下拉選單組件
const SelectField = ({ label, value, onChange, options }) => (
    <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
        >
            {options.map((opt, i) => (
                <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                    {typeof opt === 'object' ? opt.label : opt}
                </option>
            ))}
        </select>
    </div>
);

// 損耗率控制組件
const WastageControl = ({ wastage, setWastage, defaultValue, useCustom, setUseCustom }) => (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
        <span className="text-xs text-gray-500">損耗率:</span>
        <button
            onClick={() => setUseCustom(false)}
            className={`px-2 py-1 text-xs rounded ${!useCustom ? 'bg-orange-500 text-white' : 'bg-white border'}`}
        >
            預設 {defaultValue}%
        </button>
        <button
            onClick={() => setUseCustom(true)}
            className={`px-2 py-1 text-xs rounded ${useCustom ? 'bg-orange-500 text-white' : 'bg-white border'}`}
        >
            自訂
        </button>
        {useCustom && (
            <input
                type="number"
                value={wastage}
                onChange={(e) => setWastage(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 border rounded text-xs text-center"
                min="0"
                max="100"
            />
        )}
        {useCustom && <span className="text-xs text-gray-500">%</span>}
    </div>
);

// 法規參照顯示組件
const RegulationReference = ({ componentType, showRules = true }) => {
    const reg = REGULATION_REFS[componentType];
    if (!reg) return null;

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
                <span>📋</span>
                <span>{reg.code} - {reg.title}</span>
            </div>
            {showRules && (
                <ul className="mt-2 space-y-1 text-blue-600 ml-5">
                    {reg.rules.map((rule, i) => (
                        <li key={i} className="list-disc">{rule}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// 預設配筋資訊顯示組件
const PresetRebarInfo = ({ preset, type }) => {
    let info = null;
    let colorClass = 'text-green-600 bg-green-50 border-green-200';

    if (type === 'column' && COLUMN_PRESETS_REBAR[preset]) {
        info = COLUMN_PRESETS_REBAR[preset];
        return (
            <div className={`text-xs p-2 rounded border ${colorClass}`}>
                <strong>常用配筋:</strong> 主筋 {info.mainCount}根{info.mainBar} + 箍筋 {info.stirrup}@{info.stirrupSpacing}mm ({info.desc})
            </div>
        );
    }
    if (type === 'groundbeam' && GROUNDBEAM_PRESETS_REBAR[preset]) {
        info = GROUNDBEAM_PRESETS_REBAR[preset];
        return (
            <div className={`text-xs p-2 rounded border ${colorClass}`}>
                <strong>常用配筋:</strong> 上筋 {info.topCount}根{info.topBar} + 下筋 {info.bottomCount}根{info.bottomBar} + 箍筋 {info.stirrup}@{info.stirrupSpacing}mm ({info.desc})
            </div>
        );
    }
    if (type === 'beam' && BEAM_PRESETS_REBAR[preset]) {
        info = BEAM_PRESETS_REBAR[preset];
        return (
            <div className={`text-xs p-2 rounded border ${colorClass}`}>
                <strong>常用配筋:</strong> 上筋 {info.topCount}根{info.topBar} + 下筋 {info.bottomCount}根{info.bottomBar} + 箍筋 {info.stirrup}@{info.stirrupSpacing}mm ({info.desc})
            </div>
        );
    }
    if (type === 'slab' && SLAB_PRESETS_REBAR[preset]) {
        info = SLAB_PRESETS_REBAR[preset];
        return (
            <div className={`text-xs p-2 rounded border ${colorClass}`}>
                <strong>常用配筋:</strong> {info.rebarSize}@{info.spacing}mm {info.layer === 'double' ? '雙層' : '單層'}雙向 ({info.desc})
            </div>
        );
    }
    return null;
};

// 結果顯示組件
const ResultDisplay = ({ label, value, unit, wastageValue, showWastage = true, onAddRecord, subType = '' }) => {
    const [copied, setCopied] = useState(false);

    const copyValue = () => {
        navigator.clipboard.writeText(wastageValue || value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleAddRecord = () => {
        if (onAddRecord && value > 0) {
            onAddRecord(subType, label, value, unit, wastageValue || value);
        }
    };

    return (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="text-xs opacity-80 mb-1">{label}</div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{formatNumber(value)}</span>
                <span className="text-sm opacity-80 mb-1">{unit}</span>
                <div className="ml-auto flex gap-1">
                    {onAddRecord && value > 0 && (
                        <button onClick={handleAddRecord} className="p-1 hover:bg-white/20 rounded" title="加入記錄">
                            <Plus size={16} />
                        </button>
                    )}
                    <button onClick={copyValue} className="p-1 hover:bg-white/20 rounded" title="複製">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
            {showWastage && wastageValue && wastageValue !== value && (
                <div className="mt-2 pt-2 border-t border-white/30 text-sm">
                    含損耗: <span className="font-bold">{formatNumber(wastageValue)}</span> {unit}
                </div>
            )}
        </div>
    );
};

// 成本輸入組件
const CostInput = ({ label, quantity, unit, unitLabel, vendors = [], onChange, placeholder = {} }) => {
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
            note
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
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-white"
                    >
                        <option value="">選擇廠商...</option>
                        {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">規格/種類</label>
                    <input
                        type="text"
                        value={spec}
                        onChange={(e) => setSpec(e.target.value)}
                        placeholder={placeholder.spec || "例：3000psi"}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">單價 ({unitLabel || (unit ? `元/${unit}` : '元')})</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">備註</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="備註說明"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-orange-200/50">
                <div className="text-xs text-orange-600">
                    數量: {formatNumber(quantity)} {unit}
                </div>
                <div className="text-sm font-bold text-orange-700">
                    小計: $ {formatNumber(subtotal, 0)}
                </div>
            </div>
        </div>
    );
};


// 主組件
// ============================================

export const MaterialCalculator = ({
    addToast,
    vendors = [],
    // Embedded mode props
    embedded = false,
    calcRecords: externalCalcRecords,
    setCalcRecords: externalSetCalcRecords,
    activeCategory = null, // 外部控制的分類（來自 L2 tabs）
}) => {
    const [activeTab, setActiveTab] = useState('structure');

    // 當有外部 activeCategory 時使用它，否則使用內部狀態
    const effectiveTab = activeCategory || activeTab;

    // CMM API 數據 (含 fallback 到硬編碼常量)
    const { buildingTypes, rebarSpecs, loading: cmmLoading, apiAvailable } = useCmmData();

    // 計算記錄 - 支援外部狀態注入
    const [internalCalcRecords, internalSetCalcRecords] = useState([]);
    const calcRecords = externalCalcRecords ?? internalCalcRecords;
    const setCalcRecords = externalSetCalcRecords ?? internalSetCalcRecords;

    const [exportName, setExportName] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [exportedSheet, setExportedSheet] = useState(null);

    const tabs = [
        { id: 'structure', icon: Building2, label: '結構工程' },
        { id: 'masonry', icon: Layers, label: '泥作工程' },
        { id: 'tile', icon: Grid3X3, label: '磁磚工程' },
        { id: 'finish', icon: Paintbrush, label: '塗料工程' },
        { id: 'estimate', icon: BarChart3, label: '建築概估' },
    ];

    // 新增計算記錄
    const addRecord = (category, subType, label, value, unit, wastageValue, costData) => {
        const record = {
            id: Date.now(),
            category,
            subType,
            label,
            value: parseFloat(value) || 0,
            unit,
            wastageValue: parseFloat(wastageValue) || parseFloat(value) || 0,
            createdAt: new Date().toLocaleString('zh-TW'),
            // 成本資訊
            vendor: costData?.vendor || '',
            spec: costData?.spec || '',
            price: costData?.price || 0,
            subtotal: costData?.subtotal || 0,
            note: costData?.note || ''
        };
        setCalcRecords(prev => [...prev, record]);
        addToast?.(`已加入記錄: ${label}`, 'success');
    };

    // 刪除記錄
    const removeRecord = (id) => {
        setCalcRecords(prev => prev.filter(r => r.id !== id));
    };

    // 清空記錄
    const clearRecords = () => {
        setCalcRecords([]);
        addToast?.('已清空計算記錄', 'info');
    };

    // 匯出到 Google Sheet (存入物料算量資料夾)
    const exportToSheet = async () => {
        if (calcRecords.length === 0) {
            addToast?.('請先加入計算記錄', 'warning');
            return;
        }

        setIsExporting(true);
        try {
            // 使用新的匯出功能，會自動建立物料算量資料夾並以日期時間命名
            const result = await GoogleService.exportMaterialCalculationToFolder(
                calcRecords,
                exportName // 如果有自訂名稱則使用，否則會自動產生含日期時間的檔名
            );

            if (result.success) {
                setExportedSheet(result);
                addToast?.('已匯出到 Google Sheet！', 'success', {
                    action: {
                        label: '開啟 Sheet',
                        onClick: () => window.open(result.sheetUrl, '_blank')
                    }
                });
            } else {
                addToast?.(result.error || '匯出失敗', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            addToast?.('匯出失敗：' + error.message, 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const renderCalculator = () => {
        switch (effectiveTab) {
            case 'structure': return <StructureCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('結構工程', s, l, v, u, w, c)} vendors={vendors} rebarSpecs={rebarSpecs} />;
            case 'masonry': return <MasonryCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('泥作工程', s, l, v, u, w, c)} vendors={vendors} />;
            case 'tile': return <TileCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('磁磚工程', s, l, v, u, w, c)} vendors={vendors} />;
            case 'finish': return <FinishCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('塗料工程', s, l, v, u, w, c)} vendors={vendors} />;
            case 'estimate': return <BuildingEstimator onAddRecord={(s, l, v, u, w, c) => addRecord('建築概估', s, l, v, u, w, c)} buildingTypes={buildingTypes} />;
            default: return <StructureCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('結構工程', s, l, v, u, w, c)} vendors={vendors} rebarSpecs={rebarSpecs} />;
        }
    };

    // Embedded mode: 簡化渲染
    if (embedded) {
        return (
            <div className="space-y-4">
                {/* 工項選擇頁籤 - 只有在沒有外部 activeCategory 時才顯示（避免與 L2 重複） */}
                {!activeCategory && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm ${effectiveTab === tab.id
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 計算器區域 */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    {renderCalculator()}
                </div>

                {/* 計算記錄列表 */}
                {calcRecords.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-800 text-sm">計算記錄 ({calcRecords.length})</span>
                            <button
                                onClick={clearRecords}
                                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                            >
                                清空
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {calcRecords.map(record => (
                                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 truncate">{record.label}</div>
                                        <div className="text-xs text-gray-500">
                                            {record.category} - {record.subType}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">
                                            {formatNumber(record.wastageValue)} {record.unit}
                                        </span>
                                        <button
                                            onClick={() => removeRecord(record.id)}
                                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 匯出到 Google Sheet - Embedded 模式 */}
                {calcRecords.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FileSpreadsheet size={16} className="text-blue-600" />
                            <span className="font-medium text-blue-800 text-sm">匯出到 Google Sheet</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={exportName}
                                onChange={(e) => setExportName(e.target.value)}
                                placeholder="報表名稱（選填）"
                                className="flex-1 px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button
                                onClick={exportToSheet}
                                disabled={isExporting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isExporting ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        匯出中...
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet size={14} />
                                        匯出
                                    </>
                                )}
                            </button>
                        </div>
                        {exportedSheet && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                                <a
                                    href={exportedSheet.sheetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <ExternalLink size={14} />
                                    開啟已匯出的 Sheet
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Standalone mode: 完整頁面渲染
    return (
        <div className="space-y-6 animate-fade-in">
            <SectionTitle title="營建物料快速換算" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左側：計算器 */}
                <div className="lg:col-span-2 space-y-4">
                    {/* 工項選擇 */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 計算器區域 */}
                    <div className="bg-gray-50 rounded-2xl p-5">
                        {renderCalculator()}
                    </div>

                    {/* 公式說明 */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Calculator size={18} />
                            常用換算公式
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium text-gray-700">🧱 鋼筋重量</div>
                                <div className="text-gray-500 mt-1">每米重 = 0.00617 × d²</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium text-gray-700">🧱 紅磚數量</div>
                                <div className="text-gray-500 mt-1">24牆 = 128塊/m²</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium text-gray-700">🔲 磁磚片數</div>
                                <div className="text-gray-500 mt-1">每坪 = 32400 ÷ (長×寬)</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右側：計算記錄與匯出 */}
                <div className="space-y-4">
                    {/* 計算記錄 */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold flex items-center gap-2">
                                <Calculator size={18} />
                                計算記錄
                            </span>
                            {calcRecords.length > 0 && (
                                <button
                                    onClick={clearRecords}
                                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                                >
                                    清空
                                </button>
                            )}
                        </div>

                        {calcRecords.length === 0 ? (
                            <div className="text-center py-8 text-orange-200">
                                <Calculator size={40} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">計算後點擊「加入記錄」</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {calcRecords.map(record => (
                                    <div key={record.id} className="flex items-center justify-between py-2 border-b border-white/20 last:border-0">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{record.label}</div>
                                            <div className="text-xs text-orange-200">
                                                {record.category} - {record.subType}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">
                                                {formatNumber(record.wastageValue)} {record.unit}
                                            </span>
                                            <button
                                                onClick={() => removeRecord(record.id)}
                                                className="p-1 hover:bg-white/20 rounded text-red-200"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 匯出到 Google Sheet */}
                    {calcRecords.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FileSpreadsheet size={18} className="text-blue-600" />
                                <span className="font-medium text-blue-800">匯出到 Google Sheet</span>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={exportName}
                                    onChange={(e) => setExportName(e.target.value)}
                                    placeholder="輸入報表名稱（選填）"
                                    className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                <button
                                    onClick={exportToSheet}
                                    disabled={isExporting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isExporting ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            匯出中...
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet size={16} />
                                            匯出到 Google Sheet
                                        </>
                                    )}
                                </button>
                            </div>

                            {exportedSheet && (
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                    <a
                                        href={exportedSheet.sheetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <ExternalLink size={14} />
                                        開啟已匯出的 Sheet
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 使用提示 */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex gap-2">
                            <Info size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-orange-700">
                                <p className="font-medium mb-1">使用說明</p>
                                <ol className="list-decimal list-inside space-y-0.5 text-orange-600">
                                    <li>選擇工程類別進行計算</li>
                                    <li>點「加入記錄」保存結果</li>
                                    <li>匯出到 Google Sheet</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 計算摘要浮動面板 */}
            <CalculationSummary
                records={calcRecords}
                onExportExcel={() => exportToExcel(calcRecords, '材料計算清單')}
                onExportPdf={() => {
                    const el = document.querySelector('.material-calculator-container');
                    if (el) exportToPDF(el, '材料計算清單');
                }}
                onSaveHistory={() => {
                    if (calcRecords.length > 0) {
                        saveToHistory({
                            id: Date.now(),
                            date: new Date().toISOString(),
                            records: calcRecords,
                            summary: `${calcRecords.length} 筆記錄`,
                        });
                    }
                }}
                onClearRecords={clearRecords}
            />
        </div>
    );
};

export default MaterialCalculator;

