/**
 * 估價單系統服務層 (QuotationService)
 * 處理估價單的 CRUD、版本管理、審批流程
 */

import { GoogleService } from './GoogleService';

// ============================================
// 常數定義
// ============================================

// 估價單狀態
export const QUOTATION_STATUS = {
    DRAFT: 'DRAFT',           // 草稿
    PENDING: 'PENDING',       // 待審
    REJECTED: 'REJECTED',     // 退回
    APPROVED: 'APPROVED',     // 已核准
    SENT: 'SENT',             // 已送客
    ACCEPTED: 'ACCEPTED',     // 客戶接受
    DECLINED: 'DECLINED',     // 客戶拒絕
    CONVERTED: 'CONVERTED',   // 已轉換
    VOIDED: 'VOIDED',         // 作廢
};

export const QUOTATION_STATUS_LABELS = {
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

export const QUOTATION_STATUS_COLORS = {
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

// 工項類型
export const ITEM_TYPES = {
    CHAPTER: 'CHAPTER',   // 章 (第一層)
    SECTION: 'SECTION',   // 節 (第二層)
    ITEM: 'ITEM',         // 項 (第三層/明細)
    SUBTOTAL: 'SUBTOTAL', // 小計行
};

// 供料方式
export const SUPPLY_TYPES = {
    CONTRACTOR: 'CONTRACTOR', // 乙供 (包商提供)
    OWNER: 'OWNER',           // 甲供 (業主提供)
};

// 稅別
export const TAX_TYPES = {
    INCLUSIVE: 'INCLUSIVE', // 含稅
    EXCLUSIVE: 'EXCLUSIVE', // 未稅
};

// 預設設定
export const DEFAULT_SETTINGS = {
    taxRate: 5,           // 營業稅率 5%
    managementFee: 10,    // 管理費 10%
    profitRate: 15,       // 利潤率 15%
    validDays: 30,        // 報價有效期 30天
    currency: 'TWD',
};

// ============================================
// 工項庫分類
// ============================================

export const CATALOG_CATEGORIES = [
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
    { id: 'other', name: '其他', icon: '📦' },
];

// ============================================
// 常用工項庫 (預設)
// ============================================

export const DEFAULT_CATALOG_ITEMS = [
    // 拆除工程
    { id: 'demo-001', category: 'demolition', name: '地板拆除', unit: '坪', refPrice: 1500, costPrice: 1200 },
    { id: 'demo-002', category: 'demolition', name: '牆面拆除', unit: '坪', refPrice: 2000, costPrice: 1600 },
    { id: 'demo-003', category: 'demolition', name: '天花板拆除', unit: '坪', refPrice: 800, costPrice: 600 },
    { id: 'demo-004', category: 'demolition', name: '廢料清運', unit: '車', refPrice: 8000, costPrice: 6000 },
    // 泥作工程
    { id: 'mason-001', category: 'masonry', name: '地坪粉光', unit: '坪', refPrice: 2500, costPrice: 2000 },
    { id: 'mason-002', category: 'masonry', name: '牆面粉刷', unit: '坪', refPrice: 1800, costPrice: 1400 },
    { id: 'mason-003', category: 'masonry', name: '磁磚鋪設 (30x60)', unit: '坪', refPrice: 4500, costPrice: 3600 },
    { id: 'mason-004', category: 'masonry', name: '防水工程', unit: '坪', refPrice: 3000, costPrice: 2400 },
    // 水電工程
    { id: 'plumb-001', category: 'plumbing', name: '冷熱水管配置', unit: '點', refPrice: 3500, costPrice: 2800 },
    { id: 'plumb-002', category: 'plumbing', name: '排水管配置', unit: '點', refPrice: 3000, costPrice: 2400 },
    { id: 'plumb-003', category: 'plumbing', name: '電路配線', unit: '迴路', refPrice: 4500, costPrice: 3600 },
    { id: 'plumb-004', category: 'plumbing', name: '開關插座安裝', unit: '組', refPrice: 800, costPrice: 600 },
    // 木作工程
    { id: 'wood-001', category: 'woodwork', name: '木作天花板 (平釘)', unit: '坪', refPrice: 3500, costPrice: 2800 },
    { id: 'wood-002', category: 'woodwork', name: '木作天花板 (造型)', unit: '坪', refPrice: 5500, costPrice: 4400 },
    { id: 'wood-003', category: 'woodwork', name: '木作隔間牆', unit: '坪', refPrice: 4000, costPrice: 3200 },
    { id: 'wood-004', category: 'woodwork', name: '木作門框', unit: '樘', refPrice: 8000, costPrice: 6400 },
    // 油漆工程
    { id: 'paint-001', category: 'painting', name: '乳膠漆 (牆面)', unit: '坪', refPrice: 1200, costPrice: 900 },
    { id: 'paint-002', category: 'painting', name: '乳膠漆 (天花)', unit: '坪', refPrice: 1000, costPrice: 750 },
    { id: 'paint-003', category: 'painting', name: '批土整平', unit: '坪', refPrice: 800, costPrice: 600 },
    // 其他
    { id: 'clean-001', category: 'cleaning', name: '細部清潔', unit: '式', refPrice: 15000, costPrice: 12000 },
];

// ============================================
// 估價單模板
// ============================================

export const QUOTATION_TEMPLATES = [
    {
        id: 'tpl-residential',
        name: '住宅裝修標準版',
        projectType: 'RESIDENTIAL',
        description: '適用於一般住宅裝修，包含基本工項',
        items: [
            {
                type: 'CHAPTER', name: '一、拆除工程', children: [
                    { type: 'ITEM', name: '地板拆除', unit: '坪', unitPrice: 1500 },
                    { type: 'ITEM', name: '牆面拆除', unit: '坪', unitPrice: 2000 },
                    { type: 'ITEM', name: '廢料清運', unit: '車', unitPrice: 8000 },
                ]
            },
            {
                type: 'CHAPTER', name: '二、水電工程', children: [
                    { type: 'ITEM', name: '冷熱水管配置', unit: '點', unitPrice: 3500 },
                    { type: 'ITEM', name: '電路配線', unit: '迴路', unitPrice: 4500 },
                ]
            },
            {
                type: 'CHAPTER', name: '三、泥作工程', children: [
                    { type: 'ITEM', name: '地坪粉光', unit: '坪', unitPrice: 2500 },
                    { type: 'ITEM', name: '防水工程', unit: '坪', unitPrice: 3000 },
                    { type: 'ITEM', name: '磁磚鋪設', unit: '坪', unitPrice: 4500 },
                ]
            },
            {
                type: 'CHAPTER', name: '四、木作工程', children: [
                    { type: 'ITEM', name: '木作天花板', unit: '坪', unitPrice: 3500 },
                    { type: 'ITEM', name: '木作隔間', unit: '坪', unitPrice: 4000 },
                ]
            },
            {
                type: 'CHAPTER', name: '五、油漆工程', children: [
                    { type: 'ITEM', name: '批土整平', unit: '坪', unitPrice: 800 },
                    { type: 'ITEM', name: '乳膠漆', unit: '坪', unitPrice: 1200 },
                ]
            },
            {
                type: 'CHAPTER', name: '六、清潔工程', children: [
                    { type: 'ITEM', name: '細部清潔', unit: '式', unitPrice: 15000 },
                ]
            },
        ],
    },
    {
        id: 'tpl-commercial',
        name: '商空裝修版',
        projectType: 'COMMERCIAL',
        description: '適用於商業空間，著重水電與空調',
        items: [],
    },
    {
        id: 'tpl-minimal',
        name: '輕裝修版',
        projectType: 'MINIMAL',
        description: '簡易翻新，油漆+清潔為主',
        items: [],
    },
];

// ============================================
// 工具函數
// ============================================

/**
 * 生成估價單編號
 */
export const generateQuotationNo = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q${year}-${random}`;
};

/**
 * 生成項次編號
 */
export const generateItemCode = (parentCode, index) => {
    if (!parentCode) return `${index + 1}`;
    return `${parentCode}.${index + 1}`;
};

/**
 * 計算單行複價
 */
export const calculateLineAmount = (quantity, unitPrice) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return Math.round(qty * price);
};

/**
 * 計算估價單總金額
 */
export const calculateQuotationTotals = (items, settings = {}) => {
    const {
        discountRate = 0,
        discountAmount = 0,
        managementFeeRate = DEFAULT_SETTINGS.managementFee,
        profitRate = DEFAULT_SETTINGS.profitRate,
        taxRate = DEFAULT_SETTINGS.taxRate,
        taxType = TAX_TYPES.INCLUSIVE,
    } = settings;

    // 計算工項小計
    const subtotal = items
        .filter(item => item.type === ITEM_TYPES.ITEM && item.supplyType !== SUPPLY_TYPES.OWNER)
        .reduce((sum, item) => sum + calculateLineAmount(item.quantity, item.unitPrice), 0);

    // 計算成本總計
    const costTotal = items
        .filter(item => item.type === ITEM_TYPES.ITEM && item.supplyType !== SUPPLY_TYPES.OWNER)
        .reduce((sum, item) => sum + calculateLineAmount(item.quantity, item.costPrice || 0), 0);

    // 折扣
    const discountAmt = discountAmount || Math.round(subtotal * discountRate / 100);
    const afterDiscount = subtotal - discountAmt;

    // 管理費
    const managementFee = Math.round(afterDiscount * managementFeeRate / 100);

    // 利潤
    const profitAmount = Math.round((afterDiscount + managementFee) * profitRate / 100);

    // 稅前總計
    const beforeTax = afterDiscount + managementFee + profitAmount;

    // 稅額
    let taxAmount = 0;
    let totalAmount = beforeTax;

    if (taxType === TAX_TYPES.EXCLUSIVE) {
        taxAmount = Math.round(beforeTax * taxRate / 100);
        totalAmount = beforeTax + taxAmount;
    } else {
        // 含稅 - 反算稅額
        taxAmount = Math.round(beforeTax * taxRate / (100 + taxRate));
    }

    // 毛利率
    const profitRateActual = costTotal > 0 ? ((totalAmount - costTotal) / totalAmount * 100) : 0;

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

/**
 * 套用模板生成工項
 */
export const applyTemplate = (template) => {
    const items = [];
    let itemId = 1;

    const processItems = (templateItems, parentId = null, parentCode = '') => {
        templateItems.forEach((tplItem, index) => {
            const code = generateItemCode(parentCode, index);
            const item = {
                id: `item-${itemId++}`,
                parentId,
                itemCode: code,
                type: tplItem.type,
                name: tplItem.name,
                specification: tplItem.specification || '',
                unit: tplItem.unit || '',
                quantity: tplItem.quantity || 0,
                unitPrice: tplItem.unitPrice || 0,
                costPrice: tplItem.costPrice || Math.round(tplItem.unitPrice * 0.8),
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

// ============================================
// 估價單服務類
// ============================================

class QuotationServiceClass {
    constructor() {
        this.storageKey = 'senteng_quotations';
        this.catalogKey = 'senteng_catalog';
    }

    // 取得所有估價單
    async getQuotations() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get quotations:', error);
            return [];
        }
    }

    // 取得單一估價單
    async getQuotation(id) {
        const quotations = await this.getQuotations();
        return quotations.find(q => q.id === id);
    }

    // 新增估價單
    async createQuotation(data) {
        const quotations = await this.getQuotations();
        const newQuotation = {
            id: `quo-${Date.now()}`,
            quotationNo: generateQuotationNo(),
            projectId: data.projectId || null,
            projectName: data.projectName || '',
            customerId: data.customerId || null,
            customerName: data.customerName || '',
            title: data.title || '新估價單',
            description: data.description || '',
            status: QUOTATION_STATUS.DRAFT,
            currentVersion: 1,
            validUntil: new Date(Date.now() + DEFAULT_SETTINGS.validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            currency: DEFAULT_SETTINGS.currency,
            taxType: TAX_TYPES.INCLUSIVE,
            taxRate: DEFAULT_SETTINGS.taxRate,
            managementFeeRate: DEFAULT_SETTINGS.managementFee,
            profitRate: DEFAULT_SETTINGS.profitRate,
            items: data.items || [],
            versions: [{
                version: 1,
                createdAt: new Date().toISOString(),
                note: '初始版本',
            }],
            createdBy: data.createdBy || 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // 計算金額
        const totals = calculateQuotationTotals(newQuotation.items, {
            managementFeeRate: newQuotation.managementFeeRate,
            profitRate: newQuotation.profitRate,
            taxRate: newQuotation.taxRate,
            taxType: newQuotation.taxType,
        });
        Object.assign(newQuotation, totals);

        quotations.push(newQuotation);
        localStorage.setItem(this.storageKey, JSON.stringify(quotations));

        return newQuotation;
    }

    // 更新估價單
    async updateQuotation(id, data) {
        const quotations = await this.getQuotations();
        const index = quotations.findIndex(q => q.id === id);

        if (index === -1) throw new Error('Quotation not found');

        const updated = {
            ...quotations[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        // 重新計算金額
        if (data.items) {
            const totals = calculateQuotationTotals(updated.items, {
                managementFeeRate: updated.managementFeeRate,
                profitRate: updated.profitRate,
                taxRate: updated.taxRate,
                taxType: updated.taxType,
            });
            Object.assign(updated, totals);
        }

        quotations[index] = updated;
        localStorage.setItem(this.storageKey, JSON.stringify(quotations));

        return updated;
    }

    // 刪除估價單 (軟刪除)
    async deleteQuotation(id) {
        return this.updateQuotation(id, { status: QUOTATION_STATUS.VOIDED });
    }

    // 複製估價單
    async copyQuotation(id, options = {}) {
        const source = await this.getQuotation(id);
        if (!source) throw new Error('Source quotation not found');

        const newData = {
            title: options.title || `${source.title} (複製)`,
            projectId: options.projectId || source.projectId,
            projectName: options.projectName || source.projectName,
            customerId: options.customerId || source.customerId,
            customerName: options.customerName || source.customerName,
            items: options.copyItems !== false ? [...source.items] : [],
        };

        return this.createQuotation(newData);
    }

    // 變更狀態
    async changeStatus(id, newStatus, note = '') {
        const quotation = await this.getQuotation(id);
        if (!quotation) throw new Error('Quotation not found');

        // TODO: 驗證狀態轉換是否合法

        return this.updateQuotation(id, {
            status: newStatus,
            statusNote: note,
            statusChangedAt: new Date().toISOString(),
        });
    }

    // 取得工項庫
    async getCatalogItems() {
        try {
            const data = localStorage.getItem(this.catalogKey);
            return data ? JSON.parse(data) : DEFAULT_CATALOG_ITEMS;
        } catch {
            return DEFAULT_CATALOG_ITEMS;
        }
    }

    // 搜尋工項庫
    async searchCatalog(keyword, category = null) {
        const items = await this.getCatalogItems();
        return items.filter(item => {
            const matchKeyword = !keyword ||
                item.name.includes(keyword) ||
                item.id.includes(keyword);
            const matchCategory = !category || item.category === category;
            return matchKeyword && matchCategory;
        });
    }
}

export const QuotationService = new QuotationServiceClass();
export default QuotationService;
