import React, { useState, useEffect } from 'react';
import {
    Calculator,
    ArrowRightLeft,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
    Download,
    ClipboardList,
    Layers,
    Building2,
    Home
} from 'lucide-react';
import { MaterialCalculator } from './MaterialCalculator';
import { CostEstimator } from './CostEstimator';

// ============================================
// 工具函數
// ============================================

// 將 calcRecords 轉換為 estimateItems
const importCalcRecordsToEstimate = (calcRecords, existingItems) => {
    const imported = calcRecords.map(record => ({
        id: `cmm:${record.category}:${record.subType}:${record.label}:${record.spec || ''}`,
        name: record.label,
        spec: record.spec || record.vendor || '',
        unit: record.unit,
        price: record.price || 0,
        quantity: record.wastageValue || record.value || 0,
        note: `${record.note || ''} | src=${record.category}/${record.subType}`,
        sourceType: 'cmm',
        importedAt: new Date().toISOString(),
    }));

    // 合併規則：相同 name+spec 累加數量
    const merged = [...existingItems];

    imported.forEach(item => {
        const existingIndex = merged.findIndex(
            e => e.name === item.name && e.spec === item.spec
        );

        if (existingIndex >= 0) {
            merged[existingIndex] = {
                ...merged[existingIndex],
                quantity: merged[existingIndex].quantity + item.quantity
            };
        } else {
            merged.push(item);
        }
    });

    return merged;
};

// 格式化金額
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// ============================================
// 工作區面板組件
// ============================================

const WorkspacePanel = ({
    title,
    icon: Icon,
    children,
    collapsible = false,
    defaultCollapsed = false,
    badge,
    className = ''
}) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    return (
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
            {/* Panel Header */}
            <div
                className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between ${collapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={18} className="text-gray-600" />}
                    <span className="font-medium text-gray-800">{title}</span>
                    {badge && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                {collapsible && (
                    <button className="p-1 hover:bg-gray-100 rounded">
                        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                )}
            </div>

            {/* Panel Content */}
            {!collapsed && (
                <div className="p-4">
                    {children}
                </div>
            )}
        </div>
    );
};

// ============================================
// 主組件
// ============================================

export const EngineeringEstimateWorkspace = ({ addToast }) => {
    // 單一狀態源
    const [calcRecords, setCalcRecords] = useState([]);
    const [estimateItems, setEstimateItems] = useState([]);

    // UI 狀態 - 使用營建/裝潢作為頂層分類
    const [activeCategory, setActiveCategory] = useState('construction'); // 'construction' | 'interior'

    // 分類定義
    const CATEGORIES = [
        { id: 'construction', label: '營建工程', icon: Building2, desc: '結構、鋼筋、混凝土、模板' },
        { id: 'interior', label: '室內裝潢', icon: Home, desc: '油漆、木作、泥作、水電' },
    ];

    // URL query 參數處理
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const focus = params.get('focus');
        const category = params.get('category');

        // 支援舊版 URL 參數向後相容
        if (focus === 'materials' || category === 'construction') {
            setActiveCategory('construction');
        } else if (focus === 'cost' || category === 'interior') {
            setActiveCategory('interior');
        }
    }, []);

    // 計算總成本
    const totalCost = estimateItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 匯入計算記錄到估算清單
    const handleImportRecords = () => {
        if (calcRecords.length === 0) {
            addToast?.('沒有計算記錄可匯入', 'warning');
            return;
        }

        const merged = importCalcRecordsToEstimate(calcRecords, estimateItems);
        setEstimateItems(merged);
        addToast?.(`已匯入 ${calcRecords.length} 筆計算記錄`, 'success');
    };

    // 清空所有
    const handleClearAll = () => {
        setCalcRecords([]);
        setEstimateItems([]);
        addToast?.('已清空所有資料', 'info');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Workspace Header */}
            <div
                className="sticky top-0 z-10 bg-white/90 border-b border-gray-200"
                style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                }}
            >
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-900 rounded-lg">
                                <Calculator size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">工程估算工作區</h1>
                                <p className="text-xs text-gray-500">材料計算 + 成本估算整合介面</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {/* Import Button */}
                            <button
                                onClick={handleImportRecords}
                                disabled={calcRecords.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowRightLeft size={16} />
                                匯入估算
                                {calcRecords.length > 0 && (
                                    <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                                        {calcRecords.length}
                                    </span>
                                )}
                            </button>

                            {/* Export Button */}
                            <button
                                disabled={estimateItems.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FileSpreadsheet size={16} />
                                匯出
                            </button>
                        </div>
                    </div>

                    {/* Summary Bar */}
                    <div className="mt-4 flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-600">計算記錄</span>
                            <span className="font-medium text-gray-900">{calcRecords.length} 筆</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                            <span className="text-gray-600">估算項目</span>
                            <span className="font-medium text-gray-900">{estimateItems.length} 項</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">預估總成本</span>
                            <span className="font-bold text-gray-900 text-lg">{formatCurrency(totalCost)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Tabs for Mobile/Tablet (<=1279px) */}
            <div className="lg:hidden sticky top-[120px] z-10 bg-white border-b border-gray-200 px-4 py-2">
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                    {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${activeCategory === cat.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {/* Desktop Layout (>=1280px) */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                    {/* Left Panel: Cost Estimation */}
                    <WorkspacePanel
                        title="成本估算"
                        icon={ClipboardList}
                        badge={estimateItems.length > 0 ? `${estimateItems.length} 項` : undefined}
                    >
                        <CostEstimator
                            embedded
                            addToast={addToast}
                            estimateItems={estimateItems}
                            setEstimateItems={setEstimateItems}
                        />
                    </WorkspacePanel>

                    {/* Right Panel: Material Calculation */}
                    <WorkspacePanel
                        title="材料計算"
                        icon={Layers}
                        badge={calcRecords.length > 0 ? `${calcRecords.length} 筆` : undefined}
                        collapsible
                        defaultCollapsed={false}
                    >
                        <MaterialCalculator
                            embedded
                            addToast={addToast}
                            calcRecords={calcRecords}
                            setCalcRecords={setCalcRecords}
                        />
                    </WorkspacePanel>
                </div>

                {/* Tablet Layout (768-1279px) */}
                <div className="hidden md:block lg:hidden space-y-6">
                    {/* Cost Estimation */}
                    <WorkspacePanel
                        title="成本估算"
                        icon={ClipboardList}
                        badge={estimateItems.length > 0 ? `${estimateItems.length} 項` : undefined}
                    >
                        <CostEstimator
                            embedded
                            addToast={addToast}
                            estimateItems={estimateItems}
                            setEstimateItems={setEstimateItems}
                        />
                    </WorkspacePanel>

                    {/* Material Calculation - Collapsible */}
                    <WorkspacePanel
                        title="材料計算"
                        icon={Layers}
                        badge={calcRecords.length > 0 ? `${calcRecords.length} 筆` : undefined}
                        collapsible
                        defaultCollapsed={true}
                    >
                        <MaterialCalculator
                            embedded
                            addToast={addToast}
                            calcRecords={calcRecords}
                            setCalcRecords={setCalcRecords}
                        />
                    </WorkspacePanel>
                </div>

                {/* Mobile Layout (<=767px) - Category-based */}
                <div className="block md:hidden">
                    {activeCategory === 'construction' && (
                        <WorkspacePanel
                            title="營建工程"
                            icon={Building2}
                            badge={calcRecords.length > 0 ? `${calcRecords.length} 筆` : undefined}
                        >
                            <MaterialCalculator
                                embedded
                                addToast={addToast}
                                calcRecords={calcRecords}
                                setCalcRecords={setCalcRecords}
                            />
                        </WorkspacePanel>
                    )}

                    {activeCategory === 'interior' && (
                        <WorkspacePanel
                            title="室內裝潢"
                            icon={Home}
                            badge={estimateItems.length > 0 ? `${estimateItems.length} 項` : undefined}
                        >
                            <CostEstimator
                                embedded
                                addToast={addToast}
                                estimateItems={estimateItems}
                                setEstimateItems={setEstimateItems}
                            />
                        </WorkspacePanel>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EngineeringEstimateWorkspace;
