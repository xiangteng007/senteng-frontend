/**
 * QuotationList.tsx
 *
 * 報價清單側邊面板 - 顯示已選擇的智慧家居產品
 */

import React, { useState, memo } from 'react';
import {
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    FileSpreadsheet,
    X,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { useQuotationStore, type QuotationItem } from '../hooks/useQuotationStore';
import { smartHomeApi } from '../../../services/smartHomeApi';

// ==========================================
// Types
// ==========================================

interface QuotationListProps {
    isOpen: boolean;
    onClose: () => void;
}

interface QuotationItemRowProps {
    item: QuotationItem;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onUpdatePrice: (id: string, price: number) => void;
    onRemove: (id: string) => void;
}

// ==========================================
// Components
// ==========================================

const QuotationItemRow = memo<QuotationItemRowProps>(
    ({ item, onUpdateQuantity, onUpdatePrice, onRemove }) => {
        const subtotal = item.quantity * item.unitPrice;

        return (
            <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                        </h4>
                        {item.subcategory && (
                            <p className="text-xs text-gray-500">{item.subcategory}</p>
                        )}
                        {item.spec && (
                            <p className="text-xs text-gray-400 truncate">{item.spec}</p>
                        )}
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="移除"
                        aria-label="移除項目"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                    {/* Quantity */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            title="減少數量"
                            aria-label="減少數量"
                        >
                            <Minus size={12} />
                        </button>
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                                onUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                            }
                            min={1}
                            className="w-12 text-center text-sm border border-gray-200 rounded py-0.5"
                            title="數量"
                            aria-label="數量"
                        />
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            title="增加數量"
                            aria-label="增加數量"
                        >
                            <Plus size={12} />
                        </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">@</span>
                        <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                                onUpdatePrice(item.id, parseFloat(e.target.value) || 0)
                            }
                            min={0}
                            className="w-20 text-right text-sm border border-gray-200 rounded py-0.5"
                            title="單價"
                            aria-label="單價"
                        />
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                            ${subtotal.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);

QuotationItemRow.displayName = 'QuotationItemRow';

// ==========================================
// Main Component
// ==========================================

export const QuotationList: React.FC<QuotationListProps> = ({
    isOpen,
    onClose,
}) => {
    const {
        items,
        projectName,
        title,
        removeItem,
        updateQuantity,
        updatePrice,
        clearAll,
        setProjectName,
        setTitle,
        getTotalAmount,
        getItemCount,
        getExportItems,
    } = useQuotationStore();

    const [isExporting, setIsExporting] = useState(false);
    const [exportResult, setExportResult] = useState<{
        success: boolean;
        url?: string;
        error?: string;
    } | null>(null);

    const handleExport = async () => {
        if (items.length === 0) return;

        setIsExporting(true);
        setExportResult(null);

        try {
            const result = await smartHomeApi.exportToGoogleSheets({
                items: getExportItems(),
                options: {
                    title: title || '智慧家居報價清單',
                    projectName: projectName || undefined,
                },
            });

            if (result.success && result.spreadsheetUrl) {
                setExportResult({ success: true, url: result.spreadsheetUrl });
            } else {
                setExportResult({
                    success: false,
                    error: result.message || '匯出失敗',
                });
            }
        } catch (error) {
            setExportResult({
                success: false,
                error: error instanceof Error ? error.message : '匯出時發生錯誤',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const totalAmount = getTotalAmount();
    const itemCount = getItemCount();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-50 shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingCart size={20} />
                    <h2 className="font-semibold">報價清單</h2>
                    {itemCount > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {itemCount} 項
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title="關閉"
                    aria-label="關閉報價清單"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Options */}
            <div className="p-3 bg-white border-b border-gray-100 space-y-2">
                <div>
                    <label htmlFor="quotation-title" className="block text-xs text-gray-500 mb-1">報價單標題</label>
                    <input
                        id="quotation-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="智慧家居報價清單"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="project-name" className="block text-xs text-gray-500 mb-1">專案名稱</label>
                    <input
                        id="project-name"
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="選填"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {items.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                        <p>尚未加入任何產品</p>
                        <p className="text-sm">點擊產品卡片上的「加入報價」按鈕開始</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <QuotationItemRow
                            key={item.id}
                            item={item}
                            onUpdateQuantity={updateQuantity}
                            onUpdatePrice={updatePrice}
                            onRemove={removeItem}
                        />
                    ))
                )}
            </div>

            {/* Export Result */}
            {exportResult && (
                <div
                    className={`mx-3 mb-2 p-3 rounded-lg text-sm ${exportResult.success
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                >
                    {exportResult.success ? (
                        <div className="flex items-center justify-between">
                            <span>✓ 匯出成功</span>
                            <a
                                href={exportResult.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 underline hover:no-underline"
                            >
                                開啟試算表 <ChevronRight size={14} />
                            </a>
                        </div>
                    ) : (
                        <span>✗ {exportResult.error}</span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">總計</span>
                    <span className="text-xl font-bold text-gray-900">
                        NT$ {totalAmount.toLocaleString()}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={clearAll}
                        disabled={items.length === 0}
                        className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        清空
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={items.length === 0 || isExporting}
                        className="flex-[2] py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                匯出中...
                            </>
                        ) : (
                            <>
                                <FileSpreadsheet size={16} />
                                匯出 Google Sheets
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuotationList;
