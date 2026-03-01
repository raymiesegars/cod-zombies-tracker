'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Badge, Card, CardContent, Logo, PageLoader } from '@/components/ui';
import { getAssetUrl } from '@/lib/assets';
import { ChevronLeft, ListChecks } from 'lucide-react';

type MapInGame = {
  id: string;
  name: string;
  slug: string;
  order: number;
  game: { id: string; name: string; shortName: string; order: number };
};

type MapsByGame = Record<string, MapInGame[]>;

export default function UserLogsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const gameId = searchParams.get('game') ?? '';

  const [profile, setProfile] = useState<{ displayName: string; username: string } | null>(null);
  const [mapsByGame, setMapsByGame] = useState<MapsByGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/users/${username}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/users/${username}/achievements-overview`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([userData, overviewData]) => {
        if (cancelled) return;
        if (userData) {
          setProfile({ displayName: userData.displayName ?? userData.username, username: userData.username });
        }
        setMapsByGame(overviewData?.mapsByGame ?? null);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [username]);

  const maps = useMemo(() => {
    if (!gameId || !mapsByGame) return [];
    return mapsByGame[gameId] ?? [];
  }, [gameId, mapsByGame]);

  const gameName = useMemo(() => {
    if (!maps.length) return null;
    return maps[0].game.name;
  }, [maps]);

  const gameShortName = useMemo(() => {
    if (!maps.length) return null;
    return maps[0].game.shortName;
  }, [maps]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <PageLoader message="Loading..." fullScreen />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Logo size="xl" animated={false} className="mx-auto mb-4 opacity-50" />
          <p className="text-bunker-400 mb-4">{error ?? 'User not found or profile is private.'}</p>
          <Link href="/maps" className="text-blood-400 hover:text-blood-300 text-sm">
            Browse maps →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bunker-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href={`/users/${username}`}
          className="inline-flex items-center gap-1.5 text-bunker-400 hover:text-white text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {profile.displayName}
        </Link>

        <h1 className="text-xl sm:text-2xl font-zombies text-white mb-2">
          {profile.displayName}&apos;s runs
        </h1>
        <p className="text-bunker-400 text-sm mb-6">
          {gameId && gameName
            ? `${gameShortName ?? gameName} – select a map to view their runs`
            : 'Select a game from the achievements section on their profile to view runs by game.'}
        </p>

        {!gameId ? (
          <Card variant="bordered">
            <CardContent className="py-8 text-center">
              <ListChecks className="w-10 h-10 text-bunker-500 mx-auto mb-3" />
              <p className="text-bunker-400 text-sm">
                Open this page with a game selected (e.g. from the Achievements section on their profile) to see maps and run links.
              </p>
              <Link
                href={`/users/${username}`}
                className="inline-block mt-4 text-blood-400 hover:text-blood-300 text-sm"
              >
                Back to profile →
              </Link>
            </CardContent>
          </Card>
        ) : maps.length === 0 ? (
          <Card variant="bordered">
            <CardContent className="py-8 text-center">
              <p className="text-bunker-400 text-sm">No maps found for this game.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {maps.map((map) => (
              <li key={map.id}>
                <Link
                  href={`/users/${username}/maps/${map.slug}/runs`}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-bunker-700 bg-bunker-800/50 hover:border-blood-800 hover:bg-bunker-800 transition-colors"
                >
                  <span className="font-medium text-white truncate flex-1">{map.name}</span>
                  <Badge variant="default" size="sm">
                    {map.game.shortName}
                  </Badge>
                  <span className="text-blood-400 text-sm">View runs →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
