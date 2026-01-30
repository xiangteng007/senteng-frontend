/**
 * 保險管理頁面 (Insurance.jsx)
 * 工程保險管理與理賠追蹤
 */

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Search,
    Filter,
    AlertTriangle,
    Calendar,
    DollarSign,
    FileText,
    Building2,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
    TrendingUp,
} from 'lucide-react';
import { LoadingSpinner, SectionTitle } from '../components/common/Indicators';

// 保險類型
const INSURANCE_TYPES = {
    CAR: { label: '營造綜合險', color: 'blue', icon: Building2 },
    THIRD_PARTY: { label: '第三人責任險', color: 'purple', icon: Shield },
    EMPLOYER_LIABILITY: { label: '雇主責任險', color: 'green', icon: Shield },
    WORKER_COMP: { label: '勞工保險', color: 'orange', icon: Shield },
    PROFESSIONAL: { label: '專業責任險', color: 'indigo', icon: FileText },
    EQUIPMENT: { label: '設備險', color: 'yellow', icon: Building2 },
};

// 保險狀態
const INSURANCE_STATUS = {
    ACTIVE: { label: '有效', color: 'green' },
    EXPIRING_SOON: { label: '即將到期', color: 'yellow' },
    EXPIRED: { label: '已過期', color: 'red' },
    PENDING: { label: '處理中', color: 'blue' },
};

// 統計卡片
const StatCard = ({ icon: Icon, label, value, subValue, color = 'gray' }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${color}-100`}>
                <Icon size={24} className={`text-${color}-600`} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
                {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
            </div>
        </div>
    </div>
);

// 保險列表項
const InsuranceCard = ({ insurance, onClick }) => {
    const type = INSURANCE_TYPES[insurance.type] || INSURANCE_TYPES.CAR;
    const status = INSURANCE_STATUS[insurance.status] || INSURANCE_STATUS.ACTIVE;
    const TypeIcon = type.icon;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 
                 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-${type.color}-100 group-hover:scale-105 transition-transform`}>
                    <TypeIcon size={24} className={`text-${type.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{insurance.policyNumber}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                            {status.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{type.label}</p>
                    <p className="text-sm text-gray-400 mt-1">{insurance.projectName}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">
                        ${insurance.coverageAmount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">保額</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>{insurance.startDate} ~ {insurance.endDate}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <DollarSign size={14} />
                    <span>保費 ${insurance.premiumAmount?.toLocaleString()}</span>
                </div>
                {insurance.claimsCount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-orange-500">
                        <AlertTriangle size={14} />
                        <span>{insurance.claimsCount} 件理賠</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// 保險詳情面板
const InsuranceDetail = ({ insurance, onBack }) => {
    if (!insurance) return null;

    const type = INSURANCE_TYPES[insurance.type] || INSURANCE_TYPES.CAR;
    const status = INSURANCE_STATUS[insurance.status] || INSURANCE_STATUS.ACTIVE;

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* 標題區 */}
            <div className={`p-6 bg-gradient-to-r from-${type.color}-500 to-${type.color}-600`}>
                <button
                    onClick={onBack}
                    className="text-white/80 hover:text-white text-sm mb-4 flex items-center gap-1"
                >
                    ← 返回列表
                </button>
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Shield size={32} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{insurance.policyNumber}</h2>
                        <p className="text-white/80">{type.label}</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white`}>
                        {status.label}
                    </span>
                </div>
            </div>

            {/* 詳情內容 */}
            <div className="p-6 space-y-6">
                {/* 基本資訊 */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-4">基本資訊</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="專案名稱" value={insurance.projectName} />
                        <InfoItem label="保險公司" value={insurance.insurerName} />
                        <InfoItem label="保額" value={`$${insurance.coverageAmount?.toLocaleString()}`} />
                        <InfoItem label="保費" value={`$${insurance.premiumAmount?.toLocaleString()}`} />
                        <InfoItem label="起保日期" value={insurance.startDate} />
                        <InfoItem label="到期日期" value={insurance.endDate} />
                    </div>
                </div>

                {/* 承保範圍 */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-4">承保範圍</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <ul className="space-y-2">
                            {(insurance.coverageDetails || []).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 理賠記錄 */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-4">理賠記錄</h3>
                    {(insurance.claims || []).length > 0 ? (
                        <div className="space-y-3">
                            {insurance.claims.map((claim, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${claim.status === 'APPROVED' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                        {claim.status === 'APPROVED' ? (
                                            <CheckCircle size={20} className="text-green-600" />
                                        ) : (
                                            <Clock size={20} className="text-yellow-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{claim.description}</p>
                                        <p className="text-sm text-gray-500">{claim.date}</p>
                                    </div>
                                    <p className="font-bold text-gray-800">${claim.amount?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">暫無理賠記錄</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
);

// 主組件
const Insurance = ({ addToast }) => {
    const [insurances, setInsurances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedInsurance, setSelectedInsurance] = useState(null);

    useEffect(() => {
        loadInsurances();
    }, []);

    const loadInsurances = async () => {
        setLoading(true);
        try {
            // 模擬載入資料
            await new Promise(resolve => setTimeout(resolve, 500));
            setInsurances([
                {
                    id: 1,
                    policyNumber: 'INS-2026-001',
                    type: 'CAR',
                    status: 'ACTIVE',
                    projectName: '台北市信義區辦公大樓新建工程',
                    insurerName: '國泰產險',
                    coverageAmount: 500000000,
                    premiumAmount: 850000,
                    startDate: '2026-01-01',
                    endDate: '2027-12-31',
                    claimsCount: 0,
                    coverageDetails: [
                        '營造工程財物損失',
                        '第三人意外責任',
                        '施工機具損失',
                        '天然災害損失',
                    ],
                    claims: [],
                },
                {
                    id: 2,
                    policyNumber: 'INS-2026-002',
                    type: 'EMPLOYER_LIABILITY',
                    status: 'ACTIVE',
                    projectName: '新北市林口住宅案',
                    insurerName: '富邦產險',
                    coverageAmount: 100000000,
                    premiumAmount: 280000,
                    startDate: '2026-02-01',
                    endDate: '2027-01-31',
                    claimsCount: 1,
                    coverageDetails: [
                        '員工職災責任',
                        '醫療費用補償',
                        '死亡失能給付',
                    ],
                    claims: [
                        { description: '施工人員墜落傷害', date: '2026-03-15', amount: 350000, status: 'APPROVED' },
                    ],
                },
                {
                    id: 3,
                    policyNumber: 'INS-2025-089',
                    type: 'THIRD_PARTY',
                    status: 'EXPIRING_SOON',
                    projectName: '桃園市大園區廠房修繕',
                    insurerName: '新光產險',
                    coverageAmount: 50000000,
                    premiumAmount: 125000,
                    startDate: '2025-06-01',
                    endDate: '2026-02-28',
                    claimsCount: 0,
                    coverageDetails: [
                        '鄰房損壞責任',
                        '行人傷害責任',
                        '車輛損壞責任',
                    ],
                    claims: [],
                },
            ]);
        } catch (error) {
            addToast?.('載入保險資料失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 統計數據
    const stats = {
        totalCoverage: insurances.reduce((sum, i) => sum + (i.coverageAmount || 0), 0),
        totalPremium: insurances.reduce((sum, i) => sum + (i.premiumAmount || 0), 0),
        activeCount: insurances.filter(i => i.status === 'ACTIVE').length,
        expiringCount: insurances.filter(i => i.status === 'EXPIRING_SOON').length,
    };

    // 過濾
    const filteredInsurances = insurances.filter(insurance => {
        const matchesSearch = insurance.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            insurance.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || insurance.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (selectedInsurance) {
        return (
            <InsuranceDetail
                insurance={selectedInsurance}
                onBack={() => setSelectedInsurance(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* 標題 */}
            <div className="flex items-center justify-between">
                <SectionTitle icon={Shield} title="保險管理" subtitle="工程保險與理賠追蹤" />
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Plus size={18} />
                    新增保險
                </button>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Shield}
                    label="總保額"
                    value={`$${(stats.totalCoverage / 100000000).toFixed(1)}億`}
                    color="blue"
                />
                <StatCard
                    icon={DollarSign}
                    label="年保費"
                    value={`$${(stats.totalPremium / 10000).toFixed(0)}萬`}
                    color="green"
                />
                <StatCard
                    icon={CheckCircle}
                    label="有效保單"
                    value={stats.activeCount}
                    subValue="張"
                    color="emerald"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="即將到期"
                    value={stats.expiringCount}
                    subValue="張"
                    color="yellow"
                />
            </div>

            {/* 搜尋和篩選 */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜尋保單編號或專案名稱..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">全部類型</option>
                    {Object.entries(INSURANCE_TYPES).map(([key, type]) => (
                        <option key={key} value={key}>{type.label}</option>
                    ))}
                </select>
            </div>

            {/* 保險列表 */}
            <div className="space-y-4">
                {filteredInsurances.map(insurance => (
                    <InsuranceCard
                        key={insurance.id}
                        insurance={insurance}
                        onClick={() => setSelectedInsurance(insurance)}
                    />
                ))}
                {filteredInsurances.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Shield size={48} className="mx-auto mb-4 opacity-50" />
                        <p>沒有符合條件的保險記錄</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Insurance;
