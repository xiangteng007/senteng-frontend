/**
 * 廢棄物管理頁面 (Waste.jsx)
 * 營建廢棄物紀錄與環保申報
 */

import React, { useState, useEffect } from 'react';
import {
    Trash2,
    Plus,
    Search,
    Recycle,
    TrendingUp,
    FileText,
    Calendar,
    Truck,
    Scale,
    Download,
    BarChart3,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { LoadingSpinner, SectionTitle } from '../components/common/Indicators';

// 廢棄物類別
const WASTE_CATEGORIES = {
    CONSTRUCTION: { label: '營建廢棄物', color: 'orange', icon: Trash2 },
    DEMOLITION: { label: '拆除廢棄物', color: 'red', icon: Trash2 },
    SOIL: { label: '剩餘土石方', color: 'amber', icon: Scale },
    RECYCLABLE: { label: '可回收物', color: 'green', icon: Recycle },
    HAZARDOUS: { label: '有害廢棄物', color: 'purple', icon: AlertTriangle },
};

// 處理方式
const DISPOSAL_METHODS = {
    LANDFILL: { label: '掩埋', color: 'gray' },
    RECYCLING: { label: '回收再利用', color: 'green' },
    INCINERATION: { label: '焚化', color: 'orange' },
    TREATMENT: { label: '中間處理', color: 'blue' },
};

// 統計卡片
const StatCard = ({ icon: Icon, label, value, unit, trend, color = 'gray' }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${color}-100`}>
                <Icon size={24} className={`text-${color}-600`} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
                    {unit && <span className="text-sm text-gray-400">{unit}</span>}
                </div>
                {trend && (
                    <p className={`text-xs mt-1 ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% 較上月
                    </p>
                )}
            </div>
        </div>
    </div>
);

// 廢棄物記錄卡片
const WasteRecordCard = ({ record }) => {
    const category = WASTE_CATEGORIES[record.category] || WASTE_CATEGORIES.CONSTRUCTION;
    const method = DISPOSAL_METHODS[record.disposalMethod] || DISPOSAL_METHODS.LANDFILL;
    const CategoryIcon = category.icon;

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-${category.color}-100`}>
                    <CategoryIcon size={20} className={`text-${category.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{record.manifestNo}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${category.color}-100 text-${category.color}-700`}>
                            {category.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{record.projectName}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{record.weight.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">公斤</p>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{record.date}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Truck size={14} />
                    <span>{record.haulerName}</span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-${method.color}-100 text-${method.color}-700`}>
                    <span>{method.label}</span>
                </div>
                {record.recycleValue > 0 && (
                    <div className="flex items-center gap-1 text-green-600 ml-auto">
                        <Recycle size={14} />
                        <span>回收 ${record.recycleValue.toLocaleString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// 月報表檢視
const MonthlyReportView = ({ data, month }) => {
    const totalWaste = data.reduce((sum, d) => sum + d.weight, 0);
    const recycledWaste = data.filter(d => d.disposalMethod === 'RECYCLING').reduce((sum, d) => sum + d.weight, 0);
    const recycleRate = totalWaste > 0 ? ((recycledWaste / totalWaste) * 100).toFixed(1) : 0;

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600">
                <h3 className="text-lg font-bold text-white">{month} 月報表</h3>
                <p className="text-white/80 text-sm">營建廢棄物處理申報</p>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-800">{(totalWaste / 1000).toFixed(1)}</p>
                        <p className="text-sm text-gray-500">總廢棄量 (噸)</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">{recycleRate}%</p>
                        <p className="text-sm text-gray-500">回收比例</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">{data.length}</p>
                        <p className="text-sm text-gray-500">清運車次</p>
                    </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                    <Download size={18} />
                    下載 EPA 申報表
                </button>
            </div>
        </div>
    );
};

// 主組件
const Waste = ({ addToast }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [activeTab, setActiveTab] = useState('records');

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setRecords([
                {
                    id: 1,
                    manifestNo: 'EPA-2026-001234',
                    category: 'CONSTRUCTION',
                    projectName: '台北市信義區辦公大樓新建工程',
                    date: '2026-01-25',
                    weight: 15680,
                    disposalMethod: 'RECYCLING',
                    haulerName: '大安環保清運',
                    recycleValue: 12500,
                },
                {
                    id: 2,
                    manifestNo: 'EPA-2026-001235',
                    category: 'DEMOLITION',
                    projectName: '台北市信義區辦公大樓新建工程',
                    date: '2026-01-24',
                    weight: 28500,
                    disposalMethod: 'LANDFILL',
                    haulerName: '大安環保清運',
                    recycleValue: 0,
                },
                {
                    id: 3,
                    manifestNo: 'EPA-2026-001236',
                    category: 'SOIL',
                    projectName: '新北市林口住宅案',
                    date: '2026-01-23',
                    weight: 45000,
                    disposalMethod: 'RECYCLING',
                    haulerName: '北區土石方處理場',
                    recycleValue: 35000,
                },
                {
                    id: 4,
                    manifestNo: 'EPA-2026-001237',
                    category: 'RECYCLABLE',
                    projectName: '桃園市大園區廠房修繕',
                    date: '2026-01-22',
                    weight: 8200,
                    disposalMethod: 'RECYCLING',
                    haulerName: '資源回收專業公司',
                    recycleValue: 18500,
                },
            ]);
        } catch (error) {
            addToast?.('載入廢棄物記錄失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 統計
    const stats = {
        totalWeight: records.reduce((sum, r) => sum + r.weight, 0),
        recycledWeight: records.filter(r => r.disposalMethod === 'RECYCLING').reduce((sum, r) => sum + r.weight, 0),
        totalRecycleValue: records.reduce((sum, r) => sum + (r.recycleValue || 0), 0),
        recordCount: records.length,
    };
    stats.recycleRate = stats.totalWeight > 0 ? ((stats.recycledWeight / stats.totalWeight) * 100).toFixed(1) : 0;

    // 過濾
    const filteredRecords = records.filter(record => {
        const matchesSearch = record.manifestNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
        return matchesSearch && matchesCategory;
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
                <SectionTitle icon={Recycle} title="廢棄物管理" subtitle="營建廢棄物紀錄與環保申報" />
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                    <Plus size={18} />
                    新增記錄
                </button>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Scale}
                    label="本月總廢棄量"
                    value={(stats.totalWeight / 1000).toFixed(1)}
                    unit="噸"
                    trend={5}
                    color="orange"
                />
                <StatCard
                    icon={Recycle}
                    label="回收比例"
                    value={stats.recycleRate}
                    unit="%"
                    color="green"
                />
                <StatCard
                    icon={TrendingUp}
                    label="回收金額"
                    value={`$${(stats.totalRecycleValue / 1000).toFixed(0)}K`}
                    color="blue"
                />
                <StatCard
                    icon={Truck}
                    label="清運車次"
                    value={stats.recordCount}
                    unit="次"
                    color="purple"
                />
            </div>

            {/* Tab 切換 */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('records')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'records'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    廢棄物記錄
                </button>
                <button
                    onClick={() => setActiveTab('report')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'report'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    月報表
                </button>
            </div>

            {activeTab === 'records' && (
                <>
                    {/* 搜尋和篩選 */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-64 relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜尋聯單編號或專案名稱..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">全部類別</option>
                            {Object.entries(WASTE_CATEGORIES).map(([key, cat]) => (
                                <option key={key} value={key}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* 記錄列表 */}
                    <div className="space-y-4">
                        {filteredRecords.map(record => (
                            <WasteRecordCard key={record.id} record={record} />
                        ))}
                        {filteredRecords.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <Recycle size={48} className="mx-auto mb-4 opacity-50" />
                                <p>沒有符合條件的廢棄物記錄</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'report' && (
                <MonthlyReportView data={records} month="2026年1月" />
            )}
        </div>
    );
};

export default Waste;
