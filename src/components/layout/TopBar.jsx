import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

/**
 * Rational Neutral TopBar Component
 *
 * DESIGN: Subtle blur backdrop, hairline border
 * RWD: Shows hamburger menu on mobile/tablet
 */

export const TopBar = ({ title, showMenuButton = false, onMenuClick, children, actions }) => {
  return (
    <header className="topbar-rn h-14 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={20} className="text-rn-text-primary" />
          </button>
        )}

        {title && <h1 className="font-semibold text-rn-text-primary text-lg">{title}</h1>}
      </div>

      {/* Center Section - Search (optional) */}
      {children}

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {actions || (
          <>
            <SearchButton />
            <NotificationButton />
            <ProfileButton />
          </>
        )}
      </div>
    </header>
  );
};

const SearchButton = () => (
  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex">
    <Search size={18} className="text-rn-text-secondary" />
  </button>
);

const NotificationButton = ({ count = 0 }) => (
  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
    <Bell size={18} className="text-rn-text-secondary" />
    {count > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-rn-bg-dark rounded-full" />}
  </button>
);

const ProfileButton = () => (
  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
      <User size={16} className="text-rn-text-secondary" />
    </div>
  </button>
);

export default TopBar;
