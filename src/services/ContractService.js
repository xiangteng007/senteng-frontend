/**
 * 合約管理服務層 (ContractService)
 * 處理合約建立、版本控管、履約追蹤
 */

import { QuotationService, QUOTATION_STATUS } from './QuotationService';

// ============================================
// 常數定義
// ============================================

// 合約狀態
export const CONTRACT_STATUS = {
    DRAFT: 'DRAFT',           // 草稿
    PENDING_SIGN: 'PENDING_SIGN', // 待簽約
    ACTIVE: 'ACTIVE',         // 履約中
    COMPLETED: 'COMPLETED',   // 已完工
    WARRANTY: 'WARRANTY',     // 保固期
    CLOSED: 'CLOSED',         // 已結案
    TERMINATED: 'TERMINATED', // 終止
};

export const CONTRACT_STATUS_LABELS = {
    DRAFT: '草稿',
    PENDING_SIGN: '待簽約',
    ACTIVE: '履約中',
    COMPLETED: '已完工',
    WARRANTY: '保固期',
    CLOSED: '已結案',
    TERMINATED: '終止',
};

export const CONTRACT_STATUS_COLORS = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING_SIGN: 'bg-yellow-100 text-yellow-700',
    ACTIVE: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    WARRANTY: 'bg-purple-100 text-purple-700',
    CLOSED: 'bg-gray-200 text-gray-600',
    TERMINATED: 'bg-red-100 text-red-700',
};

// 合約類型
export const CONTRACT_TYPES = {
    LUMP_SUM: 'LUMP_SUM',           // 總價承攬
    UNIT_PRICE: 'UNIT_PRICE',       // 單價承攬
    COST_PLUS: 'COST_PLUS',         // 成本加成
    DESIGN_BUILD: 'DESIGN_BUILD',   // 統包
};

export const CONTRACT_TYPE_LABELS = {
    LUMP_SUM: '總價承攬',
    UNIT_PRICE: '單價承攬',
    COST_PLUS: '成本加成',
    DESIGN_BUILD: '統包工程',
};

// 付款條件範本
export const PAYMENT_TERM_TEMPLATES = [
    {
        id: 'standard-3',
        name: '標準三期款',
        terms: [
            { name: '簽約訂金', percentage: 30, trigger: 'SIGNED' },
            { name: '中期款', percentage: 40, trigger: 'PROGRESS_50' },
            { name: '完工尾款', percentage: 30, trigger: 'COMPLETED' },
        ],
    },
    {
        id: 'standard-4',
        name: '標準四期款',
        terms: [
            { name: '簽約訂金', percentage: 30, trigger: 'SIGNED' },
            { name: '第一期', percentage: 30, trigger: 'PROGRESS_30' },
            { name: '第二期', percentage: 30, trigger: 'PROGRESS_70' },
            { name: '完工尾款', percentage: 10, trigger: 'COMPLETED' },
        ],
    },
    {
        id: 'monthly',
        name: '按月請款',
        terms: [
            { name: '簽約訂金', percentage: 10, trigger: 'SIGNED' },
            { name: '月結款', percentage: 80, trigger: 'MONTHLY' },
            { name: '完工尾款', percentage: 10, trigger: 'COMPLETED' },
        ],
    },
];

// ============================================
// 工具函數
// ============================================

/**
 * 生成合約編號
 */
export const generateContractNo = (year, sequence) => {
    return `CTR${year}-${String(sequence).padStart(4, '0')}`;
};

// ============================================
// 合約服務類
// ============================================

class ContractServiceClass {
    constructor() {
        this.storageKey = 'senteng_contracts';
    }

    // 取得所有合約
    async getContracts(filters = {}) {
        try {
            const data = localStorage.getItem(this.storageKey);
            let contracts = data ? JSON.parse(data) : [];

            if (filters.status) {
                contracts = contracts.filter(c => c.status === filters.status);
            }
            if (filters.customerId) {
                contracts = contracts.filter(c => c.customerId === filters.customerId);
            }

            return contracts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Failed to get contracts:', error);
            return [];
        }
    }

    // 取得單一合約
    async getContract(id) {
        const contracts = await this.getContracts();
        return contracts.find(c => c.id === id);
    }

    // 取得年度合約數量（用於編號）
    async getYearSequence(year) {
        const contracts = await this.getContracts();
        const yearContracts = contracts.filter(c =>
            new Date(c.createdAt).getFullYear() === year
        );
        return yearContracts.length + 1;
    }

    // 從估價單建立合約
    async createFromQuotation(quotationId, additionalData = {}) {
        const quotation = await QuotationService.getQuotation(quotationId);
        if (!quotation) throw new Error('Quotation not found');

        const year = new Date().getFullYear();
        const sequence = await this.getYearSequence(year);
        const contractNo = generateContractNo(year, sequence);

        const newContract = {
            id: `ctr-${Date.now()}`,
            contractNo,
            status: CONTRACT_STATUS.DRAFT,
            type: additionalData.type || CONTRACT_TYPES.LUMP_SUM,

            // 來源估價單
            quotationId: quotation.id,
            quotationNo: quotation.quotationNo,
            quotationVersion: quotation.version || 1,

            // 專案/客戶
            projectId: quotation.projectId,
            projectName: quotation.projectName || quotation.title,
            customerId: quotation.customerId,
            customerName: quotation.customerName,

            // 金額
            originalAmount: quotation.totalAmount,
            currentAmount: quotation.totalAmount,
            changeOrderTotal: 0,
            paidAmount: 0,

            // 工項明細（複製自估價單）
            items: quotation.items || [],

            // 付款條件
            paymentTerms: additionalData.paymentTerms || PAYMENT_TERM_TEMPLATES[0].terms,
            retentionRate: additionalData.retentionRate || 5,

            // 合約條款
            warrantyMonths: additionalData.warrantyMonths || 12,
            penaltyRate: additionalData.penaltyRate || 0.1, // 每日千分之一
            description: additionalData.description || '',

            // 日期
            signedDate: null,
            startDate: additionalData.startDate || null,
            endDate: additionalData.endDate || null,
            completedDate: null,
            warrantyEndDate: null,

            // 變更單/請款單
            changeOrderIds: [],
            paymentIds: [],

            // 元資料
            createdBy: additionalData.createdBy || 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const contracts = await this.getContracts();
        contracts.push(newContract);
        localStorage.setItem(this.storageKey, JSON.stringify(contracts));

        // 更新估價單狀態為已成交
        await QuotationService.updateQuotation(quotationId, {
            status: QUOTATION_STATUS.ACCEPTED,
            contractId: newContract.id,
        });

        return newContract;
    }

    // 更新合約
    async updateContract(id, data) {
        const contracts = await this.getContracts();
        const index = contracts.findIndex(c => c.id === id);

        if (index === -1) throw new Error('Contract not found');

        const updated = {
            ...contracts[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        contracts[index] = updated;
        localStorage.setItem(this.storageKey, JSON.stringify(contracts));

        return updated;
    }

    // 簽約
    async sign(id, signedDate) {
        const contract = await this.getContract(id);
        if (!contract) throw new Error('Contract not found');

        return this.updateContract(id, {
            status: CONTRACT_STATUS.ACTIVE,
            signedDate: signedDate || new Date().toISOString(),
        });
    }

    // 完工
    async complete(id, completedDate) {
        const contract = await this.getContract(id);
        if (!contract) throw new Error('Contract not found');

        const warrantyEndDate = new Date(completedDate || new Date());
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + contract.warrantyMonths);

        return this.updateContract(id, {
            status: CONTRACT_STATUS.WARRANTY,
            completedDate: completedDate || new Date().toISOString(),
            warrantyEndDate: warrantyEndDate.toISOString(),
        });
    }

    // 結案
    async close(id) {
        return this.updateContract(id, {
            status: CONTRACT_STATUS.CLOSED,
        });
    }

    // 終止
    async terminate(id, reason) {
        return this.updateContract(id, {
            status: CONTRACT_STATUS.TERMINATED,
            terminationReason: reason,
            terminatedAt: new Date().toISOString(),
        });
    }

    // 新增變更單到合約
    async addChangeOrder(contractId, changeOrderId, netChange) {
        const contract = await this.getContract(contractId);
        if (!contract) throw new Error('Contract not found');

        return this.updateContract(contractId, {
            changeOrderIds: [...(contract.changeOrderIds || []), changeOrderId],
            changeOrderTotal: (contract.changeOrderTotal || 0) + netChange,
            currentAmount: contract.originalAmount + (contract.changeOrderTotal || 0) + netChange,
        });
    }

    // 新增請款單到合約
    async addPayment(contractId, paymentId, amount) {
        const contract = await this.getContract(contractId);
        if (!contract) throw new Error('Contract not found');

        return this.updateContract(contractId, {
            paymentIds: [...(contract.paymentIds || []), paymentId],
            paidAmount: (contract.paidAmount || 0) + amount,
        });
    }

    // 取得合約統計
    async getContractStats() {
        const contracts = await this.getContracts();

        return {
            total: contracts.length,
            active: contracts.filter(c => c.status === CONTRACT_STATUS.ACTIVE).length,
            completed: contracts.filter(c => c.status === CONTRACT_STATUS.COMPLETED).length,
            warranty: contracts.filter(c => c.status === CONTRACT_STATUS.WARRANTY).length,
            totalAmount: contracts.reduce((sum, c) => sum + (c.currentAmount || 0), 0),
            totalPaid: contracts.reduce((sum, c) => sum + (c.paidAmount || 0), 0),
        };
    }

    // 刪除合約（僅草稿）
    async deleteContract(id) {
        const contracts = await this.getContracts();
        const contract = contracts.find(c => c.id === id);

        if (!contract) throw new Error('Contract not found');
        if (contract.status !== CONTRACT_STATUS.DRAFT) {
            throw new Error('Only draft contracts can be deleted');
        }

        const filtered = contracts.filter(c => c.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        return true;
    }
}

export const ContractService = new ContractServiceClass();
export default ContractService;
