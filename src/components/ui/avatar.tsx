'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

function isExternalLogoAvatar(src: string): boolean {
  const lower = src.toLowerCase();
  return lower.includes('/avatars/avatar-external-zwr.png') || lower.includes('/avatars/avatar-external-src.png');
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getExternalLogoBackground(seed: string): string {
  const h = hashString(seed);
  const hue = h % 360;
  const saturation = 58 + (h % 16); // 58-73%
  const lightness = 34 + (h % 10); // 34-43%
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className,
}: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  if (src) {
    const externalLogo = isExternalLogoAvatar(src);
    const backgroundSeed = `${src}|${fallback ?? alt}`;
    const externalBg = externalLogo ? getExternalLogoBackground(backgroundSeed) : undefined;
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-bunker-700 border border-bunker-600',
          sizeStyles[size],
          className
        )}
        style={externalLogo ? { backgroundColor: externalBg } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className={cn(
            'w-full h-full',
            externalLogo ? 'object-contain p-[8%]' : 'object-cover'
          )}
          style={externalLogo ? {
            filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.95)) drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 0 1px rgba(255,255,255,0.6))',
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-blood-700 to-blood-900 font-semibold text-white border border-blood-600/50',
        sizeStyles[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
