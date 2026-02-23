'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Logo,
  EasterEggIcon,
  PageLoader,
  Modal,
} from '@/components/ui';
import { formatCompletionTime } from '@/components/ui/time-input';
import { getAssetUrl } from '@/lib/assets';
import { RoundCounter, ProofEmbed, ChallengeTypeIcon, UserWithRank } from '@/components/game';
import { getBo4DifficultyLabel } from '@/lib/bo4';
import { getBo3GobbleGumLabel } from '@/lib/bo3';
import { getBocwSupportLabel } from '@/lib/bocw';
import { getBo6GobbleGumLabel, getBo6SupportLabel } from '@/lib/bo6';
import { getBo7SupportLabel } from '@/lib/bo7';
import { ChevronLeft, FileText, ExternalLink, Clock, Pencil, Trash2, Users, ShieldCheck, ShieldOff, Loader2, Check, Lock } from 'lucide-react';

function DeleteRunButton({
  logId,
  type,
  mapSlug,
  label,
  asSuperAdmin,
}: {
  logId: string;
  type: string;
  mapSlug: string;
  label: string;
  asSuperAdmin?: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const apiUrl = type === 'challenge' ? `/api/challenge-logs/${logId}` : `/api/easter-egg-logs/${logId}`;
      const res = await fetch(apiUrl, { method: 'DELETE', credentials: 'same-origin' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete run.');
        return;
      }
      setConfirmOpen(false);
      router.push(asSuperAdmin ? `/maps/${mapSlug}` : `/maps/${mapSlug}?tab=your-runs`);
    } catch {
      alert('Failed to delete run.');
    } finally {
      setDeleting(false);
    }
  };

  const description = asSuperAdmin
    ? `This will permanently delete the "${label}" run. The owner's achievements and XP will be updated accordingly. This cannot be undone.`
    : `This will permanently delete your "${label}" entry. Any achievements unlocked by this run will be re-locked and the XP will be removed from your account.`;

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="flex-1 min-w-0 border-blood-600/50 text-white hover:bg-blood-950/50 hover:text-white"
        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        onClick={() => setConfirmOpen(true)}
      >
        Delete
      </Button>
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this run?"
        description={description}
        size="md"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-blood-600 hover:bg-blood-700 text-white"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}

type MapInfo = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  game: { shortName: string; name: string };
};

type RunOwner = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarPreset: string | null;
  level: number;
};

type TeammateUserDetail = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarPreset: string | null;
  level: number;
};

type ChallengeLogDetail = {
  id: string;
  mapId: string;
  roundReached: number;
  playerCount: string;
  difficulty?: string | null;
  proofUrls?: string[];
  proofUrl?: string | null;
  notes: string | null;
  completedAt: string;
  completionTimeSeconds: number | null;
  challenge: { id: string; name: string; type: string };
  map: MapInfo;
  runOwner?: RunOwner;
  teammateUserDetails?: TeammateUserDetail[];
  teammateNonUserNames?: string[];
  isVerified?: boolean;
  verificationRequestedAt?: string | null;
  // Game-specific toggles
  useFortuneCards?: boolean | null;
  useDirectorsCut?: boolean | null;
  bo3GobbleGumMode?: string | null;
  bo4ElixirMode?: string | null;
  bocwSupportMode?: string | null;
  bo6GobbleGumMode?: string | null;
  bo6SupportMode?: string | null;
  bo7SupportMode?: string | null;
  bo7IsCursedRun?: boolean | null;
  bo7RelicsUsed?: string[];
  rampageInducerUsed?: boolean | null;
};

type EasterEggLogDetail = {
  id: string;
  mapId: string;
  roundCompleted: number | null;
  playerCount: string;
  difficulty?: string | null;
  proofUrls?: string[];
  proofUrl?: string | null;
  notes: string | null;
  isSolo: boolean;
  isNoGuide: boolean;
  completedAt: string;
  completionTimeSeconds: number | null;
  easterEgg: { id: string; name: string };
  map: MapInfo;
  runOwner?: RunOwner;
  teammateUserDetails?: TeammateUserDetail[];
  teammateNonUserNames?: string[];
  isVerified?: boolean;
  verificationRequestedAt?: string | null;
  rampageInducerUsed?: boolean | null;
};

export default function RunDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const type = params.type as string;
  const logId = params.logId as string;

  const [log, setLog] = useState<ChallengeLogDetail | EasterEggLogDetail | null>(null);
  const [isOwner, setIsOwner] = useState(true);
  const [runOwnerUsername, setRunOwnerUsername] = useState<string | null>(null);
  const [runOwnerDisplayName, setRunOwnerDisplayName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminMe, setAdminMe] = useState<{ isAdmin: boolean; isSuperAdmin: boolean } | null>(null);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [denyMessage, setDenyMessage] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminActionSuccess, setAdminActionSuccess] = useState<'denied' | 'removed' | 'added' | 'submitted' | null>(null);
  const [addVerificationModalOpen, setAddVerificationModalOpen] = useState(false);
  const [submitForVerificationModalOpen, setSubmitForVerificationModalOpen] = useState(false);

  const isChallenge = type === 'challenge';
  const apiUrl = isChallenge ? `/api/challenge-logs/${logId}` : `/api/easter-egg-logs/${logId}`;
  const logTypeForApi = isChallenge ? 'challenge' : 'easter_egg';
  const isVerified = Boolean(log && (log as ChallengeLogDetail & EasterEggLogDetail).isVerified);
  const isPendingVerification = Boolean(log && (log as ChallengeLogDetail & EasterEggLogDetail).verificationRequestedAt);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(apiUrl, { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) setError('Please log in to view this run.');
          else if (res.status === 404) setError('Run not found.');
          else setError('Something went wrong.');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) {
          setLog(null);
          return;
        }
        if (data.map?.slug !== slug) {
          setError('Run not found for this map.');
          setLog(null);
          return;
        }
        setIsOwner(data.isOwner === true);
        setRunOwnerUsername(data.runOwnerUsername ?? null);
        setRunOwnerDisplayName(data.runOwnerDisplayName ?? null);
        setLog(data);
      })
      .catch(() => setError('Failed to load run.'))
      .finally(() => setLoading(false));
  }, [apiUrl, slug]);

  useEffect(() => {
    if (!log?.id) return;
    fetch('/api/admin/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { isAdmin: false, isSuperAdmin: false }))
      .then(setAdminMe)
      .catch(() => setAdminMe(null));
  }, [log?.id]);

  useEffect(() => {
    if (!adminActionSuccess) return;
    const t = setTimeout(() => setAdminActionSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [adminActionSuccess]);

  const refetchLog = useCallback(() => {
    fetch(apiUrl, { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLog(data);
      });
  }, [apiUrl]);

  const handleApproveVerification = useCallback(async () => {
    setAdminActionLoading(true);
    try {
      const res = await fetch('/api/admin/verify/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logType: logTypeForApi, logId }),
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to approve');
      }
      refetchLog();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAdminActionLoading(false);
    }
  }, [logId, logTypeForApi, refetchLog]);

  const handleDenyVerification = useCallback(async () => {
    const msg = denyMessage.trim();
    if (!msg) {
      alert('Please enter a reason for not verifying this run.');
      return;
    }
    setAdminActionLoading(true);
    try {
      const res = await fetch('/api/admin/verify/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logType: logTypeForApi, logId, message: msg }),
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to deny');
      }
      setDenyModalOpen(false);
      setDenyMessage('');
      refetchLog();
      setAdminActionSuccess('denied');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAdminActionLoading(false);
    }
  }, [logId, logTypeForApi, denyMessage, refetchLog]);

  const handleAddVerification = useCallback(async () => {
    setAdminActionLoading(true);
    try {
      const res = await fetch('/api/admin/verify/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logType: logTypeForApi, logId }),
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to add verification');
      }
      setAddVerificationModalOpen(false);
      refetchLog();
      setAdminActionSuccess('added');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAdminActionLoading(false);
    }
  }, [logId, logTypeForApi, refetchLog]);

  const handleSubmitForVerification = useCallback(async () => {
    setAdminActionLoading(true);
    try {
      const res = await fetch('/api/admin/verify/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logType: logTypeForApi, logId }),
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to submit for verification');
      }
      setSubmitForVerificationModalOpen(false);
      refetchLog();
      setAdminActionSuccess('submitted');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAdminActionLoading(false);
    }
  }, [logId, logTypeForApi, refetchLog]);

  const handleRemoveVerification = useCallback(async () => {
    setAdminActionLoading(true);
    try {
      const res = await fetch('/api/admin/verify/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logType: logTypeForApi, logId }),
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to remove verification');
      }
      refetchLog();
      setAdminActionSuccess('removed');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAdminActionLoading(false);
    }
  }, [logId, logTypeForApi, refetchLog]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <PageLoader message="Loading run..." fullScreen />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Logo size="xl" animated={false} className="mx-auto mb-4 opacity-50" />
          <p className="text-bunker-400 mb-4">{error ?? 'Run not found.'}</p>
          <Link href="/maps" className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-4 py-2.5 text-sm font-medium text-white shadow-md backdrop-blur-sm transition-colors hover:border-bunker-400 hover:bg-bunker-700/95">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back to Maps
          </Link>
        </div>
      </div>
    );
  }

  const map = log.map;

  return (
    <div className="min-h-screen bg-bunker-950">
      {/* Hero: map art (same as map page) */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
        {map.imageUrl ? (
          <Image
            src={getAssetUrl(map.imageUrl)}
            alt={map.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bunker-800 to-bunker-950">
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bunker-950 via-bunker-950/70 to-transparent" />

        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-10 flex flex-wrap items-center justify-between gap-2">
          <Link
            href={isOwner ? '/maps' : runOwnerUsername ? `/users/${runOwnerUsername}/maps/${map.slug}/runs` : `/maps/${map.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-3.5 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:border-bunker-400 hover:bg-bunker-700/95 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 flex-shrink-0" aria-hidden />
            <span className="hidden sm:inline">{isOwner ? 'All Maps' : runOwnerUsername ? "Back to runs" : 'Back to map'}</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-blood-600/60 bg-blood-950/95 text-white text-xs font-semibold">
              {map.game.shortName}
            </span>
            {map.game.shortName === 'BO4' && (log as ChallengeLogDetail & EasterEggLogDetail).difficulty && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-bunker-500 bg-bunker-800/95 text-bunker-200 text-xs font-medium">
                {getBo4DifficultyLabel((log as ChallengeLogDetail & EasterEggLogDetail).difficulty)}
              </span>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pt-8 sm:pt-10 md:pt-12 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide [text-shadow:0_0_2px_rgba(0,0,0,0.95),0_0_6px_rgba(0,0,0,0.9)]">
              {map.name}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-white/95 flex items-center gap-2 flex-wrap">
              {isChallenge
                ? (log as ChallengeLogDetail).challenge.name
                : (log as EasterEggLogDetail).easterEgg.name}
              {isPendingVerification && !isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-600/90 text-white text-xs font-medium border border-amber-500/50">
                  <Clock className="w-3.5 h-3.5" />
                  Pending verification
                </span>
              )}
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-xs font-medium border border-blue-500/50">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified run
                </span>
              )}
            </p>
            {(runOwnerDisplayName || runOwnerUsername) && (
              <p className="mt-2 text-sm sm:text-base text-white/90 font-medium tracking-wide [text-shadow:0_0_2px_rgba(0,0,0,0.8)]">
                Logged by{' '}
                {runOwnerUsername ? (
                  <Link
                    href={`/users/${runOwnerUsername}`}
                    className="text-white hover:text-white/90 underline underline-offset-2"
                  >
                    {runOwnerDisplayName || `@${runOwnerUsername}`}
                  </Link>
                ) : (
                  <span>{runOwnerDisplayName}</span>
                )}
              </p>
            )}
            <Link
              href={isOwner ? `/maps/${map.slug}?tab=your-runs` : runOwnerUsername ? `/users/${runOwnerUsername}/maps/${map.slug}/runs` : `/maps/${map.slug}`}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-3.5 py-2 text-sm font-medium text-white shadow-md backdrop-blur-sm transition-colors hover:border-bunker-400 hover:bg-bunker-700/95"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back to map
            </Link>
          </div>
        </div>
      </div>

      {/* Run details + proof + notes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-10 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Run info card */}
          <Card variant="bordered" className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                {isChallenge ? (
                  <ChallengeTypeIcon type={(log as ChallengeLogDetail).challenge.type ?? 'HIGHEST_ROUND'} className="w-4 h-4 text-blood-400" size={16} />
                ) : (
                  <EasterEggIcon className="w-4 h-4 text-element-400" />
                )}
                Run details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isChallenge ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-bunker-400 text-sm">Round reached</span>
                    <RoundCounter round={(log as ChallengeLogDetail).roundReached} size="sm" animated={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-bunker-400 text-sm">Player count</span>
                    <span className="text-white font-medium">{(log as ChallengeLogDetail).playerCount}</span>
                  </div>
                  {map.game.shortName === 'BO4' && (log as ChallengeLogDetail).difficulty && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Difficulty</span>
                      <span className="text-white font-medium">{getBo4DifficultyLabel((log as ChallengeLogDetail).difficulty)}</span>
                    </div>
                  )}
                  {/* Game-specific metadata */}
                  {map.game.shortName === 'IW' && (log as ChallengeLogDetail).useFortuneCards != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Fortune Cards</span>
                      <span className="text-white font-medium">
                        {(log as ChallengeLogDetail).useFortuneCards ? 'Fate & Fortune' : 'Fate only'}
                      </span>
                    </div>
                  )}
                  {map.game.shortName === 'IW' && (log as ChallengeLogDetail).useDirectorsCut && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Directors Cut</span>
                      <span className="text-white font-medium">Yes</span>
                    </div>
                  )}
                  {map.game.shortName === 'BO3' && (log as ChallengeLogDetail).bo3GobbleGumMode && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">GobbleGums</span>
                      <span className="text-white font-medium">{getBo3GobbleGumLabel((log as ChallengeLogDetail).bo3GobbleGumMode!)}</span>
                    </div>
                  )}
                  {map.game.shortName === 'BO4' && (log as ChallengeLogDetail).bo4ElixirMode && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Elixirs</span>
                      <span className="text-white font-medium">
                        {(log as ChallengeLogDetail).bo4ElixirMode === 'CLASSIC_ONLY' ? 'Classic Only' : 'All Elixirs & Talismans'}
                      </span>
                    </div>
                  )}
                  {map.game.shortName === 'BOCW' && (log as ChallengeLogDetail).bocwSupportMode && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Support</span>
                      <span className="text-white font-medium">{getBocwSupportLabel((log as ChallengeLogDetail).bocwSupportMode!)}</span>
                    </div>
                  )}
                  {map.game.shortName === 'BO6' && (log as ChallengeLogDetail).bo6GobbleGumMode && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">GobbleGums</span>
                      <span className="text-white font-medium">{getBo6GobbleGumLabel((log as ChallengeLogDetail).bo6GobbleGumMode!)}</span>
                    </div>
                  )}
                  {map.game.shortName === 'BO6' && (log as ChallengeLogDetail).bo6SupportMode && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Support</span>
                      <span className="text-white font-medium">{getBo6SupportLabel((log as ChallengeLogDetail).bo6SupportMode!)}</span>
                    </div>
                  )}
                  {map.game.shortName === 'BO7' && (log as ChallengeLogDetail).bo7SupportMode && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Support</span>
                      <span className="text-white font-medium">{getBo7SupportLabel((log as ChallengeLogDetail).bo7SupportMode!)}</span>
                    </div>
                  )}
                  {map.game.shortName === 'BO7' && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Cursed Run</span>
                      <span className="text-white font-medium">
                        {(log as ChallengeLogDetail).bo7IsCursedRun ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  {['BOCW', 'BO6', 'BO7'].includes(map.game.shortName) && (log as ChallengeLogDetail).rampageInducerUsed != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Rampage Inducer</span>
                      <span className="text-white font-medium">
                        {(log as ChallengeLogDetail).rampageInducerUsed ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  {map.game.shortName === 'BO7' && (log as ChallengeLogDetail).bo7IsCursedRun && (((log as ChallengeLogDetail).bo7RelicsUsed ?? []).length > 0) && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-bunker-400 text-sm">Relics used</span>
                      <div className="flex flex-wrap gap-1">
                        {((log as ChallengeLogDetail).bo7RelicsUsed ?? []).map((r) => (
                          <span key={r} className="px-2 py-0.5 rounded-md border border-blood-700/60 bg-blood-950/50 text-white text-xs">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(() => {
                    const sec = (log as ChallengeLogDetail).completionTimeSeconds;
                    return (sec != null && sec > 0) ? (
                      <div className="flex items-center justify-between">
                        <span className="text-bunker-400 text-sm flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Time
                        </span>
                        <span className="text-white font-medium tabular-nums">
                          {formatCompletionTime(sec)}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </>
              ) : (
                <>
                  {(log as EasterEggLogDetail).roundCompleted != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Round completed</span>
                      <RoundCounter
                        round={(log as EasterEggLogDetail).roundCompleted!}
                        size="sm"
                        animated={false}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-bunker-400 text-sm">Player count</span>
                    <span className="text-white font-medium">{(log as EasterEggLogDetail).playerCount}</span>
                  </div>
                  {map.game.shortName === 'BO4' && (log as EasterEggLogDetail).difficulty && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Difficulty</span>
                      <span className="text-white font-medium">{getBo4DifficultyLabel((log as EasterEggLogDetail).difficulty)}</span>
                    </div>
                  )}
                  {(() => {
                    const sec = (log as EasterEggLogDetail).completionTimeSeconds;
                    return (sec != null && sec > 0) ? (
                      <div className="flex items-center justify-between">
                        <span className="text-bunker-400 text-sm flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Time
                        </span>
                        <span className="text-white font-medium tabular-nums">
                          {formatCompletionTime(sec)}
                        </span>
                      </div>
                    ) : null;
                  })()}
                  {((log as EasterEggLogDetail).isSolo || (log as EasterEggLogDetail).isNoGuide) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(log as EasterEggLogDetail).isSolo && (
                        <Badge variant="default" size="sm">Solo</Badge>
                      )}
                      {(log as EasterEggLogDetail).isNoGuide && (
                        <Badge variant="default" size="sm">No guide</Badge>
                      )}
                    </div>
                  )}
                  {['BOCW', 'BO6', 'BO7'].includes(map.game.shortName) && (log as EasterEggLogDetail).rampageInducerUsed != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-bunker-400 text-sm">Rampage Inducer</span>
                      <span className="text-white font-medium">
                        {(log as EasterEggLogDetail).rampageInducerUsed ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-bunker-700">
                <span className="text-bunker-400 text-sm">Logged</span>
                <span className="text-bunker-300 text-sm">
                  {new Date(log.completedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {(() => {
                const runOwner = (log as ChallengeLogDetail & EasterEggLogDetail).runOwner;
                const teammateUserDetails = (log as ChallengeLogDetail & EasterEggLogDetail).teammateUserDetails ?? [];
                const teammateNonUserNames = (log as ChallengeLogDetail & EasterEggLogDetail).teammateNonUserNames ?? [];
                const hasMembers = runOwner || teammateUserDetails.length > 0 || teammateNonUserNames.length > 0;
                if (!hasMembers) return null;
                return (
                  <div className="pt-3 border-t border-bunker-700 mt-3">
                    <p className="text-bunker-400 text-sm mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Members
                    </p>
                    <div className="flex flex-col gap-2">
                      {runOwner && (
                        <div className="flex items-center gap-2">
                          <UserWithRank
                            user={{ ...runOwner, displayName: runOwner.displayName ?? runOwner.username }}
                            size="sm"
                            linkToProfile={true}
                          />
                          <span className="text-xs text-bunker-500">(creator)</span>
                        </div>
                      )}
                      {teammateUserDetails.map((u) => (
                        <UserWithRank
                          key={u.id}
                          user={{ ...u, displayName: u.displayName ?? u.username }}
                          size="sm"
                          linkToProfile={true}
                        />
                      ))}
                      {teammateNonUserNames.map((name, i) => (
                        <span key={i} className="text-sm text-bunker-300 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-bunker-700 flex items-center justify-center text-bunker-400 text-xs">?</span>
                          {name}
                          <span className="text-xs text-bunker-500">(not on site)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {(isOwner || adminMe?.isSuperAdmin || (adminMe?.isAdmin && isPendingVerification)) && (
                <div className="flex flex-col gap-2 pt-3 border-t border-bunker-700 mt-3">
                  {/* Verified lock notice for owners */}
                  {isOwner && isVerified && !adminMe?.isSuperAdmin && (
                    <p className="flex items-center gap-1.5 text-xs text-amber-400/80">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      Verified runs cannot be edited.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {/* Edit: owner when not verified; super admin always; admin when pending verification (edit but not delete) */}
                    {((isOwner && !isVerified) || adminMe?.isSuperAdmin || (adminMe?.isAdmin && isPendingVerification && !isVerified)) && (
                      <Link href={`/maps/${map.slug}/run/${type}/${logId}/edit`} className="flex-1 min-w-0">
                        <Button variant="secondary" size="sm" className="w-full" leftIcon={<Pencil className="w-3.5 h-3.5" />}>
                          Edit
                        </Button>
                      </Link>
                    )}
                    {isOwner && (
                      <DeleteRunButton
                        logId={logId}
                        type={type}
                        mapSlug={map.slug}
                        label={isChallenge ? (log as ChallengeLogDetail).challenge.name : (log as EasterEggLogDetail).easterEgg.name}
                      />
                    )}
                    {!isOwner && adminMe?.isSuperAdmin && (
                      <>
                        <p className="text-bunker-400 text-xs w-full">Super admin: delete this run</p>
                        <DeleteRunButton
                          logId={logId}
                          type={type}
                          mapSlug={map.slug}
                          label={isChallenge ? (log as ChallengeLogDetail).challenge.name : (log as EasterEggLogDetail).easterEgg.name}
                          asSuperAdmin
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
              {adminActionSuccess && (
                <p className="text-military-400 text-sm pt-3 border-t border-bunker-700 mt-3" role="status">
                  {adminActionSuccess === 'denied' && 'Verification denied. The run owner was notified.'}
                  {adminActionSuccess === 'removed' && 'Verification removed. The run owner was notified.'}
                  {adminActionSuccess === 'added' && 'Verification added. The run owner was notified.'}
                  {adminActionSuccess === 'submitted' && 'Run submitted for verification. It will appear in the pending queue.'}
                </p>
              )}
              {adminMe?.isAdmin && !isVerified && !isPendingVerification && (
                <div className="flex flex-col gap-2 pt-3 border-t border-bunker-700 mt-3">
                  <p className="text-bunker-400 text-xs">Admin: submit this run for verification</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setSubmitForVerificationModalOpen(true)}
                    disabled={adminActionLoading}
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                  >
                    Submit for verification
                  </Button>
                </div>
              )}
              {!isOwner && adminMe?.isAdmin && isPendingVerification && (
                <div className="flex flex-col gap-2 pt-3 border-t border-bunker-700 mt-3">
                  <p className="text-bunker-400 text-xs">Admin: approve or deny verification</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={handleApproveVerification}
                      disabled={adminActionLoading}
                      leftIcon={adminActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    >
                      Approve Verification
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setDenyModalOpen(true)}
                      disabled={adminActionLoading}
                      leftIcon={<ShieldOff className="w-3.5 h-3.5" />}
                    >
                      Deny Verification
                    </Button>
                  </div>
                </div>
              )}
              {!isOwner && adminMe?.isSuperAdmin && !isVerified && (
                <div className="flex flex-col gap-2 pt-3 border-t border-bunker-700 mt-3">
                  <p className="text-bunker-400 text-xs">Super admin: add verification to this run</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => setAddVerificationModalOpen(true)}
                    disabled={adminActionLoading}
                    leftIcon={adminActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    className="border-military-600/50 text-white"
                  >
                    Add verification
                  </Button>
                </div>
              )}
              {adminMe?.isSuperAdmin && isVerified && (
                <div className="flex flex-col gap-2 pt-3 border-t border-bunker-700 mt-3">
                  <p className="text-bunker-400 text-xs">Super admin: remove verification</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleRemoveVerification}
                    disabled={adminActionLoading}
                    leftIcon={adminActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                    className="border-blood-800 text-white hover:bg-blood-950/50"
                  >
                    Remove verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proof + Notes (span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            {(() => {
              const proofUrls = Array.isArray((log as { proofUrls?: string[] }).proofUrls)
                ? (log as { proofUrls: string[] }).proofUrls
                : (log as { proofUrl?: string | null }).proofUrl
                  ? [(log as { proofUrl: string }).proofUrl]
                  : [];
              const hasProof = proofUrls.length > 0;
              const hasNotes = !!log.notes;
              return (
                <>
                  {hasProof && (
                    <Card variant="bordered">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-blood-400" />
                          Proof {proofUrls.length > 1 ? `(${proofUrls.length})` : ''}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {proofUrls.map((url, i) => (
                            <ProofEmbed key={i} url={url} className="rounded-lg overflow-hidden w-full min-w-0" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {hasNotes && (
                    <Card variant="bordered">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4 text-bunker-400" />
                          Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-bunker-300 whitespace-pre-wrap">{log.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {!hasProof && !hasNotes && (
                    <Card variant="bordered">
                      <CardContent className="py-8 text-center text-bunker-500 text-sm">
                        No proof or notes for this run.
                      </CardContent>
                    </Card>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Deny verification modal */}
      <Modal
        isOpen={denyModalOpen}
        onClose={() => !adminActionLoading && setDenyModalOpen(false)}
        title="Deny verification"
        description="Provide a reason for not verifying this run. The player will see this message in their notifications."
        size="md"
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-bunker-300">
            Reason (required)
          </label>
          <textarea
            value={denyMessage}
            onChange={(e) => setDenyMessage(e.target.value)}
            placeholder="e.g. Proof link is private or doesn't show the run clearly."
            className="w-full px-3 py-2 rounded-lg border border-bunker-600 bg-bunker-800 text-white placeholder-bunker-500 text-sm min-h-[100px]"
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setDenyModalOpen(false)} disabled={adminActionLoading}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleDenyVerification}
              disabled={adminActionLoading || !denyMessage.trim()}
              leftIcon={adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
            >
              {adminActionLoading ? 'Submitting…' : 'Deny verification'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add verification modal (super admin) */}
      <Modal
        isOpen={addVerificationModalOpen}
        onClose={() => !adminActionLoading && setAddVerificationModalOpen(false)}
        title="Add verification"
        description="Add a verified checkmark to this run? The run owner will be notified."
        size="md"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => setAddVerificationModalOpen(false)} disabled={adminActionLoading}>
            No
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleAddVerification}
            disabled={adminActionLoading}
            leftIcon={adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          >
            {adminActionLoading ? 'Adding…' : 'Yes, add verification'}
          </Button>
        </div>
      </Modal>

      {/* Submit for verification modal (admin) */}
      <Modal
        isOpen={submitForVerificationModalOpen}
        onClose={() => !adminActionLoading && setSubmitForVerificationModalOpen(false)}
        title="Submit for verification"
        description="Submit this run for verification? It will be added to the pending verification queue for admin review."
        size="md"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => setSubmitForVerificationModalOpen(false)} disabled={adminActionLoading}>
            No
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmitForVerification}
            disabled={adminActionLoading}
            leftIcon={adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          >
            {adminActionLoading ? 'Submitting…' : 'Yes, submit for verification'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
