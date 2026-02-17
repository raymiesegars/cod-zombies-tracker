'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'xp';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantStyles = {
  default: 'bg-gradient-to-r from-blood-600 to-blood-500',
  success: 'bg-gradient-to-r from-military-600 to-military-500',
  warning: 'bg-gradient-to-r from-rust-600 to-rust-500',
  danger: 'bg-gradient-to-r from-blood-600 to-blood-500',
  xp: 'bg-gradient-to-r from-blood-700 via-blood-500 to-blood-700',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-bunker-300">{label}</span>}
          {showLabel && (
            <span className="text-sm font-medium text-bunker-200">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-bunker-800 rounded-full overflow-hidden border border-bunker-700',
          sizeStyles[size]
        )}
      >
        <motion.div
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.8, ease: 'easeOut' } : undefined}
          className={cn('h-full rounded-full', variantStyles[variant])}
        />
      </div>
    </div>
  );
}
