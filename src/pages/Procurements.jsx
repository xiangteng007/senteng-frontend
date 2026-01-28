import React, { useState, useEffect, useCallback } from 'react';
import { procurementsApi, projectsApi, vendorsApi } from '../services/api';
import {
  Plus,
  Search,
  FileText,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  X,
  Loader2,
  AlertCircle,
  Send,
  Award,
  ChevronDown,
  MoreHorizontal,
  Building2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

const PROCUREMENT_STATUS = [
  { id: 'DRAFT', label: '草稿', color: 'gray' },
  { id: 'RFQ_SENT', label: '已發RFQ', color: 'blue' },
  { id: 'BIDDING', label: '投標中', color: 'orange' },
  { id: 'EVALUATING', label: '評估中', color: 'purple' },
  { id: 'AWARDED', label: '已決標', color: 'green' },
  { id: 'CANCELLED', label: '已取消', color: 'red' },
];

const ProcurementsPage = ({ addToast }) => {
  const [procurements, setProcurements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [procurementsRes, projectsRes, vendorsRes] = await Promise.all([
        procurementsApi.getAll(),
        projectsApi.getAll(),
        vendorsApi.getAll(),
      ]);
      setProcurements(
        procurementsRes.items ||
          procurementsRes.data ||
          (Array.isArray(procurementsRes) ? procurementsRes : [])
      );
      setProjects(
        projectsRes.items || projectsRes.data || (Array.isArray(projectsRes) ? projectsRes : [])
      );
      setVendors(
        vendorsRes.items || vendorsRes.data || (Array.isArray(vendorsRes) ? vendorsRes : [])
      );
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch procurements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async formData => {
    try {
      await procurementsApi.create(formData);
      addToast?.('採購請求已建立', 'success');
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      addToast?.(err.message, 'error');
    }
  };

  const handleSendRfq = async (procurementId, vendorIds) => {
    try {
      await procurementsApi.sendRfq(procurementId, vendorIds);
      addToast?.('RFQ 已發送', 'success');
      fetchData();
    } catch (err) {
      addToast?.(err.message, 'error');
    }
  };

  const filteredProcurements = procurements.filter(p => {
    const matchesSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusStats = PROCUREMENT_STATUS.map(status => ({
    ...status,
    count: procurements.filter(p => p.status === status.id).length,
  }));

  const getProjectName = projectId => {
    return projects.find(p => p.id === projectId)?.name || projectId;
  };

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
          <h2 className="text-xl font-bold text-gray-800">採購管理</h2>
          <p className="text-sm text-gray-500 mt-1">RFQ、比價、決標流程管理</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={16} /> 新增採購請求
        </button>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {statusStats.map(status => (
          <Card
            key={status.id}
            className={`cursor-pointer transition-all p-3 ${
              filterStatus === status.id ? 'ring-2 ring-gray-800' : ''
            }`}
            onClick={() => setFilterStatus(filterStatus === status.id ? 'all' : status.id)}
          >
            <div className="text-center">
              <Badge color={status.color} className="text-xs">
                {status.label}
              </Badge>
              <p className="text-xl font-bold text-gray-800 mt-1">{status.count}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜尋採購標題..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* Procurements List */}
      {filteredProcurements.length === 0 ? (
        <Card className="text-center py-12">
          <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">尚無採購請求</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            新增第一筆採購
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProcurements.map(procurement => (
            <ProcurementCard
              key={procurement.id}
              procurement={procurement}
              projectName={getProjectName(procurement.projectId)}
              onSendRfq={handleSendRfq}
              onClick={() => setSelectedProcurement(procurement)}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <ProcurementModal
          projects={projects}
          vendors={vendors}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
};

const ProcurementCard = ({ procurement, projectName, onSendRfq, onClick }) => {
  const status = PROCUREMENT_STATUS.find(s => s.id === procurement.status) || PROCUREMENT_STATUS[0];

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge color={status.color}>{status.label}</Badge>
            <span className="text-xs text-gray-400">{procurement.id}</span>
          </div>
          <h3 className="font-bold text-gray-900 text-lg">{procurement.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{procurement.description}</p>

          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Building2 size={14} />
              {projectName}
            </div>
            {procurement.estimatedBudget && (
              <div className="text-gray-600 font-medium">
                預算: NT$ {Number(procurement.estimatedBudget).toLocaleString()}
              </div>
            )}
            {procurement.deadline && (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock size={14} />
                {new Date(procurement.deadline).toLocaleDateString('zh-TW')}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {procurement.status === 'DRAFT' && (
            <button
              onClick={e => {
                e.stopPropagation();
                // Show vendor selection for RFQ
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1"
            >
              <Send size={14} /> 發送 RFQ
            </button>
          )}
          <button onClick={e => e.stopPropagation()} className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </Card>
  );
};

const ProcurementModal = ({ projects, vendors, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    category: '',
    estimatedBudget: '',
    deadline: '',
    requirements: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">新增採購請求</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="例如：辦公室裝修 - 水電工程"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">關聯專案 *</label>
            <select
              required
              value={formData.projectId}
              onChange={e => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="">選擇專案</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">採購類別</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="">選擇類別</option>
                <option value="CONSTRUCTION">施工工程</option>
                <option value="MATERIALS">建材採購</option>
                <option value="EQUIPMENT">設備採購</option>
                <option value="SERVICES">專業服務</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">預估預算</label>
              <input
                type="number"
                value={formData.estimatedBudget}
                onChange={e => setFormData({ ...formData, estimatedBudget: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="NT$"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">說明</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="採購需求說明..."
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
              {saving ? '儲存中...' : '建立'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcurementsPage;
