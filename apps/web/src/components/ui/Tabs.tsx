import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  return (
    <div
      role="tablist"
      className={twMerge(
        clsx(
          'flex items-center gap-1 border-b border-[var(--color-border)] overflow-x-auto scrollbar-none',
          variant === 'pills' && 'border-none p-1 bg-[var(--color-oceanic-noir)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]',
          className
        )
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-body font-medium rounded-[var(--radius-sm)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forsythia)] disabled:opacity-50 disabled:cursor-not-allowed shrink-0',
                isActive
                  ? 'bg-[var(--color-action-primary)] text-[var(--color-action-primary-text)] font-semibold shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)]'
              )}
            >
              {tab.icon && <span className="w-3.5 h-3.5 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={clsx(
                    'px-1.5 py-0.2 text-[10px] rounded-full font-mono',
                    isActive
                      ? 'bg-[var(--color-oceanic-noir)] text-[var(--color-forsythia)]'
                      : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={clsx(
              'relative flex items-center gap-2 px-4 py-2.5 text-sm font-body font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forsythia)] disabled:opacity-50 disabled:cursor-not-allowed shrink-0',
              isActive
                ? 'text-[var(--color-forsythia)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] font-mono">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-forsythia)] rounded-full animate-in fade-in duration-150" />
            )}
          </button>
        );
      })}
    </div>
  );
};
