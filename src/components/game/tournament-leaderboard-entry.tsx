'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import { formatCompletionTime } from '@/components/ui/time-input';
import { formatRushScore } from '@/lib/utils';
import { getDisplayAvatarUrl } from '@/lib/avatar';
import { getRankForLevel, getRankIconPath } from '@/lib/ranks';
import { Medal, ShieldCheck } from 'lucide-react';

export type TournamentLeaderboardEntryData = {
  rank: number;
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null; avatarPreset?: string | null; level?: number };
  roundReached?: number;
  completionTimeSeconds?: number | null;
  killsReached?: number | null;
  scoreReached?: number | null;
  isVerified: boolean;
  trophyPlace?: number | null;
  logId?: string;
  logType?: 'challenge' | 'easter-egg';
  mapSlug?: string;
};

const rowHighlight = {
  1: 'bg-yellow-500/30 border-yellow-400',
  2: 'bg-bunker-800/80 border-bunker-400/60',
  3: 'bg-amber-950/80 border-amber-800',
};
const BOARD_NAME_MAX_LENGTH = 15;

export function TournamentLeaderboardEntry({
  entry,
  index,
  mapSlug,
  awardButtons,
}: {
  entry: TournamentLeaderboardEntryData;
  index?: number;
  mapSlug?: string;
  awardButtons?: React.ReactNode;
}) {
  const touchRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const onRowTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY, moved: false };
  };

  const onRowTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const start = touchRef.current;
    if (!start) return;
    if (Math.abs(touch.clientX - start.x) > 8 || Math.abs(touch.clientY - start.y) > 8) {
      start.moved = true;
    }
  };

  const onRowClick = (e: React.MouseEvent) => {
    if (touchRef.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const level = entry.user.level ?? 1;
  const rankDef = getRankForLevel(level);
  const rankIcon = rankDef ? getRankIconPath(rankDef.icon) : null;
  const displayName = entry.user.displayName || entry.user.username;
  const boardDisplayName =
    displayName.length > BOARD_NAME_MAX_LENGTH
      ? `${displayName.slice(0, BOARD_NAME_MAX_LENGTH)}...`
      : displayName;
  const slug = mapSlug ?? entry.mapSlug;
  const runHref = entry.logId && slug && entry.logType
    ? `/maps/${slug}/run/${entry.logType}/${entry.logId}`
    : null;
  const isTopThree = entry.rank <= 3;
  const highlightClass = entry.rank <= 3 ? rowHighlight[entry.rank as 1 | 2 | 3] : '';
  const borderClass = cn('border', highlightClass || 'border-bunker-700');

  const valueEl = entry.completionTimeSeconds != null ? (
    <span className="text-military-400 tabular-nums whitespace-nowrap" title="Completion time">
      {formatCompletionTime(entry.completionTimeSeconds)}
    </span>
  ) : entry.killsReached != null ? (
    <span className="text-military-400">{entry.killsReached.toLocaleString()} kills</span>
  ) : entry.scoreReached != null ? (
    <span className="text-military-400">{formatRushScore(entry.scoreReached)}</span>
  ) : entry.roundReached != null ? (
    <span className="text-military-400">Round {entry.roundReached}</span>
  ) : null;

  const inner = (
    <div
      className={cn(
        'grid grid-cols-[auto_auto_1fr_auto] max-[360px]:grid-cols-[auto_1fr_auto] min-[400px]:grid-cols-[auto_auto_auto_1fr_auto] sm:grid-cols-[auto_auto_auto_auto_1fr_auto] items-center gap-x-2 sm:gap-x-3 max-[360px]:gap-x-1 p-2.5 sm:p-3 max-[360px]:p-2 rounded-lg min-h-[3.25rem] min-w-0',
        borderClass
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 shrink-0">
        {isTopThree ? (
          <span title={entry.rank === 1 ? 'Gold' : entry.rank === 2 ? 'Silver' : 'Bronze'}>
            {entry.rank === 1 && <Medal className="w-5 h-5 text-yellow-300" />}
            {entry.rank === 2 && <Medal className="w-5 h-5 text-bunker-400" />}
            {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-800" />}
          </span>
        ) : (
          <span className="text-base font-zombies text-blood-500">#{entry.rank}</span>
        )}
      </div>
      <div className="hidden sm:flex items-center shrink-0">
        <span className="text-[10px] text-bunker-400">Lvl {level}</span>
      </div>
      <div className="hidden min-[400px]:flex items-center justify-center w-6 h-6 shrink-0">
        {rankIcon ? (
          <Image src={rankIcon} alt="" width={24} height={24} className="w-full h-full object-contain" />
        ) : (
          <span className="w-6 h-6 block" />
        )}
      </div>
      <Avatar
        src={getDisplayAvatarUrl(entry.user)}
        fallback={displayName}
        size="sm"
        className="w-7 h-7 shrink-0 max-[360px]:hidden"
      />
      <div className="min-w-0 flex items-center gap-1.5">
        <Link
          href={`/users/${entry.user.username}`}
          className="font-medium text-white truncate hover:text-blood-400 transition-colors"
          onClick={(e) => e.stopPropagation()}
          title={displayName}
        >
          {boardDisplayName}
        </Link>
        {entry.isVerified && (
          <span className="hidden min-[350px]:inline-flex shrink-0" title="Verified">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </span>
        )}
      </div>
      <div className="flex items-center justify-end shrink-0 gap-2">
        {valueEl}
        {entry.trophyPlace != null && (
          <span className="shrink-0 flex items-center justify-center w-6" title={entry.trophyPlace === 1 ? 'Gold' : entry.trophyPlace === 2 ? 'Silver' : 'Bronze'}>
            {entry.trophyPlace === 1 && <Medal className="w-4 h-4 text-yellow-300" />}
            {entry.trophyPlace === 2 && <Medal className="w-4 h-4 text-bunker-400" />}
            {entry.trophyPlace === 3 && <Medal className="w-4 h-4 text-amber-800" />}
          </span>
        )}
        {awardButtons && (
          <span className="shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {awardButtons}
          </span>
        )}
      </div>
    </div>
  );

  if (runHref) {
    return (
      <Link
        href={runHref}
        target="_blank"
        rel="noopener noreferrer"
        className="block min-w-0 hover:opacity-95 transition-opacity touch-pan-y"
        onTouchStart={onRowTouchStart}
        onTouchMove={onRowTouchMove}
        onClick={onRowClick}
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
