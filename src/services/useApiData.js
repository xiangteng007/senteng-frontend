import { useState, useEffect, useCallback } from 'react';
import { clientsApi, projectsApi, vendorsApi, quotationsApi, contractsApi, paymentsApi } from './api';
import { GoogleService } from './GoogleService';
import { MOCK_DB } from './MockData';

/**
 * Custom hook for loading and managing data from API with Google Sheets fallback
 */
export const useApiData = () => {
    const [data, setData] = useState(MOCK_DB);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load all data from API
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log('📥 Loading data from API...');

        try {
            // Load from API in parallel
            const [clientsResult, projectsResult, vendorsResult] = await Promise.allSettled([
                clientsApi.getAll(),
                projectsApi.getAll(),
                vendorsApi.getAll(),
            ]);

            // Load from Google Sheets as fallback for other data (no backend yet)
            const [inventoryResult, accountsResult, loansResult, transactionsResult] =
                await Promise.all([
                    GoogleService.loadFromSheet('inventory'),
                    GoogleService.loadFromSheet('accounts'),
                    GoogleService.loadFromSheet('loans'),
                    GoogleService.loadFromSheet('transactions'),
                ]);

            setData(prev => {
                const newData = { ...prev };

                // Clients from API
                if (clientsResult.status === 'fulfilled' && clientsResult.value?.items) {
                    newData.clients = clientsResult.value.items.map(mapClientFromApi);
                    console.log('✅ Clients loaded from API:', newData.clients.length);
                }

                // Projects from API
                if (projectsResult.status === 'fulfilled' && projectsResult.value) {
                    const projects = Array.isArray(projectsResult.value) ? projectsResult.value : [];
                    newData.projects = projects.map(mapProjectFromApi);
                    console.log('✅ Projects loaded from API:', newData.projects.length);
                }

                // Vendors from API
                if (vendorsResult.status === 'fulfilled' && vendorsResult.value) {
                    const vendors = Array.isArray(vendorsResult.value)
                        ? vendorsResult.value
                        : (vendorsResult.value.items || []);
                    newData.vendors = vendors.map(mapVendorFromApi);
                    console.log('✅ Vendors loaded from API:', newData.vendors.length);
                }

                // Inventory from Google Sheets
                if (inventoryResult.success && inventoryResult.data?.length > 0) {
                    newData.inventory = inventoryResult.data;
                }

                // Finance from Google Sheets
                newData.finance = {
                    ...prev.finance,
                    accounts: accountsResult.success && accountsResult.data?.length > 0
                        ? accountsResult.data : prev.finance.accounts,
                    loans: loansResult.success && loansResult.data?.length > 0
                        ? loansResult.data : prev.finance.loans,
                    transactions: transactionsResult.success && transactionsResult.data?.length > 0
                        ? transactionsResult.data : prev.finance.transactions,
                };

                return newData;
            });

            console.log('✅ Data loaded successfully');
        } catch (err) {
            console.error('❌ Failed to load data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadData();
    }, [loadData]);

    // === CLIENTS ===
    const updateClients = async (newClients) => {
        setData(prev => ({ ...prev, clients: newClients }));
        await GoogleService.syncToSheet('clients', newClients);
    };

    const createClient = async (clientData) => {
        try {
            const result = await clientsApi.create(clientData);
            const mapped = mapClientFromApi(result);
            setData(prev => ({ ...prev, clients: [...prev.clients, mapped] }));
            return { success: true, data: mapped };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const deleteClient = async (id) => {
        try {
            await clientsApi.delete(id);
            setData(prev => ({
                ...prev,
                clients: prev.clients.filter(c => c.id !== id)
            }));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // === PROJECTS ===
    const createProject = async (projectData) => {
        try {
            const result = await projectsApi.create(projectData);
            const mapped = mapProjectFromApi(result);
            setData(prev => ({ ...prev, projects: [...prev.projects, mapped] }));
            return { success: true, data: mapped };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const updateProject = async (id, projectData) => {
        try {
            const result = await projectsApi.update(id, projectData);
            const mapped = mapProjectFromApi(result);
            setData(prev => ({
                ...prev,
                projects: prev.projects.map(p => p.id === id ? mapped : p)
            }));
            return { success: true, data: mapped };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // === GENERIC UPDATE (for non-API data) ===
    const handleUpdate = (key, newData) => {
        setData(prev => ({ ...prev, [key]: newData }));
    };

    const handleFinanceUpdate = (financeKey, newData) => {
        setData(prev => ({
            ...prev,
            finance: { ...prev.finance, [financeKey]: newData }
        }));
    };

    return {
        data,
        loading,
        error,
        reload: loadData,
        // Update methods
        handleUpdate,
        handleFinanceUpdate,
        updateClients,
        // API methods
        createClient,
        deleteClient,
        createProject,
        updateProject,
    };
};

// === Mapping Functions ===

function mapClientFromApi(apiClient) {
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
        lineId: '', // Not in API
        driveFolder: '', // Will be created separately
        createdAt: apiClient.createdAt,
        customFields: [],
        contactLogs: [],
    };
}

function mapClientStatus(apiStatus) {
    const statusMap = {
        'ACTIVE': '洽談中',
        'VIP': '已簽約',
        'NORMAL': '洽談中',
        'INACTIVE': '暫緩',
    };
    return statusMap[apiStatus] || '洽談中';
}

function mapProjectFromApi(apiProject) {
    return {
        id: apiProject.id,
        name: apiProject.name,
        client: apiProject.client?.name || '',
        clientId: apiProject.clientId,
        status: mapProjectStatus(apiProject.status),
        startDate: apiProject.startDate || '',
        endDate: apiProject.endDate || '',
        budget: Number(apiProject.contractAmount) || 0,
        description: apiProject.description || '',
        folderUrl: '', // Will be set separately
        createdAt: apiProject.createdAt,
        // Financial data
        originalAmount: Number(apiProject.originalAmount) || 0,
        currentAmount: Number(apiProject.currentAmount) || 0,
        costBudget: Number(apiProject.costBudget) || 0,
        costActual: Number(apiProject.costActual) || 0,
    };
}

function mapProjectStatus(apiStatus) {
    const statusMap = {
        'PLANNING': '規劃中',
        'QUOTED': '報價中',
        'IN_PROGRESS': '進行中',
        'COMPLETED': '已完工',
        'ON_HOLD': '暫緩',
        'CANCELLED': '已取消',
    };
    return statusMap[apiStatus] || '規劃中';
}

function mapVendorFromApi(apiVendor) {
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
        createdAt: apiVendor.createdAt,
    };
}

function mapVendorType(apiType) {
    const typeMap = {
        'SUPPLIER': '材料商',
        'SUBCONTRACTOR': '承包商',
        'SERVICE': '服務商',
        'OTHER': '其他',
    };
    return typeMap[apiType] || '其他';
}

function mapVendorStatus(apiStatus) {
    const statusMap = {
        'ACTIVE': '合作中',
        'INACTIVE': '暫停',
        'BLACKLISTED': '黑名單',
    };
    return statusMap[apiStatus] || '合作中';
}

export default useApiData;

