/**
 * 稽核日誌頁面 (AuditLog.jsx)
 * 系統操作記錄與變更追蹤
 */

import React, { useState, useEffect } from 'react';
import {
    History,
    Search,
    Filter,
    User,
    Calendar,
    FileText,
    Edit,
    Trash2,
    Plus,
    Eye,
    Download,
    ChevronDown,
    ChevronRight,
    Clock,
    AlertCircle,
    CheckCircle,
    Database,
} from 'lucide-react';
import { LoadingSpinner, SectionTitle } from '../components/common/Indicators';

// 操作類型
const ACTION_TYPES = {
    CREATE: { label: '新增', color: 'green', icon: Plus },
    UPDATE: { label: '修改', color: 'blue', icon: Edit },
    DELETE: { label: '刪除', color: 'red', icon: Trash2 },
    VIEW: { label: '檢視', color: 'gray', icon: Eye },
    EXPORT: { label: '匯出', color: 'purple', icon: Download },
    LOGIN: { label: '登入', color: 'emerald', icon: User },
    LOGOUT: { label: '登出', color: 'orange', icon: User },
};

// 模組類型
const MODULES = {
    PROJECT: { label: '專案', color: 'blue' },
    CONTRACT: { label: '合約', color: 'purple' },
    INVOICE: { label: '發票', color: 'green' },
    PAYMENT: { label: '請款', color: 'orange' },
    USER: { label: '使用者', color: 'pink' },
    VENDOR: { label: '廠商', color: 'amber' },
    INVENTORY: { label: '庫存', color: 'teal' },
};

// 統計卡片
const StatCard = ({ icon: Icon, label, value, color = 'gray' }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-100`}>
                <Icon size={20} className={`text-${color}-600`} />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-xl font-bold text-${color}-700`}>{value}</p>
            </div>
        </div>
    </div>
);

// 時間軸項目
const AuditLogItem = ({ log, expanded, onToggle }) => {
    const action = ACTION_TYPES[log.action] || ACTION_TYPES.VIEW;
    const module = MODULES[log.module] || MODULES.PROJECT;
    const ActionIcon = action.icon;

    return (
        <div className="relative pl-8">
            {/* 時間軸線 */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />

            {/* 時間軸節點 */}
            <div className={`absolute left-0 top-4 w-6 h-6 rounded-full bg-${action.color}-100 border-2 border-${action.color}-500 flex items-center justify-center`}>
                <ActionIcon size={12} className={`text-${action.color}-600`} />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 ml-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${action.color}-100 text-${action.color}-700`}>
                                {action.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${module.color}-100 text-${module.color}-700`}>
                                {module.label}
                            </span>
                        </div>
                        <p className="font-medium text-gray-800">{log.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <User size={14} />
                                {log.userName}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {log.timestamp}
                            </span>
                            <span className="flex items-center gap-1">
                                <Database size={14} />
                                {log.ipAddress}
                            </span>
                        </div>
                    </div>

                    {log.changes && log.changes.length > 0 && (
                        <button
                            onClick={onToggle}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            變更詳情
                        </button>
                    )}
                </div>

                {/* 變更詳情 */}
                {expanded && log.changes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-600 mb-2">變更內容：</p>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            {log.changes.map((change, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="font-medium text-gray-600 min-w-24">{change.field}:</span>
                                    {change.oldValue && (
                                        <>
                                            <span className="text-red-500 line-through">{change.oldValue}</span>
                                            <span className="text-gray-400">→</span>
                                        </>
                                    )}
                                    <span className="text-green-600">{change.newValue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 主組件
const AuditLog = ({ addToast }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterModule, setFilterModule] = useState('all');
    const [dateRange, setDateRange] = useState('today');
    const [expandedLog, setExpandedLog] = useState(null);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setLogs([
                {
                    id: 1,
                    action: 'UPDATE',
                    module: 'CONTRACT',
                    description: '更新合約 CTR-2026-001 的付款條件',
                    userName: '張經理',
                    timestamp: '2026-01-30 09:45:32',
                    ipAddress: '192.168.1.100',
                    changes: [
                        { field: '付款方式', oldValue: '30天月結', newValue: '60天月結' },
                        { field: '預付款比例', oldValue: '20%', newValue: '30%' },
                    ],
                },
                {
                    id: 2,
                    action: 'CREATE',
                    module: 'INVOICE',
                    description: '新增發票 INV-2026-0125',
                    userName: '李會計',
                    timestamp: '2026-01-30 09:30:15',
                    ipAddress: '192.168.1.105',
                    changes: [
                        { field: '發票金額', newValue: 'NT$ 1,250,000' },
                        { field: '專案', newValue: '台北市信義區辦公大樓新建工程' },
                    ],
                },
                {
                    id: 3,
                    action: 'DELETE',
                    module: 'VENDOR',
                    description: '刪除廠商 大安建材行',
                    userName: '系統管理員',
                    timestamp: '2026-01-30 09:15:00',
                    ipAddress: '192.168.1.1',
                    changes: null,
                },
                {
                    id: 4,
                    action: 'LOGIN',
                    module: 'USER',
                    description: '使用者登入系統',
                    userName: '王專員',
                    timestamp: '2026-01-30 08:45:00',
                    ipAddress: '192.168.1.120',
                    changes: null,
                },
                {
                    id: 5,
                    action: 'EXPORT',
                    module: 'PROJECT',
                    description: '匯出專案報表 - 2026年1月進度總覽',
                    userName: '張經理',
                    timestamp: '2026-01-29 17:30:00',
                    ipAddress: '192.168.1.100',
                    changes: null,
                },
                {
                    id: 6,
                    action: 'UPDATE',
                    module: 'PAYMENT',
                    description: '核准請款單 PAY-2026-0089',
                    userName: '林總監',
                    timestamp: '2026-01-29 16:20:00',
                    ipAddress: '192.168.1.50',
                    changes: [
                        { field: '狀態', oldValue: '待審核', newValue: '已核准' },
                        { field: '核准金額', newValue: 'NT$ 850,000' },
                    ],
                },
            ]);
        } catch (error) {
            addToast?.('載入稽核日誌失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 統計
    const stats = {
        totalLogs: logs.length,
        createCount: logs.filter(l => l.action === 'CREATE').length,
        updateCount: logs.filter(l => l.action === 'UPDATE').length,
        deleteCount: logs.filter(l => l.action === 'DELETE').length,
    };

    // 過濾
    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'all' || log.action === filterAction;
        const matchesModule = filterModule === 'all' || log.module === filterModule;
        return matchesSearch && matchesAction && matchesModule;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 標題 */}
            <div className="flex items-center justify-between">
                <SectionTitle icon={History} title="稽核日誌" subtitle="系統操作記錄與變更追蹤" />
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors">
                    <Download size={18} />
                    匯出日誌
                </button>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="總記錄數" value={stats.totalLogs} color="blue" />
                <StatCard icon={Plus} label="新增操作" value={stats.createCount} color="green" />
                <StatCard icon={Edit} label="修改操作" value={stats.updateCount} color="orange" />
                <StatCard icon={Trash2} label="刪除操作" value={stats.deleteCount} color="red" />
            </div>

            {/* 篩選 */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-100">
                <div className="flex-1 min-w-64 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜尋操作描述或使用者..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">全部操作</option>
                    {Object.entries(ACTION_TYPES).map(([key, act]) => (
                        <option key={key} value={key}>{act.label}</option>
                    ))}
                </select>
                <select
                    value={filterModule}
                    onChange={(e) => setFilterModule(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">全部模組</option>
                    {Object.entries(MODULES).map(([key, mod]) => (
                        <option key={key} value={key}>{mod.label}</option>
                    ))}
                </select>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                    <option value="today">今天</option>
                    <option value="week">本週</option>
                    <option value="month">本月</option>
                    <option value="all">全部</option>
                </select>
            </div>

            {/* 時間軸列表 */}
            <div className="relative">
                {filteredLogs.map(log => (
                    <AuditLogItem
                        key={log.id}
                        log={log}
                        expanded={expandedLog === log.id}
                        onToggle={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    />
                ))}
                {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <History size={48} className="mx-auto mb-4 opacity-50" />
                        <p>沒有符合條件的稽核記錄</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLog;
