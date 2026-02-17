'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'blood';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  glow?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-bunker-800 text-bunker-300 border-bunker-700',
  success: 'bg-military-900/60 text-military-400 border-military-700/40',
  warning: 'bg-rust-900/60 text-rust-400 border-rust-700/40',
  danger: 'bg-blood-800/60 text-white border-blood-600/40',
  info: 'bg-blue-900/60 text-blue-400 border-blue-700/40',
  purple: 'bg-element-900/60 text-element-400 border-element-700/40',
  blood: 'bg-blood-800/50 text-white border-blood-600/30',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  glow = false,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        glow && variant === 'success' && 'shadow-lg shadow-military-600/30',
        glow && variant === 'blood' && 'shadow-lg shadow-blood-500/30',
        glow && variant === 'danger' && 'shadow-lg shadow-blood-600/30',
        glow && variant === 'purple' && 'shadow-lg shadow-element-600/30',
        className
      )}
      {...props}
    />
  );
}
