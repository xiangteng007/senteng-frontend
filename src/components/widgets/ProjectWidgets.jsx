
import React from 'react';
import { Briefcase, Plus, FileText, Image as ImageIcon, Upload, Edit2, ChevronLeft } from 'lucide-react';
import { ProgressBar } from '../common/Indicators';

// --- MAIN PROJECT LIST WIDGETS ---
export const WidgetProjectStats = ({ data, size }) => {
    if (!Array.isArray(data)) return null;
    const activeCount = data.filter(p => ["設計中", "施工中"].includes(p.status)).length;
    if (size === 'S') return <div className="h-full flex flex-col justify-between"><Briefcase size={24} className="text-morandi-blue-500" /><div><div className="text-3xl font-bold text-morandi-text-primary">{activeCount}</div><div className="text-xs text-gray-500">進行中專案</div></div></div>;

    const designCount = data.filter(p => p.status === "設計中").length;
    const constructionCount = data.filter(p => p.status === "施工中").length;

    return (
        <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-end">
                <div><div className="text-3xl font-bold text-morandi-text-primary">{activeCount}</div><div className="text-xs text-gray-500">總進行中</div></div>
                <div className="space-y-1 text-right">
                    <div className="text-xs"><span className="font-bold text-morandi-blue-600">{designCount}</span> 設計中</div>
                    <div className="text-xs"><span className="font-bold text-morandi-orange-600">{constructionCount}</span> 施工中</div>
                </div>
            </div>
            {size === 'L' && (
                <div className="mt-4 flex gap-1">
                    <div style={{ width: `${(designCount / activeCount || 0) * 100}%` }} className="bg-morandi-blue-500 h-2 rounded-l-full"></div>
                    <div style={{ width: `${(constructionCount / activeCount || 0) * 100}%` }} className="bg-morandi-orange-500 h-2 rounded-r-full"></div>
                </div>
            )}
        </div>
    );
};

export const WidgetProjectList = ({ data, size, onSelectProject, onAdd }) => {
    if (!Array.isArray(data)) return null;
    if (size === 'S') return <div className="h-full flex flex-col justify-center items-center gap-2"><div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" onClick={onAdd}><Plus size={24} /></div><button className="text-xs font-bold text-gray-600 hover:text-morandi-blue-600" onClick={onAdd}>新增專案</button></div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between mb-4 gap-2">
                <span className="font-bold text-gray-500 text-xs">最近更新 ({data.length})</span>
                {size === 'L' && <button onClick={onAdd} className="bg-morandi-text-accent text-white px-2 py-1 text-xs rounded-lg flex items-center gap-1 hover:bg-gray-700 transition-colors"><Plus size={12} /> 新增</button>}
            </div>
            <div className={`overflow-y-auto pr-1 pb-2 custom-scrollbar ${size === 'L' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
                {data.map(p => (
                    <div key={p.id} onClick={() => onSelectProject && onSelectProject(p)} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-morandi-blue-200 transition-all cursor-pointer group">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${p.status === '施工中' ? 'bg-morandi-orange-500' : 'bg-morandi-blue-500'}`}></span>
                            <h4 className="font-bold text-morandi-text-primary text-sm truncate">{p.name}</h4>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mb-4">{p.code}</p>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>進度</span><span>{p.progress}%</span></div>
                        <ProgressBar value={p.progress} />
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- PROJECT DETAIL WIDGETS ---
export const WidgetProjectInfo = ({ project, size }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl"><span className="text-xs text-gray-500 block mb-1">業主</span><span className="font-bold text-gray-800">{project.clientName}</span></div>
            <div className="bg-gray-50 p-3 rounded-xl"><span className="text-xs text-gray-500 block mb-1">類型</span><span className="font-bold text-gray-800">{project.type}</span></div>
        </div>
        <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1"><span>專案進度</span><span>{project.progress}%</span></div>
            <ProgressBar value={project.progress} />
        </div>
    </div>
);

export const WidgetProjectFiles = ({ files, size, onUpload }) => {
    if (size === 'S') return <div className="h-full flex flex-col justify-center items-center gap-2"><div className="w-10 h-10 bg-morandi-orange-100 text-morandi-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-morandi-orange-500 hover:text-white transition-colors" onClick={onUpload}><Upload size={18} /></div><span className="text-xs text-gray-500">上傳檔案</span></div>;
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between mb-3 items-center"><h4 className="text-xs font-bold text-gray-600">Drive 檔案</h4><button onClick={onUpload} className="text-morandi-orange-600 hover:bg-morandi-orange-100 p-1.5 rounded-lg transition-colors"><Upload size={14} /></button></div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {files.map(f => (
                    <div key={f.id} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 cursor-pointer transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><FileText size={16} /></div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-700 truncate">{f.name}</div>
                            <div className="text-[10px] text-gray-400">{f.size} · {f.date}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// NEW P0 WIDGETS
// ============================================

import { Flag, Check, Calendar, AlertCircle, Link2, Target, Clock, TrendingUp } from 'lucide-react';

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-TW');
};

// 計算剩餘天數
const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

// --- 階段進度 Widget ---
export const WidgetProjectProgress = ({ phases = [], onUpdate, size }) => {
    // 預設階段 (如果沒有資料)
    const defaultPhases = [
        { id: 'p1', name: '拆除', weight: 10, progress: 100 },
        { id: 'p2', name: '水電', weight: 20, progress: 60 },
        { id: 'p3', name: '泥作', weight: 25, progress: 30 },
        { id: 'p4', name: '油漆', weight: 20, progress: 0 },
        { id: 'p5', name: '清潔', weight: 10, progress: 0 },
        { id: 'p6', name: '驗收', weight: 15, progress: 0 },
    ];

    const phaseData = phases.length > 0 ? phases : defaultPhases;
    const overallProgress = Math.round(
        phaseData.reduce((sum, p) => sum + (p.progress * p.weight / 100), 0)
    );

    const getProgressColor = (progress) => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress > 0) return 'bg-orange-500';
        return 'bg-gray-200';
    };

    if (size === 'S') {
        return (
            <div className="h-full flex flex-col justify-between">
                <TrendingUp size={24} className="text-blue-500" />
                <div>
                    <div className="text-3xl font-bold text-gray-800">{overallProgress}%</div>
                    <div className="text-xs text-gray-500">總體進度</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* 總進度 */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">總體進度</span>
                <span className="text-lg font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                />
            </div>

            {/* 各階段進度 */}
            <div className="space-y-2">
                {phaseData.map(phase => (
                    <div key={phase.id} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-gray-600 truncate">{phase.name}</div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getProgressColor(phase.progress)} rounded-full transition-all`}
                                style={{ width: `${phase.progress}%` }}
                            />
                        </div>
                        <div className="w-10 text-xs text-gray-500 text-right">{phase.progress}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 里程碑 Widget ---
export const WidgetProjectMilestones = ({ milestones = [], onComplete, onAdd, size }) => {
    // 預設里程碑 (如果沒有資料)
    const defaultMilestones = [
        { id: 'm1', name: '設計簽約', dueDate: '2026-01-15', completedDate: '2026-01-14', status: 'completed' },
        { id: 'm2', name: '開工', dueDate: '2026-01-20', completedDate: null, status: 'pending' },
        { id: 'm3', name: '水電驗收', dueDate: '2026-02-10', completedDate: null, status: 'pending' },
        { id: 'm4', name: '完工驗收', dueDate: '2026-03-15', completedDate: null, status: 'pending' },
    ];

    const milestoneData = milestones.length > 0 ? milestones : defaultMilestones;
    const completedCount = milestoneData.filter(m => m.status === 'completed').length;

    if (size === 'S') {
        return (
            <div className="h-full flex flex-col justify-between">
                <Flag size={24} className="text-orange-500" />
                <div>
                    <div className="text-3xl font-bold text-gray-800">{completedCount}/{milestoneData.length}</div>
                    <div className="text-xs text-gray-500">里程碑完成</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-600">{completedCount}/{milestoneData.length} 已完成</span>
                {onAdd && (
                    <button onClick={onAdd} className="text-orange-600 hover:bg-orange-50 p-1.5 rounded-lg text-xs">
                        + 新增
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {milestoneData.map((milestone, index) => {
                    const daysUntil = getDaysUntil(milestone.dueDate);
                    const isOverdue = milestone.status !== 'completed' && daysUntil < 0;
                    const isUpcoming = milestone.status !== 'completed' && daysUntil >= 0 && daysUntil <= 7;

                    return (
                        <div key={milestone.id} className="flex items-start gap-2">
                            {/* 時間軸線 */}
                            <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${milestone.status === 'completed'
                                        ? 'bg-green-500 text-white'
                                        : isOverdue
                                            ? 'bg-red-500 text-white'
                                            : isUpcoming
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {milestone.status === 'completed' ? <Check size={12} /> : index + 1}
                                </div>
                                {index < milestoneData.length - 1 && (
                                    <div className={`w-0.5 h-6 ${milestone.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>

                            {/* 內容 */}
                            <div className="flex-1 min-w-0 pb-2">
                                <div className={`text-sm font-medium ${milestone.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'
                                    }`}>
                                    {milestone.name}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Calendar size={10} />
                                    <span>{formatDate(milestone.dueDate)}</span>
                                    {isOverdue && <span className="text-red-600">逾期 {Math.abs(daysUntil)} 天</span>}
                                    {isUpcoming && <span className="text-orange-600">剩 {daysUntil} 天</span>}
                                </div>
                            </div>

                            {/* 完成按鈕 */}
                            {milestone.status !== 'completed' && onComplete && (
                                <button
                                    onClick={() => onComplete(milestone.id)}
                                    className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded"
                                >
                                    完成
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- 專案時程 Widget (甘特圖) ---
export const WidgetProjectTimeline = ({ tasks = [], startDate, endDate, size }) => {
    // 預設任務 (如果沒有資料)
    const defaultTasks = [
        { id: 't1', name: '拆除工程', startDate: '2026-01-15', endDate: '2026-01-25', progress: 100, status: 'completed' },
        { id: 't2', name: '水電配管', startDate: '2026-01-22', endDate: '2026-02-10', progress: 60, status: 'in_progress' },
        { id: 't3', name: '泥作隔間', startDate: '2026-02-05', endDate: '2026-02-25', progress: 20, status: 'in_progress' },
        { id: 't4', name: '油漆粉刷', startDate: '2026-02-26', endDate: '2026-03-10', progress: 0, status: 'pending' },
        { id: 't5', name: '清潔驗收', startDate: '2026-03-11', endDate: '2026-03-15', progress: 0, status: 'pending' },
    ];

    const taskData = tasks.length > 0 ? tasks : defaultTasks;
    const projectStart = startDate || taskData[0]?.startDate || '2026-01-15';
    const projectEnd = endDate || taskData[taskData.length - 1]?.endDate || '2026-03-15';

    const totalDays = Math.ceil((new Date(projectEnd) - new Date(projectStart)) / (1000 * 60 * 60 * 24));

    const getPosition = (date) => {
        const start = new Date(projectStart);
        const target = new Date(date);
        const days = Math.ceil((target - start) / (1000 * 60 * 60 * 24));
        return Math.max(0, Math.min(100, (days / totalDays) * 100));
    };

    const getWidth = (start, end) => {
        return Math.max(getPosition(end) - getPosition(start), 3);
    };

    const statusColors = {
        completed: 'bg-green-400',
        in_progress: 'bg-blue-400',
        pending: 'bg-gray-300',
    };

    if (size === 'S') {
        return (
            <div className="h-full flex flex-col justify-between">
                <Clock size={24} className="text-purple-500" />
                <div>
                    <div className="text-lg font-bold text-gray-800">{taskData.length}</div>
                    <div className="text-xs text-gray-500">進行任務</div>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[400px]">
                {/* 時間軸頭 */}
                <div className="flex border-b border-gray-200 mb-2 pb-2">
                    <div className="w-24 shrink-0 text-xs text-gray-500">任務</div>
                    <div className="flex-1 flex justify-between text-xs text-gray-400">
                        <span>{formatDate(projectStart)}</span>
                        <span>{formatDate(projectEnd)}</span>
                    </div>
                </div>

                {/* 任務行 */}
                {taskData.map(task => (
                    <div key={task.id} className="flex items-center py-1.5">
                        <div className="w-24 shrink-0 text-xs text-gray-700 truncate pr-2">{task.name}</div>
                        <div className="flex-1 relative h-5 bg-gray-50 rounded">
                            {/* 任務條 */}
                            <div
                                className={`absolute top-0.5 h-4 rounded ${statusColors[task.status]} transition-all`}
                                style={{
                                    left: `${getPosition(task.startDate)}%`,
                                    width: `${getWidth(task.startDate, task.endDate)}%`
                                }}
                                title={`${task.name}: ${formatDate(task.startDate)} ~ ${formatDate(task.endDate)}`}
                            >
                                {/* 進度覆蓋 */}
                                {task.status === 'in_progress' && task.progress > 0 && (
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

// --- 關聯文件 Widget ---
export const WidgetProjectLinks = ({ project, quotation, contract, payments = [], changeOrders = [], size }) => {
    const links = [
        quotation && {
            type: '報價單',
            label: quotation.code || 'QT-XXXX',
            status: quotation.status,
            color: 'blue'
        },
        contract && {
            type: '合約',
            label: contract.code || 'CT-XXXX',
            status: contract.status,
            color: 'green'
        },
        payments.length > 0 && {
            type: '付款',
            label: `${payments.filter(p => p.status === 'paid').length}/${payments.length} 期`,
            status: 'progress',
            color: 'orange'
        },
        changeOrders.length > 0 && {
            type: '變更單',
            label: `${changeOrders.length} 筆`,
            amount: changeOrders.reduce((sum, co) => sum + (co.amount || 0), 0),
            color: 'purple'
        },
    ].filter(Boolean);

    if (size === 'S') {
        return (
            <div className="h-full flex flex-col justify-between">
                <Link2 size={24} className="text-gray-500" />
                <div>
                    <div className="text-xl font-bold text-gray-800">{links.length}</div>
                    <div className="text-xs text-gray-500">關聯文件</div>
                </div>
            </div>
        );
    }

    const colorMap = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    return (
        <div className="space-y-2">
            {links.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                    尚無關聯文件
                </div>
            ) : (
                links.map((link, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg border ${colorMap[link.color]} cursor-pointer hover:shadow-sm transition-shadow`}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-xs opacity-70">{link.type}</div>
                                <div className="font-medium">{link.label}</div>
                            </div>
                            {link.status && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                                    {link.status}
                                </span>
                            )}
                            {link.amount !== undefined && (
                                <span className={`text-sm font-bold ${link.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {link.amount >= 0 ? '+' : ''}{link.amount.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

