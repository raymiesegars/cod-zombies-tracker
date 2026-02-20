'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Badge, Card, CardContent, EasterEggIcon, Logo, PageLoader, Select } from '@/components/ui';
import { RoundCounter, ChallengeTypeIcon } from '@/components/game';
import { formatCompletionTime } from '@/components/ui/time-input';
import { getAssetUrl } from '@/lib/assets';
import { ChevronLeft, Filter, ListChecks, Clock, ShieldCheck } from 'lucide-react';

type ChallengeLog = {
  id: string;
  mapId: string;
  roundReached: number;
  playerCount: string;
  completedAt: string;
  completionTimeSeconds: number | null;
  notes: string | null;
  isVerified?: boolean;
  challenge: { name: string; type: string };
  map: { slug: string; name: string; imageUrl: string | null; game: { shortName: string } };
};

type EasterEggLog = {
  id: string;
  mapId: string;
  roundCompleted: number | null;
  playerCount: string;
  isSolo: boolean;
  completedAt: string;
  completionTimeSeconds: number | null;
  notes: string | null;
  isVerified?: boolean;
  easterEgg: { name: string };
  map: { slug: string; name: string; imageUrl: string | null; game: { shortName: string } };
};

export default function UserMapRunsPage() {
  const params = useParams();
  const username = params.username as string;
  const mapSlug = params.mapSlug as string;

  const [profile, setProfile] = useState<{ displayName: string; username: string } | null>(null);
  const [mapInfo, setMapInfo] = useState<{ name: string; imageUrl: string | null; gameShortName: string } | null>(null);
  const [challengeLogs, setChallengeLogs] = useState<ChallengeLog[]>([]);
  const [easterEggLogs, setEasterEggLogs] = useState<EasterEggLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runTypeFilter, setRunTypeFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/users/${username}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/users/${username}/maps/${mapSlug}/runs`).then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Not found' : 'Failed to load');
        return r.json();
      }),
    ])
      .then(([userData, runsData]) => {
        if (cancelled) return;
        if (userData) {
          setProfile({ displayName: userData.displayName ?? userData.username, username: userData.username });
        }
        setChallengeLogs(runsData.challengeLogs ?? []);
        setEasterEggLogs(runsData.easterEggLogs ?? []);
        const firstLog = runsData.challengeLogs?.[0] ?? runsData.easterEggLogs?.[0];
        if (firstLog?.map) {
          setMapInfo({
            name: firstLog.map.name,
            imageUrl: firstLog.map.imageUrl,
            gameShortName: firstLog.map.game?.shortName ?? '',
          });
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Something went wrong');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [username, mapSlug]);

  const runTypeOptions = useMemo(() => {
    const names = new Set<string>();
    challengeLogs.forEach((l) => names.add(l.challenge.name));
    easterEggLogs.forEach((l) => names.add(l.easterEgg.name));
    const sorted = Array.from(names).sort((a, b) => a.localeCompare(b));
    return [
      { value: '', label: 'All run types' },
      ...sorted.map((n) => ({ value: n, label: n })),
    ];
  }, [challengeLogs, easterEggLogs]);

  const filteredChallenges = useMemo(() => {
    if (!runTypeFilter) return challengeLogs;
    return challengeLogs.filter((l) => l.challenge.name === runTypeFilter);
  }, [challengeLogs, runTypeFilter]);

  const filteredEasterEggs = useMemo(() => {
    if (!runTypeFilter) return easterEggLogs;
    return easterEggLogs.filter((l) => l.easterEgg.name === runTypeFilter);
  }, [easterEggLogs, runTypeFilter]);

  // Sorted: challenges by round desc, then easter eggs (by roundCompleted desc, then name)
  const sortedRuns = useMemo(() => {
    const withSortKey = [
      ...filteredChallenges.map((log) => ({
        kind: 'challenge' as const,
        round: log.roundReached,
        name: log.challenge.name,
        log,
      })),
      ...filteredEasterEggs.map((log) => ({
        kind: 'easterEgg' as const,
        round: log.roundCompleted ?? 0,
        name: log.easterEgg.name,
        log,
      })),
    ];
    return withSortKey.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'challenge' ? -1 : 1;
      return b.round - a.round || a.name.localeCompare(b.name);
    });
  }, [filteredChallenges, filteredEasterEggs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <PageLoader message="Loading runs..." fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Logo size="xl" animated={false} className="mx-auto mb-4 opacity-50" />
          <p className="text-bunker-400 mb-4">{error === 'Not found' ? 'User or map not found, or profile is private.' : error}</p>
          <Link
            href="/maps"
            className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-4 py-2.5 text-sm font-medium text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Maps
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile?.displayName ?? profile?.username ?? username;

  return (
    <div className="min-h-screen bg-bunker-950">
      <div className="relative h-40 sm:h-52 overflow-hidden bg-bunker-900">
        {mapInfo?.imageUrl ? (
          <Image
            src={getAssetUrl(mapInfo.imageUrl)}
            alt={mapInfo.name ?? ''}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bunker-800 to-bunker-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bunker-950 via-bunker-950/60 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Link
            href={`/users/${username}`}
            className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-3.5 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm hover:border-bunker-400 hover:bg-bunker-700/95"
          >
            <ChevronLeft className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{displayName}&apos;s profile</span>
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-zombies text-white tracking-wide [text-shadow:0_0_2px_rgba(0,0,0,0.95)]">
              {mapInfo?.name ?? mapSlug}
            </h1>
            <p className="text-sm text-white/90 mt-1">
              {displayName}&apos;s logged runs
              {mapInfo?.gameShortName && ` · ${mapInfo.gameShortName}`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-bunker-500 flex-shrink-0" />
          <Select
            options={runTypeOptions}
            value={runTypeFilter}
            onChange={(e) => setRunTypeFilter(e.target.value)}
            className="w-full sm:w-56"
          />
          {runTypeFilter && (
            <button
              type="button"
              onClick={() => setRunTypeFilter('')}
              className="text-sm text-bunker-400 hover:text-blood-400"
            >
              Clear filter
            </button>
          )}
        </div>

        {sortedRuns.length === 0 ? (
          <Card variant="bordered">
            <CardContent className="py-12 text-center">
              <ListChecks className="w-12 h-12 text-bunker-600 mx-auto mb-4" />
              <p className="text-bunker-400">
                {runTypeFilter ? 'No runs match the selected type.' : 'No runs logged on this map.'}
              </p>
              <Link href={`/users/${username}`} className="inline-block mt-4 text-blood-400 hover:text-blood-300 text-sm">
                Back to {displayName}&apos;s profile
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedRuns.map(({ kind, log }) =>
              kind === 'challenge' ? (
                <Link
                  key={`c-${log.id}`}
                  href={`/maps/${mapSlug}/run/challenge/${log.id}`}
                  className="block"
                >
                  <Card variant="bordered" interactive className="transition-opacity hover:opacity-95">
                    <CardContent className="p-3 sm:p-4 grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-x-2 sm:gap-x-3 gap-y-1">
                      <ChallengeTypeIcon type={(log as ChallengeLog).challenge.type ?? 'HIGHEST_ROUND'} className="w-5 h-5 text-blood-400 flex-shrink-0" size={20} />
                      <span className="font-medium text-white truncate min-w-0 flex items-center gap-1.5">
                        {(log as ChallengeLog).challenge.name}
                        {(log as ChallengeLog).isVerified && (
                          <span className="flex-shrink-0 min-w-[1rem] w-4 h-4 inline-flex items-center justify-center rounded-full bg-blue-500/90 text-white" title="Verified run">
                            <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                          </span>
                        )}
                      </span>
                      <span className="w-12 sm:w-14 flex justify-end flex-shrink-0">
                        <RoundCounter round={(log as ChallengeLog).roundReached} size="xs" animated={false} />
                      </span>
                      <span className="hidden sm:flex items-center gap-1.5 text-sm text-bunker-400 flex-shrink-0 col-start-4">
                        <Badge variant="default" size="sm">{(log as ChallengeLog).playerCount}</Badge>
                      </span>
                      {(() => {
                        const sec = (log as ChallengeLog).completionTimeSeconds;
                        const timeTitle = sec != null && sec > 0 ? formatCompletionTime(sec) : undefined;
                        return (
                          <span className="hidden md:flex items-center gap-1.5 text-sm text-bunker-500 flex-shrink-0 col-start-5" title={timeTitle}>
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            {sec != null && sec > 0 ? formatCompletionTime(sec) : '—'}
                          </span>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Link
                  key={`e-${log.id}`}
                  href={`/maps/${mapSlug}/run/easter-egg/${log.id}`}
                  className="block"
                >
                  <Card variant="bordered" interactive className="transition-opacity hover:opacity-95">
                    <CardContent className="p-3 sm:p-4 grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-x-2 sm:gap-x-3 gap-y-1">
                      <EasterEggIcon className="w-5 h-5 text-element-400 flex-shrink-0" />
                      <span className="font-medium text-white truncate min-w-0 flex items-center gap-1.5">
                        {(log as EasterEggLog).easterEgg.name}
                        {(log as EasterEggLog).isVerified && (
                          <span className="flex-shrink-0 min-w-[1rem] w-4 h-4 inline-flex items-center justify-center rounded-full bg-blue-500/90 text-white" title="Verified run">
                            <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                          </span>
                        )}
                      </span>
                      <span className="w-12 sm:w-14 flex justify-end flex-shrink-0">
                        {(log as EasterEggLog).roundCompleted != null ? (
                          <RoundCounter round={(log as EasterEggLog).roundCompleted!} size="xs" animated={false} />
                        ) : (
                          <span className="text-xs text-bunker-500">—</span>
                        )}
                      </span>
                      <span className="hidden sm:flex items-center gap-2 flex-shrink-0 col-start-4">
                        <span className="text-sm text-bunker-400">{(log as EasterEggLog).playerCount}</span>
                        {(log as EasterEggLog).isSolo && <Badge variant="default" size="sm">Solo</Badge>}
                      </span>
                      {(() => {
                        const sec = (log as EasterEggLog).completionTimeSeconds;
                        const timeTitle = sec != null && sec > 0 ? formatCompletionTime(sec) : undefined;
                        return (
                          <span className="hidden md:flex items-center gap-1.5 text-sm text-bunker-500 flex-shrink-0 col-start-5" title={timeTitle}>
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            {sec != null && sec > 0 ? formatCompletionTime(sec) : '—'}
                          </span>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
