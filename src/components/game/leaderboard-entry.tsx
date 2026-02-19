'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn, getPlayerCountLabel } from '@/lib/utils';
import { Badge, Avatar } from '@/components/ui';
import { RoundCounter } from './round-counter';
import { getRankForLevel, getRankIconPath } from '@/lib/ranks';
import { getDisplayAvatarUrl } from '@/lib/avatar';
import type { LeaderboardEntry as LeaderboardEntryType } from '@/types';
import { Trophy, ExternalLink } from 'lucide-react';

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  index: number;
  isCurrentUser?: boolean;
  showRound?: boolean;
  invertRanking?: boolean; // For EE challenges where lower round is better
  /** When 'xp', show entry.value as total XP instead of round */
  valueKind?: 'round' | 'xp';
  /** Hide the player count badge (e.g. for site Rank by XP leaderboard) */
  hidePlayerCount?: boolean;
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
}: LeaderboardEntryProps) {
  const isTopThree = entry.rank <= 3;
  const level = entry.user.level ?? 1;
  const rank = getRankForLevel(level);
  const rankIcon = rank ? getRankIconPath(rank.icon) : null;
  const displayName = entry.user.displayName || entry.user.username;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'grid items-center gap-x-1.5 sm:gap-x-3 p-2 sm:p-4 rounded-lg transition-colors min-h-[3.25rem] sm:min-h-[3.5rem]',
        isCurrentUser
          ? 'bg-blood-950/30 border border-blood-800/30'
          : 'bg-bunker-900/50 hover:bg-bunker-900',
        isTopThree && 'bg-bunker-800/80',
        hidePlayerCount
          ? 'grid-cols-[2rem_2rem_1.75rem_minmax(0,1fr)_0_auto_minmax(0,3.5rem)] sm:grid-cols-[2.5rem_2.5rem_2.25rem_minmax(0,8rem)_5.5rem_auto_4.5rem]'
          : 'grid-cols-[2rem_2rem_1.75rem_minmax(0,1fr)_0_auto_0_0_minmax(0,3.5rem)] sm:grid-cols-[2.5rem_2.5rem_2.25rem_minmax(0,8rem)_5.5rem_auto_2.25rem_3.5rem_4.5rem]'
      )}
    >
      {/* Rank */}
      <div className="flex items-center justify-center col-span-1">
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

      {/* Rank icon – fixed width so handle column aligns, smaller on mobile */}
      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
        {rankIcon ? (
          <Image
            src={rankIcon}
            alt=""
            width={40}
            height={40}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="w-8 h-8 sm:w-10 sm:h-10" />
        )}
      </div>

      {/* Avatar – fixed width */}
      <div className="flex items-center flex-shrink-0">
        <Avatar
          src={getDisplayAvatarUrl(entry.user)}
          fallback={displayName}
          size="sm"
          className="flex-shrink-0"
        />
      </div>

      {/* Display name – fixed-width column, truncate so handle aligns */}
      <div className="min-w-0 flex items-center">
        <Link
          href={`/users/${entry.user.username}`}
          className="font-medium text-white truncate block hover:text-blood-400 transition-colors leading-none"
        >
          {displayName}
        </Link>
      </div>

      {/* @username – fixed-width column, hidden on small screens */}
      <div className="min-w-0 hidden sm:flex items-center">
        <span className="text-xs sm:text-sm text-bunker-400 truncate block leading-none">
          @{entry.user.username}
        </span>
      </div>

      {/* Level */}
      <div className="flex items-center flex-shrink-0">
        <span className="text-xs text-bunker-400 leading-none">Lvl {level}</span>
      </div>

      {/* Proof link */}
      {!hidePlayerCount && (
        <div className="hidden sm:flex items-center justify-center">
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
          ) : null}
        </div>
      )}

      {/* Player count */}
      {!hidePlayerCount && (
        <div className="hidden sm:flex items-center justify-start">
          <Badge variant="default" size="sm">
            {getPlayerCountLabel(entry.playerCount)}
          </Badge>
        </div>
      )}

      {/* Round or XP */}
      {(showRound || valueKind === 'xp') && (
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          {valueKind === 'xp' ? (
            <span className="text-sm sm:text-base font-semibold text-military-400 tabular-nums leading-none">
              {entry.value.toLocaleString()} XP
            </span>
          ) : (
            <>
              <RoundCounter round={entry.value} size="xs" animated={false} className="sm:hidden" />
              <RoundCounter round={entry.value} size="sm" animated={false} className="hidden sm:inline-flex" />
              {invertRanking && (
                <span className="text-xs text-bunker-400 hidden sm:inline">rounds</span>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
