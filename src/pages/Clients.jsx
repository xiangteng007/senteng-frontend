import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    MoreHorizontal,
    Phone,
    Mail,
    MapPin,
    Trash2,
    Star,
    Clock,
    CheckCircle2,
    Filter,
    X
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { InputField, SearchableSelect } from '../components/common/InputField';
import { clientsApi, GoogleService } from '../services/api';

// --- Stat Card Component ---
const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <div className={`stat-card flex items-center gap-4 w-full animate-fade-in-up ${delay}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} text-white shadow-lg`}>
            <Icon size={24} />
        </div>
        <div>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            <div className="text-sm text-gray-500 font-medium">{label}</div>
        </div>
    </div>
);

// --- Client Row Component ---
const ClientRow = ({ client, onSelect, onDelete }) => {
    return (
        <div
            onClick={() => onSelect(client)}
            className="group flex flex-col sm:flex-row items-start sm:items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in"
        >
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {client.name?.[0] || 'C'}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {client.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                            {client.source || '一般相關'}
                        </span>
                        <span>{client.status || '洽談中'}</span>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-4 sm:mt-0 w-full sm:w-auto text-sm text-gray-600">
                <div className="flex items-center gap-2 min-w-[140px]">
                    <Phone size={16} className="text-gray-400" />
                    <span>{client.phone || '未填寫'}</span>
                </div>
                <div className="flex items-center gap-2 min-w-[180px]">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate max-w-[180px]">{client.email || '未填寫'}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:ml-4 border-t sm:border-0 border-gray-100 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(client); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={18} />
                </button>
                <MoreHorizontal size={20} className="text-gray-300 sm:hidden" />
            </div>
        </div>
    );
};

const Clients = ({ data }) => {
    const [clients, setClients] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '', phone: '', email: '', status: '潛在客戶', source: '網路搜尋',
        address: '', budget: '', notes: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Initialize data
    useEffect(() => {
        if (data?.clients) {
            setClients(data.clients);
        }
    }, [data]);

    // Stats
    const stats = {
        total: clients.length,
        potential: clients.filter(c => c.status === '潛在客戶' || c.status === '洽談中').length,
        active: clients.filter(c => c.status === '已簽約' || c.status === '進行中').length,
        completed: clients.filter(c => c.status === '已完工').length
    };

    const handleAddClient = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600)); // Mock API delay
            const newItem = {
                id: Date.now(),
                ...newClient,
                projects: []
            };
            setClients([newItem, ...clients]);
            setIsAddModalOpen(false);
            setNewClient({
                name: '', phone: '', email: '', status: '潛在客戶', source: '網路搜尋',
                address: '', budget: '', notes: ''
            });
        } catch (e) {
            alert('新增失敗');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (client) => {
        if (confirm(`確定刪除 ${client.name}?`)) {
            setClients(clients.filter(c => c.id !== client.id));
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.includes(searchTerm) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">客戶管理</h1>
                    <p className="text-gray-500 mt-1">管理潛在客戶、業主資料與聯繫記錄</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>新增客戶</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard icon={Users} label="客戶總數" value={stats.total} color="from-blue-500 to-indigo-600" delay="delay-75" />
                <StatCard icon={Star} label="潛在客戶" value={stats.potential} color="from-amber-400 to-orange-500" delay="delay-100" />
                <StatCard icon={Clock} label="進行中" value={stats.active} color="from-green-400 to-emerald-600" delay="delay-150" />
                <StatCard icon={CheckCircle2} label="已結案" value={stats.completed} color="from-purple-500 to-pink-600" delay="delay-200" />
            </div>

            {/* Search Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="搜尋客戶姓名、電話..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 w-full"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                        <ClientRow
                            key={client.id}
                            client={client}
                            onSelect={() => { }} // Placeholder for edit/view modal
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                        查無客戶資料
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="建立新客戶"
                onConfirm={handleAddClient}
                confirmDisabled={!newClient.name || isSaving}
                confirmText={isSaving ? '儲存中...' : '確認建立'}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="客戶姓名" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="例：王小明" />
                        <InputField label="聯絡電話" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} placeholder="例：0912-345-678" />
                    </div>
                    <InputField label="Email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} placeholder="example@email.com" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">客戶狀態</label>
                            <select className="input-field" value={newClient.status} onChange={e => setNewClient({ ...newClient, status: e.target.value })}>
                                <option>潛在客戶</option>
                                <option>洽談中</option>
                                <option>已簽約</option>
                                <option>進行中</option>
                                <option>已完工</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">來源渠道</label>
                            <select className="input-field" value={newClient.source} onChange={e => setNewClient({ ...newClient, source: e.target.value })}>
                                <option>網路搜尋</option>
                                <option>親友介紹</option>
                                <option>社群媒體</option>
                                <option>其他</option>
                            </select>
                        </div>
                    </div>

                    <InputField label="地址" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} placeholder="聯絡地址..." />
                    <InputField label="預算範圍" value={newClient.budget} onChange={e => setNewClient({ ...newClient, budget: e.target.value })} placeholder="預計裝修預算..." />

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">備註</label>
                        <textarea className="input-field min-h-[80px]" value={newClient.notes} onChange={e => setNewClient({ ...newClient, notes: e.target.value })} placeholder="客戶特殊需求..." />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Clients;
