import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NavItemConfig } from '../../config/navigation.config';
import { Tooltip } from '../ui/Tooltip';

export interface NavItemProps {
  item: NavItemConfig;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ item, isCollapsed = false, onClick }) => {
  const location = useLocation();
  const Icon = item.icon;

  // Active state: exact match or starts with path
  const isActive =
    location.pathname === item.path ||
    (item.path !== '/personal/dashboard' &&
      item.path !== '/org/overview' &&
      location.pathname.startsWith(item.path));

  const content = (
    <Link
      to={item.path}
      onClick={onClick}
      className={twMerge(
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-body font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forsythia)] group select-none',
          isActive
            ? 'bg-[var(--color-bg-surface-hover)] text-[var(--color-forsythia)] font-semibold shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)]/60',
          isCollapsed && 'justify-center px-2'
        )
      )}
    >
      <Icon
        className={clsx(
          'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
          isActive ? 'text-[var(--color-forsythia)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'
        )}
      />
      {!isCollapsed && (
        <span className="truncate flex-1">{item.label}</span>
      )}
      {!isCollapsed && item.badge && (
        <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-[var(--color-action-primary)] text-[var(--color-action-primary-text)] font-bold">
          {item.badge}
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={item.label} position="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};
