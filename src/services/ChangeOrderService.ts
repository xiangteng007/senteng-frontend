/**
 * ChangeOrderService.ts
 *
 * 工程變更單服務層 (ChangeOrderService)
 * 處理追加減項、變更追蹤、金額計算
 *
 * ⚠️ 已整合 Backend API - 資料儲存於 PostgreSQL
 */

import { changeOrdersApi } from './api';
import { calculateLineAmount } from './QuotationService';

// ==========================================
// Types
// ==========================================

export type ChangeOrderStatusType =
    | 'CHG_DRAFT'
    | 'CHG_PENDING'
    | 'CHG_CLIENT_CONFIRM'
    | 'CHG_APPROVED'
    | 'CHG_REJECTED'
    | 'CHG_VOIDED';

export type ChangeType = 'ADD' | 'DEDUCT' | 'REPLACE' | 'MODIFY';

export interface ChangeItem {
    id: string;
    changeType: ChangeType;
    originalItemId: string | null;
    originalItemCode: string | null;
    name: string;
    specification: string;
    unit: string;
    originalQuantity: number;
    originalUnitPrice: number;
    quantity: number;
    unitPrice: number;
    reason: string;
    remark: string;
}

export interface ChangeOrder {
    id: string;
    changeOrderNo: string;
    contractId: string;
    projectId: string;
    title: string;
    reason: string;
    items: ChangeItem[];
    notes: string;
    status: ChangeOrderStatusType;
    totalAdded: number;
    totalDeducted: number;
    netChange: number;
    createdAt: string;
    updatedAt: string;
}

export interface ChangeReason {
    id: string;
    label: string;
    icon: string;
}

export interface ChangeOrderTotals {
    totalAdded: number;
    totalDeducted: number;
    netChange: number;
}

export interface CumulativeChanges extends ChangeOrderTotals {
    count: number;
}

export interface QuotationItem {
    id: string;
    itemCode: string;
    name: string;
    specification?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
}

export interface ChangeOrderFilters {
    contractId?: string;
    projectId?: string;
    status?: ChangeOrderStatusType;
}

// ==========================================
// Constants
// ==========================================

export const CHANGE_ORDER_STATUS: Record<string, ChangeOrderStatusType> = {
    DRAFT: 'CHG_DRAFT',
    PENDING: 'CHG_PENDING',
    CLIENT_CONFIRM: 'CHG_CLIENT_CONFIRM',
    APPROVED: 'CHG_APPROVED',
    REJECTED: 'CHG_REJECTED',
    VOIDED: 'CHG_VOIDED',
};

export const CHANGE_ORDER_STATUS_LABELS: Record<string, string> = {
    CHG_DRAFT: '草稿',
    CHG_PENDING: '待審核',
    CHG_CLIENT_CONFIRM: '待客戶確認',
    CHG_APPROVED: '已核准',
    CHG_REJECTED: '已拒絕',
    CHG_VOIDED: '作廢',
    DRAFT: '草稿',
    PENDING: '待審核',
    CLIENT_CONFIRM: '待客戶確認',
    APPROVED: '已核准',
    REJECTED: '已拒絕',
    VOIDED: '作廢',
};

export const CHANGE_ORDER_STATUS_COLORS: Record<string, string> = {
    CHG_DRAFT: 'bg-gray-100 text-gray-700',
    CHG_PENDING: 'bg-yellow-100 text-yellow-700',
    CHG_CLIENT_CONFIRM: 'bg-blue-100 text-blue-700',
    CHG_APPROVED: 'bg-green-100 text-green-700',
    CHG_REJECTED: 'bg-red-100 text-red-700',
    CHG_VOIDED: 'bg-gray-200 text-gray-500',
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    CLIENT_CONFIRM: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    VOIDED: 'bg-gray-200 text-gray-500',
};

export const CHANGE_TYPES: Record<string, ChangeType> = {
    ADD: 'ADD',
    DEDUCT: 'DEDUCT',
    REPLACE: 'REPLACE',
    MODIFY: 'MODIFY',
};

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
    ADD: '追加',
    DEDUCT: '減項',
    REPLACE: '替換',
    MODIFY: '變更',
};

export const CHANGE_TYPE_COLORS: Record<ChangeType, string> = {
    ADD: 'bg-green-100 text-green-700',
    DEDUCT: 'bg-red-100 text-red-700',
    REPLACE: 'bg-purple-100 text-purple-700',
    MODIFY: 'bg-blue-100 text-blue-700',
};

export const CHANGE_REASONS: ChangeReason[] = [
    { id: 'client_request', label: '客戶需求變更', icon: '👤' },
    { id: 'design_change', label: '設計變更', icon: '📐' },
    { id: 'site_condition', label: '現場狀況', icon: '🏗️' },
    { id: 'material_change', label: '材料變更', icon: '🧱' },
    { id: 'regulation', label: '法規要求', icon: '📋' },
    { id: 'error_correction', label: '錯誤修正', icon: '⚠️' },
    { id: 'other', label: '其他', icon: '📝' },
];

// ==========================================
// Utility Functions
// ==========================================

export const generateChangeOrderNo = (quotationNo: string, sequence: number): string => {
    return `${quotationNo}-CO${String(sequence).padStart(2, '0')}`;
};

export const calculateChangeOrderTotals = (items: ChangeItem[]): ChangeOrderTotals => {
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

// ==========================================
// Service Class
// ==========================================

class ChangeOrderServiceClass {
    async getChangeOrders(filters: ChangeOrderFilters = {}): Promise<ChangeOrder[]> {
        try {
            const params: Record<string, string> = {};
            if (filters.contractId) params.contractId = filters.contractId;
            if (filters.projectId) params.projectId = filters.projectId;
            if (filters.status) params.status = filters.status;

            return await changeOrdersApi.getAll(params);
        } catch (error) {
            console.error('Failed to get change orders:', error);
            return [];
        }
    }

    async getChangeOrder(id: string): Promise<ChangeOrder | null> {
        try {
            return await changeOrdersApi.getById(id);
        } catch (error) {
            console.error('Failed to get change order:', error);
            return null;
        }
    }

    async createChangeOrder(data: Partial<ChangeOrder>): Promise<ChangeOrder> {
        const payload = {
            contractId: data.contractId,
            projectId: data.projectId,
            title: data.title || '工程變更',
            reason: data.reason || 'client_request',
            items: data.items || [],
            notes: data.notes || '',
        };

        return await changeOrdersApi.create(payload);
    }

    async updateChangeOrder(id: string, data: Partial<ChangeOrder>): Promise<ChangeOrder> {
        return await changeOrdersApi.update(id, data);
    }

    async submitForReview(id: string): Promise<ChangeOrder> {
        return await changeOrdersApi.submit(id);
    }

    async approve(id: string): Promise<ChangeOrder> {
        return await changeOrdersApi.approve(id);
    }

    async reject(id: string, reason: string): Promise<ChangeOrder> {
        return await changeOrdersApi.reject(id, reason);
    }

    createChangeItemFromQuotation(quotationItem: QuotationItem, changeType: ChangeType): ChangeItem {
        return {
            id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            changeType,
            originalItemId: quotationItem.id,
            originalItemCode: quotationItem.itemCode,
            name: quotationItem.name,
            specification: quotationItem.specification || '',
            unit: quotationItem.unit,
            originalQuantity: quotationItem.quantity,
            originalUnitPrice: quotationItem.unitPrice,
            quantity: changeType === CHANGE_TYPES.DEDUCT ? quotationItem.quantity : 0,
            unitPrice: quotationItem.unitPrice,
            reason: '',
            remark: '',
        };
    }

    createNewChangeItem(): ChangeItem {
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

    async getCumulativeChanges(contractId: string): Promise<CumulativeChanges> {
        const orders = await this.getChangeOrders({ contractId });
        const approvedOrders = orders.filter(
            o => o.status === CHANGE_ORDER_STATUS.APPROVED || o.status === 'CHG_APPROVED'
        );

        return approvedOrders.reduce(
            (acc, order) => ({
                totalAdded: acc.totalAdded + (Number(order.totalAdded) || 0),
                totalDeducted: acc.totalDeducted + (Number(order.totalDeducted) || 0),
                netChange: acc.netChange + (Number(order.netChange) || 0),
                count: acc.count + 1,
            }),
            { totalAdded: 0, totalDeducted: 0, netChange: 0, count: 0 }
        );
    }
}

export const ChangeOrderService = new ChangeOrderServiceClass();
export default ChangeOrderService;
