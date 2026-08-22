import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSidebar } from '../../context/SidebarContext';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { IconButton } from '../ui/IconButton';
import { Avatar } from '../ui/Avatar';
import { DropdownMenu } from '../ui/DropdownMenu';
import { PortalSwitcher } from './PortalSwitcher';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { toggleMobileSidebar, isCollapsed } = useSidebar();
  const { activePortal } = usePortal();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const userMenuItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => console.log('Profile clicked'),
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => console.log('Settings clicked'),
    },
    {
      id: 'help',
      label: 'Help & Documentation',
      icon: <HelpCircle className="w-4 h-4" />,
      onClick: () => console.log('Help clicked'),
    },
    {
      id: 'logout',
      label: 'Log out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      className={twMerge(
        clsx(
          'fixed top-0 right-0 z-30 h-16 bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] px-4 flex items-center justify-between transition-all duration-300 ease-in-out',
          isCollapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-64'
        )
      )}
    >
      {/* Left Section: Mobile Drawer Button & Prominent Portal Switcher */}
      <div className="flex items-center gap-3">
        <div className="block lg:hidden">
          <IconButton
            aria-label="Toggle navigation drawer"
            variant="ghost"
            size="md"
            onClick={toggleMobileSidebar}
          >
            <Menu className="w-5 h-5 text-[var(--color-text-primary)]" />
          </IconButton>
        </div>

        {/* Unified Portal Switcher */}
        <PortalSwitcher />
      </div>

      {/* Center Section: Global Search Placeholder */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 absolute left-3 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search courses, skills, tools..."
            readOnly
            className="w-full bg-[var(--color-oceanic-noir)] text-[var(--color-text-primary)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] pl-9 pr-12 py-2 cursor-pointer hover:border-[var(--color-forsythia)] transition-all duration-200 focus:outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <IconButton aria-label="Notifications" variant="ghost" size="md">
            <Bell className="w-5 h-5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" />
          </IconButton>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-forsythia)] ring-2 ring-[var(--color-bg-surface)]" />
        </div>

        <div className="h-6 w-px bg-[var(--color-border-subtle)] hidden sm:block" />

        <DropdownMenu
          align="right"
          items={userMenuItems}
          trigger={
            <button className="flex items-center gap-2.5 p-1 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-surface-hover)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forsythia)]">
              <Avatar name={user?.fullName || 'User'} size="sm" />
              <div className="hidden sm:flex flex-col text-left font-body leading-none">
                <span className="text-xs font-semibold text-[var(--color-arctic-powder)] truncate max-w-[120px]">
                  {user?.fullName || 'Bhavika Reddy'}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                  {user?.role ? user.role.replace('_', ' ').toUpperCase() : activePortal === 'personal' ? 'Student' : 'Org Admin'}
                </span>
              </div>
            </button>
          }
        />
      </div>
    </header>
  );
};
