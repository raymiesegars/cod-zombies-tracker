'use client';

import { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Card, CardContent, Input } from '@/components/ui';
import { AlertTriangle, ArrowRightLeft, Loader2, RotateCcw, Search, UserCheck } from 'lucide-react';

type CandidateUser = {
  id: string;
  username: string;
  displayName: string | null;
  isArchived: boolean;
  isExternalPlaceholder: boolean;
  externalAvatarSource: string | null;
  externalDisplayName: string | null;
  _count: { challengeLogs: number; easterEggLogs: number; externalIdentities: number };
};

type MergePreview = {
  sourceUser: {
    id: string;
    username: string;
    displayName: string | null;
    isArchived: boolean;
    isExternalPlaceholder: boolean;
  };
  targetUser: {
    id: string;
    username: string;
    displayName: string | null;
    isArchived: boolean;
    isExternalPlaceholder: boolean;
  };
  moveChallengeLogCount: number;
  moveEasterEggLogCount: number;
  duplicateChallengeLogCount: number;
  duplicateEasterEggLogCount: number;
  sourceChallengeLogCount: number;
  sourceEasterEggLogCount: number;
  sourceVerifiedChallengeLogCount: number;
  sourceVerifiedEasterEggLogCount: number;
  touchedMapCount: number;
};

type AdminMeResponse = { admin?: { isSuperAdmin?: boolean } | null };

type MergeHistoryRow = {
  id: string;
  createdAt: string;
  notes: string | null;
  sourceUser: { id: string; username: string; displayName: string | null; isArchived: boolean };
  targetUser: { id: string; username: string; displayName: string | null; isArchived: boolean };
  mergedByUser: { id: string; username: string; displayName: string | null };
  movedChallengeLogCount: number;
  movedEasterEggLogCount: number;
  skippedChallengeDuplicateCount: number;
  skippedEasterEggDuplicateCount: number;
  rollbackEligible: boolean;
};

function labelForUser(user: Pick<CandidateUser, 'displayName' | 'username'>) {
  return user.displayName?.trim() || user.username;
}

export default function AdminUserMergePage() {
  const [forbidden, setForbidden] = useState(false);
  const [qSource, setQSource] = useState('');
  const [qTarget, setQTarget] = useState('');
  const [sourceCandidates, setSourceCandidates] = useState<CandidateUser[]>([]);
  const [targetCandidates, setTargetCandidates] = useState<CandidateUser[]>([]);
  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [selectedSource, setSelectedSource] = useState<CandidateUser | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<CandidateUser | null>(null);
  const [preview, setPreview] = useState<MergePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [historyRows, setHistoryRows] = useState<MergeHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [rollbackLoadingId, setRollbackLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() as Promise<AdminMeResponse> : { admin: null }))
      .then((d) => {
        if (!d.admin?.isSuperAdmin) setForbidden(true);
      })
      .catch(() => setForbidden(true));
  }, []);

  useEffect(() => {
    const query = qSource.trim();
    if (query.length < 2) {
      setSourceCandidates([]);
      return;
    }
    setLoadingSource(true);
    const handle = setTimeout(() => {
      fetch(`/api/admin/users/merge/candidates?q=${encodeURIComponent(query)}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      })
        .then((r) => (r.ok ? r.json() : { users: [] }))
        .then((d) => setSourceCandidates((d.users ?? []) as CandidateUser[]))
        .catch(() => setSourceCandidates([]))
        .finally(() => setLoadingSource(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [qSource]);

  useEffect(() => {
    const query = qTarget.trim();
    if (query.length < 2) {
      setTargetCandidates([]);
      return;
    }
    setLoadingTarget(true);
    const handle = setTimeout(() => {
      fetch(`/api/admin/users/merge/candidates?q=${encodeURIComponent(query)}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      })
        .then((r) => (r.ok ? r.json() : { users: [] }))
        .then((d) => setTargetCandidates((d.users ?? []) as CandidateUser[]))
        .catch(() => setTargetCandidates([]))
        .finally(() => setLoadingTarget(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [qTarget]);

  const canPreview = Boolean(selectedSource?.id && selectedTarget?.id && selectedSource.id !== selectedTarget.id);
  const canExecute = Boolean(preview && !executeLoading);

  async function fetchHistory() {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/admin/users/merge/history?limit=100', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setHistoryRows([]);
        return;
      }
      setHistoryRows((data.rows ?? []) as MergeHistoryRow[]);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    if (!forbidden) fetchHistory().catch(() => {});
  }, [forbidden]);

  const sourceBadge = useMemo(() => {
    if (!selectedSource) return '';
    if (selectedSource.isExternalPlaceholder) return selectedSource.externalAvatarSource ?? 'EXTERNAL';
    return 'REAL';
  }, [selectedSource]);

  const targetBadge = useMemo(() => {
    if (!selectedTarget) return '';
    if (selectedTarget.isExternalPlaceholder) return selectedTarget.externalAvatarSource ?? 'EXTERNAL';
    return 'REAL';
  }, [selectedTarget]);

  async function runPreview() {
    if (!canPreview || !selectedSource || !selectedTarget) return;
    setError(null);
    setSuccess(null);
    setPreviewLoading(true);
    setPreview(null);
    try {
      const res = await fetch('/api/admin/users/merge/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ sourceUserId: selectedSource.id, targetUserId: selectedTarget.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Could not preview merge');
        return;
      }
      setPreview(data.preview as MergePreview);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function runExecute() {
    if (!canExecute || !selectedSource || !selectedTarget) return;
    const ok = window.confirm(
      `Merge ${labelForUser(selectedSource)} into ${labelForUser(selectedTarget)}?\n\nThis will archive the source account.`
    );
    if (!ok) return;

    setError(null);
    setSuccess(null);
    setExecuteLoading(true);
    try {
      const res = await fetch('/api/admin/users/merge/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          sourceUserId: selectedSource.id,
          targetUserId: selectedTarget.id,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Merge failed');
        return;
      }
      setSuccess('Merge completed. Source archived, logs moved, and target achievements/xp revalidated.');
      setPreview(null);
      fetchHistory().catch(() => {});
    } finally {
      setExecuteLoading(false);
    }
  }

  async function runRollback(auditId: string) {
    const ok = window.confirm('Rollback this merge? This will move the tracked logs back and unarchive the source user.');
    if (!ok) return;
    setError(null);
    setSuccess(null);
    setRollbackLoadingId(auditId);
    try {
      const res = await fetch('/api/admin/users/merge/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ auditId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Rollback failed');
        return;
      }
      setSuccess('Rollback completed.');
      fetchHistory().catch(() => {});
    } finally {
      setRollbackLoadingId(null);
    }
  }

  function CandidateList({
    users,
    selectedId,
    onPick,
  }: {
    users: CandidateUser[];
    selectedId: string | null;
    onPick: (user: CandidateUser) => void;
  }) {
    if (users.length === 0) {
      return <p className="text-xs text-bunker-500 px-1 py-2">No users found.</p>;
    }
    return (
      <div className="max-h-80 overflow-auto space-y-2 pr-1">
        {users.map((u) => {
          const active = selectedId === u.id;
          return (
            <button
              type="button"
              key={u.id}
              onClick={() => onPick(u)}
              className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                active
                  ? 'border-blood-500 bg-blood-950/30'
                  : 'border-bunker-700 bg-bunker-900/60 hover:border-bunker-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Avatar src={null} fallback={labelForUser(u)} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{labelForUser(u)}</p>
                  <p className="text-xs text-bunker-400 truncate">@{u.username}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-bunker-400">
                <span>{u._count.challengeLogs} C</span>
                <span>{u._count.easterEggLogs} EE</span>
                {u.isExternalPlaceholder && <span className="text-element-400">Placeholder</span>}
                {u.isArchived && <span className="text-blood-400">Archived</span>}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <Card variant="bordered" className="max-w-md w-full border-bunker-700">
          <CardContent className="py-8 text-center">
            <p className="text-bunker-300">Super admin access is required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bunker-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-zombies text-white tracking-wide flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-blood-500" />
            Admin — User Merge
          </h1>
          <p className="text-sm text-bunker-400 mt-1">
            Merge source user logs into a target user, then archive the source account.
          </p>
        </div>

        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-bunker-400">Source user (will be archived)</p>
              <Input
                value={qSource}
                onChange={(e) => setQSource(e.target.value)}
                placeholder="Search username/display name..."
                leftIcon={loadingSource ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              />
              <CandidateList
                users={sourceCandidates}
                selectedId={selectedSource?.id ?? null}
                onPick={(u) => {
                  setSelectedSource(u);
                  setPreview(null);
                }}
              />
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-bunker-400">Target user (kept active)</p>
              <Input
                value={qTarget}
                onChange={(e) => setQTarget(e.target.value)}
                placeholder="Search username/display name..."
                leftIcon={loadingTarget ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              />
              <CandidateList
                users={targetCandidates}
                selectedId={selectedTarget?.id ?? null}
                onPick={(u) => {
                  setSelectedTarget(u);
                  setPreview(null);
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-bunker-700 bg-bunker-900/60 p-3">
                <p className="text-xs text-bunker-500 uppercase tracking-wider">Source</p>
                <p className="text-sm text-white mt-1">{selectedSource ? labelForUser(selectedSource) : 'Not selected'}</p>
                {selectedSource && <p className="text-xs text-element-400 mt-1">{sourceBadge}</p>}
              </div>
              <div className="rounded-lg border border-bunker-700 bg-bunker-900/60 p-3">
                <p className="text-xs text-bunker-500 uppercase tracking-wider">Target</p>
                <p className="text-sm text-white mt-1">{selectedTarget ? labelForUser(selectedTarget) : 'Not selected'}</p>
                {selectedTarget && <p className="text-xs text-element-400 mt-1">{targetBadge}</p>}
              </div>
            </div>

            <Input
              label="Audit note (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason / context for this merge"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={runPreview}
                disabled={!canPreview || previewLoading || executeLoading}
                leftIcon={previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              >
                {previewLoading ? 'Previewing…' : 'Preview merge'}
              </Button>
              <Button
                variant="danger"
                onClick={runExecute}
                disabled={!canExecute || previewLoading || executeLoading}
                leftIcon={executeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              >
                {executeLoading ? 'Merging…' : 'Execute merge'}
              </Button>
            </div>

            {error && (
              <div className="rounded-lg border border-blood-700/50 bg-blood-950/30 px-3 py-2 text-sm text-blood-300">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-military-700/50 bg-military-950/20 px-3 py-2 text-sm text-military-300">
                {success}
              </div>
            )}

            {preview && (
              <div className="rounded-lg border border-bunker-700 bg-bunker-900/50 p-3 text-sm">
                <p className="text-white font-medium mb-2">Preview</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-bunker-300">
                  <p>Move challenge logs: <span className="text-white">{preview.moveChallengeLogCount}</span></p>
                  <p>Move EE logs: <span className="text-white">{preview.moveEasterEggLogCount}</span></p>
                  <p>Touched maps: <span className="text-white">{preview.touchedMapCount}</span></p>
                  <p>Duplicate challenges: <span className="text-white">{preview.duplicateChallengeLogCount}</span></p>
                  <p>Duplicate EEs: <span className="text-white">{preview.duplicateEasterEggLogCount}</span></p>
                  <p>Verified in source: <span className="text-white">{preview.sourceVerifiedChallengeLogCount + preview.sourceVerifiedEasterEggLogCount}</span></p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="bordered" className="border-bunker-700 overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm font-medium text-white">Merge history</p>
              <Button variant="secondary" size="sm" onClick={() => fetchHistory().catch(() => {})} disabled={historyLoading}>
                {historyLoading ? 'Refreshing…' : 'Refresh'}
              </Button>
            </div>
            {historyLoading ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blood-500 animate-spin" />
              </div>
            ) : historyRows.length === 0 ? (
              <p className="text-sm text-bunker-400">No merge history yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-bunker-700 bg-bunker-900/80">
                      <th className="text-left py-2 px-3 text-bunker-400 font-medium">Time</th>
                      <th className="text-left py-2 px-3 text-bunker-400 font-medium">From</th>
                      <th className="text-left py-2 px-3 text-bunker-400 font-medium">To</th>
                      <th className="text-left py-2 px-3 text-bunker-400 font-medium">Moved</th>
                      <th className="text-left py-2 px-3 text-bunker-400 font-medium">Skipped dupes</th>
                      <th className="text-left py-2 px-3 text-bunker-400 font-medium">By</th>
                      <th className="text-left py-2 px-3 text-bunker-400 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.map((row) => (
                      <tr key={row.id} className="border-b border-bunker-800/80">
                        <td className="py-2 px-3 text-bunker-300 whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2 px-3 text-white whitespace-nowrap">
                          {(row.sourceUser.displayName || row.sourceUser.username)}
                        </td>
                        <td className="py-2 px-3 text-white whitespace-nowrap">
                          {(row.targetUser.displayName || row.targetUser.username)}
                        </td>
                        <td className="py-2 px-3 text-bunker-300 whitespace-nowrap">
                          {row.movedChallengeLogCount}C / {row.movedEasterEggLogCount}EE
                        </td>
                        <td className="py-2 px-3 text-bunker-300 whitespace-nowrap">
                          {row.skippedChallengeDuplicateCount}C / {row.skippedEasterEggDuplicateCount}EE
                        </td>
                        <td className="py-2 px-3 text-bunker-300 whitespace-nowrap">
                          {row.mergedByUser.displayName || row.mergedByUser.username}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!row.rollbackEligible || rollbackLoadingId === row.id}
                            leftIcon={
                              rollbackLoadingId === row.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RotateCcw className="w-4 h-4" />
                              )
                            }
                            onClick={() => runRollback(row.id)}
                          >
                            Rollback
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

