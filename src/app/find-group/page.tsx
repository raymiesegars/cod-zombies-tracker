'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  Card,
  CardContent,
  Input,
  Select,
  Button,
  Badge,
  MapIcon,
  PageLoader,
  Modal,
  HelpTrigger,
} from '@/components/ui';
import { UserWithRank, FindGroupHelpContent } from '@/components/game';
import { FIND_GROUP_PLATFORMS, PLATFORM_GROUPS } from '@/lib/find-group-platforms';
import { getAssetUrl } from '@/lib/assets';
import { Users, Search, Plus, X } from 'lucide-react';

type Listing = {
  id: string;
  createdAt: string;
  expiresAt: string;
  desiredPlayerCount: number;
  currentPlayerCount: number;
  notes: string | null;
  platform: string;
  contactInfo: Record<string, string> | null;
  creator: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    level: number;
    totalXp: number;
  };
  map: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    game: { id: string; name: string; shortName: string };
  };
  easterEgg: { id: string; name: string; slug: string; type: string } | null;
};

type MapWithEasterEggs = {
  id: string;
  name: string;
  slug: string;
  gameId: string;
  game: { id: string; name: string; shortName: string };
  easterEggs?: { id: string; name: string; slug: string }[];
};

export default function FindGroupPage() {
  const { user: authUser, profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [games, setGames] = useState<{ id: string; name: string; shortName: string }[]>([]);
  const [maps, setMaps] = useState<MapWithEasterEggs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGameId, setFilterGameId] = useState('');
  const [filterMapId, setFilterMapId] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    mapId: '',
    easterEggId: '',
    desiredPlayerCount: 4,
    notes: '',
    platform: 'PC (Steam/Battle.net)',
    discord: '',
    steam: '',
    xbox: '',
  });

  const fetchListings = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterGameId) params.set('gameId', filterGameId);
    if (filterMapId) params.set('mapId', filterMapId);
    if (search.trim()) params.set('search', search.trim());
    params.set('sort', 'recent');
    const res = await fetch(`/api/find-group/listings?${params}`);
    if (res.ok) {
      const data = await res.json();
      setListings(data);
    }
  }, [filterGameId, filterMapId, search]);

  const fetchGamesAndMaps = useCallback(async () => {
    const [gamesRes, mapsRes] = await Promise.all([
      fetch('/api/games'),
      fetch('/api/maps?includeEasterEggs=main'),
    ]);
    if (gamesRes.ok) {
      const g = await gamesRes.json();
      setGames(g);
    }
    if (mapsRes.ok) {
      const m = await mapsRes.json();
      setMaps(m);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      await Promise.all([fetchListings(), fetchGamesAndMaps()]);
      if (!cancelled) setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [fetchListings, fetchGamesAndMaps]);

  useEffect(() => {
    if (!createOpen) return;
    fetchGamesAndMaps();
  }, [createOpen, fetchGamesAndMaps]);

  const gameOptions = useMemo(
    () => [{ value: '', label: 'All games' }, ...games.map((g) => ({ value: g.id, label: g.name }))],
    [games]
  );

  const mapsForGame = useMemo(() => {
    if (!filterGameId) return maps;
    return maps.filter((m) => m.gameId === filterGameId);
  }, [maps, filterGameId]);

  const mapOptions = useMemo(
    () => [
      { value: '', label: 'All maps' },
      ...mapsForGame.map((m) => ({ value: m.id, label: m.name })),
    ],
    [mapsForGame]
  );

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !profile) return;
    if (!createForm.mapId) return;
    setCreateSubmitting(true);
    try {
      const res = await fetch('/api/find-group/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapId: createForm.mapId,
          easterEggId: createForm.easterEggId || null,
          desiredPlayerCount: createForm.desiredPlayerCount,
          notes: createForm.notes.trim() || null,
          platform: createForm.platform,
          contactInfo: {
            ...(createForm.discord && { discord: createForm.discord.trim() }),
            ...(createForm.steam && { steam: createForm.steam.trim() }),
            ...(createForm.xbox && { xbox: createForm.xbox.trim() }),
          },
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setListings((prev) => [created, ...prev]);
        setCreateOpen(false);
        setCreateForm({
          mapId: '',
          easterEggId: '',
          desiredPlayerCount: 4,
          notes: '',
          platform: 'PC (Steam/Battle.net)',
          discord: '',
          steam: '',
          xbox: '',
        });
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  const selectedMapForCreate = useMemo(
    () => maps.find((m) => m.id === createForm.mapId),
    [maps, createForm.mapId]
  );

  const mainQuestOptions = useMemo(() => {
    if (!selectedMapForCreate?.easterEggs?.length) return [];
    return selectedMapForCreate.easterEggs.map((ee) => ({ value: ee.id, label: ee.name }));
  }, [selectedMapForCreate]);

  function getListingAge(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays === 0) {
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      return 'Today';
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} wk ago`;
    return `${diffDays} days ago`;
  }

  return (
    <div className="min-h-screen bg-bunker-950">
      {/* Header */}
      <div className="bg-bunker-900 border-b border-bunker-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blood-950/80 border border-blood-800/60 text-blood-400 flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-zombies text-white tracking-wide">
                  Find Group
                </h1>
                <p className="text-sm text-bunker-400 mt-0.5">
                  Squad up for main Easter eggs. Post a listing or browse below.
                </p>
              </div>
              <HelpTrigger
                title="How Find Group works"
                description="Post a listing, get messages, squad up."
                modalSize="md"
              >
                <FindGroupHelpContent />
              </HelpTrigger>
            </div>
            {authUser && profile && (
              <Button
                leftIcon={
                  <span className="mr-2 inline-flex shrink-0">
                    <Plus className="w-4 h-4" />
                  </span>
                }
                size="lg"
                onClick={() => setCreateOpen(true)}
                className="!text-white"
              >
                Create listing
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-bunker-800/50 bg-bunker-950/80 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="w-full">
              <Input
                placeholder="Search maps, notes, EE name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
                rightIcon={
                  search ? (
                    <button type="button" onClick={() => setSearch('')}>
                      <X className="w-4 h-4 sm:w-5 sm:h-5 hover:text-blood-400" />
                    </button>
                  ) : undefined
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Select
                options={gameOptions}
                value={filterGameId}
                onChange={(e) => {
                  setFilterGameId(e.target.value);
                  setFilterMapId('');
                }}
                className="w-full"
              />
              <Select
                options={mapOptions}
                value={filterMapId}
                onChange={(e) => setFilterMapId(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <PageLoader message="Loading listings…" />
          </div>
        ) : listings.length === 0 ? (
          <Card variant="bordered">
            <CardContent className="py-12 text-center">
              <MapIcon size={48} className="mx-auto text-bunker-600 mb-4" />
              <p className="text-bunker-400 mb-2">No listings match your filters.</p>
              <p className="text-sm text-bunker-500">
                {authUser && profile
                  ? 'Create one to find teammates for a main Easter egg.'
                  : 'Log in to create a listing.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {listings.map((listing) => (
              <li key={listing.id}>
                <Link href={`/find-group/${listing.id}`} className="block">
                  <Card
                    variant="bordered"
                    interactive
                    className="hover:border-blood-800/50 overflow-hidden relative bg-transparent"
                  >
                    {/* Dimmed map art background */}
                    {listing.map.imageUrl ? (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${getAssetUrl(listing.map.imageUrl)})` }}
                        />
                        <div className="absolute inset-0 bg-bunker-950/80 backdrop-blur-[2px]" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-bunker-900/95" />
                    )}
                    <CardContent className="relative z-10 p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserWithRank
                            user={{
                              id: listing.creator.id,
                              username: listing.creator.username,
                              displayName: listing.creator.displayName,
                              avatarUrl: listing.creator.avatarUrl,
                              level: listing.creator.level,
                              totalXp: listing.creator.totalXp,
                            }}
                            showAvatar={true}
                            showLevel={true}
                            size="sm"
                            linkToProfile={true}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{listing.map.name}</span>
                            <Badge variant="default" size="sm">
                              {listing.map.game.shortName}
                            </Badge>
                            {listing.easterEgg && (
                              <Badge variant="purple" size="sm">
                                {listing.easterEgg.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-bunker-400">
                            <span className="text-blood-400 font-medium">
                              {listing.currentPlayerCount}/{listing.desiredPlayerCount} players
                            </span>
                            <span>·</span>
                            <span>{listing.platform}</span>
                            {listing.notes && (
                              <>
                                <span>·</span>
                                <span className="truncate max-w-[200px] sm:max-w-[320px] block">
                                  {listing.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-bunker-400 flex-shrink-0 font-medium">
                          {getListingAge(listing.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create listing modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => !createSubmitting && setCreateOpen(false)}
        title="Create listing"
        size="lg"
      >
        <form onSubmit={handleCreateListing} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bunker-300 mb-1">Map *</label>
            <Select
              options={[
                { value: '', label: 'Select map…' },
                ...maps.map((m) => ({ value: m.id, label: `${m.game.shortName} – ${m.name}` })),
              ]}
              value={createForm.mapId}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  mapId: e.target.value,
                  easterEggId: '',
                }))
              }
              className="w-full"
            />
          </div>
          {mainQuestOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-bunker-300 mb-1">
                Easter egg (main quest)
              </label>
              <Select
                options={[{ value: '', label: 'Any / Main quest' }, ...mainQuestOptions]}
                value={createForm.easterEggId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, easterEggId: e.target.value }))}
                className="w-full"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-bunker-300 mb-1">
              Desired players
            </label>
            <Select
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4 (Squad)' },
              ]}
              value={String(createForm.desiredPlayerCount)}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  desiredPlayerCount: parseInt(e.target.value, 10),
                }))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bunker-300 mb-1">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_GROUPS.map((group) => (
                <div key={group} className="flex flex-wrap gap-1.5">
                  {FIND_GROUP_PLATFORMS.filter((p) => p.group === group).map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setCreateForm((prev) => ({ ...prev, platform: p.value }))}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                        createForm.platform === p.value
                          ? 'border-blood-500 bg-blood-950/80 text-white'
                          : 'border-bunker-600 bg-bunker-800/50 text-bunker-300 hover:border-bunker-500'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-bunker-300 mb-1">
              Contact (optional)
            </label>
            <div className="space-y-2">
              <Input
                placeholder="Discord tag"
                value={createForm.discord}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, discord: e.target.value }))}
                className="w-full"
              />
              <Input
                placeholder="Steam username"
                value={createForm.steam}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, steam: e.target.value }))}
                className="w-full"
              />
              <Input
                placeholder="Xbox username"
                value={createForm.xbox}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, xbox: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-bunker-300 mb-1">Notes (optional)</label>
            <textarea
              value={createForm.notes}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Need 2 more, have mic, EU evenings"
              rows={3}
              className="w-full rounded-lg border border-bunker-600 bg-bunker-800/50 px-3 py-2 text-sm text-white placeholder:text-bunker-500 focus:border-blood-500 focus:outline-none focus:ring-1 focus:ring-blood-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateOpen(false)}
              disabled={createSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createSubmitting || !createForm.mapId}>
              {createSubmitting ? 'Creating…' : 'Create listing'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
