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

// ===== Clients API =====
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

// ===== Projects API =====
export const projectsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/projects${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/projects/${id}`),
    getSummary: (id) => api.get(`/projects/${id}/summary`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.patch(`/projects/${id}`, data),
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
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.patch(`/invoices/${id}`, data),
    issue: (id) => api.post(`/invoices/${id}/issue`),
    recordPayment: (id, data) => api.post(`/invoices/${id}/payment`, data),
    void: (id, reason) => api.post(`/invoices/${id}/void`, { reason }),
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
};

export default api;
