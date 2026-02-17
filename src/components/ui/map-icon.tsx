'use client';

import { cn } from '@/lib/utils';

interface MapIconProps {
  className?: string;
  size?: number;
}

// Folded map with a road/contour line. Used for Maps in nav, home, profile.
export function MapIcon({ className, size = 24 }: MapIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('flex-shrink-0', className)}
      width={size}
      height={size}
      aria-hidden
    >
      {/* Folded map outline / paper shape */}
      <path d="M4 6l6-2 8 2 2-2v14l-2 2-8-2-6 2V6z" />
      {/* Crease/fold line */}
      <path d="M10 4v16M18 6v14" strokeWidth="1.2" className="opacity-60" />
      {/* Simple road/path line across map */}
      <path d="M6 10h4l3-2 5 3" className="opacity-80" />
      {/* Small "location" dot */}
      <circle cx="14" cy="11" r="1.5" fill="currentColor" className="opacity-90" />
    </svg>
  );
}
