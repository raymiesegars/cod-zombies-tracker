'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge, Card, CardContent, EasterEggIcon, Logo, PageLoader, Select } from '@/components/ui';
import { RoundCounter, RunCard } from '@/components/game';
import { getAssetUrl } from '@/lib/assets';
import { ACHIEVEMENT_CATEGORY_LABELS, challengeTypeToCategory, isSpeedrunCategory } from '@/lib/achievements/categories';
import { getBo4DifficultyLabel } from '@/lib/bo4';
import type { UserMapStats, UserProfile } from '@/types';
import { Filter, ChevronLeft } from 'lucide-react';

type ChallengeLog = {
  id: string;
  roundReached: number;
  playerCount: string;
  completionTimeSeconds: number | null;
  isVerified?: boolean;
  challenge: { id: string; name: string; type: string };
  map: { slug: string };
};

type EasterEggLog = {
  id: string;
  roundCompleted: number | null;
  playerCount: string;
  completionTimeSeconds: number | null;
  isVerified?: boolean;
  easterEgg: { id: string; name: string };
  map: { slug: string };
};

type RunItem =
  | { kind: 'challenge'; log: ChallengeLog }
  | { kind: 'easterEgg'; log: EasterEggLog };

function getCategoryFromRun(run: RunItem): string {
  if (run.kind === 'challenge') return challengeTypeToCategory(run.log.challenge.type);
  return run.log.completionTimeSeconds != null ? 'EASTER_EGG_SPEEDRUN' : 'EASTER_EGG';
}

function getRunSortValue(run: RunItem): number {
  if (run.kind === 'challenge') {
    const log = run.log as ChallengeLog;
    if (isSpeedrunCategory(log.challenge.type) && log.completionTimeSeconds != null) {
      return -log.completionTimeSeconds;
    }
    return log.roundReached;
  }
  const log = run.log as EasterEggLog;
  if (log.completionTimeSeconds != null) return -log.completionTimeSeconds;
  return log.roundCompleted ?? 0;
}

export function MapsSection({
  mapStats,
  username,
  isOwnProfile,
  profile,
}: {
  mapStats: UserMapStats[];
  username: string;
  isOwnProfile: boolean;
  profile?: UserProfile | null;
}) {
  const [filterGame, setFilterGame] = useState('');
  const [filterMap, setFilterMap] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [mapRuns, setMapRuns] = useState<{ challengeLogs: ChallengeLog[]; easterEggLogs: EasterEggLog[] } | null>(null);
  const [runsLoading, setRunsLoading] = useState(false);

  const displayUsername = profile?.username ?? username;

  const games = useMemo(() => {
    const byId = new Map<string, { gameId: string; gameShortName: string; gameOrder: number }>();
    for (const s of mapStats) {
      const gid = s.gameId ?? '';
      const gOrder = s.gameOrder ?? 999;
      if (gid && !byId.has(gid)) {
        byId.set(gid, { gameId: gid, gameShortName: s.gameShortName, gameOrder: gOrder });
      }
    }
    return Array.from(byId.values()).sort((a, b) => a.gameOrder - b.gameOrder);
  }, [mapStats]);

  const filteredMaps = useMemo(() => {
    let list = mapStats;
    if (filterGame) {
      list = list.filter((s) => s.gameId === filterGame);
    }
    const mOrder = (m: UserMapStats) => m.mapOrder ?? 999;
    const gOrder = (m: UserMapStats) => m.gameOrder ?? 999;
    return [...list].sort((a, b) => gOrder(a) - gOrder(b) || mOrder(a) - mOrder(b) || a.mapName.localeCompare(b.mapName));
  }, [mapStats, filterGame]);

  const mapOptions = useMemo(() => {
    return filteredMaps.map((m) => ({ value: m.mapId, label: m.mapName }));
  }, [filteredMaps]);

  const selectedMapData = useMemo(
    () => (filterMap ? filteredMaps.find((m) => m.mapId === filterMap) : null),
    [filterMap, filteredMaps]
  );

  const mapSlugToFetch = selectedMapData?.mapSlug;
  useEffect(() => {
    if (!filterMap || !username || !mapSlugToFetch) {
      setMapRuns(null);
      return;
    }
    let cancelled = false;
    setRunsLoading(true);
    fetch(`/api/users/${username}/maps/${mapSlugToFetch}/runs`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { challengeLogs: [], easterEggLogs: [] }))
      .then((data) => {
        if (!cancelled) setMapRuns(data);
      })
      .catch(() => {
        if (!cancelled) setMapRuns({ challengeLogs: [], easterEggLogs: [] });
      })
      .finally(() => {
        if (!cancelled) setRunsLoading(false);
      });
    return () => { cancelled = true; };
  }, [username, filterMap, mapSlugToFetch]);

  const allRuns = useMemo((): RunItem[] => {
    if (!mapRuns) return [];
    const items: RunItem[] = [
      ...mapRuns.challengeLogs.map((l) => ({ kind: 'challenge' as const, log: l })),
      ...mapRuns.easterEggLogs.map((l) => ({ kind: 'easterEgg' as const, log: l })),
    ];
    return items.sort((a, b) => getRunSortValue(b) - getRunSortValue(a));
  }, [mapRuns]);

  const categoriesInRuns = useMemo(() => {
    const cats = new Set<string>();
    for (const run of allRuns) cats.add(getCategoryFromRun(run));
    return Array.from(cats).sort((a, b) => {
      const orderA = Object.keys(ACHIEVEMENT_CATEGORY_LABELS).indexOf(a);
      const orderB = Object.keys(ACHIEVEMENT_CATEGORY_LABELS).indexOf(b);
      if (orderA >= 0 && orderB >= 0) return orderA - orderB;
      return (ACHIEVEMENT_CATEGORY_LABELS[a] ?? a).localeCompare(ACHIEVEMENT_CATEGORY_LABELS[b] ?? b);
    });
  }, [allRuns]);

  const bestRunsPerChallenge = useMemo(() => {
    const best = new Map<string, RunItem>();
    for (const run of allRuns) {
      const key = run.kind === 'challenge' ? run.log.challenge.id : `ee-${run.log.easterEgg.id}`;
      if (!best.has(key)) best.set(key, run);
    }
    return Array.from(best.values()).sort((a, b) => getRunSortValue(b) - getRunSortValue(a));
  }, [allRuns]);

  const runsInCategory = useMemo(() => {
    if (!filterCategory) return [];
    return allRuns.filter((r) => getCategoryFromRun(r) === filterCategory);
  }, [allRuns, filterCategory]);

  const displayRuns = filterCategory ? runsInCategory : bestRunsPerChallenge;

  const handleGameChange = useCallback((v: string) => {
    setFilterGame(v);
    setFilterMap('');
    setFilterCategory('');
  }, []);

  const handleMapChange = useCallback((v: string) => {
    setFilterMap(v);
    setFilterCategory('');
  }, []);

  return (
    <section className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-zombies text-white mb-3 sm:mb-4 tracking-wide">
        Maps Played
      </h2>

      {mapStats.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <Filter className="w-4 h-4 text-bunker-500 flex-shrink-0" />
            <Select
              options={[
                { value: '', label: 'All games' },
                ...games.map((g) => ({ value: g.gameId, label: g.gameShortName })),
              ]}
              value={filterGame}
              onChange={(e) => handleGameChange(e.target.value)}
              className="w-full min-[400px]:w-36"
            />
            <Select
              options={[
                { value: '', label: filterGame ? 'Select map…' : 'Select game first' },
                ...mapOptions,
              ]}
              value={filterMap}
              onChange={(e) => handleMapChange(e.target.value)}
              className="w-full min-[400px]:w-44"
              disabled={!filterGame}
            />
            {filterMap && categoriesInRuns.length > 0 && (
              <Select
                options={[
                  { value: '', label: 'Best per challenge' },
                  ...categoriesInRuns.map((c) => ({
                    value: c,
                    label: ACHIEVEMENT_CATEGORY_LABELS[c] ?? c,
                  })),
                ]}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full min-[400px]:w-44"
              />
            )}
          </div>

          {!filterMap ? (
            <div className="max-h-[380px] overflow-y-auto rounded-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {filteredMaps.map((stats) => (
                  <Link
                    key={stats.mapId}
                    href={isOwnProfile ? `/maps/${stats.mapSlug}?tab=your-runs` : `/users/${displayUsername}/maps/${stats.mapSlug}/runs`}
                  >
                    <Card variant="bordered" interactive className="h-full">
                      <CardContent className="p-3 sm:py-4">
                        <div className="relative aspect-[4/3] mb-2 sm:mb-3 rounded-lg overflow-hidden bg-bunker-800">
                          {stats.mapImageUrl ? (
                            <Image
                              src={getAssetUrl(stats.mapImageUrl)}
                              alt={stats.mapName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Logo size="md" animated={false} className="opacity-30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-bunker-950/80 via-transparent to-transparent" />
                          {(stats.hasCompletedMainEE || stats.highestRound > 0) && (
                            <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1">
                              {stats.hasCompletedMainEE && (
                                <div className="flex items-center justify-center p-1.5 rounded-lg bg-bunker-950/90 border border-element-600/50 shadow-lg">
                                  <EasterEggIcon className="w-4 h-4 sm:w-5 sm:h-5 text-element-400" />
                                </div>
                              )}
                              <RoundCounter round={stats.highestRound} size="xs" animated={false} />
                            </div>
                          )}
                          {stats.gameShortName === 'BO4' && stats.highestRoundDifficulty && (
                            <div className="absolute bottom-2 right-2">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-bunker-500/80 bg-bunker-900/90 text-bunker-300">
                                {getBo4DifficultyLabel(stats.highestRoundDifficulty)}
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-xs sm:text-sm text-white truncate">{stats.mapName}</h3>
                        <div className="flex items-center justify-between mt-1 sm:mt-2">
                          <Badge variant="default" size="sm">{stats.gameShortName}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : runsLoading ? (
            <Card variant="bordered">
              <CardContent className="py-12 text-center">
                <PageLoader message="Loading runs…" inline />
              </CardContent>
            </Card>
          ) : displayRuns.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="py-8 text-center">
                <p className="text-bunker-400 text-sm">
                  {filterCategory
                    ? `No runs in ${ACHIEVEMENT_CATEGORY_LABELS[filterCategory] ?? filterCategory}.`
                    : 'No runs on this map.'}
                </p>
                <button
                  type="button"
                  onClick={() => setFilterMap('')}
                  className="mt-3 text-blood-400 hover:text-blood-300 text-sm inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to maps
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-bunker-300">
                  {selectedMapData?.mapName}
                  {filterCategory && ` · ${ACHIEVEMENT_CATEGORY_LABELS[filterCategory] ?? filterCategory}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setFilterMap('')}
                  className="text-xs text-bunker-400 hover:text-blood-400 inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>
              </div>
              {displayRuns.map((run) => (
                <RunCard key={`${run.kind}-${run.log.id}`} run={run} mapSlug={selectedMapData!.mapSlug} />
              ))}
            </div>
          )}
        </>
      ) : (
        <Card variant="bordered">
          <CardContent className="py-8 sm:py-12 text-center">
            <Logo size="lg" animated={false} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base text-bunker-400">
              {isOwnProfile ? "You haven't logged any progress yet." : 'No maps played yet.'}
            </p>
            {isOwnProfile && (
              <Link href="/maps" className="inline-block mt-4 text-blood-400 hover:text-blood-300 text-sm">
                Start tracking your progress →
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
