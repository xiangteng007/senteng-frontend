/**
 * CategoryTabs.jsx
 * 
 * 統一導覽元件：L1 主分類 + L2 次分類
 * 用於工程估算工作區頂部框架
 */

import React from 'react';
import { Building2, Home, Layers, Hammer, Grid3X3, Paintbrush, Mountain } from 'lucide-react';

// ============================================
// 分類定義
// ============================================

export const CATEGORY_L1 = [
    {
        id: 'construction',
        label: '營建工程',
        icon: Building2,
        desc: '結構、鋼筋、混凝土、模板'
    },
    {
        id: 'interior',
        label: '室內裝潢',
        icon: Home,
        desc: '油漆、木作、泥作、水電'
    },
];

export const CATEGORY_L2 = {
    construction: [
        { id: 'concrete', label: '混凝土', icon: Layers },
        { id: 'rebar', label: '鋼筋', icon: Grid3X3 },
        { id: 'formwork', label: '模板', icon: Grid3X3 },
        { id: 'masonry', label: '泥作工程', icon: Hammer },
        { id: 'tile', label: '磁磚工程', icon: Grid3X3 },
        { id: 'coating', label: '塗料工程', icon: Paintbrush },
        { id: 'waterproof', label: '防水工程', icon: Layers },
        { id: 'window', label: '門窗工程', icon: Grid3X3 },
        { id: 'demolition', label: '拆除清運', icon: Hammer },
        { id: 'overview', label: '建築概估', icon: Mountain },
    ],
    interior: [
        { id: 'paint', label: '油漆', icon: Paintbrush },
        { id: 'woodwork', label: '木作', icon: Hammer },
        { id: 'cabinet', label: '系統櫃', icon: Grid3X3 },
        { id: 'electrical', label: '水電', icon: Grid3X3 },
        { id: 'flooring', label: '地板', icon: Layers },
        { id: 'glass', label: '玻璃', icon: Grid3X3 },
    ],
};

// ============================================
// L1 Tabs (主分類)
// ============================================

export const CategoryTabsL1 = ({ selected, onSelect, className = '' }) => {
    return (
        <div className={`flex gap-1 p-1 bg-gray-100 rounded-lg ${className}`}>
            {CATEGORY_L1.map(cat => {
                const Icon = cat.icon;
                const isActive = selected === cat.id;
                return (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${isActive
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }
            `}
                    >
                        <Icon size={16} />
                        <span>{cat.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

// ============================================
// L2 Tabs (次分類)
// ============================================

export const CategoryTabsL2 = ({ categoryL1, selected, onSelect, className = '' }) => {
    const items = CATEGORY_L2[categoryL1] || [];

    if (items.length === 0) return null;

    return (
        <div className={`flex gap-1 overflow-x-auto no-scrollbar ${className}`}>
            {items.map(item => {
                const Icon = item.icon;
                const isActive = selected === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all
              ${isActive
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                            }
            `}
                    >
                        <Icon size={14} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

// ============================================
// 整合元件（同時顯示 L1 + L2）
// ============================================

const CategoryTabs = ({
    selectedL1,
    selectedL2,
    onSelectL1,
    onSelectL2,
    className = ''
}) => {
    const handleL1Change = (newL1) => {
        onSelectL1(newL1);
        // 切換 L1 時，自動選擇新 L1 的第一個 L2
        const firstL2 = CATEGORY_L2[newL1]?.[0]?.id;
        if (firstL2) {
            onSelectL2(firstL2);
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Level 1 */}
            <CategoryTabsL1
                selected={selectedL1}
                onSelect={handleL1Change}
            />

            {/* Level 2 */}
            <CategoryTabsL2
                categoryL1={selectedL1}
                selected={selectedL2}
                onSelect={onSelectL2}
            />
        </div>
    );
};

export default CategoryTabs;
