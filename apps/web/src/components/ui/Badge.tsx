import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center font-body font-medium rounded-full border transition-all duration-200 select-none';

    const variants = {
      primary:
        'bg-[var(--color-action-primary)] text-[var(--color-action-primary-text)] border-transparent',
      secondary:
        'bg-[var(--color-action-secondary)] text-[var(--color-action-secondary-text)] border-transparent',
      success:
        'bg-[#064E3B] text-[var(--color-status-success)] border-[#047857]',
      warning:
        'bg-[#78350F] text-[var(--color-status-warning)] border-[#B45309]',
      error:
        'bg-[#7F1D1D] text-[#FCA5A5] border-[#B91C1C]',
      info:
        'bg-[#0C4A6E] text-[var(--color-status-info)] border-[#0369A1]',
      outline:
        'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)]',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px] gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
    };

    return (
      <span
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
