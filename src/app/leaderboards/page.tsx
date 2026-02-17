'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Select, Badge, Logo, PageLoader, HelpTrigger } from '@/components/ui';
import { LeaderboardEntry, LeaderboardsHelpContent } from '@/components/game';
import type { LeaderboardEntry as LeaderboardEntryType, Game, MapWithGame, PlayerCount, ChallengeType } from '@/types';
import { Trophy, Medal, Filter } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

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
  const [isLoading, setIsLoading] = useState(true);

  const [selectedGame, setSelectedGame] = useState('');
  const [selectedMap, setSelectedMap] = useState('');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<PlayerCount | ''>('');
  const [selectedChallengeType, setSelectedChallengeType] = useState<ChallengeType | ''>('HIGHEST_ROUND');

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
          // First map if we have any
          if (mapsData.length > 0) {
            setSelectedMap(mapsData[0].slug);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!selectedMap) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedPlayerCount) params.set('playerCount', selectedPlayerCount);
        if (selectedChallengeType) params.set('challengeType', selectedChallengeType);

        const res = await fetch(`/api/maps/${selectedMap}/leaderboard?${params}`);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [selectedMap, selectedPlayerCount, selectedChallengeType]);

  const filteredMaps = selectedGame
    ? maps.filter((map) => map.gameId === selectedGame)
    : maps;

  const gameOptions = [
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

      {/* Filters - sticky below navbar (h-14 sm:h-16) */}
      <div className="sticky top-14 sm:top-16 z-40 bg-bunker-950/95 backdrop-blur-xl border-b border-bunker-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-bunker-400">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Filters:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 [&>*]:min-w-0">
              <Select
                options={gameOptions}
                value={selectedGame}
                onChange={(e) => {
                  setSelectedGame(e.target.value);
                  setSelectedMap('');
                }}
                className="w-full"
              />
              <Select
                options={mapOptions}
                value={selectedMap}
                onChange={(e) => setSelectedMap(e.target.value)}
                className="w-full col-span-2 sm:col-span-1"
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
        {selectedMapData && (
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
                    {leaderboard.length} entries
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <PageLoader message="Loading leaderboard…" inline />
                  </div>
                ) : leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <LeaderboardEntry
                      key={`${entry.user.id}-${entry.playerCount}`}
                      entry={entry}
                      index={index}
                      isCurrentUser={entry.user.id === profile?.id}
                    />
                  ))
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

        {!selectedMap && (
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
