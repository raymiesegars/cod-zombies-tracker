'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, Avatar, Logo, Button, Select } from '@/components/ui';
import { RoundCounter } from '@/components/game';
import { getAssetUrl } from '@/lib/assets';
import { ShieldCheck, CheckSquare, Square, Loader2, CheckCircle2 } from 'lucide-react';
import type { PendingVerificationRun } from '@/components/game/pending-verification-section';

const PLAYER_COUNT_LABEL: Record<string, string> = {
  SOLO: 'Solo',
  DUO: 'Duo',
  TRIO: 'Trio',
  SQUAD: 'Squad',
};

type GameOption = { id: string; shortName: string; name: string };

function runKey(item: PendingVerificationRun) {
  return `${item.logType}-${item.logId}`;
}

export default function AdminVerificationPage() {
  const [runs, setRuns] = useState<PendingVerificationRun[]>([]);
  const [games, setGames] = useState<GameOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [filterGame, setFilterGame] = useState<string>('');
  const [filterRunType, setFilterRunType] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [approving, setApproving] = useState(false);

  const fetchRuns = useCallback(() => {
    const params = new URLSearchParams();
    if (filterGame) params.set('game', filterGame);
    if (filterRunType === 'speedrun') params.set('runType', 'speedrun');
    fetch(`/api/admin/pending-verification?${params}`, { credentials: 'same-origin' })
      .then((res) => {
        if (res.status === 403) {
          setForbidden(true);
          return { runs: [] };
        }
        return res.ok ? res.json() : { runs: [] };
      })
      .then((data) => setRuns(data.runs ?? []))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, [filterGame, filterRunType]);

  useEffect(() => {
    setLoading(true);
    fetchRuns();
  }, [fetchRuns]);

  useEffect(() => {
    fetch('/api/games', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((list: { id: string; shortName: string; name: string }[]) =>
        setGames(list.map((g) => ({ id: g.id, shortName: g.shortName, name: g.name })))
      )
      .catch(() => setGames([]));
  }, []);

  const toggleSelect = (item: PendingVerificationRun) => {
    const key = runKey(item);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === runs.length) setSelected(new Set());
    else setSelected(new Set(runs.map((r) => runKey(r))));
  };

  const approveSelected = async () => {
    if (selected.size === 0) return;
    setApproving(true);
    const toApprove = runs.filter((r) => selected.has(runKey(r)));
    let done = 0;
    for (const item of toApprove) {
      try {
        const res = await fetch('/api/admin/verify/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ logType: item.logType, logId: item.logId }),
        });
        if (res.ok) {
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(runKey(item));
            return next;
          });
          done++;
        }
      } catch {
        // continue
      }
    }
    setApproving(false);
    if (done > 0) fetchRuns();
  };

  if (forbidden) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <Card variant="bordered" className="max-w-md w-full border-bunker-700">
          <CardContent className="py-8 text-center">
            <p className="text-bunker-300 mb-4">You don&apos;t have access to this page.</p>
            <Link href="/">
              <Button variant="secondary">Back to home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bunker-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-zombies text-white tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blood-500" />
              Admin — Pending Verification
            </h1>
            <p className="text-sm text-bunker-400 mt-1">
              Select runs to verify in bulk. Click a run to open it in a new tab.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              label=""
              options={[
                { value: '', label: 'All games' },
                ...games.map((g) => ({ value: g.shortName, label: g.name })),
              ]}
              value={filterGame}
              onChange={(e) => setFilterGame(e.target.value)}
            />
            <Select
              label=""
              options={[
                { value: 'all', label: 'All runs' },
                { value: 'speedrun', label: 'Speedruns only' },
              ]}
              value={filterRunType}
              onChange={(e) => setFilterRunType(e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={selectAll}
              className="shrink-0"
            >
              {selected.size === runs.length && runs.length > 0 ? 'Deselect all' : 'Select all'}
            </Button>
            <Button
              size="sm"
              onClick={approveSelected}
              disabled={selected.size === 0 || approving}
              leftIcon={approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              className="shrink-0"
            >
              {approving ? 'Approving…' : `Approve selected (${selected.size})`}
            </Button>
          </div>
        </div>

        {loading ? (
          <Card variant="bordered" className="border-bunker-700">
            <CardContent className="py-12 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
            </CardContent>
          </Card>
        ) : runs.length === 0 ? (
          <Card variant="bordered" className="border-bunker-700">
            <CardContent className="py-8 text-center text-bunker-400 text-sm">
              No runs pending verification.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {runs.map((item) => {
              const key = runKey(item);
              const isSelected = selected.has(key);
              const roundNum = item.roundReached ?? item.roundCompleted ?? null;
              const userName = item.user.displayName || item.user.username;
              const playerLabel = PLAYER_COUNT_LABEL[item.playerCount] || item.playerCount;
              const imageSrc = item.mapImageUrl ? getAssetUrl(item.mapImageUrl) : null;
              const runHref = `/maps/${item.mapSlug}/run/${item.logType === 'challenge' ? 'challenge' : 'easter-egg'}/${item.logId}`;
              return (
                <div
                  key={key}
                  className="relative"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('a')) return;
                    toggleSelect(item);
                  }}
                >
                  <Card
                    variant="bordered"
                    className={`overflow-hidden h-full cursor-pointer transition-all border-2 ${
                      isSelected ? 'border-blood-500 bg-blood-950/30' : 'border-bunker-700 hover:border-bunker-600'
                    }`}
                  >
                    <div className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-md bg-bunker-900/95 border border-bunker-600">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blood-400" aria-hidden />
                      ) : (
                        <Square className="w-5 h-5 text-bunker-400" aria-hidden />
                      )}
                    </div>
                    <Link href={runHref} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <div className="relative aspect-video overflow-hidden bg-bunker-900">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={item.mapName}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                              src={item.user.avatarUrl}
                              fallback={userName}
                              size="sm"
                              className="shrink-0 w-6 h-6 border border-bunker-600"
                            />
                            <span className="text-xs font-medium text-bunker-200 truncate max-w-[120px] sm:max-w-[160px]">
                              {item.runLabel} · {userName}
                            </span>
                          </div>
                        </div>
                        {roundNum != null && (
                          <div className="absolute bottom-2 right-2">
                            <RoundCounter round={roundNum} size="xs" animated={false} />
                          </div>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-2">
                      <p className="text-xs text-bunker-500">Click to select · link opens in new tab</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
