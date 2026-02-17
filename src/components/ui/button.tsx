'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-blood-600 via-blood-700 to-blood-800 hover:from-blood-500 hover:via-blood-600 hover:to-blood-700 text-white border border-blood-500/30 hover:border-blood-400/40 shadow-[inset_0_1px_0_rgba(161,45,56,0.3),0_2px_8px_rgba(31,10,12,0.5)] hover:shadow-[inset_0_1px_0_rgba(161,45,56,0.4),0_4px_12px_rgba(31,10,12,0.6)]',
  secondary:
    'bg-gradient-to-b from-bunker-800 to-bunker-900 hover:from-bunker-700 hover:to-bunker-800 text-white border border-bunker-600/50 hover:border-bunker-500/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_4px_rgba(0,0,0,0.4)]',
  ghost: 'bg-transparent hover:bg-bunker-800/50 text-bunker-300 hover:text-blood-400 border border-transparent hover:border-bunker-700/50',
  danger:
    'bg-gradient-to-b from-blood-700 via-blood-800 to-blood-900 hover:from-blood-600 hover:via-blood-700 hover:to-blood-800 text-white border border-blood-600/30 shadow-[inset_0_1px_0_rgba(112,30,39,0.3),0_2px_8px_rgba(31,10,12,0.5)]',
  success:
    'bg-gradient-to-b from-military-700 to-military-800 hover:from-military-600 hover:to-military-700 text-white border border-military-500/30 shadow-[inset_0_1px_0_rgba(101,163,13,0.2),0_2px_4px_rgba(0,0,0,0.3)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        initial={false}
        whileHover={isDisabled ? undefined : { 
          scale: 1.02,
          y: -1,
        }}
        whileTap={isDisabled ? undefined : { 
          scale: 0.98,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        className={cn(
          'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blood-700/50 focus:ring-offset-2 focus:ring-offset-bunker-950',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'overflow-hidden',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Subtle inner glow effect for primary buttons */}
        {variant === 'primary' && !isDisabled && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-t from-transparent via-blood-400/5 to-blood-400/10 opacity-0 group-hover:opacity-100"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />
        )}
        
        {/* Content */}
        <span className="relative z-10 inline-flex items-center justify-center gap-inherit">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            leftIcon
          )}
          {children}
          {!isLoading && rightIcon}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
