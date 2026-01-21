import React, { useState, useEffect, useCallback } from 'react';
import { siteLogsApi, projectsApi } from '../services/api';
import {
    Plus, Search, Calendar, Cloud, Sun, CloudRain, Thermometer,
    Users, HardHat, AlertTriangle, CheckCircle, Clock, X, Loader2,
    AlertCircle, Send, FileText, MoreHorizontal, Image
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

const SITE_LOG_STATUS = [
    { id: 'DRAFT', label: '草稿', color: 'gray' },
    { id: 'SUBMITTED', label: '已提交', color: 'blue' },
    { id: 'APPROVED', label: '已核准', color: 'green' },
    { id: 'REJECTED', label: '已退回', color: 'red' },
];

const WEATHER_OPTIONS = [
    { id: 'SUNNY', label: '晴天', icon: Sun },
    { id: 'CLOUDY', label: '多雲', icon: Cloud },
    { id: 'RAINY', label: '雨天', icon: CloudRain },
];

const SiteLogsPage = ({ addToast }) => {
    const [siteLogs, setSiteLogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterProject, setFilterProject] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [logsRes, projectsRes] = await Promise.all([
                siteLogsApi.getAll(),
                projectsApi.getAll(),
            ]);
            setSiteLogs(logsRes.items || logsRes.data || (Array.isArray(logsRes) ? logsRes : []));
            setProjects(projectsRes.items || projectsRes.data || (Array.isArray(projectsRes) ? projectsRes : []));
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch site logs:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async (formData) => {
        try {
            await siteLogsApi.create(formData);
            addToast?.('工地日誌已建立', 'success');
            setShowAddModal(false);
            fetchData();
        } catch (err) {
            addToast?.(err.message, 'error');
        }
    };

    const handleSubmit = async (logId) => {
        try {
            await siteLogsApi.submit(logId);
            addToast?.('已提交審核', 'success');
            fetchData();
        } catch (err) {
            addToast?.(err.message, 'error');
        }
    };

    const handleApprove = async (logId) => {
        try {
            await siteLogsApi.approve(logId);
            addToast?.('已核准', 'success');
            fetchData();
        } catch (err) {
            addToast?.(err.message, 'error');
        }
    };

    const filteredLogs = siteLogs.filter((log) => {
        const matchesSearch =
            !search ||
            log.workContent?.toLowerCase().includes(search.toLowerCase()) ||
            log.notes?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
        const matchesProject = filterProject === 'all' || log.projectId === filterProject;
        return matchesSearch && matchesStatus && matchesProject;
    });

    const getProjectName = (projectId) => {
        return projects.find((p) => p.id === projectId)?.name || projectId;
    };

    const statusStats = SITE_LOG_STATUS.map((status) => ({
        ...status,
        count: siteLogs.filter((log) => log.status === status.id).length,
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="text-sm">{error}</p>
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
                    <h2 className="text-xl font-bold text-gray-800">工地日誌</h2>
                    <p className="text-sm text-gray-500 mt-1">記錄每日施工進度與現場狀況</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} /> 新增日誌
                </button>
            </div>

            {/* Status Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statusStats.map((status) => (
                    <Card
                        key={status.id}
                        className={`cursor-pointer transition-all ${filterStatus === status.id ? 'ring-2 ring-gray-800' : ''
                            }`}
                        onClick={() => setFilterStatus(filterStatus === status.id ? 'all' : status.id)}
                    >
                        <div className="flex justify-between items-center">
                            <Badge color={status.color}>{status.label}</Badge>
                            <span className="text-2xl font-bold text-gray-800">{status.count}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜尋工作內容..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>
                <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                    <option value="all">所有專案</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Site Logs List */}
            {filteredLogs.length === 0 ? (
                <Card className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">尚無工地日誌</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                        新增第一筆日誌
                    </button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredLogs.map((log) => (
                        <SiteLogCard
                            key={log.id}
                            log={log}
                            projectName={getProjectName(log.projectId)}
                            onSubmit={handleSubmit}
                            onApprove={handleApprove}
                            onClick={() => setSelectedLog(log)}
                        />
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <SiteLogModal
                    projects={projects}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleCreate}
                />
            )}

            {/* Detail Modal */}
            {selectedLog && (
                <SiteLogDetailModal
                    log={selectedLog}
                    projectName={getProjectName(selectedLog.projectId)}
                    onClose={() => setSelectedLog(null)}
                    onSubmit={handleSubmit}
                    onApprove={handleApprove}
                />
            )}
        </div>
    );
};

const SiteLogCard = ({ log, projectName, onSubmit, onApprove, onClick }) => {
    const status = SITE_LOG_STATUS.find((s) => s.id === log.status) || SITE_LOG_STATUS[0];
    const weather = WEATHER_OPTIONS.find((w) => w.id === log.weather);
    const WeatherIcon = weather?.icon || Cloud;

    return (
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge color={status.color}>{status.label}</Badge>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(log.logDate).toLocaleDateString('zh-TW')}
                        </span>
                        {weather && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <WeatherIcon size={14} />
                                {weather.label}
                            </span>
                        )}
                    </div>

                    <h3 className="font-bold text-gray-900">{projectName}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{log.workContent}</p>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        {log.workersCount > 0 && (
                            <span className="flex items-center gap-1">
                                <Users size={14} />
                                {log.workersCount} 人
                            </span>
                        )}
                        {log.temperature && (
                            <span className="flex items-center gap-1">
                                <Thermometer size={14} />
                                {log.temperature}°C
                            </span>
                        )}
                        {log.images?.length > 0 && (
                            <span className="flex items-center gap-1">
                                <Image size={14} />
                                {log.images.length} 張照片
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {log.status === 'DRAFT' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSubmit(log.id);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1"
                        >
                            <Send size={14} /> 提交審核
                        </button>
                    )}
                    {log.status === 'SUBMITTED' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onApprove(log.id);
                            }}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-1"
                        >
                            <CheckCircle size={14} /> 核准
                        </button>
                    )}
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>
        </Card>
    );
};

const SiteLogModal = ({ projects, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        projectId: '',
        logDate: new Date().toISOString().split('T')[0],
        weather: 'SUNNY',
        temperature: '',
        workersCount: '',
        workContent: '',
        materials: '',
        issues: '',
        notes: '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSubmit({
                ...formData,
                temperature: formData.temperature ? Number(formData.temperature) : undefined,
                workersCount: formData.workersCount ? Number(formData.workersCount) : undefined,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold">新增工地日誌</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">專案 *</label>
                            <select
                                required
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="">選擇專案</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
                            <input
                                type="date"
                                required
                                value={formData.logDate}
                                onChange={(e) => setFormData({ ...formData, logDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">天氣</label>
                            <select
                                value={formData.weather}
                                onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                {WEATHER_OPTIONS.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">溫度 (°C)</label>
                            <input
                                type="number"
                                value={formData.temperature}
                                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">出工人數</label>
                            <input
                                type="number"
                                value={formData.workersCount}
                                onChange={(e) => setFormData({ ...formData, workersCount: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">施工內容 *</label>
                        <textarea
                            required
                            value={formData.workContent}
                            onChange={(e) => setFormData({ ...formData, workContent: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            placeholder="今日施工項目與進度..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">材料進場</label>
                        <textarea
                            value={formData.materials}
                            onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            placeholder="今日進場材料..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">問題與待辦</label>
                        <textarea
                            value={formData.issues}
                            onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            placeholder="遇到的問題或待解決事項..."
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

const SiteLogDetailModal = ({ log, projectName, onClose, onSubmit, onApprove }) => {
    const status = SITE_LOG_STATUS.find((s) => s.id === log.status) || SITE_LOG_STATUS[0];
    const weather = WEATHER_OPTIONS.find((w) => w.id === log.weather);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold">{projectName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge color={status.color}>{status.label}</Badge>
                            <span className="text-sm text-gray-500">
                                {new Date(log.logDate).toLocaleDateString('zh-TW')}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase">天氣</p>
                            <p className="font-medium">{weather?.label || log.weather}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase">溫度</p>
                            <p className="font-medium">{log.temperature ? `${log.temperature}°C` : '-'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase">出工人數</p>
                            <p className="font-medium">{log.workersCount || '-'} 人</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider">施工內容</label>
                        <p className="mt-1 text-gray-700 whitespace-pre-wrap">{log.workContent}</p>
                    </div>

                    {log.materials && (
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider">材料進場</label>
                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{log.materials}</p>
                        </div>
                    )}

                    {log.issues && (
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider">問題與待辦</label>
                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{log.issues}</p>
                        </div>
                    )}

                    {log.notes && (
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider">備註</label>
                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{log.notes}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        {log.status === 'DRAFT' && (
                            <button
                                onClick={() => onSubmit(log.id)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                提交審核
                            </button>
                        )}
                        {log.status === 'SUBMITTED' && (
                            <button
                                onClick={() => onApprove(log.id)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                            >
                                核准
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SiteLogsPage;
