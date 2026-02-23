'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn, getPlayerCountLabel, formatXpCompact, formatRushScore } from '@/lib/utils';
import { Badge, Avatar } from '@/components/ui';
import { RoundCounter } from './round-counter';
import { formatCompletionTime } from '@/components/ui/time-input';
import { getRankForLevel, getRankIconPath } from '@/lib/ranks';
import { getDisplayAvatarUrl } from '@/lib/avatar';
import type { LeaderboardEntry as LeaderboardEntryType } from '@/types';
import { Trophy, ExternalLink, ShieldCheck } from 'lucide-react';

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  index: number;
  isCurrentUser?: boolean;
  showRound?: boolean;
  invertRanking?: boolean;
  valueKind?: 'round' | 'xp' | 'time' | 'score';
  hidePlayerCount?: boolean;
  mapSlug?: string;
  /** When true (e.g. verified XP rank leaderboard), show blue verified checkmark on every entry */
  showVerifiedBadge?: boolean;
}

const rankColors = {
  1: 'from-yellow-400 to-yellow-600',
  2: 'from-gray-300 to-gray-500',
  3: 'from-amber-600 to-amber-800',
};

export function LeaderboardEntry({
  entry,
  index,
  isCurrentUser = false,
  showRound = true,
  invertRanking = false,
  valueKind = 'round',
  hidePlayerCount = false,
  mapSlug,
  showVerifiedBadge = false,
}: LeaderboardEntryProps) {
  const isTopThree = entry.rank <= 3;
  const level = entry.user.level ?? 1;
  const rank = getRankForLevel(level);
  const rankIcon = rank ? getRankIconPath(rank.icon) : null;
  const displayName = entry.user.displayName || entry.user.username;
  const logHref =
    mapSlug && entry.logId && entry.runType
      ? `/maps/${mapSlug}/run/${entry.runType === 'easter-egg' ? 'easter-egg' : 'challenge'}/${entry.logId}`
      : undefined;

  const hasRightSlots = !hidePlayerCount && (valueKind === 'time' || valueKind === 'round' || valueKind === 'score');
  /** For time leaderboards, value is completion time in seconds; coerce so string from API still works */
  const timeSeconds = valueKind === 'time' ? Number(entry.value) : null;
  /** For RUSH leaderboards, value is score */
  const scoreValue = valueKind === 'score' ? Number(entry.value) : null;
  const showTime = valueKind === 'time' && timeSeconds != null && Number.isFinite(timeSeconds) && timeSeconds >= 0;

  // <400px: 4 cols. 400–768px: 5 cols. 771px+: 6 cols. lg: +full value. Fixed/min widths on value columns so Solo/Duo/Trio/Squad and round digits align vertically.
  const gridClass = cn(
    'grid items-center gap-x-3 p-3 sm:p-3 md:p-4 rounded-lg transition-colors min-h-[3.25rem] sm:min-h-[3.5rem] min-w-0 w-full',
    isCurrentUser
      ? 'bg-blood-950/30 border border-blood-800/30'
      : 'bg-bunker-900/50 hover:bg-bunker-900',
    isTopThree && 'bg-bunker-800/80',
    hidePlayerCount
      ? 'grid-cols-[2rem_1.5rem_minmax(0,1fr)_minmax(0,5.5rem)] min-[400px]:grid-cols-[2rem_1.5rem_1.75rem_minmax(0,1fr)_minmax(0,5.5rem)] md:grid-cols-[2rem_2rem_2rem_minmax(0,1fr)_minmax(0,5.5rem)] min-[771px]:grid-cols-[2rem_auto_2rem_2rem_minmax(0,1fr)_minmax(0,5.5rem)] lg:grid-cols-[2.5rem_auto_2.5rem_2.25rem_minmax(0,1fr)_minmax(0,6.5rem)]'
      : hasRightSlots
        ? 'grid-cols-[2rem_1.5rem_minmax(0,1fr)_5.5rem] min-[400px]:grid-cols-[2rem_1.5rem_1.75rem_minmax(0,1fr)_5.5rem] md:grid-cols-[2rem_2rem_2rem_minmax(0,1fr)_5.5rem] min-[771px]:grid-cols-[2rem_auto_2rem_2rem_minmax(0,1fr)_5.5rem] lg:grid-cols-[2.5rem_auto_2.5rem_2.25rem_minmax(0,1fr)_minmax(0,1fr)]'
        : 'grid-cols-[2rem_1.5rem_minmax(0,1fr)_5.5rem] min-[400px]:grid-cols-[2rem_1.5rem_1.75rem_minmax(0,1fr)_5.5rem] md:grid-cols-[2rem_2rem_2rem_minmax(0,1fr)_5.5rem] min-[771px]:grid-cols-[2rem_auto_2rem_2rem_minmax(0,1fr)_5.5rem] lg:grid-cols-[2.5rem_auto_2.5rem_2.25rem_minmax(0,1fr)_auto_5.5rem]'
  );

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={gridClass}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
        {isTopThree ? (
          <div
            className={cn(
              'w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center',
              `bg-gradient-to-br ${rankColors[entry.rank as keyof typeof rankColors]}`
            )}
          >
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-bunker-900" />
          </div>
        ) : (
          <span className="text-base sm:text-lg font-zombies text-blood-500 leading-none">#{entry.rank}</span>
        )}
      </div>

      {/* Level – left of rank icon; hidden below 771px */}
      <div className="hidden min-[771px]:flex items-center flex-shrink-0">
        <span className="text-[10px] sm:text-[11px] md:text-xs text-bunker-400 leading-none whitespace-nowrap">Lvl {level}</span>
      </div>

      {/* Rank icon (prestige) – hidden below 400px, scaled for mobile above */}
      <div className="hidden min-[400px]:flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 flex-shrink-0">
        {rankIcon ? (
          <Image
            src={rankIcon}
            alt=""
            width={40}
            height={40}
            className="w-full h-full object-contain"
            sizes="(max-width: 640px) 20px, (max-width: 768px) 24px, (max-width: 1024px) 32px, 40px"
          />
        ) : (
          <span className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 block" />
        )}
      </div>

      {/* Avatar – always visible, scaled for mobile */}
      <div className="flex items-center justify-center flex-shrink-0">
        <Avatar
          src={getDisplayAvatarUrl(entry.user)}
          fallback={displayName}
          size="sm"
          className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 min-w-0"
        />
      </div>

      {/* Display name – always truncate; link to profile; verified checkmark */}
      <div className="min-w-0 flex items-center gap-1.5">
        <Link
          href={`/users/${entry.user.username}`}
          className="font-medium text-white truncate block hover:text-blood-400 transition-colors leading-none min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {displayName}
        </Link>
        {(showVerifiedBadge || (entry as LeaderboardEntryType & { isVerified?: boolean }).isVerified) && (
          <span className="flex-shrink-0 min-w-[1rem] w-4 h-4 inline-flex items-center justify-center rounded-full bg-blue-500/90 text-white" title={showVerifiedBadge ? 'Verified XP' : 'Verified run'} aria-hidden>
            <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
          </span>
        )}
      </div>

      {/* Proof – from lg, only when not hidePlayerCount and not using 4-slot (hasRightSlots has Proof inside value block) */}
      {!hidePlayerCount && !hasRightSlots && (
        <div className="hidden lg:flex items-center justify-center flex-shrink-0 w-8">
          {entry.proofUrl ? (
            <a
              href={entry.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-bunker-400 hover:text-blood-400 transition-colors flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              aria-label="View proof"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-bunker-600 text-xs leading-none" aria-hidden>—</span>
          )}
        </div>
      )}

      {/* Players – from lg, only when not hidePlayerCount and not using 4-slot */}
      {!hidePlayerCount && !hasRightSlots && (
        <div className="hidden lg:flex items-center justify-center flex-shrink-0">
          <Badge variant="default" size="sm" className="shrink-0">
            {getPlayerCountLabel(entry.playerCount)}
          </Badge>
        </div>
      )}

      {/* Value: compact on small (rank/name/value only), full on md+; 1rem right padding on timed leaderboards */}
      {(showRound || valueKind === 'xp' || valueKind === 'time' || valueKind === 'score') && (
        <div className={cn('min-w-0 flex items-center justify-end flex-shrink-0', valueKind === 'time' ? 'pr-4' : 'pr-2 sm:pr-0')}>
          {valueKind === 'xp' ? (
            <>
              <span className="text-xs sm:text-sm font-semibold text-military-400 tabular-nums leading-none whitespace-nowrap lg:hidden">
                {formatXpCompact(entry.value)} XP
              </span>
              <span className="hidden lg:inline text-sm font-semibold text-military-400 tabular-nums leading-none whitespace-nowrap">
                {entry.value.toLocaleString()} XP
              </span>
            </>
          ) : hasRightSlots ? (
            <>
              {/* Single value below lg: tabular-nums so digit columns align */}
              <div className="min-w-0 flex items-center justify-end lg:hidden">
                {valueKind === 'time' ? (
                  showTime ? (
                    <span className="text-xs sm:text-sm font-zombies font-semibold text-element-400 tabular-nums leading-none truncate" title="Completion time">
                      {formatCompletionTime(timeSeconds)}
                    </span>
                  ) : null
                ) : valueKind === 'score' && scoreValue != null ? (
                  <span className="text-xs sm:text-sm font-zombies font-semibold text-element-400 tabular-nums leading-none truncate">
                    {formatRushScore(scoreValue)}
                  </span>
                ) : (
                  <RoundCounter round={entry.value} size="xs" animated={false} className="shrink-0 tabular-nums" />
                )}
              </div>
              {/* Full: Time | Proof | Players | Round from lg; fixed widths so Solo/Duo/round digits align vertically */}
              <div className="hidden lg:grid grid-cols-[minmax(0,4.5rem)_2rem_4.5rem_5rem] gap-x-3 w-max max-w-full min-w-0 ml-auto">
                <div className="flex items-center justify-start min-w-0 tabular-nums">
                  {valueKind === 'time' && showTime ? (
                    <span className="text-sm font-zombies font-semibold text-element-400 tabular-nums leading-none truncate" title="Completion time">
                      {formatCompletionTime(timeSeconds)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-center w-8 shrink-0">
                  {entry.proofUrl ? (
                    <a
                      href={entry.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-bunker-400 hover:text-blood-400 flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="View proof"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
                <div className="flex items-center justify-center w-[4.5rem] shrink-0">
                  <Badge variant="default" size="sm" className="shrink-0">
                    {getPlayerCountLabel(entry.playerCount)}
                  </Badge>
                </div>
                <div className="flex items-center justify-end w-20 shrink-0 tabular-nums">
                  {valueKind === 'time' && entry.roundCompleted != null ? (
                    <RoundCounter round={entry.roundCompleted} size="sm" animated={false} className="shrink-0" />
                  ) : valueKind === 'score' && scoreValue != null ? (
                    <span className="text-sm font-zombies font-semibold text-element-400 tabular-nums leading-none">
                      {formatRushScore(scoreValue)}
                    </span>
                  ) : valueKind === 'round' ? (
                    <>
                      <RoundCounter round={entry.value} size="sm" animated={false} className="shrink-0" />
                      {invertRanking && <span className="text-xs text-bunker-400 ml-0.5">rnd</span>}
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0 flex items-center justify-end lg:hidden tabular-nums">
                <RoundCounter round={entry.value} size="xs" animated={false} className="shrink-0 tabular-nums" />
              </div>
              <div className="hidden lg:flex items-center justify-end min-w-0 tabular-nums">
                <RoundCounter round={entry.value} size="sm" animated={false} className="shrink-0 tabular-nums" />
                {invertRanking && <span className="text-xs text-bunker-400 ml-0.5">rnd</span>}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );

  if (logHref) {
    return (
      <Link href={logHref} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blood-500 min-w-0">
        {cardContent}
      </Link>
    );
  }
  return cardContent;
}
