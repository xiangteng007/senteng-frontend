
import React, { useState } from 'react';
import { Plus, Image as ImageIcon, ExternalLink, Globe } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import { SectionTitle } from '../components/common/Indicators';

export const MaterialGallery = () => {
    const [materials, setMaterials] = useState([
        { id: 1, title: "義大利大理石", type: "image", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400", source: "Unsplash" },
        { id: 2, title: "日本檜木", type: "link", url: "https://example.com", source: "Official Site" }
    ]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({ title: "", type: "image", url: "", source: "" });

    const handleAdd = () => {
        setMaterials([...materials, { ...newItem, id: Date.now() }]);
        setIsAddOpen(false);
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <SectionTitle title="材質圖庫" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <button onClick={() => setIsAddOpen(true)} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-morandi-blue-400 hover:text-morandi-blue-500 transition-colors bg-gray-50/50">
                    <Plus size={24} />
                    <span className="text-xs font-bold mt-2">新增材質</span>
                </button>

                {materials.map(m => (
                    <div key={m.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white hover:shadow-lg transition-all">
                        {m.type === 'image' ? (
                            <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                <Globe size={32} opacity={0.2} />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <div className="text-white font-bold text-sm truncate">{m.title}</div>
                            <div className="text-white/70 text-[10px] truncate">{m.source}</div>
                            {m.type === 'link' && <a href={m.url} target="_blank" className="absolute top-2 right-2 text-white"><ExternalLink size={16} /></a>}
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="新增材質庫" onConfirm={handleAdd}>
                <InputField label="名稱" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
                <div className="flex gap-4 mb-4">
                    <button onClick={() => setNewItem({ ...newItem, type: 'image' })} className={`flex-1 py-2 rounded-lg border text-sm ${newItem.type === 'image' ? 'bg-gray-800 text-white' : 'bg-white'}`}>圖片 URL</button>
                    <button onClick={() => setNewItem({ ...newItem, type: 'link' })} className={`flex-1 py-2 rounded-lg border text-sm ${newItem.type === 'link' ? 'bg-gray-800 text-white' : 'bg-white'}`}>網站連結</button>
                </div>
                <InputField label="連結/URL" value={newItem.url} onChange={e => setNewItem({ ...newItem, url: e.target.value })} placeholder="https://..." />
                <InputField label="來源備註" value={newItem.source} onChange={e => setNewItem({ ...newItem, source: e.target.value })} />
            </Modal>
        </div>
    )
}
