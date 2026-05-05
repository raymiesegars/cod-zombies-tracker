'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { AlertCircle, CheckCircle2, CopyPlus, Loader2, Map } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { getGameDisplayShortName } from '@/lib/bo3-custom';
import type {
  MapCloneAchievementDraft,
  MapCloneChallengeDraft,
  MapCloneCreatePayload,
  MapCloneEasterEggDraft,
  MapCloneMapDraft,
  MapClonePreview,
} from '@/lib/admin/map-clone-types';

type Game = { id: string; shortName: string; name: string };

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseArrayJson<T>(raw: string, label: string): { value: T[] | null; error: string | null } {
  if (!raw.trim()) return { value: [], error: null };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { value: null, error: `${label} must be a JSON array` };
    return { value: parsed as T[], error: null };
  } catch {
    return { value: null, error: `${label} JSON is invalid` };
  }
}

export default function AdminMapsPage() {
  const [forbidden, setForbidden] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedGameId, setSelectedGameId] = useState('');
  const [mapName, setMapName] = useState('');
  const [mapSlug, setMapSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  const [preview, setPreview] = useState<MapClonePreview | null>(null);
  const [mapDraft, setMapDraft] = useState<MapCloneMapDraft | null>(null);
  const [challengesJson, setChallengesJson] = useState('[]');
  const [easterEggsJson, setEasterEggsJson] = useState('[]');
  const [achievementsJson, setAchievementsJson] = useState('[]');

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { admin: null }))
      .then((d: { admin?: { isSuperAdmin?: boolean } | null }) => {
        if (!d.admin?.isSuperAdmin) setForbidden(true);
      })
      .catch(() => setForbidden(true));
  }, []);

  useEffect(() => {
    setLoadingGames(true);
    fetch('/api/games', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Game[]) => setGames(data))
      .catch(() => setGames([]))
      .finally(() => setLoadingGames(false));
  }, []);

  const selectedGame = games.find((game) => game.id === selectedGameId) ?? null;

  const parsedChallenges = useMemo(
    () => parseArrayJson<MapCloneChallengeDraft>(challengesJson, 'Challenges'),
    [challengesJson]
  );
  const parsedEasterEggs = useMemo(
    () => parseArrayJson<MapCloneEasterEggDraft>(easterEggsJson, 'Easter eggs'),
    [easterEggsJson]
  );
  const parsedAchievements = useMemo(
    () => parseArrayJson<MapCloneAchievementDraft>(achievementsJson, 'Achievements'),
    [achievementsJson]
  );

  const eeAchievementIndexes = useMemo(() => {
    if (!parsedAchievements.value) return [];
    const indexes: number[] = [];
    parsedAchievements.value.forEach((achievement, index) => {
      if (achievement.type === 'EASTER_EGG_COMPLETE') indexes.push(index);
    });
    return indexes;
  }, [parsedAchievements.value]);

  const jsonValidationError = parsedChallenges.error ?? parsedEasterEggs.error ?? parsedAchievements.error;
  const createDisabledReasons = useMemo(() => {
    if (!preview || !mapDraft) return [];
    const reasons: string[] = [];
    if (saving) reasons.push('Save already in progress');
    if (!mapDraft.name.trim()) reasons.push('Map name is required');
    if (!mapDraft.slug.trim()) reasons.push('Map slug is required');
    if (parsedChallenges.error) reasons.push(parsedChallenges.error);
    if (parsedEasterEggs.error) reasons.push(parsedEasterEggs.error);
    if (parsedAchievements.error) reasons.push(parsedAchievements.error);
    return reasons;
  }, [preview, mapDraft, saving, parsedChallenges.error, parsedEasterEggs.error, parsedAchievements.error]);
  const effectiveRequiredChallengeTypeCount = useMemo(() => {
    if (!preview) return 0;
    const hasEasterEggs = (parsedEasterEggs.value?.length ?? 0) > 0;
    return preview.expectedChallengeTypes.filter(
      (type) => hasEasterEggs || type !== 'EASTER_EGG_SPEEDRUN'
    ).length;
  }, [preview, parsedEasterEggs.value]);

  function resetDraftFromPreview(data: MapClonePreview) {
    setPreview(data);
    setMapDraft(data.map);
    setChallengesJson(prettyJson(data.challenges));
    setEasterEggsJson(prettyJson(data.easterEggs));
    setAchievementsJson(prettyJson(data.achievements));
  }

  async function loadClonePreview() {
    const trimmedName = mapName.trim();
    if (!selectedGameId || !trimmedName) {
      setError('Select a game and enter a map name first.');
      return;
    }
    setLoadingPreview(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/admin/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          action: 'preview',
          gameId: selectedGameId,
          mapName: trimmedName,
          mapSlug: mapSlug.trim() || undefined,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Failed to build clone preview');
        return;
      }
      resetDraftFromPreview(data as MapClonePreview);
    } finally {
      setLoadingPreview(false);
    }
  }

  function updateEeAchievementField(index: number, key: 'name' | 'slug', value: string) {
    if (!parsedAchievements.value) return;
    const next = [...parsedAchievements.value];
    const current = next[index];
    if (!current) return;
    next[index] = {
      ...current,
      [key]: key === 'slug' ? slugify(value) : value,
    };
    setAchievementsJson(prettyJson(next));
  }

  async function createMap() {
    if (!preview || !mapDraft) return;
    if (jsonValidationError) {
      setError(jsonValidationError);
      return;
    }
    if (!parsedChallenges.value || !parsedEasterEggs.value || !parsedAchievements.value) {
      setError('Draft payload is invalid.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    const payload: MapCloneCreatePayload = {
      gameId: selectedGameId,
      sourceMapId: preview.sourceMap.id,
      map: {
        ...mapDraft,
        slug: slugify(mapDraft.slug || mapDraft.name),
      },
      expectedChallengeTypes: preview.expectedChallengeTypes,
      challenges: parsedChallenges.value,
      easterEggs: parsedEasterEggs.value,
      achievements: parsedAchievements.value,
    };

    try {
      const response = await fetch('/api/admin/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'create', ...payload }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Failed to create map');
        return;
      }
      const map = data.map as { slug: string; name: string };
      setSuccess(`Created ${map.name}.`);
      setMapName('');
      setMapSlug('');
      setSlugTouched(false);
      setPreview(null);
      setMapDraft(null);
      setChallengesJson('[]');
      setEasterEggsJson('[]');
      setAchievementsJson('[]');
    } finally {
      setSaving(false);
    }
  }

  if (forbidden) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card variant="bordered" className="border-blood-800/50">
          <CardContent className="p-8 text-center">
            <p className="text-blood-400 font-medium">Access denied. Super admins only.</p>
            <Link href="/admin/verification" className="mt-4 inline-block text-bunker-400 hover:text-white">
              Back to admin
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-zombies text-white flex items-center gap-2">
          <Map className="w-6 h-6 text-amber-500" />
          Map Creator
        </h1>
        <p className="text-sm text-bunker-400 mt-1">
          Clone the latest map in a game, review every value, and create a new map without missing challenge or achievement data.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-blood-950/50 border border-blood-700 text-blood-300 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <Card variant="bordered" className="border-bunker-700">
        <CardContent className="space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Step 1 · Select game + new map identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Game</label>
              <Select
                value={selectedGameId}
                onChange={(event) => setSelectedGameId(event.target.value)}
                options={[
                  { value: '', label: '— Select game —' },
                  ...games.map((game) => ({
                    value: game.id,
                    label: getGameDisplayShortName(game.shortName, game.name),
                  })),
                ]}
                disabled={loadingGames}
                className="w-full bg-bunker-800 border-bunker-600 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Map name</label>
              <Input
                value={mapName}
                onChange={(event) => {
                  const nextName = event.target.value;
                  setMapName(nextName);
                  if (!slugTouched) setMapSlug(slugify(nextName));
                }}
                placeholder="Example: The Foundry"
                className="bg-bunker-800 border-bunker-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Map slug</label>
              <Input
                value={mapSlug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setMapSlug(slugify(event.target.value));
                }}
                placeholder="the-foundry"
                className="bg-bunker-800 border-bunker-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadClonePreview}
              disabled={!selectedGameId || !mapName.trim() || loadingPreview || loadingGames}
              leftIcon={loadingPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : <CopyPlus className="w-4 h-4" />}
            >
              {loadingPreview ? 'Loading clone defaults...' : 'Load clone defaults'}
            </Button>
            {selectedGame && (
              <p className="text-xs text-bunker-500">
                Source: latest map in {getGameDisplayShortName(selectedGame.shortName, selectedGame.name)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {preview && mapDraft && (
        <Card variant="bordered" className="border-amber-800/60">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Step 2 · Review cloned setup</h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => resetDraftFromPreview(preview)}
              >
                Reset to preview defaults
              </Button>
            </div>

            <p className="text-xs text-bunker-400">
              Cloned from <span className="text-white">{preview.sourceMap.name}</span> ({preview.sourceMap.slug}) with expected challenge parity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Name</label>
                <Input
                  value={mapDraft.name}
                  onChange={(event) => setMapDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                  className="bg-bunker-800 border-bunker-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Slug</label>
                <Input
                  value={mapDraft.slug}
                  onChange={(event) => setMapDraft((prev) => (prev ? { ...prev, slug: slugify(event.target.value) } : prev))}
                  className="bg-bunker-800 border-bunker-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Order</label>
                <Input
                  type="number"
                  min={1}
                  value={String(mapDraft.order)}
                  onChange={(event) => setMapDraft((prev) => (prev ? { ...prev, order: parseInt(event.target.value || '0', 10) || 1 } : prev))}
                  className="bg-bunker-800 border-bunker-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Round cap</label>
                <Input
                  type="number"
                  min={0}
                  value={mapDraft.roundCap == null ? '' : String(mapDraft.roundCap)}
                  onChange={(event) => setMapDraft((prev) => (prev ? { ...prev, roundCap: event.target.value ? parseInt(event.target.value, 10) : null } : prev))}
                  className="bg-bunker-800 border-bunker-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Image URL</label>
                <Input
                  value={mapDraft.imageUrl ?? ''}
                  onChange={(event) => setMapDraft((prev) => (prev ? { ...prev, imageUrl: event.target.value || null } : prev))}
                  className="bg-bunker-800 border-bunker-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Release date (ISO)</label>
                <Input
                  value={mapDraft.releaseDate ?? ''}
                  onChange={(event) => setMapDraft((prev) => (prev ? { ...prev, releaseDate: event.target.value || null } : prev))}
                  className="bg-bunker-800 border-bunker-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Description</label>
              <textarea
                value={mapDraft.description ?? ''}
                onChange={(event) => setMapDraft((prev) => (prev ? { ...prev, description: event.target.value || null } : prev))}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white text-sm"
              />
            </div>
            <div className="flex gap-6 text-sm text-bunker-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mapDraft.isDlc}
                  onChange={(event) => setMapDraft((prev) => (prev ? { ...prev, isDlc: event.target.checked } : prev))}
                  className="rounded border-bunker-600"
                />
                DLC map
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mapDraft.isCustom}
                  onChange={(event) => setMapDraft((prev) => (prev ? { ...prev, isCustom: event.target.checked } : prev))}
                  className="rounded border-bunker-600"
                />
                Custom map
              </label>
            </div>

            {eeAchievementIndexes.length > 0 && parsedAchievements.value && (
              <div className="space-y-3 p-3 rounded-lg border border-bunker-700 bg-bunker-900/60">
                <h3 className="text-sm font-semibold text-white">Easter Egg Achievement Names</h3>
                <p className="text-xs text-bunker-400">
                  These names are independent. Change each one without affecting the linked easter egg record.
                </p>
                {eeAchievementIndexes.map((index) => {
                  const achievement = parsedAchievements.value![index]!;
                  return (
                    <div key={`${achievement.sourceSlug}-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={achievement.name}
                        onChange={(event) => updateEeAchievementField(index, 'name', event.target.value)}
                        className="bg-bunker-800 border-bunker-600"
                        placeholder="Achievement name"
                      />
                      <Input
                        value={achievement.slug}
                        onChange={(event) => updateEeAchievementField(index, 'slug', event.target.value)}
                        className="bg-bunker-800 border-bunker-600"
                        placeholder="achievement-slug"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Clone Payload Editors</h3>
              <p className="text-xs text-bunker-500">
                All values are editable here. Keep required fields intact to avoid parity/validation failures.
              </p>
              <div>
                <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">
                  Challenges JSON ({parsedChallenges.value?.length ?? 0})
                </label>
                <textarea
                  value={challengesJson}
                  onChange={(event) => setChallengesJson(event.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 rounded-lg bg-bunker-900 border border-bunker-700 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">
                  Easter Eggs JSON ({parsedEasterEggs.value?.length ?? 0})
                </label>
                <textarea
                  value={easterEggsJson}
                  onChange={(event) => setEasterEggsJson(event.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 rounded-lg bg-bunker-900 border border-bunker-700 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">
                  Achievements JSON ({parsedAchievements.value?.length ?? 0})
                </label>
                <textarea
                  value={achievementsJson}
                  onChange={(event) => setAchievementsJson(event.target.value)}
                  rows={14}
                  className="w-full px-3 py-2 rounded-lg bg-bunker-900 border border-bunker-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
              <div className="space-y-1">
                <p className="text-xs text-bunker-400">
                  Required challenge types enforced: {effectiveRequiredChallengeTypeCount}
                </p>
                {createDisabledReasons.length > 0 && (
                  <p className="text-xs text-blood-300">
                    Create disabled: {createDisabledReasons[0]}
                  </p>
                )}
              </div>
              <Button
                onClick={createMap}
                disabled={createDisabledReasons.length > 0}
                leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
              >
                {saving ? 'Creating map...' : 'Create map'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
