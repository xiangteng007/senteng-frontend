
import React, { useState, useRef } from 'react';
import { WidgetWrapper } from '../components/common/WidgetWrapper';
import { WidgetClientStats, WidgetClientList } from '../components/widgets/ClientVendorWidgets';
import { Modal } from '../components/common/Modal';
import { InputField, DynamicFieldEditor } from '../components/common/InputField';
import { LocationField } from '../components/common/LocationField';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { SectionTitle, LoadingSkeleton } from '../components/common/Indicators';
import { Phone, Mail, Folder, Edit2, Trash2, Cloud, ChevronLeft, Save } from 'lucide-react';
import { GoogleService } from '../services/GoogleService';

const Clients = ({ data, loading, addToast, onUpdateClients }) => {
    const [widgets, setWidgets] = useState([
        { id: 'wc-stats', type: 'client-stats', title: '客戶概況', size: 'S' },
        { id: 'wc-list', type: 'client-list', title: '客戶名單', size: 'L' }
    ]);

    const [activeClient, setActiveClient] = useState(null);

    // Add/Edit State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [newClientData, setNewClientData] = useState({ name: "", phone: "", email: "", address: "", status: "洽談中", customFields: [] });
    const [isSaving, setIsSaving] = useState(false);

    const handleResize = (id, size) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));

    const handleOpenAdd = () => {
        setNewClientData({ name: "", phone: "", email: "", address: "", status: "洽談中", customFields: [{ label: "備註", value: "" }] });
        setIsAddModalOpen(true);
    };

    const handleSaveNewClient = async () => {
        if (!newClientData.name) return addToast("請輸入姓名", "error");

        setIsSaving(true);

        // Create Drive Folder
        const driveResult = await GoogleService.createDriveFolder(newClientData.name);

        if (!driveResult.success) {
            setIsSaving(false);
            return addToast(`Drive 資料夾建立失敗: ${driveResult.error}`, "error");
        }

        const client = { ...newClientData, id: `c-${Date.now()}`, driveFolder: driveResult.url };

        const updatedList = [...data, client];
        onUpdateClients(updatedList);

        const syncResult = await GoogleService.syncToSheet('clients', updatedList);
        setIsSaving(false);

        if (!syncResult.success) {
            addToast(`Sheets 同步失敗: ${syncResult.error}`, "error");
        } else {
            addToast("客戶新增成功！已同步到 Google Drive 和 Sheets", "success", {
                action: {
                    label: '開啟 Drive 資料夾',
                    onClick: () => window.open(driveResult.url, '_blank')
                }
            });
        }

        setIsAddModalOpen(false);
    };

    const handleDeleteClient = async (id) => {
        // if (!window.confirm("確定要刪除此客戶嗎？")) return;
        const updatedList = data.filter(c => c.id !== id);
        onUpdateClients(updatedList);
        await GoogleService.syncToSheet('clients', updatedList);
        addToast("客戶已刪除", "success");
        if (activeClient?.id === id) setActiveClient(null);
    };

    // Edit Logic
    const startEdit = () => { setEditFormData({ ...activeClient }); setIsEditing(true); };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        const updatedList = data.map(c => c.id === editFormData.id ? editFormData : c);
        onUpdateClients(updatedList);

        const syncResult = await GoogleService.syncToSheet('clients', updatedList);
        setIsSaving(false);

        if (!syncResult.success) {
            addToast(`Sheets 同步失敗: ${syncResult.error}`, "error");
        } else {
            setActiveClient(editFormData);
            setIsEditing(false);
            addToast("資料已更新", "success");
        }
    };

    if (activeClient) {
        return (
            <div className="space-y-6 animate-fade-in">
                <button onClick={() => { setActiveClient(null); setIsEditing(false); }} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4"><ChevronLeft size={16} /> 返回列表</button>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">{activeClient.name[0]}</div>
                        <div>
                            {isEditing ? (
                                <input value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none mb-1 bg-transparent" />
                            ) : (
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">{activeClient.name} <Badge color={activeClient.status === '已簽約' ? 'green' : 'blue'}>{activeClient.status}</Badge></h2>
                            )}
                            <div className="text-gray-500 text-sm flex items-center gap-3 mt-1">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <input placeholder="電話" value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} className="border rounded px-2 py-1" />
                                        <input placeholder="Email" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} className="border rounded px-2 py-1" />
                                    </div>
                                ) : (
                                    <>
                                        <span className="flex items-center gap-1"><Phone size={12} /> {activeClient.phone}</span>
                                        <span className="flex items-center gap-1"><Mail size={12} /> {activeClient.email}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600">取消</button>
                                <button onClick={handleSaveEdit} className="bg-morandi-green-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-morandi-green-600"><Save size={14} /> 儲存</button>
                            </>
                        ) : (
                            <>
                                <a href={activeClient.driveFolder} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-100 border border-blue-100"><Folder size={16} /> 開啟雲端資料夾</a>
                                <button onClick={startEdit} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"><Edit2 size={14} /> 編輯資料</button>
                                <button onClick={() => handleDeleteClient(activeClient.id)} className="bg-white border border-red-200 text-red-500 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> 刪除</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">基本資料 & 需求</h3>
                        {isEditing ? (
                            <>
                                <div className="mb-4"><label className="block text-sm text-gray-500 mb-1">地址</label><input value={editFormData.address} onChange={e => setEditFormData({ ...editFormData, address: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                <div className="mb-4"><label className="block text-sm text-gray-500 mb-1">狀態</label><select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full border rounded px-2 py-1 bg-white">{['洽談中', '提案/報價', '已簽約', '已完工'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                <DynamicFieldEditor fields={editFormData.customFields || []} onChange={(newFields) => setEditFormData({ ...editFormData, customFields: newFields })} />
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div className="col-span-2"><span className="text-gray-500 block mb-1">地址</span> {activeClient.address}</div>
                                {activeClient.customFields?.map((field, idx) => (
                                    <div key={idx} className={field.value.length > 20 ? "col-span-2" : "col-span-1"}>
                                        <span className="text-gray-500 block mb-1">{field.label}</span><span className="text-gray-900">{field.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                    <div className="space-y-6">
                        <Card>
                            <h3 className="font-bold text-gray-800 mb-4">專案歷史</h3>
                            <div className="text-sm text-gray-500 text-center py-4">尚無關聯專案</div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <SectionTitle title="客戶管理" />
            {loading ? <LoadingSkeleton /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
                    {widgets.map((w, i) => (
                        <WidgetWrapper key={w.id} widget={w} onResize={handleResize}>
                            {w.type === 'client-stats' && <WidgetClientStats data={data} size={w.size} />}
                            {w.type === 'client-list' && <WidgetClientList data={data} size={w.size} onSelectClient={setActiveClient} onAddClient={handleOpenAdd} onDeleteClient={handleDeleteClient} />}
                        </WidgetWrapper>
                    ))}
                </div>
            )}
            <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setIsSaving(false); }} title="新增客戶" onConfirm={handleSaveNewClient} confirmDisabled={isSaving} confirmText={isSaving ? '處理中...' : '確定'}>
                <InputField label="姓名" value={newClientData.name} onChange={e => setNewClientData({ ...newClientData, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="電話" value={newClientData.phone} onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })} />
                    <InputField label="Email" value={newClientData.email} onChange={e => setNewClientData({ ...newClientData, email: e.target.value })} />
                </div>
                <LocationField label="地址" value={newClientData.address} onChange={e => setNewClientData({ ...newClientData, address: e.target.value })} placeholder="例：台北市信義區松智路1號" />
                <div className="border-t border-gray-100 pt-4 mt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">詳細資訊 (可自訂欄位)</h4>
                    <DynamicFieldEditor fields={newClientData.customFields} onChange={(newFields) => setNewClientData({ ...newClientData, customFields: newFields })} />
                </div>
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex items-center gap-2"><Cloud size={14} /> 系統將自動於 Google Drive 建立專屬資料夾</div>
            </Modal>
        </div>
    );
};
export default Clients;
