import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={twMerge(
            clsx(
              'absolute z-50 mt-2 w-56 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-lg py-1.5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick?.();
                  setIsOpen(false);
                }
              }}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-body transition-colors duration-150 text-left disabled:opacity-50 disabled:cursor-not-allowed',
                item.danger
                  ? 'text-[var(--color-status-error)] hover:bg-[#7F1D1D]/30'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)]'
              )}
            >
              {item.icon && <span className="w-4 h-4 shrink-0 text-current">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
