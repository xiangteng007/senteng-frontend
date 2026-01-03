/**
 * 模板工項編輯器
 * TemplateItemsEditor.jsx
 * 提供工項的新增、編輯、刪除功能
 */

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';

/**
 * 單一工項列
 */
const ItemRow = ({ item, index, onUpdate, onRemove }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleChange = (field, value) => {
        onUpdate(index, field, value);
    };

    const amount = (item.quantity || 0) * (item.unitPrice || 0);

    return (
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group">
            {/* 拖曳手柄 */}
            <div className="text-gray-300 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} />
            </div>

            {/* 序號 */}
            <div className="w-8 text-center text-xs text-gray-400 font-medium">
                {index + 1}
            </div>

            {/* 名稱 */}
            <input
                type="text"
                value={item.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="工項名稱"
                className="flex-1 min-w-[120px] px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            {/* 單位 */}
            <input
                type="text"
                value={item.unit || ''}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="單位"
                className="w-16 px-2 py-1.5 text-sm text-center border border-gray-200 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            {/* 數量 */}
            <input
                type="number"
                value={item.quantity || ''}
                onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                placeholder="數量"
                min="0"
                step="0.1"
                className="w-20 px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            {/* 單價 */}
            <input
                type="number"
                value={item.unitPrice || ''}
                onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
                placeholder="單價"
                min="0"
                className="w-24 px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            {/* 金額 (自動計算) */}
            <div className="w-24 text-sm text-right font-medium text-gray-700">
                ${formatCurrency(amount)}
            </div>

            {/* 刪除 */}
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="刪除此工項"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
};

/**
 * 章節區塊
 */
const ChapterSection = ({ chapter, chapterIndex, items, onUpdateItem, onRemoveItem, onAddItem }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const chapterItems = items.filter(item => item.chapterIndex === chapterIndex);
    const chapterTotal = chapterItems.reduce((sum, item) =>
        sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <div className="bg-gray-50 rounded-xl p-4">
            {/* 章節標題 */}
            <div
                className="flex items-center justify-between cursor-pointer mb-3"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <h4 className="font-semibold text-gray-800">{chapter}</h4>
                    <span className="text-xs text-gray-500">({chapterItems.length} 項)</span>
                </div>
                <div className="text-sm font-medium text-orange-600">
                    ${formatCurrency(chapterTotal)}
                </div>
            </div>

            {/* 工項列表 */}
            {isExpanded && (
                <div className="space-y-2">
                    {chapterItems.map((item, idx) => (
                        <ItemRow
                            key={item.id || idx}
                            item={item}
                            index={items.findIndex(i => i === item)}
                            onUpdate={onUpdateItem}
                            onRemove={onRemoveItem}
                        />
                    ))}

                    {/* 新增工項按鈕 */}
                    <button
                        type="button"
                        onClick={() => onAddItem(chapterIndex)}
                        className="w-full py-2 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 border border-dashed border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                        <Plus size={16} />
                        新增工項
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * 主編輯器元件
 */
const TemplateItemsEditor = ({ items = [], onChange, chapters = [] }) => {
    // 如果沒有指定章節，從 items 中推斷
    const uniqueChapters = chapters.length > 0
        ? chapters
        : [...new Set(items.map(item => item.chapter || '其他'))];

    // 計算總金額
    const totalAmount = items.reduce((sum, item) =>
        sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // 新增工項
    const handleAddItem = (chapterIndex = 0) => {
        const newItem = {
            id: `new-${Date.now()}`,
            chapterIndex,
            chapter: uniqueChapters[chapterIndex] || '其他',
            name: '',
            unit: '式',
            quantity: 1,
            unitPrice: 0,
            type: 'ITEM',
        };
        onChange([...items, newItem]);
    };

    // 移除工項
    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    // 更新工項
    const handleUpdateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange(newItems);
    };

    // 簡單列表模式（無章節分組）
    if (uniqueChapters.length <= 1 || !items.some(i => i.chapter)) {
        return (
            <div className="space-y-3">
                {/* 表頭 */}
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                    <div className="w-8"></div>
                    <div className="w-8">#</div>
                    <div className="flex-1 min-w-[120px]">名稱</div>
                    <div className="w-16 text-center">單位</div>
                    <div className="w-20 text-right">數量</div>
                    <div className="w-24 text-right">單價</div>
                    <div className="w-24 text-right">金額</div>
                    <div className="w-8"></div>
                </div>

                {/* 工項列表 */}
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <ItemRow
                            key={item.id || index}
                            item={item}
                            index={index}
                            onUpdate={handleUpdateItem}
                            onRemove={handleRemoveItem}
                        />
                    ))}
                </div>

                {/* 新增按鈕 */}
                <button
                    type="button"
                    onClick={() => handleAddItem()}
                    className="w-full py-3 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 border-2 border-dashed border-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    新增工項
                </button>

                {/* 總計 */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                    <div className="text-sm text-gray-600">
                        共 <span className="font-bold text-gray-800">{items.length}</span> 項工項
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">預估總金額</div>
                        <div className="text-xl font-bold text-orange-600">
                            {formatCurrency(totalAmount)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 章節分組模式
    return (
        <div className="space-y-4">
            {uniqueChapters.map((chapter, chapterIndex) => (
                <ChapterSection
                    key={chapter}
                    chapter={chapter}
                    chapterIndex={chapterIndex}
                    items={items}
                    onUpdateItem={handleUpdateItem}
                    onRemoveItem={handleRemoveItem}
                    onAddItem={handleAddItem}
                />
            ))}

            {/* 總計 */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="text-sm text-gray-600">
                    共 <span className="font-bold text-gray-800">{items.length}</span> 項工項
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500">預估總金額</div>
                    <div className="text-xl font-bold text-orange-600">
                        {formatCurrency(totalAmount)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateItemsEditor;
