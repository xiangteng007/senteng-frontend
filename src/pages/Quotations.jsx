/**
 * 估價單列表與管理頁面
 * Quotations.jsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText, Plus, Search, Filter, MoreVertical, Eye, Edit2, Copy,
    Trash2, Send, Check, X, Clock, ChevronDown, FileSpreadsheet,
    Building2, Users, Calendar, DollarSign, Tag, AlertCircle
} from 'lucide-react';
import { SectionTitle } from '../components/common/Indicators';
import QuotationEditor from './QuotationEditor';
import QuotationService, {
    QUOTATION_STATUS,
    QUOTATION_STATUS_LABELS,
    QUOTATION_STATUS_COLORS,
    QUOTATION_TEMPLATES,
    applyTemplate,
} from '../services/QuotationService';

// ============================================
// 狀態標籤元件
// ============================================
const StatusBadge = ({ status }) => {
    const colorClass = QUOTATION_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
    const label = QUOTATION_STATUS_LABELS[status] || status;

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {label}
        </span>
    );
};

// ============================================
// 新增估價單 Modal
// ============================================
const NewQuotationModal = ({ isOpen, onClose, onSubmit, projects = [], customers = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        projectId: '',
        projectName: '',
        customerId: '',
        customerName: '',
        templateId: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // 套用模板生成工項
        let items = [];
        if (formData.templateId) {
            const template = QUOTATION_TEMPLATES.find(t => t.id === formData.templateId);
            if (template) {
                items = applyTemplate(template);
            }
        }

        onSubmit({
            ...formData,
            items,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">新增估價單</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* 標題 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            估價單標題 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="例：陳先生住宅裝修報價"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* 專案 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            關聯專案
                        </label>
                        <input
                            type="text"
                            value={formData.projectName}
                            onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                            placeholder="輸入專案名稱"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {/* 客戶 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            客戶名稱
                        </label>
                        <input
                            type="text"
                            value={formData.customerName}
                            onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                            placeholder="輸入客戶名稱"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {/* 模板選擇 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            套用模板
                        </label>
                        <select
                            value={formData.templateId}
                            onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        >
                            <option value="">不套用模板 (空白開始)</option>
                            {QUOTATION_TEMPLATES.map(tpl => (
                                <option key={tpl.id} value={tpl.id}>
                                    {tpl.name} - {tpl.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 說明 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            備註說明
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="可填入補充說明..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* 按鈕 */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            建立估價單
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================
// 估價單卡片元件
// ============================================
const QuotationCard = ({ quotation, onView, onEdit, onCopy, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('zh-TW');
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all group">
            {/* 頂部 */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">{quotation.quotationNo}</span>
                    <StatusBadge status={quotation.status} />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <MoreVertical size={18} />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
                                <button
                                    onClick={() => { onView?.(quotation); setShowMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Eye size={16} /> 檢視
                                </button>
                                <button
                                    onClick={() => { onEdit?.(quotation); setShowMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> 編輯
                                </button>
                                <button
                                    onClick={() => { onCopy?.(quotation); setShowMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Copy size={16} /> 複製
                                </button>
                                <hr className="my-1 border-gray-100" />
                                <button
                                    onClick={() => { onDelete?.(quotation); setShowMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> 刪除
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 標題 */}
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">{quotation.title}</h3>

            {/* 資訊 */}
            <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                {quotation.customerName && (
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        {quotation.customerName}
                    </div>
                )}
                {quotation.projectName && (
                    <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400" />
                        {quotation.projectName}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    有效期限：{formatDate(quotation.validUntil)}
                </div>
            </div>

            {/* 金額 */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">報價金額</span>
                <span className="text-lg font-bold text-orange-600">
                    {formatCurrency(quotation.totalAmount)}
                </span>
            </div>

            {/* 快速動作 */}
            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit?.(quotation)}
                    className="flex-1 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                >
                    <Edit2 size={14} /> 編輯
                </button>
                <button
                    onClick={() => onView?.(quotation)}
                    className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                >
                    <Eye size={14} /> 檢視
                </button>
            </div>
        </div>
    );
};

// ============================================
// 主頁面
// ============================================
const Quotations = ({ addToast }) => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // list / editor

    // 載入估價單
    useEffect(() => {
        loadQuotations();
    }, []);

    const loadQuotations = async () => {
        setLoading(true);
        try {
            const data = await QuotationService.getQuotations();
            setQuotations(data);
        } catch (error) {
            console.error('Failed to load quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    // 篩選估價單
    const filteredQuotations = useMemo(() => {
        return quotations.filter(q => {
            // 狀態篩選
            if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
            // 搜尋
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    q.quotationNo?.toLowerCase().includes(term) ||
                    q.title?.toLowerCase().includes(term) ||
                    q.customerName?.toLowerCase().includes(term) ||
                    q.projectName?.toLowerCase().includes(term)
                );
            }
            return true;
        });
    }, [quotations, statusFilter, searchTerm]);

    // 統計
    const stats = useMemo(() => {
        const total = quotations.length;
        const draft = quotations.filter(q => q.status === QUOTATION_STATUS.DRAFT).length;
        const pending = quotations.filter(q => q.status === QUOTATION_STATUS.PENDING).length;
        const approved = quotations.filter(q => q.status === QUOTATION_STATUS.APPROVED).length;
        const totalAmount = quotations
            .filter(q => [QUOTATION_STATUS.APPROVED, QUOTATION_STATUS.SENT, QUOTATION_STATUS.ACCEPTED].includes(q.status))
            .reduce((sum, q) => sum + (q.totalAmount || 0), 0);

        return { total, draft, pending, approved, totalAmount };
    }, [quotations]);

    // 新增估價單
    const handleCreate = async (data) => {
        try {
            const newQuotation = await QuotationService.createQuotation(data);
            loadQuotations();
            // 自動進入編輯模式
            setSelectedQuotation(newQuotation);
            setViewMode('editor');
        } catch (error) {
            console.error('Failed to create quotation:', error);
        }
    };

    // 複製估價單
    const handleCopy = async (quotation) => {
        if (window.confirm(`確定要複製估價單「${quotation.title}」嗎？`)) {
            try {
                await QuotationService.copyQuotation(quotation.id);
                loadQuotations();
            } catch (error) {
                console.error('Failed to copy quotation:', error);
            }
        }
    };

    // 刪除估價單
    const handleDelete = async (quotation) => {
        if (window.confirm(`確定要刪除估價單「${quotation.title}」嗎？此操作無法復原。`)) {
            try {
                await QuotationService.deleteQuotation(quotation.id);
                loadQuotations();
            } catch (error) {
                console.error('Failed to delete quotation:', error);
            }
        }
    };

    // 編輯估價單
    const handleEdit = (quotation) => {
        setSelectedQuotation(quotation);
        setViewMode('editor');
    };

    // 檢視估價單
    const handleView = (quotation) => {
        setSelectedQuotation(quotation);
        setViewMode('editor');
    };

    // 返回列表
    const handleBack = () => {
        setSelectedQuotation(null);
        setViewMode('list');
        loadQuotations(); // 重新載入
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // 編輯模式
    if (viewMode === 'editor' && selectedQuotation) {
        return (
            <QuotationEditor
                quotationId={selectedQuotation.id}
                onBack={handleBack}
                addToast={addToast}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* 標題與操作 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <SectionTitle
                    icon={FileText}
                    title="估價單管理"
                    subtitle="建立與管理專案報價"
                />
                <button
                    onClick={() => setShowNewModal(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-md"
                >
                    <Plus size={18} />
                    新增估價單
                </button>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">全部估價單</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">草稿中</div>
                    <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">待審核</div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">已核准</div>
                    <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 col-span-2 lg:col-span-1">
                    <div className="text-sm text-gray-500 mb-1">已核准金額</div>
                    <div className="text-xl font-bold text-orange-600">{formatCurrency(stats.totalAmount)}</div>
                </div>
            </div>

            {/* 搜尋與篩選 */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="搜尋估價單編號、標題、客戶..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white min-w-[140px]"
                >
                    <option value="ALL">全部狀態</option>
                    {Object.entries(QUOTATION_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {/* 估價單列表 */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    載入中...
                </div>
            ) : filteredQuotations.length === 0 ? (
                <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        {searchTerm || statusFilter !== 'ALL' ? '沒有符合條件的估價單' : '尚無估價單'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm || statusFilter !== 'ALL'
                            ? '請調整搜尋條件或篩選條件'
                            : '點擊上方按鈕建立您的第一張估價單'}
                    </p>
                    {!searchTerm && statusFilter === 'ALL' && (
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            建立估價單
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuotations.map(quotation => (
                        <QuotationCard
                            key={quotation.id}
                            quotation={quotation}
                            onView={handleView}
                            onEdit={handleEdit}
                            onCopy={handleCopy}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* 新增 Modal */}
            <NewQuotationModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onSubmit={handleCreate}
            />
        </div>
    );
};

export default Quotations;
