'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getLevelFromXp } from '@/lib/ranks';
import { ProgressBar } from '@/components/ui';

interface XpDisplayProps {
  totalXp: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function XpDisplay({
  totalXp,
  size = 'md',
  showDetails = true,
  className,
}: XpDisplayProps) {
  const [rankIconError, setRankIconError] = useState(false);
  const { level, progress, rankName, rankIcon, nextLevelXp, currentLevelXp } = getLevelFromXp(totalXp);
  const xpForNext = Math.max(0, nextLevelXp - totalXp);

  const iconSizes = {
    sm: { class: 'w-10 h-10', px: 40 },
    md: { class: 'w-[75px] h-[75px]', px: 75 },
    lg: { class: 'w-20 h-20', px: 80 },
  };
  const { class: iconSizeClass, px } = iconSizes[size];

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Rank icon (left of XP bar); no box, fallback to level number if image missing */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn('relative flex items-center justify-center font-zombies font-bold text-blood-200', iconSizeClass)}
        title={rankName}
      >
        {rankIconError ? (
          <span className="text-xs">{level}</span>
        ) : (
          <Image
            src={rankIcon}
            alt={rankName}
            width={px}
            height={px}
            className="object-contain"
            onError={() => setRankIconError(true)}
            unoptimized
          />
        )}
      </motion.div>

      {/* Progress info */}
      {showDetails && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-bunker-200">Level {level} · {rankName}</span>
            <span className="text-xs text-bunker-400">{level >= 20 ? 'Max rank' : `${xpForNext.toLocaleString()} XP to next`}</span>
          </div>
          <ProgressBar
            value={progress}
            variant="xp"
            size={size === 'lg' ? 'lg' : 'md'}
          />
          <p className="text-xs text-bunker-400 mt-1">
            {totalXp.toLocaleString()} total XP
          </p>
        </div>
      )}
    </div>
  );
}
