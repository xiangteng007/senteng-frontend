
import React, { useState } from 'react';
import { WidgetWrapper } from '../components/common/WidgetWrapper';
import { WidgetProjectStats, WidgetProjectList, WidgetProjectInfo, WidgetProjectFiles } from '../components/widgets/ProjectWidgets';
// Adding missing exports directly here for now to avoid re-editing ProjectWidgets check
import { Plus, ChevronLeft, Calendar as CalendarIcon, Upload, ImageIcon } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import { ProgressBar } from '../components/common/Indicators';

// --- Missing Detail Widgets (Implementing inline for safety) ---
const WidgetProjectRecords = ({ records, size, onAddRecord }) => (
    <div className="flex flex-col h-full">
        <div className="flex justify-between mb-3 items-center"><h4 className="text-xs font-bold text-gray-600">工程/會議紀錄</h4><button onClick={onAddRecord} className="text-morandi-blue-600 hover:bg-morandi-blue-50 p-1.5 rounded-lg transition-colors"><Plus size={14} /></button></div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {records.map(r => (
                <div key={r.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-morandi-blue-200 transition-colors">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>{r.date} · {r.type}</span><span>{r.author}</span></div>
                    <div className="text-xs text-gray-800 mb-2 leading-relaxed">{r.content}</div>
                    {r.photos && r.photos.length > 0 && (<div className="flex gap-2 overflow-x-auto pb-1">{r.photos.map((p, idx) => (<div key={idx} className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0"><ImageIcon size={14} className="text-gray-400" /></div>))}</div>)}
                </div>
            ))}
        </div>
    </div>
);

const WidgetProjectFinanceDetail = ({ transactions, size, onAddTx }) => {
    const income = transactions.filter(t => t.type === '收入').reduce((acc, c) => acc + c.amount, 0); const expense = transactions.filter(t => t.type === '支出').reduce((acc, c) => acc + c.amount, 0);
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between mb-2 p-2 bg-gray-50 rounded-xl">
                <div className="text-xs"><span className="text-gray-500">收</span> <span className="text-green-600 font-bold ml-1">{income}</span></div>
                <div className="text-xs"><span className="text-gray-500">支</span> <span className="text-red-600 font-bold ml-1">{expense}</span></div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {transactions.map(t => (
                    <div key={t.id} className="flex justify-between text-xs border-b border-gray-50 pb-2 last:border-0 hover:bg-gray-50 p-1 rounded">
                        <span className="truncate w-2/3 text-gray-700">{t.desc}</span>
                        <span className={`font-bold ${t.type === '收入' ? 'text-green-600' : 'text-red-500'}`}>{t.amount}</span>
                    </div>
                ))}
            </div>
            <button onClick={onAddTx} className="mt-2 w-full py-1.5 text-xs bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">新增收支</button>
        </div>
    )
}

const Projects = ({ data, loading, addToast, onSelectProject, activeProject, setActiveProject, onUpdateProject, allTransactions, onAddGlobalTx, accounts }) => {

    // List View State
    const [listWidgets, setListWidgets] = useState([{ id: 'wp-stats', type: 'project-stats', title: '專案概況', size: 'S' }, { id: 'wp-list', type: 'project-list', title: '專案列表', size: 'L' }]);

    // Detail View State
    const [detailWidgets, setDetailWidgets] = useState([
        { id: 'wp-info', type: 'info', title: '基本資訊', size: 'S' },
        { id: 'wp-finance', type: 'finance', title: '專案收支', size: 'M' },
        { id: 'wp-records', type: 'records', title: '工程紀錄', size: 'L' },
        { id: 'wp-files', type: 'files', title: '檔案中心', size: 'M' },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", client: "", type: "翻修", budget: "" });

    // Detail Modals
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({ type: '工程', content: '', photos: [] });

    const handleResize = (widgets, setWidgets) => (id, size) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));

    if (activeProject) {
        const projectTx = allTransactions.filter(t => t.projectId === activeProject.id);

        return (
            <div className="space-y-6 animate-fade-in pb-10">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setActiveProject(null)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm text-gray-500"><ChevronLeft size={24} /></button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{activeProject.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-mono bg-gray-100 px-1.5 rounded">{activeProject.code}</span>
                            <span>·</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs text-white ${activeProject.status === '施工中' ? 'bg-morandi-orange-500' : 'bg-morandi-blue-500'}`}>{activeProject.status}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
                    {detailWidgets.map((w, i) => (
                        <WidgetWrapper key={w.id} widget={w} onResize={handleResize(detailWidgets, setDetailWidgets)}>
                            {w.type === 'info' && <WidgetProjectInfo project={activeProject} size={w.size} />}
                            {/* Reuse Widgets */}
                            {w.type === 'files' && <WidgetProjectFiles files={activeProject.files} size={w.size} onUpload={() => { }} />}
                            {w.type === 'records' && <WidgetProjectRecords records={activeProject.records} size={w.size} onAddRecord={() => setIsRecordModalOpen(true)} />}
                            {w.type === 'finance' && <WidgetProjectFinanceDetail transactions={projectTx} size={w.size} onAddTx={() => { }} />}
                        </WidgetWrapper>
                    ))}
                </div>

                <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="新增紀錄" onConfirm={() => {
                    // Mock Implementation
                    const record = { id: `r-${Date.now()}`, date: new Date().toISOString().split('T')[0], author: 'Alex', ...newRecord };
                    onUpdateProject({ ...activeProject, records: [record, ...(activeProject.records || [])] });
                    setIsRecordModalOpen(false);
                }}>
                    <InputField label="內容" type="textarea" value={newRecord.content} onChange={e => setNewRecord({ ...newRecord, content: e.target.value })} />
                </Modal>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-morandi-text-primary">專案管理</h1>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-morandi-text-accent text-white px-4 py-2 rounded-xl text-sm transition-all hover:bg-gray-700">+ 新增專案</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
                {listWidgets.map((w, i) => (
                    <WidgetWrapper key={w.id} widget={w} onResize={handleResize(listWidgets, setListWidgets)}>
                        {w.type === 'project-stats' && <WidgetProjectStats data={data} size={w.size} />}
                        {w.type === 'project-list' && <WidgetProjectList data={data} size={w.size} onSelectProject={setActiveProject} onAdd={() => setIsAddModalOpen(true)} />}
                    </WidgetWrapper>
                ))}
            </div>
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="建立新專案" onConfirm={() => setIsAddModalOpen(false)}>
                <InputField label="專案名稱" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
                <InputField label="預算" value={newProject.budget} onChange={e => setNewProject({ ...newProject, budget: e.target.value })} />
            </Modal>
        </div>
    );
};

export default Projects;
