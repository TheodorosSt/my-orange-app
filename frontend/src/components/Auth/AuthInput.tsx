/* ===================================
   ORANGE — Premium Auth Input
   =================================== */

import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-orange-text-secondary tracking-wide">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full bg-orange-bg-tertiary border rounded-lg px-4 py-2.5 text-sm text-orange-text-primary',
              'placeholder:text-orange-text-muted/60',
              'focus:outline-none focus:ring-2 focus:ring-orange-gold-mid/30 focus:border-orange-gold-mid/50',
              'transition-all duration-200',
              icon && 'pl-10',
              error
                ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50'
                : 'border-orange-border hover:border-orange-border-gold',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </div>
    );
  },
);

AuthInput.displayName = 'AuthInput';