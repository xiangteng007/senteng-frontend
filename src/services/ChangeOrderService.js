/**
 * 工程變更單服務層 (ChangeOrderService)
 * 處理追加減項、變更追蹤、金額計算
 */

import { QuotationService, calculateLineAmount } from './QuotationService';

// ============================================
// 常數定義
// ============================================

// 變更單狀態
export const CHANGE_ORDER_STATUS = {
    DRAFT: 'DRAFT',           // 草稿
    PENDING: 'PENDING',       // 待審核
    CLIENT_CONFIRM: 'CLIENT_CONFIRM', // 待客戶確認
    APPROVED: 'APPROVED',     // 已核准
    REJECTED: 'REJECTED',     // 已拒絕
    VOIDED: 'VOIDED',         // 作廢
};

export const CHANGE_ORDER_STATUS_LABELS = {
    DRAFT: '草稿',
    PENDING: '待審核',
    CLIENT_CONFIRM: '待客戶確認',
    APPROVED: '已核准',
    REJECTED: '已拒絕',
    VOIDED: '作廢',
};

export const CHANGE_ORDER_STATUS_COLORS = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    CLIENT_CONFIRM: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    VOIDED: 'bg-gray-200 text-gray-500',
};

// 變更類型
export const CHANGE_TYPES = {
    ADD: 'ADD',         // 追加
    DEDUCT: 'DEDUCT',   // 減項
    REPLACE: 'REPLACE', // 替換
    MODIFY: 'MODIFY',   // 數量/單價修改
};

export const CHANGE_TYPE_LABELS = {
    ADD: '追加',
    DEDUCT: '減項',
    REPLACE: '替換',
    MODIFY: '變更',
};

export const CHANGE_TYPE_COLORS = {
    ADD: 'bg-green-100 text-green-700',
    DEDUCT: 'bg-red-100 text-red-700',
    REPLACE: 'bg-purple-100 text-purple-700',
    MODIFY: 'bg-blue-100 text-blue-700',
};

// 變更原因分類
export const CHANGE_REASONS = [
    { id: 'client_request', label: '客戶需求變更', icon: '👤' },
    { id: 'design_change', label: '設計變更', icon: '📐' },
    { id: 'site_condition', label: '現場狀況', icon: '🏗️' },
    { id: 'material_change', label: '材料變更', icon: '🧱' },
    { id: 'regulation', label: '法規要求', icon: '📋' },
    { id: 'error_correction', label: '錯誤修正', icon: '⚠️' },
    { id: 'other', label: '其他', icon: '📝' },
];

// ============================================
// 工具函數
// ============================================

/**
 * 生成變更單編號
 */
export const generateChangeOrderNo = (quotationNo, sequence) => {
    return `${quotationNo}-CO${String(sequence).padStart(2, '0')}`;
};

/**
 * 計算變更單金額彙總
 */
export const calculateChangeOrderTotals = (items) => {
    let totalAdded = 0;
    let totalDeducted = 0;

    items.forEach(item => {
        const amount = calculateLineAmount(item.quantity, item.unitPrice);
        if (item.changeType === CHANGE_TYPES.ADD || item.changeType === CHANGE_TYPES.REPLACE) {
            totalAdded += amount;
        } else if (item.changeType === CHANGE_TYPES.DEDUCT) {
            totalDeducted += amount;
        } else if (item.changeType === CHANGE_TYPES.MODIFY) {
            const originalAmount = calculateLineAmount(item.originalQuantity, item.originalUnitPrice);
            const diff = amount - originalAmount;
            if (diff > 0) {
                totalAdded += diff;
            } else {
                totalDeducted += Math.abs(diff);
            }
        }
    });

    return {
        totalAdded,
        totalDeducted,
        netChange: totalAdded - totalDeducted,
    };
};

// ============================================
// 變更單服務類
// ============================================

class ChangeOrderServiceClass {
    constructor() {
        this.storageKey = 'senteng_change_orders';
    }

    // 取得所有變更單
    async getChangeOrders(quotationId = null) {
        try {
            const data = localStorage.getItem(this.storageKey);
            const orders = data ? JSON.parse(data) : [];
            if (quotationId) {
                return orders.filter(o => o.quotationId === quotationId);
            }
            return orders;
        } catch (error) {
            console.error('Failed to get change orders:', error);
            return [];
        }
    }

    // 取得單一變更單
    async getChangeOrder(id) {
        const orders = await this.getChangeOrders();
        return orders.find(o => o.id === id);
    }

    // 取得估價單的變更單數量 (用於編號)
    async getNextSequence(quotationId) {
        const orders = await this.getChangeOrders(quotationId);
        return orders.length + 1;
    }

    // 新增變更單
    async createChangeOrder(data) {
        const orders = await this.getChangeOrders();
        const quotation = await QuotationService.getQuotation(data.quotationId);

        if (!quotation) throw new Error('Quotation not found');

        const sequence = await this.getNextSequence(data.quotationId);
        const changeOrderNo = generateChangeOrderNo(quotation.quotationNo, sequence);

        const newOrder = {
            id: `co-${Date.now()}`,
            changeOrderNo,
            quotationId: data.quotationId,
            quotationNo: quotation.quotationNo,
            projectName: quotation.projectName || quotation.title,
            sequence,
            status: CHANGE_ORDER_STATUS.DRAFT,
            title: data.title || `第 ${sequence} 次變更`,
            description: data.description || '',
            reason: data.reason || 'client_request',
            items: data.items || [],
            // 金額
            originalContractAmount: quotation.totalAmount || 0,
            totalAdded: 0,
            totalDeducted: 0,
            netChange: 0,
            newContractAmount: quotation.totalAmount || 0,
            // 審核
            submittedAt: null,
            submittedBy: null,
            approvedAt: null,
            approvedBy: null,
            clientSignedAt: null,
            rejectedAt: null,
            rejectedBy: null,
            rejectionReason: '',
            // 元資料
            createdBy: data.createdBy || 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // 計算金額
        if (newOrder.items.length > 0) {
            const totals = calculateChangeOrderTotals(newOrder.items);
            Object.assign(newOrder, totals);
            newOrder.newContractAmount = newOrder.originalContractAmount + newOrder.netChange;
        }

        orders.push(newOrder);
        localStorage.setItem(this.storageKey, JSON.stringify(orders));

        return newOrder;
    }

    // 更新變更單
    async updateChangeOrder(id, data) {
        const orders = await this.getChangeOrders();
        const index = orders.findIndex(o => o.id === id);

        if (index === -1) throw new Error('Change order not found');

        const updated = {
            ...orders[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        // 重新計算金額
        if (data.items) {
            const totals = calculateChangeOrderTotals(updated.items);
            Object.assign(updated, totals);
            updated.newContractAmount = updated.originalContractAmount + updated.netChange;
        }

        orders[index] = updated;
        localStorage.setItem(this.storageKey, JSON.stringify(orders));

        return updated;
    }

    // 提交審核
    async submitForReview(id, submittedBy) {
        return this.updateChangeOrder(id, {
            status: CHANGE_ORDER_STATUS.PENDING,
            submittedAt: new Date().toISOString(),
            submittedBy,
        });
    }

    // 送客戶確認
    async sendToClient(id) {
        return this.updateChangeOrder(id, {
            status: CHANGE_ORDER_STATUS.CLIENT_CONFIRM,
        });
    }

    // 客戶簽認
    async clientSign(id) {
        return this.updateChangeOrder(id, {
            status: CHANGE_ORDER_STATUS.APPROVED,
            clientSignedAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
        });
    }

    // 核准
    async approve(id, approvedBy) {
        const order = await this.getChangeOrder(id);
        if (!order) throw new Error('Change order not found');

        // 更新原估價單金額
        await QuotationService.updateQuotation(order.quotationId, {
            totalAmount: order.newContractAmount,
            lastChangeOrderId: id,
        });

        return this.updateChangeOrder(id, {
            status: CHANGE_ORDER_STATUS.APPROVED,
            approvedAt: new Date().toISOString(),
            approvedBy,
        });
    }

    // 拒絕
    async reject(id, rejectedBy, reason) {
        return this.updateChangeOrder(id, {
            status: CHANGE_ORDER_STATUS.REJECTED,
            rejectedAt: new Date().toISOString(),
            rejectedBy,
            rejectionReason: reason,
        });
    }

    // 作廢
    async void(id) {
        return this.updateChangeOrder(id, {
            status: CHANGE_ORDER_STATUS.VOIDED,
        });
    }

    // 刪除 (僅限草稿)
    async deleteChangeOrder(id) {
        const orders = await this.getChangeOrders();
        const order = orders.find(o => o.id === id);

        if (!order) throw new Error('Change order not found');
        if (order.status !== CHANGE_ORDER_STATUS.DRAFT) {
            throw new Error('Only draft change orders can be deleted');
        }

        const filtered = orders.filter(o => o.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        return true;
    }

    // 從估價單工項建立變更項目
    createChangeItemFromQuotation(quotationItem, changeType) {
        return {
            id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            changeType,
            originalItemId: quotationItem.id,
            originalItemCode: quotationItem.itemCode,
            name: quotationItem.name,
            specification: quotationItem.specification || '',
            unit: quotationItem.unit,
            // 原數量/單價 (用於 MODIFY 類型計算差額)
            originalQuantity: quotationItem.quantity,
            originalUnitPrice: quotationItem.unitPrice,
            // 新數量/單價
            quantity: changeType === CHANGE_TYPES.DEDUCT ? quotationItem.quantity : 0,
            unitPrice: quotationItem.unitPrice,
            // 說明
            reason: '',
            remark: '',
        };
    }

    // 建立新增項目
    createNewChangeItem() {
        return {
            id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            changeType: CHANGE_TYPES.ADD,
            originalItemId: null,
            originalItemCode: null,
            name: '',
            specification: '',
            unit: '式',
            originalQuantity: 0,
            originalUnitPrice: 0,
            quantity: 0,
            unitPrice: 0,
            reason: '',
            remark: '',
        };
    }

    // 取得估價單累計變更金額
    async getCumulativeChanges(quotationId) {
        const orders = await this.getChangeOrders(quotationId);
        const approvedOrders = orders.filter(o => o.status === CHANGE_ORDER_STATUS.APPROVED);

        return approvedOrders.reduce((acc, order) => ({
            totalAdded: acc.totalAdded + order.totalAdded,
            totalDeducted: acc.totalDeducted + order.totalDeducted,
            netChange: acc.netChange + order.netChange,
            count: acc.count + 1,
        }), { totalAdded: 0, totalDeducted: 0, netChange: 0, count: 0 });
    }
}

export const ChangeOrderService = new ChangeOrderServiceClass();
export default ChangeOrderService;
