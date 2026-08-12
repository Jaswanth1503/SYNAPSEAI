import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      className,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled = false,
      'aria-label': ariaLabel,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-body transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forsythia)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-oceanic-noir)] disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-[var(--radius-md)]';

    const variants = {
      primary:
        'bg-[var(--color-action-primary)] text-[var(--color-action-primary-text)] hover:bg-[var(--color-action-primary-hover)] active:scale-[0.98]',
      secondary:
        'bg-[var(--color-action-secondary)] text-[var(--color-action-secondary-text)] hover:bg-[var(--color-action-secondary-hover)] active:scale-[0.98]',
      outline:
        'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)] hover:border-[var(--color-forsythia)] active:scale-[0.98]',
      ghost:
        'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)] active:scale-[0.98]',
      danger:
        'bg-[var(--color-status-error)] text-[var(--color-arctic-powder)] hover:opacity-90 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
