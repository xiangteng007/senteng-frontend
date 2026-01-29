import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ArrowRightLeft,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Layers,
  Building2,
  Home,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import CategoryTabs, {
  CATEGORY_L1,
  CATEGORY_L2,
  CategoryTabsL1,
  CategoryTabsL2,
} from '../components/estimate/CategoryTabs';
import ExportDrawer from '../components/estimate/ExportDrawer';
import { MaterialCalculator } from './MaterialCalculator';
import { CostEstimator } from './CostEstimator';

// ============================================
// 工具函數
// ============================================

// 將 calcRecords 轉換為 estimateItems
const importCalcRecordsToEstimate = (calcRecords, existingItems, categoryL1, categoryL2) => {
  const imported = calcRecords.map(record => ({
    id: `cmm:${record.category}:${record.subType}:${record.label}:${record.spec || ''}:${Date.now()}`,
    categoryL1,
    categoryL2,
    name: record.label,
    spec: record.spec || record.vendor || '',
    unit: record.unit,
    unitPrice: record.price || 0,
    quantity: record.wastageValue || record.value || 0,
    note: record.note || '',
    source: {
      type: 'calculator',
      runId: record.id,
      timestamp: new Date().toISOString(),
    },
  }));

  // 合併規則：相同 name+spec 累加數量
  const merged = [...existingItems];

  imported.forEach(item => {
    const existingIndex = merged.findIndex(e => e.name === item.name && e.spec === item.spec);

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity: merged[existingIndex].quantity + item.quantity,
      };
    } else {
      merged.push(item);
    }
  });

  return merged;
};

// 格式化金額
const formatCurrency = amount => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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
  actions,
  className = '',
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
        <div className="flex items-center gap-2">
          {actions}
          {collapsible && (
            <button className="p-1 hover:bg-gray-100 rounded">
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      {!collapsed && <div className="p-4">{children}</div>}
    </div>
  );
};

// ============================================
// 估價單行組件
// ============================================

const EstimateLineRow = ({ line, index, onUpdate, onDelete }) => {
  const subtotal = (line.quantity || 0) * (line.unitPrice || 0);

  return (
    <tr className="hover:bg-gray-50 group">
      <td className="px-3 py-2 text-gray-500 text-sm">{index + 1}</td>
      <td className="px-3 py-2 font-medium text-gray-900">{line.name}</td>
      <td className="px-3 py-2 text-gray-600">{line.spec}</td>
      <td className="px-3 py-2 text-gray-600">{line.unit}</td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={line.quantity}
          onChange={e => onUpdate(line.id, { quantity: parseFloat(e.target.value) || 0 })}
          className="w-20 px-2 py-1 border border-gray-200 rounded text-right focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={line.unitPrice}
          onChange={e => onUpdate(line.id, { unitPrice: parseFloat(e.target.value) || 0 })}
          className="w-24 px-2 py-1 border border-gray-200 rounded text-right focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </td>
      <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(subtotal)}</td>
      <td className="px-3 py-2">
        <button
          onClick={() => onDelete(line.id)}
          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
};

// ============================================
// 估價單組件
// ============================================

const EstimateSheet = ({
  lines,
  onUpdateLine,
  onDeleteLine,
  categoryL1: _categoryL1,
  categoryL2: _categoryL2,
}) => {
  // 篩選當前分類的項目（或顯示全部）
  const filteredLines = lines; // 目前顯示全部，可選篩選

  const grandTotal = lines.reduce(
    (sum, line) => sum + (line.quantity || 0) * (line.unitPrice || 0),
    0
  );

  if (filteredLines.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="font-medium">估價單為空</p>
        <p className="text-sm mt-1">從左側項目庫加入，或使用計算器匯入</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-2 text-left text-gray-600 font-medium">#</th>
            <th className="px-3 py-2 text-left text-gray-600 font-medium">名稱</th>
            <th className="px-3 py-2 text-left text-gray-600 font-medium">規格</th>
            <th className="px-3 py-2 text-left text-gray-600 font-medium">單位</th>
            <th className="px-3 py-2 text-left text-gray-600 font-medium">數量</th>
            <th className="px-3 py-2 text-left text-gray-600 font-medium">單價</th>
            <th className="px-3 py-2 text-right text-gray-600 font-medium">小計</th>
            <th className="px-3 py-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {filteredLines.map((line, index) => (
            <EstimateLineRow
              key={line.id}
              line={line}
              index={index}
              onUpdate={onUpdateLine}
              onDelete={onDeleteLine}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 bg-gray-50">
            <td colSpan="6" className="px-3 py-3 text-right font-bold text-gray-700">
              總計
            </td>
            <td className="px-3 py-3 text-right font-bold text-gray-900 text-lg">
              {formatCurrency(grandTotal)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// ============================================
// 計算器抽屜組件
// ============================================

const CalculatorDrawer = ({
  open,
  onClose,
  categoryL1,
  categoryL2,
  calcRecords,
  setCalcRecords,
  onImport,
  addToast,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl flex flex-col"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        {/* Drawer Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator size={20} className="text-gray-600" />
            <span className="font-medium">材料計算器</span>
            {calcRecords.length > 0 && (
              <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">
                {calcRecords.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onImport}
              disabled={calcRecords.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightLeft size={14} />
              匯入估價單
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <MaterialCalculator
            embedded
            addToast={addToast}
            calcRecords={calcRecords}
            setCalcRecords={setCalcRecords}
            activeCategory={categoryL1 === 'construction' ? categoryL2 : 'structure'}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================
// 主組件
// ============================================

export const EngineeringEstimateWorkspace = ({ addToast }) => {
  // ===== 導覽狀態 =====
  const [selectedL1, setSelectedL1] = useState('construction');
  const [selectedL2, setSelectedL2] = useState('structure');

  // ===== 資料狀態 =====
  const [calcRecords, setCalcRecords] = useState([]);
  const [estimateLines, setEstimateLines] = useState([]);

  // ===== UI 狀態 =====
  const [calcDrawerOpen, setCalcDrawerOpen] = useState(false);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [mobileView, setMobileView] = useState('catalog'); // 'catalog' | 'sheet' | 'export'

  // ===== 法規同步狀態 =====
  const [regulationSyncStatus, setRegulationSyncStatus] = useState(null);
  const [isSyncingRegulations, setIsSyncingRegulations] = useState(false);

  // ===== URL query 參數處理 =====
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const sub = params.get('sub');

    if (category === 'construction' || category === 'interior') {
      setSelectedL1(category);
    }
    if (sub) {
      setSelectedL2(sub);
    }
  }, []);

  // ===== L1 變更時重設 L2 =====
  const handleL1Change = newL1 => {
    setSelectedL1(newL1);
    const firstL2 = CATEGORY_L2[newL1]?.[0]?.id || '';
    setSelectedL2(firstL2);
  };

  // ===== 計算統計 =====
  const grandTotal = estimateLines.reduce(
    (sum, line) => sum + (line.quantity || 0) * (line.unitPrice || 0),
    0
  );

  // ===== 估價單操作 =====
  const handleUpdateLine = (id, updates) => {
    setEstimateLines(prev => prev.map(line => (line.id === id ? { ...line, ...updates } : line)));
  };

  const handleDeleteLine = id => {
    setEstimateLines(prev => prev.filter(line => line.id !== id));
  };

  const handleImportFromCalc = () => {
    if (calcRecords.length === 0) {
      addToast?.('沒有計算記錄可匯入', 'warning');
      return;
    }

    const merged = importCalcRecordsToEstimate(calcRecords, estimateLines, selectedL1, selectedL2);
    setEstimateLines(merged);
    addToast?.(`已匯入 ${calcRecords.length} 筆計算記錄`, 'success');
    setCalcDrawerOpen(false);
  };

  const handleAddManualLine = () => {
    const newLine = {
      id: `manual:${Date.now()}`,
      categoryL1: selectedL1,
      categoryL2: selectedL2,
      name: '新項目',
      spec: '',
      unit: '式',
      quantity: 1,
      unitPrice: 0,
      note: '',
      source: { type: 'manual' },
    };
    setEstimateLines(prev => [...prev, newLine]);
  };

  // ===== 法規同步處理 =====
  const handleSyncRegulations = async () => {
    if (isSyncingRegulations) return;

    const { API_BASE_URL } = await import('../config/api');
    const token = localStorage.getItem('auth_token');

    setIsSyncingRegulations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/regulations/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setRegulationSyncStatus(data);
      addToast?.('法規同步已啟動', 'success');

      // 輪詢狀態
      const pollStatus = async () => {
        const statusRes = await fetch(`${API_BASE_URL}/regulations/sync/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const status = await statusRes.json();
        setRegulationSyncStatus(status);

        if (status.status === 'running') {
          setTimeout(pollStatus, 2000);
        } else if (status.status === 'completed') {
          addToast?.('法規同步完成', 'success');
          setIsSyncingRegulations(false);
        } else if (status.status === 'failed') {
          addToast?.('法規同步失敗: ' + (status.message || ''), 'error');
          setIsSyncingRegulations(false);
        } else {
          setIsSyncingRegulations(false);
        }
      };
      setTimeout(pollStatus, 1000);
    } catch {
      addToast?.('法規同步請求失敗', 'error');
      setIsSyncingRegulations(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Workspace Header ===== */}
      <div
        className="sticky top-0 z-20 bg-white/95 border-b border-gray-200"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="px-6 py-4">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 rounded-lg">
                <Calculator size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">工程估算工作區</h1>
                <p className="text-xs text-gray-500">統一導覽 + 估價單式介面</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncRegulations}
                disabled={isSyncingRegulations}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-60 transition-colors"
                title="從全國法規資料庫同步建築法規"
              >
                <RefreshCw size={16} className={isSyncingRegulations ? 'animate-spin' : ''} />
                {isSyncingRegulations ? (
                  <>
                    同步中...
                    {regulationSyncStatus?.progress && (
                      <span className="text-xs">({regulationSyncStatus.progress}%)</span>
                    )}
                  </>
                ) : (
                  '法規同步'
                )}
              </button>
              <button
                onClick={() => setExportDrawerOpen(true)}
                disabled={estimateLines.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileSpreadsheet size={16} />
                匯出
              </button>
            </div>
          </div>

          {/* Summary Row */}
          <div className="mt-3 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">計算記錄</span>
              <span className="font-medium text-gray-900">{calcRecords.length} 筆</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
              <span className="text-gray-600">估算項目</span>
              <span className="font-medium text-gray-900">{estimateLines.length} 項</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">預估總成本</span>
              <span className="font-bold text-gray-900 text-lg">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* ===== Unified Navigation (L1 + L2) ===== */}
          <div className="mt-4 space-y-3">
            {/* L1 Tabs */}
            <CategoryTabsL1 selected={selectedL1} onSelect={handleL1Change} />

            {/* L2 Tabs */}
            <CategoryTabsL2
              categoryL1={selectedL1}
              selected={selectedL2}
              onSelect={setSelectedL2}
            />
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="p-6">
        {/* Desktop Layout (>=1024px): Side by Side */}
        <div className="hidden lg:block">
          {selectedL1 === 'calculator' ? (
            /* Calculator Mode: Full Width MaterialCalculator */
            <WorkspacePanel
              title="材料計算器"
              icon={Calculator}
              badge={`${CATEGORY_L2[selectedL1]?.find(c => c.id === selectedL2)?.label || '結構工程'}`}
            >
              <MaterialCalculator
                embedded
                addToast={addToast}
                onAddRecord={(subType, label, value, unit, wastageValue, costInfo) => {
                  /* 將計算結果新增到估價單 */
                  const newLine = {
                    id: `calc:${Date.now()}`,
                    categoryL1: 'calculator',
                    categoryL2: selectedL2,
                    name: label,
                    spec: costInfo?.spec || '',
                    unit: unit,
                    quantity: wastageValue || value,
                    unitPrice: costInfo?.price || 0,
                    note: `來源: ${subType}`,
                    source: { type: 'calculator' },
                  };
                  setEstimateLines(prev => [...prev, newLine]);
                  addToast?.(`已新增「${label}」至估價單`, 'success');
                }}
                calcRecords={calcRecords}
                setCalcRecords={setCalcRecords}
                activeCategory={selectedL2 === 'structure' ? 'structure' : selectedL2}
              />
            </WorkspacePanel>
          ) : (
            /* Standard Mode: Two Column Layout */
            <div className="grid grid-cols-2 gap-6">
              {/* Left Panel: Catalog / Cost Estimator */}
              <WorkspacePanel
                title="成本項目庫"
                icon={ClipboardList}
                badge={`${CATEGORY_L1.find(c => c.id === selectedL1)?.label || ''} / ${CATEGORY_L2[selectedL1]?.find(c => c.id === selectedL2)?.label || ''}`}
              >
                <CostEstimator
                  embedded
                  addToast={addToast}
                  estimateItems={estimateLines}
                  setEstimateItems={setEstimateLines}
                  activeCategory={selectedL2}
                  categoryL1={selectedL1}
                />
              </WorkspacePanel>

              {/* Right Panel: Estimate Sheet */}
              <WorkspacePanel
                title="估價單"
                icon={Layers}
                badge={estimateLines.length > 0 ? `${estimateLines.length} 項` : undefined}
                actions={
                  <button
                    onClick={handleAddManualLine}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    <Plus size={12} />
                    新增
                  </button>
                }
              >
                <EstimateSheet
                  lines={estimateLines}
                  onUpdateLine={handleUpdateLine}
                  onDeleteLine={handleDeleteLine}
                  categoryL1={selectedL1}
                  categoryL2={selectedL2}
                />
              </WorkspacePanel>
            </div>
          )}
        </div>

        {/* Tablet Layout (768-1023px): Stacked */}
        <div className="hidden md:block lg:hidden space-y-6">
          <WorkspacePanel
            title="成本項目庫"
            icon={ClipboardList}
            collapsible
            defaultCollapsed={false}
          >
            <CostEstimator
              embedded
              addToast={addToast}
              estimateItems={estimateLines}
              setEstimateItems={setEstimateLines}
              activeCategory={selectedL2}
              categoryL1={selectedL1}
            />
          </WorkspacePanel>

          <WorkspacePanel
            title="估價單"
            icon={Layers}
            collapsible
            defaultCollapsed={false}
            badge={estimateLines.length > 0 ? `${estimateLines.length} 項` : undefined}
          >
            <EstimateSheet
              lines={estimateLines}
              onUpdateLine={handleUpdateLine}
              onDeleteLine={handleDeleteLine}
              categoryL1={selectedL1}
              categoryL2={selectedL2}
            />
          </WorkspacePanel>
        </div>

        {/* Mobile Layout (<768px): Tab-based View Switching */}
        <div className="block md:hidden">
          {/* View Switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4">
            {[
              { id: 'catalog', label: '項目庫' },
              { id: 'sheet', label: '估價單' },
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setMobileView(view.id)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${mobileView === view.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          {/* Mobile Content */}
          {mobileView === 'catalog' && (
            <CostEstimator
              embedded
              addToast={addToast}
              estimateItems={estimateLines}
              setEstimateItems={setEstimateLines}
              activeCategory={selectedL2}
              categoryL1={selectedL1}
            />
          )}

          {mobileView === 'sheet' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-800">估價單</h3>
                <button
                  onClick={handleAddManualLine}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  <Plus size={12} />
                  新增
                </button>
              </div>
              <EstimateSheet
                lines={estimateLines}
                onUpdateLine={handleUpdateLine}
                onDeleteLine={handleDeleteLine}
                categoryL1={selectedL1}
                categoryL2={selectedL2}
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== Calculator Drawer ===== */}
      <CalculatorDrawer
        open={calcDrawerOpen}
        onClose={() => setCalcDrawerOpen(false)}
        categoryL1={selectedL1}
        categoryL2={selectedL2}
        calcRecords={calcRecords}
        setCalcRecords={setCalcRecords}
        onImport={handleImportFromCalc}
        addToast={addToast}
      />

      {/* ===== Export Drawer ===== */}
      <ExportDrawer
        open={exportDrawerOpen}
        onClose={() => setExportDrawerOpen(false)}
        estimateLines={estimateLines}
        addToast={addToast}
      />
    </div>
  );
};

export default EngineeringEstimateWorkspace;
