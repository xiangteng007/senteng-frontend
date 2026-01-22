
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { WidgetWrapper } from '../components/common/WidgetWrapper';
import { WidgetDailySchedule, WidgetMemo, WidgetOverviewStats, WidgetRecentActivity } from '../components/widgets/DashboardWidgets';

// Smart greeting based on time of day
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
};

const Dashboard = ({ events, finance, projects, clients }) => {
    const { user } = useAuth();
    // Use logged in user's name, fallback to email prefix or default
    const userName = user?.name || user?.email?.split('@')[0] || "使用者";
    const greeting = getGreeting();
    const dateStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });


    const [widgets, setWidgets] = useState([
        { id: 'wd-stats', type: 'stats', title: '營運總覽', size: 'L' },
        { id: 'wd-schedule', type: 'schedule', title: '今日行程', size: 'M' },
        { id: 'wd-activity', type: 'activity', title: '最新動態', size: 'M' },
        { id: 'wd-memo', type: 'memo', title: '便利貼', size: 'S' },
        { id: 'wd-income', type: 'income_stat', title: '本月營收', size: 'S' } // Additional small stat
    ]);

    const handleResize = (id, size) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));

    // Drag and drop logic placeholder
    const handleDragStart = (e, i) => { };
    const handleDragEnter = (e, i) => { };
    const handleDragEnd = () => { };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in relative z-0">
            <div className="mb-6 sm:mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-morandi-text-primary">{greeting}，{userName}</h1>
                    <p className="text-sm sm:text-base text-morandi-text-secondary">今天是 {dateStr}</p>
                </div>
                {/* Optional: Add a quick action button here if needed */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-auto">
                {widgets.map((w, i) => (
                    <WidgetWrapper key={w.id} widget={w} onResize={handleResize}
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragEnter={(e) => handleDragEnter(e, i)}
                        onDragEnd={handleDragEnd}
                    >
                        {w.type === 'schedule' && <WidgetDailySchedule events={events} size={w.size} />}
                        {w.type === 'memo' && <WidgetMemo size={w.size} />}
                        {w.type === 'stats' && <WidgetOverviewStats finance={finance} projects={projects} clients={clients} size={w.size} />}
                        {w.type === 'income_stat' && <WidgetOverviewStats finance={finance} projects={projects} clients={clients} size="S" />}
                        {w.type === 'activity' && <WidgetRecentActivity size={w.size} />}
                    </WidgetWrapper>
                ))}
            </div>
        </div>
    );
};
export default Dashboard;
