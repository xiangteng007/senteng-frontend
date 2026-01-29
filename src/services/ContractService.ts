/**
 * ContractService.ts
 *
 * 合約管理服務層 (ContractService)
 * 處理合約建立、版本控管、履約追蹤
 *
 * ⚠️ 已整合 Backend API - 資料儲存於 PostgreSQL
 */

import { contractsApi } from './api';

// ==========================================
// Types
// ==========================================

export type ContractStatusType =
    | 'CTR_DRAFT'
    | 'CTR_PENDING'
    | 'CTR_ACTIVE'
    | 'CTR_COMPLETED'
    | 'CTR_WARRANTY'
    | 'CTR_CLOSED'
    | 'CTR_TERMINATED';

export type ContractType = 'LUMP_SUM' | 'UNIT_PRICE' | 'COST_PLUS' | 'DESIGN_BUILD';

export interface PaymentTerm {
    name: string;
    percentage: number;
    trigger: string;
}

export interface PaymentTermTemplate {
    id: string;
    name: string;
    terms: PaymentTerm[];
}

export interface Contract {
    id: string;
    contractNo: string;
    projectId: string;
    quotationId?: string;
    title: string;
    contractType: ContractType;
    status: ContractStatusType;
    originalAmount: number;
    currentAmount: number;
    paidAmount: number;
    retentionRate: number;
    paymentTerms: string;
    warrantyMonths: number;
    signedAt?: string;
    completedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ContractStats {
    total: number;
    active: number;
    completed: number;
    warranty: number;
    totalAmount: number;
    totalPaid: number;
}

export interface ContractFilters {
    status?: ContractStatusType;
    projectId?: string;
}

export interface CreateContractFromQuotationData {
    quotationId: string;
    contractNo?: string;
    paymentTerms?: string;
    retentionRate?: number;
    warrantyMonths?: number;
}

export interface CreateContractData {
    projectId: string;
    contractNo: string;
    title: string;
    contractType?: ContractType;
    originalAmount?: number;
    amount?: number;
    retentionRate?: number;
    paymentTerms?: string;
    warrantyMonths?: number;
    notes?: string;
}

// ==========================================
// Constants
// ==========================================

export const CONTRACT_STATUS: Record<string, ContractStatusType> = {
    DRAFT: 'CTR_DRAFT',
    PENDING_SIGN: 'CTR_PENDING',
    ACTIVE: 'CTR_ACTIVE',
    COMPLETED: 'CTR_COMPLETED',
    WARRANTY: 'CTR_WARRANTY',
    CLOSED: 'CTR_CLOSED',
    TERMINATED: 'CTR_TERMINATED',
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
    CTR_DRAFT: '草稿',
    CTR_PENDING: '待簽約',
    CTR_ACTIVE: '履約中',
    CTR_COMPLETED: '已完工',
    CTR_WARRANTY: '保固期',
    CTR_CLOSED: '已結案',
    CTR_TERMINATED: '終止',
    DRAFT: '草稿',
    PENDING_SIGN: '待簽約',
    ACTIVE: '履約中',
    COMPLETED: '已完工',
    WARRANTY: '保固期',
    CLOSED: '已結案',
    TERMINATED: '終止',
};

export const CONTRACT_STATUS_COLORS: Record<string, string> = {
    CTR_DRAFT: 'bg-gray-100 text-gray-700',
    CTR_PENDING: 'bg-yellow-100 text-yellow-700',
    CTR_ACTIVE: 'bg-blue-100 text-blue-700',
    CTR_COMPLETED: 'bg-green-100 text-green-700',
    CTR_WARRANTY: 'bg-purple-100 text-purple-700',
    CTR_CLOSED: 'bg-gray-200 text-gray-600',
    CTR_TERMINATED: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING_SIGN: 'bg-yellow-100 text-yellow-700',
    ACTIVE: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    WARRANTY: 'bg-purple-100 text-purple-700',
    CLOSED: 'bg-gray-200 text-gray-600',
    TERMINATED: 'bg-red-100 text-red-700',
};

export const CONTRACT_TYPES: Record<string, ContractType> = {
    LUMP_SUM: 'LUMP_SUM',
    UNIT_PRICE: 'UNIT_PRICE',
    COST_PLUS: 'COST_PLUS',
    DESIGN_BUILD: 'DESIGN_BUILD',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
    LUMP_SUM: '總價承攬',
    UNIT_PRICE: '單價承攬',
    COST_PLUS: '成本加成',
    DESIGN_BUILD: '統包工程',
};

export const PAYMENT_TERM_TEMPLATES: PaymentTermTemplate[] = [
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

// ==========================================
// Utility Functions
// ==========================================

export const generateContractNo = (year: number, sequence: number): string => {
    return `CTR${year}-${String(sequence).padStart(4, '0')}`;
};

// ==========================================
// Service Class
// ==========================================

class ContractServiceClass {
    async getContracts(filters: ContractFilters = {}): Promise<Contract[]> {
        try {
            const params: Record<string, string> = {};
            if (filters.status) params.status = filters.status;
            if (filters.projectId) params.projectId = filters.projectId;

            const contracts = await contractsApi.getAll(params);
            return contracts.sort(
                (a: Contract, b: Contract) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } catch (error) {
            console.error('Failed to get contracts:', error);
            return [];
        }
    }

    async getContract(id: string): Promise<Contract | null> {
        try {
            return await contractsApi.getById(id);
        } catch (error) {
            console.error('Failed to get contract:', error);
            return null;
        }
    }

    async createFromQuotation(
        quotationId: string,
        additionalData: Partial<CreateContractFromQuotationData> = {}
    ): Promise<Contract> {
        const payload = {
            quotationId,
            contractNo: additionalData.contractNo,
            paymentTerms: additionalData.paymentTerms || 'PROGRESS',
            retentionRate: additionalData.retentionRate || 5,
            warrantyMonths: additionalData.warrantyMonths || 12,
        };

        return await contractsApi.convertFromQuotation(payload);
    }

    async createContract(data: CreateContractData): Promise<Contract> {
        const payload = {
            projectId: data.projectId,
            contractNo: data.contractNo,
            title: data.title,
            contractType: data.contractType || 'FIXED_PRICE',
            originalAmount: data.originalAmount || data.amount || 0,
            retentionRate: data.retentionRate || 5,
            paymentTerms: data.paymentTerms || 'PROGRESS',
            warrantyMonths: data.warrantyMonths || 12,
            notes: data.notes,
        };

        return await contractsApi.create(payload);
    }

    async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
        return await contractsApi.update(id, data);
    }

    async sign(id: string, signedDate: string): Promise<Contract> {
        return await contractsApi.sign(id, signedDate);
    }

    async complete(id: string): Promise<Contract> {
        return await contractsApi.complete(id);
    }

    async close(id: string): Promise<Contract> {
        return await contractsApi.close(id);
    }

    async getContractStats(): Promise<ContractStats> {
        const contracts = await this.getContracts();

        return {
            total: contracts.length,
            active: contracts.filter(c => c.status === CONTRACT_STATUS.ACTIVE).length,
            completed: contracts.filter(c => c.status === CONTRACT_STATUS.COMPLETED).length,
            warranty: contracts.filter(c => c.status === CONTRACT_STATUS.WARRANTY).length,
            totalAmount: contracts.reduce((sum, c) => sum + (Number(c.currentAmount) || 0), 0),
            totalPaid: contracts.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0),
        };
    }
}

export const ContractService = new ContractServiceClass();
export default ContractService;
