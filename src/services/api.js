// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://erp-api-381507943724.asia-east1.run.app/api/v1';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include',  // Required for HttpOnly cookie auth
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // GET request
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PATCH request
    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiService();

// ===== Auth API =====
export const authApi = {
    login: (data) => api.post('/auth/login', data),
    health: () => api.get('/auth/health'),
};

// ===== Clients API (Legacy - use customersApi for new features) =====
export const clientsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/clients${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.patch(`/clients/${id}`, data),
    delete: (id) => api.delete(`/clients/${id}`),
};

// ===== Customers API (New unified platform) =====
export const customersApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/customers${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.patch(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
    // Pipeline management
    updatePipelineStage: (id, stage) => api.patch(`/customers/${id}/pipeline`, { stage }),
    // Contacts
    addContact: (customerId, data) => api.post(`/customers/${customerId}/contacts`, data),
    updateContact: (customerId, contactId, data) => api.patch(`/customers/${customerId}/contacts/${contactId}`, data),
    removeContact: (customerId, contactId) => api.delete(`/customers/${customerId}/contacts/${contactId}`),
};

// ===== Projects API =====
export const projectsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/projects${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/projects/${id}`),
    getSummary: (id) => api.get(`/projects/${id}/summary`),
    getCostSummary: (id) => api.get(`/projects/${id}/cost-summary`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.patch(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    // Phases (WBS)
    addPhase: (projectId, data) => api.post(`/projects/${projectId}/phases`, data),
    updatePhase: (projectId, phaseId, data) => api.patch(`/projects/${projectId}/phases/${phaseId}`, data),
    removePhase: (projectId, phaseId) => api.delete(`/projects/${projectId}/phases/${phaseId}`),
    // Project Vendors
    addVendor: (projectId, data) => api.post(`/projects/${projectId}/vendors`, data),
    updateVendor: (projectId, vendorId, data) => api.patch(`/projects/${projectId}/vendors/${vendorId}`, data),
    removeVendor: (projectId, vendorId) => api.delete(`/projects/${projectId}/vendors/${vendorId}`),
    // Tasks
    addTask: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
    updateTask: (projectId, taskId, data) => api.patch(`/projects/${projectId}/tasks/${taskId}`, data),
    removeTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
};

// ===== Users API =====
export const usersApi = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
};

// ===== Quotations API =====
export const quotationsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/quotations${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/quotations/${id}`),
    getVersions: (id) => api.get(`/quotations/${id}/versions`),
    create: (data) => api.post('/quotations', data),
    update: (id, data) => api.patch(`/quotations/${id}`, data),
    submit: (id) => api.post(`/quotations/${id}/submit`),
    approve: (id) => api.post(`/quotations/${id}/approve`),
    reject: (id, reason) => api.post(`/quotations/${id}/reject`, { reason }),
    createNewVersion: (id) => api.post(`/quotations/${id}/new-version`),
};

// ===== Contracts API =====
export const contractsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/contracts${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/contracts/${id}`),
    create: (data) => api.post('/contracts', data),
    convertFromQuotation: (data) => api.post('/contracts/from-quotation', data),
    update: (id, data) => api.patch(`/contracts/${id}`, data),
    sign: (id, signDate) => api.post(`/contracts/${id}/sign`, { signDate }),
    complete: (id) => api.post(`/contracts/${id}/complete`),
    close: (id) => api.post(`/contracts/${id}/close`),
};

// ===== Payments API =====
export const paymentsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/payments${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/payments/${id}`),
    getReceipts: (id) => api.get(`/payments/${id}/receipts`),
    create: (data) => api.post('/payments', data),
    addReceipt: (data) => api.post('/payments/receipts', data),
    update: (id, data) => api.patch(`/payments/${id}`, data),
    submit: (id) => api.post(`/payments/${id}/submit`),
    approve: (id) => api.post(`/payments/${id}/approve`),
    reject: (id, reason) => api.post(`/payments/${id}/reject`, { reason }),
};

// ===== Change Orders API =====
export const changeOrdersApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/change-orders${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/change-orders/${id}`),
    create: (data) => api.post('/change-orders', data),
    update: (id, data) => api.patch(`/change-orders/${id}`, data),
    submit: (id) => api.post(`/change-orders/${id}/submit`),
    approve: (id) => api.post(`/change-orders/${id}/approve`),
    reject: (id, reason) => api.post(`/change-orders/${id}/reject`, { reason }),
};

// ===== Cost Entries API =====
export const costEntriesApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/cost-entries${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/cost-entries/${id}`),
    getSummary: (projectId) => api.get(`/cost-entries/summary/${projectId}`),
    create: (data) => api.post('/cost-entries', data),
    update: (id, data) => api.patch(`/cost-entries/${id}`, data),
    markPaid: (id, data = {}) => api.post(`/cost-entries/${id}/mark-paid`, data),
    delete: (id) => api.delete(`/cost-entries/${id}`),
};

// ===== Invoices API =====
export const invoicesApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/invoices${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/invoices/${id}`),
    getStats: () => api.get('/invoices/stats'),
    getMonthlyStats: (year, month) => api.get(`/invoices/stats/monthly?year=${year}&month=${month}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.patch(`/invoices/${id}`, data),
    changeState: (id, state) => api.post(`/invoices/${id}/state`, { state }),
    submit: (id) => api.post(`/invoices/${id}/submit`),
    approve: (id) => api.post(`/invoices/${id}/approve`),
    reject: (id) => api.post(`/invoices/${id}/reject`),
    recordPayment: (id, amount) => api.post(`/invoices/${id}/payment`, { amount }),
    void: (id, reason) => api.post(`/invoices/${id}/void`, { reason }),
    delete: (id) => api.delete(`/invoices/${id}`),
};

// ===== Inventory API =====
export const inventoryApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/inventory${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/inventory/${id}`),
    create: (data) => api.post('/inventory', data),
    update: (id, data) => api.patch(`/inventory/${id}`, data),
    // Inventory movements
    addStock: (id, data) => api.post(`/inventory/${id}/add-stock`, data),
    removeStock: (id, data) => api.post(`/inventory/${id}/remove-stock`, data),
    transferStock: (id, data) => api.post(`/inventory/${id}/transfer`, data),
    delete: (id) => api.delete(`/inventory/${id}`),
};

// ===== Finance API =====
export const financeApi = {
    // Accounts
    getAccounts: () => api.get('/finance/accounts'),
    createAccount: (data) => api.post('/finance/accounts', data),
    updateAccount: (id, data) => api.patch(`/finance/accounts/${id}`, data),
    deleteAccount: (id) => api.delete(`/finance/accounts/${id}`),
    // Transactions
    getTransactions: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/finance/transactions${query ? `?${query}` : ''}`);
    },
    createTransaction: (data) => api.post('/finance/transactions', data),
    updateTransaction: (id, data) => api.patch(`/finance/transactions/${id}`, data),
    deleteTransaction: (id) => api.delete(`/finance/transactions/${id}`),
    // Loans
    getLoans: () => api.get('/finance/loans'),
    createLoan: (data) => api.post('/finance/loans', data),
    updateLoan: (id, data) => api.patch(`/finance/loans/${id}`, data),
    deleteLoan: (id) => api.delete(`/finance/loans/${id}`),
    addLoanPayment: (id, data) => api.post(`/finance/loans/${id}/payment`, data),
};

// ===== Vendors API =====
export const vendorsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/vendors${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/vendors/${id}`),
    create: (data) => api.post('/vendors', data),
    update: (id, data) => api.patch(`/vendors/${id}`, data),
    updateRating: (id, rating) => api.patch(`/vendors/${id}/rating`, { rating }),
    blacklist: (id, reason) => api.post(`/vendors/${id}/blacklist`, { reason }),
    activate: (id) => api.post(`/vendors/${id}/activate`),
    delete: (id) => api.delete(`/vendors/${id}`),
    // Trades management
    addTrade: (vendorId, data) => api.post(`/vendors/${vendorId}/trades`, data),
    updateTrade: (vendorId, tradeId, data) => api.patch(`/vendors/${vendorId}/trades/${tradeId}`, data),
    removeTrade: (vendorId, tradeId) => api.delete(`/vendors/${vendorId}/trades/${tradeId}`),
};

// ===== Events API =====
export const eventsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/events${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/events/${id}`),
    getToday: () => api.get('/events/today'),
    getUpcoming: (days = 7) => api.get(`/events/upcoming?days=${days}`),
    getByProject: (projectId) => api.get(`/events/project/${projectId}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.patch(`/events/${id}`, data),
    complete: (id) => api.post(`/events/${id}/complete`),
    cancel: (id) => api.post(`/events/${id}/cancel`),
    delete: (id) => api.delete(`/events/${id}`),
};

// ===== Storage API =====
export const storageApi = {
    getStatus: () => api.get('/storage/status'),
    upload: async (file, destination = 'uploads') => {
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
    getSignedUrl: (fileName, expiresInDays = 7) =>
        api.post('/storage/signed-url', { fileName, expiresInDays }),
    delete: (fileName) => {
        const encodedFileName = btoa(fileName);
        return api.delete(`/storage/${encodedFileName}`);
    },
};

// ===== Procurements API (RFQ/Bidding) =====
export const procurementsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/procurements${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/procurements/${id}`),
    getComparison: (id) => api.get(`/procurements/${id}/comparison`),
    create: (data) => api.post('/procurements', data),
    update: (id, data) => api.patch(`/procurements/${id}`, data),
    delete: (id) => api.delete(`/procurements/${id}`),
    // RFQ workflow
    sendRfq: (id, vendorIds) => api.post(`/procurements/${id}/send-rfq`, { vendorIds }),
    // Bidding
    submitBid: (id, data) => api.post(`/procurements/${id}/bids`, data),
    evaluateBid: (bidId, data) => api.patch(`/procurements/bids/${bidId}/evaluate`, data),
    // Award
    award: (id, data) => api.post(`/procurements/${id}/award`, data),
};

// ===== Site Logs API =====
export const siteLogsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/site-logs${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/site-logs/${id}`),
    getProjectSummary: (projectId, startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return api.get(`/site-logs/project/${projectId}/summary${params.toString() ? `?${params}` : ''}`);
    },
    create: (data) => api.post('/site-logs', data),
    update: (id, data) => api.patch(`/site-logs/${id}`, data),
    delete: (id) => api.delete(`/site-logs/${id}`),
    // Workflow
    submit: (id) => api.post(`/site-logs/${id}/submit`),
    approve: (id) => api.post(`/site-logs/${id}/approve`),
    reject: (id, reason) => api.post(`/site-logs/${id}/reject`, { reason }),
};

export default api;
