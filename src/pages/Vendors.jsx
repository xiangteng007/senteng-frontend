
import React, { useState, useEffect } from 'react';
import { WidgetWrapper } from '../components/common/WidgetWrapper';
import { WidgetVendorStats, WidgetVendorList } from '../components/widgets/ClientVendorWidgets';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import { SectionTitle } from '../components/common/Indicators';
import { GoogleService } from '../services/GoogleService';
import { LoadingButton } from '../components/common/LoadingButton';

const Vendors = ({ data, loading, addToast }) => {
    const [widgets, setWidgets] = useState([
        { id: 'wv-stats', type: 'vendor-stats', title: '廠商概況', size: 'S' },
        { id: 'wv-list', type: 'vendor-list', title: '廠商名單', size: 'L' }
    ]);
    const [vendorsList, setVendorsList] = useState(data);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVendor, setCurrentVendor] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { setVendorsList(data); }, [data]);

    const handleResize = (id, size) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));

    const handleOpenAdd = () => {
        setCurrentVendor({ name: "", category: "工程工班", tradeType: "", contactPerson: "", phone: "", address: "", rating: "5.0", status: "合作中", tags: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (vendor) => {
        setCurrentVendor({ ...vendor, tags: vendor.tags ? vendor.tags.join(', ') : "" });
        setIsModalOpen(true);
    };

    const handleSaveVendor = async () => {
        if (!currentVendor.name) return addToast("請輸入廠商名稱", 'error');

        setIsSaving(true);
        const tagsArray = typeof currentVendor.tags === 'string' ? currentVendor.tags.split(',').map(t => t.trim()).filter(t => t !== "") : currentVendor.tags;
        const vendorToSave = { ...currentVendor, tags: tagsArray, id: currentVendor.id || `v-${Date.now()}` };

        let driveResult = null;

        // If New Vendor, create Google Drive folder
        if (!currentVendor.id) {
            driveResult = await GoogleService.createDriveFolder(currentVendor.name);
            if (!driveResult.success) {
                setIsSaving(false);
                return addToast(`Drive 資料夾建立失敗: ${driveResult.error}`, 'error');
            }
            vendorToSave.driveFolder = driveResult.url;
        }

        const newVendorsList = currentVendor.id ? vendorsList.map(v => v.id === vendorToSave.id ? vendorToSave : v) : [...vendorsList, vendorToSave];
        setVendorsList(newVendorsList);

        const syncResult = await GoogleService.syncToSheet('vendors', newVendorsList);
        setIsSaving(false);

        if (!syncResult.success) {
            addToast(`Sheets 同步失敗: ${syncResult.error}`, 'error');
        } else if (currentVendor.id) {
            addToast("廠商資料已更新！", 'success');
        } else {
            addToast("新廠商已建立！已同步到 Google Drive 和 Sheets", 'success', {
                action: driveResult?.url ? {
                    label: '開啟 Drive 資料夾',
                    onClick: () => window.open(driveResult.url, '_blank')
                } : null
            });
        }

        setIsModalOpen(false);
    };

    const handleDeleteVendor = async (id) => {
        const updatedList = vendorsList.filter(v => v.id !== id);
        setVendorsList(updatedList);
        await GoogleService.syncToSheet('vendors', updatedList);
        addToast("廠商已刪除！", 'success');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <SectionTitle title="廠商管理" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
                {widgets.map((w, i) => (
                    <WidgetWrapper key={w.id} widget={w} onResize={handleResize}>
                        {w.type === 'vendor-stats' && <WidgetVendorStats data={vendorsList} size={w.size} />}
                        {w.type === 'vendor-list' && <WidgetVendorList data={vendorsList} size={w.size} onAdd={handleOpenAdd} onEdit={handleOpenEdit} onDelete={handleDeleteVendor} />}
                    </WidgetWrapper>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsSaving(false); }} title={currentVendor?.id ? "編輯廠商資料" : "新增廠商"} onConfirm={handleSaveVendor} confirmDisabled={isSaving} confirmText={isSaving ? '處理中...' : '確定'}>
                {currentVendor && (
                    <>
                        <InputField label="廠商名稱" value={currentVendor.name} onChange={e => setCurrentVendor({ ...currentVendor, name: e.target.value })} placeholder="例：大師兄木工" />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="類別" type="select" value={currentVendor.category} onChange={e => setCurrentVendor({ ...currentVendor, category: e.target.value })} options={['工程工班', '建材供應', '其他']} />
                            <InputField label="工種/項目" value={currentVendor.tradeType} onChange={e => setCurrentVendor({ ...currentVendor, tradeType: e.target.value })} placeholder="例：木工、水電" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="聯絡人" value={currentVendor.contactPerson} onChange={e => setCurrentVendor({ ...currentVendor, contactPerson: e.target.value })} />
                            <InputField label="電話" value={currentVendor.phone} onChange={e => setCurrentVendor({ ...currentVendor, phone: e.target.value })} />
                        </div>
                        <InputField label="地址" value={currentVendor.address} onChange={e => setCurrentVendor({ ...currentVendor, address: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="評分 (1-5)" type="number" value={currentVendor.rating} onChange={e => setCurrentVendor({ ...currentVendor, rating: e.target.value })} />
                            <InputField label="合作狀態" type="select" value={currentVendor.status} onChange={e => setCurrentVendor({ ...currentVendor, status: e.target.value })} options={['長期合作', '合作中', '觀察中', '黑名單']} />
                        </div>
                        <InputField label="標籤 (以逗號分隔)" value={currentVendor.tags} onChange={e => setCurrentVendor({ ...currentVendor, tags: e.target.value })} placeholder="例：配合度高, 手工細緻" />
                    </>
                )}
            </Modal>
        </div>
    );
};
export default Vendors;
