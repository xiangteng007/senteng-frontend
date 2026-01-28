/**
 * CMM Admin Page - 物料估算資料管理
 * 
 * 功能：
 * - 建築參數管理 (Building Profiles)
 * - 物料主檔管理 (Materials Master)
 * - 分類體系管理 (Taxonomy)
 */

import { useState, useEffect } from 'react';
import {
    Building2, Package, FolderTree, Plus, Edit2, Trash2,
    Save, X, RefreshCw, Download, Upload, Search,
    ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';

// API Base
const API_BASE = import.meta.env.VITE_API_URL || 'https://erp-api-381507943724.asia-east1.run.app';

// Tab 設定
const TABS = [
    { id: 'profiles', label: '建築參數', icon: Building2 },
    { id: 'materials', label: '物料主檔', icon: Package },
    { id: 'taxonomy', label: '分類體系', icon: FolderTree },
];

// 結構類型選項
const STRUCTURE_TYPES = [
    { value: 'RC', label: 'RC 鋼筋混凝土' },
    { value: 'SRC', label: 'SRC 鋼骨鋼筋混凝土' },
    { value: 'SC', label: 'SC 鋼構造' },
    { value: 'RB', label: 'RB 磚構造' },
    { value: 'W', label: 'W 木構造' },
];

// 物料類別選項
const MATERIAL_CATEGORIES = [
    { value: 'REBAR', label: '鋼筋' },
    { value: 'CONCRETE', label: '混凝土' },
    { value: 'FORMWORK', label: '模板' },
    { value: 'MORTAR', label: '砂漿' },
    { value: 'STEEL', label: '鋼骨' },
    { value: 'CEMENT', label: '水泥' },
    { value: 'SAND', label: '砂' },
    { value: 'GRAVEL', label: '碎石' },
    { value: 'OTHER', label: '其他' },
];

export default function CmmAdminPage({ addToast }) {
    const [activeTab, setActiveTab] = useState('profiles');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Fetch data based on active tab
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `${API_BASE}/api/v1/cmm/`;
            switch (activeTab) {
                case 'profiles':
                    url += 'profiles';
                    break;
                case 'materials':
                    url += 'materials';
                    break;
                case 'taxonomy':
                    url += 'taxonomy';
                    break;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const result = await response.json();
            setData(activeTab === 'materials' ? result.items || [] : result);
        } catch (err) {
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Filter data based on search
    const filteredData = Array.isArray(data) ? data.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.code?.toLowerCase().includes(searchLower) ||
            item.name?.toLowerCase().includes(searchLower) ||
            item.label?.toLowerCase().includes(searchLower)
        );
    }) : [];

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此項目嗎？')) return;

        try {
            const response = await fetch(`${API_BASE}/api/v1/cmm/${activeTab}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('刪除失敗');

            addToast?.('刪除成功', 'success');
            fetchData();
        } catch (err) {
            addToast?.(err.message, 'error');
        }
    };

    // Handle save (create/update)
    const handleSave = async (formData) => {
        try {
            const isEdit = !!editingItem?.id;
            const url = isEdit
                ? `${API_BASE}/api/v1/cmm/${activeTab}/${editingItem.id}`
                : `${API_BASE}/api/v1/cmm/${activeTab}`;

            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('儲存失敗');

            addToast?.(isEdit ? '更新成功' : '新增成功', 'success');
            setShowModal(false);
            setEditingItem(null);
            fetchData();
        } catch (err) {
            addToast?.(err.message, 'error');
        }
    };

    // Export to JSON
    const handleExport = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cmm_${activeTab}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CMM 資料管理</h1>
                    <p className="text-sm text-gray-500 mt-1">管理建築參數、物料主檔與分類體系</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>重新整理</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Download size={16} />
                        <span>匯出 JSON</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? 'text-gray-900 border-gray-900'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜尋代碼或名稱..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>
                {activeTab !== 'taxonomy' && (
                    <button
                        onClick={() => { setEditingItem({}); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={16} />
                        <span>新增</span>
                    </button>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg mb-4">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw size={24} className="animate-spin text-gray-400" />
                </div>
            )}

            {/* Content */}
            {!loading && !error && (
                <>
                    {activeTab === 'profiles' && (
                        <ProfilesTable
                            data={filteredData}
                            onEdit={(item) => { setEditingItem(item); setShowModal(true); }}
                            onDelete={handleDelete}
                        />
                    )}
                    {activeTab === 'materials' && (
                        <MaterialsTable
                            data={filteredData}
                            onEdit={(item) => { setEditingItem(item); setShowModal(true); }}
                            onDelete={handleDelete}
                        />
                    )}
                    {activeTab === 'taxonomy' && (
                        <TaxonomyTree data={data} />
                    )}
                </>
            )}

            {/* Edit Modal */}
            {showModal && (
                <Modal onClose={() => { setShowModal(false); setEditingItem(null); }}>
                    {activeTab === 'profiles' && (
                        <ProfileForm
                            initialData={editingItem}
                            onSave={handleSave}
                            onCancel={() => { setShowModal(false); setEditingItem(null); }}
                        />
                    )}
                    {activeTab === 'materials' && (
                        <MaterialForm
                            initialData={editingItem}
                            onSave={handleSave}
                            onCancel={() => { setShowModal(false); setEditingItem(null); }}
                        />
                    )}
                </Modal>
            )}
        </div>
    );
}

// ========== Sub Components ==========

function ProfilesTable({ data, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">代碼</th>
                        <th className="px-4 py-3 text-left font-medium">名稱</th>
                        <th className="px-4 py-3 text-left font-medium">結構</th>
                        <th className="px-4 py-3 text-right font-medium">鋼筋係數</th>
                        <th className="px-4 py-3 text-right font-medium">混凝土係數</th>
                        <th className="px-4 py-3 text-right font-medium">模板係數</th>
                        <th className="px-4 py-3 text-center font-medium">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                暫無資料
                            </td>
                        </tr>
                    ) : (
                        data.map(item => (
                            <tr key={item.id || item.code} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                                <td className="px-4 py-3">{item.name}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                        {item.structureType}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">{item.rebarFactor}</td>
                                <td className="px-4 py-3 text-right font-mono">{item.concreteFactor}</td>
                                <td className="px-4 py-3 text-right font-mono">{item.formworkFactor}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-gray-100 rounded">
                                            <Edit2 size={14} className="text-gray-500" />
                                        </button>
                                        <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded">
                                            <Trash2 size={14} className="text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function MaterialsTable({ data, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">代碼</th>
                        <th className="px-4 py-3 text-left font-medium">名稱</th>
                        <th className="px-4 py-3 text-left font-medium">類別</th>
                        <th className="px-4 py-3 text-left font-medium">規格</th>
                        <th className="px-4 py-3 text-left font-medium">單位</th>
                        <th className="px-4 py-3 text-center font-medium">狀態</th>
                        <th className="px-4 py-3 text-center font-medium">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                暫無資料
                            </td>
                        </tr>
                    ) : (
                        data.map(item => (
                            <tr key={item.id || item.code} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                                <td className="px-4 py-3">{item.name}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                        {MATERIAL_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{item.specification}</td>
                                <td className="px-4 py-3">{item.baseUnit}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs ${item.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {item.status === 'ACTIVE' ? '啟用' : '停用'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-gray-100 rounded">
                                            <Edit2 size={14} className="text-gray-500" />
                                        </button>
                                        <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded">
                                            <Trash2 size={14} className="text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function TaxonomyTree({ data }) {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (code) => {
        setExpanded(prev => ({ ...prev, [code]: !prev[code] }));
    };

    const categories = data?.categories || [];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            {categories.length === 0 ? (
                <div className="py-12 text-center text-gray-400">暫無資料</div>
            ) : (
                <div className="space-y-2">
                    {categories.map(l1 => (
                        <div key={l1.code} className="border border-gray-100 rounded-lg">
                            <button
                                onClick={() => toggleExpand(l1.code)}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <FolderTree size={18} className="text-gray-400" />
                                    <span className="font-medium">{l1.name}</span>
                                    <span className="text-xs text-gray-400 font-mono">{l1.code}</span>
                                </div>
                                {expanded[l1.code] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {expanded[l1.code] && l1.children && (
                                <div className="border-t border-gray-100 bg-gray-50 p-2">
                                    {l1.children.map(l2 => (
                                        <div key={l2.code} className="ml-6 py-2 flex items-center gap-3">
                                            <Package size={14} className="text-gray-400" />
                                            <span>{l2.name}</span>
                                            <span className="text-xs text-gray-400 font-mono">{l2.code}</span>
                                            {l2.defaultUnit && (
                                                <span className="text-xs bg-white px-2 py-0.5 rounded border">{l2.defaultUnit}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

function ProfileForm({ initialData, onSave, onCancel }) {
    const [form, setForm] = useState({
        code: initialData?.code || '',
        name: initialData?.name || '',
        structureType: initialData?.structureType || 'RC',
        minFloors: initialData?.minFloors || 1,
        maxFloors: initialData?.maxFloors || '',
        rebarFactor: initialData?.rebarFactor || 100,
        concreteFactor: initialData?.concreteFactor || 0.7,
        formworkFactor: initialData?.formworkFactor || 3.0,
        mortarFactor: initialData?.mortarFactor || 0.2,
        description: initialData?.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            minFloors: Number(form.minFloors),
            maxFloors: form.maxFloors ? Number(form.maxFloors) : null,
            rebarFactor: Number(form.rebarFactor),
            concreteFactor: Number(form.concreteFactor),
            formworkFactor: Number(form.formworkFactor),
            mortarFactor: Number(form.mortarFactor),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-lg font-bold mb-6">{initialData?.id ? '編輯建築參數' : '新增建築參數'}</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">代碼</label>
                    <input
                        type="text"
                        value={form.code}
                        onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-200"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名稱</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-200"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">結構類型</label>
                    <select
                        value={form.structureType}
                        onChange={(e) => setForm(f => ({ ...f, structureType: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        {STRUCTURE_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最小樓層</label>
                    <input
                        type="number"
                        value={form.minFloors}
                        onChange={(e) => setForm(f => ({ ...f, minFloors: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        min="1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最大樓層</label>
                    <input
                        type="number"
                        value={form.maxFloors}
                        onChange={(e) => setForm(f => ({ ...f, maxFloors: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="無限制"
                    />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">鋼筋係數</label>
                    <input
                        type="number"
                        step="0.01"
                        value={form.rebarFactor}
                        onChange={(e) => setForm(f => ({ ...f, rebarFactor: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">混凝土係數</label>
                    <input
                        type="number"
                        step="0.01"
                        value={form.concreteFactor}
                        onChange={(e) => setForm(f => ({ ...f, concreteFactor: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">模板係數</label>
                    <input
                        type="number"
                        step="0.01"
                        value={form.formworkFactor}
                        onChange={(e) => setForm(f => ({ ...f, formworkFactor: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">砂漿係數</label>
                    <input
                        type="number"
                        step="0.01"
                        value={form.mortarFactor}
                        onChange={(e) => setForm(f => ({ ...f, mortarFactor: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    rows={2}
                />
            </div>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    取消
                </button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                    儲存
                </button>
            </div>
        </form>
    );
}

function MaterialForm({ initialData, onSave, onCancel }) {
    const [form, setForm] = useState({
        code: initialData?.code || '',
        name: initialData?.name || '',
        category: initialData?.category || 'OTHER',
        baseUnit: initialData?.baseUnit || '',
        specification: initialData?.specification || '',
        standardWeightPerLength: initialData?.standardWeightPerLength || '',
        density: initialData?.density || '',
        status: initialData?.status || 'ACTIVE',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            standardWeightPerLength: form.standardWeightPerLength ? Number(form.standardWeightPerLength) : null,
            density: form.density ? Number(form.density) : null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-lg font-bold mb-6">{initialData?.id ? '編輯物料' : '新增物料'}</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">代碼</label>
                    <input
                        type="text"
                        value={form.code}
                        onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名稱</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
                    <select
                        value={form.category}
                        onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        {MATERIAL_CATEGORIES.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">基礎單位</label>
                    <input
                        type="text"
                        value={form.baseUnit}
                        onChange={(e) => setForm(f => ({ ...f, baseUnit: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="kg, m³, m²..."
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="ACTIVE">啟用</option>
                        <option value="INACTIVE">停用</option>
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">規格描述</label>
                <input
                    type="text"
                    value={form.specification}
                    onChange={(e) => setForm(f => ({ ...f, specification: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: D10 (9.53mm) SD420W"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">單位重量 (kg/m)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={form.standardWeightPerLength}
                        onChange={(e) => setForm(f => ({ ...f, standardWeightPerLength: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="鋼筋用"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">密度 (kg/m³)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={form.density}
                        onChange={(e) => setForm(f => ({ ...f, density: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="混凝土/砂用"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    取消
                </button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                    儲存
                </button>
            </div>
        </form>
    );
}
