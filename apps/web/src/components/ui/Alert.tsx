import React, { ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IconButton } from './IconButton';

export interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const styles = {
    success: 'bg-[#064E3B]/40 border-[#047857] text-[#A7F3D0]',
    warning: 'bg-[#78350F]/40 border-[#B45309] text-[#FDE68A]',
    error: 'bg-[#7F1D1D]/40 border-[#B91C1C] text-[#FCA5A5]',
    info: 'bg-[#0C4A6E]/40 border-[#0369A1] text-[#BAE6FD]',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#FBBF24] shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />,
  };

  return (
    <div
      role="alert"
      className={twMerge(
        clsx(
          'flex items-start gap-3 p-4 border rounded-[var(--radius-md)] font-body text-sm',
          styles[type],
          className
        )
      )}
    >
      {icons[type]}
      <div className="flex-1">
        {title && <h5 className="font-header font-semibold mb-0.5">{title}</h5>}
        <div className="text-xs opacity-90">{children}</div>
      </div>
      {onClose && (
        <IconButton aria-label="Close alert" variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </IconButton>
      )}
    </div>
  );
};
