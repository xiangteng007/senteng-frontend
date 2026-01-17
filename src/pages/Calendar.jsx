import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Clock,
    MapPin,
    FileText,
    RefreshCw,
    Check,
    AlertCircle,
    Trash2,
    Edit3,
    ExternalLink
} from 'lucide-react';
import { GoogleService } from '../services/GoogleService';

// Helper functions
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

const formatTime = (date) => {
    const d = new Date(date);
    return d.toTimeString().slice(0, 5);
};

// Event type colors
const EVENT_COLORS = {
    會議: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    現場勘查: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    截止日期: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    提醒: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    其他: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
};

// Event Modal Component
const EventModal = ({ isOpen, onClose, event, onSave, onDelete, isSaving }) => {
    const [formData, setFormData] = useState({
        title: '',
        date: formatDate(new Date()),
        time: '09:00',
        endTime: '10:00',
        type: '會議',
        location: '',
        description: ''
    });

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || '',
                date: event.date || formatDate(new Date()),
                time: event.time || '09:00',
                endTime: event.endTime || '10:00',
                type: event.type || '會議',
                location: event.location || '',
                description: event.description || ''
            });
        } else {
            setFormData({
                title: '',
                date: formatDate(new Date()),
                time: '09:00',
                endTime: '10:00',
                type: '會議',
                location: '',
                description: ''
            });
        }
    }, [event, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...event,
            ...formData
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                        {event?.id ? '編輯行程' : '新增行程'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="例：客戶會議、工地勘查"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {Object.keys(EVENT_COLORS).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">結束時間</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">地點</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="例：台北市信義區..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="額外備註..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        {event?.id && (
                            <button
                                type="button"
                                onClick={() => onDelete(event.id)}
                                className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                刪除
                            </button>
                        )}
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !formData.title}
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    儲存中...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    {event?.id ? '更新' : '建立'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Day Cell Component
const DayCell = ({ day, isCurrentMonth, isToday, events, onDayClick, onEventClick }) => {
    const dayEvents = events.filter(e => e.date === day);
    const maxVisible = 3;

    return (
        <div
            onClick={() => onDayClick(day)}
            className={`min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${!isCurrentMonth ? 'bg-gray-50/50' : ''
                } ${isToday ? 'bg-blue-50/50' : ''}`}
        >
            <div className={`text-sm font-medium mb-1 ${isToday ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center' :
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                {new Date(day).getDate()}
            </div>

            <div className="space-y-1">
                {dayEvents.slice(0, maxVisible).map(event => {
                    const colors = EVENT_COLORS[event.type] || EVENT_COLORS['其他'];
                    return (
                        <div
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                            className={`px-2 py-1 rounded text-xs font-medium truncate cursor-pointer ${colors.bg} ${colors.text} hover:opacity-80`}
                        >
                            {event.time && <span className="mr-1">{event.time.slice(0, 5)}</span>}
                            {event.title}
                        </div>
                    );
                })}
                {dayEvents.length > maxVisible && (
                    <div className="text-xs text-gray-500 px-2">+{dayEvents.length - maxVisible} 更多</div>
                )}
            </div>
        </div>
    );
};

// Main Calendar Component
const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState({ success: true, message: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Load events
    useEffect(() => {
        loadEvents();
    }, [year, month]);

    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const result = await GoogleService.fetchCalendarEvents();
            if (Array.isArray(result)) {
                setEvents(result);
            } else if (result.success && Array.isArray(result.data)) {
                setEvents(result.data);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate calendar grid
    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Previous month days
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            days.push({
                date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                isCurrentMonth: false
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                isCurrentMonth: true
            });
        }

        // Next month days
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const remainingDays = 42 - days.length;

        for (let day = 1; day <= remainingDays; day++) {
            days.push({
                date: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                isCurrentMonth: false
            });
        }

        return days;
    }, [year, month]);

    const today = formatDate(new Date());

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDayClick = (date) => {
        setSelectedEvent({ date });
        setIsModalOpen(true);
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleSaveEvent = async (eventData) => {
        setIsSaving(true);
        try {
            if (eventData.id) {
                // Update existing event
                const result = await GoogleService.updateCalendarEvent(eventData.id, eventData);
                if (result.success) {
                    setEvents(events.map(e => e.id === eventData.id ? eventData : e));
                    setSyncStatus({ success: true, message: '行程已更新並同步至 Google 日曆' });
                } else {
                    setSyncStatus({ success: false, message: result.error || '同步失敗' });
                }
            } else {
                // Create new event
                const result = await GoogleService.addToCalendar(eventData);
                if (result.success) {
                    const newEvent = {
                        ...eventData,
                        id: result.data?.eventId || `local-${Date.now()}`,
                        googleId: result.data?.eventId
                    };
                    setEvents([...events, newEvent]);
                    setSyncStatus({ success: true, message: result.warning || '行程已建立並同步至 Google 日曆' });
                } else {
                    setSyncStatus({ success: false, message: result.error || '同步失敗' });
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save event:', error);
            setSyncStatus({ success: false, message: error.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setSyncStatus({ success: true, message: '' }), 5000);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('確定要刪除這個行程嗎？')) return;

        setIsSaving(true);
        try {
            const result = await GoogleService.deleteCalendarEvent(eventId);
            if (result.success) {
                setEvents(events.filter(e => e.id !== eventId));
                setSyncStatus({ success: true, message: '行程已刪除' });
            } else {
                setSyncStatus({ success: false, message: result.error || '刪除失敗' });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to delete event:', error);
            setSyncStatus({ success: false, message: error.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setSyncStatus({ success: true, message: '' }), 5000);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        await loadEvents();
        setIsSyncing(false);
        setSyncStatus({ success: true, message: '已從 Google 日曆同步最新資料' });
        setTimeout(() => setSyncStatus({ success: true, message: '' }), 3000);
    };

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">行事曆</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <span className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
                            {year} 年 {monthNames[month]}
                        </span>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={20} className="text-gray-600" />
                        </button>
                    </div>
                    <button
                        onClick={handleToday}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        今天
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sync Status */}
                    {syncStatus.message && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${syncStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {syncStatus.success ? <Check size={16} /> : <AlertCircle size={16} />}
                            {syncStatus.message}
                        </div>
                    )}

                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                        同步
                    </button>

                    <button
                        onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={18} />
                        新增行程
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Week Header */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {weekDays.map((day, index) => (
                        <div
                            key={day}
                            className={`py-3 text-center text-sm font-semibold ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw size={24} className="animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">載入中...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-7">
                        {calendarDays.map(({ date, isCurrentMonth }) => (
                            <DayCell
                                key={date}
                                day={date}
                                isCurrentMonth={isCurrentMonth}
                                isToday={date === today}
                                events={events}
                                onDayClick={handleDayClick}
                                onEventClick={handleEventClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Event Legend */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-gray-500">行程類型：</span>
                {Object.entries(EVENT_COLORS).map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`} />
                        <span className="text-gray-600">{type}</span>
                    </div>
                ))}
            </div>

            {/* Event Modal */}
            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={selectedEvent}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                isSaving={isSaving}
            />
        </div>
    );
};

export default Calendar;
