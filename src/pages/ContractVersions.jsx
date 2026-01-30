/**
 * 合約版本控制頁面 (ContractVersions.jsx)
 * 合約變更追蹤與版本對比
 */

import React, { useState, useEffect } from 'react';
import {
    GitBranch,
    Search,
    Calendar,
    User,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Download,
    Eye,
    Diff,
    History,
    X,
} from 'lucide-react';
import { LoadingSpinner, SectionTitle } from '../components/common/Indicators';

// 版本狀態
const VERSION_STATUS = {
    DRAFT: { label: '草稿', color: 'gray' },
    PENDING_REVIEW: { label: '待審核', color: 'yellow' },
    APPROVED: { label: '已核准', color: 'green' },
    REJECTED: { label: '已退回', color: 'red' },
    SIGNED: { label: '已簽署', color: 'blue' },
};

// 變更類型
const CHANGE_TYPES = {
    AMOUNT: { label: '金額變更', color: 'green' },
    SCOPE: { label: '範圍變更', color: 'blue' },
    SCHEDULE: { label: '時程變更', color: 'orange' },
    TERMS: { label: '條款變更', color: 'purple' },
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

// 合約版本卡片
const ContractVersionCard = ({ contract, onClick }) => {
    const latestVersion = contract.versions?.[0];
    const status = VERSION_STATUS[latestVersion?.status] || VERSION_STATUS.DRAFT;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-100 group-hover:scale-105 transition-transform">
                    <FileText size={24} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{contract.contractNo}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                            {status.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{contract.projectName}</p>
                    <p className="text-sm text-gray-400 mt-1">客戶: {contract.customerName}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">v{contract.currentVersion}</p>
                    <p className="text-xs text-gray-400">{contract.versions?.length || 0} 個版本</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    最後更新: {latestVersion?.date || '-'}
                </span>
                <span className="flex items-center gap-1">
                    <User size={14} />
                    {latestVersion?.author || '-'}
                </span>
            </div>
        </div>
    );
};

// 版本時間軸
const VersionTimeline = ({ versions }) => {
    return (
        <div className="relative">
            {versions.map((version, idx) => {
                const status = VERSION_STATUS[version.status] || VERSION_STATUS.DRAFT;
                const isLast = idx === versions.length - 1;

                return (
                    <div key={version.id} className="relative pl-8 pb-6">
                        {/* 時間軸線 */}
                        {!isLast && <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-200" />}

                        {/* 時間軸節點 */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-${status.color}-100 border-2 border-${status.color}-500 flex items-center justify-center`}>
                            {version.status === 'SIGNED' ? (
                                <CheckCircle size={12} className={`text-${status.color}-600`} />
                            ) : (
                                <span className="text-xs font-bold text-${status.color}-600">{version.version}</span>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-4 ml-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800">版本 {version.version}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{version.summary}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                                        <Eye size={16} />
                                    </button>
                                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* 變更項目 */}
                            {version.changes && version.changes.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-50">
                                    <p className="text-xs text-gray-500 mb-2">變更項目:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {version.changes.map((change, cIdx) => {
                                            const changeType = CHANGE_TYPES[change.type] || CHANGE_TYPES.TERMS;
                                            return (
                                                <span
                                                    key={cIdx}
                                                    className={`px-2 py-0.5 rounded-full text-xs bg-${changeType.color}-100 text-${changeType.color}-700`}
                                                >
                                                    {changeType.label}: {change.description}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {version.date} {version.time}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User size={12} />
                                    {version.author}
                                </span>
                                {version.signedBy && (
                                    <span className="flex items-center gap-1 text-green-500">
                                        <CheckCircle size={12} />
                                        簽署: {version.signedBy}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// 合約版本詳情面板
const ContractVersionDetail = ({ contract, onBack }) => {
    if (!contract) return null;

    return (
        <div className="space-y-6">
            {/* 標題 */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight size={20} className="text-gray-500 rotate-180" />
                </button>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">{contract.contractNo}</h2>
                    <p className="text-sm text-gray-500">{contract.projectName}</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                        <Diff size={18} />
                        版本對比
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        <GitBranch size={18} />
                        建立新版本
                    </button>
                </div>
            </div>

            {/* 合約摘要 */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">合約摘要</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">目前版本</p>
                        <p className="font-bold text-gray-800">v{contract.currentVersion}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">客戶名稱</p>
                        <p className="font-bold text-gray-800">{contract.customerName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">合約金額</p>
                        <p className="font-bold text-green-600">${contract.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">簽約日期</p>
                        <p className="font-bold text-gray-800">{contract.signedDate || '尚未簽約'}</p>
                    </div>
                </div>
            </div>

            {/* 版本歷史 */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <History size={20} />
                    版本歷史
                </h3>
                <VersionTimeline versions={contract.versions || []} />
            </div>
        </div>
    );
};

// 主組件
const ContractVersions = ({ addToast }) => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContract, setSelectedContract] = useState(null);

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setContracts([
                {
                    id: 1,
                    contractNo: 'CTR-2026-001',
                    projectName: '台北市信義區辦公大樓新建工程',
                    customerName: '信義開發股份有限公司',
                    currentVersion: '1.3',
                    amount: 158000000,
                    signedDate: '2026-01-15',
                    versions: [
                        {
                            id: 1,
                            version: '1.3',
                            status: 'SIGNED',
                            summary: '新增追加工程項目',
                            date: '2026-01-29',
                            time: '14:30',
                            author: '張經理',
                            signedBy: '王總監',
                            changes: [
                                { type: 'AMOUNT', description: '+$2,500,000' },
                                { type: 'SCOPE', description: '新增電梯設備' },
                            ],
                        },
                        {
                            id: 2,
                            version: '1.2',
                            status: 'SIGNED',
                            summary: '調整付款條件',
                            date: '2026-01-20',
                            time: '10:00',
                            author: '李會計',
                            signedBy: '王總監',
                            changes: [
                                { type: 'TERMS', description: '付款期限 30 改 45 天' },
                            ],
                        },
                        {
                            id: 3,
                            version: '1.1',
                            status: 'SIGNED',
                            summary: '修正工程範圍描述',
                            date: '2026-01-10',
                            time: '16:45',
                            author: '張經理',
                            signedBy: '王總監',
                            changes: [
                                { type: 'SCOPE', description: '修正樓層數量' },
                            ],
                        },
                        {
                            id: 4,
                            version: '1.0',
                            status: 'SIGNED',
                            summary: '初始合約版本',
                            date: '2026-01-05',
                            time: '09:00',
                            author: '張經理',
                            signedBy: '王總監',
                            changes: [],
                        },
                    ],
                },
                {
                    id: 2,
                    contractNo: 'CTR-2026-002',
                    projectName: '新北市林口住宅案',
                    customerName: '林口建設有限公司',
                    currentVersion: '1.1',
                    amount: 85000000,
                    signedDate: '2026-02-01',
                    versions: [
                        {
                            id: 1,
                            version: '1.1',
                            status: 'PENDING_REVIEW',
                            summary: '調整工程時程',
                            date: '2026-01-28',
                            time: '11:30',
                            author: '陳主任',
                            changes: [
                                { type: 'SCHEDULE', description: '完工日延後 30 天' },
                            ],
                        },
                        {
                            id: 2,
                            version: '1.0',
                            status: 'SIGNED',
                            summary: '初始合約版本',
                            date: '2026-01-25',
                            time: '14:00',
                            author: '陳主任',
                            signedBy: '林總監',
                            changes: [],
                        },
                    ],
                },
                {
                    id: 3,
                    contractNo: 'CTR-2025-089',
                    projectName: '桃園市大園區廠房修繕',
                    customerName: '大園工業股份有限公司',
                    currentVersion: '2.0',
                    amount: 12500000,
                    signedDate: '2025-08-15',
                    versions: [
                        {
                            id: 1,
                            version: '2.0',
                            status: 'SIGNED',
                            summary: '第二階段工程追加',
                            date: '2026-01-15',
                            time: '09:30',
                            author: '王工程師',
                            signedBy: '陳總經理',
                            changes: [
                                { type: 'AMOUNT', description: '+$3,500,000' },
                                { type: 'SCOPE', description: '新增消防系統更新' },
                                { type: 'SCHEDULE', description: '延長工期 60 天' },
                            ],
                        },
                        {
                            id: 2,
                            version: '1.0',
                            status: 'SIGNED',
                            summary: '初始合約版本',
                            date: '2025-08-10',
                            time: '10:00',
                            author: '王工程師',
                            signedBy: '陳總經理',
                            changes: [],
                        },
                    ],
                },
            ]);
        } catch (error) {
            addToast?.('載入合約版本失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 統計
    const stats = {
        totalContracts: contracts.length,
        totalVersions: contracts.reduce((sum, c) => sum + (c.versions?.length || 0), 0),
        pendingReview: contracts.filter(c => c.versions?.[0]?.status === 'PENDING_REVIEW').length,
        signedCount: contracts.filter(c => c.signedDate).length,
    };

    // 過濾
    const filteredContracts = contracts.filter(contract => {
        return contract.contractNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contract.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (selectedContract) {
        return (
            <ContractVersionDetail
                contract={selectedContract}
                onBack={() => setSelectedContract(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* 標題 */}
            <div className="flex items-center justify-between">
                <SectionTitle icon={GitBranch} title="合約版本控制" subtitle="合約變更追蹤與版本管理" />
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="合約總數" value={stats.totalContracts} color="blue" />
                <StatCard icon={GitBranch} label="版本總數" value={stats.totalVersions} color="purple" />
                <StatCard icon={Clock} label="待審核" value={stats.pendingReview} color="yellow" />
                <StatCard icon={CheckCircle} label="已簽署" value={stats.signedCount} color="green" />
            </div>

            {/* 搜尋 */}
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="搜尋合約編號、專案或客戶名稱..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {/* 合約列表 */}
            <div className="space-y-4">
                {filteredContracts.map(contract => (
                    <ContractVersionCard
                        key={contract.id}
                        contract={contract}
                        onClick={() => setSelectedContract(contract)}
                    />
                ))}
                {filteredContracts.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                        <p>沒有符合條件的合約</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractVersions;
