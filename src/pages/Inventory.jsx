
import React, { useState } from 'react';
import { WidgetWrapper } from '../components/common/WidgetWrapper';
import { Plus, Package } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import { SectionTitle } from '../components/common/Indicators'; // Ensure this is imported
import { GoogleService } from '../services/GoogleService';

// --- Local Inventory Widgets ---
const WidgetInventoryStats = ({ data, size }) => {
    const lowStock = data.filter(i => i.status === '庫存偏低' || i.status === '缺貨').length;
    if (size === 'S') return <div className="h-full flex flex-col justify-between"><Package size={24} className={lowStock > 0 ? "text-red-500" : "text-gray-400"} /><div><div className="text-3xl font-bold text-morandi-text-primary">{lowStock}</div><div className="text-xs text-gray-500">缺貨/低庫存</div></div></div>;
    return <div className="h-full flex items-center justify-center text-gray-400 text-sm">庫存分析圖表 (待實作)</div>;
};

const WidgetInventoryList = ({ data, size, onAdd }) => {
    if (size === 'S') return <div className="h-full flex flex-col justify-center items-center gap-2"><div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" onClick={onAdd}><Plus size={24} /></div><button className="text-xs font-bold text-gray-600 hover:text-morandi-blue-600" onClick={onAdd}>新增品項</button></div>;
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between mb-4 items-center">
                <h4 className="font-bold text-gray-600 text-xs">列表 ({data.length})</h4>
                {size === 'L' && <button onClick={onAdd} className="bg-morandi-text-accent text-white px-2.5 py-1 text-xs rounded-lg hover:bg-gray-700 flex items-center gap-1 transition-colors"><Plus size={12} /> 新增</button>}
            </div>
            <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0"><tr><th className="p-3 rounded-l-lg">品項</th><th className="p-3">數量</th><th className="p-3 rounded-r-lg">狀態</th></tr></thead>
                    <tbody>{data.map(i => (<tr key={i.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"><td className="p-3"><div className="font-bold text-gray-700">{i.name}</div><div className="text-xs text-gray-400">{i.spec}</div></td><td className="p-3 font-mono font-bold">{i.quantity}</td><td className="p-3"><Badge color={i.status === '缺貨' ? 'red' : i.status === '庫存偏低' ? 'orange' : 'green'}>{i.status}</Badge></td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );
};

const Inventory = ({ data, addToast }) => {
    const [items, setItems] = useState(data); // Local State for sort/filter/add
    const [widgets, setWidgets] = useState([
        { id: 'wi-stats', type: 'inventory-stats', title: '庫存概況', size: 'S' },
        { id: 'wi-list', type: 'inventory-list', title: '庫存清單', size: 'L' }
    ]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", spec: "", quantity: 0, unit: "個", status: "充足", location: "", safeStock: 10 });

    // Update items when prop data changes (initial load)
    // useEffect(() => setItems(data), [data]); // Optional depending on how App updates

    const handleResize = (id, size) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));

    const handleAddItem = async () => {
        const itemToAdd = { ...newItem, id: `i-${Date.now()}` };
        const newItems = [...items, itemToAdd];
        setItems(newItems);
        await GoogleService.syncToSheet('inventory', newItems);
        addToast("品項新增成功！(已同步至 Google Sheet)", 'success');
        setIsAddModalOpen(false);
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <SectionTitle title="庫存管理" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-auto">
                {widgets.map((w, i) => (
                    <WidgetWrapper key={w.id} widget={w} onResize={handleResize}>
                        {w.type === 'inventory-stats' && <WidgetInventoryStats data={items} size={w.size} />}
                        {w.type === 'inventory-list' && <WidgetInventoryList data={items} size={w.size} onAdd={() => setIsAddModalOpen(true)} />}
                    </WidgetWrapper>
                ))}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="新增庫存品項" onConfirm={handleAddItem}>
                <InputField label="品項名稱" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                <InputField label="規格/型號" value={newItem.spec} onChange={e => setNewItem({ ...newItem, spec: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="數量" type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} />
                    <InputField label="單位" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} placeholder="例：個、箱、組" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="存放位置" value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} />
                    <InputField label="安全庫存量" type="number" value={newItem.safeStock} onChange={e => setNewItem({ ...newItem, safeStock: e.target.value })} />
                </div>
            </Modal>
        </div>
    );
};
export default Inventory;
