import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { usePortal } from '../../context/PortalContext';

export interface BreadcrumbProps {
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className }) => {
  const location = useLocation();
  const { portalConfig } = usePortal();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={twMerge(
        clsx(
          'flex items-center gap-1.5 font-body text-xs text-[var(--color-text-muted)] overflow-x-auto py-1',
          className
        )
      )}
    >
      <Link
        to={portalConfig.basePath}
        className="flex items-center gap-1 hover:text-[var(--color-forsythia)] transition-colors duration-150 shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>{portalConfig.shortName}</span>
      </Link>

      {pathSegments.map((segment: string, index: number) => {
        // Skip first segment ('personal' or 'org') since home link covers it
        if (index === 0) return null;

        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-border)] shrink-0" />
            {isLast ? (
              <span className="font-medium text-[var(--color-arctic-powder)] shrink-0 truncate">
                {formatSegment(segment)}
              </span>
            ) : (
              <Link
                to={path}
                className="hover:text-[var(--color-forsythia)] transition-colors duration-150 shrink-0 truncate"
              >
                {formatSegment(segment)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
