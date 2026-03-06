'use client';

import Link from 'next/link';
import { Card, CardContent, Badge } from '@/components/ui';
import { RoundCounter, ChallengeTypeIcon } from '@/components/game';
import { EasterEggIcon } from '@/components/ui/easter-egg-icon';
import { formatCompletionTime } from '@/components/ui/time-input';
import { getPlayerCountLabel } from '@/lib/utils';
import { Clock, ShieldCheck } from 'lucide-react';

type ChallengeLog = {
  id: string;
  roundReached: number;
  playerCount: string;
  completionTimeSeconds: number | null;
  isVerified?: boolean;
  challenge: { id?: string; name: string; type: string };
};

type EasterEggLog = {
  id: string;
  roundCompleted: number | null;
  playerCount: string;
  completionTimeSeconds: number | null;
  isVerified?: boolean;
  isSolo?: boolean;
  easterEgg: { id?: string; name: string };
};

export type RunItem =
  | { kind: 'challenge'; log: ChallengeLog }
  | { kind: 'easterEgg'; log: EasterEggLog };

const ROW_GRID =
  'grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:grid-cols-[auto_minmax(0,1fr)_4.5rem_auto_auto] items-center gap-x-2 sm:gap-x-3 min-w-0';

export function RunCard({
  run,
  mapSlug,
  className,
}: {
  run: RunItem;
  mapSlug: string;
  className?: string;
}) {
  const isChallenge = run.kind === 'challenge';
  const log = run.log;
  const href =
    run.kind === 'challenge'
      ? `/maps/${mapSlug}/run/challenge/${run.log.id}`
      : `/maps/${mapSlug}/run/easter-egg/${run.log.id}`;
  const sec = (log as ChallengeLog & EasterEggLog).completionTimeSeconds;
  const showTime = sec != null && sec > 0;

  return (
    <Link href={href} className={`block min-w-0 ${className ?? ''}`}>
      <Card variant="bordered" interactive className="transition-opacity hover:opacity-95">
        <CardContent className="p-3 sm:p-4">
          <div className={ROW_GRID}>
            {isChallenge ? (
              <ChallengeTypeIcon
                type={(log as ChallengeLog).challenge.type ?? 'HIGHEST_ROUND'}
                className="w-5 h-5 text-blood-400 flex-shrink-0"
                size={20}
              />
            ) : (
              <EasterEggIcon className="w-5 h-5 text-element-400 flex-shrink-0" />
            )}
            <span className="font-medium text-white truncate min-w-0 flex items-center gap-1.5">
              {isChallenge
                ? (log as ChallengeLog).challenge.name
                : (log as EasterEggLog).easterEgg.name}
              {(log as ChallengeLog & EasterEggLog).isVerified && (
                <span
                  className="flex-shrink-0 w-4 h-4 inline-flex justify-center rounded-full bg-blue-500/90 text-white"
                  title="Verified"
                >
                  <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                </span>
              )}
            </span>
            <span className="hidden md:flex items-center justify-end gap-1.5 text-sm text-bunker-500 flex-shrink-0 tabular-nums w-[4.5rem]">
              {showTime ? (
                <>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  {formatCompletionTime(sec!)}
                </>
              ) : (
                <span className="text-bunker-500">—</span>
              )}
            </span>
            <span className="hidden sm:flex items-center justify-end flex-shrink-0">
              <Badge variant="default" size="sm">
                {getPlayerCountLabel(log.playerCount)}
              </Badge>
              {!isChallenge && (log as EasterEggLog).isSolo && (
                <Badge variant="default" size="sm" className="ml-1">
                  Solo
                </Badge>
              )}
            </span>
            <span className="flex justify-end flex-shrink-0 min-w-[3rem]">
              {isChallenge ? (
                <RoundCounter round={(log as ChallengeLog).roundReached} size="xs" animated={false} />
              ) : (log as EasterEggLog).roundCompleted != null ? (
                <RoundCounter
                  round={(log as EasterEggLog).roundCompleted!}
                  size="xs"
                  animated={false}
                />
              ) : (
                <span className="text-xs text-bunker-500">—</span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
