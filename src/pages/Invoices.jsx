/**
 * 發票管理頁面 (Invoices.jsx)
 * 發票列表與編輯器 - 串接專案、客戶、廠商、財務資料
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText, Plus, Search, Filter, Eye, Edit2, Trash2, Send,
    Check, X, DollarSign, Calendar, Building2, Users, Receipt,
    AlertCircle, Clock, CheckCircle, TrendingUp, Download, Upload,
    Printer, Copy, ExternalLink, Calculator
} from 'lucide-react';
import { SectionTitle } from '../components/common/Indicators';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import { projectsApi, clientsApi, vendorsApi } from '../services/api';

// ============================================
// 發票狀態與類型常量
// ============================================
export const INVOICE_STATUS = {
    DRAFT: 'DRAFT',
    ISSUED: 'ISSUED',
    SENT: 'SENT',
    PAID: 'PAID',
    PARTIAL: 'PARTIAL',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED',
};

export const INVOICE_STATUS_LABELS = {
    DRAFT: '草稿',
    ISSUED: '已開立',
    SENT: '已寄送',
    PAID: '已收款',
    PARTIAL: '部分收款',
    OVERDUE: '逾期',
    CANCELLED: '已作廢',
};

export const INVOICE_STATUS_COLORS = {
    DRAFT: 'bg-gray-100 text-gray-700',
    ISSUED: 'bg-blue-100 text-blue-700',
    SENT: 'bg-purple-100 text-purple-700',
    PAID: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-orange-100 text-orange-700',
    OVERDUE: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-300 text-gray-600',
};

export const INVOICE_TYPES = {
    SALES: 'SALES',         // 銷項發票 (開給客戶)
    PURCHASE: 'PURCHASE',   // 進項發票 (廠商開給我們)
};

export const INVOICE_TYPE_LABELS = {
    SALES: '銷項發票',
    PURCHASE: '進項發票',
};

// 發票格式 (二聯式/三聯式)
export const INVOICE_FORMATS = {
    TWO_COPY: 'TWO_COPY',     // 二聯式 (開給個人消費者)
    THREE_COPY: 'THREE_COPY', // 三聯式 (開給公司行號)
};

export const INVOICE_FORMAT_LABELS = {
    TWO_COPY: '二聯式',
    THREE_COPY: '三聯式',
};

// 稅率
export const TAX_RATES = {
    STANDARD: 0.05,  // 5% 營業稅
    ZERO: 0,         // 零稅率
    EXEMPT: 0,       // 免稅
};

// ============================================
// 格式化函數
// ============================================
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-TW');
};

// 產生發票號碼
const generateInvoiceNo = (type) => {
    const prefix = type === INVOICE_TYPES.SALES ? 'SI' : 'PI';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${month}-${random}`;
};

// ============================================
// 狀態徽章
// ============================================
const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${INVOICE_STATUS_COLORS[status]}`}>
        {INVOICE_STATUS_LABELS[status]}
    </span>
);

const TypeBadge = ({ type }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${type === INVOICE_TYPES.SALES
        ? 'bg-green-100 text-green-700'
        : 'bg-blue-100 text-blue-700'
        }`}>
        {INVOICE_TYPE_LABELS[type]}
    </span>
);

const FormatBadge = ({ format }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${format === INVOICE_FORMATS.THREE_COPY
        ? 'bg-indigo-100 text-indigo-700'
        : 'bg-amber-100 text-amber-700'
        }`}>
        {INVOICE_FORMAT_LABELS[format]}
    </span>
);

// ============================================
// 統計卡片
// ============================================
const StatCard = ({ icon: Icon, label, value, color = 'gray', subValue }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-100`}>
                <Icon size={20} className={`text-${color}-600`} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-xl font-bold text-${color}-600`}>{value}</p>
                {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
            </div>
        </div>
    </div>
);

// ============================================
// 發票項目表格
// ============================================
const InvoiceItemsTable = ({ items, setItems, isEditable, taxRate }) => {
    const addItem = () => {
        setItems([...items, {
            id: `item-${Date.now()}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            amount: 0,
        }]);
    };

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        if (field === 'quantity' || field === 'unitPrice') {
            updated[index].amount = updated[index].quantity * updated[index].unitPrice;
        }
        setItems(updated);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = Math.round(subtotal * taxRate);
    const total = subtotal + taxAmount;

    return (
        <div className="space-y-4">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-600">品名/說明</th>
                        <th className="py-2 px-3 text-center text-sm font-medium text-gray-600 w-24">數量</th>
                        <th className="py-2 px-3 text-right text-sm font-medium text-gray-600 w-32">單價</th>
                        <th className="py-2 px-3 text-right text-sm font-medium text-gray-600 w-32">金額</th>
                        {isEditable && <th className="py-2 px-3 w-12"></th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-2 px-3">
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    disabled={!isEditable}
                                    placeholder="項目說明"
                                    className="w-full px-2 py-1 border rounded"
                                />
                            </td>
                            <td className="py-2 px-3">
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    disabled={!isEditable}
                                    min="0"
                                    className="w-full px-2 py-1 border rounded text-center"
                                />
                            </td>
                            <td className="py-2 px-3">
                                <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    disabled={!isEditable}
                                    min="0"
                                    className="w-full px-2 py-1 border rounded text-right"
                                />
                            </td>
                            <td className="py-2 px-3 text-right font-medium">
                                {formatCurrency(item.amount)}
                            </td>
                            {isEditable && (
                                <td className="py-2 px-3 text-center">
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {isEditable && (
                <button
                    onClick={addItem}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                    <Plus size={16} /> 新增項目
                </button>
            )}

            {/* 金額合計 */}
            <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">小計</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">營業稅 ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>總計</span>
                    <span className="text-green-600">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};

// ============================================
// 發票編輯器
// ============================================
const InvoiceEditor = ({ invoice, onSave, onBack, addToast }) => {
    const [formData, setFormData] = useState({
        invoiceNo: invoice?.invoiceNo || generateInvoiceNo(INVOICE_TYPES.SALES),
        type: invoice?.type || INVOICE_TYPES.SALES,
        format: invoice?.format || INVOICE_FORMATS.THREE_COPY, // 預設三聯式
        status: invoice?.status || INVOICE_STATUS.DRAFT,
        issueDate: invoice?.issueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        dueDate: invoice?.dueDate?.split('T')[0] || '',
        // 關聯資料
        projectId: invoice?.projectId || '',
        projectName: invoice?.projectName || '',
        clientId: invoice?.clientId || '',
        clientName: invoice?.clientName || '',
        buyerTaxId: invoice?.buyerTaxId || '', // 買受人統一編號 (三聯式必填)
        vendorId: invoice?.vendorId || '',
        vendorName: invoice?.vendorName || '',
        // 金額
        taxRate: invoice?.taxRate ?? TAX_RATES.STANDARD,
        subtotal: invoice?.subtotal || 0,
        taxAmount: invoice?.taxAmount || 0,
        total: invoice?.total || 0,
        paidAmount: invoice?.paidAmount || 0,
        // 項目
        items: invoice?.items || [],
        // 其他
        notes: invoice?.notes || '',
        paymentTerms: invoice?.paymentTerms || '30天',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [vendors, setVendors] = useState([]);

    const isEditable = !invoice || formData.status === INVOICE_STATUS.DRAFT;

    // 載入關聯資料
    useEffect(() => {
        const loadData = async () => {
            try {
                const [projectsData, clientsData, vendorsData] = await Promise.all([
                    projectsApi.getAll().catch(() => []),
                    clientsApi.getAll().catch(() => []),
                    vendorsApi.getAll().catch(() => []),
                ]);
                setProjects(projectsData || []);
                setClients(clientsData || []);
                setVendors(vendorsData || []);
            } catch (error) {
                console.error('Load data error:', error);
            }
        };
        loadData();
    }, []);

    // 更新專案時同步客戶
    const handleProjectChange = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setFormData(prev => ({
                ...prev,
                projectId,
                projectName: project.name,
                clientId: project.clientId || '',
                clientName: project.clientName || '',
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                projectId: '',
                projectName: '',
            }));
        }
    };

    // 計算金額
    useEffect(() => {
        const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const taxAmount = Math.round(subtotal * formData.taxRate);
        const total = subtotal + taxAmount;
        setFormData(prev => ({ ...prev, subtotal, taxAmount, total }));
    }, [formData.items, formData.taxRate]);

    const handleSave = async () => {
        if (!formData.invoiceNo.trim()) {
            addToast?.('請輸入發票號碼', 'error');
            return;
        }
        if (formData.items.length === 0) {
            addToast?.('請至少新增一個項目', 'error');
            return;
        }
        // 三聯式銷項發票必須填寫統編
        if (formData.format === INVOICE_FORMATS.THREE_COPY &&
            formData.type === INVOICE_TYPES.SALES &&
            (!formData.buyerTaxId || formData.buyerTaxId.length !== 8)) {
            addToast?.('三聯式發票需填寫8碼統一編號', 'error');
            return;
        }

        setIsSaving(true);
        try {
            // 模擬 API 儲存
            await new Promise(resolve => setTimeout(resolve, 500));
            addToast?.('儲存成功', 'success');
            onSave?.();
        } catch (error) {
            console.error('Save error:', error);
            addToast?.('儲存失敗', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleIssue = async () => {
        setFormData(prev => ({ ...prev, status: INVOICE_STATUS.ISSUED }));
        await handleSave();
        addToast?.('發票已開立', 'success');
    };

    const handleCancel = async () => {
        if (!window.confirm('確定要作廢此發票？此操作無法復原。')) return;
        setFormData(prev => ({ ...prev, status: INVOICE_STATUS.CANCELLED }));
        await handleSave();
        addToast?.('發票已作廢', 'warning');
    };

    return (
        <div className="space-y-6">
            {/* 頂部導航 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        ← 返回
                    </button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Receipt size={24} className="text-purple-600" />
                            {invoice ? formData.invoiceNo : '新增發票'}
                        </h2>
                        {formData.projectName && (
                            <p className="text-sm text-gray-500">專案：{formData.projectName}</p>
                        )}
                    </div>
                    <StatusBadge status={formData.status} />
                    <TypeBadge type={formData.type} />
                    <FormatBadge format={formData.format} />
                </div>
                <div className="flex gap-2">
                    {isEditable && (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? '儲存中...' : '儲存草稿'}
                            </button>
                            <button
                                onClick={handleIssue}
                                disabled={isSaving}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Check size={18} /> 開立發票
                            </button>
                        </>
                    )}
                    {formData.status !== INVOICE_STATUS.DRAFT && formData.status !== INVOICE_STATUS.CANCELLED && (
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                        >
                            <Printer size={18} /> 列印
                        </button>
                    )}
                    {formData.status === INVOICE_STATUS.ISSUED && (
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                            <X size={18} /> 作廢
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* 左欄：基本資訊 */}
                <div className="col-span-2 space-y-6">
                    {/* 發票資訊 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <FileText size={18} /> 發票資訊
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">發票號碼 *</label>
                                <input
                                    type="text"
                                    value={formData.invoiceNo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                                    disabled={!isEditable}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">發票類型</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    disabled={!isEditable}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    {Object.entries(INVOICE_TYPE_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">發票格式 *</label>
                                <select
                                    value={formData.format}
                                    onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                                    disabled={!isEditable}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    {Object.entries(INVOICE_FORMAT_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formData.format === INVOICE_FORMATS.THREE_COPY
                                        ? '三聯式：開給公司行號，需填統編'
                                        : '二聯式：開給個人消費者'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">稅率</label>
                                <select
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                                    disabled={!isEditable}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value={TAX_RATES.STANDARD}>5% (一般稅率)</option>
                                    <option value={TAX_RATES.ZERO}>0% (零稅率)</option>
                                    <option value={TAX_RATES.EXEMPT}>免稅</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">開立日期</label>
                                <input
                                    type="date"
                                    value={formData.issueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                                    disabled={!isEditable}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">付款期限</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                    disabled={!isEditable}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">付款條件</label>
                                <input
                                    type="text"
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                                    disabled={!isEditable}
                                    placeholder="例：30天"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 關聯資料 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Building2 size={18} /> 關聯資料
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    <span className="flex items-center gap-1">
                                        <FileText size={14} /> 專案
                                    </span>
                                </label>
                                <select
                                    value={formData.projectId}
                                    onChange={(e) => handleProjectChange(e.target.value)}
                                    disabled={!isEditable}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">-- 選擇專案 --</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    <span className="flex items-center gap-1">
                                        <Users size={14} /> 客戶
                                    </span>
                                </label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => {
                                        const client = clients.find(c => c.id === e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            clientId: e.target.value,
                                            clientName: client?.name || '',
                                        }));
                                    }}
                                    disabled={!isEditable || formData.type === INVOICE_TYPES.PURCHASE}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">-- 選擇客戶 --</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    <span className="flex items-center gap-1">
                                        <Building2 size={14} /> 廠商
                                    </span>
                                </label>
                                <select
                                    value={formData.vendorId}
                                    onChange={(e) => {
                                        const vendor = vendors.find(v => v.id === e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            vendorId: e.target.value,
                                            vendorName: vendor?.name || '',
                                        }));
                                    }}
                                    disabled={!isEditable || formData.type === INVOICE_TYPES.SALES}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">-- 選擇廠商 --</option>
                                    {vendors.map(vendor => (
                                        <option key={vendor.id} value={vendor.id}>
                                            {vendor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* 買受人統編 - 三聯式必填 */}
                        {formData.format === INVOICE_FORMATS.THREE_COPY && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            買受人統一編號 {formData.type === INVOICE_TYPES.SALES ? '*' : ''}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.buyerTaxId}
                                            onChange={(e) => {
                                                // 只允許輸入數字，最多8碼
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                                                setFormData(prev => ({ ...prev, buyerTaxId: value }));
                                            }}
                                            disabled={!isEditable}
                                            placeholder="8碼統一編號"
                                            maxLength={8}
                                            className="w-full px-3 py-2 border rounded-lg font-mono"
                                        />
                                        {formData.buyerTaxId && formData.buyerTaxId.length !== 8 && (
                                            <p className="text-xs text-red-500 mt-1">統編需為8碼數字</p>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm text-gray-600 mb-1">買受人名稱</label>
                                        <input
                                            type="text"
                                            value={formData.clientName || formData.vendorName || ''}
                                            disabled
                                            className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            依據選擇的客戶或廠商自動填入
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 發票項目 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Receipt size={18} /> 發票項目
                        </h3>
                        <InvoiceItemsTable
                            items={formData.items}
                            setItems={(items) => setFormData(prev => ({ ...prev, items }))}
                            isEditable={isEditable}
                            taxRate={formData.taxRate}
                        />
                    </div>

                    {/* 備註 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold mb-4">備註</h3>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            disabled={!isEditable}
                            placeholder="發票備註、付款說明等..."
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg resize-none"
                        />
                    </div>
                </div>

                {/* 右欄：摘要資訊 */}
                <div className="space-y-4">
                    {/* 金額摘要 */}
                    <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl p-6 text-white">
                        <h3 className="font-semibold mb-4">金額摘要</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-purple-200">小計</span>
                                <span className="font-medium">{formatCurrency(formData.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-purple-200">營業稅 ({(formData.taxRate * 100).toFixed(0)}%)</span>
                                <span className="font-medium">{formatCurrency(formData.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold border-t border-purple-400 pt-3">
                                <span>總計</span>
                                <span>{formatCurrency(formData.total)}</span>
                            </div>
                            {formData.paidAmount > 0 && (
                                <>
                                    <div className="flex justify-between pt-2">
                                        <span className="text-purple-200">已收款</span>
                                        <span className="font-medium text-green-300">{formatCurrency(formData.paidAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-purple-200">未收款</span>
                                        <span className="font-medium text-orange-300">
                                            {formatCurrency(formData.total - formData.paidAmount)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 狀態資訊 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold mb-4">狀態資訊</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">狀態</span>
                                <StatusBadge status={formData.status} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">類型</span>
                                <TypeBadge type={formData.type} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">開立日期</span>
                                <span>{formatDate(formData.issueDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">付款期限</span>
                                <span>{formatDate(formData.dueDate) || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 關聯專案/客戶資訊 */}
                    {(formData.projectName || formData.clientName || formData.vendorName) && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold mb-4">關聯資料</h3>
                            <div className="space-y-3 text-sm">
                                {formData.projectName && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <FileText size={14} /> 專案
                                        </span>
                                        <span className="font-medium">{formData.projectName}</span>
                                    </div>
                                )}
                                {formData.clientName && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Users size={14} /> 客戶
                                        </span>
                                        <span className="font-medium">{formData.clientName}</span>
                                    </div>
                                )}
                                {formData.vendorName && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Building2 size={14} /> 廠商
                                        </span>
                                        <span className="font-medium">{formData.vendorName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================
// 發票列表
// ============================================
const InvoiceList = ({ onEdit, addToast }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');

    // 載入發票資料
    const loadInvoices = async () => {
        setLoading(true);
        try {
            // TODO: 串接發票 API
            // const data = await invoicesApi.getAll();
            // setInvoices(data || []);

            // 暫時設為空陣列，等待 API 實作
            setInvoices([]);
        } catch (error) {
            console.error('Load error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    // 篩選
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
            if (typeFilter !== 'ALL' && inv.type !== typeFilter) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    inv.invoiceNo?.toLowerCase().includes(term) ||
                    inv.projectName?.toLowerCase().includes(term) ||
                    inv.clientName?.toLowerCase().includes(term) ||
                    inv.vendorName?.toLowerCase().includes(term)
                );
            }
            return true;
        });
    }, [invoices, statusFilter, typeFilter, searchTerm]);

    // 統計
    const stats = useMemo(() => {
        const total = invoices.length;
        const salesCount = invoices.filter(i => i.type === INVOICE_TYPES.SALES).length;
        const purchaseCount = invoices.filter(i => i.type === INVOICE_TYPES.PURCHASE).length;
        const totalSalesAmount = invoices
            .filter(i => i.type === INVOICE_TYPES.SALES)
            .reduce((sum, i) => sum + (i.total || 0), 0);
        const totalPurchaseAmount = invoices
            .filter(i => i.type === INVOICE_TYPES.PURCHASE)
            .reduce((sum, i) => sum + (i.total || 0), 0);
        const unpaidAmount = invoices
            .filter(i => i.status !== INVOICE_STATUS.PAID && i.status !== INVOICE_STATUS.CANCELLED)
            .reduce((sum, i) => sum + ((i.total || 0) - (i.paidAmount || 0)), 0);

        return { total, salesCount, purchaseCount, totalSalesAmount, totalPurchaseAmount, unpaidAmount };
    }, [invoices]);

    const handleDelete = async (id) => {
        if (!window.confirm('確定要刪除此發票？')) return;
        setInvoices(invoices.filter(i => i.id !== id));
        addToast?.('已刪除', 'success');
    };

    return (
        <div className="space-y-6">
            {/* 標題 */}
            <div className="flex items-center justify-between">
                <SectionTitle
                    icon={Receipt}
                    title="發票管理"
                    subtitle="管理銷項/進項發票"
                />
                <button
                    onClick={() => onEdit(null)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> 新增發票
                </button>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <StatCard icon={FileText} label="全部發票" value={stats.total} color="gray" />
                <StatCard icon={TrendingUp} label="銷項發票" value={stats.salesCount} color="green" />
                <StatCard icon={Receipt} label="進項發票" value={stats.purchaseCount} color="blue" />
                <StatCard icon={DollarSign} label="銷項金額" value={formatCurrency(stats.totalSalesAmount)} color="green" />
                <StatCard icon={DollarSign} label="進項金額" value={formatCurrency(stats.totalPurchaseAmount)} color="blue" />
                <StatCard icon={AlertCircle} label="應收未收" value={formatCurrency(stats.unpaidAmount)} color="orange" />
            </div>

            {/* 搜尋與篩選 */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="搜尋發票號碼、專案、客戶、廠商..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white"
                >
                    <option value="ALL">全部類型</option>
                    {Object.entries(INVOICE_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white"
                >
                    <option value="ALL">全部狀態</option>
                    {Object.entries(INVOICE_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {/* 發票列表 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">發票號碼</th>
                            <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">類型</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">專案</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">對象</th>
                            <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">狀態</th>
                            <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">金額</th>
                            <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">已收/付</th>
                            <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">開立日期</th>
                            <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(invoice => (
                            <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 font-medium text-purple-600">{invoice.invoiceNo}</td>
                                <td className="py-3 px-4 text-center">
                                    <TypeBadge type={invoice.type} />
                                </td>
                                <td className="py-3 px-4">{invoice.projectName || '-'}</td>
                                <td className="py-3 px-4">
                                    {invoice.type === INVOICE_TYPES.SALES
                                        ? invoice.clientName
                                        : invoice.vendorName}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <StatusBadge status={invoice.status} />
                                </td>
                                <td className="py-3 px-4 text-right font-medium">
                                    {formatCurrency(invoice.total)}
                                </td>
                                <td className="py-3 px-4 text-right font-medium text-green-600">
                                    {formatCurrency(invoice.paidAmount)}
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-gray-500">
                                    {formatDate(invoice.issueDate)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(invoice)}
                                            className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        >
                                            {invoice.status === INVOICE_STATUS.DRAFT ? '編輯' : '查看'}
                                        </button>
                                        {invoice.status === INVOICE_STATUS.DRAFT && (
                                            <button
                                                onClick={() => handleDelete(invoice.id)}
                                                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                刪除
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading ? (
                    <div className="text-center py-8 text-gray-400">載入中...</div>
                ) : filteredInvoices.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        尚無發票，請點擊「新增發票」建立
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// 主元件
// ============================================
import InvoiceHelper from '../components/InvoiceHelper';

const Invoices = ({ addToast }) => {
    const [viewMode, setViewMode] = useState('list'); // list | editor | helper
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const handleEdit = (invoice) => {
        setSelectedInvoice(invoice);
        setViewMode('editor');
    };

    const handleBack = () => {
        setSelectedInvoice(null);
        setViewMode('list');
    };

    if (viewMode === 'editor') {
        return (
            <InvoiceEditor
                invoice={selectedInvoice}
                onSave={handleBack}
                onBack={handleBack}
                addToast={addToast}
            />
        );
    }

    if (viewMode === 'helper') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setViewMode('list')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        ← 返回發票列表
                    </button>
                </div>
                <InvoiceHelper />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 頂部操作列 - 添加手開發票小幫手按鈕 */}
            <div className="flex justify-end">
                <button
                    onClick={() => setViewMode('helper')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md flex items-center gap-2"
                >
                    <Calculator size={18} />
                    手開發票小幫手
                </button>
            </div>
            <InvoiceList
                onEdit={handleEdit}
                addToast={addToast}
            />
        </div>
    );
};

export default Invoices;
