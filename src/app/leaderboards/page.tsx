'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Select, Input, Logo, PageLoader, HelpTrigger } from '@/components/ui';
import { LeaderboardEntry, LeaderboardsHelpContent } from '@/components/game';
import type { LeaderboardEntry as LeaderboardEntryType, Game, MapWithGame, PlayerCount, ChallengeType } from '@/types';
import { Trophy, Medal, Filter, Search, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const RANK_VIEW = '__rank__'; // Sentinel: show site-wide Rank by XP leaderboard
const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

const challengeTypeLabels: Record<ChallengeType, string> = {
  HIGHEST_ROUND: 'Highest Round',
  NO_DOWNS: 'No Downs',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  STARTING_ROOM: 'Starting Room Only',
  ONE_BOX: 'One Box Challenge',
  PISTOL_ONLY: 'Pistol Only',
  NO_POWER: 'No Power',
};

export default function LeaderboardsPage() {
  const { profile } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [maps, setMaps] = useState<MapWithGame[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryType[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  const [selectedGame, setSelectedGame] = useState(RANK_VIEW);
  const [selectedMap, setSelectedMap] = useState('');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<PlayerCount | ''>('');
  const [selectedChallengeType, setSelectedChallengeType] = useState<ChallengeType | ''>('HIGHEST_ROUND');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchForFetch, setSearchForFetch] = useState(''); // Debounced; drives server-side search

  const isRankView = selectedGame === RANK_VIEW;

  // Debounce search: clear immediately, type delay 300ms so we search all users on the server
  useEffect(() => {
    const q = searchQuery.trim();
    if (q === '') {
      setSearchForFetch('');
      return;
    }
    const t = setTimeout(() => setSearchForFetch(q), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const isSearchActive = searchForFetch.length > 0;

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesRes, mapsRes] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/maps'),
        ]);

        if (gamesRes.ok) {
          const gamesData = await gamesRes.json();
          setGames(gamesData);
        }

        if (mapsRes.ok) {
          const mapsData = await mapsRes.json();
          setMaps(mapsData);
          // On initial load, only set first map when not on Rank view
          if (mapsData.length > 0 && selectedGame !== RANK_VIEW) {
            setSelectedMap(mapsData[0].slug);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount; selectedGame is intentionally read once for initial state
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (isRankView) {
        setIsLoading(true);
        try {
          const params = new URLSearchParams();
          params.set('offset', '0');
          params.set('limit', String(PAGE_SIZE));
          if (searchForFetch) params.set('search', searchForFetch);
          const res = await fetch(`/api/leaderboards/rank?${params}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            setTotal(data.total ?? 0);
            setLeaderboard(data.entries ?? []);
          }
        } catch (error) {
          console.error('Error fetching rank leaderboard:', error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (!selectedMap) {
        setTotal(0);
        setLeaderboard([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('offset', '0');
        params.set('limit', String(searchForFetch ? 100 : PAGE_SIZE));
        if (selectedPlayerCount) params.set('playerCount', selectedPlayerCount);
        if (selectedChallengeType) params.set('challengeType', selectedChallengeType);
        if (searchForFetch) params.set('search', searchForFetch);

        const res = await fetch(`/api/maps/${selectedMap}/leaderboard?${params}`);
        if (res.ok) {
          const data = await res.json();
          setTotal(data.total ?? 0);
          setLeaderboard(data.entries ?? []);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [isRankView, selectedMap, selectedPlayerCount, selectedChallengeType, searchForFetch]);

  const loadMore = useCallback(async () => {
    if (leaderboard.length >= total || total === 0) return;
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    const offset = leaderboard.length;
    try {
      if (isRankView) {
        const res = await fetch(`/api/leaderboards/rank?offset=${offset}&limit=${PAGE_SIZE}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const nextEntries = data.entries ?? [];
          setLeaderboard((prev) => {
            const seen = new Set(prev.map((e) => e.user.id));
            const newEntries = nextEntries.filter((e: LeaderboardEntryType) => !seen.has(e.user.id));
            return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
          });
        }
      } else if (selectedMap) {
        const params = new URLSearchParams();
        params.set('offset', String(offset));
        params.set('limit', String(PAGE_SIZE));
        if (selectedPlayerCount) params.set('playerCount', selectedPlayerCount);
        if (selectedChallengeType) params.set('challengeType', selectedChallengeType);
        const res = await fetch(`/api/maps/${selectedMap}/leaderboard?${params}`);
        if (res.ok) {
          const data = await res.json();
          const nextEntries = data.entries ?? [];
          setLeaderboard((prev) => {
            const seen = new Set(prev.map((e) => e.user.id));
            const key = (e: LeaderboardEntryType) => `${e.user.id}-${e.playerCount}`;
            const seenKey = new Set(prev.map(key));
            const newEntries = nextEntries.filter((e: LeaderboardEntryType) => !seenKey.has(key(e)));
            return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
          });
        }
      }
    } catch (error) {
      console.error('Error loading more leaderboard entries:', error);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [isRankView, selectedMap, selectedPlayerCount, selectedChallengeType, leaderboard.length, total]);

  // Only observe sentinel when search is empty so list stays stable while filtering
  useEffect(() => {
    if (isSearchActive || leaderboard.length === 0 || leaderboard.length >= total) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (observed) => {
        if (observed[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '0px 0px 400px 0px', threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isSearchActive, loadMore, leaderboard.length, total]);

  const filteredMaps = selectedGame
    ? maps.filter((map) => map.gameId === selectedGame)
    : maps;

  const gameOptions = [
    { value: RANK_VIEW, label: 'Rank (by XP)' },
    { value: '', label: 'All Games' },
    ...games.map((game) => ({ value: game.id, label: game.name })),
  ];

  const mapOptions = [
    { value: '', label: 'Select a map' },
    ...filteredMaps.map((map) => ({ value: map.slug, label: `${map.name} (${map.game.shortName})` })),
  ];

  const playerCountOptions = [
    { value: '', label: 'All Players' },
    { value: 'SOLO', label: 'Solo' },
    { value: 'DUO', label: 'Duo' },
    { value: 'TRIO', label: 'Trio' },
    { value: 'SQUAD', label: 'Squad' },
  ];

  const challengeTypeOptions = [
    { value: '', label: 'All Challenges' },
    ...Object.entries(challengeTypeLabels).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const selectedMapData = maps.find((m) => m.slug === selectedMap);

  return (
    <div className="min-h-screen bg-bunker-950">
      {/* Header */}
      <div className="bg-bunker-900 border-b border-bunker-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide">
                Leaderboards
              </h1>
              <HelpTrigger
                title="How leaderboards work"
                description="Ranking rules and how to get on the board."
                modalSize="md"
              >
                <LeaderboardsHelpContent />
              </HelpTrigger>
            </div>
            <p className="text-sm sm:text-base text-bunker-400">
              Compete with players worldwide and climb to the top
            </p>
            <p className="text-sm text-bunker-500 mt-3 max-w-2xl">
              CoD Zombies high round and speedrun leaderboards for every Treyarch map. Filter by Solo, Duo, Trio, or Squad and by challenge type: Highest Round, No Downs, No Perks, No Pack-a-Punch, and more. Log your runs from any map page to appear on the board.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <details className="group rounded-lg border border-bunker-700/60 bg-bunker-900/50 overflow-hidden">
          <summary className="list-none cursor-pointer px-4 py-3 text-sm font-medium text-bunker-300 hover:text-bunker-200 focus:outline-none focus:ring-2 focus:ring-blood-500/50 focus:ring-inset rounded-lg">
            <span className="inline-flex items-center gap-2">
              How leaderboards work
              <span className="text-bunker-500 group-open:rotate-180 transition-transform inline-block">▼</span>
            </span>
          </summary>
          <div className="px-4 pb-4 pt-1 border-t border-bunker-700/40">
            <LeaderboardsHelpContent />
          </div>
        </details>
      </div>

      {/* Search and Filters – layout matches maps page */}
      <div className="bg-bunker-950 border-b border-bunker-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="w-full">
              <Input
                type="search"
                placeholder="Search users by name or username…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
                rightIcon={
                  searchQuery ? (
                    <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search">
                      <X className="w-4 h-4 sm:w-5 sm:h-5 hover:text-blood-400" />
                    </button>
                  ) : undefined
                }
                aria-label="Search users"
              />
            </div>
            <div className="flex items-center gap-2 text-bunker-400">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Filters:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 [&>*]:min-w-0">
              <Select
                options={gameOptions}
                value={selectedGame}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedGame(v);
                  if (v === RANK_VIEW) {
                    setSelectedMap('');
                  } else {
                    const nextMaps = v ? maps.filter((m) => m.gameId === v) : maps;
                    setSelectedMap(nextMaps.length > 0 ? nextMaps[0].slug : '');
                  }
                }}
                className="w-full"
              />
              <Select
                options={mapOptions}
                value={selectedMap}
                onChange={(e) => setSelectedMap(e.target.value)}
                className="w-full col-span-2 sm:col-span-1"
                disabled={isRankView}
              />
              <Select
                options={challengeTypeOptions}
                value={selectedChallengeType}
                onChange={(e) => setSelectedChallengeType(e.target.value as ChallengeType | '')}
                className="w-full"
              />
              <Select
                options={playerCountOptions}
                value={selectedPlayerCount}
                onChange={(e) => setSelectedPlayerCount(e.target.value as PlayerCount | '')}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isRankView && (
          <div className="mb-6">
            <Card variant="glow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                      Rank (by XP)
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-bunker-400 mt-1">
                      All members ranked by total XP
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-blood-600/60 bg-blood-950/95 text-white text-sm font-semibold shadow-[0_0_1px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,0.9),0_1px_4px_rgba(0,0,0,0.8)] [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_1px_3px_rgba(0,0,0,0.9)]">
                    {searchQuery.trim()
                      ? `Showing ${leaderboard.length} of ${total}`
                      : `${total} entries`}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <PageLoader message="Loading leaderboard…" inline />
                  </div>
                ) : leaderboard.length > 0 ? (
                  <>
                    {leaderboard.map((entry, index) => (
                      <LeaderboardEntry
                        key={entry.user.id}
                        entry={entry}
                        index={index}
                        isCurrentUser={entry.user.id === profile?.id}
                        valueKind="xp"
                        hidePlayerCount
                      />
                    ))}
                    {!isSearchActive && leaderboard.length < total && (
                      <div ref={loadMoreSentinelRef} className="h-px" aria-hidden />
                    )}
                  </>
                ) : searchQuery.trim() ? (
                  <div className="text-center py-8 sm:py-12">
                    <Search className="w-10 h-10 text-bunker-600 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-bunker-400">
                      No users match &quot;{searchQuery.trim()}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-bunker-600 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-bunker-400">
                      No public profiles yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {selectedMapData && !isRankView && (
          <div className="mb-6">
            <Card variant="glow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                      {selectedMapData.name}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-bunker-400 mt-1">
                      {selectedMapData.game.name} • {selectedChallengeType ? challengeTypeLabels[selectedChallengeType] : 'All Challenges'}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-blood-600/60 bg-blood-950/95 text-white text-sm font-semibold shadow-[0_0_1px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,0.9),0_1px_4px_rgba(0,0,0,0.8)] [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_1px_3px_rgba(0,0,0,0.9)]">
                    {searchQuery.trim()
                      ? `Showing ${leaderboard.length} of ${total}`
                      : `${total} entries`}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <PageLoader message="Loading leaderboard…" inline />
                  </div>
                ) : leaderboard.length > 0 ? (
                  <>
                    {leaderboard.map((entry, index) => (
                      <LeaderboardEntry
                        key={`${entry.user.id}-${entry.playerCount}`}
                        entry={entry}
                        index={index}
                        isCurrentUser={entry.user.id === profile?.id}
                      />
                    ))}
                    {!isSearchActive && leaderboard.length < total && (
                      <div ref={loadMoreSentinelRef} className="h-px" aria-hidden />
                    )}
                  </>
                ) : searchQuery.trim() ? (
                  <div className="text-center py-8 sm:py-12">
                    <Search className="w-10 h-10 text-bunker-600 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-bunker-400">
                      No entries match &quot;{searchQuery.trim()}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-bunker-600 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-bunker-400">
                      No entries yet for this category.
                    </p>
                    <p className="text-xs sm:text-sm text-bunker-500 mt-2">
                      Be the first to claim the top spot!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!selectedMap && !isRankView && (
          <div className="text-center py-16 sm:py-20">
            <Logo size="xl" animated={false} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-lg text-bunker-400">
              Select a map to view the leaderboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
