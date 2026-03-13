'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Egg,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { getGameDisplayShortName } from '@/lib/bo3-custom';
import { cn } from '@/lib/utils';
import { useActionProgress } from '@/context/action-progress-context';

type Game = { id: string; shortName: string; name: string };
type MapOption = { id: string; name: string; slug: string; gameId: string; game?: { shortName: string } };
type EasterEggStep = { id: string; order: number; label: string; imageUrl: string | null; buildableReferenceSlug: string | null };
type EasterEgg = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  xpReward: number;
  playerCountRequirement: string | null;
  rewardsDescription: string | null;
  videoEmbedUrl: string | null;
  variantTag: string | null;
  categoryTag: string | null;
  isActive: boolean;
  steps: EasterEggStep[];
};

const EE_TYPE_LABELS: Record<string, string> = {
  MAIN_QUEST: 'Main Quest',
  SIDE_QUEST: 'Side Quest',
  MUSICAL: 'Musical',
  BUILDABLE: 'Buildable',
};

const PLAYER_COUNT_OPTIONS = [
  { value: '', label: '— None —' },
  { value: 'SOLO', label: 'Solo only' },
  { value: 'DUO', label: '2+ players' },
  { value: 'TRIO', label: '3+ players' },
  { value: 'SQUAD', label: '4 players' },
];

export default function AdminEasterEggsPage() {
  const [forbidden, setForbidden] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [maps, setMaps] = useState<MapOption[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedMapId, setSelectedMapId] = useState('');
  const [mapData, setMapData] = useState<{ map: MapOption; easterEggs: EasterEgg[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [eeLoading, setEeLoading] = useState(false);
  const [editingEe, setEditingEe] = useState<EasterEgg | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { admin: null }))
      .then((d: { admin?: { isSuperAdmin?: boolean; isEasterEggAdmin?: boolean } | null }) => {
        if (!d.admin?.isSuperAdmin && !d.admin?.isEasterEggAdmin) setForbidden(true);
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

  const filteredMaps = selectedGameId
    ? maps.filter((m) => m.gameId === selectedGameId)
    : maps;

  const fetchEasterEggs = useCallback(() => {
    if (!selectedMapId) {
      setMapData(null);
      return;
    }
    setEeLoading(true);
    fetch(`/api/admin/easter-eggs?mapId=${selectedMapId}`, { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => {
        if (r.status === 403) {
          setForbidden(true);
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (d) setMapData({ map: d.map, easterEggs: d.easterEggs ?? [] });
        else setMapData(null);
      })
      .catch(() => setMapData(null))
      .finally(() => setEeLoading(false));
  }, [selectedMapId]);

  useEffect(() => {
    fetchEasterEggs();
  }, [fetchEasterEggs]);

  useEffect(() => {
    setSelectedMapId('');
  }, [selectedGameId]);

  if (forbidden) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card variant="bordered" className="border-blood-800/50">
          <CardContent className="p-8 text-center">
            <p className="text-blood-400 font-medium">Access denied.</p>
            <Link href="/" className="mt-4 inline-block text-bunker-400 hover:text-white">
              Back home
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
          <Egg className="w-6 h-6 text-amber-500" />
          Easter Egg Editor
        </h1>
        <p className="text-sm text-bunker-400 mt-1">
          Edit easter eggs, steps, and buildables for any map.
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
              ...games.map((g) => ({ value: g.id, label: getGameDisplayShortName(g.shortName, g.name) })),
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
        <div className="mb-4 p-3 rounded-lg bg-blood-950/50 border border-blood-700 text-blood-300 text-sm">
          {error}
        </div>
      )}

      {selectedMapId && (
        <>
          {eeLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : mapData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-bunker-400">
                  {getGameDisplayShortName(mapData.map.game?.shortName)} / {mapData.map.name} — {mapData.easterEggs.length} easter eggs
                </p>
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
                    Add Easter Egg
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {mapData.easterEggs.map((ee) => (
                  <Card key={ee.id} variant="bordered" className="border-bunker-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white">{ee.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-bunker-700 text-bunker-400">
                              {EE_TYPE_LABELS[ee.type] ?? ee.type}
                            </span>
                            {ee.xpReward > 0 && (
                              <span className="text-xs text-amber-400">{ee.xpReward} XP</span>
                            )}
                          </div>
                          <p className="text-sm text-bunker-500 mt-1">
                            {ee.steps.length} steps · slug: {ee.slug}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingEe(ee)}
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              if (!confirm(`Delete "${ee.name}"? This cannot be undone.`)) return;
                              setSaving(true);
                              setError(null);
                              const r = await fetch(`/api/admin/easter-eggs/${ee.id}`, {
                                method: 'DELETE',
                                credentials: 'same-origin',
                              });
                              if (r.ok) fetchEasterEggs();
                              else {
                                const d = await r.json().catch(() => ({}));
                                setError(d.error || 'Failed to delete');
                              }
                              setSaving(false);
                            }}
                            disabled={saving}
                            className="text-blood-400 hover:bg-blood-950/50 hover:text-blood-300"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
        <p className="text-bunker-500 py-12 text-center">Select a game and map to edit easter eggs.</p>
      )}

      {editingEe && mapData && (
        <EasterEggEditModal
          easterEgg={editingEe}
          buildables={mapData.easterEggs.filter((e) => e.type === 'BUILDABLE')}
          onClose={() => setEditingEe(null)}
          onSaved={() => {
            setEditingEe(null);
            fetchEasterEggs();
          }}
          onError={setError}
        />
      )}

      {createOpen && selectedMapId && mapData && (
        <CreateEasterEggModal
          mapId={selectedMapId}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            fetchEasterEggs();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

function EasterEggEditModal({
  easterEgg,
  buildables,
  onClose,
  onSaved,
  onError,
}: {
  easterEgg: EasterEgg;
  buildables: EasterEgg[];
  onClose: () => void;
  onSaved: () => void;
  onError: (s: string | null) => void;
}) {
  const [form, setForm] = useState({
    name: easterEgg.name,
    slug: easterEgg.slug,
    type: easterEgg.type,
    description: easterEgg.description ?? '',
    xpReward: String(easterEgg.xpReward),
    playerCountRequirement: easterEgg.playerCountRequirement ?? '',
    rewardsDescription: easterEgg.rewardsDescription ?? '',
    videoEmbedUrl: easterEgg.videoEmbedUrl ?? '',
    variantTag: easterEgg.variantTag ?? '',
    categoryTag: easterEgg.categoryTag ?? '',
    isActive: easterEgg.isActive,
  });
  const [steps, setSteps] = useState<EasterEggStep[]>([...easterEgg.steps].sort((a, b) => a.order - b.order));
  const [saving, setSaving] = useState(false);
  const runWithProgress = useActionProgress()?.runWithProgress;

  const handleSaveMeta = async () => {
    setSaving(true);
    onError(null);
    const doSave = async () => {
      const r = await fetch(`/api/admin/easter-eggs/${easterEgg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          type: form.type,
          description: form.description.trim() || null,
          xpReward: parseInt(form.xpReward, 10) || 0,
          playerCountRequirement: form.playerCountRequirement || null,
          rewardsDescription: form.rewardsDescription.trim() || null,
          videoEmbedUrl: form.videoEmbedUrl.trim() || null,
          variantTag: form.variantTag.trim() || null,
          categoryTag: form.categoryTag.trim() || null,
          isActive: form.isActive,
        }),
      });
      if (r.ok) onSaved();
      else {
        const d = await r.json().catch(() => ({}));
        onError(d.error || 'Failed to save');
      }
    };
    try {
      await (runWithProgress
        ? runWithProgress('Saving easter egg...', (report) =>
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

  const moveStep = async (index: number, dir: 'up' | 'down') => {
    const newOrder = dir === 'up' ? index - 1 : index + 1;
    if (newOrder < 0 || newOrder >= steps.length) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[newOrder]] = [newSteps[newOrder], newSteps[index]];
    const stepIds = newSteps.map((s) => s.id);
    const r = await fetch(`/api/admin/easter-eggs/${easterEgg.id}/steps`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ stepIds }),
    });
    if (r.ok) setSteps(newSteps.map((s, i) => ({ ...s, order: i + 1 })));
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit Easter Egg" size="xl" contentScroll={false}>
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
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
            <label className="block text-xs font-medium text-bunker-500 mb-1">Slug (URL-friendly)</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder="main-quest"
              className="bg-bunker-800 border-bunker-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-bunker-500 mb-1">Type</label>
            <Select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              options={Object.entries(EE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              className="bg-bunker-800 border-bunker-600 text-white"
            />
          </div>
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
        </div>

        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white text-sm resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Video (YouTube)</label>
          <Input
            value={form.videoEmbedUrl}
            onChange={(e) => setForm((p) => ({ ...p, videoEmbedUrl: e.target.value }))}
            placeholder="Paste watch link or embed URL (e.g. youtube.com/watch?v=...)"
            className="bg-bunker-800 border-bunker-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-bunker-500 mb-1">Player count</label>
            <Select
              value={form.playerCountRequirement}
              onChange={(e) => setForm((p) => ({ ...p, playerCountRequirement: e.target.value }))}
              options={PLAYER_COUNT_OPTIONS}
              className="bg-bunker-800 border-bunker-600 text-white"
            />
          </div>
          <div className="flex items-end gap-2">
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
        </div>

        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Rewards description</label>
          <Input
            value={form.rewardsDescription}
            onChange={(e) => setForm((p) => ({ ...p, rewardsDescription: e.target.value }))}
            placeholder="e.g. 90s Death Machine"
            className="bg-bunker-800 border-bunker-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-bunker-500 mb-1">Variant tag</label>
            <Input
              value={form.variantTag}
              onChange={(e) => setForm((p) => ({ ...p, variantTag: e.target.value }))}
              placeholder="e.g. Richtofen, Dr. Maxis"
              className="bg-bunker-800 border-bunker-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-bunker-500 mb-1">Category tag</label>
            <Input
              value={form.categoryTag}
              onChange={(e) => setForm((p) => ({ ...p, categoryTag: e.target.value }))}
              placeholder="e.g. Cipher, Relic"
              className="bg-bunker-800 border-bunker-600"
            />
          </div>
        </div>

        <hr className="border-bunker-700" />

        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Steps</h3>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <StepEditor
                key={step.id}
                step={step}
                buildables={buildables}
                onUpdate={async (updates) => {
                  const r = await fetch(`/api/admin/easter-eggs/steps/${step.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify(updates),
                  });
                  if (r.ok) {
                    const updated = await r.json();
                    setSteps((prev) => prev.map((s) => (s.id === step.id ? updated : s)));
                  }
                }}
                onDelete={async () => {
                  const r = await fetch(`/api/admin/easter-eggs/steps/${step.id}`, {
                    method: 'DELETE',
                    credentials: 'same-origin',
                  });
                  if (r.ok) setSteps((prev) => prev.filter((s) => s.id !== step.id));
                }}
                onMoveUp={i > 0 ? () => moveStep(i, 'up') : undefined}
                onMoveDown={i < steps.length - 1 ? () => moveStep(i, 'down') : undefined}
              />
            ))}
          </div>
          <AddStepButton
            easterEggId={easterEgg.id}
            nextOrder={steps.length + 1}
            onAdded={(s) => setSteps((prev) => [...prev, s].sort((a, b) => a.order - b.order))}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveMeta} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function StepEditor({
  step,
  buildables,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  step: EasterEggStep;
  buildables: EasterEgg[];
  onUpdate: (u: Partial<EasterEggStep>) => Promise<void>;
  onDelete: () => Promise<void>;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [label, setLabel] = useState(step.label);
  const [imageUrl, setImageUrl] = useState(step.imageUrl ?? '');
  const [buildableSlug, setBuildableSlug] = useState(step.buildableReferenceSlug ?? '');

  useEffect(() => {
    setLabel(step.label);
    setImageUrl(step.imageUrl ?? '');
    setBuildableSlug(step.buildableReferenceSlug ?? '');
  }, [step.id, step.label, step.imageUrl, step.buildableReferenceSlug]);

  const save = async () => {
    if (label === step.label && imageUrl === (step.imageUrl ?? '') && buildableSlug === (step.buildableReferenceSlug ?? ''))
      return;
    await onUpdate({ label, imageUrl: imageUrl || null, buildableReferenceSlug: buildableSlug || null });
  };

  return (
    <div className="p-3 rounded-lg bg-bunker-800/60 border border-bunker-700 flex gap-2">
      <div className="flex flex-col gap-1 shrink-0">
        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            className="p-1 rounded text-bunker-400 hover:text-white hover:bg-bunker-700"
            aria-label="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            className="p-1 rounded text-bunker-400 hover:text-white hover:bg-bunker-700"
            aria-label="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
        <span className="text-xs text-bunker-500 font-mono">{step.order}</span>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <textarea
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={save}
          rows={2}
          className="w-full px-3 py-2 rounded bg-bunker-900 border border-bunker-600 text-white text-sm resize-y"
        />
        <div className="flex gap-2 flex-wrap">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onBlur={save}
            placeholder="Image URL"
            className="flex-1 min-w-[12rem] bg-bunker-900 border-bunker-600 text-sm"
          />
          <select
            value={buildableSlug}
            onChange={(e) => {
              setBuildableSlug(e.target.value);
              onUpdate({ buildableReferenceSlug: e.target.value || null });
            }}
            className="px-3 py-2 rounded bg-bunker-900 border border-bunker-600 text-white text-sm"
          >
            <option value="">— No buildable ref —</option>
            {buildables.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="p-2 rounded text-blood-400 hover:bg-blood-950/50 shrink-0"
        aria-label="Delete step"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function AddStepButton({
  easterEggId,
  nextOrder,
  onAdded,
}: {
  easterEggId: string;
  nextOrder: number;
  onAdded: (s: EasterEggStep) => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!label.trim()) return;
    setSaving(true);
    const r = await fetch(`/api/admin/easter-eggs/${easterEggId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ order: nextOrder, label: label.trim() }),
    });
    if (r.ok) {
      const step = await r.json();
      onAdded(step);
      setLabel('');
      setOpen(false);
    }
    setSaving(false);
  };

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
        Add step
      </Button>
      {open && (
        <Modal isOpen onClose={() => setOpen(false)} title="Add step" size="md">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-bunker-500 mb-1">Step label</label>
              <textarea
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded bg-bunker-800 border border-bunker-600 text-white resize-y"
                placeholder="Describe this step..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!label.trim() || saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function CreateEasterEggModal({
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
  const [type, setType] = useState('SIDE_QUEST');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    const n = name.trim();
    if (!n) return;
    setSaving(true);
    onError(null);
    const r = await fetch('/api/admin/easter-eggs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        mapId,
        name: n,
        slug: slug.trim() || undefined,
        type,
      }),
    });
    if (r.ok) onCreated();
    else {
      const d = await r.json().catch(() => ({}));
      onError(d.error || 'Failed to create');
    }
    setSaving(false);
  };

  return (
    <Modal isOpen onClose={onClose} title="Add Easter Egg" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Quest"
            className="bg-bunker-800 border-bunker-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Slug (optional, auto from name)</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="main-quest"
            className="bg-bunker-800 border-bunker-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bunker-500 mb-1">Type</label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={Object.entries(EE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            className="bg-bunker-800 border-bunker-600 text-white"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!name.trim() || saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
