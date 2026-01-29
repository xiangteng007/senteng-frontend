/**
 * useApiData.ts
 *
 * Custom hook for loading and managing data from API with Google Sheets fallback
 */

import { useState, useEffect, useCallback } from 'react';
import { clientsApi, projectsApi, vendorsApi, inventoryApi, financeApi } from './api';
import { GoogleService } from './GoogleService';

// ==========================================
// Types
// ==========================================

export interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    status: string;
    type: string;
    taxId: string;
    contactPerson: string;
    lineId: string;
    driveFolder: string;
    createdAt: string;
    customFields: unknown[];
    contactLogs: unknown[];
}

export interface Project {
    id: string;
    name: string;
    client: string;
    clientId: string;
    status: string;
    startDate: string;
    endDate: string;
    budget: number;
    description: string;
    folderUrl: string;
    createdAt: string;
    originalAmount: number;
    currentAmount: number;
    costBudget: number;
    costActual: number;
}

export interface Vendor {
    id: string;
    name: string;
    type: string;
    taxId: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    bankName: string;
    bankAccount: string;
    paymentTerms: number;
    status: string;
    rating: number;
    notes: string;
    createdAt: string;
}

export interface FinanceAccount {
    id: string;
    name: string;
    type: string;
    balance: number;
}

export interface FinanceTransaction {
    id: string;
    date: string;
    amount: number;
    type: string;
    category: string;
    description: string;
}

export interface FinanceLoan {
    id: string;
    amount: number;
    interestRate: number;
    status: string;
}

export interface FinanceData {
    accounts: FinanceAccount[];
    transactions: FinanceTransaction[];
    loans: FinanceLoan[];
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
}

export interface AppData {
    clients: Client[];
    projects: Project[];
    finance: FinanceData;
    vendors: Vendor[];
    inventory: InventoryItem[];
    calendar: CalendarEvent[];
}

export interface ApiResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface UseApiDataReturn {
    data: AppData;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    handleUpdate: (key: keyof AppData, newData: unknown) => void;
    handleFinanceUpdate: (financeKey: keyof FinanceData, newData: unknown) => void;
    updateClients: (newClients: Client[]) => Promise<void>;
    createClient: (clientData: Partial<Client>) => Promise<ApiResult<Client>>;
    deleteClient: (id: string) => Promise<ApiResult<void>>;
    createProject: (projectData: Partial<Project>) => Promise<ApiResult<Project>>;
    updateProject: (id: string, projectData: Partial<Project>) => Promise<ApiResult<Project>>;
}

// ==========================================
// Default Data
// ==========================================

const DEFAULT_DATA: AppData = {
    clients: [],
    projects: [],
    finance: {
        accounts: [],
        transactions: [],
        loans: [],
    },
    vendors: [],
    inventory: [],
    calendar: [],
};

// ==========================================
// Mapping Functions
// ==========================================

interface ApiClient {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    status?: string;
    type?: string;
    taxId?: string;
    contactPerson?: string;
    createdAt?: string;
}

interface ApiProject {
    id: string;
    name: string;
    client?: { name?: string };
    clientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    contractAmount?: number;
    description?: string;
    createdAt?: string;
    originalAmount?: number;
    currentAmount?: number;
    costBudget?: number;
    costActual?: number;
}

interface ApiVendor {
    id: string;
    name: string;
    type?: string;
    taxId?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    bankName?: string;
    bankAccount?: string;
    paymentTerms?: number;
    status?: string;
    rating?: number;
    notes?: string;
    createdAt?: string;
}

function mapClientFromApi(apiClient: ApiClient): Client {
    return {
        id: apiClient.id,
        name: apiClient.name,
        phone: apiClient.phone || '',
        email: apiClient.email || '',
        address: apiClient.address || '',
        status: mapClientStatus(apiClient.status),
        type: apiClient.type || 'INDIVIDUAL',
        taxId: apiClient.taxId || '',
        contactPerson: apiClient.contactPerson || '',
        lineId: '',
        driveFolder: '',
        createdAt: apiClient.createdAt || '',
        customFields: [],
        contactLogs: [],
    };
}

function mapClientStatus(apiStatus?: string): string {
    const statusMap: Record<string, string> = {
        ACTIVE: '洽談中',
        VIP: '已簽約',
        NORMAL: '洽談中',
        INACTIVE: '暫緩',
    };
    return statusMap[apiStatus || ''] || '洽談中';
}

function mapProjectFromApi(apiProject: ApiProject): Project {
    return {
        id: apiProject.id,
        name: apiProject.name,
        client: apiProject.client?.name || '',
        clientId: apiProject.clientId || '',
        status: mapProjectStatus(apiProject.status),
        startDate: apiProject.startDate || '',
        endDate: apiProject.endDate || '',
        budget: Number(apiProject.contractAmount) || 0,
        description: apiProject.description || '',
        folderUrl: '',
        createdAt: apiProject.createdAt || '',
        originalAmount: Number(apiProject.originalAmount) || 0,
        currentAmount: Number(apiProject.currentAmount) || 0,
        costBudget: Number(apiProject.costBudget) || 0,
        costActual: Number(apiProject.costActual) || 0,
    };
}

function mapProjectStatus(apiStatus?: string): string {
    const statusMap: Record<string, string> = {
        PLANNING: '規劃中',
        QUOTED: '報價中',
        IN_PROGRESS: '進行中',
        COMPLETED: '已完工',
        ON_HOLD: '暫緩',
        CANCELLED: '已取消',
    };
    return statusMap[apiStatus || ''] || '規劃中';
}

function mapVendorFromApi(apiVendor: ApiVendor): Vendor {
    return {
        id: apiVendor.id,
        name: apiVendor.name,
        type: mapVendorType(apiVendor.type),
        taxId: apiVendor.taxId || '',
        contactPerson: apiVendor.contactPerson || '',
        phone: apiVendor.phone || '',
        email: apiVendor.email || '',
        address: apiVendor.address || '',
        bankName: apiVendor.bankName || '',
        bankAccount: apiVendor.bankAccount || '',
        paymentTerms: apiVendor.paymentTerms || 30,
        status: mapVendorStatus(apiVendor.status),
        rating: apiVendor.rating || 0,
        notes: apiVendor.notes || '',
        createdAt: apiVendor.createdAt || '',
    };
}

function mapVendorType(apiType?: string): string {
    const typeMap: Record<string, string> = {
        SUPPLIER: '材料商',
        SUBCONTRACTOR: '承包商',
        SERVICE: '服務商',
        OTHER: '其他',
    };
    return typeMap[apiType || ''] || '其他';
}

function mapVendorStatus(apiStatus?: string): string {
    const statusMap: Record<string, string> = {
        ACTIVE: '合作中',
        INACTIVE: '暫停',
        BLACKLISTED: '黑名單',
    };
    return statusMap[apiStatus || ''] || '合作中';
}

// ==========================================
// Hook
// ==========================================

export const useApiData = (isAuthenticated = false): UseApiDataReturn => {
    const [data, setData] = useState<AppData>(DEFAULT_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log('📥 Loading data from API...', { isAuthenticated });

        try {
            let clientsResult: PromiseSettledResult<unknown>;
            let projectsResult: PromiseSettledResult<unknown>;
            let vendorsResult: PromiseSettledResult<unknown>;

            if (isAuthenticated) {
                [clientsResult, projectsResult, vendorsResult] = await Promise.allSettled([
                    clientsApi.getAll(),
                    projectsApi.getAll(),
                    vendorsApi.getAll(),
                ]);
            } else {
                console.log('⚠️ Not authenticated, using mock data');
                setLoading(false);
                return;
            }

            const [inventoryResult, accountsResult, loansResult, transactionsResult] =
                await Promise.allSettled([
                    inventoryApi.getAll(),
                    financeApi.getAccounts(),
                    financeApi.getLoans(),
                    financeApi.getTransactions(),
                ]);

            setData(prev => {
                const newData = { ...prev };

                if (
                    clientsResult.status === 'fulfilled' &&
                    (clientsResult.value as { items?: ApiClient[] })?.items
                ) {
                    const items = (clientsResult.value as { items: ApiClient[] }).items;
                    newData.clients = items.map(mapClientFromApi);
                    console.log('✅ Clients loaded from API:', newData.clients.length);
                }

                if (projectsResult.status === 'fulfilled' && projectsResult.value) {
                    const projects = Array.isArray(projectsResult.value)
                        ? (projectsResult.value as ApiProject[])
                        : [];
                    newData.projects = projects.map(mapProjectFromApi);
                    console.log('✅ Projects loaded from API:', newData.projects.length);
                }

                if (vendorsResult.status === 'fulfilled' && vendorsResult.value) {
                    const vendorValue = vendorsResult.value as ApiVendor[] | { items: ApiVendor[] };
                    const vendors = Array.isArray(vendorValue)
                        ? vendorValue
                        : (vendorValue as { items: ApiVendor[] }).items || [];
                    newData.vendors = vendors.map(mapVendorFromApi);
                    console.log('✅ Vendors loaded from API:', newData.vendors.length);
                }

                if (inventoryResult.status === 'fulfilled' && inventoryResult.value) {
                    const invValue = inventoryResult.value as InventoryItem[] | { items: InventoryItem[] };
                    const inventory = Array.isArray(invValue) ? invValue : invValue.items || [];
                    newData.inventory = inventory;
                    console.log('✅ Inventory loaded from API:', newData.inventory.length);
                }

                type AccountsValue = FinanceAccount[] | { items: FinanceAccount[] };
                type LoansValue = FinanceLoan[] | { items: FinanceLoan[] };
                type TransactionsValue = FinanceTransaction[] | { items: FinanceTransaction[] };

                newData.finance = {
                    ...prev.finance,
                    accounts:
                        accountsResult.status === 'fulfilled' && accountsResult.value
                            ? Array.isArray(accountsResult.value)
                                ? (accountsResult.value as FinanceAccount[])
                                : ((accountsResult.value as AccountsValue) as { items: FinanceAccount[] }).items ||
                                []
                            : prev.finance.accounts,
                    loans:
                        loansResult.status === 'fulfilled' && loansResult.value
                            ? Array.isArray(loansResult.value)
                                ? (loansResult.value as FinanceLoan[])
                                : ((loansResult.value as LoansValue) as { items: FinanceLoan[] }).items || []
                            : prev.finance.loans,
                    transactions:
                        transactionsResult.status === 'fulfilled' && transactionsResult.value
                            ? Array.isArray(transactionsResult.value)
                                ? (transactionsResult.value as FinanceTransaction[])
                                : ((transactionsResult.value as TransactionsValue) as {
                                    items: FinanceTransaction[];
                                }).items || []
                            : prev.finance.transactions,
                };
                console.log('✅ Finance loaded from API');

                return newData;
            });

            console.log('✅ Data loaded successfully');
        } catch (err) {
            console.error('❌ Failed to load data:', err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, loadData]);

    // === CLIENTS ===
    const updateClients = async (newClients: Client[]): Promise<void> => {
        setData(prev => ({ ...prev, clients: newClients }));
        await GoogleService.syncToSheet('clients', newClients);
    };

    const createClient = async (clientData: Partial<Client>): Promise<ApiResult<Client>> => {
        try {
            const result = await clientsApi.create(clientData);
            const mapped = mapClientFromApi(result as ApiClient);
            setData(prev => ({ ...prev, clients: [...prev.clients, mapped] }));
            return { success: true, data: mapped };
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    };

    const deleteClient = async (id: string): Promise<ApiResult<void>> => {
        try {
            await clientsApi.delete(id);
            setData(prev => ({
                ...prev,
                clients: prev.clients.filter(c => c.id !== id),
            }));
            return { success: true };
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    };

    // === PROJECTS ===
    const createProject = async (projectData: Partial<Project>): Promise<ApiResult<Project>> => {
        try {
            const result = await projectsApi.create(projectData);
            const mapped = mapProjectFromApi(result as ApiProject);
            setData(prev => ({ ...prev, projects: [...prev.projects, mapped] }));
            return { success: true, data: mapped };
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    };

    const updateProject = async (
        id: string,
        projectData: Partial<Project>
    ): Promise<ApiResult<Project>> => {
        try {
            const result = await projectsApi.update(id, projectData);
            const mapped = mapProjectFromApi(result as ApiProject);
            setData(prev => ({
                ...prev,
                projects: prev.projects.map(p => (p.id === id ? mapped : p)),
            }));
            return { success: true, data: mapped };
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    };

    // === GENERIC UPDATE ===
    const handleUpdate = (key: keyof AppData, newData: unknown): void => {
        setData(prev => ({ ...prev, [key]: newData }));
    };

    const handleFinanceUpdate = (financeKey: keyof FinanceData, newData: unknown): void => {
        setData(prev => ({
            ...prev,
            finance: { ...prev.finance, [financeKey]: newData },
        }));
    };

    return {
        data,
        loading,
        error,
        reload: loadData,
        handleUpdate,
        handleFinanceUpdate,
        updateClients,
        createClient,
        deleteClient,
        createProject,
        updateProject,
    };
};

export default useApiData;
