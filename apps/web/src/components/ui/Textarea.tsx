import { TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = true,
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="font-body text-xs font-medium text-[var(--color-text-secondary)] select-none"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={twMerge(
            clsx(
              'w-full bg-[var(--color-oceanic-noir)] text-[var(--color-text-primary)] font-body text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-forsythia)] focus:ring-1 focus:ring-[var(--color-forsythia)] disabled:opacity-50 disabled:cursor-not-allowed resize-y',
              error && 'border-[var(--color-status-error)] focus:border-[var(--color-status-error)] focus:ring-[var(--color-status-error)]',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <span className="font-body text-xs text-[var(--color-status-error)]">{error}</span>
        ) : helperText ? (
          <span className="font-body text-xs text-[var(--color-text-muted)]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
