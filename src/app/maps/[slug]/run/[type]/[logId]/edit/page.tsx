'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Logo,
  PageLoader,
  TimeInput,
  Modal,
} from '@/components/ui';
import { ProofEmbed, ProofUrlsInput, TeammatePicker, type TeammateUser } from '@/components/game';
import { normalizeProofUrls } from '@/lib/utils';
import { BO4_DIFFICULTIES, getBo4DifficultyLabel } from '@/lib/bo4';
import { ChevronLeft, Save } from 'lucide-react';
import type { PlayerCount } from '@/types';

const playerCountOptions = [
  { value: 'SOLO', label: 'Solo' },
  { value: 'DUO', label: 'Duo' },
  { value: 'TRIO', label: 'Trio' },
  { value: 'SQUAD', label: 'Squad' },
];

type MapInfo = { id: string; name: string; slug: string; imageUrl: string | null; game: { shortName: string; name: string } };
type ChallengeLog = {
  id: string;
  roundReached: number;
  playerCount: string;
  difficulty?: string | null;
  proofUrls?: string[];
  proofUrl?: string | null;
  notes: string | null;
  completionTimeSeconds: number | null;
  challenge: { id: string; name: string };
  map: MapInfo;
};
type EasterEggLog = {
  id: string;
  roundCompleted: number | null;
  playerCount: string;
  difficulty?: string | null;
  isSolo: boolean;
  isNoGuide: boolean;
  proofUrls?: string[];
  proofUrl?: string | null;
  notes: string | null;
  completionTimeSeconds: number | null;
  easterEgg: { id: string; name: string };
  map: MapInfo;
};

export default function EditRunPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const slug = params.slug as string;
  const type = params.type as string;
  const logId = params.logId as string;

  const [log, setLog] = useState<ChallengeLog | EasterEggLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Populated when the log loads
  const [roundReached, setRoundReached] = useState('');
  const [roundCompleted, setRoundCompleted] = useState('');
  const [playerCount, setPlayerCount] = useState<PlayerCount>('SOLO');
  const [proofUrls, setProofUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [completionTimeSeconds, setCompletionTimeSeconds] = useState<number | null>(null);
  const [isSolo, setIsSolo] = useState(false);
  const [isNoGuide, setIsNoGuide] = useState(false);
  const [teammateUserIds, setTeammateUserIds] = useState<string[]>([]);
  const [teammateNonUserNames, setTeammateNonUserNames] = useState<string[]>([]);
  const [teammateUserDetails, setTeammateUserDetails] = useState<TeammateUser[]>([]);
  const [difficulty, setDifficulty] = useState<string>('NORMAL');
  const [requestVerification, setRequestVerification] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);

  const isChallenge = type === 'challenge';
  const apiUrl = isChallenge ? `/api/challenge-logs/${logId}` : `/api/easter-egg-logs/${logId}`;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(apiUrl, { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) setError('Please log in.');
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
        setLog(data);
        if (data.roundReached != null) {
          setRoundReached(String(data.roundReached));
          setPlayerCount(data.playerCount || 'SOLO');
          setDifficulty(data.difficulty && BO4_DIFFICULTIES.includes(data.difficulty) ? data.difficulty : 'NORMAL');
          setProofUrls(Array.isArray(data.proofUrls) ? data.proofUrls : data.proofUrl ? [data.proofUrl] : []);
          setNotes(data.notes || '');
          setCompletionTimeSeconds(data.completionTimeSeconds ?? null);
          setTeammateUserIds(Array.isArray(data.teammateUserIds) ? data.teammateUserIds : []);
          setTeammateNonUserNames(Array.isArray(data.teammateNonUserNames) ? data.teammateNonUserNames : []);
          setTeammateUserDetails(Array.isArray(data.teammateUserDetails) ? data.teammateUserDetails : []);
          setRequestVerification(Boolean(data.verificationRequestedAt));
        } else {
          setRoundCompleted(data.roundCompleted != null ? String(data.roundCompleted) : '');
          setPlayerCount(data.playerCount || 'SOLO');
          setDifficulty(data.difficulty && BO4_DIFFICULTIES.includes(data.difficulty) ? data.difficulty : 'NORMAL');
          setProofUrls(Array.isArray(data.proofUrls) ? data.proofUrls : data.proofUrl ? [data.proofUrl] : []);
          setNotes(data.notes || '');
          setCompletionTimeSeconds(data.completionTimeSeconds ?? null);
          setIsSolo(!!data.isSolo);
          setIsNoGuide(!!data.isNoGuide);
          setTeammateUserIds(Array.isArray(data.teammateUserIds) ? data.teammateUserIds : []);
          setTeammateNonUserNames(Array.isArray(data.teammateNonUserNames) ? data.teammateNonUserNames : []);
          setTeammateUserDetails(Array.isArray(data.teammateUserDetails) ? data.teammateUserDetails : []);
          setRequestVerification(Boolean(data.verificationRequestedAt));
        }
      })
      .catch(() => setError('Failed to load run.'))
      .finally(() => setLoading(false));
  }, [apiUrl, slug]);

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    const round = parseInt(roundReached, 10);
    if (Number.isNaN(round) || round < 1) {
      setError('Enter a valid round.');
      return;
    }
    if (requestVerification) {
      const hasProof = proofUrls.filter(Boolean).length > 0;
      if (!hasProof) {
        setErrorModalMessage('To request verification, add at least one proof (URL or screenshot) or uncheck "Request verification".');
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/challenge-logs/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundReached: round,
          playerCount,
          ...(log?.map?.game?.shortName === 'BO4' && { difficulty }),
          proofUrls: normalizeProofUrls(proofUrls),
          notes: notes || null,
          completionTimeSeconds,
          teammateUserIds,
          teammateNonUserNames,
          requestVerification,
        }),
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to update');
      router.push(`/maps/${slug}/run/challenge/${logId}`);
    } catch (err) {
      setErrorModalMessage(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEasterEgg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestVerification) {
      const hasProof = proofUrls.filter(Boolean).length > 0;
      if (!hasProof) {
        setErrorModalMessage('To request verification, add at least one proof (URL or screenshot) or uncheck "Request verification".');
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/easter-egg-logs/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundCompleted: roundCompleted ? parseInt(roundCompleted, 10) : null,
          playerCount,
          ...(log?.map?.game?.shortName === 'BO4' && { difficulty }),
          isSolo,
          isNoGuide,
          proofUrls: normalizeProofUrls(proofUrls),
          notes: notes || null,
          completionTimeSeconds,
          teammateUserIds,
          teammateNonUserNames,
          requestVerification,
        }),
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to update');
      router.push(`/maps/${slug}/run/easter-egg/${logId}`);
    } catch (err) {
      setErrorModalMessage(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          href={`/maps/${slug}/run/${type}/${logId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-3.5 py-2 text-sm font-medium text-white shadow-md transition-colors hover:border-bunker-400 hover:bg-bunker-700/95 mb-6 w-fit"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to run
        </Link>
        <h1 className="text-xl sm:text-2xl font-zombies text-white tracking-wide mb-2">
          Edit run
        </h1>
        <p className="text-bunker-400 text-sm mb-6">
          {isChallenge ? (log as ChallengeLog).challenge.name : (log as EasterEggLog).easterEgg.name} · {map.name}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-blood-950/50 border border-blood-800 text-blood-300 text-sm">
            {error}
          </div>
        )}

        {isChallenge ? (
          <Card variant="bordered">
            <CardContent className="py-4 sm:py-6">
              <form onSubmit={handleUpdateChallenge} className="space-y-4">
                <Input
                  label="Round Reached"
                  type="number"
                  min={1}
                  value={roundReached}
                  onChange={(e) => setRoundReached(e.target.value)}
                />
                <Select
                  label="Player Count"
                  options={playerCountOptions}
                  value={playerCount}
                  onChange={(e) => setPlayerCount(e.target.value as PlayerCount)}
                />
                {log?.map?.game?.shortName === 'BO4' && (
                  <Select
                    label="Difficulty"
                    options={BO4_DIFFICULTIES.map((d) => ({ value: d, label: getBo4DifficultyLabel(d) }))}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  />
                )}
                <ProofUrlsInput
                  label="Proof URLs (optional)"
                  value={proofUrls}
                  onChange={setProofUrls}
                  placeholder="YouTube or Twitch link"
                />
                {playerCount !== 'SOLO' && (
                  <TeammatePicker
                    value={{ teammateUserIds, teammateNonUserNames }}
                    onChange={({ teammateUserIds: u, teammateNonUserNames: n }) => {
                      setTeammateUserIds(u);
                      setTeammateNonUserNames(n);
                    }}
                    userDetails={teammateUserDetails}
                    currentUserId={profile?.id}
                  />
                )}
                <TimeInput
                  label="Run time (optional)"
                  valueSeconds={completionTimeSeconds}
                  onChange={setCompletionTimeSeconds}
                />
                <Input
                  label="Notes (optional)"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestVerification}
                    onChange={(e) => setRequestVerification(e.target.checked)}
                    className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500"
                  />
                  <span className="text-sm text-bunker-300">Request verification for this run</span>
                </label>
                {proofUrls.filter(Boolean).length > 0 && (
                  <div className="flex flex-col gap-4">
                    {proofUrls.filter(Boolean).map((url, i) => (
                      <ProofEmbed key={i} url={url} className="rounded-lg overflow-hidden" />
                    ))}
                  </div>
                )}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <Button type="submit" disabled={saving} leftIcon={<Save className="w-4 h-4" />} className="w-full sm:w-auto">
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                  <Link href={`/maps/${slug}/run/challenge/${logId}`} className="w-full sm:w-auto">
                    <Button type="button" variant="secondary" className="w-full sm:w-auto">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card variant="bordered">
            <CardContent className="py-4 sm:py-6">
              <form onSubmit={handleUpdateEasterEgg} className="space-y-4">
                <Input
                  label="Round Completed"
                  type="number"
                  min={1}
                  value={roundCompleted}
                  onChange={(e) => setRoundCompleted(e.target.value)}
                  placeholder="e.g. 18"
                />
                <Select
                  label="Player Count"
                  options={playerCountOptions}
                  value={playerCount}
                  onChange={(e) => setPlayerCount(e.target.value as PlayerCount)}
                />
                {log?.map?.game?.shortName === 'BO4' && (
                  <Select
                    label="Difficulty"
                    options={BO4_DIFFICULTIES.map((d) => ({ value: d, label: getBo4DifficultyLabel(d) }))}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  />
                )}
                <ProofUrlsInput
                  label="Proof URLs (optional)"
                  value={proofUrls}
                  onChange={setProofUrls}
                  placeholder="YouTube or Twitch link"
                />
                {playerCount !== 'SOLO' && (
                  <TeammatePicker
                    value={{ teammateUserIds, teammateNonUserNames }}
                    onChange={({ teammateUserIds: u, teammateNonUserNames: n }) => {
                      setTeammateUserIds(u);
                      setTeammateNonUserNames(n);
                    }}
                    userDetails={teammateUserDetails}
                    currentUserId={profile?.id}
                  />
                )}
                <TimeInput
                  label="Run time (optional)"
                  valueSeconds={completionTimeSeconds}
                  onChange={setCompletionTimeSeconds}
                />
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSolo}
                      onChange={(e) => setIsSolo(e.target.checked)}
                      className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500"
                    />
                    <span className="text-sm text-bunker-300">Solo completion</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNoGuide}
                      onChange={(e) => setIsNoGuide(e.target.checked)}
                      className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500"
                    />
                    <span className="text-sm text-bunker-300">No guide used</span>
                  </label>
                </div>
                <Input
                  label="Notes (optional)"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestVerification}
                    onChange={(e) => setRequestVerification(e.target.checked)}
                    className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500"
                  />
                  <span className="text-sm text-bunker-300">Request verification for this run</span>
                </label>
                {proofUrls.filter(Boolean).length > 0 && (
                  <div className="flex flex-col gap-4">
                    {proofUrls.filter(Boolean).map((url, i) => (
                      <ProofEmbed key={i} url={url} className="rounded-lg overflow-hidden" />
                    ))}
                  </div>
                )}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <Button type="submit" disabled={saving} leftIcon={<Save className="w-4 h-4" />} className="w-full sm:w-auto">
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                  <Link href={`/maps/${slug}/run/easter-egg/${logId}`} className="w-full sm:w-auto">
                    <Button type="button" variant="secondary" className="w-full sm:w-auto">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={!!errorModalMessage}
        onClose={() => setErrorModalMessage(null)}
        title="Can't save"
        description={errorModalMessage ?? undefined}
        size="sm"
      >
        <div className="flex justify-end pt-2">
          <Button onClick={() => setErrorModalMessage(null)}>OK</Button>
        </div>
      </Modal>
    </div>
  );
}
