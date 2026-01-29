/**
 * ConstructionWidgets.jsx
 *
 * Extracted reusable widgets from Construction.jsx for better maintainability
 * Contains: StatusBadge, TaskStatusBadge, StatCard, ProgressBar,
 *           MilestoneTimeline, TaskList, GanttChart, DailyReportList
 */

import React, { useMemo } from 'react';
import { Check, Flag, Calendar, Users, Clock, AlertCircle, ClipboardList } from 'lucide-react';
import {
  CONSTRUCTION_STATUS_LABELS,
  CONSTRUCTION_STATUS_COLORS,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from '../../services/ConstructionService';

// ============================================
// Format utilities
// ============================================
export const formatCurrency = amount => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = dateString => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-TW');
};

export const getDaysUntil = dateString => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

// ============================================
// StatusBadge - Construction status badge
// ============================================
export const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs font-medium ${CONSTRUCTION_STATUS_COLORS[status]}`}
  >
    {CONSTRUCTION_STATUS_LABELS[status]}
  </span>
);

// ============================================
// TaskStatusBadge - Task status badge
// ============================================
export const TaskStatusBadge = ({ status }) => {
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
// StatCard - Statistics display card
// ============================================
export const StatCard = ({ icon: Icon, label, value, color = 'gray', subValue }) => (
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
// ProgressBar - Progress bar with color coding
// ============================================
export const ProgressBar = ({ percent, size = 'md', showLabel = true }) => {
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
// MilestoneTimeline - Project milestone timeline
// ============================================
export const MilestoneTimeline = ({ milestones, onComplete }) => {
  return (
    <div className="space-y-3">
      {milestones.map((milestone, index) => {
        const daysUntil = getDaysUntil(milestone.dueDate);
        const isOverdue = !milestone.completed && daysUntil < 0;
        const isUpcoming = !milestone.completed && daysUntil >= 0 && daysUntil <= 7;

        return (
          <div key={milestone.id} className="flex gap-3">
            {/* Timeline connector */}
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
                  className={`w-0.5 flex-1 min-h-[24px] ${
                    milestone.completed ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4
                    className={`font-medium ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}
                  >
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
                      <span className="text-orange-600">剩餘 {daysUntil} 天</span>
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
// TaskList - Task list with status management
// ============================================
export const TaskList = ({ tasks, onStatusChange }) => {
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
            {/* Checkbox */}
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
              aria-label={`${task.status === TASK_STATUS.COMPLETED ? '取消完成' : '標記完成'} ${task.name}`}
            >
              {task.status === TASK_STATUS.COMPLETED && <Check size={12} />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-medium ${
                    task.status === TASK_STATUS.COMPLETED
                      ? 'text-gray-400 line-through'
                      : 'text-gray-800'
                  }`}
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
// GanttChart - Project Gantt chart
// ============================================
export const GanttChart = ({ tasks, startDate, endDate }) => {
  const totalDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  const getPosition = date => {
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

  // Generate week markers
  const weeks = useMemo(() => {
    const result = [];
    const startDateObj = new Date(startDate);
    let current = new Date(startDateObj);
    let weekNum = 1;

    const endDateObj = new Date(endDate);
    const totalDaysCalc = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));

    const getPosInner = date => {
      const target = new Date(date);
      const days = Math.ceil((target - startDateObj) / (1000 * 60 * 60 * 24));
      return (days / totalDaysCalc) * 100;
    };

    while (current <= endDateObj) {
      result.push({
        label: `W${weekNum}`,
        position: getPosInner(current.toISOString().split('T')[0]),
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
    [TASK_STATUS.BLOCKED]: 'bg-red-400',
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Timeline header */}
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

        {/* Task rows */}
        {tasks.map(task => (
          <div key={task.id} className="flex items-center py-1.5 border-b border-gray-50">
            <div className="w-32 shrink-0 text-xs text-gray-700 truncate pr-2">{task.name}</div>
            <div className="flex-1 relative h-6 bg-gray-50 rounded">
              {/* Week separators */}
              {weeks.map((week, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-gray-100"
                  style={{ left: `${week.position}%` }}
                />
              ))}
              {/* Task bar */}
              <div
                className={`absolute top-1 h-4 rounded ${taskColors[task.status]} transition-all`}
                style={{
                  left: `${getPosition(task.startDate)}%`,
                  width: `${getWidth(task.startDate, task.endDate)}%`,
                }}
                title={`${task.name}: ${formatDate(task.startDate)} ~ ${formatDate(task.endDate)}`}
              >
                {/* Progress overlay */}
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
// DailyReportList - Daily construction reports
// ============================================
export const DailyReportList = ({ reports }) => {
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
              <span className="text-sm text-gray-500">
                {report.weather} {report.temperature}
              </span>
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
