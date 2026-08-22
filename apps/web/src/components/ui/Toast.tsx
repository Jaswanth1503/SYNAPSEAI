import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IconButton } from './IconButton';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
  onClose?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  description,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[var(--color-status-success)] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--color-status-warning)] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--color-status-error)] shrink-0" />,
    info: <Info className="w-5 h-5 text-[var(--color-status-info)] shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={twMerge(
        clsx(
          'flex items-start gap-3 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-lg max-w-md w-full animate-in slide-in-from-bottom-5 duration-200'
        )
      )}
    >
      {icons[type]}
      <div className="flex-1 font-body">
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h4>
        {description && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{description}</p>
        )}
      </div>
      {onClose && (
        <IconButton aria-label="Dismiss toast" variant="ghost" size="sm" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </IconButton>
      )}
    </div>
  );
};
