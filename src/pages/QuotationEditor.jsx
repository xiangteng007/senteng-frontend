/**
 * 估價單編輯器 - 工項編輯器組件
 * QuotationEditor.jsx
 * 提供類 Excel 表格編輯體驗
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FileText,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Search,
  Upload,
  Download,
  Settings2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreVertical,
  Calculator,
  Eye,
  Send,
  Check,
  X,
  Info,
  AlertCircle,
  Layers,
  Package,
  Percent,
  FileSpreadsheet,
  RotateCcw,
  FilePlus2,
} from 'lucide-react';
import { SectionTitle } from '../components/common/Indicators';
import { QuotationPdfButton } from '../components/quotation/QuotationPdfExport';
import ChangeOrders from './ChangeOrders';
import QuotationService, {
  QUOTATION_STATUS,
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  ITEM_TYPES,
  SUPPLY_TYPES,
  TAX_TYPES,
  DEFAULT_SETTINGS,
  CATALOG_CATEGORIES,
  DEFAULT_CATALOG_ITEMS,
  calculateLineAmount,
  calculateQuotationTotals,
  generateItemCode,
} from '../services/QuotationService';

// ============================================
// 工項列元件
// ============================================
const ItemRow = ({
  item,
  index,
  level = 0,
  isEditing,
  onUpdate,
  onDelete,
  onAddChild,
  onDuplicate,
  isSelected,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.type === ITEM_TYPES.CHAPTER || item.type === ITEM_TYPES.SECTION;

  const handleChange = (field, value) => {
    const updates = { [field]: value };

    // 自動計算複價
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? value : item.quantity;
      const price = field === 'unitPrice' ? value : item.unitPrice;
      updates.amount = calculateLineAmount(qty, price);
    }

    onUpdate(item.id, updates);
  };

  const formatNumber = num => {
    if (!num && num !== 0) return '';
    return new Intl.NumberFormat('zh-TW').format(num);
  };

  const levelColors = [
    'bg-gray-800 text-white', // Chapter
    'bg-gray-100 text-gray-800', // Section
    'bg-white', // Item
  ];

  const isChapter = item.type === ITEM_TYPES.CHAPTER;
  const isSection = item.type === ITEM_TYPES.SECTION;
  const isItem = item.type === ITEM_TYPES.ITEM;

  return (
    <tr
      className={`
                group border-b border-gray-100 transition-all
                ${isChapter ? 'bg-gray-800 text-white font-semibold' : ''}
                ${isSection ? 'bg-gray-100 font-medium' : ''}
                ${isItem ? 'hover:bg-orange-50/50' : ''}
                ${isSelected ? 'bg-orange-100' : ''}
            `}
      onClick={() => onSelect?.(item.id)}
    >
      {/* 項次 */}
      <td
        className={`px-2 py-2 text-center text-sm w-20 ${isChapter ? 'text-white' : 'text-gray-600'}`}
      >
        <div className="flex items-center gap-1">
          <GripVertical size={14} className="opacity-30 cursor-grab" />
          <span>{item.itemCode}</span>
        </div>
      </td>

      {/* 名稱 */}
      <td
        className={`px-2 py-2 ${isChapter ? '' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              onClick={e => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`p-0.5 rounded ${isChapter ? 'hover:bg-white/20' : 'hover:bg-gray-200'}`}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          )}
          {isEditing ? (
            <input
              type="text"
              value={item.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              className={`flex-1 px-2 py-1 rounded border text-sm ${isChapter ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm">{item.name}</span>
          )}
        </div>
      </td>

      {/* 規格 (只有明細項顯示) */}
      <td className={`px-2 py-2 text-sm ${isChapter || isSection ? 'opacity-30' : ''}`}>
        {isItem &&
          (isEditing ? (
            <input
              type="text"
              value={item.specification || ''}
              onChange={e => handleChange('specification', e.target.value)}
              className="w-full px-2 py-1 rounded border border-gray-200 text-sm"
              placeholder="規格說明"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="text-gray-500">{item.specification}</span>
          ))}
      </td>

      {/* 單位 */}
      <td
        className={`px-2 py-2 text-center text-sm w-16 ${isChapter || isSection ? 'opacity-30' : ''}`}
      >
        {isItem &&
          (isEditing ? (
            <input
              type="text"
              value={item.unit || ''}
              onChange={e => handleChange('unit', e.target.value)}
              className="w-full px-1 py-1 rounded border border-gray-200 text-sm text-center"
              placeholder="式"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span>{item.unit}</span>
          ))}
      </td>

      {/* 數量 */}
      <td
        className={`px-2 py-2 text-right text-sm w-20 ${isChapter || isSection ? 'opacity-30' : ''}`}
      >
        {isItem &&
          (isEditing ? (
            <input
              type="number"
              value={item.quantity || ''}
              onChange={e => handleChange('quantity', parseFloat(e.target.value) || 0)}
              className="w-full px-1 py-1 rounded border border-gray-200 text-sm text-right"
              min="0"
              step="0.01"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span>{formatNumber(item.quantity)}</span>
          ))}
      </td>

      {/* 單價 */}
      <td
        className={`px-2 py-2 text-right text-sm w-24 ${isChapter || isSection ? 'opacity-30' : ''}`}
      >
        {isItem &&
          (isEditing ? (
            <input
              type="number"
              value={item.unitPrice || ''}
              onChange={e => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
              className="w-full px-1 py-1 rounded border border-gray-200 text-sm text-right"
              min="0"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span>{formatNumber(item.unitPrice)}</span>
          ))}
      </td>

      {/* 複價 */}
      <td
        className={`px-2 py-2 text-right text-sm w-28 font-medium ${isChapter ? 'text-white' : 'text-orange-600'}`}
      >
        {formatNumber(item.amount || calculateLineAmount(item.quantity, item.unitPrice))}
      </td>

      {/* 操作 */}
      <td className="px-2 py-2 w-24">
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasChildren && (
            <button
              onClick={e => {
                e.stopPropagation();
                onAddChild?.(item.id);
              }}
              className={`p-1 rounded ${isChapter ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-500'}`}
              title="新增子項"
            >
              <Plus size={14} />
            </button>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onDuplicate?.(item.id);
            }}
            className={`p-1 rounded ${isChapter ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-500'}`}
            title="複製"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete?.(item.id);
            }}
            className={`p-1 rounded ${isChapter ? 'hover:bg-red-500/50 text-white' : 'hover:bg-red-100 text-red-500'}`}
            title="刪除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ============================================
// 工項庫搜尋 Modal
// ============================================
const CatalogSearchModal = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState(DEFAULT_CATALOG_ITEMS);

  useEffect(() => {
    const filtered = DEFAULT_CATALOG_ITEMS.filter(item => {
      const matchSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !selectedCategory || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
    setResults(filtered);
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">從工項庫選擇</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3 border-b border-gray-100">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜尋工項..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="">全部分類</option>
              {CATALOG_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {results.map(item => {
              const category = CATALOG_CATEGORIES.find(c => c.id === item.category);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors text-left"
                >
                  <span className="text-lg">{category?.icon || '📦'}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.unit} · 參考價 ${item.refPrice.toLocaleString()}
                    </div>
                  </div>
                  <Plus size={16} className="text-orange-500" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 費用設定面板
// ============================================
const SettingsPanel = ({ settings, onChange, totals }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 size={18} className="text-gray-500" />
          <span className="font-medium text-gray-700">費用設定</span>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">折扣金額</label>
              <input
                type="number"
                value={settings.discountAmount || 0}
                onChange={e =>
                  onChange({ ...settings, discountAmount: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">管理費 (%)</label>
              <input
                type="number"
                value={settings.managementFeeRate || DEFAULT_SETTINGS.managementFee}
                onChange={e =>
                  onChange({ ...settings, managementFeeRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">利潤率 (%)</label>
              <input
                type="number"
                value={settings.profitRate || DEFAULT_SETTINGS.profitRate}
                onChange={e =>
                  onChange({ ...settings, profitRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">稅率 (%)</label>
              <input
                type="number"
                value={settings.taxRate || DEFAULT_SETTINGS.taxRate}
                onChange={e => onChange({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min="0"
                max="100"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="taxType"
                checked={settings.taxType === TAX_TYPES.INCLUSIVE}
                onChange={() => onChange({ ...settings, taxType: TAX_TYPES.INCLUSIVE })}
                className="text-orange-500"
              />
              含稅價
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="taxType"
                checked={settings.taxType === TAX_TYPES.EXCLUSIVE}
                onChange={() => onChange({ ...settings, taxType: TAX_TYPES.EXCLUSIVE })}
                className="text-orange-500"
              />
              未稅價
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// 金額摘要
// ============================================
const TotalsSummary = ({ totals }) => {
  const formatCurrency = amount => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 text-white">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-3">
        <div>
          <div className="text-gray-400 text-xs mb-1">工項小計</div>
          <div className="font-medium">{formatCurrency(totals.subtotal)}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-1">管理費</div>
          <div className="font-medium">{formatCurrency(totals.managementFee)}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-1">利潤</div>
          <div className="font-medium">{formatCurrency(totals.profitAmount)}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-1">稅額</div>
          <div className="font-medium">{formatCurrency(totals.taxAmount)}</div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/20">
        <div className="flex items-center gap-3">
          <span className="text-gray-300">報價總計</span>
          {totals.discountAmount > 0 && (
            <span className="text-xs text-orange-400">
              已折 {formatCurrency(totals.discountAmount)}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-orange-400">
          {formatCurrency(totals.totalAmount)}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 主編輯器組件
// ============================================
const QuotationEditor = ({ quotationId, onBack, addToast }) => {
  const [quotation, setQuotation] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showChangeOrders, setShowChangeOrders] = useState(false);
  const [settings, setSettings] = useState({
    discountAmount: 0,
    managementFeeRate: DEFAULT_SETTINGS.managementFee,
    profitRate: DEFAULT_SETTINGS.profitRate,
    taxRate: DEFAULT_SETTINGS.taxRate,
    taxType: TAX_TYPES.INCLUSIVE,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // 載入估價單
  useEffect(() => {
    const loadQuotation = async () => {
      if (!quotationId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await QuotationService.getQuotation(quotationId);
        if (data) {
          setQuotation(data);
          setItems(data.items || []);
          setSettings({
            discountAmount: data.discountAmount || 0,
            managementFeeRate: data.managementFeeRate || DEFAULT_SETTINGS.managementFee,
            profitRate: data.profitRate || DEFAULT_SETTINGS.profitRate,
            taxRate: data.taxRate || DEFAULT_SETTINGS.taxRate,
            taxType: data.taxType || TAX_TYPES.INCLUSIVE,
          });
        }
      } catch (error) {
        console.error('Failed to load quotation:', error);
        addToast?.('載入估價單失敗', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadQuotation();
  }, [quotationId]);

  // 計算總金額
  const totals = useMemo(() => {
    return calculateQuotationTotals(items, settings);
  }, [items, settings]);

  // 更新工項
  const handleUpdateItem = useCallback((itemId, updates) => {
    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, ...updates } : item)));
    setHasChanges(true);
  }, []);

  // 刪除工項
  const handleDeleteItem = useCallback(itemId => {
    setItems(prev => prev.filter(item => item.id !== itemId && item.parentId !== itemId));
    setHasChanges(true);
  }, []);

  // 複製工項
  const handleDuplicateItem = useCallback(
    itemId => {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const newItem = {
        ...item,
        id: `item-${Date.now()}`,
        name: `${item.name} (複製)`,
      };

      const index = items.findIndex(i => i.id === itemId);
      const newItems = [...items];
      newItems.splice(index + 1, 0, newItem);
      setItems(newItems);
      setHasChanges(true);
    },
    [items]
  );

  // 新增章節
  const handleAddChapter = useCallback(() => {
    const chapterCount = items.filter(i => i.type === ITEM_TYPES.CHAPTER).length;
    const newChapter = {
      id: `item-${Date.now()}`,
      parentId: null,
      itemCode: `${chapterCount + 1}`,
      type: ITEM_TYPES.CHAPTER,
      name: `第${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][chapterCount] || chapterCount + 1}章`,
      unit: '',
      quantity: 0,
      unitPrice: 0,
      amount: 0,
      sortOrder: items.length,
    };
    setItems(prev => [...prev, newChapter]);
    setHasChanges(true);
  }, [items]);

  // 新增工項
  const handleAddItem = useCallback(
    (parentId = null) => {
      // 找到父項
      const parent = parentId ? items.find(i => i.id === parentId) : null;
      const siblings = items.filter(i => i.parentId === parentId);

      const newItem = {
        id: `item-${Date.now()}`,
        parentId,
        itemCode: generateItemCode(parent?.itemCode || '', siblings.length),
        type: parent?.type === ITEM_TYPES.CHAPTER ? ITEM_TYPES.SECTION : ITEM_TYPES.ITEM,
        name: '新工項',
        specification: '',
        unit: '式',
        quantity: 1,
        unitPrice: 0,
        costPrice: 0,
        amount: 0,
        supplyType: SUPPLY_TYPES.CONTRACTOR,
        remark: '',
        sortOrder: items.length,
      };

      // 在父項後面插入
      if (parentId) {
        const parentIndex = items.findIndex(i => i.id === parentId);
        const lastChildIndex = items.reduce(
          (lastIdx, item, idx) => (item.parentId === parentId ? idx : lastIdx),
          parentIndex
        );
        const newItems = [...items];
        newItems.splice(lastChildIndex + 1, 0, newItem);
        setItems(newItems);
      } else {
        setItems(prev => [...prev, newItem]);
      }
      setHasChanges(true);
    },
    [items]
  );

  // 從工項庫新增
  const handleAddFromCatalog = useCallback(
    catalogItem => {
      const lastChapter = [...items].reverse().find(i => i.type === ITEM_TYPES.CHAPTER);
      const siblings = items.filter(i => i.parentId === lastChapter?.id);

      const newItem = {
        id: `item-${Date.now()}`,
        parentId: lastChapter?.id || null,
        itemCode: generateItemCode(lastChapter?.itemCode || '', siblings.length),
        type: ITEM_TYPES.ITEM,
        name: catalogItem.name,
        specification: '',
        unit: catalogItem.unit,
        quantity: 1,
        unitPrice: catalogItem.refPrice,
        costPrice: catalogItem.costPrice,
        amount: catalogItem.refPrice,
        supplyType: SUPPLY_TYPES.CONTRACTOR,
        catalogItemId: catalogItem.id,
        sortOrder: items.length,
      };

      setItems(prev => [...prev, newItem]);
      setHasChanges(true);
      addToast?.(`已新增「${catalogItem.name}」`, 'success');
    },
    [items]
  );

  // 儲存
  const handleSave = async () => {
    if (!quotation) return;

    setSaving(true);
    try {
      await QuotationService.updateQuotation(quotation.id, {
        items,
        ...settings,
        ...totals,
      });
      setHasChanges(false);
      addToast?.('儲存成功', 'success');
    } catch (error) {
      console.error('Failed to save:', error);
      addToast?.('儲存失敗', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 組織階層結構
  const organizedItems = useMemo(() => {
    // 簡單平坦化 - 保持原始順序
    return items.map((item, index) => {
      let level = 0;
      if (item.type === ITEM_TYPES.SECTION) level = 1;
      if (item.type === ITEM_TYPES.ITEM) level = item.parentId ? 2 : 1;
      return { ...item, level };
    });
  }, [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!quotation) {
    return <div className="text-center py-12 text-gray-500">找不到估價單</div>;
  }

  // 變更單模式
  if (showChangeOrders) {
    return (
      <ChangeOrders
        quotationId={quotationId}
        onBack={() => setShowChangeOrders(false)}
        addToast={addToast}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* 頁首 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{quotation.quotationNo}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${QUOTATION_STATUS_COLORS[quotation.status]}`}
              >
                {QUOTATION_STATUS_LABELS[quotation.status]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">{quotation.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-orange-500 flex items-center gap-1">
              <AlertCircle size={14} /> 尚未儲存
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? <span className="animate-spin">⟳</span> : <Save size={18} />}
            儲存
          </button>
        </div>
      </div>

      {/* 工具列 */}
      <div className="bg-white rounded-xl p-3 border border-gray-100 flex flex-wrap items-center gap-2">
        <button
          onClick={handleAddChapter}
          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 flex items-center gap-1"
        >
          <Plus size={16} /> 新增章節
        </button>
        <button
          onClick={() => handleAddItem()}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1"
        >
          <Plus size={16} /> 新增工項
        </button>
        <button
          onClick={() => setShowCatalog(true)}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1"
        >
          <Search size={16} /> 工項庫
        </button>
        <button
          onClick={() => setShowChangeOrders(true)}
          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 flex items-center gap-1"
        >
          <FilePlus2 size={16} /> 變更單
        </button>
        <div className="flex-1" />
        <button className="px-3 py-1.5 text-gray-500 rounded-lg text-sm hover:bg-gray-100 flex items-center gap-1">
          <Upload size={16} /> 匯入
        </button>
        <button className="px-3 py-1.5 text-gray-500 rounded-lg text-sm hover:bg-gray-100 flex items-center gap-1">
          <Download size={16} /> 匯出
        </button>

        {/* PDF 下載 */}
        <QuotationPdfButton
          quotation={{
            ...quotation,
            items: items,
            taxRate: settings.taxRate,
            isTaxIncluded: settings.taxType === TAX_TYPES.INCLUSIVE,
          }}
          className="text-sm py-1.5"
        />
      </div>

      {/* 費用設定 */}
      <SettingsPanel settings={settings} onChange={setSettings} totals={totals} />

      {/* 工項表格 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 uppercase">
                <th className="px-2 py-3 text-left w-20">項次</th>
                <th className="px-2 py-3 text-left">名稱</th>
                <th className="px-2 py-3 text-left">規格</th>
                <th className="px-2 py-3 text-center w-16">單位</th>
                <th className="px-2 py-3 text-right w-20">數量</th>
                <th className="px-2 py-3 text-right w-24">單價</th>
                <th className="px-2 py-3 text-right w-28">複價</th>
                <th className="px-2 py-3 text-center w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {organizedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <Layers size={32} className="mx-auto mb-2 opacity-50" />
                    <p>尚無工項</p>
                    <p className="text-sm">點擊上方按鈕新增章節或工項</p>
                  </td>
                </tr>
              ) : (
                organizedItems.map((item, index) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    level={item.level}
                    isEditing={isEditing}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                    onAddChild={handleAddItem}
                    onDuplicate={handleDuplicateItem}
                    isSelected={selectedItemId === item.id}
                    onSelect={setSelectedItemId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 金額摘要 */}
      <TotalsSummary totals={totals} />

      {/* 工項庫 Modal */}
      <CatalogSearchModal
        isOpen={showCatalog}
        onClose={() => setShowCatalog(false)}
        onSelect={handleAddFromCatalog}
      />
    </div>
  );
};

export default QuotationEditor;
