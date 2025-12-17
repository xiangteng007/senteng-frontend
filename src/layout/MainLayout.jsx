
import React from 'react';
import { Calendar as CalendarIcon, Briefcase, Users, Wallet, HardHat, Package, Bell, LayoutDashboard, Image as ImageIcon } from 'lucide-react';

const SidebarItem = ({ id, icon: Icon, label, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300
      ${active
                ? 'bg-morandi-text-accent text-white shadow-lg shadow-gray-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-morandi-text-accent'
            }
    `}
    >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className={`font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
);

export const MainLayout = ({ activeTab, setActiveTab, children }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: '儀表板' },
        { id: 'schedule', icon: CalendarIcon, label: '行程管理' },
        { id: 'projects', icon: Briefcase, label: '專案管理' },
        { id: 'clients', icon: Users, label: '客戶管理' },
        { id: 'finance', icon: Wallet, label: '財務管理' },
        { id: 'vendors', icon: HardHat, label: '廠商管理' },
        { id: 'inventory', icon: Package, label: '庫存管理' },
        { id: 'materials', icon: ImageIcon, label: '材質圖庫' },
    ];

    return (
        <div className="flex h-screen bg-morandi-base font-sans text-gray-900 overflow-hidden">
            <aside className="w-68 bg-white/80 backdrop-blur-md border-r border-white/50 flex flex-col z-20 shadow-glass">
                <div className="p-8">
                    <h1 className="text-xl font-bold flex items-center gap-3 text-morandi-text-primary tracking-wide">
                        <div className="w-10 h-10 bg-morandi-text-accent rounded-xl flex items-center justify-center text-white font-serif text-lg shadow-lg">S</div>
                        SENTENG.CO
                    </h1>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map(item => (
                        <SidebarItem
                            key={item.id}
                            {...item}
                            active={activeTab === item.id}
                            onClick={setActiveTab}
                        />
                    ))}
                </nav>
                <div className="p-6 text-xs text-gray-400 text-center">v3.1.0 Morandi Build</div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-20 flex items-center justify-between px-8 z-10">
                    <div>
                        {/* Breadcrumb or Title handled by page usually, but we show simple one here */}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm hover:shadow transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-400 rounded-full border border-white"></span>
                        </button>
                        <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-gray-600">A</div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-8 pt-0 scroll-smooth">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
