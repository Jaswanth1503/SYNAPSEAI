import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Sparkles, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSidebar } from '../../context/SidebarContext';
import { usePortal } from '../../context/PortalContext';
import { SidebarNav } from './SidebarNav';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';

export const Sidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const { portalConfig, activePortal } = usePortal();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--color-oceanic-noir)]/80 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={twMerge(
          clsx(
            'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] transition-all duration-300 ease-in-out',
            // Desktop Widths
            isCollapsed ? 'lg:w-16' : 'lg:w-64',
            // Mobile Drawer Positions
            isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
          )
        )}
      >
        {/* Sidebar Header */}
        <div
          className={clsx(
            'h-16 flex items-center border-b border-[var(--color-border-subtle)] px-4 shrink-0',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] flex items-center justify-center text-[var(--color-action-primary-text)] font-header font-bold text-base shrink-0 shadow-sm">
                S
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-header text-sm font-bold tracking-tight text-[var(--color-arctic-powder)] truncate">
                  SYNAPSE<span className="text-[var(--color-forsythia)]">AI</span>
                </span>
                <span className="font-body text-[10px] text-[var(--color-text-muted)] truncate">
                  {portalConfig.name}
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] flex items-center justify-center text-[var(--color-action-primary-text)] font-header font-bold text-base shadow-sm">
              S
            </div>
          )}

          {/* Desktop Toggle Button */}
          <div className="hidden lg:block">
            <IconButton
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[var(--color-text-secondary)]" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-[var(--color-text-secondary)]" />
              )}
            </IconButton>
          </div>

          {/* Mobile Close Button */}
          <div className="block lg:hidden">
            <IconButton
              aria-label="Close menu"
              variant="ghost"
              size="sm"
              onClick={closeMobileSidebar}
            >
              <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </IconButton>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <SidebarNav onItemClick={closeMobileSidebar} />

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-oceanic-noir)]/40 shrink-0">
            <div className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-surface-hover)]/40 border border-[var(--color-border-subtle)]">
              <Sparkles className="w-4 h-4 text-[var(--color-forsythia)] shrink-0" />
              <div className="flex-1 min-w-0 font-body">
                <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                  AI Engine Ready
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                  Phase 1 Shell Active
                </p>
              </div>
              <Badge variant={activePortal === 'personal' ? 'primary' : 'secondary'} size="sm">
                {portalConfig.shortName}
              </Badge>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
