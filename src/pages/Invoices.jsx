/**
 * 發票管理系統 (InvoicesPage.jsx)
 * 台灣營造/室內設計/建築企業專用
 * - 支援二聯式/三聯式/電子發票
 * - 專案成本歸戶
 * - 進項扣抵管理
 * - AI 辨識整合
 * - 簽核付款流程
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Send,
  Check,
  X,
  DollarSign,
  Calendar,
  Building2,
  Receipt,
  Upload,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  Download,
  Camera,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Tag,
  CreditCard,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  Zap,
  MoreHorizontal,
  ArrowUpRight,
  ScanLine,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { vendorsApi, projectsApi, invoicesApi } from '../services/api';

// ============================================
// 常量定義
// ============================================

// 文件類型
export const DOC_TYPES = {
  INVOICE_B2B: 'INVOICE_B2B', // 三聯式
  INVOICE_B2C: 'INVOICE_B2C', // 二聯式
  INVOICE_EGUI: 'INVOICE_EGUI', // 電子發票
  RECEIPT: 'RECEIPT', // 收據
  CLAIM: 'CLAIM', // 請款單
};

export const DOC_TYPE_LABELS = {
  INVOICE_B2B: '三聯式發票',
  INVOICE_B2C: '二聯式發票',
  INVOICE_EGUI: '電子發票',
  RECEIPT: '收據',
  CLAIM: '請款單',
};

export const DOC_TYPE_COLORS = {
  INVOICE_B2B: 'bg-purple-100 text-purple-700',
  INVOICE_B2C: 'bg-amber-100 text-amber-700',
  INVOICE_EGUI: 'bg-blue-100 text-blue-700',
  RECEIPT: 'bg-gray-100 text-gray-700',
  CLAIM: 'bg-green-100 text-green-700',
};

// 發票狀態
export const INVOICE_STATES = {
  DRAFT: 'DRAFT',
  UPLOADED: 'UPLOADED',
  AI_EXTRACTED: 'AI_EXTRACTED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  REVIEWED: 'REVIEWED',
  ASSIGNED: 'ASSIGNED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAYABLE_SCHEDULED: 'PAYABLE_SCHEDULED',
  PAID: 'PAID',
  VAT_CLAIMED: 'VAT_CLAIMED',
  VOIDED: 'VOIDED',
};

export const STATE_LABELS = {
  DRAFT: '草稿',
  UPLOADED: '已上傳',
  AI_EXTRACTED: 'AI辨識中',
  NEEDS_REVIEW: '待覆核',
  REVIEWED: '已覆核',
  ASSIGNED: '已歸戶',
  PENDING_APPROVAL: '待簽核',
  APPROVED: '已核准',
  REJECTED: '已退回',
  PAYABLE_SCHEDULED: '已排程',
  PAID: '已付款',
  VAT_CLAIMED: '已扣抵',
  VOIDED: '已作廢',
};

export const STATE_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-600',
  UPLOADED: 'bg-blue-50 text-blue-600',
  AI_EXTRACTED: 'bg-indigo-100 text-indigo-600',
  NEEDS_REVIEW: 'bg-amber-100 text-amber-700',
  REVIEWED: 'bg-cyan-100 text-cyan-700',
  ASSIGNED: 'bg-teal-100 text-teal-700',
  PENDING_APPROVAL: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  PAYABLE_SCHEDULED: 'bg-violet-100 text-violet-700',
  PAID: 'bg-green-100 text-green-700',
  VAT_CLAIMED: 'bg-green-200 text-green-800',
  VOIDED: 'bg-gray-300 text-gray-600',
};

// 進項扣抵狀態
export const VAT_STATUS = {
  UNKNOWN: 'UNKNOWN',
  ELIGIBLE: 'ELIGIBLE',
  INELIGIBLE: 'INELIGIBLE',
  CLAIMED: 'CLAIMED',
  ADJUSTED: 'ADJUSTED',
};

export const VAT_STATUS_LABELS = {
  UNKNOWN: '待判定',
  ELIGIBLE: '可扣抵',
  INELIGIBLE: '不可扣抵',
  CLAIMED: '已扣抵',
  ADJUSTED: '需調整',
};

// 付款狀態
export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
};

export const PAYMENT_STATUS_LABELS = {
  UNPAID: '未付款',
  PARTIAL: '部分付款',
  PAID: '已付款',
};

// 成本科目
export const COST_CATEGORIES = {
  MATERIAL: 'MATERIAL',
  LABOR: 'LABOR',
  SUBCONTRACT: 'SUBCONTRACT',
  EQUIPMENT: 'EQUIPMENT',
  TRANSPORT: 'TRANSPORT',
  OVERHEAD: 'OVERHEAD',
  MISC: 'MISC',
};

export const COST_CATEGORY_LABELS = {
  MATERIAL: '材料費',
  LABOR: '人工費',
  SUBCONTRACT: '分包費',
  EQUIPMENT: '設備費',
  TRANSPORT: '運輸費',
  OVERHEAD: '管理費',
  MISC: '雜支',
};

// 發票期別計算
const getInvoicePeriod = date => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const periodEnd = Math.ceil(month / 2) * 2;
  const periodStart = periodEnd - 1;
  return `${periodStart}-${periodEnd}`;
};

// 格式化函數
const formatCurrency = amount => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = dateString => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-TW');
};

// ============================================
// 子元件
// ============================================

// 狀態標籤
const StateBadge = ({ state }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATE_COLORS[state] || 'bg-gray-100 text-gray-600'}`}
  >
    {STATE_LABELS[state] || state}
  </span>
);

// 文件類型標籤
const DocTypeBadge = ({ type }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${DOC_TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}
  >
    {DOC_TYPE_LABELS[type] || type}
  </span>
);

// 付款狀態標籤
const PaymentBadge = ({ status }) => {
  const colors = {
    UNPAID: 'bg-red-50 text-red-600 border-red-200',
    PARTIAL: 'bg-amber-50 text-amber-600 border-amber-200',
    PAID: 'bg-green-50 text-green-600 border-green-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${colors[status] || ''}`}
    >
      {PAYMENT_STATUS_LABELS[status] || status}
    </span>
  );
};

// 統計卡片
const StatCard = ({ title, value, subValue, icon: Icon, color = 'gray', trend }) => {
  const colorClasses = {
    gray: 'from-gray-50 to-white border-gray-200',
    blue: 'from-blue-50 to-white border-blue-200',
    green: 'from-green-50 to-white border-green-200',
    amber: 'from-amber-50 to-white border-amber-200',
    red: 'from-red-50 to-white border-red-200',
    purple: 'from-purple-50 to-white border-purple-200',
  };
  const iconColors = {
    gray: 'text-gray-500 bg-gray-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    amber: 'text-amber-600 bg-amber-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-5 border shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconColors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <TrendingUp size={14} className="text-green-500" />
          <span className="text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );
};

// 收件匣標籤
const InboxTab = ({ label, count, active, onClick, color = 'gray' }) => {
  const activeColors = {
    gray: 'border-gray-500 text-gray-700',
    amber: 'border-amber-500 text-amber-700',
    blue: 'border-blue-500 text-blue-700',
    green: 'border-green-500 text-green-700',
  };
  const badgeColors = {
    gray: 'bg-gray-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
        active ? activeColors[color] : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <span className="font-medium">{label}</span>
      {count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${badgeColors[color]}`}>
          {count}
        </span>
      )}
    </button>
  );
};

// 篩選器下拉選單
const FilterDropdown = ({ label, value, options, onChange, placeholder = '全部' }) => (
  <div className="relative">
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
      className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={14}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
  </div>
);

// 空狀態
const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Receipt size={32} className="text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm mb-4 text-center max-w-md">{description}</p>
    {action}
  </div>
);

// ============================================
// 上傳模態框
// ============================================
const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = index => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    // TODO: 實際上傳邏輯
    await new Promise(resolve => setTimeout(resolve, 1500));
    onUpload?.(files);
    setUploading(false);
    setFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Upload size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">上傳發票/憑證</h2>
              <p className="text-sm text-gray-500">支援 JPG、PNG、PDF 格式</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  dragOver ? 'bg-purple-100' : 'bg-gray-100'
                }`}
              >
                <Camera size={32} className={dragOver ? 'text-purple-600' : 'text-gray-400'} />
              </div>
              <p className="text-gray-700 font-medium mb-2">
                拖曳檔案到此處，或
                <label className="text-purple-600 hover:text-purple-800 cursor-pointer mx-1">
                  點擊選擇
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">支援多張照片或 PDF，單檔最大 10MB</p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">已選擇 {files.length} 個檔案</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center">
                      <FileText size={20} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI 辨識提示 */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-purple-800 mb-1">AI 自動辨識</h4>
                <p className="text-sm text-purple-600">
                  上傳後系統將自動辨識發票資訊（字軌、號碼、統編、金額）， 電子發票 QR Code 可達
                  95%+ 準確率
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                上傳中...
              </>
            ) : (
              <>
                <Upload size={18} />
                上傳並辨識
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 發票列表項目
// ============================================
const InvoiceListItem = ({ invoice, onView, onEdit }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all group">
      <div className="flex items-start gap-4">
        {/* 縮圖/圖示 */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          {invoice.thumbnail ? (
            <img src={invoice.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <Receipt size={28} className="text-gray-400" />
          )}
        </div>

        {/* 主要資訊 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <DocTypeBadge type={invoice.doc_type} />
            <span className="text-sm font-mono text-gray-600">
              {invoice.invoice_track}-{invoice.invoice_no}
            </span>
            {invoice.ai_needs_review && (
              <span className="text-amber-500" title="需要覆核">
                <AlertTriangle size={14} />
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 truncate mb-1">
            {invoice.seller_name || '未知廠商'}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(invoice.invoice_date)}
            </span>
            {invoice.project_name && (
              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                {invoice.project_name}
              </span>
            )}
          </div>
        </div>

        {/* 金額 */}
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.amount_gross)}</p>
          <p className="text-xs text-gray-500">稅額 {formatCurrency(invoice.amount_tax)}</p>
        </div>

        {/* 狀態 */}
        <div className="flex flex-col items-end gap-2">
          <StateBadge state={invoice.current_state} />
          <PaymentBadge status={invoice.payment_status} />
        </div>

        {/* 操作按鈕 */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            onClick={() => onView?.(invoice)}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit?.(invoice)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit2 size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 主頁面元件
// ============================================
const InvoicesPage = ({ addToast }) => {
  // 狀態
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInbox, setActiveInbox] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 篩選條件
  const [filters, setFilters] = useState({
    search: '',
    docType: null,
    state: null,
    project: null,
    period: null,
    paymentStatus: null,
    vatStatus: null,
  });

  // 統計資料 (從 API 取得)
  const [stats, setStats] = useState({
    needsReview: 0,
    pendingApproval: 0,
    unpaid: 0,
    totalThisMonth: 0,
  });

  // 載入資料
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [vendorsData, projectsData, invoicesResult, statsData] = await Promise.all([
          vendorsApi.getAll().catch(() => ({ items: [] })),
          projectsApi.getAll().catch(() => ({ items: [] })),
          invoicesApi.getAll({ limit: 100 }).catch(() => ({ data: [] })),
          invoicesApi.getStats().catch(() => ({})),
        ]);
        // Handle paginated responses - extract items array
        const vendorItems =
          vendorsData?.items ||
          vendorsData?.data ||
          (Array.isArray(vendorsData) ? vendorsData : []);
        const projectItems =
          projectsData?.items ||
          projectsData?.data ||
          (Array.isArray(projectsData) ? projectsData : []);
        setVendors(vendorItems);
        setProjects(projectItems);

        // 處理發票資料 (API 回傳 { data, total, page, limit })
        const invoiceData =
          invoicesResult?.data ||
          invoicesResult?.items ||
          (Array.isArray(invoicesResult) ? invoicesResult : []);
        setInvoices(Array.isArray(invoiceData) ? invoiceData : []);

        // 處理統計資料
        if (statsData) {
          setStats({
            needsReview: statsData.needsReviewCount || 0,
            pendingApproval: statsData.pendingApprovalCount || 0,
            unpaid: statsData.unpaidCount || 0,
            totalThisMonth: statsData.totalAmountGross || 0,
          });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 篩選後的發票
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // 收件匣篩選
    if (activeInbox === 'review') {
      result = result.filter(i => i.current_state === INVOICE_STATES.NEEDS_REVIEW);
    } else if (activeInbox === 'approval') {
      result = result.filter(i => i.current_state === INVOICE_STATES.PENDING_APPROVAL);
    } else if (activeInbox === 'payment') {
      result = result.filter(
        i =>
          i.payment_status === PAYMENT_STATUS.UNPAID && i.current_state === INVOICE_STATES.APPROVED
      );
    }

    // 搜尋
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        i =>
          i.seller_name?.toLowerCase().includes(search) ||
          i.invoice_no?.includes(search) ||
          i.seller_tax_id?.includes(search)
      );
    }

    // 其他篩選
    if (filters.docType) result = result.filter(i => i.doc_type === filters.docType);
    if (filters.state) result = result.filter(i => i.current_state === filters.state);
    if (filters.project) result = result.filter(i => i.project_id === filters.project);
    if (filters.paymentStatus)
      result = result.filter(i => i.payment_status === filters.paymentStatus);

    return result;
  }, [invoices, activeInbox, filters]);

  // 處理上傳
  const handleUpload = files => {
    addToast?.(`已上傳 ${files.length} 個檔案，AI 辨識中...`, 'info');
    // TODO: 實際 API 呼叫
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">發票管理</h1>
          <p className="text-gray-500 text-sm mt-1">
            管理進項/銷項發票、專案成本歸戶、進項扣抵申報
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <Download size={18} />
            匯出
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2 shadow-lg shadow-purple-200"
          >
            <Upload size={18} />
            上傳發票
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本月進項金額"
          value={formatCurrency(stats.totalThisMonth)}
          subValue="含稅總額"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="待覆核"
          value={stats.needsReview}
          subValue="張發票"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="待簽核"
          value={stats.pendingApproval}
          subValue="張發票"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="待付款"
          value={stats.unpaid}
          subValue="張發票"
          icon={CreditCard}
          color="red"
        />
      </div>

      {/* 收件匣標籤 */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2">
          <InboxTab
            label="全部"
            count={invoices.length}
            active={activeInbox === 'all'}
            onClick={() => setActiveInbox('all')}
            color="gray"
          />
          <InboxTab
            label="待覆核"
            count={stats.needsReview}
            active={activeInbox === 'review'}
            onClick={() => setActiveInbox('review')}
            color="amber"
          />
          <InboxTab
            label="待簽核"
            count={stats.pendingApproval}
            active={activeInbox === 'approval'}
            onClick={() => setActiveInbox('approval')}
            color="blue"
          />
          <InboxTab
            label="待付款"
            count={stats.unpaid}
            active={activeInbox === 'payment'}
            onClick={() => setActiveInbox('payment')}
            color="green"
          />
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* 搜尋框 */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋發票號碼、廠商名稱、統編..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 篩選器 */}
          <FilterDropdown
            label="文件類型"
            value={filters.docType}
            options={Object.entries(DOC_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            onChange={v => setFilters(f => ({ ...f, docType: v }))}
            placeholder="全部類型"
          />
          <FilterDropdown
            label="專案"
            value={filters.project}
            options={projects.map(p => ({ value: p.id, label: p.name }))}
            onChange={v => setFilters(f => ({ ...f, project: v }))}
            placeholder="全部專案"
          />
          <FilterDropdown
            label="付款狀態"
            value={filters.paymentStatus}
            options={Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => ({
              value: k,
              label: v,
            }))}
            onChange={v => setFilters(f => ({ ...f, paymentStatus: v }))}
            placeholder="全部狀態"
          />

          {/* 清除篩選 */}
          {(filters.search || filters.docType || filters.project || filters.paymentStatus) && (
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  docType: null,
                  state: null,
                  project: null,
                  period: null,
                  paymentStatus: null,
                  vatStatus: null,
                })
              }
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X size={14} />
              清除篩選
            </button>
          )}
        </div>
      </div>

      {/* 發票列表 */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-purple-600" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            title="尚無發票資料"
            description="上傳發票或收據，系統將自動辨識並建檔。支援 QR Code 電子發票、紙本發票掃描。"
            action={
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
              >
                <Upload size={18} />
                上傳第一張發票
              </button>
            }
          />
        ) : (
          filteredInvoices.map(invoice => (
            <InvoiceListItem
              key={invoice.id}
              invoice={invoice}
              onView={inv => console.log('View', inv)}
              onEdit={inv => console.log('Edit', inv)}
            />
          ))
        )}
      </div>

      {/* 上傳模態框 */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default InvoicesPage;
