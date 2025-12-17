
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';

const Schedule = ({ data = [], addToast }) => {
    const [currentDate, setCurrentDate] = useState(new Date("2025-12-07"));
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "10:00", type: "meeting", description: "", location: "" });
    const [isSaving, setIsSaving] = useState(false);

    const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = Array(firstDay).fill(null).concat([...Array(daysInMonth).keys()].map(i => i + 1));

    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.date) {
            return addToast("請填寫標題和日期", 'error');
        }

        setIsSaving(true);
        const result = await GoogleService.addToCalendar(newEvent);
        setIsSaving(false);

        if (result.success) {
            addToast(`行程「${newEvent.title}」已新增至 Google Calendar`, 'success');
            setNewEvent({ title: "", date: "", time: "10:00", type: "meeting", description: "", location: "" });
        } else {
            addToast(`行程建立失敗: ${result.error}`, 'error');
        }

        setIsAddModalOpen(false);
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
                    <span className="text-lg font-bold text-gray-800 w-32 text-center select-none">{currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月</span>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight size={20} /></button>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-morandi-text-accent text-white px-4 py-2 rounded-xl text-sm hover:shadow-lg transition-all">+ 新增行程</button>
            </div>

            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                    {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="py-4 text-center text-sm font-bold text-gray-400">{d}</div>)}
                </div>
                <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                    {days.map((day, idx) => {
                        const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                        const events = data.filter(e => e.date === dateStr);
                        return (
                            <div key={idx} className={`border-b border-r border-gray-50 p-2 min-h-[100px] transition-colors ${!day ? 'bg-gray-50/20' : 'hover:bg-gray-50'}`}>
                                {day && (
                                    <>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm mb-1 ${events.length > 0 ? 'bg-morandi-text-accent text-white font-bold shadow-md' : 'text-gray-500'}`}>{day}</div>
                                        <div className="space-y-1">
                                            {events.map(evt => (
                                                <div key={evt.id} className={`text-[10px] px-2 py-1 rounded-lg border truncate cursor-pointer bg-morandi-blue-100/50 text-morandi-blue-600 border-morandi-blue-100 hover:bg-morandi-blue-100`}>
                                                    {evt.time} {evt.title}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setIsSaving(false); }} title="新增行程" onConfirm={handleAddEvent} confirmDisabled={isSaving} confirmText={isSaving ? '處理中...' : '確定'}>
                <InputField label="標題" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="例：客戶會議" />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="日期" type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                    <InputField label="時間" type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} />
                </div>
                <InputField label="地點" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="例：公司會議室" />
                <InputField label="描述" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="備註..." />
            </Modal>
        </div>
    );
};
export default Schedule;
