import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    MapPin,
    Calendar,
    Users,
    Clock,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    FolderOpen,
    Trash2
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { InputField, SearchableSelect } from '../components/common/InputField';
import { projectsApi } from '../services/api';

// --- Components ---

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <div className={`stat-card flex items-center gap-4 animate-fade-in-up ${delay}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} text-white shadow-lg`}>
            <Icon size={24} />
        </div>
        <div>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            <div className="text-sm text-gray-500 font-medium">{label}</div>
        </div>
    </div>
);

const ProjectCard = ({ project, onSelect, onDelete }) => {
    const statusColors = {
        '規劃中': 'bg-blue-50 text-blue-700 border-blue-200',
        '進行中': 'bg-amber-50 text-amber-700 border-amber-200',
        '已完工': 'bg-green-50 text-green-700 border-green-200',
        '暫停': 'bg-gray-100 text-gray-600 border-gray-200'
    };

    return (
        <div
            onClick={() => onSelect(project)}
            className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer animate-fade-in hover:-translate-y-1"
        >
            <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[project.status] || 'bg-gray-50 text-gray-600'}`}>
                    {project.status}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(project); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {project.name}
            </h3>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="truncate">{project.location || '無地點資訊'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={14} className="text-gray-400" />
                    <span className="truncate">{project.client || '無客戶資訊'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{project.startDate || '未定'} - {project.endDate || '未定'}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                            P{i}
                        </div>
                    ))}
                </div>
                <div className="text-sm font-bold text-gray-900">
                    {project.budget ? `$${parseInt(project.budget).toLocaleString()}` : "本"}
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const Projects = ({ data }) => {
    // State
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ total: 0, ongoing: 0, completed: 0, revenue: 0 });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        name: '',
        client: '',
        status: '規劃中',
        type: '住宅設計',
        startDate: '',
        endDate: '',
        location: '',
        budget: '',
        manager: 'Alex Chen',
        description: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('全部');

    // Mock Data init
    useEffect(() => {
        if (data?.projects) {
            setProjects(data.projects);
            calculateStats(data.projects);
        }
    }, [data]);

    const calculateStats = (projList) => {
        setStats({
            total: projList.length,
            ongoing: projList.filter(p => p.status === '進行中').length,
            completed: projList.filter(p => p.status === '已完工').length,
            revenue: projList.reduce((sum, p) => sum + (parseInt(p.budget) || 0), 0)
        });
    };

    const handleAddProject = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            const projectToAdd = {
                id: Date.now(),
                ...newProject,
                progress: 0
            };
            const updatedProjects = [projectToAdd, ...projects];
            setProjects(updatedProjects);
            calculateStats(updatedProjects);
            setIsAddModalOpen(false);
            setNewProject({
                name: '', client: '', status: '規劃中', type: '住宅設計',
                startDate: '', endDate: '', location: '', budget: '',
                manager: 'Alex Chen', description: ''
            });
        } catch (error) {
            console.error("Failed to add project");
            alert("新增失敗，請重試");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProject = (projectToDelete) => {
        if (confirm(`確定要刪除專案「${projectToDelete.name}」嗎？`)) {
            const updated = projects.filter(p => p.id !== projectToDelete.id);
            setProjects(updated);
            calculateStats(updated);
        }
    };

    // Filters
    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '全部' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">專案管理</h1>
                    <p className="text-gray-500 mt-1">管理所有設計與施工專案進度</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary flex items-center gap-2 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span>新增專案</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    icon={Briefcase}
                    label="總專案數"
                    value={stats.total}
                    color="from-blue-500 to-indigo-600"
                    delay="delay-75"
                />
                <StatCard
                    icon={Clock}
                    label="進行中"
                    value={stats.ongoing}
                    color="from-amber-400 to-orange-500"
                    delay="delay-100"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="已完工"
                    value={stats.completed}
                    color="from-green-400 to-emerald-600"
                    delay="delay-150"
                />
                <StatCard
                    icon={DollarSign}
                    label="總預算"
                    value={`$${(stats.revenue / 10000).toFixed(0)}萬`}
                    color="from-purple-500 to-pink-600"
                    delay="delay-200"
                />
            </div>

            {/* Filters & Controls */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="搜尋專案名稱、客戶..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field"
                    >
                        <option value="全部">全部狀態</option>
                        <option value="規劃中">規劃中</option>
                        <option value="進行中">進行中</option>
                        <option value="已完工">已完工</option>
                        <option value="暫停">暫停</option>
                    </select>
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onSelect={() => { }} // Placeholder for detailed view
                            onDelete={handleDeleteProject}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">尚無專案</h3>
                    <p className="text-gray-500 mt-1">點擊右上角新增您的第一個專案</p>
                </div>
            )}

            {/* Add Project Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="建立新專案"
                onConfirm={handleAddProject}
                confirmDisabled={isSaving || !newProject.name}
                confirmText={isSaving ? '處理中...' : '確認建立'}
                size="wide"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="col-span-full">
                        <InputField
                            label="專案名稱"
                            placeholder="例：信義區張公館邸翻修"
                            value={newProject.name}
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        />
                    </div>

                    <InputField
                        label="客戶名稱"
                        placeholder="選擇或輸入客戶"
                        value={newProject.client}
                        onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                    />

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">專案狀態</label>
                        <select
                            value={newProject.status}
                            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                            className="input-field"
                        >
                            <option value="規劃中">規劃中</option>
                            <option value="進行中">進行中</option>
                            <option value="暫停">暫停</option>
                            <option value="已完工">已完工</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">專案類型</label>
                        <select
                            value={newProject.type}
                            onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                            className="input-field"
                        >
                            <option value="住宅設計">住宅設計</option>
                            <option value="商業空間">商業空間</option>
                            <option value="辦公空間">辦公空間</option>
                            <option value="老屋翻新">老屋翻新</option>
                        </select>
                    </div>

                    <InputField
                        label="專案預算 (TWD)"
                        type="number"
                        placeholder="0"
                        value={newProject.budget}
                        onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    />

                    <InputField
                        label="專案地點"
                        placeholder="例：台北市信義區..."
                        value={newProject.location}
                        onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    />

                    <InputField
                        label="預計開始"
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    />

                    <InputField
                        label="預計結束"
                        type="date"
                        value={newProject.endDate}
                        onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    />

                    <div className="col-span-full">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">專案備註</label>
                            <textarea
                                className="input-field min-h-[100px] resize-y"
                                placeholder="輸入專案詳細說明與備註..."
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Projects;
