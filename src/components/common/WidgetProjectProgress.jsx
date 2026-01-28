/**
 * WidgetProjectProgress.jsx
 * 專案進度追蹤組件 - 整合工程節點、任務、甘特圖
 */

import React, { useState, useMemo } from 'react';
import {
  Flag,
  ListChecks,
  BarChart3,
  FileText,
  Plus,
  Check,
  Calendar,
  Users,
  AlertCircle,
  ChevronRight,
  Clock,
  Target,
} from 'lucide-react';
import { Modal } from './Modal';
import { InputField } from './InputField';

// ============================================
// 格式化函數
// ============================================
const formatDate = dateString => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-TW');
};

const getDaysUntil = dateString => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

// ============================================
// 任務狀態
// ============================================
const TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
};

const TASK_STATUS_LABELS = {
  PENDING: '待處理',
  IN_PROGRESS: '進行中',
  COMPLETED: '已完成',
  BLOCKED: '已阻擋',
};

const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

const TASK_PRIORITY_LABELS = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '緊急',
};

const TASK_PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600',
};

// ============================================
// 進度條
// ============================================
const ProgressBar = ({ percent, size = 'md', showLabel = true }) => {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const color =
    percent >= 80
      ? 'bg-green-500'
      : percent >= 50
        ? 'bg-blue-500'
        : percent >= 25
          ? 'bg-orange-500'
          : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-100 rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`${color} ${heights[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-600 w-12 text-right">{percent}%</span>
      )}
    </div>
  );
};

// ============================================
// 任務狀態徽章
// ============================================
const TaskStatusBadge = ({ status }) => {
  const colors = {
    [TASK_STATUS.PENDING]: 'bg-gray-100 text-gray-600',
    [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-600',
    [TASK_STATUS.COMPLETED]: 'bg-green-100 text-green-600',
    [TASK_STATUS.BLOCKED]: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
      {TASK_STATUS_LABELS[status]}
    </span>
  );
};

// ============================================
// 工程節點時間軸
// ============================================
const NODE_TYPES = {
  DESIGN: '設計階段',
  CONSTRUCTION: '施工階段',
  INSPECTION: '驗收階段',
};

const NODE_STATUS = {
  PENDING: '未開始',
  IN_PROGRESS: '進行中',
  COMPLETED: '已完成',
  DELAYED: '已延遲',
};

const NODE_STATUS_COLORS = {
  PENDING: 'bg-gray-200 text-gray-500',
  IN_PROGRESS: 'bg-blue-500 text-white',
  COMPLETED: 'bg-green-500 text-white',
  DELAYED: 'bg-red-500 text-white',
};

const MilestoneTimeline = ({ milestones = [], onComplete, onEdit }) => {
  if (milestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Flag size={32} className="mx-auto mb-2 opacity-50" />
        <p>尚無工程節點</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {milestones.map((milestone, index) => {
        const daysUntil = getDaysUntil(milestone.dueDate);
        const isOverdue = !milestone.completed && daysUntil < 0;
        const isUpcoming = !milestone.completed && daysUntil >= 0 && daysUntil <= 7;

        return (
          <div key={milestone.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.completed
                    ? 'bg-green-500 text-white'
                    : isOverdue
                      ? 'bg-red-500 text-white'
                      : isUpcoming
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                }`}
              >
                {milestone.completed ? <Check size={16} /> : <Flag size={14} />}
              </div>
              {index < milestones.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] ${milestone.completed ? 'bg-green-300' : 'bg-gray-200'}`}
                />
              )}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`font-medium ${milestone.completed || milestone.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-gray-800'}`}
                    >
                      {milestone.name}
                    </h4>
                    {milestone.nodeType && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                        {NODE_TYPES[milestone.nodeType] || milestone.nodeType}
                      </span>
                    )}
                    {milestone.status && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${NODE_STATUS_COLORS[milestone.status] || 'bg-gray-100'}`}
                      >
                        {NODE_STATUS[milestone.status] || milestone.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      預定: {formatDate(milestone.dueDate)}
                    </span>
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
                    {isUpcoming && !(milestone.completed || milestone.status === 'COMPLETED') && (
                      <span className="text-orange-600">剩餘 {daysUntil} 天</span>
                    )}
                  </div>
                  {/* 負責人和付款金額 */}
                  {(milestone.assignee || milestone.paymentAmount) && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      {milestone.assignee && (
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {milestone.assignee}
                        </span>
                      )}
                      {milestone.paymentAmount && (
                        <span className="text-green-600 font-medium">
                          💰 ${Number(milestone.paymentAmount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 備註 */}
                  {milestone.notes && (
                    <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                      {milestone.notes}
                    </div>
                  )}
                </div>
                {!(milestone.completed || milestone.status === 'COMPLETED') && onComplete && (
                  <button
                    onClick={() => onComplete(milestone.id)}
                    className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 shrink-0"
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
const TaskList = ({ tasks = [], onStatusChange }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ListChecks size={32} className="mx-auto mb-2 opacity-50" />
        <p>尚無任務</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div
          key={task.id}
          className={`p-3 rounded-lg border transition-colors ${
            task.status === TASK_STATUS.COMPLETED
              ? 'bg-gray-50 border-gray-100'
              : task.status === TASK_STATUS.BLOCKED
                ? 'bg-red-50 border-red-100'
                : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() =>
                onStatusChange?.(
                  task.id,
                  task.status === TASK_STATUS.COMPLETED
                    ? TASK_STATUS.PENDING
                    : TASK_STATUS.COMPLETED
                )
              }
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                task.status === TASK_STATUS.COMPLETED
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {task.status === TASK_STATUS.COMPLETED && <Check size={12} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-medium ${task.status === TASK_STATUS.COMPLETED ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                >
                  {task.name}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-xs ${TASK_PRIORITY_COLORS[task.priority]}`}
                >
                  {TASK_PRIORITY_LABELS[task.priority]}
                </span>
                <TaskStatusBadge status={task.status} />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                {task.assignee && (
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {task.assignee}
                  </span>
                )}
                {(task.startDate || task.endDate) && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(task.startDate)} ~ {formatDate(task.endDate)}
                  </span>
                )}
              </div>
              {task.status === TASK_STATUS.BLOCKED && task.blockedReason && (
                <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {task.blockedReason}
                </div>
              )}
              {task.status !== TASK_STATUS.COMPLETED && task.progress !== undefined && (
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
// 簡易甘特圖
// ============================================
const SimpleGanttChart = ({ tasks = [], startDate, endDate }) => {
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 30;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1);
  }, [startDate, endDate]);

  const getPosition = date => {
    if (!startDate || !date) return 0;
    const start = new Date(startDate);
    const target = new Date(date);
    const days = Math.ceil((target - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(100, (days / totalDays) * 100));
  };

  const getWidth = (start, end) => {
    const startPos = getPosition(start);
    const endPos = getPosition(end);
    return Math.max(endPos - startPos, 3);
  };

  const taskColors = {
    [TASK_STATUS.COMPLETED]: 'bg-green-400',
    [TASK_STATUS.IN_PROGRESS]: 'bg-blue-400',
    [TASK_STATUS.PENDING]: 'bg-gray-300',
    [TASK_STATUS.BLOCKED]: 'bg-red-400',
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
        <p>新增任務後顯示甘特圖</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center py-1.5 border-b border-gray-50">
            <div className="w-28 shrink-0 text-xs text-gray-700 truncate pr-2">{task.name}</div>
            <div className="flex-1 relative h-6 bg-gray-50 rounded">
              <div
                className={`absolute top-1 h-4 rounded ${taskColors[task.status]} transition-all`}
                style={{
                  left: `${getPosition(task.startDate)}%`,
                  width: `${getWidth(task.startDate, task.endDate)}%`,
                }}
                title={`${task.name}: ${formatDate(task.startDate)} ~ ${formatDate(task.endDate)}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 主組件: WidgetProjectProgress
// ============================================
const WidgetProjectProgress = ({ project, onUpdateProject, size = 'L', addToast }) => {
  const [activeTab, setActiveTab] = useState('milestones');
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    dueDate: '',
    nodeType: 'CONSTRUCTION',
    status: 'PENDING',
    assignee: '',
    paymentAmount: '',
    notes: '',
  });
  const [newTask, setNewTask] = useState({
    name: '',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    assignee: '',
  });

  const milestones = project?.milestones || [];
  const tasks = project?.tasks || [];

  // 計算進度統計
  const completedMilestones = milestones.filter(m => m.completed).length;
  const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
  const overallProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const handleCompleteMilestone = milestoneId => {
    const updatedMilestones = milestones.map(m =>
      m.id === milestoneId
        ? { ...m, completed: true, completedDate: new Date().toISOString().split('T')[0] }
        : m
    );
    onUpdateProject?.({ ...project, milestones: updatedMilestones });
    addToast?.('工程節點已完成', 'success');
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: newStatus,
            progress: newStatus === TASK_STATUS.COMPLETED ? 100 : t.progress,
          }
        : t
    );
    onUpdateProject?.({ ...project, tasks: updatedTasks });
  };

  const handleAddMilestone = () => {
    if (!newMilestone.name || !newMilestone.dueDate) {
      addToast?.('請填寫名稱和預定日期', 'error');
      return;
    }
    const milestone = {
      id: `ms-${Date.now()}`,
      ...newMilestone,
      completed: false,
    };
    onUpdateProject?.({ ...project, milestones: [...milestones, milestone] });
    setNewMilestone({
      name: '',
      dueDate: '',
      nodeType: 'CONSTRUCTION',
      status: 'PENDING',
      assignee: '',
      paymentAmount: '',
      notes: '',
    });
    setIsAddMilestoneOpen(false);
    addToast?.('工程節點已新增', 'success');
  };

  const handleAddTask = () => {
    if (!newTask.name) {
      addToast?.('請填寫任務名稱', 'error');
      return;
    }
    const task = {
      id: `task-${Date.now()}`,
      ...newTask,
      status: TASK_STATUS.PENDING,
      progress: 0,
    };
    onUpdateProject?.({ ...project, tasks: [...tasks, task] });
    setNewTask({ name: '', priority: 'MEDIUM', startDate: '', endDate: '', assignee: '' });
    setIsAddTaskOpen(false);
    addToast?.('任務已新增', 'success');
  };

  const tabs = [
    { id: 'milestones', label: '工程節點', icon: Flag, count: milestones.length },
    { id: 'tasks', label: '任務', icon: ListChecks, count: tasks.length },
    { id: 'gantt', label: '甘特圖', icon: BarChart3 },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* 進度概覽 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">整體進度</p>
          <p className="text-xl font-bold text-gray-800">{overallProgress}%</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">工程節點</p>
          <p className="text-xl font-bold text-blue-600">
            {completedMilestones}/{milestones.length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">任務完成</p>
          <p className="text-xl font-bold text-green-600">
            {completedTasks}/{tasks.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-xs bg-gray-200 px-1.5 rounded">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'milestones' && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setIsAddMilestoneOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> 新增工程節點
              </button>
            </div>
            <MilestoneTimeline milestones={milestones} onComplete={handleCompleteMilestone} />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setIsAddTaskOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> 新增任務
              </button>
            </div>
            <TaskList tasks={tasks} onStatusChange={handleTaskStatusChange} />
          </div>
        )}

        {activeTab === 'gantt' && (
          <SimpleGanttChart
            tasks={tasks}
            startDate={project?.startDate}
            endDate={project?.endDate}
          />
        )}
      </div>

      {/* Add Engineering Node Modal */}
      <Modal
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
        title="新增工程節點"
        onConfirm={handleAddMilestone}
      >
        <div className="space-y-4">
          {/* 節點名稱 */}
          <InputField
            label="節點名稱"
            value={newMilestone.name}
            onChange={e => setNewMilestone({ ...newMilestone, name: e.target.value })}
            placeholder="例：二樓水電完成"
          />

          {/* 節點類型 + 預定日期 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">節點類型</label>
              <select
                value={newMilestone.nodeType}
                onChange={e => setNewMilestone({ ...newMilestone, nodeType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="DESIGN">📐 設計階段</option>
                <option value="CONSTRUCTION">🔧 施工階段</option>
                <option value="INSPECTION">✅ 驗收階段</option>
              </select>
            </div>
            <InputField
              label="預定完成日"
              type="date"
              value={newMilestone.dueDate}
              onChange={e => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
            />
          </div>

          {/* 狀態 + 負責人 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
              <select
                value={newMilestone.status}
                onChange={e => setNewMilestone({ ...newMilestone, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="PENDING">⏳ 未開始</option>
                <option value="IN_PROGRESS">🔄 進行中</option>
                <option value="COMPLETED">✅ 已完成</option>
                <option value="DELAYED">⚠️ 已延遲</option>
              </select>
            </div>
            <InputField
              label="負責人"
              value={newMilestone.assignee}
              onChange={e => setNewMilestone({ ...newMilestone, assignee: e.target.value })}
              placeholder="例：王工程師"
            />
          </div>

          {/* 關聯付款金額 */}
          <InputField
            label="關聯付款金額"
            type="number"
            value={newMilestone.paymentAmount}
            onChange={e => setNewMilestone({ ...newMilestone, paymentAmount: e.target.value })}
            placeholder="例：50000"
          />

          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <textarea
              value={newMilestone.notes}
              onChange={e => setNewMilestone({ ...newMilestone, notes: e.target.value })}
              placeholder="節點說明或注意事項..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title="新增任務"
        onConfirm={handleAddTask}
      >
        <InputField
          label="任務名稱"
          value={newTask.name}
          onChange={e => setNewTask({ ...newTask, name: e.target.value })}
          placeholder="例：水電配管"
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="優先級"
            type="select"
            value={newTask.priority}
            onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="LOW">低</option>
            <option value="MEDIUM">中</option>
            <option value="HIGH">高</option>
            <option value="URGENT">緊急</option>
          </InputField>
          <InputField
            label="負責人"
            value={newTask.assignee}
            onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
            placeholder="例：王師傅"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="開始日期"
            type="date"
            value={newTask.startDate}
            onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
          />
          <InputField
            label="結束日期"
            type="date"
            value={newTask.endDate}
            onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default WidgetProjectProgress;
