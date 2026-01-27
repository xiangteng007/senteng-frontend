import React from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    Receipt,
    Users,
    Menu
} from 'lucide-react';

/**
 * Rational Neutral Bottom Navigation
 * 
 * MOBILE ONLY (≤767px)
 * 5 核心功能快速入口
 */

const navItems = [
    { id: 'dashboard', label: '首頁', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'projects', label: '專案', icon: FolderKanban, path: '/projects' },
    { id: 'quotations', label: '報價', icon: Receipt, path: '/quotations' },
    { id: 'clients', label: '客戶', icon: Users, path: '/clients' },
    { id: 'menu', label: '更多', icon: Menu, path: null }, // Opens sidebar
];

export const BottomNav = ({
    currentPath = '/dashboard',
    onNavigate,
    onMenuClick
}) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-rn-border safe-area-pb mobile:block hidden">
            <div className="flex items-center justify-around h-14">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;
                    const isMenu = item.id === 'menu';

                    return (
                        <button
                            key={item.id}
                            onClick={() => isMenu ? onMenuClick?.() : onNavigate?.(item.path)}
                            className={`
                                flex flex-col items-center justify-center
                                w-full h-full gap-0.5
                                transition-colors duration-200
                                ${isActive
                                    ? 'text-rn-text-primary'
                                    : 'text-rn-text-muted'
                                }
                            `}
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.2 : 1.8}
                            />
                            <span className={`
                                text-[10px] font-medium
                                ${isActive ? 'text-rn-text-primary' : 'text-rn-text-muted'}
                            `}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-rn-text-primary" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
