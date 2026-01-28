import React, { useState } from 'react';
import {
  Building2,
  Box,
  Layers,
  GitBranch,
  Upload,
  Download,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Ruler,
  Boxes,
  ExternalLink,
  HardDrive,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';

// Google Drive 公司根資料夾
const DRIVE_ROOT_URL = 'https://drive.google.com/drive/folders/1psz5gGuYxwSm7Ui3KHgknnVaI3GJqq4s';

// Mock data for BIM models
const MOCK_BIM_MODELS = [
  {
    id: 'bim-001',
    name: '信義區住宅案 - 建築模型',
    projectId: 'p-1',
    projectName: '信義區林公館',
    discipline: 'ARCH',
    status: 'ACTIVE',
    currentVersion: 3,
    elementCount: 2847,
    lastUpdated: '2026-01-15',
    createdBy: 'Alex Chen',
  },
  {
    id: 'bim-002',
    name: '信義區住宅案 - 結構模型',
    projectId: 'p-1',
    projectName: '信義區林公館',
    discipline: 'STRUCT',
    status: 'ACTIVE',
    currentVersion: 2,
    elementCount: 1523,
    lastUpdated: '2026-01-14',
    createdBy: 'Alex Chen',
  },
  {
    id: 'bim-003',
    name: '南港辦公室 - MEP模型',
    projectId: 'p-2',
    projectName: '南港軟體園區辦公室',
    discipline: 'MEP',
    status: 'IN_REVIEW',
    currentVersion: 1,
    elementCount: 3201,
    lastUpdated: '2026-01-10',
    createdBy: 'Lisa Wang',
  },
];

const MOCK_BCF_ISSUES = [
  {
    id: 'bcf-001',
    title: '主臥天花板高度不足',
    modelId: 'bim-001',
    status: 'OPEN',
    priority: 'HIGH',
    assignee: 'Alex Chen',
    createdAt: '2026-01-12',
    comments: 3,
  },
  {
    id: 'bcf-002',
    title: '管線與結構衝突',
    modelId: 'bim-003',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    assignee: 'Lisa Wang',
    createdAt: '2026-01-14',
    comments: 7,
  },
  {
    id: 'bcf-003',
    title: '窗戶尺寸需確認',
    modelId: 'bim-001',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    assignee: 'Alex Chen',
    createdAt: '2026-01-08',
    comments: 2,
  },
];

const DISCIPLINE_LABELS = {
  ARCH: { label: '建築', color: 'blue' },
  STRUCT: { label: '結構', color: 'purple' },
  MEP: { label: '機電', color: 'orange' },
  CIVIL: { label: '土木', color: 'green' },
  LANDSCAPE: { label: '景觀', color: 'emerald' },
};

const STATUS_COLORS = {
  ACTIVE: 'emerald',
  IN_REVIEW: 'yellow',
  ARCHIVED: 'gray',
};

const ISSUE_STATUS = {
  OPEN: { label: '待處理', color: 'red' },
  IN_PROGRESS: { label: '處理中', color: 'yellow' },
  RESOLVED: { label: '已解決', color: 'emerald' },
  CLOSED: { label: '已關閉', color: 'gray' },
};

const PRIORITY_COLORS = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'yellow',
  LOW: 'gray',
};

const BimManagement = () => {
  const [activeTab, setActiveTab] = useState('models');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');

  const filteredModels = MOCK_BIM_MODELS.filter(model => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscipline =
      selectedDiscipline === 'all' || model.discipline === selectedDiscipline;
    return matchesSearch && matchesDiscipline;
  });

  const filteredIssues = MOCK_BCF_ISSUES.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">BIM 管理</h2>
          <p className="text-gray-500 text-sm mt-1">模型管理、版本控制、BCF 議題追蹤</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(DRIVE_ROOT_URL, '_blank')}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <HardDrive size={16} /> 模型資料夾
          </button>
          <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Upload size={16} /> 上傳模型
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Building2 size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{MOCK_BIM_MODELS.length}</p>
            <p className="text-sm text-gray-500">BIM 模型</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <Boxes size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {MOCK_BIM_MODELS.reduce((acc, m) => acc + m.elementCount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">總構件數</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-xl">
            <AlertCircle size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {MOCK_BCF_ISSUES.filter(i => i.status === 'OPEN').length}
            </p>
            <p className="text-sm text-gray-500">待處理議題</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {MOCK_BCF_ISSUES.filter(i => i.status === 'RESOLVED').length}
            </p>
            <p className="text-sm text-gray-500">已解決議題</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'models'
              ? 'border-gray-800 text-gray-800'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 size={16} className="inline mr-2" />
          模型列表
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'issues'
              ? 'border-gray-800 text-gray-800'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertCircle size={16} className="inline mr-2" />
          BCF 議題
        </button>
        <button
          onClick={() => setActiveTab('quantities')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'quantities'
              ? 'border-gray-800 text-gray-800'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Ruler size={16} className="inline mr-2" />
          算量分析
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋模型或議題..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
        {activeTab === 'models' && (
          <select
            value={selectedDiscipline}
            onChange={e => setSelectedDiscipline(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="all">全部專業</option>
            <option value="ARCH">建築</option>
            <option value="STRUCT">結構</option>
            <option value="MEP">機電</option>
            <option value="CIVIL">土木</option>
          </select>
        )}
      </div>

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map(model => (
            <Card key={model.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <Badge color={DISCIPLINE_LABELS[model.discipline]?.color}>
                  {DISCIPLINE_LABELS[model.discipline]?.label}
                </Badge>
                <Badge color={STATUS_COLORS[model.status]}>
                  {model.status === 'ACTIVE'
                    ? '使用中'
                    : model.status === 'IN_REVIEW'
                      ? '審核中'
                      : '已封存'}
                </Badge>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">{model.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{model.projectName}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">版本</span>
                  <span className="font-medium flex items-center gap-1">
                    <GitBranch size={14} /> v{model.currentVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">構件數</span>
                  <span className="font-medium">{model.elementCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">最後更新</span>
                  <span className="font-medium">{model.lastUpdated}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <button className="flex-1 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Eye size={14} /> 檢視
                </button>
                <button className="flex-1 py-2 text-sm bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Download size={14} /> 下載
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500">議題</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">狀態</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">優先級</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">負責人</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">建立日期</th>
                <th className="px-6 py-4 text-right font-medium text-gray-500">留言</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{issue.title}</div>
                    <div className="text-xs text-gray-400">{issue.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={ISSUE_STATUS[issue.status]?.color}>
                      {ISSUE_STATUS[issue.status]?.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={PRIORITY_COLORS[issue.priority]}>{issue.priority}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{issue.assignee}</td>
                  <td className="px-6 py-4 text-gray-600">{issue.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <FileText size={14} /> {issue.comments}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Quantities Tab */}
      {activeTab === 'quantities' && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Ruler size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">算量分析</h3>
          <p className="text-gray-500 mb-4">選擇模型進行工程數量統計與分析</p>
          <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm">選擇模型</button>
        </div>
      )}
    </div>
  );
};

export default BimManagement;
