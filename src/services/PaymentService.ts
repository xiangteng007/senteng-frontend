/**
 * PaymentService.ts
 *
 * 請款管理服務層 (PaymentService)
 * 處理請款申請、審核、收款追蹤
 *
 * ⚠️ 已整合 Backend API - 資料儲存於 PostgreSQL
 */

import { paymentsApi } from './api';

// ==========================================
// Types
// ==========================================

export type PaymentStatusType =
    | 'PAY_DRAFT'
    | 'PAY_PENDING'
    | 'PAY_APPROVED'
    | 'PAY_INVOICED'
    | 'PAY_PARTIAL'
    | 'PAY_PAID'
    | 'PAY_OVERDUE'
    | 'PAY_CANCELLED';

export type PaymentType =
    | 'DEPOSIT'
    | 'PROGRESS'
    | 'MILESTONE'
    | 'FINAL'
    | 'RETENTION'
    | 'CHANGE_ORDER';

export interface PaymentTerm {
    id: string;
    type: PaymentType;
    name: string;
    percentage: number;
    daysAfterSign: number;
}

export interface RetentionConfig {
    rate: number;
    releaseAfterMonths: number;
}

export interface Payment {
    id: string;
    paymentNo: string;
    contractId: string;
    projectId: string;
    periodNo: number;
    applicationDate: string;
    dueDate?: string;
    progressPercent: number;
    cumulativePercent: number;
    requestAmount: number;
    retentionAmount: number;
    netAmount: number;
    receivedAmount: number;
    status: PaymentStatusType;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Receipt {
    id: string;
    applicationId: string;
    amount: number;
    receiptDate: string;
    paymentMethod: string;
    referenceNo?: string;
    createdAt: string;
}

export interface PaymentFilters {
    projectId?: string;
    contractId?: string;
    status?: PaymentStatusType;
}

export interface PaymentStats {
    totalPayments: number;
    totalRequested: number;
    totalReceived: number;
    totalRetention: number;
    pendingCount: number;
    overdueCount: number;
}

export interface CreatePaymentData {
    contractId: string;
    projectId: string;
    periodNo?: number;
    applicationDate?: string;
    progressPercent?: number;
    cumulativePercent?: number;
    requestAmount: number;
    retentionRate?: number;
    notes?: string;
    description?: string;
}

// ==========================================
// Constants
// ==========================================

export const PAYMENT_STATUS: Record<string, PaymentStatusType> = {
    DRAFT: 'PAY_DRAFT',
    PENDING: 'PAY_PENDING',
    APPROVED: 'PAY_APPROVED',
    INVOICED: 'PAY_INVOICED',
    PARTIAL: 'PAY_PARTIAL',
    PAID: 'PAY_PAID',
    OVERDUE: 'PAY_OVERDUE',
    CANCELLED: 'PAY_CANCELLED',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
    PAY_DRAFT: '草稿',
    PAY_PENDING: '待審核',
    PAY_APPROVED: '已核准',
    PAY_INVOICED: '已開票',
    PAY_PARTIAL: '部分收款',
    PAY_PAID: '已收款',
    PAY_OVERDUE: '逾期',
    PAY_CANCELLED: '已取消',
    DRAFT: '草稿',
    PENDING: '待審核',
    APPROVED: '已核准',
    INVOICED: '已開票',
    PARTIAL: '部分收款',
    PAID: '已收款',
    OVERDUE: '逾期',
    CANCELLED: '已取消',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
    PAY_DRAFT: 'bg-gray-100 text-gray-700',
    PAY_PENDING: 'bg-yellow-100 text-yellow-700',
    PAY_APPROVED: 'bg-blue-100 text-blue-700',
    PAY_INVOICED: 'bg-purple-100 text-purple-700',
    PAY_PARTIAL: 'bg-orange-100 text-orange-700',
    PAY_PAID: 'bg-green-100 text-green-700',
    PAY_OVERDUE: 'bg-red-100 text-red-700',
    PAY_CANCELLED: 'bg-gray-200 text-gray-500',
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    INVOICED: 'bg-purple-100 text-purple-700',
    PARTIAL: 'bg-orange-100 text-orange-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-200 text-gray-500',
};

export const PAYMENT_TYPES: Record<string, PaymentType> = {
    DEPOSIT: 'DEPOSIT',
    PROGRESS: 'PROGRESS',
    MILESTONE: 'MILESTONE',
    FINAL: 'FINAL',
    RETENTION: 'RETENTION',
    CHANGE_ORDER: 'CHANGE_ORDER',
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
    DEPOSIT: '訂金',
    PROGRESS: '進度款',
    MILESTONE: '里程碑款',
    FINAL: '尾款',
    RETENTION: '保留款',
    CHANGE_ORDER: '變更單款項',
};

export const DEFAULT_PAYMENT_TERMS: PaymentTerm[] = [
    { id: 'deposit', type: 'DEPOSIT', name: '簽約訂金', percentage: 30, daysAfterSign: 0 },
    { id: 'progress1', type: 'PROGRESS', name: '第一期款', percentage: 30, daysAfterSign: 30 },
    { id: 'progress2', type: 'PROGRESS', name: '第二期款', percentage: 30, daysAfterSign: 60 },
    { id: 'final', type: 'FINAL', name: '完工尾款', percentage: 10, daysAfterSign: 90 },
];

export const RETENTION_SETTINGS: RetentionConfig = {
    rate: 5,
    releaseAfterMonths: 12,
};

// ==========================================
// Utility Functions
// ==========================================

export const generatePaymentNo = (projectCode: string, sequence: number): string => {
    const year = new Date().getFullYear();
    return `PAY${year}-${projectCode || 'XX'}-${String(sequence).padStart(2, '0')}`;
};

export const calculateRetention = (
    amount: number,
    rate: number = RETENTION_SETTINGS.rate
): number => {
    return Math.round(amount * (rate / 100));
};

export const calculatePayableAmount = (
    amount: number,
    retentionRate: number = RETENTION_SETTINGS.rate
): number => {
    const retention = calculateRetention(amount, retentionRate);
    return amount - retention;
};

// ==========================================
// Service Class
// ==========================================

class PaymentServiceClass {
    async getPayments(filters: PaymentFilters = {}): Promise<Payment[]> {
        try {
            const params: Record<string, string> = {};
            if (filters.projectId) params.projectId = filters.projectId;
            if (filters.contractId) params.contractId = filters.contractId;
            if (filters.status) params.status = filters.status;

            const payments = await paymentsApi.getAll(params);
            return payments.sort(
                (a: Payment, b: Payment) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } catch (error) {
            console.error('Failed to get payments:', error);
            return [];
        }
    }

    async getPayment(id: string): Promise<Payment | null> {
        try {
            return await paymentsApi.getById(id);
        } catch (error) {
            console.error('Failed to get payment:', error);
            return null;
        }
    }

    async getReceipts(paymentId: string): Promise<Receipt[]> {
        try {
            return await paymentsApi.getReceipts(paymentId);
        } catch (error) {
            console.error('Failed to get receipts:', error);
            return [];
        }
    }

    async createPayment(data: CreatePaymentData): Promise<Payment> {
        const requestAmount = data.requestAmount || 0;
        const retentionRate = data.retentionRate || RETENTION_SETTINGS.rate;
        const retentionAmount = calculateRetention(requestAmount, retentionRate);
        const netAmount = requestAmount - retentionAmount;

        const payload = {
            contractId: data.contractId,
            projectId: data.projectId,
            periodNo: data.periodNo || 1,
            applicationDate: data.applicationDate || new Date().toISOString().split('T')[0],
            progressPercent: data.progressPercent || 0,
            cumulativePercent: data.cumulativePercent || 0,
            requestAmount,
            retentionAmount,
            netAmount,
            notes: data.notes || data.description || '',
        };

        return await paymentsApi.create(payload);
    }

    async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
        if (data.requestAmount !== undefined) {
            const requestAmount = data.requestAmount || 0;
            const retentionRate = RETENTION_SETTINGS.rate;
            data.retentionAmount = calculateRetention(requestAmount, retentionRate);
            data.netAmount = requestAmount - data.retentionAmount;
        }

        return await paymentsApi.update(id, data);
    }

    async submitForReview(id: string): Promise<Payment> {
        return await paymentsApi.submit(id);
    }

    async approve(id: string): Promise<Payment> {
        return await paymentsApi.approve(id);
    }

    async reject(id: string, reason: string): Promise<Payment> {
        return await paymentsApi.reject(id, reason);
    }

    async recordReceipt(
        id: string,
        amount: number,
        receiptDate?: string,
        paymentMethod: string = 'BANK_TRANSFER',
        referenceNo: string = ''
    ): Promise<Receipt> {
        return await paymentsApi.addReceipt({
            applicationId: id,
            amount,
            receiptDate: receiptDate || new Date().toISOString().split('T')[0],
            paymentMethod,
            referenceNo,
        });
    }

    async getProjectPaymentStats(projectId: string): Promise<PaymentStats> {
        const payments = await this.getPayments({ projectId });

        return {
            totalPayments: payments.length,
            totalRequested: payments.reduce((sum, p) => sum + (Number(p.requestAmount) || 0), 0),
            totalReceived: payments.reduce((sum, p) => sum + (Number(p.receivedAmount) || 0), 0),
            totalRetention: payments.reduce((sum, p) => sum + (Number(p.retentionAmount) || 0), 0),
            pendingCount: payments.filter(p => p.status === PAYMENT_STATUS.PENDING).length,
            overdueCount: payments.filter(p => p.status === PAYMENT_STATUS.OVERDUE).length,
        };
    }

    async getOverduePayments(): Promise<Payment[]> {
        const payments = await this.getPayments();
        const today = new Date();

        return payments.filter(p => {
            if (p.status === PAYMENT_STATUS.PAID || p.status === PAYMENT_STATUS.CANCELLED) {
                return false;
            }
            if (!p.dueDate) return false;
            return new Date(p.dueDate) < today;
        });
    }
}

export const PaymentService = new PaymentServiceClass();
export default PaymentService;
