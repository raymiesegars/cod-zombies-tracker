'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Input, Select, Badge, Logo, MapIcon } from '@/components/ui';
import { MapCard } from '@/components/game';
import type { MapWithGame, Game } from '@/types';
import type { UserMapStats } from '@/types';
import { Search, Filter, X } from 'lucide-react';

type Props = {
  initialMaps: MapWithGame[];
  initialGames: Game[];
};

export function MapsPageClient({ initialMaps, initialGames }: Props) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const [maps, setMaps] = useState<MapWithGame[]>(initialMaps);
  const [games, setGames] = useState<Game[]>(initialGames);
  const [userMapStats, setUserMapStats] = useState<UserMapStats[]>([]);

  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [showDlcOnly, setShowDlcOnly] = useState(false);

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

  useEffect(() => {
    if (pathname === '/maps' && authUser) fetchUserStats();
  }, [pathname, authUser, fetchUserStats]);

  const filteredMaps = useMemo(() => {
    return maps.filter((map) => {
      if (search && !map.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (selectedGame && map.gameId !== selectedGame) {
        return false;
      }
      if (showDlcOnly && !map.isDlc) {
        return false;
      }
      return true;
    });
  }, [maps, search, selectedGame, showDlcOnly]);

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

  const clearFilters = () => {
    setSelectedGame('');
    setShowDlcOnly(false);
  };

  const gameOptions = [
    { value: '', label: 'All Games' },
    ...games.map((game) => ({ value: game.id, label: game.name })),
  ];

  return (
    <div className="min-h-screen bg-bunker-950">
      {/* Header */}
      <div className="bg-bunker-900 border-b border-bunker-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="flex flex-shrink-0 items-center justify-center text-[#b91c1c]" aria-hidden>
                <MapIcon size={40} className="sm:w-10 sm:h-10 w-9 h-9" />
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide">
                All Maps
              </h1>
            </div>
            <p className="text-sm sm:text-base text-bunker-400">
              Explore every Treyarch Zombies map and track your progress
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
                  hasCompletedEasterEgg={stats?.hasCompletedMainEE}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {games
              .filter((game) => mapsByGame[game.id]?.length > 0)
              .map((game) => (
                <section key={game.id}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-zombies text-white tracking-wide [text-shadow:0_0_2px_rgba(0,0,0,0.95),0_0_4px_rgba(0,0,0,0.9),0_1px_4px_rgba(0,0,0,0.85)]">
                      {game.name}
                    </h2>
                    <Badge variant="default" size="sm">
                      {mapsByGame[game.id].length} maps
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {mapsByGame[game.id].map((map) => {
                      const stats = statsByMapId.get(map.id);
                      return (
                        <MapCard
                          key={map.id}
                          map={map}
                          userHighestRound={stats?.highestRound}
                          hasCompletedEasterEgg={stats?.hasCompletedMainEE}
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
