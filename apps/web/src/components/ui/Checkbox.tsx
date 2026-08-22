import { InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, helperText, id, checked, disabled, onChange, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex items-start gap-2.5 select-none">
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={twMerge(
              clsx(
                'w-4 h-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-oceanic-noir)] transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-forsythia)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--color-oceanic-noir)] peer-checked:bg-[var(--color-action-primary)] peer-checked:border-[var(--color-action-primary)] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed flex items-center justify-center cursor-pointer',
                className
              )
            )}
          >
            {checked && <Check className="w-3 h-3 text-[var(--color-action-primary-text)] stroke-[3]" />}
          </div>
        </div>
        {label && (
          <div className="flex flex-col cursor-pointer" onClick={() => !disabled && onChange?.({ target: { checked: !checked } } as any)}>
            <label
              htmlFor={checkboxId}
              className="font-body text-sm font-medium text-[var(--color-text-primary)] cursor-pointer"
            >
              {label}
            </label>
            {helperText && (
              <span className="font-body text-xs text-[var(--color-text-muted)]">{helperText}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
