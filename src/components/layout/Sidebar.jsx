import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    Calculator,
    Users,
    Building2,
    Receipt,
    PieChart,
    Package,
    Settings,
    Menu,
    X,
    ChevronLeft
} from 'lucide-react';

/**
 * Rational Neutral Sidebar Component
 * 
 * RWD BEHAVIOR:
 * - Desktop (�?280px): Persistent sidebar, 240px width
 * - Tablet (768-1279px): Collapsed sidebar, 64px (icons only)
 * - Mobile (�?67px): Overlay drawer, full height
 */

const navItems = [
    { id: 'dashboard', label: '儀表板', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'projects', label: '專案管理', icon: FolderKanban, path: '/projects' },
    { id: 'contracts', label: '合約管理', icon: FileText, path: '/contracts' },
    { id: 'quotations', label: '報價�?, icon: Receipt, path: '/quotations' },
    { id: 'calculator', label: '物料估算', icon: Calculator, path: '/calculator' },
    { id: 'vendors', label: '廠商管理', icon: Building2, path: '/vendors' },
    { id: 'clients', label: '客戶管理', icon: Users, path: '/clients' },
    { id: 'inventory', label: '庫存管理', icon: Package, path: '/inventory' },
    { id: 'finance', label: '財務總覽', icon: PieChart, path: '/finance' },
    { id: 'settings', label: '系統設定', icon: Settings, path: '/settings' },
];

export const Sidebar = ({
    currentPath = '/dashboard',
    onNavigate,
    isOpen = true,
    onToggle,
    collapsed = false,
    onCollapse
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const checkBreakpoint = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
        };

        checkBreakpoint();
        window.addEventListener('resize', checkBreakpoint);
        return () => window.removeEventListener('resize', checkBreakpoint);
    }, []);

    // Mobile: Overlay drawer
    if (isMobile) {
        return (
            <>
                {/* Backdrop */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
                        onClick={onToggle}
                    />
                )}

                {/* Drawer */}
                <aside className={`
                    fixed top-0 left-0 h-full w-72 z-50
                    bg-rn-surface-dark text-white
                    transform transition-transform duration-300 ease-smooth
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <SidebarContent
                        items={navItems}
                        currentPath={currentPath}
                        onNavigate={(path) => {
                            onNavigate?.(path);
                            onToggle?.();
                        }}
                        collapsed={false}
                        showClose
                        onClose={onToggle}
                    />
                </aside>
            </>
        );
    }

    // Desktop/Tablet: Persistent sidebar
    const sidebarWidth = collapsed || isTablet ? 'w-16' : 'w-60';

    return (
        <aside className={`
            fixed top-0 left-0 h-full z-30
            ${sidebarWidth}
            bg-rn-surface-dark text-white
            transition-all duration-200 ease-smooth
        `}>
            <SidebarContent
                items={navItems}
                currentPath={currentPath}
                onNavigate={onNavigate}
                collapsed={collapsed || isTablet}
                onCollapse={onCollapse}
            />
        </aside>
    );
};

const SidebarContent = ({
    items,
    currentPath,
    onNavigate,
    collapsed,
    showClose,
    onClose,
    onCollapse
}) => (
    <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`
            flex items-center h-16 px-4 border-b border-white/10
            ${collapsed ? 'justify-center' : 'justify-between'}
        `}>
            {!collapsed && (
                <span className="font-bold text-lg tracking-tight">
                    森騰 SENTENG
                </span>
            )}
            {showClose && (
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            )}
            {!showClose && !collapsed && onCollapse && (
                <button
                    onClick={onCollapse}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
            )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate?.(item.path)}
                        title={collapsed ? item.label : undefined}
                        className={`
                            w-full flex items-center gap-3 
                            ${collapsed ? 'justify-center px-2' : 'px-3'} 
                            py-2.5 rounded-lg
                            transition-all duration-200
                            ${isActive
                                ? 'bg-white/15 text-white'
                                : 'text-white/70 hover:text-white hover:bg-white/8'
                            }
                        `}
                    >
                        <Icon size={20} strokeWidth={1.8} />
                        {!collapsed && (
                            <span className="text-sm font-medium">{item.label}</span>
                        )}
                    </button>
                );
            })}
        </nav>

        {/* Footer */}
        <div className={`
            p-4 border-t border-white/10
            ${collapsed ? 'text-center' : ''}
        `}>
            <div className={`
                ${collapsed ? 'w-8 h-8 mx-auto' : 'w-9 h-9'}
                rounded-full bg-white/20 flex items-center justify-center
                text-xs font-medium
            `}>
                {collapsed ? 'U' : 'User'}
            </div>
        </div>
    </div>
);

export default Sidebar;
