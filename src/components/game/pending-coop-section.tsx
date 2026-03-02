'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, Button, Avatar, Input } from '@/components/ui';
import { getAssetUrl } from '@/lib/assets';
import { Logo } from '@/components/ui';
import { RoundCounter, ProofUrlsInput } from '@/components/game';
import { useAuth } from '@/context/auth-context';
import { dispatchXpToast } from '@/context/xp-toast-context';
import { normalizeProofUrls } from '@/lib/utils';
import { Users, CheckCircle, XCircle, Loader2, CheckSquare, Square, Pencil } from 'lucide-react';

export type PendingCoOpItem = {
  id: string;
  logType: 'challenge' | 'easter_egg';
  logId: string;
  mapSlug: string;
  mapName: string;
  mapImageUrl?: string | null;
  gameShortName: string;
  runLabel: string;
  roundReached?: number;
  roundCompleted?: number | null;
  playerCount: string;
  creator: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
};

const PLAYER_COUNT_LABEL: Record<string, string> = {
  SOLO: 'Solo',
  DUO: 'Duo',
  TRIO: 'Trio',
  SQUAD: 'Squad',
};

type ProofOverride = { proofUrls: string[]; screenshotUrl?: string | null };

export function PendingCoOpSection() {
  const { profile, refreshProfile } = useAuth();
  const [pendings, setPendings] = useState<PendingCoOpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<PendingCoOpItem | null>(null);
  const [denyModal, setDenyModal] = useState<PendingCoOpItem | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [proofOverrides, setProofOverrides] = useState<Record<string, ProofOverride>>({});
  const [editProofModal, setEditProofModal] = useState<PendingCoOpItem | null>(null);
  const [editProofUrls, setEditProofUrls] = useState<string[]>([]);
  const [editProofScreenshot, setEditProofScreenshot] = useState<string>('');

  useEffect(() => {
    fetch('/api/me/pending-coop', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { pendings: [] }))
      .then((data) => setPendings(data.pendings ?? []))
      .catch(() => setPendings([]))
      .finally(() => setLoading(false));
  }, []);

  const openEditProof = (item: PendingCoOpItem) => {
    const over = proofOverrides[item.id];
    setEditProofUrls(over?.proofUrls ?? []);
    setEditProofScreenshot(over?.screenshotUrl ?? '');
    setEditProofModal(item);
  };

  const saveEditProof = () => {
    if (!editProofModal) return;
    const urls = normalizeProofUrls(editProofUrls);
    setProofOverrides((prev) => ({
      ...prev,
      [editProofModal.id]: {
        proofUrls: urls,
        screenshotUrl: editProofScreenshot.trim() || null,
      },
    }));
    setEditProofModal(null);
  };

  const postConfirm = async (pendingId: string, override: ProofOverride | undefined) => {
    const body =
      override && (override.proofUrls.length > 0 || override.screenshotUrl)
        ? {
            proofUrls: override.proofUrls,
            ...(override.screenshotUrl !== undefined && { screenshotUrl: override.screenshotUrl }),
          }
        : undefined;
    const res = await fetch(`/api/me/pending-coop/${pendingId}/confirm`, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined,
    });
    return res;
  };

  const handleConfirm = async (item: PendingCoOpItem) => {
    setActingId(item.id);
    try {
      const res = await postConfirm(item.id, proofOverrides[item.id]);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setPendings((prev) => prev.filter((p) => p.id !== item.id));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
        setProofOverrides((prev) => {
          const { [item.id]: _, ...rest } = prev;
          return rest;
        });
        setConfirmModal(null);
        await refreshProfile?.();
        if (typeof data.xpGained === 'number' && data.xpGained > 0) {
          const mysteryBoxXp = typeof data.mysteryBoxXp === 'number' ? data.mysteryBoxXp : 0;
          const achievementXp = data.xpGained - mysteryBoxXp;
          if (mysteryBoxXp > 0) {
            dispatchXpToast(mysteryBoxXp, {
              totalXp: typeof data.mysteryBoxTotalXp === 'number' ? data.mysteryBoxTotalXp : data.totalXp,
              label: 'Mystery Box Challenge Complete',
            });
          }
          if (achievementXp > 0) {
            dispatchXpToast(achievementXp, typeof data.totalXp === 'number' ? { totalXp: data.totalXp } : undefined);
          }
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('cod-tracker-profile-refresh-requested', { detail: { username: profile?.username } })
          );
        }
      }
    } finally {
      setActingId(null);
    }
  };

  const handleAcceptSelected = async () => {
    if (selected.size === 0) return;
    const toAccept = pendings.filter((p) => selected.has(p.id));
    setActingId('bulk');
    try {
      let xpTotal = 0;
      for (const item of toAccept) {
        const res = await postConfirm(item.id, proofOverrides[item.id]);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (typeof data.xpGained === 'number') xpTotal += data.xpGained;
          setPendings((prev) => prev.filter((p) => p.id !== item.id));
          setProofOverrides((prev) => {
            const { [item.id]: _, ...rest } = prev;
            return rest;
          });
        }
      }
      setSelected(new Set());
      await refreshProfile?.();
      if (xpTotal > 0) {
        dispatchXpToast(xpTotal, undefined);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('cod-tracker-profile-refresh-requested', { detail: { username: profile?.username } })
        );
      }
    } finally {
      setActingId(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === pendings.length) setSelected(new Set());
    else setSelected(new Set(pendings.map((p) => p.id)));
  };

  const handleDeny = async (item: PendingCoOpItem) => {
    setActingId(item.id);
    try {
      const res = await fetch(`/api/me/pending-coop/${item.id}/deny`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (res.ok) {
        setPendings((prev) => prev.filter((p) => p.id !== item.id));
        setDenyModal(null);
      }
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <Card variant="bordered" className="border-bunker-700">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-bunker-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blood-500" />
          Pending co-op runs
        </h2>
        <p className="text-sm text-bunker-400 mb-4">
          Someone logged a run and listed you as a teammate. Confirm to add it to your profile (achievements & XP), or deny to remove yourself from their run.
        </p>
        {pendings.length === 0 ? (
          <Card variant="bordered" className="border-bunker-700">
            <CardContent className="py-6 text-center text-bunker-400 text-sm">
              No pending co-op runs right now.
            </CardContent>
          </Card>
        ) : (
        <>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={selectAll}
            disabled={actingId !== null}
            leftIcon={selected.size === pendings.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            className="border-bunker-600"
          >
            {selected.size === pendings.length ? 'Deselect all' : 'Select all'}
          </Button>
          {selected.size > 0 && (
            <Button
              size="sm"
              onClick={handleAcceptSelected}
              disabled={actingId !== null}
              leftIcon={actingId === 'bulk' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            >
              {actingId === 'bulk' ? 'Accepting…' : `Accept selected (${selected.size})`}
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendings.map((item) => {
            const roundNum = item.roundReached ?? item.roundCompleted ?? null;
            const creatorName = item.creator.displayName || item.creator.username;
            const playerLabel = PLAYER_COUNT_LABEL[item.playerCount] || item.playerCount;
            const imageSrc = item.mapImageUrl ? getAssetUrl(item.mapImageUrl) : null;
            const isSelected = selected.has(item.id);
            const hasProofOverride = !!proofOverrides[item.id] && (proofOverrides[item.id].proofUrls.length > 0 || proofOverrides[item.id].screenshotUrl);
            return (
              <Card
                key={item.id}
                variant="bordered"
                className={`overflow-hidden cursor-pointer transition-colors ${isSelected ? 'border-blood-500 ring-1 ring-blood-500/50' : 'border-bunker-700'}`}
                onClick={() => toggleSelect(item.id)}
              >
                <div className="relative aspect-video overflow-hidden bg-bunker-900">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={item.mapName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-bunker-800 to-bunker-950 flex items-center justify-center">
                      <Logo size="lg" animated={false} className="opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bunker-950 via-bunker-950/20 to-transparent" />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border border-blood-600/60 bg-blood-950/95 text-white">
                      {item.gameShortName}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border border-bunker-500/60 bg-bunker-900/95 text-bunker-200">
                      {playerLabel}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1.5">
                    <p className="text-sm font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                      {item.mapName}
                    </p>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-bunker-950/90 border border-bunker-600/80 w-fit">
                      <Avatar
                        src={item.creator.avatarUrl}
                        fallback={creatorName}
                        size="sm"
                        className="shrink-0 w-6 h-6 border border-bunker-600"
                      />
                      <span className="text-xs font-medium text-bunker-200 truncate max-w-[140px] sm:max-w-[180px]">
                        Tagged by {creatorName}
                      </span>
                    </div>
                  </div>
                  {roundNum != null && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                      <RoundCounter round={roundNum} size="xs" animated={false} className="sm:hidden" />
                      <RoundCounter round={roundNum} size="sm" animated={false} className="hidden sm:flex" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded border ${isSelected ? 'border-blood-400 bg-blood-500/30 text-white' : 'border-bunker-500 bg-bunker-800/80 text-bunker-400'}`}>
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </span>
                  </div>
                </div>
                <CardContent className="p-3 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditProof(item);
                    }}
                    disabled={actingId !== null}
                    leftIcon={<Pencil className="w-4 h-4" />}
                    className="w-full border-bunker-600 justify-center"
                  >
                    Edit proof
                    {hasProofOverride && <span className="ml-1 text-blood-400">•</span>}
                  </Button>
                  <div className="flex flex-row gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDenyModal(item);
                      }}
                      disabled={actingId !== null}
                      leftIcon={<XCircle className="w-4 h-4" />}
                      className="flex-1 border-bunker-600"
                    >
                      Deny
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal(item);
                      }}
                      disabled={actingId !== null}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      className="flex-1"
                    >
                      Confirm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </>
        )}
      </section>

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true" aria-labelledby="confirm-coop-title">
          <Card variant="bordered" className="w-full max-w-md border-bunker-600">
            <CardContent className="p-4 sm:p-6">
              <h3 id="confirm-coop-title" className="text-lg font-semibold text-white mb-2">
                Add this run to your profile?
              </h3>
              <p className="text-sm text-bunker-300 mb-4">
                An identical log will be added to your profile. You&apos;ll receive any applicable achievements and XP. This won&apos;t send new pending requests to other teammates.
              </p>
              <p className="text-sm text-bunker-400 mb-4">
                <strong className="text-bunker-200">{confirmModal.creator.displayName || confirmModal.creator.username}</strong> logged: {confirmModal.runLabel} on {confirmModal.mapName}.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmModal(null)}
                  className="sm:mr-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleConfirm(confirmModal)}
                  disabled={actingId !== null}
                  leftIcon={actingId === confirmModal.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                >
                  {actingId === confirmModal.id ? 'Adding…' : 'Yes, add to my profile'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {denyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true" aria-labelledby="deny-coop-title">
          <Card variant="bordered" className="w-full max-w-md border-bunker-600">
            <CardContent className="p-4 sm:p-6">
              <h3 id="deny-coop-title" className="text-lg font-semibold text-white mb-2">
                Remove yourself from this run?
              </h3>
              <p className="text-sm text-bunker-300 mb-4">
                This will remove the pending from your dashboard and remove your name from the creator&apos;s run. Their run will otherwise stay unchanged. This can&apos;t be undone.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setDenyModal(null)}
                  className="sm:mr-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDeny(denyModal)}
                  disabled={actingId !== null}
                  leftIcon={actingId === denyModal.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  className="border-blood-800 text-blood-300 hover:bg-blood-950/50"
                >
                  {actingId === denyModal.id ? 'Removing…' : 'Yes, remove me'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editProofModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-proof-title"
          onClick={() => setEditProofModal(null)}
        >
          <Card
            variant="bordered"
            className="w-full max-w-lg border-bunker-600 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-4 sm:p-6">
              <h3 id="edit-proof-title" className="text-lg font-semibold text-white mb-1">
                Add your proof before accepting
              </h3>
              <p className="text-sm text-bunker-400 mb-4">
                {editProofModal.runLabel} on {editProofModal.mapName}. This proof will be saved on your copy when you accept.
              </p>
              <ProofUrlsInput
                value={editProofUrls}
                onChange={setEditProofUrls}
                label="Proof URLs"
                placeholder="YouTube, Twitch, or image link"
              />
              <div className="mt-3">
                <label className="block text-sm font-medium text-bunker-200 mb-1.5">Screenshot URL (optional)</label>
                <Input
                  type="url"
                  value={editProofScreenshot}
                  onChange={(e) => setEditProofScreenshot(e.target.value)}
                  placeholder="https://..."
                  className="bg-bunker-800 border-bunker-600 text-white"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
                <Button variant="secondary" onClick={() => setEditProofModal(null)} className="sm:mr-auto">
                  Cancel
                </Button>
                <Button onClick={saveEditProof}>Save proof</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
