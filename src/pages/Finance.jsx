
import React, { useState, useRef } from 'react';
import { WidgetWrapper } from '../components/common/WidgetWrapper';
import { WidgetFinanceAccounts, WidgetFinanceTrend, WidgetFinanceTransactions } from '../components/widgets/FinanceWidgets';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import { SectionTitle } from '../components/common/Indicators';
import { Plus } from 'lucide-react';

const Finance = ({ data, loading, addToast, onAddTx, onUpdateAccounts }) => {
    const [accounts, setAccounts] = useState(data.accounts || []);
    const [widgets, setWidgets] = useState([
        { id: 'wf-acc', type: 'finance-acc', title: '資金帳戶', size: 'L' },
        { id: 'wf-trend', type: 'finance-trend', title: '收支趨勢', size: 'M' },
        { id: 'wf-tx', type: 'finance-tx', title: '收支明細', size: 'L' }
    ]);

    // Transaction Modal State
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [newTx, setNewTx] = useState({ type: "支出", amount: "", date: "", desc: "", accountId: "" });

    // Account Modal State
    const [isAccModalOpen, setIsAccModalOpen] = useState(false);
    const [editingAcc, setEditingAcc] = useState(null);
    const [newAcc, setNewAcc] = useState({ name: "", bank: "", number: "", balance: 0 });

    // Drag Refs
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const handleResize = (id, size) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));

    // Widget Drag Sorting
    const handleDragStart = (e, idx) => { dragItem.current = idx; };
    const handleDragEnter = (e, idx) => {
        dragOverItem.current = idx;
        const copy = [...widgets]; const dragContent = copy[dragItem.current];
        copy.splice(dragItem.current, 1); copy.splice(dragOverItem.current, 0, dragContent);
        dragItem.current = idx; setWidgets(copy);
    };
    const handleDragEnd = () => { dragItem.current = null; dragOverItem.current = null; };

    // Account Drag Sorting
    const handleDragStartAccount = (e, idx) => { dragItem.current = idx; };
    const handleDragOverAccount = (e, idx) => {
        e.preventDefault();
        dragOverItem.current = idx;
        const copy = [...accounts]; const item = copy[dragItem.current];
        copy.splice(dragItem.current, 1); copy.splice(dragOverItem.current, 0, item);
        dragItem.current = idx;
        setAccounts(copy);
    };
    const handleDragEndAccount = () => {
        dragItem.current = null; dragOverItem.current = null;
        onUpdateAccounts(accounts);
        // GoogleService.syncToSheet('accounts', accounts); // TODO: Implement sync
    };

    // Account CRUD
    const openAddAcc = () => { setEditingAcc(null); setNewAcc({ name: "", bank: "", number: "", balance: 0 }); setIsAccModalOpen(true); };
    const openEditAcc = (acc) => { setEditingAcc(acc); setNewAcc(acc); setIsAccModalOpen(true); };

    const handleSaveAccount = async () => {
        const updatedAccounts = editingAcc
            ? accounts.map(a => a.id === editingAcc.id ? { ...editingAcc, ...newAcc } : a)
            : [...accounts, { ...newAcc, id: `a-${Date.now()}` }];

        setAccounts(updatedAccounts);
        onUpdateAccounts(updatedAccounts); // Update App State
        // await GoogleService.syncToSheet('accounts', updatedAccounts); // TODO: Implement sync

        addToast(editingAcc ? "帳戶更新成功！" : "新帳戶建立成功！", 'success');
        setIsAccModalOpen(false);
        setEditingAcc(null);
    };

    const handleConfirmTx = async () => {
        onAddTx(newTx); // Handles App State update and Toast inside App.jsx
        setIsTxModalOpen(false);
        setNewTx({ type: "支出", amount: "", date: "", desc: "", accountId: "" });
        // await GoogleService.syncToSheet('transactions', newTx); // TODO: Implement sync
    };

    const renderWidget = (w) => {
        switch (w.type) {
            case 'finance-acc':
                return (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-end mb-2">
                            <button onClick={openAddAcc} className="text-xs text-morandi-blue-600 hover:underline flex items-center gap-1"><Plus size={12} /> 新增帳戶</button>
                        </div>
                        <WidgetFinanceAccounts
                            data={accounts}
                            size={w.size}
                            onEdit={openEditAcc}
                            onDragStartAccount={handleDragStartAccount}
                            onDragOverAccount={handleDragOverAccount}
                            onDragEndAccount={handleDragEndAccount}
                        />
                    </div>
                );
            case 'finance-trend': return <WidgetFinanceTrend size={w.size} />;
            case 'finance-tx': return <WidgetFinanceTransactions data={data.transactions} size={w.size} onAddTx={() => setIsTxModalOpen(true)} />;
            default: return null;
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <SectionTitle title="財務管理" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-auto">
                {widgets.map((w, i) => (
                    <WidgetWrapper key={w.id} widget={w} onResize={handleResize} onDragStart={(e) => handleDragStart(e, i)} onDragEnter={(e) => handleDragEnter(e, i)} onDragEnd={handleDragEnd}>
                        {renderWidget(w)}
                    </WidgetWrapper>
                ))}
            </div>

            {/* Transaction Modal */}
            <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title="新增收支紀錄" onConfirm={handleConfirmTx}>
                <div className="flex gap-4 mb-6 bg-gray-50 p-1 rounded-xl">
                    <button onClick={() => setNewTx({ ...newTx, type: '收入' })} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTx.type === '收入' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}>收入</button>
                    <button onClick={() => setNewTx({ ...newTx, type: '支出' })} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTx.type === '支出' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>支出</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="金額" type="number" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} />
                    <InputField label="日期" type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })} />
                </div>
                <InputField label="摘要" value={newTx.desc} onChange={e => setNewTx({ ...newTx, desc: e.target.value })} placeholder="例：油漆補料" />
                <InputField label="帳戶" type="select" value={newTx.accountId} onChange={e => setNewTx({ ...newTx, accountId: e.target.value })} options={accounts.map(a => a.name)} />
            </Modal>

            {/* Account Modal */}
            <Modal isOpen={isAccModalOpen} onClose={() => setIsAccModalOpen(false)} title={editingAcc ? "編輯帳戶" : "新增帳戶"} onConfirm={handleSaveAccount}>
                <InputField label="帳戶名稱" value={newAcc.name} onChange={e => setNewAcc({ ...newAcc, name: e.target.value })} placeholder="例：公司零用金" />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="銀行/機構" value={newAcc.bank} onChange={e => setNewAcc({ ...newAcc, bank: e.target.value })} />
                    <InputField label="帳號 (選填)" value={newAcc.number} onChange={e => setNewAcc({ ...newAcc, number: e.target.value })} />
                </div>
                <InputField label="初始餘額" type="number" value={newAcc.balance} onChange={e => setNewAcc({ ...newAcc, balance: Number(e.target.value) })} />
            </Modal>
        </div>
    );
};
export default Finance;
