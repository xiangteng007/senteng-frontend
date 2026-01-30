/**
 * 工地照片管理頁面 (SitePhotos.jsx)
 * GPS標記照片、EXIF資訊、審核流程
 */

import React, { useState, useEffect } from 'react';
import {
    Camera,
    Plus,
    Search,
    MapPin,
    Calendar,
    Clock,
    User,
    CheckCircle,
    XCircle,
    MessageSquare,
    Download,
    Grid,
    Map,
    Filter,
    Image,
    Eye,
    X,
} from 'lucide-react';
import { LoadingSpinner, SectionTitle } from '../components/common/Indicators';

// 照片狀態
const PHOTO_STATUS = {
    PENDING: { label: '待審核', color: 'yellow' },
    APPROVED: { label: '已審核', color: 'green' },
    REJECTED: { label: '已退回', color: 'red' },
};

// 照片分類
const PHOTO_CATEGORIES = {
    PROGRESS: { label: '施工進度', color: 'blue' },
    QUALITY: { label: '品質檢查', color: 'green' },
    SAFETY: { label: '安全檢查', color: 'orange' },
    MATERIAL: { label: '材料進場', color: 'purple' },
    ISSUE: { label: '問題回報', color: 'red' },
};

// 統計卡片
const StatCard = ({ icon: Icon, label, value, color = 'gray' }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-100`}>
                <Icon size={20} className={`text-${color}-600`} />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-xl font-bold text-${color}-700`}>{value}</p>
            </div>
        </div>
    </div>
);

// 照片卡片
const PhotoCard = ({ photo, onClick }) => {
    const status = PHOTO_STATUS[photo.status] || PHOTO_STATUS.PENDING;
    const category = PHOTO_CATEGORIES[photo.category] || PHOTO_CATEGORIES.PROGRESS;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
        >
            {/* 照片預覽 */}
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img
                    src={photo.thumbnailUrl || `https://picsum.photos/seed/${photo.id}/400/300`}
                    alt={photo.description}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${category.color}-500 text-white`}>
                        {category.label}
                    </span>
                </div>
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${status.color}-500 text-white`}>
                        {status.label}
                    </span>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-white text-xs">
                    <Eye size={12} />
                    {photo.viewCount || 0}
                </div>
            </div>

            {/* 資訊 */}
            <div className="p-3">
                <p className="font-medium text-gray-800 truncate mb-1">{photo.description}</p>
                <p className="text-sm text-gray-500 truncate">{photo.projectName}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {photo.date}
                    </span>
                    <span className="flex items-center gap-1">
                        <User size={12} />
                        {photo.uploaderName}
                    </span>
                    {photo.hasGps && (
                        <span className="flex items-center gap-1 text-green-500">
                            <MapPin size={12} />
                            GPS
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// 照片檢視 Modal
const PhotoViewModal = ({ photo, onClose, onApprove, onReject }) => {
    if (!photo) return null;

    const status = PHOTO_STATUS[photo.status] || PHOTO_STATUS.PENDING;
    const category = PHOTO_CATEGORIES[photo.category] || PHOTO_CATEGORIES.PROGRESS;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex">
                {/* 照片區 */}
                <div className="flex-1 bg-gray-900 flex items-center justify-center">
                    <img
                        src={photo.fullUrl || `https://picsum.photos/seed/${photo.id}/800/600`}
                        alt={photo.description}
                        className="max-w-full max-h-[80vh] object-contain"
                    />
                </div>

                {/* 資訊區 */}
                <div className="w-80 bg-white flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">照片詳情</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* 狀態和分類 */}
                        <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${category.color}-100 text-${category.color}-700`}>
                                {category.label}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                                {status.label}
                            </span>
                        </div>

                        {/* 描述 */}
                        <div>
                            <p className="text-sm text-gray-500 mb-1">描述</p>
                            <p className="text-gray-800">{photo.description}</p>
                        </div>

                        {/* 專案 */}
                        <div>
                            <p className="text-sm text-gray-500 mb-1">專案</p>
                            <p className="text-gray-800">{photo.projectName}</p>
                        </div>

                        {/* 拍攝資訊 */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">拍攝日期</p>
                                <p className="text-gray-800 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {photo.date}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">拍攝時間</p>
                                <p className="text-gray-800 flex items-center gap-1">
                                    <Clock size={14} />
                                    {photo.time || '14:30'}
                                </p>
                            </div>
                        </div>

                        {/* 上傳者 */}
                        <div>
                            <p className="text-sm text-gray-500 mb-1">上傳者</p>
                            <p className="text-gray-800 flex items-center gap-1">
                                <User size={14} />
                                {photo.uploaderName}
                            </p>
                        </div>

                        {/* GPS */}
                        {photo.hasGps && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">GPS 座標</p>
                                <p className="text-gray-800 flex items-center gap-1">
                                    <MapPin size={14} className="text-green-500" />
                                    {photo.latitude}, {photo.longitude}
                                </p>
                            </div>
                        )}

                        {/* EXIF */}
                        <div>
                            <p className="text-sm text-gray-500 mb-2">相機資訊</p>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                                <p><span className="text-gray-500">裝置:</span> {photo.camera || 'iPhone 15 Pro'}</p>
                                <p><span className="text-gray-500">解析度:</span> {photo.resolution || '4032 x 3024'}</p>
                                <p><span className="text-gray-500">檔案大小:</span> {photo.fileSize || '3.2 MB'}</p>
                            </div>
                        </div>

                        {/* 註解 */}
                        {photo.annotations && photo.annotations.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-500 mb-2">註解</p>
                                <div className="space-y-2">
                                    {photo.annotations.map((anno, idx) => (
                                        <div key={idx} className="bg-yellow-50 rounded-lg p-2 text-sm">
                                            <p className="font-medium text-yellow-800">{anno.author}</p>
                                            <p className="text-yellow-700">{anno.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 操作按鈕 */}
                    {photo.status === 'PENDING' && (
                        <div className="p-4 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => onReject?.(photo.id)}
                                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                            >
                                <XCircle size={18} />
                                退回
                            </button>
                            <button
                                onClick={() => onApprove?.(photo.id)}
                                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                            >
                                <CheckCircle size={18} />
                                審核通過
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 主組件
const SitePhotos = ({ addToast }) => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setPhotos([
                {
                    id: 1,
                    description: '一樓混凝土澆置完成',
                    category: 'PROGRESS',
                    status: 'APPROVED',
                    projectName: '台北市信義區辦公大樓新建工程',
                    date: '2026-01-29',
                    time: '14:30',
                    uploaderName: '陳工程師',
                    hasGps: true,
                    latitude: 25.0330,
                    longitude: 121.5654,
                    viewCount: 24,
                },
                {
                    id: 2,
                    description: '鋼筋綁紮品質檢查',
                    category: 'QUALITY',
                    status: 'PENDING',
                    projectName: '台北市信義區辦公大樓新建工程',
                    date: '2026-01-29',
                    time: '10:15',
                    uploaderName: '李監工',
                    hasGps: true,
                    latitude: 25.0331,
                    longitude: 121.5655,
                    viewCount: 8,
                },
                {
                    id: 3,
                    description: '施工圍籬安全檢視',
                    category: 'SAFETY',
                    status: 'APPROVED',
                    projectName: '新北市林口住宅案',
                    date: '2026-01-28',
                    time: '16:45',
                    uploaderName: '王安全員',
                    hasGps: false,
                    viewCount: 15,
                },
                {
                    id: 4,
                    description: '磁磚材料進場驗收',
                    category: 'MATERIAL',
                    status: 'PENDING',
                    projectName: '桃園市大園區廠房修繕',
                    date: '2026-01-28',
                    time: '09:00',
                    uploaderName: '張採購',
                    hasGps: true,
                    latitude: 25.0542,
                    longitude: 121.2156,
                    viewCount: 5,
                },
                {
                    id: 5,
                    description: '牆面裂縫問題回報',
                    category: 'ISSUE',
                    status: 'REJECTED',
                    projectName: '桃園市大園區廠房修繕',
                    date: '2026-01-27',
                    time: '11:20',
                    uploaderName: '陳工程師',
                    hasGps: true,
                    latitude: 25.0543,
                    longitude: 121.2157,
                    viewCount: 32,
                    annotations: [
                        { author: '李主任', content: '請補拍近照並標示裂縫尺寸' },
                    ],
                },
                {
                    id: 6,
                    description: '二樓模板組立完成',
                    category: 'PROGRESS',
                    status: 'APPROVED',
                    projectName: '台北市信義區辦公大樓新建工程',
                    date: '2026-01-26',
                    time: '17:00',
                    uploaderName: '陳工程師',
                    hasGps: true,
                    latitude: 25.0330,
                    longitude: 121.5654,
                    viewCount: 18,
                },
            ]);
        } catch (error) {
            addToast?.('載入照片失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (photoId) => {
        setPhotos(photos.map(p => p.id === photoId ? { ...p, status: 'APPROVED' } : p));
        setSelectedPhoto(null);
        addToast?.('已審核通過', 'success');
    };

    const handleReject = (photoId) => {
        setPhotos(photos.map(p => p.id === photoId ? { ...p, status: 'REJECTED' } : p));
        setSelectedPhoto(null);
        addToast?.('已退回', 'info');
    };

    // 統計
    const stats = {
        totalPhotos: photos.length,
        pendingCount: photos.filter(p => p.status === 'PENDING').length,
        approvedCount: photos.filter(p => p.status === 'APPROVED').length,
        gpsCount: photos.filter(p => p.hasGps).length,
    };

    // 過濾
    const filteredPhotos = photos.filter(photo => {
        const matchesSearch = photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            photo.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || photo.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || photo.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 標題 */}
            <div className="flex items-center justify-between">
                <SectionTitle icon={Camera} title="工地照片" subtitle="施工現場照片管理與審核" />
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Plus size={18} />
                    上傳照片
                </button>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Image} label="總照片數" value={stats.totalPhotos} color="blue" />
                <StatCard icon={Clock} label="待審核" value={stats.pendingCount} color="yellow" />
                <StatCard icon={CheckCircle} label="已審核" value={stats.approvedCount} color="green" />
                <StatCard icon={MapPin} label="含GPS定位" value={stats.gpsCount} color="purple" />
            </div>

            {/* 篩選和檢視模式 */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜尋照片描述或專案名稱..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">全部分類</option>
                    {Object.entries(PHOTO_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.label}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">全部狀態</option>
                    {Object.entries(PHOTO_STATUS).map(([key, stat]) => (
                        <option key={key} value={key}>{stat.label}</option>
                    ))}
                </select>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Grid size={18} className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-500'} />
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Map size={18} className={viewMode === 'map' ? 'text-blue-600' : 'text-gray-500'} />
                    </button>
                </div>
            </div>

            {/* 照片網格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPhotos.map(photo => (
                    <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onClick={() => setSelectedPhoto(photo)}
                    />
                ))}
                {filteredPhotos.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        <Camera size={48} className="mx-auto mb-4 opacity-50" />
                        <p>沒有符合條件的照片</p>
                    </div>
                )}
            </div>

            {/* 照片檢視 Modal */}
            {selectedPhoto && (
                <PhotoViewModal
                    photo={selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};

export default SitePhotos;
