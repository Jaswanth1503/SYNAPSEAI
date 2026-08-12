import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IconButton } from './IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--color-oceanic-noir)]/80 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={twMerge(
          clsx(
            'relative w-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-lg z-10 overflow-hidden transform transition-all duration-200 animate-in fade-in zoom-in-95',
            maxWidths[maxWidth]
          )
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-subtle)]">
          <div>
            {title && (
              <h2 id="modal-title" className="font-header text-lg font-semibold text-[var(--color-arctic-powder)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="font-body text-xs text-[var(--color-text-secondary)] mt-0.5">{description}</p>
            )}
          </div>
          <IconButton aria-label="Close modal" variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        <div className="p-5 font-body text-sm max-h-[70vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="p-4 bg-[var(--color-oceanic-noir)]/50 border-t border-[var(--color-border-subtle)] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
