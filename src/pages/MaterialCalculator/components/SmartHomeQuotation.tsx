/**
 * SmartHomeQuotation.tsx
 *
 * 智慧家居報價頁面 - 瀏覽產品並建立報價清單
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    Home,
    Search,
    Filter,
    ShoppingCart,
    Plus,
    RefreshCw,
    Grid,
    List,
    Tag,
    ExternalLink,
} from 'lucide-react';
import {
    smartHomeApi,
    type SmartHomeProduct,
    type CategoryCount,
} from '../../../services/smartHomeApi';
import { useQuotationStore } from '../hooks/useQuotationStore';
import { QuotationList } from './QuotationList';

// ==========================================
// Types
// ==========================================

interface ProductCardProps {
    product: SmartHomeProduct;
    onAddToQuotation: (product: SmartHomeProduct) => void;
}

// ==========================================
// Components
// ==========================================

const ProductCard = memo<ProductCardProps>(({ product, onAddToQuotation }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Image */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.imageUrl && !imageError ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Home size={48} />
                    </div>
                )}

                {/* Platform badges */}
                {product.supportedPlatforms && product.supportedPlatforms.length > 0 && (
                    <div className="absolute top-2 left-2 flex gap-1">
                        {product.supportedPlatforms.slice(0, 2).map((platform) => (
                            <span
                                key={platform}
                                className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] rounded"
                            >
                                {platform}
                            </span>
                        ))}
                    </div>
                )}

                {/* Availability */}
                {!product.isAvailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            暫無庫存
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {product.nameCn || product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {product.brand} · {product.subcategory}
                        </p>
                    </div>
                    {product.productUrl && (
                        <a
                            href={product.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-orange-500"
                            title="查看商品"
                            aria-label={`查看 ${product.name} 商品頁面`}
                        >
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>

                {/* Price */}
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {product.price ? (
                            <>
                                <span className="text-lg font-bold text-orange-600">
                                    ¥{product.price.toLocaleString()}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xs text-gray-400 line-through">
                                        ¥{product.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-sm text-gray-400">價格洽詢</span>
                        )}
                    </div>

                    <button
                        onClick={() => onAddToQuotation(product)}
                        disabled={!product.isAvailable}
                        className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                        aria-label={`加入 ${product.name} 到報價清單`}
                    >
                        <Plus size={12} />
                        加入
                    </button>
                </div>
            </div>
        </div>
    );
});

ProductCard.displayName = 'ProductCard';

// Loading skeleton
const ProductSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200" />
        <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
        </div>
    </div>
);

// ==========================================
// Main Component
// ==========================================

export const SmartHomeQuotation: React.FC = () => {
    // State
    const [products, setProducts] = useState<SmartHomeProduct[]>([]);
    const [categories, setCategories] = useState<CategoryCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showQuotationList, setShowQuotationList] = useState(false);

    // Store
    const { addItem, getItemCount } = useQuotationStore();
    const itemCount = getItemCount();

    // Load products
    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string> = {};
            if (searchQuery) params.search = searchQuery;
            if (selectedCategory) params.category = selectedCategory;

            const data = await smartHomeApi.getProducts(params);
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    // Load categories
    const loadCategories = useCallback(async () => {
        try {
            const data = await smartHomeApi.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [loadProducts, loadCategories]);

    // Handle sync
    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await smartHomeApi.triggerSync();
            await loadProducts();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Handle add to quotation
    const handleAddToQuotation = (product: SmartHomeProduct) => {
        addItem(product);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Title */}
                        <div className="flex items-center gap-2">
                            <Home className="text-orange-500" size={24} />
                            <h1 className="text-lg font-bold text-gray-900">智慧家居報價</h1>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="同步產品資料"
                                aria-label="同步產品資料"
                            >
                                <RefreshCw
                                    size={18}
                                    className={isSyncing ? 'animate-spin' : ''}
                                />
                            </button>

                            <button
                                onClick={() => setShowQuotationList(true)}
                                className="relative p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                title="報價清單"
                                aria-label={`報價清單 (${itemCount} 項)`}
                            >
                                <ShoppingCart size={18} />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="mt-3 flex items-center gap-3">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="搜尋產品..."
                                aria-label="搜尋產品"
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <Filter
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                aria-label="選擇分類"
                                title="選擇分類"
                                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500 appearance-none"
                            >
                                <option value="">全部分類</option>
                                {categories.map((cat) => (
                                    <option key={cat.category} value={cat.category}>
                                        {cat.category} ({cat.count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid'
                                        ? 'bg-white shadow text-orange-500'
                                        : 'text-gray-500'
                                    }`}
                                title="網格檢視"
                                aria-label="網格檢視"
                                aria-pressed={viewMode === 'grid'}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded ${viewMode === 'list'
                                        ? 'bg-white shadow text-orange-500'
                                        : 'text-gray-500'
                                    }`}
                                title="清單檢視"
                                aria-label="清單檢視"
                                aria-pressed={viewMode === 'list'}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div
                        className={`grid gap-4 ${viewMode === 'grid'
                                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                                : 'grid-cols-1'
                            }`}
                    >
                        {Array.from({ length: 10 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <Tag size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-600">找不到產品</h3>
                        <p className="text-gray-400 mt-1">
                            {searchQuery || selectedCategory
                                ? '請嘗試調整搜尋條件'
                                : '點擊上方同步按鈕取得最新產品'}
                        </p>
                    </div>
                ) : (
                    <div
                        className={`grid gap-4 ${viewMode === 'grid'
                                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                                : 'grid-cols-1'
                            }`}
                    >
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToQuotation={handleAddToQuotation}
                            />
                        ))}
                    </div>
                )}

                {/* Product count */}
                {!isLoading && products.length > 0 && (
                    <div className="mt-6 text-center text-sm text-gray-500">
                        共 {products.length} 項產品
                    </div>
                )}
            </div>

            {/* Quotation List Overlay */}
            {showQuotationList && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowQuotationList(false)}
                    role="presentation"
                />
            )}

            {/* Quotation List Panel */}
            <QuotationList
                isOpen={showQuotationList}
                onClose={() => setShowQuotationList(false)}
            />

            {/* Floating Cart Button (Mobile) */}
            {itemCount > 0 && !showQuotationList && (
                <button
                    onClick={() => setShowQuotationList(true)}
                    className="fixed bottom-6 right-6 lg:hidden p-4 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all z-30"
                    aria-label={`開啟報價清單 (${itemCount} 項)`}
                >
                    <ShoppingCart size={24} />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {itemCount > 99 ? '99+' : itemCount}
                    </span>
                </button>
            )}
        </div>
    );
};

export default SmartHomeQuotation;
