import React, { ReactNode } from 'react';
import { FolderOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="w-10 h-10 text-[var(--color-text-muted)]" />,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)]/50 font-body',
          className
        )
      )}
    >
      <div className="p-3 mb-3 bg-[var(--color-oceanic-noir)] rounded-full border border-[var(--color-border-subtle)]">
        {icon}
      </div>
      <h3 className="font-header text-base font-semibold text-[var(--color-arctic-powder)]">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mt-1 mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
