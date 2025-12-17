
import React, { useState } from 'react';
import { Plus, Image as ImageIcon, ExternalLink, Globe, FolderPlus } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import { SectionTitle } from '../components/common/Indicators';
import { GoogleService } from '../services/GoogleService';

export const MaterialGallery = ({ addToast }) => {
    const [categories, setCategories] = useState([
        {
            id: 1, name: "大理石", driveFolder: null, materials: [
                { id: 101, title: "義大利白大理石", type: "image", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400", source: "Unsplash" },
            ]
        },
        {
            id: 2, name: "木紋", driveFolder: null, materials: [
                { id: 201, title: "日本檜木", type: "link", url: "https://example.com", source: "Official Site" }
            ]
        }
    ]);

    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategory, setNewCategory] = useState("");
    const [newItem, setNewItem] = useState({ title: "", type: "image", url: "", source: "" });
    const [isSaving, setIsSaving] = useState(false);

    // 獲取或建立「材質圖庫」根資料夾
    const getMaterialGalleryRoot = async () => {
        try {
            const result = await GoogleService.getOrCreateProjectRoot();
            if (!result.success) return null;

            // 在根資料夾下建立「材質圖庫」
            const galleryResult = await GoogleService.createDriveFolder('材質圖庫', result.folderId);
            return galleryResult.success ? galleryResult : null;
        } catch (e) {
            console.error('Failed to get material gallery root:', e);
            return null;
        }
    };

    // 新增類別（在Drive建立對應子資料夾）
    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            addToast?.("請輸入類別名稱", 'error');
            return;
        }

        setIsSaving(true);

        // 在Drive建立類別資料夾
        const galleryRoot = await getMaterialGalleryRoot();
        let driveFolderUrl = null;

        if (galleryRoot) {
            const categoryFolder = await GoogleService.createDriveFolder(newCategory, galleryRoot.folderId);
            if (categoryFolder.success) {
                driveFolderUrl = categoryFolder.url;
            }
        }

        const category = {
            id: Date.now(),
            name: newCategory,
            driveFolder: driveFolderUrl,
            materials: []
        };

        setCategories([...categories, category]);
        setNewCategory("");
        setIsAddCategoryOpen(false);
        setIsSaving(false);

        addToast?.(`類別「${newCategory}」已建立${driveFolderUrl ? '，Drive資料夾已同步' : ''}`, 'success');
    };

    // 新增材質到類別
    const handleAddMaterial = async () => {
        if (!newItem.title || !newItem.url) {
            addToast?.("請填寫名稱和連結", 'error');
            return;
        }

        const material = { ...newItem, id: Date.now() };

        setCategories(categories.map(cat =>
            cat.id === selectedCategory
                ? { ...cat, materials: [...cat.materials, material] }
                : cat
        ));

        setNewItem({ title: "", type: "image", url: "", source: "" });
        setIsAddMaterialOpen(false);
        addToast?.(`材質「${newItem.title}」已新增`, 'success');
    };

    // 開啟新增材質彈窗
    const openAddMaterial = (categoryId) => {
        setSelectedCategory(categoryId);
        setIsAddMaterialOpen(true);
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <SectionTitle title="材質圖庫" />
                <button
                    onClick={() => setIsAddCategoryOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-morandi-text-accent text-white rounded-xl hover:bg-gray-800 transition-colors text-sm"
                >
                    <FolderPlus size={16} />
                    <span>新增類別</span>
                </button>
            </div>

            {/* 類別區塊 */}
            {categories.map(category => (
                <div key={category.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                        <h3 className="font-bold text-lg text-morandi-text-primary">{category.name}</h3>
                        {category.driveFolder && (
                            <a href={category.driveFolder} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                <ExternalLink size={12} /> Drive 資料夾
                            </a>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {/* 新增按鈕 */}
                        <button
                            onClick={() => openAddMaterial(category.id)}
                            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-morandi-blue-400 hover:text-morandi-blue-500 transition-colors bg-gray-50/50"
                        >
                            <Plus size={20} />
                            <span className="text-xs font-medium mt-1">新增材質</span>
                        </button>

                        {/* 材質項目 */}
                        {category.materials.map(m => (
                            <div key={m.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white hover:shadow-lg transition-all">
                                {m.type === 'image' ? (
                                    <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                        <Globe size={28} opacity={0.3} />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 sm:p-3">
                                    <div className="text-white font-bold text-xs sm:text-sm truncate">{m.title}</div>
                                    <div className="text-white/70 text-[10px] truncate">{m.source}</div>
                                    {m.type === 'link' && (
                                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 text-white">
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* 空狀態 */}
            {categories.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
                    <FolderPlus size={48} className="mx-auto mb-3 opacity-50" />
                    <p>尚無材質類別，點擊上方按鈕新增</p>
                </div>
            )}

            {/* 新增類別 Modal */}
            <Modal
                isOpen={isAddCategoryOpen}
                onClose={() => setIsAddCategoryOpen(false)}
                title="新增材質類別"
                onConfirm={handleAddCategory}
                confirmDisabled={isSaving}
                confirmText={isSaving ? '建立中...' : '建立'}
            >
                <div className="space-y-4">
                    <InputField
                        label="類別名稱"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        placeholder="例：大理石、木紋、磁磚..."
                    />
                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        📁 系統將自動在 Drive「材質圖庫」資料夾下建立對應的類別資料夾
                    </p>
                </div>
            </Modal>

            {/* 新增材質 Modal */}
            <Modal
                isOpen={isAddMaterialOpen}
                onClose={() => setIsAddMaterialOpen(false)}
                title="新增材質"
                onConfirm={handleAddMaterial}
            >
                <div className="space-y-4">
                    <InputField
                        label="名稱"
                        value={newItem.title}
                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder="材質名稱"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">類型</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setNewItem({ ...newItem, type: 'image' })}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${newItem.type === 'image' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                            >
                                圖片 URL
                            </button>
                            <button
                                onClick={() => setNewItem({ ...newItem, type: 'link' })}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${newItem.type === 'link' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                            >
                                網站連結
                            </button>
                        </div>
                    </div>

                    <InputField
                        label="連結/URL"
                        value={newItem.url}
                        onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                        placeholder="https://..."
                    />

                    <InputField
                        label="來源備註"
                        value={newItem.source}
                        onChange={e => setNewItem({ ...newItem, source: e.target.value })}
                        placeholder="選填"
                    />
                </div>
            </Modal>
        </div>
    )
}
