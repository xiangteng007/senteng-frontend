import React, { useState, useEffect, useCallback } from 'react';
import { customersApi, projectsApi } from '../services/api';
import {
    Plus, Search, MoreHorizontal, Phone, Mail, MapPin, ArrowRight,
    Building2, User, Filter, ChevronDown, X, Loader2, AlertCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

const PIPELINE_STAGES = [
    { id: 'LEAD', label: '潛在客戶', color: 'gray' },
    { id: 'NEGOTIATING', label: '洽談中', color: 'blue' },
    { id: 'CONTRACTED', label: '已簽約', color: 'green' },
    { id: 'COMPLETED', label: '已完工', color: 'purple' },
    { id: 'LOST', label: '已流失', color: 'red' },
];

const CustomersPage = ({ addToast }) => {
    const [customers, setCustomers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStage, setFilterStage] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [customersRes, projectsRes] = await Promise.all([
                customersApi.getAll(),
                projectsApi.getAll(),
            ]);
            setCustomers(customersRes.items || customersRes.data || (Array.isArray(customersRes) ? customersRes : []));
            setProjects(projectsRes.items || projectsRes.data || (Array.isArray(projectsRes) ? projectsRes : []));
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch customers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async (formData) => {
        try {
            await customersApi.create(formData);
            addToast?.('客戶建立成功', 'success');
            setShowAddModal(false);
            fetchData();
        } catch (err) {
            addToast?.(err.message, 'error');
        }
    };

    const handleUpdateStage = async (customerId, newStage) => {
        try {
            await customersApi.updatePipelineStage(customerId, newStage);
            addToast?.('Pipeline 階段已更新', 'success');
            fetchData();
        } catch (err) {
            addToast?.(err.message, 'error');
        }
    };

    const filteredCustomers = customers.filter((c) => {
        const matchesSearch =
            !search ||
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search) ||
            c.email?.toLowerCase().includes(search.toLowerCase());
        const matchesStage = filterStage === 'all' || c.pipelineStage === filterStage;
        return matchesSearch && matchesStage;
    });

    const stageStats = PIPELINE_STAGES.map((stage) => ({
        ...stage,
        count: customers.filter((c) => c.pipelineStage === stage.id).length,
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        const isAuthError = error.toLowerCase().includes('unauthorized') ||
            error.toLowerCase().includes('missing authentication') ||
            error.toLowerCase().includes('permission') ||
            error.toLowerCase().includes('forbidden');
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">
                    {isAuthError ? '權限不足' : '系統錯誤'}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-md text-center">
                    {isAuthError
                        ? '您沒有存取客戶 CRM 的權限，請聯繫管理員啟用 customers:read 權限'
                        : error
                    }
                </p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm"
                >
                    重試
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">客戶 CRM</h2>
                    <p className="text-sm text-gray-500 mt-1">管理客戶 Pipeline 與聯絡資訊</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} /> 新增客戶
                </button>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stageStats.map((stage) => (
                    <Card
                        key={stage.id}
                        className={`cursor-pointer transition-all ${filterStage === stage.id ? 'ring-2 ring-gray-800' : ''
                            }`}
                        onClick={() => setFilterStage(filterStage === stage.id ? 'all' : stage.id)}
                    >
                        <div className="flex justify-between items-start">
                            <Badge color={stage.color}>{stage.label}</Badge>
                            <span className="text-2xl font-bold text-gray-800">{stage.count}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜尋姓名、電話、Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>
            </div>

            {/* Customer List */}
            {filteredCustomers.length === 0 ? (
                <Card className="text-center py-12">
                    <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">尚無客戶資料</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                        新增第一位客戶
                    </button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <CustomerCard
                            key={customer.id}
                            customer={customer}
                            onUpdateStage={handleUpdateStage}
                            onClick={() => setSelectedCustomer(customer)}
                        />
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <CustomerModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleCreate}
                />
            )}

            {/* Detail Modal */}
            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onUpdate={fetchData}
                    addToast={addToast}
                />
            )}
        </div>
    );
};

const CustomerCard = ({ customer, onUpdateStage, onClick }) => {
    const stage = PIPELINE_STAGES.find((s) => s.id === customer.pipelineStage) || PIPELINE_STAGES[0];

    return (
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                        {customer.name?.[0] || 'C'}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{customer.name}</h3>
                        <Badge color={stage.color} className="mt-1">
                            {stage.label}
                        </Badge>
                    </div>
                </div>
                <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
                {customer.phone && (
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {customer.phone}
                    </div>
                )}
                {customer.email && (
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {customer.email}
                    </div>
                )}
                {customer.address && (
                    <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 mt-0.5" />
                        <span className="truncate">{customer.address}</span>
                    </div>
                )}
            </div>

            {customer.source && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">來源: {customer.source}</span>
                </div>
            )}
        </Card>
    );
};

const CustomerModal = ({ onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState(
        initialData || {
            name: '',
            phone: '',
            email: '',
            address: '',
            source: '',
            pipelineStage: 'LEAD',
            notes: '',
        }
    );
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Filter out empty strings to avoid validation errors on optional fields
            const cleanedData = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
            );
            await onSubmit(cleanedData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold">{initialData ? '編輯客戶' : '新增客戶'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            客戶名稱 *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                電話
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            地址
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                來源
                            </label>
                            <select
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="">選擇來源</option>
                                <option value="REFERRAL">轉介紹</option>
                                <option value="WEBSITE">官網</option>
                                <option value="SOCIAL">社群媒體</option>
                                <option value="ADVERTISEMENT">廣告</option>
                                <option value="OTHER">其他</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pipeline 階段
                            </label>
                            <select
                                value={formData.pipelineStage}
                                onChange={(e) => setFormData({ ...formData, pipelineStage: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                {PIPELINE_STAGES.map((stage) => (
                                    <option key={stage.id} value={stage.id}>
                                        {stage.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            備註
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            {saving ? '儲存中...' : '儲存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CustomerDetailModal = ({ customer, onClose, onUpdate, addToast }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold">{customer.name}</h3>
                        <Badge color={PIPELINE_STAGES.find((s) => s.id === customer.pipelineStage)?.color || 'gray'}>
                            {PIPELINE_STAGES.find((s) => s.id === customer.pipelineStage)?.label || customer.pipelineStage}
                        </Badge>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider">電話</label>
                            <p className="font-medium">{customer.phone || '-'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
                            <p className="font-medium">{customer.email || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-400 uppercase tracking-wider">地址</label>
                            <p className="font-medium">{customer.address || '-'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider">來源</label>
                            <p className="font-medium">{customer.source || '-'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider">建立日期</label>
                            <p className="font-medium">
                                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('zh-TW') : '-'}
                            </p>
                        </div>
                    </div>

                    {customer.notes && (
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider">備註</label>
                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomersPage;
