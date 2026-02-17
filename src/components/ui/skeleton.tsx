'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rounded';
}

export function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-bunker-800',
        variant === 'default' && 'rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rounded' && 'rounded-lg',
        className
      )}
      {...props}
    />
  );
}

export function MapCardSkeleton() {
  return (
    <div className="bg-bunker-900 rounded-xl overflow-hidden border border-bunker-700">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-bunker-900/50 rounded-lg">
      <Skeleton className="w-8 h-8" variant="circular" />
      <Skeleton className="w-10 h-10" variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="w-20 h-20" variant="circular" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full max-w-[200px]" />
      </div>
    </div>
  );
}
