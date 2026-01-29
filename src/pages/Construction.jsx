/**
 * 工程管理頁面 (Construction.jsx)
 * 工程進度追蹤、里程碑管理、任務分派
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  BarChart3,
  ListChecks,
  FileText,
  ChevronLeft,
  Target,
  Flag,
  Play,
  Pause,
  Check,
  AlertCircle,
  Wrench,
  HardHat,
  ClipboardList,
} from 'lucide-react';
import { SectionTitle } from '../components/common/Indicators';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import ConstructionService, {
  CONSTRUCTION_STATUS,
  CONSTRUCTION_STATUS_LABELS,
  CONSTRUCTION_STATUS_COLORS,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from '../services/ConstructionService';
// Import extracted widget components
import {
  formatCurrency,
  formatDate,
  getDaysUntil,
  StatusBadge,
  TaskStatusBadge,
  StatCard,
  ProgressBar,
  MilestoneTimeline,
  TaskList,
  GanttChart,
  DailyReportList,
} from '../components/widgets/ConstructionWidgets';

// ============================================
// 工程詳情
// ============================================
const ConstructionDetail = ({ construction, onBack, onRefresh, addToast }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleCompleteMilestone = async milestoneId => {
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
  const budgetUsed = (construction.actualCost / construction.budget) * 100;

  const tabs = [
    { id: 'overview', label: '概覽', icon: BarChart3 },
    { id: 'milestones', label: '里程碑', icon: Flag },
    { id: 'tasks', label: '任務', icon: ListChecks },
    { id: 'gantt', label: '甘特圖', icon: BarChart3 },
    { id: 'reports', label: '日誌', icon: FileText },
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
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
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
          <TaskList tasks={construction.tasks} onStatusChange={handleTaskStatusChange} />
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newConstruction, setNewConstruction] = useState({
    projectName: '',
    clientName: '',
    manager: '',
    location: '',
    startDate: '',
    endDate: '',
    budget: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [data, statsData] = await Promise.all([
          ConstructionService.getConstructions(),
          ConstructionService.getStats(),
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
        <SectionTitle icon={Building2} title="工程管理" subtitle="追蹤施工進度與里程碑" />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 flex items-center gap-2"
        >
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
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜尋專案、客戶、負責人..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white"
        >
          <option value="ALL">全部狀態</option>
          {Object.entries(CONSTRUCTION_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
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
                      里程碑: {construction.milestones.filter(m => m.completed).length}/
                      {construction.milestones.length}
                    </div>
                    <div className="text-sm text-gray-500">
                      任務:{' '}
                      {construction.tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length}/
                      {construction.tasks.length}
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* 新增工程 Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="新增工程"
        onConfirm={async () => {
          if (!newConstruction.projectName) {
            addToast?.('請輸入工程名稱', 'error');
            return;
          }
          setIsSaving(true);
          try {
            const created = await ConstructionService.createConstruction({
              ...newConstruction,
              budget: parseFloat(newConstruction.budget) || 0,
              status: CONSTRUCTION_STATUS.PLANNING,
              progress: 0,
              milestones: [],
              tasks: [],
              dailyReports: [],
            });
            setConstructions(prev => [...prev, created]);
            setIsAddModalOpen(false);
            setNewConstruction({
              projectName: '',
              clientName: '',
              manager: '',
              location: '',
              startDate: '',
              endDate: '',
              budget: '',
            });
            addToast?.('工程已建立', 'success');
          } catch (err) {
            addToast?.('建立失敗: ' + err.message, 'error');
          } finally {
            setIsSaving(false);
          }
        }}
        confirmDisabled={isSaving}
        confirmText={isSaving ? '處理中...' : '確認'}
      >
        <div className="space-y-4">
          <InputField
            label="工程名稱"
            value={newConstruction.projectName}
            onChange={e => setNewConstruction({ ...newConstruction, projectName: e.target.value })}
            placeholder="例：信義區住宅翻修工程"
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="客戶名稱"
              value={newConstruction.clientName}
              onChange={e => setNewConstruction({ ...newConstruction, clientName: e.target.value })}
            />
            <InputField
              label="負責人"
              value={newConstruction.manager}
              onChange={e => setNewConstruction({ ...newConstruction, manager: e.target.value })}
            />
          </div>
          <InputField
            label="工程地點"
            value={newConstruction.location}
            onChange={e => setNewConstruction({ ...newConstruction, location: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="開工日期"
              type="date"
              value={newConstruction.startDate}
              onChange={e => setNewConstruction({ ...newConstruction, startDate: e.target.value })}
            />
            <InputField
              label="預計完工"
              type="date"
              value={newConstruction.endDate}
              onChange={e => setNewConstruction({ ...newConstruction, endDate: e.target.value })}
            />
          </div>
          <InputField
            label="預算"
            type="number"
            value={newConstruction.budget}
            onChange={e => setNewConstruction({ ...newConstruction, budget: e.target.value })}
            placeholder="例：5000000"
          />
        </div>
      </Modal>
    </div>
  );
};

// ============================================
// 主組件
// ============================================
const Construction = ({ addToast }) => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedConstruction, setSelectedConstruction] = useState(null);

  const handleView = construction => {
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

  return <ConstructionList onView={handleView} addToast={addToast} />;
};

export default Construction;
