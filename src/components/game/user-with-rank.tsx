'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import { getLevelFromXp, getRankForLevel, getRankIconPath } from '@/lib/ranks';
import { getDisplayAvatarUrl } from '@/lib/avatar';

export type UserWithRankUser = {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
  level?: number;
  totalXp?: number;
};

interface UserWithRankProps {
  user: UserWithRankUser;
  showAvatar?: boolean;
  showLevel?: boolean;
  size?: 'sm' | 'md';
  linkToProfile?: boolean;
  className?: string;
}

// Rank icon a bit bigger than avatar so it’s easy to see
const rankIconSizes = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
};

export function UserWithRank({
  user,
  showAvatar = true,
  showLevel = true,
  size = 'md',
  linkToProfile = true,
  className,
}: UserWithRankProps) {
  // Use totalXp when we have it so rank and level stay in sync
  const level =
    user.totalXp != null ? getLevelFromXp(user.totalXp).level : (user.level ?? 1);
  const rank = getRankForLevel(level);
  const rankIcon = rank ? getRankIconPath(rank.icon) : null;
  const displayName = user.displayName || user.username;

  const content = (
    <span className={cn('inline-flex items-center gap-1.5 sm:gap-2 min-w-0 leading-none', className)}>
      {rankIcon && (
        <span className={cn('relative flex-shrink-0 rounded flex items-center justify-center', rankIconSizes[size])} title={`Level ${level}`}>
          <Image
            src={rankIcon}
            alt=""
            width={size === 'sm' ? 40 : 56}
            height={size === 'sm' ? 40 : 56}
            className="w-full h-full object-contain"
          />
        </span>
      )}
      {showAvatar && (
        <Avatar
          src={getDisplayAvatarUrl(user)}
          fallback={displayName}
          size={size === 'sm' ? 'sm' : 'md'}
          className="flex-shrink-0"
        />
      )}
      <span className="min-w-0 truncate font-medium text-white leading-none">
        {displayName}
      </span>
      {showLevel && (
        <span className="flex-shrink-0 text-xs text-bunker-400 leading-none">Lvl {level}</span>
      )}
    </span>
  );

  if (linkToProfile) {
    return (
      <Link href={`/users/${user.username}`} className="inline-flex items-center hover:text-blood-400 transition-colors min-h-0">
        {content}
      </Link>
    );
  }

  return content;
}
