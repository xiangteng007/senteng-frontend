import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

/**
 * Rational Neutral Layout Component v1.3
 * 
 * RWD MASTER LAYOUT:
 * - Desktop (>=1280px): Sidebar 240px visible
 * - Tablet (768-1279px): Sidebar collapsed/overlay
 * - Mobile (<=767px): No sidebar, bottom nav
 */

export const Layout = ({
    children,
    currentPath = '/dashboard',
    onNavigate,
    title = '',
    user = null,
    onSignOut,
    menuItems = []
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [breakpoint, setBreakpoint] = useState('desktop');

    // Detect breakpoint
    useEffect(() => {
        const checkBreakpoint = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setBreakpoint('mobile');
            } else if (width < 1280) {
                setBreakpoint('tablet');
            } else {
                setBreakpoint('desktop');
            }
        };

        checkBreakpoint();
        window.addEventListener('resize', checkBreakpoint);
        return () => window.removeEventListener('resize', checkBreakpoint);
    }, []);

    // Close sidebar on route change (mobile/tablet)
    useEffect(() => {
        if (breakpoint !== 'desktop') {
            setSidebarOpen(false);
        }
    }, [currentPath, breakpoint]);

    const handleNavigate = (path) => {
        onNavigate?.(path);
        if (breakpoint !== 'desktop') {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-rn-bg-primary">
            {/* Sidebar - Hidden on mobile, overlay on tablet, fixed on desktop */}
            {breakpoint !== 'mobile' && (
                <Sidebar
                    isOpen={breakpoint === 'desktop' || sidebarOpen}
                    currentPath={currentPath}
                    onNavigate={handleNavigate}
                    onClose={() => setSidebarOpen(false)}
                    user={user}
                    onSignOut={onSignOut}
                    menuItems={menuItems}
                    breakpoint={breakpoint}
                />
            )}

            {/* Sidebar Overlay (Tablet) */}
            {breakpoint === 'tablet' && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className={`
                min-h-screen transition-all duration-200
                ${breakpoint === 'desktop' ? 'ml-60' : 'ml-0'}
                ${breakpoint === 'mobile' ? 'pb-16' : ''}
            `}>
                {/* TopBar */}
                <TopBar
                    title={title}
                    user={user}
                    showMenuButton={breakpoint !== 'desktop'}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                {/* Page Content */}
                <div className="p-4 lg:p-6 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation - Mobile Only */}
            {breakpoint === 'mobile' && (
                <BottomNav
                    currentPath={currentPath}
                    onNavigate={handleNavigate}
                    onMenuClick={() => setSidebarOpen(true)}
                />
            )}
        </div>
    );
};

export default Layout;
