'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/assets';
import { getBo4DifficultyLabel } from '@/lib/bo4';
import { Badge, Logo, EasterEggIcon } from '@/components/ui';
import { RoundCounter } from './round-counter';
import type { MapWithGame } from '@/types';

interface MapCardProps {
  map: MapWithGame;
  userHighestRound?: number;
  /** BO4 only: difficulty at which the highest round was achieved */
  userHighestRoundDifficulty?: string;
  hasCompletedEasterEgg?: boolean;
  className?: string;
}

export function MapCard({
  map,
  userHighestRound,
  userHighestRoundDifficulty,
  hasCompletedEasterEgg,
  className,
}: MapCardProps) {
  return (
    <Link href={`/maps/${map.slug}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'group relative bg-bunker-900 rounded-xl overflow-hidden cursor-pointer',
          'border border-bunker-700/80 hover:border-blood-800/60',
          'shadow-lg hover:shadow-xl hover:shadow-blood-950/30',
          'transition-all duration-300',
          className
        )}
      >
        {/* Map Image */}
        <div className="relative aspect-video overflow-hidden">
          {map.imageUrl ? (
            <Image
              src={getAssetUrl(map.imageUrl)}
              alt={map.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-bunker-800 to-bunker-950 flex items-center justify-center">
              <Logo size="lg" animated={false} className="opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-bunker-950 via-transparent to-transparent opacity-80" />
          
          {/* Game badge */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border border-blood-600/60 bg-blood-950/95 text-white shadow-[0_0_1px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,0.9),0_1px_4px_rgba(0,0,0,0.8)] [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_1px_3px_rgba(0,0,0,0.9)]">
              {map.game.shortName}
            </span>
          </div>

          {/* DLC badge */}
          {map.isDlc && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
              <Badge variant="purple" size="sm">
                DLC
              </Badge>
            </div>
          )}

          {/* Easter egg completed: bottom-left (same icon as dashboard) */}
          {hasCompletedEasterEgg && (
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center justify-center p-1.5 sm:p-2 rounded-lg bg-bunker-950/90 border border-element-600/50 shadow-lg">
              <EasterEggIcon className="w-4 h-4 sm:w-5 sm:h-5 text-element-400" />
            </div>
          )}

          {/* Highest round: bottom-right (BO4: show difficulty tag) */}
          {userHighestRound !== undefined && (
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-1.5 sm:gap-2 min-w-0 max-w-[85%] sm:max-w-none">
              {map.game.shortName === 'BO4' && userHighestRoundDifficulty && (
                <span className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded border border-bunker-500/80 bg-bunker-900/90 text-bunker-300 shrink-0">
                  {getBo4DifficultyLabel(userHighestRoundDifficulty)}
                </span>
              )}
              <RoundCounter round={userHighestRound} size="xs" animated={false} className="sm:hidden shrink-0" />
              <RoundCounter round={userHighestRound} size="sm" animated={false} className="hidden sm:flex shrink-0" />
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-base text-white truncate [text-shadow:0_0_2px_rgba(0,0,0,0.95),0_0_4px_rgba(0,0,0,0.9),0_1px_4px_rgba(0,0,0,0.85)]">
            {map.name}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            <span className="text-xs sm:text-sm text-bunker-200 truncate [text-shadow:0_0_1px_rgba(0,0,0,0.8),0_1px_3px_rgba(0,0,0,0.6)]">{map.game.name}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
