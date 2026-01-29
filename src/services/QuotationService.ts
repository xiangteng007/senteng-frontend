/**
 * QuotationService.ts
 *
 * 估價單系統服務層 (QuotationService)
 * 處理估價單的 CRUD、版本管理、審批流程
 *
 * ⚠️ 已整合 Backend API - 資料儲存於 PostgreSQL
 */

import { quotationsApi } from './api';

// ==========================================
// Types
// ==========================================

export type QuotationStatusType =
    | 'DRAFT'
    | 'PENDING'
    | 'REJECTED'
    | 'APPROVED'
    | 'SENT'
    | 'ACCEPTED'
    | 'DECLINED'
    | 'CONVERTED'
    | 'VOIDED';

export type ItemType = 'CHAPTER' | 'SECTION' | 'ITEM' | 'SUBTOTAL';
export type SupplyType = 'CONTRACTOR' | 'OWNER';
export type TaxType = 'INCLUSIVE' | 'EXCLUSIVE';

export interface QuotationSettings {
    taxRate?: number;
    managementFee?: number;
    profitRate?: number;
    validDays?: number;
    currency?: string;
    discountRate?: number;
    discountAmount?: number;
    managementFeeRate?: number;
    taxType?: TaxType;
}

export interface QuotationItem {
    id: string;
    parentId?: string | null;
    itemCode: string;
    type: ItemType;
    name: string;
    specification?: string;
    unit?: string;
    quantity: number;
    unitPrice: number;
    costPrice?: number;
    amount: number;
    supplyType: SupplyType;
    isOptional?: boolean;
    remark?: string;
    sortOrder: number;
    category?: string;
    children?: QuotationItem[];
}

export interface Quotation {
    id: string;
    quotationNo: string;
    projectId: string;
    title: string;
    status: QuotationStatusType;
    version: number;
    currency: string;
    isTaxIncluded: boolean;
    taxRate: number;
    validUntil: string;
    notes?: string;
    items: QuotationItem[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface QuotationFilters {
    projectId?: string;
    status?: QuotationStatusType;
}

export interface QuotationTotals {
    subtotal: number;
    costTotal: number;
    discountAmount: number;
    afterDiscount: number;
    managementFee: number;
    profitAmount: number;
    beforeTax: number;
    taxAmount: number;
    totalAmount: number;
    profitRate: string;
}

export interface CatalogCategory {
    id: string;
    name: string;
    icon: string;
}

export interface CatalogItem {
    id: string;
    category: string;
    name: string;
    unit: string;
    refPrice: number;
    costPrice: number;
}

export interface QuotationTemplate {
    id: string;
    name: string;
    projectType: string;
    description: string;
    items: TemplateItem[];
}

export interface TemplateItem {
    type: ItemType;
    name: string;
    unit?: string;
    unitPrice?: number;
    quantity?: number;
    specification?: string;
    costPrice?: number;
    children?: TemplateItem[];
}

export interface CreateQuotationData {
    projectId: string;
    title?: string;
    currency?: string;
    taxType?: TaxType;
    taxRate?: number;
    validUntil?: string;
    description?: string;
    notes?: string;
    items?: Partial<QuotationItem>[];
}

// ==========================================
// Constants
// ==========================================

export const QUOTATION_STATUS: Record<string, QuotationStatusType> = {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    REJECTED: 'REJECTED',
    APPROVED: 'APPROVED',
    SENT: 'SENT',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    CONVERTED: 'CONVERTED',
    VOIDED: 'VOIDED',
};

export const QUOTATION_STATUS_LABELS: Record<QuotationStatusType, string> = {
    DRAFT: '草稿',
    PENDING: '待審核',
    REJECTED: '退回修正',
    APPROVED: '已核准',
    SENT: '已送客戶',
    ACCEPTED: '客戶接受',
    DECLINED: '客戶拒絕',
    CONVERTED: '已轉合約',
    VOIDED: '作廢',
};

export const QUOTATION_STATUS_COLORS: Record<QuotationStatusType, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
    APPROVED: 'bg-green-100 text-green-700',
    SENT: 'bg-blue-100 text-blue-700',
    ACCEPTED: 'bg-emerald-100 text-emerald-700',
    DECLINED: 'bg-orange-100 text-orange-700',
    CONVERTED: 'bg-purple-100 text-purple-700',
    VOIDED: 'bg-gray-200 text-gray-500',
};

export const ITEM_TYPES: Record<string, ItemType> = {
    CHAPTER: 'CHAPTER',
    SECTION: 'SECTION',
    ITEM: 'ITEM',
    SUBTOTAL: 'SUBTOTAL',
};

export const SUPPLY_TYPES: Record<string, SupplyType> = {
    CONTRACTOR: 'CONTRACTOR',
    OWNER: 'OWNER',
};

export const TAX_TYPES: Record<string, TaxType> = {
    INCLUSIVE: 'INCLUSIVE',
    EXCLUSIVE: 'EXCLUSIVE',
};

export const DEFAULT_SETTINGS: Required<
    Pick<QuotationSettings, 'taxRate' | 'managementFee' | 'profitRate' | 'validDays' | 'currency'>
> = {
    taxRate: 5,
    managementFee: 10,
    profitRate: 15,
    validDays: 30,
    currency: 'TWD',
};

export const CATALOG_CATEGORIES: CatalogCategory[] = [
    { id: 'demolition', name: '拆除工程', icon: '🔨' },
    { id: 'masonry', name: '泥作工程', icon: '🧱' },
    { id: 'plumbing', name: '水電工程', icon: '🔧' },
    { id: 'woodwork', name: '木作工程', icon: '🪵' },
    { id: 'painting', name: '油漆工程', icon: '🎨' },
    { id: 'flooring', name: '地板工程', icon: '🏠' },
    { id: 'ceiling', name: '天花板工程', icon: '💡' },
    { id: 'doors', name: '門窗工程', icon: '🚪' },
    { id: 'kitchen', name: '廚具工程', icon: '🍳' },
    { id: 'bathroom', name: '衛浴工程', icon: '🚿' },
    { id: 'aircon', name: '空調工程', icon: '❄️' },
    { id: 'furniture', name: '系統櫃/傢俱', icon: '🛋️' },
    { id: 'cleaning', name: '清潔工程', icon: '🧹' },
    { id: 'temporary', name: '假設工程', icon: '🚧' },
    { id: 'foundation', name: '基礎工程', icon: '🏗️' },
    { id: 'structure', name: '結構工程', icon: '🏛️' },
    { id: 'steel', name: '鋼構工程', icon: '⚙️' },
    { id: 'reinforcement', name: '結構補強', icon: '🔩' },
    { id: 'waterproof', name: '防水工程', icon: '💧' },
    { id: 'exterior', name: '外牆工程', icon: '🧊' },
    { id: 'roof', name: '屋頂工程', icon: '🏚️' },
    { id: 'fire', name: '消防工程', icon: '🔥' },
    { id: 'environment', name: '環境工程', icon: '🌿' },
    { id: 'other', name: '其他', icon: '📦' },
];

// Default catalog items (abbreviated - full list in JS version)
export const DEFAULT_CATALOG_ITEMS: CatalogItem[] = [
    { id: 'demo-001', category: 'demolition', name: '地板拆除', unit: '坪', refPrice: 1500, costPrice: 1200 },
    { id: 'demo-002', category: 'demolition', name: '牆面拆除', unit: '坪', refPrice: 2000, costPrice: 1600 },
    { id: 'mason-001', category: 'masonry', name: '地坪粉光', unit: '坪', refPrice: 2500, costPrice: 2000 },
    { id: 'plumb-001', category: 'plumbing', name: '冷熱水管配置', unit: '點', refPrice: 3500, costPrice: 2800 },
    { id: 'wood-001', category: 'woodwork', name: '木作天花板 (平釘)', unit: '坪', refPrice: 3500, costPrice: 2800 },
    { id: 'paint-001', category: 'painting', name: '乳膠漆 (牆面)', unit: '坪', refPrice: 1200, costPrice: 900 },
];

// Template placeholder - full templates in JS version
export const QUOTATION_TEMPLATES: QuotationTemplate[] = [
    {
        id: 'tpl-residential',
        name: '住宅裝修標準版',
        projectType: 'RESIDENTIAL',
        description: '適用於一般住宅裝修，包含基本工項',
        items: [
            {
                type: 'CHAPTER',
                name: '一、拆除工程',
                children: [
                    { type: 'ITEM', name: '地板拆除', unit: '坪', unitPrice: 1500 },
                    { type: 'ITEM', name: '牆面拆除', unit: '坪', unitPrice: 2000 },
                ],
            },
        ],
    },
];

// ==========================================
// Utility Functions
// ==========================================

export const generateQuotationNo = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q${year}-${random}`;
};

export const generateItemCode = (parentCode: string, index: number): string => {
    if (!parentCode) return `${index + 1}`;
    return `${parentCode}.${index + 1}`;
};

export const calculateLineAmount = (quantity: number | string, unitPrice: number | string): number => {
    const qty = parseFloat(String(quantity)) || 0;
    const price = parseFloat(String(unitPrice)) || 0;
    return Math.round(qty * price);
};

export const calculateQuotationTotals = (
    items: QuotationItem[],
    settings: QuotationSettings = {}
): QuotationTotals => {
    const {
        discountRate = 0,
        discountAmount = 0,
        managementFeeRate = DEFAULT_SETTINGS.managementFee,
        profitRate = DEFAULT_SETTINGS.profitRate,
        taxRate = DEFAULT_SETTINGS.taxRate,
        taxType = TAX_TYPES.INCLUSIVE,
    } = settings;

    const subtotal = items
        .filter(item => item.type === ITEM_TYPES.ITEM && item.supplyType !== SUPPLY_TYPES.OWNER)
        .reduce((sum, item) => sum + calculateLineAmount(item.quantity, item.unitPrice), 0);

    const costTotal = items
        .filter(item => item.type === ITEM_TYPES.ITEM && item.supplyType !== SUPPLY_TYPES.OWNER)
        .reduce((sum, item) => sum + calculateLineAmount(item.quantity, item.costPrice || 0), 0);

    const discountAmt = discountAmount || Math.round((subtotal * discountRate) / 100);
    const afterDiscount = subtotal - discountAmt;
    const managementFee = Math.round((afterDiscount * managementFeeRate) / 100);
    const profitAmount = Math.round(((afterDiscount + managementFee) * profitRate) / 100);
    const beforeTax = afterDiscount + managementFee + profitAmount;

    let taxAmount = 0;
    let totalAmount = beforeTax;

    if (taxType === TAX_TYPES.EXCLUSIVE) {
        taxAmount = Math.round((beforeTax * taxRate) / 100);
        totalAmount = beforeTax + taxAmount;
    } else {
        taxAmount = Math.round((beforeTax * taxRate) / (100 + taxRate));
    }

    const profitRateActual = costTotal > 0 ? ((totalAmount - costTotal) / totalAmount) * 100 : 0;

    return {
        subtotal,
        costTotal,
        discountAmount: discountAmt,
        afterDiscount,
        managementFee,
        profitAmount,
        beforeTax,
        taxAmount,
        totalAmount,
        profitRate: profitRateActual.toFixed(1),
    };
};

export const applyTemplate = (template: QuotationTemplate): QuotationItem[] => {
    const items: QuotationItem[] = [];
    let itemId = 1;

    const processItems = (
        templateItems: TemplateItem[],
        parentId: string | null = null,
        parentCode = ''
    ): void => {
        templateItems.forEach((tplItem, index) => {
            const code = generateItemCode(parentCode, index);
            const item: QuotationItem = {
                id: `item-${itemId++}`,
                parentId,
                itemCode: code,
                type: tplItem.type,
                name: tplItem.name,
                specification: tplItem.specification || '',
                unit: tplItem.unit || '',
                quantity: tplItem.quantity || 0,
                unitPrice: tplItem.unitPrice || 0,
                costPrice: tplItem.costPrice || Math.round((tplItem.unitPrice || 0) * 0.8),
                amount: 0,
                supplyType: SUPPLY_TYPES.CONTRACTOR,
                isOptional: false,
                remark: '',
                sortOrder: items.length,
            };
            items.push(item);

            if (tplItem.children && tplItem.children.length > 0) {
                processItems(tplItem.children, item.id, code);
            }
        });
    };

    processItems(template.items);
    return items;
};

// ==========================================
// Service Class
// ==========================================

class QuotationServiceClass {
    private catalogKey = 'senteng_catalog';

    async getQuotations(filters: QuotationFilters = {}): Promise<Quotation[]> {
        try {
            const params: Record<string, string> = {};
            if (filters.projectId) params.projectId = filters.projectId;
            if (filters.status) params.status = filters.status;

            return await quotationsApi.getAll(params);
        } catch (error) {
            console.error('Failed to get quotations:', error);
            return [];
        }
    }

    async getQuotation(id: string): Promise<Quotation | null> {
        try {
            return await quotationsApi.getById(id);
        } catch (error) {
            console.error('Failed to get quotation:', error);
            return null;
        }
    }

    async getVersions(id: string): Promise<Quotation[]> {
        try {
            return await quotationsApi.getVersions(id);
        } catch (error) {
            console.error('Failed to get versions:', error);
            return [];
        }
    }

    async createQuotation(data: CreateQuotationData): Promise<Quotation> {
        const transformedItems = (data.items || [])
            .filter(item => item.type === 'ITEM' || !item.type)
            .map((item, index) => ({
                itemOrder: index + 1,
                category: item.category || '',
                itemName: item.name || '未命名工項',
                spec: item.specification || '',
                unit: item.unit || '式',
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                amount: item.amount || (item.quantity || 1) * (item.unitPrice || 0),
                remark: item.remark || '',
            }));

        const payload = {
            projectId: data.projectId,
            title: data.title || '新估價單',
            currency: data.currency || DEFAULT_SETTINGS.currency,
            isTaxIncluded: data.taxType !== TAX_TYPES.EXCLUSIVE,
            taxRate: data.taxRate || DEFAULT_SETTINGS.taxRate,
            validUntil:
                data.validUntil ||
                new Date(Date.now() + DEFAULT_SETTINGS.validDays * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
            notes: data.description || data.notes || '',
            items: transformedItems,
        };

        return await quotationsApi.create(payload);
    }

    async updateQuotation(id: string, data: Partial<Quotation>): Promise<Quotation> {
        return await quotationsApi.update(id, data);
    }

    async submitForReview(id: string): Promise<Quotation> {
        return await quotationsApi.submit(id);
    }

    async approve(id: string): Promise<Quotation> {
        return await quotationsApi.approve(id);
    }

    async reject(id: string, reason: string): Promise<Quotation> {
        return await quotationsApi.reject(id, reason);
    }

    async createNewVersion(id: string): Promise<Quotation> {
        return await quotationsApi.createNewVersion(id);
    }

    async changeStatus(id: string, newStatus: QuotationStatusType, note = ''): Promise<Quotation> {
        return this.updateQuotation(id, {
            status: newStatus,
            notes: note,
        } as Partial<Quotation>);
    }

    async getCatalogItems(): Promise<CatalogItem[]> {
        try {
            const data = localStorage.getItem(this.catalogKey);
            return data ? JSON.parse(data) : DEFAULT_CATALOG_ITEMS;
        } catch {
            return DEFAULT_CATALOG_ITEMS;
        }
    }

    async searchCatalog(keyword: string, category: string | null = null): Promise<CatalogItem[]> {
        const items = await this.getCatalogItems();
        return items.filter(item => {
            const matchKeyword = !keyword || item.name.includes(keyword) || item.id.includes(keyword);
            const matchCategory = !category || item.category === category;
            return matchKeyword && matchCategory;
        });
    }
}

export const QuotationService = new QuotationServiceClass();
export default QuotationService;
