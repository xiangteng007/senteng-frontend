/**
 * useQuotationStore.ts
 *
 * Zustand store for Smart Home quotation list management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==========================================
// Types (local to avoid circular imports)
// ==========================================

export interface SmartHomeProductRef {
    id: string;
    productId: string;
    name: string;
    nameCn?: string;
    category: string;
    subcategory?: string;
    brand: string;
    price?: number;
    imageUrl?: string;
    specifications?: Record<string, string>;
}

export interface QuotationItem {
    id: string;
    productId: string;
    name: string;
    subcategory?: string;
    spec?: string;
    quantity: number;
    unitPrice: number;
    product?: SmartHomeProductRef;
    addedAt: number;
}

export interface ExportSmartHomeItem {
    productId: string;
    name: string;
    subcategory?: string;
    spec?: string;
    quantity: number;
    unitPrice: number;
}

export interface QuotationState {
    items: QuotationItem[];
    projectName: string;
    title: string;
}

export interface QuotationActions {
    addItem: (product: SmartHomeProductRef, quantity?: number, customPrice?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    updatePrice: (id: string, price: number) => void;
    clearAll: () => void;
    setProjectName: (name: string) => void;
    setTitle: (title: string) => void;
    getTotalAmount: () => number;
    getItemCount: () => number;
    getExportItems: () => ExportSmartHomeItem[];
}

// ==========================================
// Store
// ==========================================

export const useQuotationStore = create<QuotationState & QuotationActions>()(
    persist(
        (set, get) => ({
            // State
            items: [],
            projectName: '',
            title: '智慧家居報價清單',

            // Actions
            addItem: (product, quantity = 1, customPrice) => {
                const existingIndex = get().items.findIndex(
                    (item) => item.productId === product.productId
                );

                if (existingIndex >= 0) {
                    // Update existing item quantity
                    set((state) => ({
                        items: state.items.map((item, idx) =>
                            idx === existingIndex
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    }));
                } else {
                    // Add new item
                    const newItem: QuotationItem = {
                        id: `${product.productId}-${Date.now()}`,
                        productId: product.productId,
                        name: product.nameCn || product.name,
                        subcategory: product.subcategory,
                        spec: product.specifications
                            ? Object.entries(product.specifications)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')
                            : undefined,
                        quantity,
                        unitPrice: customPrice ?? product.price ?? 0,
                        product,
                        addedAt: Date.now(),
                    };

                    set((state) => ({
                        items: [...state.items, newItem],
                    }));
                }
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                if (quantity < 1) return;
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                }));
            },

            updatePrice: (id, price) => {
                if (price < 0) return;
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, unitPrice: price } : item
                    ),
                }));
            },

            clearAll: () => {
                set({ items: [], projectName: '', title: '智慧家居報價清單' });
            },

            setProjectName: (name) => {
                set({ projectName: name });
            },

            setTitle: (title) => {
                set({ title });
            },

            getTotalAmount: () => {
                return get().items.reduce(
                    (total, item) => total + item.quantity * item.unitPrice,
                    0
                );
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },

            getExportItems: () => {
                return get().items.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    subcategory: item.subcategory,
                    spec: item.spec,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                }));
            },
        }),
        {
            name: 'smart-home-quotation',
            version: 1,
        }
    )
);

export default useQuotationStore;
