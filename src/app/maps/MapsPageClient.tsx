'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Input, Select, Badge, Logo, MapIcon } from '@/components/ui';
import { MapCard } from '@/components/game';
import { MapsPageGameOrderModal } from './MapsPageGameOrderModal';
import { SubmitMapModal } from './SubmitMapModal';
import { isBo3CustomGame } from '@/lib/bo3-custom';
import type { MapWithGame, Game } from '@/types';
import type { UserMapStats } from '@/types';
import { Search, Filter, X, Settings, Plus, MapPin } from 'lucide-react';

const MAPS_PAGE_SETUP_SEEN_KEY = 'maps-page-setup-seen';
const MAPS_PAGE_FILTERS_KEY = 'maps-page-filters';

function getMapsPageSetupSeenFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MAPS_PAGE_SETUP_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function setMapsPageSetupSeenInStorage() {
  try {
    if (typeof window !== 'undefined') localStorage.setItem(MAPS_PAGE_SETUP_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

function getMapsPageFiltersFromStorage(): { search: string; selectedGame: string; showDlcOnly: boolean } {
  if (typeof window === 'undefined') return { search: '', selectedGame: '', showDlcOnly: false };
  try {
    const raw = localStorage.getItem(MAPS_PAGE_FILTERS_KEY);
    if (!raw) return { search: '', selectedGame: '', showDlcOnly: false };
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') {
      const o = parsed as Record<string, unknown>;
      return {
        search: typeof o.search === 'string' ? o.search : '',
        selectedGame: typeof o.selectedGame === 'string' ? o.selectedGame : '',
        showDlcOnly: Boolean(o.showDlcOnly),
      };
    }
  } catch {
    // ignore
  }
  return { search: '', selectedGame: '', showDlcOnly: false };
}

function setMapsPageFiltersInStorage(search: string, selectedGame: string, showDlcOnly: boolean) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MAPS_PAGE_FILTERS_KEY, JSON.stringify({ search, selectedGame, showDlcOnly }));
    }
  } catch {
    // ignore
  }
}

type Props = {
  initialMaps: MapWithGame[];
  initialGames: Game[];
  openSubmitModal?: boolean;
};

export function MapsPageClient({ initialMaps, initialGames, openSubmitModal }: Props) {
  const pathname = usePathname();
  const { user: authUser, profile } = useAuth();
  const [showSubmitModal, setShowSubmitModal] = useState(Boolean(openSubmitModal));
  const [maps, setMaps] = useState<MapWithGame[]>(initialMaps);
  const [games, setGames] = useState<Game[]>(initialGames);
  const [userMapStats, setUserMapStats] = useState<UserMapStats[]>([]);

  const [mapsPageGameOrder, setMapsPageGameOrder] = useState<string[]>([]);
  const [mapsPageHasSeenSetup, setMapsPageHasSeenSetup] = useState(false);
  const [mapsPagePrefsLoaded, setMapsPagePrefsLoaded] = useState(false);
  const [showGameOrderModal, setShowGameOrderModal] = useState(false);
  const [showGameOrderFirstTime, setShowGameOrderFirstTime] = useState(false);

  const [filters, setFilters] = useState(() => getMapsPageFiltersFromStorage());
  const { search, selectedGame, showDlcOnly } = filters;

  useEffect(() => {
    setMapsPageFiltersInStorage(filters.search, filters.selectedGame, filters.showDlcOnly);
  }, [filters.search, filters.selectedGame, filters.showDlcOnly]);

  const setSearch = useCallback((v: string) => setFilters((f) => ({ ...f, search: v })), []);
  const setSelectedGame = useCallback((v: string) => setFilters((f) => ({ ...f, selectedGame: v })), []);
  const setShowDlcOnly = useCallback((v: boolean) => setFilters((f) => ({ ...f, showDlcOnly: v })), []);

  const fetchUserStats = useCallback(async () => {
    if (!authUser) return;
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const mapStatsRes = await fetch(`${base}/api/me/map-stats`, { credentials: 'same-origin' });
      if (mapStatsRes?.ok && 'json' in mapStatsRes) {
        const { mapStats } = await mapStatsRes.json();
        setUserMapStats(mapStats ?? []);
      } else {
        setUserMapStats([]);
      }
    } catch {
      setUserMapStats([]);
    }
  }, [authUser]);

  const fetchMapsPagePrefs = useCallback(async () => {
    if (!authUser) return;
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`${base}/api/me/maps-page-preferences?_=${Date.now()}`, { credentials: 'same-origin', cache: 'no-store' });
      if (res?.ok) {
        const data = await res.json();
        setMapsPageGameOrder(Array.isArray(data.gameOrder) ? data.gameOrder : []);
        const fromServer = Boolean(data.hasSeenSetupModal);
        const fromStorage = getMapsPageSetupSeenFromStorage();
        const hasSeen = fromServer || fromStorage;
        if (fromServer) setMapsPageSetupSeenInStorage();
        setMapsPageHasSeenSetup(hasSeen);
      }
    } catch {
      // On fetch error (e.g. deployment auth issue), fall back to localStorage so modal doesn't show every time
      setMapsPageHasSeenSetup(getMapsPageSetupSeenFromStorage());
    } finally {
      setMapsPagePrefsLoaded(true);
    }
  }, [authUser]);

  useEffect(() => {
    if (pathname === '/maps' && authUser) fetchUserStats();
  }, [pathname, authUser, fetchUserStats]);

  useEffect(() => {
    if (authUser) fetchMapsPagePrefs();
    else {
      // Don't set mapsPagePrefsLoaded true here: on refresh auth loads after first paint,
      // and we'd show the modal before the prefs fetch runs. Only set loaded when fetch finishes.
      setMapsPagePrefsLoaded(false);
    }
  }, [authUser, fetchMapsPagePrefs]);

  useEffect(() => {
    if (!authUser || !mapsPagePrefsLoaded || mapsPageHasSeenSetup) return;
    setShowGameOrderModal(true);
    setShowGameOrderFirstTime(true);
  }, [authUser, mapsPagePrefsLoaded, mapsPageHasSeenSetup]);

  const saveMapsPagePrefs = useCallback(
    async (gameOrder: string[], markSetupSeen: boolean) => {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`${base}/api/me/maps-page-preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          gameOrder,
          ...(markSetupSeen ? { hasSeenSetupModal: true } : {}),
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setMapsPageGameOrder(Array.isArray(data.gameOrder) ? data.gameOrder : []);
      if (markSetupSeen) {
        setMapsPageHasSeenSetup(true);
        setMapsPageSetupSeenInStorage();
      }
    },
    []
  );

  const hideCustomZombies = Boolean(profile && (profile as { hideCustomZombiesEverywhere?: boolean }).hideCustomZombiesEverywhere);

  const orderedGames = useMemo(() => {
    if (games.length === 0) return [];
    let base: Game[];
    if (mapsPageGameOrder.length === 0) {
      base = [...games].sort((a, b) => a.order - b.order);
    } else {
      const orderIds = mapsPageGameOrder.filter((id) => games.some((g) => g.id === id));
      base = [];
      for (const id of orderIds) {
        const g = games.find((game) => game.id === id);
        if (g) base.push(g);
      }
      const notInOrder = games.filter((g) => !orderIds.includes(g.id));
      base.push(...[...notInOrder].sort((a, b) => a.order - b.order));
    }
    if (hideCustomZombies) return base.filter((g) => !isBo3CustomGame(g.shortName));
    const custom = base.find((g) => isBo3CustomGame(g.shortName));
    if (!custom) return base;
    return [...base.filter((g) => !isBo3CustomGame(g.shortName)), custom];
  }, [games, mapsPageGameOrder, hideCustomZombies]);

  const filteredMaps = useMemo(() => {
    return maps.filter((map) => {
      if (hideCustomZombies && isBo3CustomGame(map.game?.shortName)) return false;
      if (search && !map.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedGame && map.gameId !== selectedGame) return false;
      if (showDlcOnly && !map.isDlc) return false;
      return true;
    });
  }, [maps, search, selectedGame, showDlcOnly, hideCustomZombies]);

  const mapsByGame = useMemo(() => {
    const grouped: Record<string, MapWithGame[]> = {};
    for (const map of filteredMaps) {
      const gameId = map.game.id;
      if (!grouped[gameId]) grouped[gameId] = [];
      grouped[gameId].push(map);
    }
    return grouped;
  }, [filteredMaps]);

  const statsByMapId = useMemo(() => {
    const m = new Map<string, UserMapStats>();
    for (const s of userMapStats) m.set(s.mapId, s);
    return m;
  }, [userMapStats]);

  const hasActiveFilters = selectedGame || showDlcOnly;

  const clearFilters = useCallback(() => {
    setFilters((f) => ({ ...f, selectedGame: '', showDlcOnly: false }));
  }, []);

  const gameOptions = useMemo(
    () => [
      { value: '', label: 'All Games' },
      ...games
        .filter((g) => !hideCustomZombies || !isBo3CustomGame(g.shortName))
        .map((game) => ({ value: game.id, label: game.name })),
    ],
    [games, hideCustomZombies]
  );

  const visibleOrderedGames = useMemo(
    () =>
      orderedGames.filter(
        (game) =>
          (mapsByGame[game.id]?.length ?? 0) > 0 ||
          (isBo3CustomGame(game.shortName) && !hideCustomZombies)
      ),
    [orderedGames, mapsByGame, hideCustomZombies]
  );

  return (
    <div className="min-h-screen bg-bunker-950">
      {/* Header */}
      <div className="bg-bunker-900 border-b border-bunker-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col gap-3 sm:gap-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between gap-3 sm:justify-start min-w-0">
                <span className="flex flex-shrink-0 items-center justify-center text-[#b91c1c]" aria-hidden>
                  <MapIcon size={40} className="sm:w-10 sm:h-10 w-9 h-9" />
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide">
                  All Maps
                </h1>
                {authUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowGameOrderFirstTime(false);
                      setShowGameOrderModal(true);
                    }}
                    className="flex-shrink-0 p-2.5 rounded-lg border border-bunker-600 bg-bunker-800/80 text-bunker-300 hover:border-blood-800/50 hover:text-blood-400 transition-colors sm:ml-auto"
                    title="Customize which games appear and in what order"
                    aria-label="Maps page settings"
                  >
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>
              {authUser && !hideCustomZombies && (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-xl text-base font-semibold bg-blood-600 hover:bg-blood-500 text-white border border-blood-500/50 shadow-lg shadow-blood-900/40 transition-colors [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
                >
                  <MapPin className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Submit Custom Map</span>
                </button>
              )}
            </div>
            <p className="text-sm sm:text-base text-bunker-400">
              Explore every CoD Zombies map and track your progress
            </p>
            <p className="text-sm text-bunker-500 mt-2 max-w-2xl">
              Step-by-step Easter egg guides, buildables, and side eggs for every map. Track main quest and challenge progress, log high rounds and speedruns, and find groups—all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bunker-950 border-b border-bunker-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="w-full">
              <Input
                placeholder="Search maps..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
                rightIcon={
                  search ? (
                    <button onClick={() => setSearch('')}>
                      <X className="w-4 h-4 sm:w-5 sm:h-5 hover:text-blood-400" />
                    </button>
                  ) : undefined
                }
              />
            </div>
            <div className="w-full max-w-xs sm:max-w-sm">
              <Select
                options={gameOptions}
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full max-w-full"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4">
              <Filter className="w-4 h-4 text-bunker-400" />
              <span className="text-xs sm:text-sm text-bunker-400">Filters:</span>
              {selectedGame && (
                <Badge variant="blood" size="sm" className="cursor-pointer" onClick={() => setSelectedGame('')}>
                  {games.find((g) => g.id === selectedGame)?.name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {showDlcOnly && (
                <Badge variant="purple" size="sm" className="cursor-pointer" onClick={() => setShowDlcOnly(false)}>
                  DLC Only
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              <button onClick={clearFilters} className="text-xs sm:text-sm text-bunker-400 hover:text-blood-400 ml-2">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Grid - content is in initial HTML so crawlers see full list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {filteredMaps.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Logo size="xl" animated={false} className="mx-auto mb-4 opacity-50" />
            <p className="text-bunker-400 text-base sm:text-lg">No maps found matching your filters.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blood-400 hover:text-blood-300"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : selectedGame ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredMaps.map((map) => {
              const stats = statsByMapId.get(map.id);
              return (
                <MapCard
                  key={map.id}
                  map={map}
                  userHighestRound={stats?.highestRound}
                  userHighestRoundDifficulty={stats?.highestRoundDifficulty}
                  hasCompletedEasterEgg={stats?.hasCompletedMainEE}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {visibleOrderedGames.map((game) => (
                <section key={game.id}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-zombies text-white tracking-wide [text-shadow:0_0_2px_rgba(0,0,0,0.95),0_0_4px_rgba(0,0,0,0.9),0_1px_4px_rgba(0,0,0,0.85)]">
                      {game.name}
                    </h2>
                    <Badge variant="default" size="sm">
                      {(mapsByGame[game.id] ?? []).length} maps
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {(mapsByGame[game.id] ?? []).map((map) => {
                      const stats = statsByMapId.get(map.id);
                      return (
                        <MapCard
                          key={map.id}
                          map={map}
                          userHighestRound={stats?.highestRound}
                          userHighestRoundDifficulty={stats?.highestRoundDifficulty}
                          hasCompletedEasterEgg={stats?.hasCompletedMainEE}
                        />
                      );
                    })}
                    {isBo3CustomGame(game.shortName) && authUser && (
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(true)}
                        className="group relative bg-bunker-800/50 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-bunker-600 hover:border-blood-600/60 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] gap-3 px-4"
                      >
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blood-950/70 border border-blood-600/60 text-blood-400 group-hover:text-blood-300 transition-colors">
                          <Plus className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-sm sm:text-base text-bunker-200 group-hover:text-white transition-colors text-center">
                          Submit a New Map
                        </span>
                        <span className="text-xs text-bunker-500 text-center">Suggest a custom map for review</span>
                      </button>
                    )}
                  </div>
                </section>
            ))}
          </div>
        )}
      </div>

      {authUser && (
        <>
        <SubmitMapModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} onSuccess={fetchUserStats} />
        <MapsPageGameOrderModal
          isOpen={showGameOrderModal}
          onClose={(closedWithoutSave) => {
            // When closing the first-time modal without saving (Cancel/X/backdrop), still mark setup as seen so it doesn't show on every visit
            if (closedWithoutSave !== false && showGameOrderFirstTime) {
              setMapsPageSetupSeenInStorage();
              saveMapsPagePrefs(mapsPageGameOrder, true).then(
                () => setMapsPageHasSeenSetup(true),
                () => {}
              );
            }
            setShowGameOrderModal(false);
            setShowGameOrderFirstTime(false);
          }}
          games={hideCustomZombies ? games.filter((g) => !isBo3CustomGame(g.shortName)) : games}
          initialGameOrder={mapsPageGameOrder}
          initialHasSeenSetupModal={mapsPageHasSeenSetup}
          onSave={saveMapsPagePrefs}
          isFirstTimePrompt={showGameOrderFirstTime}
        />
        </>
      )}
    </div>
  );
}
