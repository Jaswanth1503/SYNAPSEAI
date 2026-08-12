import { ImgHTMLAttributes, forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };

    const getInitials = (n?: string) => {
      if (!n) return 'U';
      const parts = n.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return n.slice(0, 2).toUpperCase();
    };

    return (
      <div
        className={twMerge(
          clsx(
            'relative inline-flex items-center justify-center rounded-full bg-[var(--color-bg-surface-hover)] border border-[var(--color-border)] font-header font-semibold text-[var(--color-forsythia)] overflow-hidden shrink-0 select-none',
            sizes[size],
            className
          )
        )}
      >
        {src && !hasError ? (
          <img
            ref={ref}
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
            {...props}
          />
        ) : (
          <span>{getInitials(name || alt)}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
