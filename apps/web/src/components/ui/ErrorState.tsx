import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading content. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-lg)] border border-[var(--color-status-error)]/30 bg-[#7F1D1D]/10 font-body',
          className
        )
      )}
    >
      <div className="p-3 mb-3 bg-[#7F1D1D]/20 rounded-full border border-[var(--color-status-error)]/40 text-[var(--color-status-error)]">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="font-header text-base font-semibold text-[var(--color-arctic-powder)]">
        {title}
      </h3>
      <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mt-1 mb-5">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
