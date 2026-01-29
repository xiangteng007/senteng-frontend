/**
 * useApi.ts
 *
 * React Query Hooks with TypeScript
 * Pre-configured hooks for common API operations.
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api, Project, Client, Quotation, Contract, CalendarEvent, InventoryItem, FinanceTransaction } from '../services/api';

// ==========================================
// Types
// ==========================================

export interface QueryParams {
    [key: string]: string | number | boolean | undefined;
}

// ==========================================
// Query Keys
// ==========================================

export const queryKeys = {
    projects: ['projects'] as const,
    project: (id: string) => ['projects', id] as const,
    projectStats: ['projects', 'stats'] as const,
    clients: ['clients'] as const,
    client: (id: string) => ['clients', id] as const,
    clientContacts: (clientId: string) => ['clients', clientId, 'contacts'] as const,
    quotations: ['quotations'] as const,
    quotation: (id: string) => ['quotations', id] as const,
    contracts: ['contracts'] as const,
    contract: (id: string) => ['contracts', id] as const,
    events: ['events'] as const,
    event: (id: string) => ['events', id] as const,
    transactions: ['transactions'] as const,
    transaction: (id: string) => ['transactions', id] as const,
    financeStats: ['finance', 'stats'] as const,
    inventory: ['inventory'] as const,
    inventoryItem: (id: string) => ['inventory', id] as const,
    materials: ['materials'] as const,
    material: (id: string) => ['materials', id] as const,
    buildingTypes: ['buildingTypes'] as const,
    regulations: ['regulations'] as const,
    users: ['users'] as const,
    user: (id: string) => ['users', id] as const,
};

// ==========================================
// Projects Hooks
// ==========================================

export const useProjects = (params: QueryParams = {}): UseQueryResult<Project[]> => {
    return useQuery({
        queryKey: [...queryKeys.projects, params],
        queryFn: () => api.get<Project[]>('/projects', { params } as unknown as RequestInit),
    });
};

export const useProject = (id: string): UseQueryResult<Project> => {
    return useQuery({
        queryKey: queryKeys.project(id),
        queryFn: () => api.get<Project>(`/projects/${id}`),
        enabled: !!id,
    });
};

export const useCreateProject = (): UseMutationResult<Project, Error, Partial<Project>> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Project>) => api.post<Project>('/projects', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
        },
    });
};

export const useUpdateProject = (): UseMutationResult<Project, Error, { id: string; data: Partial<Project> }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => api.patch<Project>(`/projects/${id}`, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.project(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
        },
    });
};

// ==========================================
// Clients Hooks
// ==========================================

export const useClients = (params: QueryParams = {}): UseQueryResult<Client[]> => {
    return useQuery({
        queryKey: [...queryKeys.clients, params],
        queryFn: () => api.get<Client[]>('/clients', { params } as unknown as RequestInit),
    });
};

export const useClient = (id: string): UseQueryResult<Client> => {
    return useQuery({
        queryKey: queryKeys.client(id),
        queryFn: () => api.get<Client>(`/clients/${id}`),
        enabled: !!id,
    });
};

export const useCreateClient = (): UseMutationResult<Client, Error, Partial<Client>> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Client>) => api.post<Client>('/clients', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.clients });
        },
    });
};

// ==========================================
// Quotations Hooks
// ==========================================

export const useQuotations = (params: QueryParams = {}): UseQueryResult<Quotation[]> => {
    return useQuery({
        queryKey: [...queryKeys.quotations, params],
        queryFn: () => api.get<Quotation[]>('/quotations', { params } as unknown as RequestInit),
    });
};

export const useQuotation = (id: string): UseQueryResult<Quotation> => {
    return useQuery({
        queryKey: queryKeys.quotation(id),
        queryFn: () => api.get<Quotation>(`/quotations/${id}`),
        enabled: !!id,
    });
};

// ==========================================
// Contracts Hooks
// ==========================================

export const useContracts = (params: QueryParams = {}): UseQueryResult<Contract[]> => {
    return useQuery({
        queryKey: [...queryKeys.contracts, params],
        queryFn: () => api.get<Contract[]>('/contracts', { params } as unknown as RequestInit),
    });
};

export const useContract = (id: string): UseQueryResult<Contract> => {
    return useQuery({
        queryKey: queryKeys.contract(id),
        queryFn: () => api.get<Contract>(`/contracts/${id}`),
        enabled: !!id,
    });
};

// ==========================================
// Events Hooks
// ==========================================

export const useEvents = (params: QueryParams = {}): UseQueryResult<CalendarEvent[]> => {
    return useQuery({
        queryKey: [...queryKeys.events, params],
        queryFn: () => api.get<CalendarEvent[]>('/events', { params } as unknown as RequestInit),
    });
};

// ==========================================
// Finance Hooks
// ==========================================

export const useTransactions = (params: QueryParams = {}): UseQueryResult<FinanceTransaction[]> => {
    return useQuery({
        queryKey: [...queryKeys.transactions, params],
        queryFn: () => api.get<FinanceTransaction[]>('/finance/transactions', { params } as unknown as RequestInit),
    });
};

export const useFinanceStats = (): UseQueryResult<unknown> => {
    return useQuery({
        queryKey: queryKeys.financeStats,
        queryFn: () => api.get('/finance/stats'),
    });
};

// ==========================================
// Inventory Hooks
// ==========================================

export const useInventory = (params: QueryParams = {}): UseQueryResult<InventoryItem[]> => {
    return useQuery({
        queryKey: [...queryKeys.inventory, params],
        queryFn: () => api.get<InventoryItem[]>('/inventory', { params } as unknown as RequestInit),
    });
};

// ==========================================
// CMM Hooks
// ==========================================

export const useMaterials = (params: QueryParams = {}): UseQueryResult<unknown[]> => {
    return useQuery({
        queryKey: [...queryKeys.materials, params],
        queryFn: () => api.get('/cmm/materials', { params } as unknown as RequestInit),
        staleTime: 5 * 60 * 1000,
    });
};

export const useBuildingTypes = (): UseQueryResult<unknown[]> => {
    return useQuery({
        queryKey: queryKeys.buildingTypes,
        queryFn: () => api.get('/cmm/building-types'),
        staleTime: 10 * 60 * 1000,
    });
};

export const useRegulations = (): UseQueryResult<unknown[]> => {
    return useQuery({
        queryKey: queryKeys.regulations,
        queryFn: () => api.get('/regulations'),
        staleTime: 10 * 60 * 1000,
    });
};

// ==========================================
// Users Hooks
// ==========================================

export const useUsers = (params: QueryParams = {}): UseQueryResult<unknown[]> => {
    return useQuery({
        queryKey: [...queryKeys.users, params],
        queryFn: () => api.get('/users', { params } as unknown as RequestInit),
    });
};
