'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getLevelFromXp, MAX_LEVEL } from '@/lib/ranks';
import { ProgressBar } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';

type ProfileRankDisplay = {
  showNormalXp?: boolean;
  showVerifiedXp?: boolean;
  showCustomZombiesXp?: boolean;
  showVerifiedCustomZombiesXp?: boolean;
};

interface XpRankDisplayProps {
  totalXp: number;
  verifiedTotalXp: number;
  customZombiesTotalXp?: number;
  verifiedCustomZombiesTotalXp?: number;
  /** Viewer's preference: show both bars or single with toggle (legacy) */
  showBothXpRanks?: boolean;
  /** Viewer's last selected when showing single bar */
  preferredRankView?: 'total' | 'verified' | null;
  /** Callback when user toggles (to persist preferredRankView) */
  onPreferredRankViewChange?: (view: 'total' | 'verified') => void;
  /** Which ranks to show (mix and match). When set, overrides showBothXpRanks. */
  profileRankDisplay?: ProfileRankDisplay;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function SingleXpBar({
  totalXp,
  isVerified,
  size = 'md',
  showCheckmark,
  xpSubtitle,
}: {
  totalXp: number;
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCheckmark?: boolean;
  /** Override the XP subtitle, e.g. "Custom Zombies XP" instead of "total XP" / "verified XP" */
  xpSubtitle?: string;
}) {
  const [rankIconError, setRankIconError] = useState(false);
  const { level, progress, rankName, rankIcon, nextLevelXp } = getLevelFromXp(totalXp);
  const xpForNext = Math.max(0, nextLevelXp - totalXp);

  const iconSizes = {
    sm: { class: 'w-10 h-10', px: 40 },
    md: { class: 'w-[75px] h-[75px]', px: 75 },
    lg: { class: 'w-20 h-20', px: 80 },
  };
  const { class: iconSizeClass, px } = iconSizes[size];

  return (
    <div className="flex items-center gap-4">
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
        {showCheckmark && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center" title="Verified">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 drop-shadow-md" strokeWidth={2.5} />
          </span>
        )}
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-sm font-medium text-bunker-200 truncate min-w-0" title={`Level ${level} · ${rankName}`}>
              Level {level} · {rankName}
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-1 text-blue-400 shrink-0 text-xs">
                <CheckCircle2 className="w-4 h-4" aria-hidden />
                Verified
              </span>
            )}
          </div>
          <span className="text-xs text-bunker-400 shrink-0">
            {level >= MAX_LEVEL ? 'Max rank' : `${xpForNext.toLocaleString()} XP to next`}
          </span>
        </div>
        <ProgressBar value={progress} variant="xp" size={size === 'lg' ? 'lg' : 'md'} />
        <p className="text-xs text-bunker-400 mt-1">
          {xpSubtitle ? (
            <>
              <span className="font-extrabold text-element-300 uppercase tracking-wide">Custom</span>
              {xpSubtitle.startsWith('Verified ') ? ' Verified Zombies ' : ' Zombies '}
              <span className="tabular-nums">{totalXp.toLocaleString()}</span>
              {' XP'}
            </>
          ) : (
            <>{totalXp.toLocaleString()} {isVerified ? 'verified' : 'total'} XP</>
          )}
        </p>
      </div>
    </div>
  );
}

export function XpRankDisplay({
  totalXp,
  verifiedTotalXp,
  customZombiesTotalXp = 0,
  verifiedCustomZombiesTotalXp = 0,
  showBothXpRanks = false,
  preferredRankView = 'total',
  onPreferredRankViewChange,
  profileRankDisplay,
  size = 'md',
  className,
}: XpRankDisplayProps) {
  const [localView, setLocalView] = useState<'total' | 'verified'>('total');
  const effectivePreferred = preferredRankView === 'verified' ? 'verified' : 'total';
  const currentView = onPreferredRankViewChange ? effectivePreferred : localView;

  const handleViewChange = useCallback(
    (view: 'total' | 'verified') => {
      if (onPreferredRankViewChange) {
        onPreferredRankViewChange(view);
      } else {
        setLocalView(view);
      }
    },
    [onPreferredRankViewChange]
  );

  const barContainer = 'rounded-lg border p-3 sm:p-4';

  if (profileRankDisplay) {
    const bars: { totalXp: number; isVerified: boolean; showCheckmark: boolean; title: string; borderClass: string; xpSubtitle?: string }[] = [];
    if (profileRankDisplay.showNormalXp) bars.push({ totalXp, isVerified: false, showCheckmark: false, title: 'Normal XP', borderClass: 'border-bunker-600 bg-bunker-800/30' });
    if (profileRankDisplay.showVerifiedXp) bars.push({ totalXp: verifiedTotalXp, isVerified: true, showCheckmark: true, title: 'Verified XP', borderClass: 'border-blue-500/40 bg-blue-950/20' });
    if (profileRankDisplay.showCustomZombiesXp) bars.push({ totalXp: customZombiesTotalXp, isVerified: false, showCheckmark: false, title: 'Custom Zombies XP', borderClass: 'border-element-500/40 bg-element-950/20', xpSubtitle: 'Custom Zombies' });
    if (profileRankDisplay.showVerifiedCustomZombiesXp) bars.push({ totalXp: verifiedCustomZombiesTotalXp, isVerified: true, showCheckmark: true, title: 'Verified Custom Zombies XP', borderClass: 'border-blue-500/30 bg-blue-950/10', xpSubtitle: 'Verified Custom Zombies' });

    if (bars.length === 0) return null;
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {bars.map((bar, i) => (
          <div key={i} className={cn(barContainer, bar.borderClass)}>
            <SingleXpBar totalXp={bar.totalXp} isVerified={bar.isVerified} showCheckmark={bar.showCheckmark} size={size} xpSubtitle={bar.xpSubtitle} />
          </div>
        ))}
      </div>
    );
  }

  if (showBothXpRanks) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className={cn(barContainer, 'border-blue-500/40 bg-blue-950/20')}>
          <SingleXpBar totalXp={verifiedTotalXp} isVerified showCheckmark size={size} />
        </div>
        <div className={cn(barContainer, 'border-bunker-600 bg-bunker-800/30')}>
          <SingleXpBar totalXp={totalXp} isVerified={false} size={size} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-2 gap-2 min-w-0">
        <button
          type="button"
          onClick={() => handleViewChange('total')}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-w-0',
            currentView === 'total'
              ? 'bg-blood-600 text-white'
              : 'bg-bunker-800 text-bunker-400 hover:bg-bunker-700 hover:text-bunker-300'
          )}
        >
          Total
        </button>
        <button
          type="button"
          onClick={() => handleViewChange('verified')}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-w-0',
            currentView === 'verified'
              ? 'bg-blue-600 text-white'
              : 'bg-bunker-800 text-bunker-400 hover:bg-bunker-700 hover:text-bunker-300'
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden />
          Verified
        </button>
      </div>
      {currentView === 'total' ? (
        <SingleXpBar totalXp={totalXp} isVerified={false} size={size} />
      ) : (
        <SingleXpBar totalXp={verifiedTotalXp} isVerified showCheckmark size={size} />
      )}
    </div>
  );
}
