import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NavItemConfig } from '../../config/navigation.config';
import { NavItem } from './NavItem';
import { DropdownMenu } from '../ui/DropdownMenu';
import { useNavigate } from 'react-router-dom';

export interface NavItemGroupProps {
  item: NavItemConfig;
  isCollapsed?: boolean;
  onChildClick?: () => void;
}

export const NavItemGroup: React.FC<NavItemGroupProps> = ({
  item,
  isCollapsed = false,
  onChildClick,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const Icon = item.icon;

  const isChildActive = item.children?.some(
    (child) => location.pathname === child.path || location.pathname.startsWith(child.path)
  );

  const [isOpen, setIsOpen] = useState<boolean>(isChildActive || false);

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  // When collapsed on desktop, render as a DropdownMenu trigger
  if (isCollapsed) {
    const dropdownItems = (item.children || []).map((child) => ({
      id: child.id,
      label: child.label,
      icon: <child.icon className="w-4 h-4" />,
      onClick: () => {
        navigate(child.path);
        onChildClick?.();
      },
    }));

    return (
      <DropdownMenu
        align="right"
        items={dropdownItems}
        trigger={
          <div
            className={clsx(
              'flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] text-sm font-body font-medium transition-all duration-200 cursor-pointer select-none',
              isChildActive
                ? 'bg-[var(--color-bg-surface-hover)] text-[var(--color-forsythia)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)]/60'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={twMerge(
          clsx(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-body font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forsythia)] group select-none',
            isChildActive
              ? 'text-[var(--color-forsythia)] font-semibold'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)]/60'
          )
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={clsx(
              'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
              isChildActive ? 'text-[var(--color-forsythia)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'
            )}
          />
          <span className="truncate">{item.label}</span>
        </div>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180 text-[var(--color-text-primary)]'
          )}
        />
      </button>

      {isOpen && item.children && (
        <div className="pl-4 pr-1 flex flex-col gap-1 border-l border-[var(--color-border-subtle)] ml-4.5 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {item.children.map((child) => (
            <NavItem key={child.id} item={child} onClick={onChildClick} />
          ))}
        </div>
      )}
    </div>
  );
};
