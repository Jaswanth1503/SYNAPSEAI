import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-body font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forsythia)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-oceanic-noir)] disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-[var(--radius-md)]';

    const variants = {
      primary:
        'bg-[var(--color-action-primary)] text-[var(--color-action-primary-text)] hover:bg-[var(--color-action-primary-hover)] active:scale-[0.98] shadow-sm',
      secondary:
        'bg-[var(--color-action-secondary)] text-[var(--color-action-secondary-text)] hover:bg-[var(--color-action-secondary-hover)] active:scale-[0.98] shadow-sm',
      outline:
        'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)] hover:border-[var(--color-forsythia)] active:scale-[0.98]',
      ghost:
        'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)] active:scale-[0.98]',
      danger:
        'bg-[var(--color-status-error)] text-[var(--color-arctic-powder)] hover:opacity-90 active:scale-[0.98] shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
      md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
      lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
