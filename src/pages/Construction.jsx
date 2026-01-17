/**
 * 工程管理頁面 (Construction.jsx)
 * 工程進度追蹤、里程碑管理、任務分派
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Building2, Plus, Search, Filter, ChevronRight, CheckCircle2,
    Clock, AlertTriangle, Calendar, Users, MapPin, TrendingUp,
    BarChart3, ListChecks, FileText, ChevronLeft, Target, Flag,
    Play, Pause, Check, AlertCircle, Wrench, HardHat, ClipboardList
} from 'lucide-react';
import { SectionTitle } from '../components/common/Indicators';
import ConstructionService, {
    CONSTRUCTION_STATUS,
    CONSTRUCTION_STATUS_LABELS,
    CONSTRUCTION_STATUS_COLORS,
    TASK_STATUS,
    TASK_STATUS_LABELS,
    TASK_PRIORITY,
    TASK_PRIORITY_LABELS,
    TASK_PRIORITY_COLORS
} from '../services/ConstructionService';

// ============================================
// 格式化函數
// ============================================
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-TW');
};

const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
};

// ============================================
// 狀態徽章
// ============================================
const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${CONSTRUCTION_STATUS_COLORS[status]}`}>
        {CONSTRUCTION_STATUS_LABELS[status]}
    </span>
);

const TaskStatusBadge = ({ status }) => {
    const colors = {
        [TASK_STATUS.PENDING]: 'bg-gray-100 text-gray-600',
        [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-600',
        [TASK_STATUS.COMPLETED]: 'bg-green-100 text-green-600',
        [TASK_STATUS.BLOCKED]: 'bg-red-100 text-red-600'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
            {TASK_STATUS_LABELS[status]}
        </span>
    );
};

// ============================================
// 統計卡片
// ============================================
const StatCard = ({ icon: Icon, label, value, color = 'gray', subValue }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-${color}-100`}>
                <Icon size={22} className={`text-${color}-600`} />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
            </div>
        </div>
    </div>
);

// ============================================
// 進度條
// ============================================
const ProgressBar = ({ percent, size = 'md', showLabel = true }) => {
    const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
    const color = percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-blue-500' : percent >= 25 ? 'bg-orange-500' : 'bg-red-500';

    return (
        <div className="flex items-center gap-2">
            <div className={`flex-1 bg-gray-100 rounded-full ${heights[size]} overflow-hidden`}>
                <div
                    className={`${color} ${heights[size]} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            {showLabel && <span className="text-sm font-medium text-gray-600 w-12 text-right">{percent}%</span>}
        </div>
    );
};

// ============================================
// 里程碑時間軸
// ============================================
const MilestoneTimeline = ({ milestones, onComplete }) => {
    return (
        <div className="space-y-3">
            {milestones.map((milestone, index) => {
                const daysUntil = getDaysUntil(milestone.dueDate);
                const isOverdue = !milestone.completed && daysUntil < 0;
                const isUpcoming = !milestone.completed && daysUntil >= 0 && daysUntil <= 7;

                return (
                    <div key={milestone.id} className="flex gap-3">
                        {/* 時間軸線 */}
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${milestone.completed
                                ? 'bg-green-500 text-white'
                                : isOverdue
                                    ? 'bg-red-500 text-white'
                                    : isUpcoming
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                }`}>
                                {milestone.completed ? <Check size={16} /> : <Flag size={14} />}
                            </div>
                            {index < milestones.length - 1 && (
                                <div className={`w-0.5 flex-1 min-h-[24px] ${milestone.completed ? 'bg-green-300' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>

                        {/* 內容 */}
                        <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className={`font-medium ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                        {milestone.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                        <Calendar size={12} />
                                        <span>預定: {formatDate(milestone.dueDate)}</span>
                                        {milestone.completedDate && (
                                            <span className="text-green-600">
                                                ✓ 完成: {formatDate(milestone.completedDate)}
                                            </span>
                                        )}
                                        {isOverdue && (
                                            <span className="text-red-600 font-medium">
                                                逾期 {Math.abs(daysUntil)} 天
                                            </span>
                                        )}
                                        {isUpcoming && !milestone.completed && (
                                            <span className="text-orange-600">
                                                剩餘 {daysUntil} 天
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {!milestone.completed && (
                                    <button
                                        onClick={() => onComplete?.(milestone.id)}
                                        className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
                                    >
                                        標記完成
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ============================================
// 任務列表
// ============================================
const TaskList = ({ tasks, onStatusChange }) => {
    return (
        <div className="space-y-2">
            {tasks.map(task => (
                <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-colors ${task.status === TASK_STATUS.COMPLETED
                        ? 'bg-gray-50 border-gray-100'
                        : task.status === TASK_STATUS.BLOCKED
                            ? 'bg-red-50 border-red-100'
                            : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        {/* 勾選框 */}
                        <button
                            onClick={() => onStatusChange?.(task.id,
                                task.status === TASK_STATUS.COMPLETED
                                    ? TASK_STATUS.PENDING
                                    : TASK_STATUS.COMPLETED
                            )}
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.status === TASK_STATUS.COMPLETED
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                                }`}
                        >
                            {task.status === TASK_STATUS.COMPLETED && <Check size={12} />}
                        </button>

                        {/* 內容 */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-medium ${task.status === TASK_STATUS.COMPLETED ? 'text-gray-400 line-through' : 'text-gray-800'
                                    }`}>
                                    {task.name}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-xs ${TASK_PRIORITY_COLORS[task.priority]}`}>
                                    {TASK_PRIORITY_LABELS[task.priority]}
                                </span>
                                <TaskStatusBadge status={task.status} />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    {task.assignee}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {formatDate(task.startDate)} ~ {formatDate(task.endDate)}
                                </span>
                            </div>
                            {task.status === TASK_STATUS.BLOCKED && task.blockedReason && (
                                <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    {task.blockedReason}
                                </div>
                            )}
                            {task.status !== TASK_STATUS.COMPLETED && (
                                <div className="mt-2">
                                    <ProgressBar percent={task.progress} size="sm" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================
// 甘特圖
// ============================================
const GanttChart = ({ tasks, startDate, endDate }) => {
    const totalDays = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }, [startDate, endDate]);

    const getPosition = (date) => {
        const start = new Date(startDate);
        const target = new Date(date);
        const days = Math.ceil((target - start) / (1000 * 60 * 60 * 24));
        return (days / totalDays) * 100;
    };

    const getWidth = (start, end) => {
        const startPos = getPosition(start);
        const endPos = getPosition(end);
        return Math.max(endPos - startPos, 2);
    };

    // 生成週標記
    const weeks = useMemo(() => {
        const result = [];
        const startDateObj = new Date(startDate);
        let current = new Date(startDateObj);
        let weekNum = 1;

        const endDateObj = new Date(endDate);
        const totalDaysCalc = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));

        const getPosInner = (date) => {
            const target = new Date(date);
            const days = Math.ceil((target - startDateObj) / (1000 * 60 * 60 * 24));
            return (days / totalDaysCalc) * 100;
        };

        while (current <= endDateObj) {
            result.push({
                label: `W${weekNum}`,
                position: getPosInner(current.toISOString().split('T')[0])
            });
            current.setDate(current.getDate() + 7);
            weekNum++;
        }
        return result;
    }, [startDate, endDate]);

    const taskColors = {
        [TASK_STATUS.COMPLETED]: 'bg-green-400',
        [TASK_STATUS.IN_PROGRESS]: 'bg-blue-400',
        [TASK_STATUS.PENDING]: 'bg-gray-300',
        [TASK_STATUS.BLOCKED]: 'bg-red-400'
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[600px]">
                {/* 時間軸頭 */}
                <div className="flex border-b border-gray-200 mb-2">
                    <div className="w-32 shrink-0 text-xs text-gray-500 py-2">任務</div>
                    <div className="flex-1 relative h-8">
                        {weeks.map((week, i) => (
                            <div
                                key={i}
                                className="absolute top-0 h-full border-l border-gray-100 text-xs text-gray-400 pl-1"
                                style={{ left: `${week.position}%` }}
                            >
                                {week.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 任務行 */}
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center py-1.5 border-b border-gray-50">
                        <div className="w-32 shrink-0 text-xs text-gray-700 truncate pr-2">{task.name}</div>
                        <div className="flex-1 relative h-6 bg-gray-50 rounded">
                            {/* 週分隔線 */}
                            {weeks.map((week, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 h-full border-l border-gray-100"
                                    style={{ left: `${week.position}%` }}
                                />
                            ))}
                            {/* 任務條 */}
                            <div
                                className={`absolute top-1 h-4 rounded ${taskColors[task.status]} transition-all`}
                                style={{
                                    left: `${getPosition(task.startDate)}%`,
                                    width: `${getWidth(task.startDate, task.endDate)}%`
                                }}
                                title={`${task.name}: ${formatDate(task.startDate)} ~ ${formatDate(task.endDate)}`}
                            >
                                {/* 進度覆蓋 */}
                                {task.status === TASK_STATUS.IN_PROGRESS && (
                                    <div
                                        className="absolute top-0 left-0 h-full bg-blue-600 rounded-l"
                                        style={{ width: `${task.progress}%` }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// 每日報告列表
// ============================================
const DailyReportList = ({ reports }) => {
    if (!reports || reports.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
                <p>尚無施工日誌</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {reports.map(report => (
                <div key={report.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-800">{formatDate(report.date)}</span>
                            <span className="text-sm text-gray-500">{report.weather} {report.temperature}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Users size={14} />
                                {report.workers} 人
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {report.workHours} 小時
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">{report.notes}</p>
                </div>
            ))}
        </div>
    );
};

// ============================================
// 工程詳情
// ============================================
const ConstructionDetail = ({ construction, onBack, onRefresh, addToast }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const handleCompleteMilestone = async (milestoneId) => {
        try {
            await ConstructionService.completeMilestone(construction.id, milestoneId);
            addToast?.('里程碑已完成', 'success');
            onRefresh?.();
        } catch {
            addToast?.('操作失敗', 'error');
        }
    };

    const handleTaskStatusChange = async (taskId, status) => {
        try {
            await ConstructionService.updateTaskStatus(construction.id, taskId, status);
            addToast?.('任務狀態已更新', 'success');
            onRefresh?.();
        } catch {
            addToast?.('操作失敗', 'error');
        }
    };

    const completedMilestones = construction.milestones.filter(m => m.completed).length;
    const completedTasks = construction.tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    const budgetUsed = construction.actualCost / construction.budget * 100;

    const tabs = [
        { id: 'overview', label: '概覽', icon: BarChart3 },
        { id: 'milestones', label: '里程碑', icon: Flag },
        { id: 'tasks', label: '任務', icon: ListChecks },
        { id: 'gantt', label: '甘特圖', icon: BarChart3 },
        { id: 'reports', label: '日誌', icon: FileText }
    ];

    return (
        <div className="space-y-6">
            {/* 頂部 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">{construction.projectName}</h2>
                            <StatusBadge status={construction.status} />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {construction.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <HardHat size={14} />
                                {construction.manager}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 快速統計 */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">整體進度</p>
                    <div className="mt-2">
                        <ProgressBar percent={construction.progress} size="lg" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">里程碑</p>
                    <p className="text-xl font-bold text-blue-600">
                        {completedMilestones} / {construction.milestones.length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">任務完成</p>
                    <p className="text-xl font-bold text-green-600">
                        {completedTasks} / {construction.tasks.length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">預算使用</p>
                    <p className={`text-xl font-bold ${budgetUsed > 90 ? 'text-red-600' : 'text-gray-800'}`}>
                        {budgetUsed.toFixed(0)}%
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 內容 */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Target size={18} />
                            基本資訊
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">客戶</span>
                                <span>{construction.clientName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">開工日期</span>
                                <span>{formatDate(construction.startDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">預計完工</span>
                                <span>{formatDate(construction.endDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">預算</span>
                                <span>{formatCurrency(construction.budget)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">已支出</span>
                                <span className="text-red-600">{formatCurrency(construction.actualCost)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Flag size={18} />
                            近期里程碑
                        </h3>
                        <MilestoneTimeline
                            milestones={construction.milestones.slice(0, 3)}
                            onComplete={handleCompleteMilestone}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'milestones' && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <h3 className="font-semibold mb-4">里程碑時間軸</h3>
                    <MilestoneTimeline
                        milestones={construction.milestones}
                        onComplete={handleCompleteMilestone}
                    />
                </div>
            )}

            {activeTab === 'tasks' && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">任務清單</h3>
                        <button className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 flex items-center gap-1">
                            <Plus size={14} />
                            新增任務
                        </button>
                    </div>
                    <TaskList
                        tasks={construction.tasks}
                        onStatusChange={handleTaskStatusChange}
                    />
                </div>
            )}

            {activeTab === 'gantt' && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <h3 className="font-semibold mb-4">甘特圖</h3>
                    <GanttChart
                        tasks={construction.tasks}
                        startDate={construction.startDate}
                        endDate={construction.endDate}
                    />
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">施工日誌</h3>
                        <button className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 flex items-center gap-1">
                            <Plus size={14} />
                            新增日誌
                        </button>
                    </div>
                    <DailyReportList reports={construction.dailyReports} />
                </div>
            )}
        </div>
    );
};

// ============================================
// 工程列表
// ============================================
const ConstructionList = ({ onView, addToast }) => {
    const [constructions, setConstructions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [data, statsData] = await Promise.all([
                    ConstructionService.getConstructions(),
                    ConstructionService.getStats()
                ]);
                setConstructions(data);
                setStats(statsData);
            } catch {
                addToast?.('載入失敗', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [addToast]);

    const filteredConstructions = useMemo(() => {
        return constructions.filter(c => {
            if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    c.projectName.toLowerCase().includes(term) ||
                    c.clientName.toLowerCase().includes(term) ||
                    c.manager.toLowerCase().includes(term)
                );
            }
            return true;
        });
    }, [constructions, statusFilter, searchTerm]);

    return (
        <div className="space-y-6">
            {/* 標題 */}
            <div className="flex items-center justify-between">
                <SectionTitle
                    icon={Building2}
                    title="工程管理"
                    subtitle="追蹤施工進度與里程碑"
                />
                <button className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 flex items-center gap-2">
                    <Plus size={18} />
                    新增工程
                </button>
            </div>

            {/* 統計 */}
            <div className="grid grid-cols-5 gap-4">
                <StatCard icon={Building2} label="全部工程" value={stats.total || 0} color="gray" />
                <StatCard icon={Wrench} label="進行中" value={stats.inProgress || 0} color="blue" />
                <StatCard icon={AlertTriangle} label="延遲" value={stats.delayed || 0} color="red" />
                <StatCard icon={CheckCircle2} label="已完工" value={stats.completed || 0} color="green" />
                <StatCard icon={Clock} label="規劃中" value={stats.planning || 0} color="purple" />
            </div>

            {/* 警示區 */}
            {(stats.upcomingMilestones?.length > 0 || stats.overdueTasks?.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                    {stats.upcomingMilestones?.length > 0 && (
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                            <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                                <Calendar size={16} />
                                本週里程碑
                            </h4>
                            <div className="space-y-1">
                                {stats.upcomingMilestones.slice(0, 3).map(m => (
                                    <div key={m.id} className="text-sm text-orange-700">
                                        {m.projectName}: {m.name} ({formatDate(m.dueDate)})
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {stats.overdueTasks?.length > 0 && (
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                                <AlertCircle size={16} />
                                逾期任務
                            </h4>
                            <div className="space-y-1">
                                {stats.overdueTasks.slice(0, 3).map(t => (
                                    <div key={t.id} className="text-sm text-red-700">
                                        {t.projectName}: {t.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 搜尋篩選 */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="搜尋專案、客戶、負責人..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white"
                >
                    <option value="ALL">全部狀態</option>
                    {Object.entries(CONSTRUCTION_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {/* 工程列表 */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">載入中...</div>
                ) : filteredConstructions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Building2 size={48} className="mx-auto mb-4 opacity-30" />
                        <p>尚無工程資料</p>
                    </div>
                ) : (
                    filteredConstructions.map(construction => (
                        <div
                            key={construction.id}
                            onClick={() => onView(construction)}
                            className="bg-white rounded-xl p-5 border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-gray-800">{construction.projectName}</h3>
                                        <StatusBadge status={construction.status} />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {construction.clientName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HardHat size={14} />
                                            {construction.manager}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(construction.startDate)} ~ {formatDate(construction.endDate)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 max-w-xs">
                                            <ProgressBar percent={construction.progress} />
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            里程碑: {construction.milestones.filter(m => m.completed).length}/{construction.milestones.length}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            任務: {construction.tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length}/{construction.tasks.length}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-400" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ============================================
// 主組件
// ============================================
const Construction = ({ addToast }) => {
    const [viewMode, setViewMode] = useState('list');
    const [selectedConstruction, setSelectedConstruction] = useState(null);

    const handleView = (construction) => {
        setSelectedConstruction(construction);
        setViewMode('detail');
    };

    const handleBack = () => {
        setSelectedConstruction(null);
        setViewMode('list');
    };

    const handleRefresh = async () => {
        if (selectedConstruction) {
            const updated = await ConstructionService.getConstruction(selectedConstruction.id);
            setSelectedConstruction(updated);
        }
    };

    if (viewMode === 'detail' && selectedConstruction) {
        return (
            <ConstructionDetail
                construction={selectedConstruction}
                onBack={handleBack}
                onRefresh={handleRefresh}
                addToast={addToast}
            />
        );
    }

    return (
        <ConstructionList
            onView={handleView}
            addToast={addToast}
        />
    );
};

export default Construction;
