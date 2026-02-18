'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn, getPlayerCountLabel } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { RoundCounter } from './round-counter';
import { UserWithRank } from './user-with-rank';
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg transition-colors min-h-[3.25rem] sm:min-h-[3.5rem]',
        isCurrentUser
          ? 'bg-blood-950/30 border border-blood-800/30'
          : 'bg-bunker-900/50 hover:bg-bunker-900',
        isTopThree && 'bg-bunker-800/80'
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-8 sm:w-10 flex items-center justify-center">
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

      {/* User info – avatar, name, level vertically centered */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 self-center">
        <UserWithRank
          user={{
            id: entry.user.id,
            username: entry.user.username,
            displayName: entry.user.displayName,
            avatarUrl: entry.user.avatarUrl,
            avatarPreset: entry.user.avatarPreset,
            level: entry.user.level,
          }}
          showAvatar={true}
          showLevel={true}
          size="sm"
          linkToProfile={true}
        />
        <span className="text-xs sm:text-sm text-bunker-400 truncate hidden sm:inline-block leading-none">
          @{entry.user.username}
        </span>
      </div>

      {/* Player count - fixed width so Solo/Duo/Trio/Squad align vertically */}
      {!hidePlayerCount && (
        <div className="hidden sm:flex flex-shrink-0 w-14 items-center justify-start self-center">
          <Badge variant="default" size="sm">
            {getPlayerCountLabel(entry.playerCount)}
          </Badge>
        </div>
      )}

      {/* Round or XP */}
      {(showRound || valueKind === 'xp') && (
        <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0 min-w-[3.5rem] sm:min-w-[4rem]">
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

      {/* Proof link */}
      {entry.proofUrl && (
        <a
          href={entry.proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 sm:p-2 text-bunker-400 hover:text-blood-400 transition-colors flex-shrink-0 flex items-center justify-center self-center"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </a>
      )}
    </motion.div>
  );
}
