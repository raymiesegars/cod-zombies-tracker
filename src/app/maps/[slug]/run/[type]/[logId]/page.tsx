'use client';

import { useState, useEffect } from 'react';
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
import { RoundCounter, ProofEmbed, ChallengeTypeIcon } from '@/components/game';
import { ChevronLeft, FileText, ExternalLink, Clock, Pencil, Trash2 } from 'lucide-react';

function DeleteRunButton({
  logId,
  type,
  mapSlug,
  label,
}: {
  logId: string;
  type: string;
  mapSlug: string;
  label: string;
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
      router.push(`/maps/${mapSlug}?tab=your-runs`);
    } catch {
      alert('Failed to delete run.');
    } finally {
      setDeleting(false);
    }
  };

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
        description={`This will permanently delete your "${label}" entry. Any achievements unlocked by this run will be re-locked and the XP will be removed from your account.`}
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

type ChallengeLogDetail = {
  id: string;
  mapId: string;
  roundReached: number;
  playerCount: string;
  proofUrl: string | null;
  notes: string | null;
  completedAt: string;
  completionTimeSeconds: number | null;
  challenge: { id: string; name: string; type: string };
  map: MapInfo;
};

type EasterEggLogDetail = {
  id: string;
  mapId: string;
  roundCompleted: number | null;
  playerCount: string;
  proofUrl: string | null;
  notes: string | null;
  isSolo: boolean;
  isNoGuide: boolean;
  completedAt: string;
  completionTimeSeconds: number | null;
  easterEgg: { id: string; name: string };
  map: MapInfo;
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

  const isChallenge = type === 'challenge';
  const apiUrl = isChallenge ? `/api/challenge-logs/${logId}` : `/api/easter-egg-logs/${logId}`;

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
          <Link
            href="/maps"
            className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-4 py-2.5 text-sm font-medium text-white shadow-md backdrop-blur-sm transition-colors hover:border-bunker-400 hover:bg-bunker-700/95"
          >
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

        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
          <Link
            href={isOwner ? '/maps' : runOwnerUsername ? `/users/${runOwnerUsername}/maps/${map.slug}/runs` : `/maps/${map.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-3.5 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:border-bunker-400 hover:bg-bunker-700/95 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 flex-shrink-0" aria-hidden />
            <span className="hidden sm:inline">{isOwner ? 'All Maps' : runOwnerUsername ? "Back to runs" : 'Back to map'}</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-blood-600/60 bg-blood-950/95 text-white text-xs font-semibold">
                {map.game.shortName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide [text-shadow:0_0_2px_rgba(0,0,0,0.95),0_0_6px_rgba(0,0,0,0.9)]">
              {map.name}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-white/95">
              {isChallenge
                ? (log as ChallengeLogDetail).challenge.name
                : (log as EasterEggLogDetail).easterEgg.name}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Run info card */}
          <Card variant="bordered" className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
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
                  {(() => {
                    const sec = (log as ChallengeLogDetail).completionTimeSeconds;
                    return sec != null && sec > 0 ? (
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
                  {(() => {
                    const sec = (log as EasterEggLogDetail).completionTimeSeconds;
                    return sec != null && sec > 0 ? (
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
              {isOwner && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-bunker-700 mt-3">
                  <Link href={`/maps/${map.slug}/run/${type}/${logId}/edit`} className="flex-1 min-w-0">
                    <Button variant="secondary" size="sm" className="w-full" leftIcon={<Pencil className="w-3.5 h-3.5" />}>
                      Edit
                    </Button>
                  </Link>
                  <DeleteRunButton
                    logId={logId}
                    type={type}
                    mapSlug={map.slug}
                    label={isChallenge ? (log as ChallengeLogDetail).challenge.name : (log as EasterEggLogDetail).easterEgg.name}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proof + Notes (span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            {log.proofUrl && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blood-400" />
                    Proof
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProofEmbed url={log.proofUrl} className="rounded-lg overflow-hidden" />
                </CardContent>
              </Card>
            )}

            {log.notes && (
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

            {!log.proofUrl && !log.notes && (
              <Card variant="bordered">
                <CardContent className="py-8 text-center text-bunker-500 text-sm">
                  No proof or notes for this run.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
