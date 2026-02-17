'use client';

import { cn } from '@/lib/utils';

interface EasterEggIconProps {
  className?: string;
  size?: number;
}

// Egg shape (round top, pointy bottom) with some decoration.
export function EasterEggIcon({ className, size = 24 }: EasterEggIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 28"
      fill="none"
      className={cn('flex-shrink-0', className)}
      width={size}
      height={size}
      aria-hidden
    >
      <g transform="translate(0, 28) scale(1, -1)">
        {/* Egg base: round at top (y=2), pointy at bottom (y=26) */}
        <path
          d="M12 2c-5 0-9 4.5-9 10s2 8 4.5 10.5C8.5 23 10 24 12 24s3.5-1 4.5-1.5C19 20 21 16.5 21 12s-4-10-9-10z"
          className="fill-current"
        />
        {/* Curved stripe (filled band across egg) */}
        <path
          d="M9 9 Q12 11 15 9 Q12 13 9 11 Z"
          className="fill-current opacity-65"
        />
        <path
          d="M9.5 15 Q12 17 14.5 15 Q12 18 9.5 16 Z"
          className="fill-current opacity-55"
        />
        {/* Dots */}
        <circle cx="10.5" cy="6" r="1.1" className="fill-current opacity-75" />
        <circle cx="14" cy="10.5" r="0.95" className="fill-current opacity-75" />
        <circle cx="11" cy="15" r="0.85" className="fill-current opacity-70" />
        {/* Crack */}
        <path
          d="M12 5.5v2.2c0 .5.1 1 .35 1.35-.25-.35-.35-.85-.35-1.35V5.5z"
          className="fill-current opacity-55"
        />
        <ellipse cx="8.5" cy="9.5" rx="1" ry="1.2" className="fill-current opacity-35" />
      </g>
    </svg>
  );
}
