import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      options,
      error,
      helperText,
      fullWidth = true,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="font-body text-xs font-medium text-[var(--color-text-secondary)] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={twMerge(
              clsx(
                'w-full appearance-none bg-[var(--color-oceanic-noir)] text-[var(--color-text-primary)] font-body text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] pl-3 pr-10 py-2 transition-all duration-200 focus:outline-none focus:border-[var(--color-forsythia)] focus:ring-1 focus:ring-[var(--color-forsythia)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                error && 'border-[var(--color-status-error)] focus:border-[var(--color-status-error)] focus:ring-[var(--color-status-error)]',
                className
              )
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-[var(--color-nocturnal-expedition)] text-[var(--color-text-primary)]"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-[var(--color-text-muted)]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <span className="font-body text-xs text-[var(--color-status-error)]">{error}</span>
        ) : helperText ? (
          <span className="font-body text-xs text-[var(--color-text-muted)]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
