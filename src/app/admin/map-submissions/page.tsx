'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, Button, Select, Input, TimeInput } from '@/components/ui';
import { CheckCircle2, XCircle, ExternalLink, Loader2, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { BO3_CUSTOM_CHALLENGE_TYPES, BO3_CUSTOM_DEFAULT_ROUNDS } from '@/lib/bo3-custom';

type Submission = {
  id: string;
  status: string;
  mapName: string;
  steamWorkshopUrl: string;
  thumbnailImageUrl: string | null;
  mapPageImageUrl: string | null;
  suggestedAchievements: Record<string, number> | null;
  suggestedEasterEgg: { name?: string; steps?: string[]; xpReward?: number } | null;
  rejectionReason: string | null;
  createdAt: string;
  submittedBy: { id: string; username: string; displayName: string | null };
  game: { shortName: string; name: string };
};

const CHALLENGE_LABELS: Record<string, string> = {
  HIGHEST_ROUND: 'Highest Round',
  NO_DOWNS: 'No Downs',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  STARTING_ROOM: 'Starting Room',
  ONE_BOX: 'One Box',
  PISTOL_ONLY: 'Pistol Only',
  NO_POWER: 'No Power',
  NO_ATS: 'No AATs',
  ROUND_5_SPEEDRUN: 'R5 Speedrun',
  ROUND_15_SPEEDRUN: 'R15 Speedrun',
  ROUND_30_SPEEDRUN: 'R30 Speedrun',
  ROUND_50_SPEEDRUN: 'R50 Speedrun',
  ROUND_70_SPEEDRUN: 'R70 Speedrun',
  ROUND_100_SPEEDRUN: 'R100 Speedrun',
  ROUND_255_SPEEDRUN: 'R255 Speedrun',
  EASTER_EGG_SPEEDRUN: 'EE Speedrun',
};

const isSpeedrun = (t: string) => t.includes('SPEEDRUN');

function initEditAchievements(sub: Submission): Record<string, number> {
  const suggested = sub.suggestedAchievements ?? {};
  const r: Record<string, number> = {};
  for (const t of BO3_CUSTOM_CHALLENGE_TYPES) {
    r[t] = suggested[t] ?? BO3_CUSTOM_DEFAULT_ROUNDS[t] ?? (isSpeedrun(t) ? 1800 : 30);
  }
  return r;
}

function PendingSubmissionCard({
  sub,
  onApprove,
  onReject,
  approving,
  rejecting,
  rejectReason,
  setRejectReason,
}: {
  sub: Submission;
  onApprove: (id: string, overrides?: { suggestedAchievements?: Record<string, number>; suggestedEasterEgg?: { name: string; xpReward: number; steps?: string[] } | null }) => void;
  onReject: (id: string) => void;
  approving: string | null;
  rejecting: string | null;
  rejectReason: Record<string, string>;
  setRejectReason: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [editAchievements, setEditAchievements] = useState<Record<string, number>>(() => initEditAchievements(sub));
  const [editEeName, setEditEeName] = useState(sub.suggestedEasterEgg?.name ?? '');
  const [editEeXp, setEditEeXp] = useState(sub.suggestedEasterEgg?.xpReward ?? 250);
  const [editEeSteps, setEditEeSteps] = useState(
    Array.isArray(sub.suggestedEasterEgg?.steps) ? sub.suggestedEasterEgg!.steps!.join('\n') : ''
  );

  const handleApproveClick = () => {
    const suggestedAchievements: Record<string, number> = {};
    for (const t of BO3_CUSTOM_CHALLENGE_TYPES) {
      const v = editAchievements[t];
      if (v != null && !Number.isNaN(v) && v > 0) suggestedAchievements[t] = Math.floor(v);
    }
    const suggestedEasterEgg = editEeName.trim()
      ? { name: editEeName.trim(), xpReward: Math.max(0, Math.floor(editEeXp) || 250), steps: editEeSteps.trim() ? editEeSteps.trim().split('\n').filter(Boolean) : undefined }
      : null;
    onApprove(sub.id, { suggestedAchievements, suggestedEasterEgg });
  };

  return (
    <Card variant="glow">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base">{sub.mapName}</CardTitle>
            <p className="text-xs text-bunker-500 mt-1">
              By{' '}
              <Link href={`/users/${sub.submittedBy.username}`} className="text-blood-400 hover:underline">
                {sub.submittedBy.displayName || sub.submittedBy.username}
              </Link>
              {' · '}
              {new Date(sub.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-amber-900/60 text-amber-300">PENDING</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(() => {
          const thumbnailUrl = sub.thumbnailImageUrl || sub.mapPageImageUrl;
          const bannerUrl = sub.mapPageImageUrl || sub.thumbnailImageUrl;
          if (!thumbnailUrl && !bannerUrl) {
            return <p className="text-sm text-amber-500">No images submitted (submissions now require at least one)</p>;
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-bunker-500">Thumbnail</p>
                <a href={thumbnailUrl!} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-video rounded-lg overflow-hidden bg-bunker-800 border border-bunker-600 hover:border-blood-600/50 transition-colors">
                  <Image src={thumbnailUrl!} alt="Thumbnail" fill className="object-cover" />
                </a>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-bunker-500">Banner{sub.mapPageImageUrl ? '' : ' (thumbnail used)'}</p>
                <a href={bannerUrl!} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-video rounded-lg overflow-hidden bg-bunker-800 border border-bunker-600 hover:border-blood-600/50 transition-colors">
                  <Image src={bannerUrl!} alt="Banner" fill className="object-cover" />
                </a>
              </div>
            </div>
          );
        })()}
        <a href={sub.steamWorkshopUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blood-400 hover:text-blood-300">
          <ExternalLink className="w-4 h-4" />
          Steam Workshop
        </a>

        <div>
          <button
            type="button"
            onClick={() => setShowEdit(!showEdit)}
            className="flex items-center gap-2 text-sm font-medium text-bunker-300 hover:text-blood-400"
          >
            {showEdit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Edit suggested achievements & Easter Egg before approving
          </button>
          {showEdit && (
            <div className="mt-4 space-y-6 rounded-lg border border-bunker-700 p-4 bg-bunker-900/50">
              <div>
                <p className="text-sm font-medium text-bunker-300 mb-3">Round challenges</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {BO3_CUSTOM_CHALLENGE_TYPES.filter((t) => !isSpeedrun(t)).map((t) => (
                    <div key={t}>
                      <label className="block text-xs text-bunker-400 mb-1 truncate" title={CHALLENGE_LABELS[t] ?? t}>{CHALLENGE_LABELS[t] ?? t}</label>
                      <input
                        type="number"
                        min={1}
                        max={255}
                        placeholder="round"
                        value={(editAchievements[t] ?? 0) > 0 ? String(editAchievements[t]) : ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setEditAchievements((prev) => ({ ...prev, [t]: raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0) }));
                        }}
                        className="w-full px-2 py-1.5 text-sm bg-bunker-800 border border-bunker-600 rounded text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-bunker-300 mb-3">Timed challenges (h:m:s)</p>
                <div className="grid grid-cols-1 gap-4">
                  {BO3_CUSTOM_CHALLENGE_TYPES.filter(isSpeedrun).map((t) => (
                    <div key={t} className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
                      <label className="shrink-0 text-xs sm:text-sm text-bunker-400 sm:min-w-[7rem]" title={CHALLENGE_LABELS[t] ?? t}>{CHALLENGE_LABELS[t] ?? t}</label>
                      <div className="flex-1 min-w-0">
                        <TimeInput
                          valueSeconds={editAchievements[t] ?? 0}
                          onChange={(sec) => setEditAchievements((prev) => ({ ...prev, [t]: sec ?? 0 }))}
                          className="[&_p]:hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-bunker-700 pt-4">
                <p className="text-sm font-medium text-bunker-200 mb-2">Optional Easter Egg</p>
                <Input label="EE Name" placeholder="Main Quest" value={editEeName} onChange={(e) => setEditEeName(e.target.value)} />
                <div className="mt-2">
                  <label className="block text-xs text-bunker-400 mb-1">XP Reward</label>
                  <input
                    type="number"
                    min={0}
                    value={editEeXp}
                    onChange={(e) => setEditEeXp(parseInt(e.target.value, 10) || 0)}
                    className="w-24 px-2 py-1.5 text-sm bg-bunker-800 border border-bunker-600 rounded text-white"
                  />
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-bunker-400 mb-1">Steps (one per line)</label>
                  <textarea
                    rows={4}
                    placeholder="Step 1: Turn on power\nStep 2: ..."
                    value={editEeSteps}
                    onChange={(e) => setEditEeSteps(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-bunker-800 border border-bunker-600 rounded text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-bunker-700/50">
          <Input
            placeholder="Rejection reason (optional)"
            value={rejectReason[sub.id] ?? ''}
            onChange={(e) => setRejectReason((prev) => ({ ...prev, [sub.id]: e.target.value }))}
            className="flex-1 min-w-0"
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApproveClick}
              disabled={!!approving}
              className="bg-green-600 hover:bg-green-500"
            >
              {approving === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span className="ml-1.5">Approve</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReject(sub.id)}
              disabled={!!rejecting}
              className="border-bunker-600 text-bunker-300 hover:bg-bunker-800"
            >
              {rejecting === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              <span className="ml-1.5">Reject</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubmissionCardReadOnly({ sub }: { sub: Submission }) {
  const thumbnailUrl = sub.thumbnailImageUrl || sub.mapPageImageUrl;
  const bannerUrl = sub.mapPageImageUrl || sub.thumbnailImageUrl;
  return (
    <Card variant="glow">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base">{sub.mapName}</CardTitle>
            <p className="text-xs text-bunker-500 mt-1">
              By <Link href={`/users/${sub.submittedBy.username}`} className="text-blood-400 hover:underline">{sub.submittedBy.displayName || sub.submittedBy.username}</Link>
              {' · '}
              {new Date(sub.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${
              sub.status === 'PENDING' ? 'bg-amber-900/60 text-amber-300' : sub.status === 'APPROVED' ? 'bg-green-900/60 text-green-300' : 'bg-bunker-700 text-bunker-400'
            }`}
          >
            {sub.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!thumbnailUrl && !bannerUrl ? (
          <p className="text-sm text-amber-500">No images submitted</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-bunker-500">Thumbnail</p>
              <a href={thumbnailUrl!} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-video rounded-lg overflow-hidden bg-bunker-800 border border-bunker-600 hover:border-blood-600/50 transition-colors">
                <Image src={thumbnailUrl!} alt="Thumbnail" fill className="object-cover" />
              </a>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-bunker-500">Banner{sub.mapPageImageUrl ? '' : ' (thumbnail used)'}</p>
              <a href={bannerUrl!} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-video rounded-lg overflow-hidden bg-bunker-800 border border-bunker-600 hover:border-blood-600/50 transition-colors">
                <Image src={bannerUrl!} alt="Banner" fill className="object-cover" />
              </a>
            </div>
          </div>
        )}
        <a href={sub.steamWorkshopUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blood-400 hover:text-blood-300">
          <ExternalLink className="w-4 h-4" />
          Steam Workshop
        </a>
        {sub.suggestedAchievements && Object.keys(sub.suggestedAchievements).length > 0 && (
          <div>
            <p className="text-xs font-medium text-bunker-500 mb-2">Suggested rounds</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(sub.suggestedAchievements).map(([type, round]) => (
                <span key={type} className="px-2 py-1 rounded bg-bunker-800 text-xs text-bunker-300">
                  {CHALLENGE_LABELS[type] ?? type}: {round}
                </span>
              ))}
            </div>
          </div>
        )}
        {sub.suggestedEasterEgg?.name && (
          <div>
            <p className="text-xs font-medium text-bunker-500 mb-1">Easter Egg: {sub.suggestedEasterEgg.name}</p>
            {sub.suggestedEasterEgg.xpReward != null && <p className="text-xs text-bunker-400">XP: {sub.suggestedEasterEgg.xpReward}</p>}
          </div>
        )}
        {sub.status === 'REJECTED' && sub.rejectionReason && <p className="text-sm text-bunker-400">Rejection reason: {sub.rejectionReason}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminMapSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const fetchSubmissions = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/map-submissions?status=${statusFilter}`, { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => {
        if (res.status === 403) {
          setForbidden(true);
          return { submissions: [] };
        }
        return res.ok ? res.json() : { submissions: [] };
      })
      .then((data) => setSubmissions(data.submissions ?? []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = async (
    id: string,
    overrides?: { suggestedAchievements?: Record<string, number>; suggestedEasterEgg?: { name: string; xpReward: number; steps?: string[] } | null }
  ) => {
    setApproving(id);
    try {
      const res = await fetch(`/api/admin/map-submissions/${id}/approve`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrides ?? {}),
      });
      if (res.ok) {
        fetchSubmissions();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to approve');
      }
    } catch {
      alert('Request failed');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejecting(id);
    try {
      const res = await fetch(`/api/admin/map-submissions/${id}/reject`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: rejectReason[id] || undefined }),
      });
      if (res.ok) {
        setRejectReason((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        fetchSubmissions();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to reject');
      }
    } catch {
      alert('Request failed');
    } finally {
      setRejecting(null);
    }
  };

  if (forbidden) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card variant="glow">
          <CardContent className="py-12 text-center">
            <p className="text-bunker-400">You do not have permission to view map submissions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blood-400" />
            Map submissions
          </h1>
          <p className="text-sm text-bunker-400 mt-1">Review and approve BO3 Custom Zombies map submissions</p>
        </div>
        <Select
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-bunker-500" />
        </div>
      ) : submissions.length === 0 ? (
        <Card variant="glow">
          <CardContent className="py-12 text-center">
            <MapPin className="w-12 h-12 text-bunker-600 mx-auto mb-4" />
            <p className="text-bunker-400">
              No {statusFilter.toLowerCase()} submissions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) =>
            sub.status === 'PENDING' ? (
              <PendingSubmissionCard
                key={sub.id}
                sub={sub}
                onApprove={handleApprove}
                onReject={handleReject}
                approving={approving}
                rejecting={rejecting}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
              />
            ) : (
              <SubmissionCardReadOnly key={sub.id} sub={sub} />
            )
          )}
        </div>
      )}
    </div>
  );
}
