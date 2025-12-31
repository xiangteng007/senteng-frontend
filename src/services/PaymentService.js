/**
 * 請款管理服務層 (PaymentService)
 * 處理請款申請、審核、收款追蹤
 */

// ============================================
// 常數定義
// ============================================

// 請款單狀態
export const PAYMENT_STATUS = {
    DRAFT: 'DRAFT',           // 草稿
    PENDING: 'PENDING',       // 待審核
    APPROVED: 'APPROVED',     // 已核准
    INVOICED: 'INVOICED',     // 已開立發票
    PARTIAL: 'PARTIAL',       // 部分收款
    PAID: 'PAID',             // 已收款
    OVERDUE: 'OVERDUE',       // 逾期
    CANCELLED: 'CANCELLED',   // 已取消
};

export const PAYMENT_STATUS_LABELS = {
    DRAFT: '草稿',
    PENDING: '待審核',
    APPROVED: '已核准',
    INVOICED: '已開票',
    PARTIAL: '部分收款',
    PAID: '已收款',
    OVERDUE: '逾期',
    CANCELLED: '已取消',
};

export const PAYMENT_STATUS_COLORS = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    INVOICED: 'bg-purple-100 text-purple-700',
    PARTIAL: 'bg-orange-100 text-orange-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-200 text-gray-500',
};

// 請款類型
export const PAYMENT_TYPES = {
    DEPOSIT: 'DEPOSIT',       // 訂金
    PROGRESS: 'PROGRESS',     // 工程進度款
    MILESTONE: 'MILESTONE',   // 里程碑款
    FINAL: 'FINAL',           // 尾款
    RETENTION: 'RETENTION',   // 保留款
    CHANGE_ORDER: 'CHANGE_ORDER', // 變更單款項
};

export const PAYMENT_TYPE_LABELS = {
    DEPOSIT: '訂金',
    PROGRESS: '進度款',
    MILESTONE: '里程碑款',
    FINAL: '尾款',
    RETENTION: '保留款',
    CHANGE_ORDER: '變更單款項',
};

// 預設付款條件
export const DEFAULT_PAYMENT_TERMS = [
    { id: 'deposit', type: 'DEPOSIT', name: '簽約訂金', percentage: 30, daysAfterSign: 0 },
    { id: 'progress1', type: 'PROGRESS', name: '第一期款', percentage: 30, daysAfterSign: 30 },
    { id: 'progress2', type: 'PROGRESS', name: '第二期款', percentage: 30, daysAfterSign: 60 },
    { id: 'final', type: 'FINAL', name: '完工尾款', percentage: 10, daysAfterSign: 90 },
];

// 保留款設定
export const RETENTION_SETTINGS = {
    rate: 5, // 5%
    releaseAfterMonths: 12, // 12個月後釋放
};

// ============================================
// 工具函數
// ============================================

/**
 * 生成請款單編號
 */
export const generatePaymentNo = (projectCode, sequence) => {
    const year = new Date().getFullYear();
    return `PAY${year}-${projectCode || 'XX'}-${String(sequence).padStart(2, '0')}`;
};

/**
 * 計算保留款
 */
export const calculateRetention = (amount, rate = RETENTION_SETTINGS.rate) => {
    return Math.round(amount * (rate / 100));
};

/**
 * 計算可請款金額
 */
export const calculatePayableAmount = (amount, retentionRate = RETENTION_SETTINGS.rate) => {
    const retention = calculateRetention(amount, retentionRate);
    return amount - retention;
};

// ============================================
// 請款服務類
// ============================================

class PaymentServiceClass {
    constructor() {
        this.storageKey = 'senteng_payments';
    }

    // 取得所有請款單
    async getPayments(filters = {}) {
        try {
            const data = localStorage.getItem(this.storageKey);
            let payments = data ? JSON.parse(data) : [];

            // 篩選
            if (filters.projectId) {
                payments = payments.filter(p => p.projectId === filters.projectId);
            }
            if (filters.quotationId) {
                payments = payments.filter(p => p.quotationId === filters.quotationId);
            }
            if (filters.status) {
                payments = payments.filter(p => p.status === filters.status);
            }

            // 排序：最新的在前
            return payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Failed to get payments:', error);
            return [];
        }
    }

    // 取得單一請款單
    async getPayment(id) {
        const payments = await this.getPayments();
        return payments.find(p => p.id === id);
    }

    // 取得專案的請款單數量（用於編號）
    async getNextSequence(projectId) {
        const payments = await this.getPayments({ projectId });
        return payments.length + 1;
    }

    // 新增請款單
    async createPayment(data) {
        const payments = await this.getPayments();
        const sequence = await this.getNextSequence(data.projectId);

        const newPayment = {
            id: `pay-${Date.now()}`,
            paymentNo: generatePaymentNo(data.projectCode, sequence),
            sequence,
            status: PAYMENT_STATUS.DRAFT,

            // 關聯
            projectId: data.projectId || null,
            projectName: data.projectName || '',
            projectCode: data.projectCode || '',
            quotationId: data.quotationId || null,
            quotationNo: data.quotationNo || '',
            customerId: data.customerId || null,
            customerName: data.customerName || '',

            // 請款資訊
            type: data.type || PAYMENT_TYPES.PROGRESS,
            title: data.title || '',
            description: data.description || '',

            // 金額
            contractAmount: data.contractAmount || 0, // 合約總金額
            previousPaidAmount: data.previousPaidAmount || 0, // 前期已請金額
            requestAmount: data.requestAmount || 0, // 本期請款金額
            retentionRate: data.retentionRate || RETENTION_SETTINGS.rate,
            retentionAmount: 0, // 保留款
            payableAmount: 0, // 應付金額
            receivedAmount: 0, // 實收金額

            // 明細
            items: data.items || [],

            // 發票
            invoiceNo: '',
            invoiceDate: null,

            // 收款
            dueDate: data.dueDate || null,
            paidDate: null,
            paidAmount: 0,

            // 審核
            submittedAt: null,
            submittedBy: null,
            approvedAt: null,
            approvedBy: null,

            // 元資料
            createdBy: data.createdBy || 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // 計算金額
        newPayment.retentionAmount = calculateRetention(newPayment.requestAmount, newPayment.retentionRate);
        newPayment.payableAmount = newPayment.requestAmount - newPayment.retentionAmount;

        payments.push(newPayment);
        localStorage.setItem(this.storageKey, JSON.stringify(payments));

        return newPayment;
    }

    // 更新請款單
    async updatePayment(id, data) {
        const payments = await this.getPayments();
        const index = payments.findIndex(p => p.id === id);

        if (index === -1) throw new Error('Payment not found');

        const updated = {
            ...payments[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        // 重新計算金額
        if (data.requestAmount !== undefined || data.retentionRate !== undefined) {
            updated.retentionAmount = calculateRetention(
                updated.requestAmount,
                updated.retentionRate
            );
            updated.payableAmount = updated.requestAmount - updated.retentionAmount;
        }

        payments[index] = updated;
        localStorage.setItem(this.storageKey, JSON.stringify(payments));

        return updated;
    }

    // 提交審核
    async submitForReview(id, submittedBy) {
        return this.updatePayment(id, {
            status: PAYMENT_STATUS.PENDING,
            submittedAt: new Date().toISOString(),
            submittedBy,
        });
    }

    // 核准
    async approve(id, approvedBy) {
        return this.updatePayment(id, {
            status: PAYMENT_STATUS.APPROVED,
            approvedAt: new Date().toISOString(),
            approvedBy,
        });
    }

    // 開立發票
    async createInvoice(id, invoiceNo, invoiceDate) {
        return this.updatePayment(id, {
            status: PAYMENT_STATUS.INVOICED,
            invoiceNo,
            invoiceDate: invoiceDate || new Date().toISOString(),
        });
    }

    // 記錄收款
    async recordReceipt(id, amount, paidDate) {
        const payment = await this.getPayment(id);
        if (!payment) throw new Error('Payment not found');

        const totalReceived = (payment.receivedAmount || 0) + amount;
        const isPaid = totalReceived >= payment.payableAmount;

        return this.updatePayment(id, {
            status: isPaid ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PARTIAL,
            receivedAmount: totalReceived,
            paidDate: isPaid ? (paidDate || new Date().toISOString()) : null,
        });
    }

    // 取消
    async cancel(id) {
        return this.updatePayment(id, {
            status: PAYMENT_STATUS.CANCELLED,
        });
    }

    // 刪除（僅限草稿）
    async deletePayment(id) {
        const payments = await this.getPayments();
        const payment = payments.find(p => p.id === id);

        if (!payment) throw new Error('Payment not found');
        if (payment.status !== PAYMENT_STATUS.DRAFT) {
            throw new Error('Only draft payments can be deleted');
        }

        const filtered = payments.filter(p => p.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        return true;
    }

    // 取得專案請款統計
    async getProjectPaymentStats(projectId) {
        const payments = await this.getPayments({ projectId });

        return {
            totalPayments: payments.length,
            totalRequested: payments.reduce((sum, p) => sum + (p.requestAmount || 0), 0),
            totalReceived: payments.reduce((sum, p) => sum + (p.receivedAmount || 0), 0),
            totalRetention: payments.reduce((sum, p) => sum + (p.retentionAmount || 0), 0),
            pendingCount: payments.filter(p => p.status === PAYMENT_STATUS.PENDING).length,
            overdueCount: payments.filter(p => p.status === PAYMENT_STATUS.OVERDUE).length,
        };
    }

    // 取得逾期請款單
    async getOverduePayments() {
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

    // 從估價單建立請款計畫
    async createPaymentPlanFromQuotation(quotation, paymentTerms = DEFAULT_PAYMENT_TERMS) {
        const payments = [];
        const signDate = new Date();

        for (const term of paymentTerms) {
            const dueDate = new Date(signDate);
            dueDate.setDate(dueDate.getDate() + (term.daysAfterSign || 0));

            const requestAmount = Math.round(quotation.totalAmount * (term.percentage / 100));

            const payment = await this.createPayment({
                projectId: quotation.projectId,
                projectName: quotation.projectName,
                quotationId: quotation.id,
                quotationNo: quotation.quotationNo,
                customerName: quotation.customerName,
                type: term.type,
                title: term.name,
                contractAmount: quotation.totalAmount,
                requestAmount,
                dueDate: dueDate.toISOString(),
            });

            payments.push(payment);
        }

        return payments;
    }
}

export const PaymentService = new PaymentServiceClass();
export default PaymentService;
