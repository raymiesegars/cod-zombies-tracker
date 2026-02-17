'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Achievement, AchievementRarity } from '@/types';
import { Lock, Award, Star, Gem, Crown } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked?: boolean;
  earnedAt?: Date | string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const rarityConfig: Record<
  AchievementRarity,
  { color: string; bgColor: string; borderColor: string; icon: typeof Award }
> = {
  COMMON: {
    color: 'text-bunker-300',
    bgColor: 'bg-bunker-700',
    borderColor: 'border-bunker-600',
    icon: Award,
  },
  UNCOMMON: {
    color: 'text-military-400',
    bgColor: 'bg-military-900/50',
    borderColor: 'border-military-600/50',
    icon: Award,
  },
  RARE: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/50',
    borderColor: 'border-blue-600/50',
    icon: Star,
  },
  EPIC: {
    color: 'text-element-400',
    bgColor: 'bg-element-900/50',
    borderColor: 'border-element-600/50',
    icon: Gem,
  },
  LEGENDARY: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/50',
    borderColor: 'border-yellow-600/50',
    icon: Crown,
  },
};

const sizeStyles = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
};

export function AchievementBadge({
  achievement,
  isUnlocked = false,
  earnedAt,
  size = 'md',
  showTooltip = true,
}: AchievementBadgeProps) {
  // earnedAt means they’ve got it
  const unlocked = isUnlocked || !!earnedAt;
  const config = rarityConfig[achievement.rarity];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative group"
    >
      <div
        className={cn(
          'relative rounded-xl border-2 flex items-center justify-center transition-all',
          sizeStyles[size],
          unlocked
            ? [config.bgColor, config.borderColor]
            : 'bg-bunker-900 border-bunker-700 opacity-50'
        )}
      >
        {/* Glow effect for unlocked */}
        {unlocked && (
          <div
            className={cn(
              'absolute inset-0 rounded-xl blur-lg opacity-30',
              config.bgColor
            )}
          />
        )}

        {/* Icon */}
        {unlocked ? (
          achievement.iconUrl ? (
            <img
              src={achievement.iconUrl}
              alt={achievement.name}
              className={cn('object-contain', iconSizes[size])}
            />
          ) : (
            <Icon className={cn(config.color, iconSizes[size])} />
          )
        ) : (
          <Lock className={cn('text-bunker-600', iconSizes[size])} />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bunker-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48 border border-bunker-700">
          <p className={cn('font-semibold text-sm', unlocked ? config.color : 'text-bunker-400')}>
            {achievement.name}
          </p>
          <p className="text-xs text-bunker-400 mt-1">{achievement.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-bunker-500 capitalize">
              {achievement.rarity.toLowerCase()}
            </span>
            <span className="text-xs text-blood-400">+{achievement.xpReward} XP</span>
          </div>
          {unlocked && earnedAt && (
            <p className="text-xs text-bunker-500 mt-1">
              Unlocked {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bunker-800" />
        </div>
      )}
    </motion.div>
  );
}
