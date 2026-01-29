/**
 * api.ts
 *
 * Consolidated API service layer with TypeScript types
 * All endpoint definitions and HTTP utilities
 */

// Import shared types from central location
import type {
  Client,
  Project,
  Vendor,
  Quotation,
  QuotationItem,
  Contract,
} from '../types';

// Re-export for backward compatibility
export type { Client, Project, Vendor, Quotation, QuotationItem, Contract };

// ==========================================
// API-Specific Types
// ==========================================

export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  items?: T[];
  message?: string;
  total?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// API-specific extended types (not in central types)
export interface Payment {
  id: string;
  paymentNo?: string;
  projectId: string;
  contractId?: string;
  status: string;
  amount: number;
  dueDate?: string;
  createdAt?: string;
}

export interface ChangeOrder {
  id: string;
  changeOrderNo?: string;
  projectId: string;
  contractId?: string;
  status: string;
  amount: number;
  reason?: string;
  createdAt?: string;
}

export interface CostEntry {
  id: string;
  projectId: string;
  category: string;
  amount: number;
  description?: string;
  isPaid?: boolean;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNo?: string;
  projectId?: string;
  amount: number;
  status: string;
  issueDate?: string;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  spec?: string;
  quantity: number;
  unit: string;
  category?: string;
  location?: string;
  createdAt?: string;
}

export interface FinanceAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export interface FinanceTransaction {
  id: string;
  accountId: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  projectId?: string;
}

export interface FinanceLoan {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  status: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  projectId?: string;
  status?: string;
}

export interface SiteLog {
  id: string;
  projectId: string;
  date: string;
  weather?: string;
  status: string;
  createdAt?: string;
}

export interface Procurement {
  id: string;
  projectId: string;
  status: string;
  title: string;
  createdAt?: string;
}

// ==========================================
// API Configuration
// ==========================================

import { API_BASE_URL } from '../config/api';

// ==========================================
// API Service Class
// ==========================================

class ApiService {
  baseUrl: string;
  token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Read CSRF token from XSRF-TOKEN cookie (Double Submit Cookie pattern)
   */
  private getCsrfToken(): string | null {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  async request<T = unknown>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Read CSRF token from cookie (Double Submit Cookie pattern)
    const csrfToken = this.getCsrfToken();
    const isStateChangingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      (options.method || 'GET').toUpperCase()
    );

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(isStateChangingMethod && csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      if (response.status === 204 || contentLength === '0') {
        return { success: true } as T;
      }

      const text = await response.text();
      if (!text) {
        return { success: true } as T;
      }
      return JSON.parse(text) as T;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();

// ==========================================
// API Endpoints
// ==========================================

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  health: () => api.get('/auth/health'),
};

// Clients API
export const clientsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<PaginatedResponse<Client>>(`/clients${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (data: Partial<Client>) => api.post<Client>('/clients', data),
  update: (id: string, data: Partial<Client>) => api.patch<Client>(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
  getContacts: (clientId: string) => api.get(`/clients/${clientId}/contacts`),
  addContact: (clientId: string, data: unknown) => api.post(`/clients/${clientId}/contacts`, data),
  updateContact: (clientId: string, contactId: string, data: unknown) =>
    api.patch(`/clients/${clientId}/contacts/${contactId}`, data),
  removeContact: (clientId: string, contactId: string) =>
    api.delete(`/clients/${clientId}/contacts/${contactId}`),
};

// Customers API
export const customersApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/customers${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: unknown) => api.post('/customers', data),
  update: (id: string, data: unknown) => api.patch(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  updatePipelineStage: (id: string, stage: string) => api.patch(`/customers/${id}/pipeline`, { stage }),
  addContact: (customerId: string, data: unknown) => api.post(`/customers/${customerId}/contacts`, data),
  updateContact: (customerId: string, contactId: string, data: unknown) =>
    api.patch(`/customers/${customerId}/contacts/${contactId}`, data),
  removeContact: (customerId: string, contactId: string) =>
    api.delete(`/customers/${customerId}/contacts/${contactId}`),
};

// Projects API
export const projectsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<Project[]>(`/projects${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  getSummary: (id: string) => api.get(`/projects/${id}/summary`),
  getCostSummary: (id: string) => api.get(`/projects/${id}/cost-summary`),
  create: (data: Partial<Project>) => api.post<Project>('/projects', data),
  update: (id: string, data: Partial<Project>) => api.patch<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addPhase: (projectId: string, data: unknown) => api.post(`/projects/${projectId}/phases`, data),
  updatePhase: (projectId: string, phaseId: string, data: unknown) =>
    api.patch(`/projects/${projectId}/phases/${phaseId}`, data),
  removePhase: (projectId: string, phaseId: string) =>
    api.delete(`/projects/${projectId}/phases/${phaseId}`),
  addVendor: (projectId: string, data: unknown) => api.post(`/projects/${projectId}/vendors`, data),
  updateVendor: (projectId: string, vendorId: string, data: unknown) =>
    api.patch(`/projects/${projectId}/vendors/${vendorId}`, data),
  removeVendor: (projectId: string, vendorId: string) =>
    api.delete(`/projects/${projectId}/vendors/${vendorId}`),
  addTask: (projectId: string, data: unknown) => api.post(`/projects/${projectId}/tasks`, data),
  updateTask: (projectId: string, taskId: string, data: unknown) =>
    api.patch(`/projects/${projectId}/tasks/${taskId}`, data),
  removeTask: (projectId: string, taskId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
};

// Users API
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
};

// Quotations API
export const quotationsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<Quotation[]>(`/quotations${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Quotation>(`/quotations/${id}`),
  getVersions: (id: string) => api.get<Quotation[]>(`/quotations/${id}/versions`),
  create: (data: Partial<Quotation>) => api.post<Quotation>('/quotations', data),
  update: (id: string, data: Partial<Quotation>) => api.patch<Quotation>(`/quotations/${id}`, data),
  submit: (id: string) => api.post<Quotation>(`/quotations/${id}/submit`),
  approve: (id: string) => api.post<Quotation>(`/quotations/${id}/approve`),
  reject: (id: string, reason: string) => api.post<Quotation>(`/quotations/${id}/reject`, { reason }),
  createNewVersion: (id: string) => api.post<Quotation>(`/quotations/${id}/new-version`),
};

// Contracts API
export const contractsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<Contract[]>(`/contracts${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Contract>(`/contracts/${id}`),
  create: (data: Partial<Contract>) => api.post<Contract>('/contracts', data),
  convertFromQuotation: (data: { quotationId: string }) => api.post<Contract>('/contracts/from-quotation', data),
  update: (id: string, data: Partial<Contract>) => api.patch<Contract>(`/contracts/${id}`, data),
  sign: (id: string, signDate: string) => api.post<Contract>(`/contracts/${id}/sign`, { signDate }),
  complete: (id: string) => api.post<Contract>(`/contracts/${id}/complete`),
  close: (id: string) => api.post<Contract>(`/contracts/${id}/close`),
};

// Payments API
export const paymentsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<Payment[]>(`/payments${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Payment>(`/payments/${id}`),
  getReceipts: (id: string) => api.get(`/payments/${id}/receipts`),
  create: (data: Partial<Payment>) => api.post<Payment>('/payments', data),
  addReceipt: (data: unknown) => api.post('/payments/receipts', data),
  update: (id: string, data: Partial<Payment>) => api.patch<Payment>(`/payments/${id}`, data),
  submit: (id: string) => api.post<Payment>(`/payments/${id}/submit`),
  approve: (id: string) => api.post<Payment>(`/payments/${id}/approve`),
  reject: (id: string, reason: string) => api.post<Payment>(`/payments/${id}/reject`, { reason }),
};

// Change Orders API
export const changeOrdersApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<ChangeOrder[]>(`/change-orders${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<ChangeOrder>(`/change-orders/${id}`),
  create: (data: Partial<ChangeOrder>) => api.post<ChangeOrder>('/change-orders', data),
  update: (id: string, data: Partial<ChangeOrder>) => api.patch<ChangeOrder>(`/change-orders/${id}`, data),
  submit: (id: string) => api.post<ChangeOrder>(`/change-orders/${id}/submit`),
  approve: (id: string) => api.post<ChangeOrder>(`/change-orders/${id}/approve`),
  reject: (id: string, reason: string) => api.post<ChangeOrder>(`/change-orders/${id}/reject`, { reason }),
};

// Cost Entries API
export const costEntriesApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<CostEntry[]>(`/cost-entries${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<CostEntry>(`/cost-entries/${id}`),
  getSummary: (projectId: string) => api.get(`/cost-entries/summary/${projectId}`),
  create: (data: Partial<CostEntry>) => api.post<CostEntry>('/cost-entries', data),
  update: (id: string, data: Partial<CostEntry>) => api.patch<CostEntry>(`/cost-entries/${id}`, data),
  markPaid: (id: string, data: unknown = {}) => api.post(`/cost-entries/${id}/mark-paid`, data),
  delete: (id: string) => api.delete(`/cost-entries/${id}`),
};

// Invoices API
export const invoicesApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<Invoice[]>(`/invoices${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  getStats: () => api.get('/invoices/stats'),
  getMonthlyStats: (year: number, month: number) => api.get(`/invoices/stats/monthly?year=${year}&month=${month}`),
  create: (data: Partial<Invoice>) => api.post<Invoice>('/invoices', data),
  update: (id: string, data: Partial<Invoice>) => api.patch<Invoice>(`/invoices/${id}`, data),
  changeState: (id: string, state: string) => api.post(`/invoices/${id}/state`, { state }),
  submit: (id: string) => api.post(`/invoices/${id}/submit`),
  approve: (id: string) => api.post(`/invoices/${id}/approve`),
  reject: (id: string) => api.post(`/invoices/${id}/reject`),
  recordPayment: (id: string, amount: number) => api.post(`/invoices/${id}/payment`, { amount }),
  void: (id: string, reason: string) => api.post(`/invoices/${id}/void`, { reason }),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};

// Inventory API
export const inventoryApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<InventoryItem[]>(`/inventory${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<InventoryItem>(`/inventory/${id}`),
  create: (data: Partial<InventoryItem>) => api.post<InventoryItem>('/inventory', data),
  update: (id: string, data: Partial<InventoryItem>) => api.patch<InventoryItem>(`/inventory/${id}`, data),
  addStock: (id: string, data: { quantity: number; note?: string }) => api.post(`/inventory/${id}/add-stock`, data),
  removeStock: (id: string, data: { quantity: number; note?: string }) => api.post(`/inventory/${id}/remove-stock`, data),
  transferStock: (id: string, data: unknown) => api.post(`/inventory/${id}/transfer`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
};

// Finance API
export const financeApi = {
  getAccounts: () => api.get<FinanceAccount[]>('/finance/accounts'),
  createAccount: (data: Partial<FinanceAccount>) => api.post<FinanceAccount>('/finance/accounts', data),
  updateAccount: (id: string, data: Partial<FinanceAccount>) => api.patch<FinanceAccount>(`/finance/accounts/${id}`, data),
  deleteAccount: (id: string) => api.delete(`/finance/accounts/${id}`),
  getTransactions: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<FinanceTransaction[]>(`/finance/transactions${query ? `?${query}` : ''}`);
  },
  createTransaction: (data: Partial<FinanceTransaction>) => api.post<FinanceTransaction>('/finance/transactions', data),
  updateTransaction: (id: string, data: Partial<FinanceTransaction>) => api.patch<FinanceTransaction>(`/finance/transactions/${id}`, data),
  deleteTransaction: (id: string) => api.delete(`/finance/transactions/${id}`),
  getLoans: () => api.get<FinanceLoan[]>('/finance/loans'),
  createLoan: (data: Partial<FinanceLoan>) => api.post<FinanceLoan>('/finance/loans', data),
  updateLoan: (id: string, data: Partial<FinanceLoan>) => api.patch<FinanceLoan>(`/finance/loans/${id}`, data),
  deleteLoan: (id: string) => api.delete(`/finance/loans/${id}`),
  addLoanPayment: (id: string, data: { amount: number; date?: string }) => api.post(`/finance/loans/${id}/payment`, data),
};

// Vendors API
export const vendorsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<PaginatedResponse<Vendor>>(`/vendors${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Vendor>(`/vendors/${id}`),
  create: (data: Partial<Vendor>) => api.post<Vendor>('/vendors', data),
  update: (id: string, data: Partial<Vendor>) => api.patch<Vendor>(`/vendors/${id}`, data),
  updateRating: (id: string, rating: number) => api.patch(`/vendors/${id}/rating`, { rating }),
  blacklist: (id: string, reason: string) => api.post(`/vendors/${id}/blacklist`, { reason }),
  activate: (id: string) => api.post(`/vendors/${id}/activate`),
  delete: (id: string) => api.delete(`/vendors/${id}`),
  addTrade: (vendorId: string, data: unknown) => api.post(`/vendors/${vendorId}/trades`, data),
  updateTrade: (vendorId: string, tradeId: string, data: unknown) =>
    api.patch(`/vendors/${vendorId}/trades/${tradeId}`, data),
  removeTrade: (vendorId: string, tradeId: string) =>
    api.delete(`/vendors/${vendorId}/trades/${tradeId}`),
};

// Events API
export const eventsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<CalendarEvent[]>(`/events${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<CalendarEvent>(`/events/${id}`),
  getToday: () => api.get<CalendarEvent[]>('/events/today'),
  getUpcoming: (days = 7) => api.get<CalendarEvent[]>(`/events/upcoming?days=${days}`),
  getByProject: (projectId: string) => api.get<CalendarEvent[]>(`/events/project/${projectId}`),
  create: (data: Partial<CalendarEvent>) => api.post<CalendarEvent>('/events', data),
  update: (id: string, data: Partial<CalendarEvent>) => api.patch<CalendarEvent>(`/events/${id}`, data),
  complete: (id: string) => api.post(`/events/${id}/complete`),
  cancel: (id: string) => api.post(`/events/${id}/cancel`),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Storage API
export const storageApi = {
  getStatus: () => api.get('/storage/status'),
  upload: async (file: File, destination = 'uploads') => {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${api.baseUrl}/storage/upload?destination=${encodeURIComponent(destination)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(api.token && { Authorization: `Bearer ${api.token}` }),
      },
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },
  getSignedUrl: (fileName: string, expiresInDays = 7) =>
    api.post('/storage/signed-url', { fileName, expiresInDays }),
  delete: (fileName: string) => {
    const encodedFileName = btoa(fileName);
    return api.delete(`/storage/${encodedFileName}`);
  },
};

// Procurements API
export const procurementsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<Procurement[]>(`/procurements${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Procurement>(`/procurements/${id}`),
  getComparison: (id: string) => api.get(`/procurements/${id}/comparison`),
  create: (data: Partial<Procurement>) => api.post<Procurement>('/procurements', data),
  update: (id: string, data: Partial<Procurement>) => api.patch<Procurement>(`/procurements/${id}`, data),
  delete: (id: string) => api.delete(`/procurements/${id}`),
  sendRfq: (id: string, vendorIds: string[]) => api.post(`/procurements/${id}/send-rfq`, { vendorIds }),
  submitBid: (id: string, data: unknown) => api.post(`/procurements/${id}/bids`, data),
  evaluateBid: (bidId: string, data: unknown) => api.patch(`/procurements/bids/${bidId}/evaluate`, data),
  award: (id: string, data: unknown) => api.post(`/procurements/${id}/award`, data),
};

// Site Logs API
export const siteLogsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<SiteLog[]>(`/site-logs${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<SiteLog>(`/site-logs/${id}`),
  getProjectSummary: (projectId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/site-logs/project/${projectId}/summary${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: Partial<SiteLog>) => api.post<SiteLog>('/site-logs', data),
  update: (id: string, data: Partial<SiteLog>) => api.patch<SiteLog>(`/site-logs/${id}`, data),
  delete: (id: string) => api.delete(`/site-logs/${id}`),
  submit: (id: string) => api.post(`/site-logs/${id}/submit`),
  approve: (id: string) => api.post(`/site-logs/${id}/approve`),
  reject: (id: string, reason: string) => api.post(`/site-logs/${id}/reject`, { reason }),
};

export default api;
