'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, Avatar, Logo } from '@/components/ui';
import { RoundCounter } from '@/components/game';
import { getAssetUrl } from '@/lib/assets';
import { ShieldCheck } from 'lucide-react';

const PLAYER_COUNT_LABEL: Record<string, string> = {
  SOLO: 'Solo',
  DUO: 'Duo',
  TRIO: 'Trio',
  SQUAD: 'Squad',
};

export type PendingVerificationRun = {
  logType: 'challenge' | 'easter_egg';
  logId: string;
  mapSlug: string;
  mapName: string;
  mapImageUrl?: string | null;
  gameShortName: string;
  runLabel: string;
  roundReached?: number;
  roundCompleted?: number | null;
  playerCount: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
};

export function PendingVerificationSection() {
  const [runs, setRuns] = useState<PendingVerificationRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/pending-verification', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { runs: [] }))
      .then((data) => setRuns(data.runs ?? []))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card variant="bordered" className="border-bunker-700">
        <CardContent className="py-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-blood-500" />
        Pending Verification
      </h2>
      <p className="text-sm text-bunker-400 mb-4">
        Runs that players have requested to be verified. Click a run to open it and approve or deny.
      </p>
      {runs.length === 0 ? (
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="py-6 text-center text-bunker-400 text-sm">
            No runs pending verification.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {runs.map((item) => {
            const roundNum = item.roundReached ?? item.roundCompleted ?? null;
            const userName = item.user.displayName || item.user.username;
            const playerLabel = PLAYER_COUNT_LABEL[item.playerCount] || item.playerCount;
            const imageSrc = item.mapImageUrl ? getAssetUrl(item.mapImageUrl) : null;
            const runHref = `/maps/${item.mapSlug}/run/${item.logType === 'challenge' ? 'challenge' : 'easter-egg'}/${item.logId}`;
            return (
              <Link key={`${item.logType}-${item.logId}`} href={runHref} target="_blank" rel="noopener noreferrer">
                <Card variant="bordered" className="border-bunker-700 overflow-hidden hover:border-bunker-600 transition-colors h-full">
                  <div className="relative aspect-video overflow-hidden bg-bunker-900">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={item.mapName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-bunker-800 to-bunker-950 flex items-center justify-center">
                        <Logo size="lg" animated={false} className="opacity-30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bunker-950 via-bunker-950/20 to-transparent" />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border border-blood-600/60 bg-blood-950/95 text-white">
                        {item.gameShortName}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border border-bunker-500/60 bg-bunker-900/95 text-bunker-200">
                        {playerLabel}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1.5">
                      <p className="text-sm font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                        {item.mapName}
                      </p>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-bunker-950/90 border border-bunker-600/80 w-fit">
                        <Avatar
                          src={item.user.avatarUrl}
                          fallback={userName}
                          size="sm"
                          className="shrink-0 w-6 h-6 border border-bunker-600"
                        />
                        <span className="text-xs font-medium text-bunker-200 truncate max-w-[140px] sm:max-w-[180px]">
                          {item.runLabel} · {userName}
                        </span>
                      </div>
                    </div>
                    {roundNum != null && (
                      <div className="absolute bottom-2 right-2">
                        <RoundCounter round={roundNum} size="xs" animated={false} className="sm:hidden" />
                        <RoundCounter round={roundNum} size="sm" animated={false} className="hidden sm:flex" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-bunker-400">Click to open and approve or deny</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
