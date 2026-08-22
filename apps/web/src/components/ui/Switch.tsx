import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, label, disabled = false, className, id }, ref) => {
    const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex items-center gap-3 select-none">
        <button
          ref={ref}
          id={switchId}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={twMerge(
            clsx(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forsythia)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-oceanic-noir)] disabled:opacity-50 disabled:cursor-not-allowed',
              checked ? 'bg-[var(--color-action-primary)]' : 'bg-[var(--color-border)]',
              className
            )
          )}
        >
          <span
            className={clsx(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--color-oceanic-noir)] shadow-md ring-0 transition duration-200 ease-in-out',
              checked ? 'translate-x-5 bg-[var(--color-action-primary-text)]' : 'translate-x-0'
            )}
          />
        </button>
        {label && (
          <label
            htmlFor={switchId}
            onClick={() => !disabled && onChange(!checked)}
            className="font-body text-sm font-medium text-[var(--color-text-primary)] cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
