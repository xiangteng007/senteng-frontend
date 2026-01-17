import React, { useState, useEffect } from 'react';
import {
    HardHat,
    Search,
    Plus,
    Phone,
    Mail,
    MapPin,
    Star,
    Filter,
    Trash2
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import { vendorsApi } from '../services/api';

// --- Components ---

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

const VendorRow = ({ vendor, onDelete }) => (
    <div className="group flex flex-col sm:flex-row items-start sm:items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in">

        {/* Basic Info */}
        <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg">
                {vendor.name?.[0] || 'V'}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {vendor.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full">{vendor.category}</span>
                    <div className="flex items-center text-amber-500">
                        <Star size={12} fill="currentColor" />
                        <span className="ml-1 font-medium">{vendor.rating}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 mt-4 sm:mt-0 w-full sm:w-auto text-sm text-gray-600">
            <div className="flex items-center gap-2">
                <UsersContactIcon size={16} className="text-gray-400" />
                <span>{vendor.contactPerson || '聯絡人未填'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span>{vendor.phone}</span>
            </div>
        </div>

        {/* Action */}
        <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:ml-4 border-t sm:border-0 border-gray-100 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(vendor); }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={18} />
            </button>
        </div>
    </div>
);

const UsersContactIcon = ({ size, className }) => <HardHat size={size} className={className} />; // Placeholder icon

const Vendors = ({ data }) => {
    const [vendors, setVendors] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newVendor, setNewVendor] = useState({
        name: '', category: '建材供應', contactPerson: '', phone: '', email: '', rating: 5, tags: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (data?.vendors) {
            setVendors(data.vendors);
        }
    }, [data]);

    const stats = {
        total: vendors.length,
        partners: vendors.filter(v => v.rating >= 4.5).length,
        material: vendors.filter(v => v.category === '建材供應').length,
        construction: vendors.filter(v => v.category === '工程施工').length
    };

    const handleAddVendor = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            setVendors([{ id: Date.now(), ...newVendor }, ...vendors]);
            setIsAddModalOpen(false);
            setNewVendor({ name: '', category: '建材供應', contactPerson: '', phone: '', email: '', rating: 5, tags: '' });
        } catch (e) {
            alert('Error adding vendor');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (vendor) => {
        if (confirm(`刪除廠商 ${vendor.name}?`)) {
            setVendors(vendors.filter(v => v.id !== vendor.id));
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">廠商管理</h1>
                    <p className="text-gray-500 mt-1">管理供應商、工班與合作夥伴名單</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>新增廠商</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard icon={HardHat} label="廠商總數" value={stats.total} color="from-blue-500 to-indigo-600" delay="delay-75" />
                <StatCard icon={Star} label="優質夥伴" value={stats.partners} color="from-amber-400 to-orange-500" delay="delay-100" />
                <StatCard icon={HardHat} label="建材商" value={stats.material} color="from-green-400 to-emerald-600" delay="delay-150" />
                <StatCard icon={HardHat} label="施工團隊" value={stats.construction} color="from-purple-500 to-pink-600" delay="delay-200" />
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="搜尋廠商名稱..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 w-full"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredVendors.length > 0 ? (
                    filteredVendors.map(vendor => (
                        <VendorRow
                            key={vendor.id}
                            vendor={vendor}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                        無廠商資料
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="新增合作廠商"
                onConfirm={handleAddVendor}
                confirmDisabled={!newVendor.name || isSaving}
                confirmText={isSaving ? '儲存中...' : '確認新增'}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="廠商名稱" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} placeholder="例：大同磁磚" />
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">分類</label>
                            <select className="input-field" value={newVendor.category} onChange={e => setNewVendor({ ...newVendor, category: e.target.value })}>
                                <option>建材供應</option>
                                <option>工程施工</option>
                                <option>家具軟裝</option>
                                <option>設備租賃</option>
                                <option>其他服務</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="聯絡人" value={newVendor.contactPerson} onChange={e => setNewVendor({ ...newVendor, contactPerson: e.target.value })} placeholder="例：陳經理" />
                        <InputField label="電話" value={newVendor.phone} onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })} placeholder="02-1234-5678" />
                    </div>

                    <InputField label="Email" value={newVendor.email} onChange={e => setNewVendor({ ...newVendor, email: e.target.value })} placeholder="contact@example.com" />
                </div>
            </Modal>
        </div>
    );
};

export default Vendors;
