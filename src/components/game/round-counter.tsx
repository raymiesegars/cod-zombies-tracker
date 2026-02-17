'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RoundCounterProps {
  round: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

// Caveat font, red with dark stroke. Sizes are beefed up so rounds read clearly.
const sizeConfig = {
  xs: 'text-2xl leading-none',
  sm: 'text-3xl leading-none',
  md: 'text-5xl leading-none',
  lg: 'text-7xl leading-none',
  xl: 'text-8xl leading-none',
};

export function RoundCounter({
  round,
  size = 'md',
  animated = true,
  className,
}: RoundCounterProps) {
  const textClass = sizeConfig[size];
  const formattedRound = round.toString();

  return (
    <motion.span
      initial={animated ? { scale: 0.95, opacity: 0 } : undefined}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-block font-zombies-round-smeared font-extrabold tabular-nums',
        'animate-blood-pulse',
        textClass,
        className
      )}
      style={{
        color: '#b91c1c',
        WebkitTextStroke: '2px rgba(22, 6, 8, 0.92)',
        paintOrder: 'stroke fill',
      }}
    >
      {formattedRound}
    </motion.span>
  );
}
