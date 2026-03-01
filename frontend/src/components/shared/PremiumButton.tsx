/* ===================================
   ORANGE — Premium Button Component
   =================================== */

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
}

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  className,
  disabled,
  ...props
}: PremiumButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={clsx(
        'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-300 overflow-hidden',
        // Size
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        // Variant
        variant === 'primary' && [
          'btn-premium text-orange-bg-primary font-semibold',
          !disabled && 'hover:shadow-glow-strong',
        ],
        variant === 'secondary' && [
          'border border-orange-border bg-orange-bg-tertiary text-orange-text-secondary',
          !disabled && 'hover:border-orange-border-gold hover:text-orange-text-primary',
        ],
        variant === 'ghost' && [
          'text-orange-text-muted',
          !disabled && 'hover:bg-orange-bg-tertiary hover:text-orange-text-secondary',
        ],
        // Disabled
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...(props as object)}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}