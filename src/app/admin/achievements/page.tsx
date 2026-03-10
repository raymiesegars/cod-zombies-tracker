'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Modal,
} from '@/components/ui';
import {
  Award,
  Loader2,
  Plus,
  Pencil,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getGameDisplayShortName } from '@/lib/bo3-custom';
import { cn } from '@/lib/utils';
import { useActionProgress } from '@/context/action-progress-context';
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  getAchievementCategory,
  getSortedCategoryKeys,
  sortAchievementsInCategory,
} from '@/lib/achievements/categories';

type Game = { id: string; shortName: string; name: string };
type MapOption = { id: string; name: string; slug: string; gameId: string; game?: { shortName: string } };
type Achievement = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  criteria: Record<string, unknown>;
  xpReward: number;
  rarity: string;
  isActive: boolean;
  difficulty: string | null;
  mapId: string | null;
  easterEggId: string | null;
  map?: { id: string; slug: string; name: string } | null;
  easterEgg?: { id: string; name: string; slug: string } | null;
  challenge?: { id: string; type: string } | null;
};

const TYPE_LABELS: Record<string, string> = {
  ROUND_MILESTONE: 'Round Milestone',
  CHALLENGE_COMPLETE: 'Challenge Complete',
  EASTER_EGG_COMPLETE: 'Easter Egg Complete',
  MAPS_PLAYED: 'Maps Played',
  TOTAL_ROUNDS: 'Total Rounds',
  STREAK: 'Streak',
  COLLECTOR: 'Collector',
};
const RARITY_LABELS: Record<string, string> = {
  COMMON: 'Common',
  UNCOMMON: 'Uncommon',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
};
const DIFFICULTY_LABELS: Record<string, string> = {
  NORMAL: 'Normal',
  HARDCORE: 'Hardcore',
  REALISTIC: 'Realistic',
  CASUAL: 'Casual',
};

export default function AdminAchievementsPage() {
  const [forbidden, setForbidden] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [maps, setMaps] = useState<MapOption[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedMapId, setSelectedMapId] = useState('');
  const [mapData, setMapData] = useState<{ map: MapOption & { game?: { shortName: string } }; achievements: Achievement[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [achLoading, setAchLoading] = useState(false);
  const [editingAch, setEditingAch] = useState<Achievement | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reapplyResult, setReapplyResult] = useState<{
    deletedCount: number;
    pairsProcessed: number;
    newUnlocks: number;
    verifiedGrants: number;
    usersRecalcXp: number;
  } | null>(null);
  const [hideDeactivated, setHideDeactivated] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  const categoryOptions = useMemo(() => {
    if (!mapData) return [];
    const filtered = mapData.achievements.filter((a) => !hideDeactivated || a.isActive);
    const byCategory = filtered.reduce<Record<string, typeof filtered>>((acc, a) => {
      const cat = getAchievementCategory(a);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    }, {});
    const sortedCats = getSortedCategoryKeys(byCategory as Record<string, unknown[]>);
    return [{ value: '', label: 'All challenges' }, ...sortedCats.map((c) => ({ value: c, label: ACHIEVEMENT_CATEGORY_LABELS[c] ?? c }))];
  }, [mapData, hideDeactivated]);

  const sortedAchievements = useMemo(() => {
    if (!mapData) return [];
    const filtered = mapData.achievements.filter((a) => !hideDeactivated || a.isActive);
    const byCategory = filtered.reduce<Record<string, typeof filtered>>((acc, a) => {
      const cat = getAchievementCategory(a);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    }, {});
    const sortedCats = getSortedCategoryKeys(byCategory as Record<string, unknown[]>);
    const catsToShow = categoryFilter ? (sortedCats.includes(categoryFilter) ? [categoryFilter] : sortedCats) : sortedCats;
    return catsToShow.flatMap((cat) => sortAchievementsInCategory(byCategory[cat] ?? []));
  }, [mapData, hideDeactivated, categoryFilter]);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { admin: null }))
      .then((d: { admin?: { isSuperAdmin?: boolean } | null }) => {
        if (!d.admin?.isSuperAdmin) setForbidden(true);
      })
      .catch(() => setForbidden(true));
  }, []);

  useEffect(() => {
    fetch('/api/games', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setGames)
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('/api/maps', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setMaps)
      .catch(() => setMaps([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredMaps = selectedGameId ? maps.filter((m) => m.gameId === selectedGameId) : maps;

  const fetchAchievements = useCallback(() => {
    if (!selectedMapId) {
      setMapData(null);
      return;
    }
    setAchLoading(true);
    fetch(`/api/admin/achievements?mapId=${selectedMapId}`, { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => {
        if (r.status === 403) {
          setForbidden(true);
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (d) setMapData({ map: d.map, achievements: d.achievements ?? [] });
        else setMapData(null);
      })
      .catch(() => setMapData(null))
      .finally(() => setAchLoading(false));
  }, [selectedMapId]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  useEffect(() => {
    setSelectedMapId('');
    setCategoryFilter('');
  }, [selectedGameId]);

  useEffect(() => {
    setCategoryFilter('');
  }, [selectedMapId]);

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
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-zombies text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          Achievement Editor
        </h1>
        <p className="text-sm text-bunker-400 mt-1">
          Edit achievements, XP, and criteria. Reapply updates unlocks and verified XP for affected users.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Game</label>
          <Select
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            options={[
              { value: '', label: '— Select game —' },
              ...games.map((g) => ({ value: g.id, label: `${getGameDisplayShortName(g.shortName, g.name)}: ${g.name}` })),
            ]}
            className="w-full bg-bunker-800 border-bunker-600 text-white"
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-bunker-500 uppercase tracking-wider mb-1">Map</label>
          <Select
            value={selectedMapId}
            onChange={(e) => setSelectedMapId(e.target.value)}
            options={[
              { value: '', label: '— Select map —' },
              ...filteredMaps.map((m) => ({ value: m.id, label: m.name })),
            ]}
            className="w-full bg-bunker-800 border-bunker-600 text-white"
            disabled={!selectedGameId || loading}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-blood-950/50 border border-blood-700 text-blood-300 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {reapplyResult && (
        <div className="mb-4 p-3 rounded-lg bg-amber-950/30 border border-amber-700/50 text-amber-200 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Reapply complete</p>
            <p className="text-amber-300/90 text-xs mt-1">
              Removed {reapplyResult.deletedCount} unlocks · Processed {reapplyResult.pairsProcessed} user/map pairs · 
              New unlocks: {reapplyResult.newUnlocks} · Verified grants: {reapplyResult.verifiedGrants} · 
              Recalculated XP for {reapplyResult.usersRecalcXp} users
            </p>
          </div>
        </div>
      )}

      {selectedMapId && (
        <>
          {achLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : mapData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-sm text-bunker-400">
                    {getGameDisplayShortName(mapData.map.game?.shortName)} / {mapData.map.name} —{' '}
                    {categoryFilter
                      ? `${sortedAchievements.length} (${ACHIEVEMENT_CATEGORY_LABELS[categoryFilter] ?? categoryFilter})`
                      : hideDeactivated
                        ? `${mapData.achievements.filter((a) => a.isActive).length} of ${mapData.achievements.length} achievements`
                        : `${mapData.achievements.length} achievements`}
                  </p>
                  <label className="flex items-center gap-2 text-sm text-bunker-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hideDeactivated}
                      onChange={(e) => setHideDeactivated(e.target.checked)}
                      className="rounded border-bunker-500 bg-bunker-800 text-amber-500 focus:ring-amber-500"
                    />
                    Hide deactivated
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-bunker-500 uppercase tracking-wider shrink-0">Challenge:</label>
                    <Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      options={categoryOptions}
                      className="w-48 bg-bunker-800 border-bunker-600 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/maps/${mapData.map.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-bunker-400 hover:text-element-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View map
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Achievement
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {sortedAchievements.map((a) => (
                  <Card
                    key={a.id}
                    variant="bordered"
                    className={cn(
                      'border-bunker-700',
                      !a.isActive && 'opacity-60'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white">{a.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-bunker-700 text-bunker-400">
                              {TYPE_LABELS[a.type] ?? a.type}
                            </span>
                            {a.difficulty && (
                              <span className="text-xs text-bunker-500">{DIFFICULTY_LABELS[a.difficulty] ?? a.difficulty}</span>
                            )}
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-900/50 text-amber-400">
                              {a.xpReward} XP
                            </span>
                            {!a.isActive && (
                              <span className="text-xs px-2 py-0.5 rounded bg-bunker-600 text-bunker-500">Inactive</span>
                            )}
                          </div>
                          <p className="text-sm text-bunker-500 mt-1">
                            {a.slug}
                            {a.easterEgg && ` · EE: ${a.easterEgg.name}`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingAch(a)}
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-bunker-500 py-8">No map selected or failed to load.</p>
          )}
        </>
      )}

      {!selectedMapId && !loading && (
        <p className="text-bunker-500 py-12 text-center">Select a game and map to edit achievements.</p>
      )}

      {editingAch && mapData && (
        <AchievementEditModal
          achievement={editingAch}
          onClose={() => {
            setEditingAch(null);
            setReapplyResult(null);
          }}
          onSaved={(result) => {
            setEditingAch(null);
            if (result?.reapply) setReapplyResult(result.reapply);
            else setReapplyResult(null);
            fetchAchievements();
          }}
          onError={setError}
        />
      )}

      {createOpen && selectedMapId && mapData && (
        <CreateAchievementModal
          mapId={selectedMapId}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            fetchAchievements();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

function AchievementEditModal({
  achievement,
  onClose,
  onSaved,
  onError,
}: {
  achievement: Achievement;
  onClose: () => void;
  onSaved: (result?: { reapply?: { deletedCount: number; pairsProcessed: number; newUnlocks: number; verifiedGrants: number; usersRecalcXp: number } }) => void;
  onError: (s: string | null) => void;
}) {
  const [form, setForm] = useState({
    name: achievement.name,
    slug: achievement.slug,
    description: achievement.description ?? '',
    xpReward: String(achievement.xpReward),
    rarity: achievement.rarity,
    isActive: achievement.isActive,
    criteriaJson: JSON.stringify(achievement.criteria ?? {}, null, 2),
  });
  const [reapply, setReapply] = useState(true);
  const [saving, setSaving] = useState(false);
  const runWithProgress = useActionProgress()?.runWithProgress;

  const handleSave = async () => {
    let criteria: Record<string, unknown>;
    try {
      criteria = JSON.parse(form.criteriaJson);
    } catch {
      onError('Invalid JSON in criteria');
      return;
    }
    setSaving(true);
    onError(null);
    const doSave = async () => {
      const r = await fetch(`/api/admin/achievements/${achievement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || null,
          xpReward: parseInt(form.xpReward, 10) || 0,
          rarity: form.rarity,
          isActive: form.isActive,
          criteria,
          reapply,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        if (data.reapplyError) onError(data.reapplyError);
        else onSaved(data.reapply ? { reapply: data.reapply } : undefined);
      } else onError(data.error || 'Failed to save');
    };
    try {
      await (runWithProgress
        ? runWithProgress(reapply ? 'Saving and reapplying achievements...' : 'Saving...', (report) =>
            doSave().then((r) => {
              report(1, 1);
              return r;
            })
          )
        : doSave());
    } finally {
      setSaving(false);
    }
  };

  const handleReapplyOnly = async () => {
    setSaving(true);
    onError(null);
    const doReapply = async () => {
      const r = await fetch(`/api/admin/achievements/${achievement.id}/reapply`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) onSaved({ reapply: data });
      else onError(data.error || 'Reapply failed');
    };
    try {
      await (runWithProgress
        ? runWithProgress('Reapplying achievements for affected users...', (report) =>
            doReapply().then((r) => {
              report(1, 1);
              return r;
            })
          )
        : doReapply());
    } finally {
      setSaving(false);
    }
  };

  const hasMap = achievement.mapId ?? achievement.easterEgg;

  return (
    <Modal isOpen onClose={onClose} title="Edit Achievement" size="xl" contentScroll>
      <div className="space-y-6 pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-bunker-500 mb-1">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="bg-bunker-800 border-bunker-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-bunker-500 mb-1">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              className="bg-bunker-800 border-bunker-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-bunker-500 mb-1">XP Reward</label>
            <Input
              type="number"
              min={0}
              value={form.xpReward}
              onChange={(e) => setForm((p) => ({ ...p, xpReward: e.target.value }))}
              className="bg-bunker-800 border-bunker-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-bunker-500 mb-1">Rarity</label>
            <Select
              value={form.rarity}
              onChange={(e) => setForm((p) => ({ ...p, rarity: e.target.value }))}
              options={Object.entries(RARITY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              className="bg-bunker-800 border-bunker-600 text-white"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="rounded border-bunker-600"
            />
            <span className="text-sm text-bunker-300">Active</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Criteria (JSON)</label>
          <textarea
            value={form.criteriaJson}
            onChange={(e) => setForm((p) => ({ ...p, criteriaJson: e.target.value }))}
            rows={10}
            className="w-full px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white text-sm font-mono resize-y"
            placeholder='{"round": 20, "challengeType": "HIGHEST_ROUND"}'
          />
          <p className="text-xs text-bunker-500 mt-1">
            ROUND_MILESTONE: round, isCap · CHALLENGE_COMPLETE: round, challengeType, maxTimeSeconds? · EASTER_EGG_COMPLETE: linked via easterEggId
          </p>
        </div>

        {hasMap && (
          <div className="space-y-3 p-3 rounded-lg bg-bunker-800/60 border border-bunker-700">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reapply after save
            </h3>
            <p className="text-xs text-bunker-400">
              Removes existing unlocks, re-evaluates all users with logs on this map, and recalculates verified XP.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reapply}
                onChange={(e) => setReapply(e.target.checked)}
                className="rounded border-bunker-600"
              />
              <span className="text-sm text-bunker-300">Reapply automatically after saving</span>
            </label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleReapplyOnly}
                disabled={saving}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Reapply now (without saving)
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CreateAchievementModal({
  mapId,
  onClose,
  onCreated,
  onError,
}: {
  mapId: string;
  onClose: () => void;
  onCreated: () => void;
  onError: (s: string | null) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState('ROUND_MILESTONE');
  const [xpReward, setXpReward] = useState('50');
  const [criteriaJson, setCriteriaJson] = useState('{"round": 20, "challengeType": "HIGHEST_ROUND"}');
  const [saving, setSaving] = useState(false);
  const runWithProgress = useActionProgress()?.runWithProgress;

  const handleCreate = async () => {
    const n = name.trim();
    if (!n) return;
    let criteria: Record<string, unknown>;
    try {
      criteria = JSON.parse(criteriaJson || '{}');
    } catch {
      onError('Invalid JSON in criteria');
      return;
    }
    setSaving(true);
    onError(null);
    const doCreate = async () => {
      const r = await fetch('/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          mapId,
          name: n,
          slug: slug.trim() || undefined,
          type,
          xpReward: parseInt(xpReward, 10) || 50,
          criteria,
        }),
      });
      if (r.ok) onCreated();
      else {
        const d = await r.json().catch(() => ({}));
        onError(d.error || 'Failed to create');
      }
    };
    try {
      await (runWithProgress
        ? runWithProgress('Creating achievement...', (report) =>
            doCreate().then((r) => {
              report(1, 1);
              return r;
            })
          )
        : doCreate());
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Add Achievement" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Round 20"
            className="bg-bunker-800 border-bunker-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Slug (optional, auto from name)</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="round-20"
            className="bg-bunker-800 border-bunker-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Type</label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            className="bg-bunker-800 border-bunker-600 text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">XP Reward</label>
          <Input
            type="number"
            min={0}
            value={xpReward}
            onChange={(e) => setXpReward(e.target.value)}
            className="bg-bunker-800 border-bunker-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Criteria (JSON)</label>
          <textarea
            value={criteriaJson}
            onChange={(e) => setCriteriaJson(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded bg-bunker-800 border border-bunker-600 text-white text-sm font-mono resize-y"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
