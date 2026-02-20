'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Badge,
  Logo,
  PageLoader,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TimeInput,
  Modal,
} from '@/components/ui';
import { ProofEmbed, ProofUrlsInput, TeammatePicker } from '@/components/game';
import { cn, normalizeProofUrls } from '@/lib/utils';
import { useXpToast } from '@/context/xp-toast-context';
import { getXpForChallengeLog, getXpForEasterEggLog, type AchievementForPreview } from '@/lib/xp-preview';
import { isBo4Game, BO4_DIFFICULTIES, getBo4DifficultyLabel } from '@/lib/bo4';
import type { MapWithDetails, ChallengeType, PlayerCount } from '@/types';
import { ChevronLeft, Save, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';

const challengeTypeLabels: Record<ChallengeType, string> = {
  HIGHEST_ROUND: 'Highest Round',
  NO_DOWNS: 'No Downs',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  STARTING_ROOM: 'Starting Room Only',
  ONE_BOX: 'One Box Challenge',
  PISTOL_ONLY: 'Pistol Only',
  NO_POWER: 'No Power',
};

const playerCountOptions = [
  { value: 'SOLO', label: 'Solo' },
  { value: 'DUO', label: 'Duo' },
  { value: 'TRIO', label: 'Trio' },
  { value: 'SQUAD', label: 'Squad' },
];

function SaveProgressRow({
  onSave,
  isSaving,
  saveStatus,
  saveDisabled,
  saveErrorMessage,
  hideInlineError,
}: {
  onSave: () => void;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  saveDisabled?: boolean;
  saveErrorMessage?: string | null;
  hideInlineError?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-6 border-t border-bunker-800 mt-6">
      <div className="order-2 sm:order-1">
        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 text-military-400 text-sm">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Progress saved successfully!
          </div>
        )}
        {saveStatus === 'error' && !hideInlineError && (
          <div className="flex items-center gap-2 text-blood-400 text-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>{saveErrorMessage ?? 'Error saving progress. Please try again.'}</span>
          </div>
        )}
      </div>
      <Button
        onClick={onSave}
        isLoading={isSaving}
        disabled={saveDisabled}
        leftIcon={isSaving ? undefined : <Save className="w-4 h-4" />}
        className="w-full sm:w-auto order-1 sm:order-2"
      >
        Save Progress
      </Button>
    </div>
  );
}

export default function EditMapProgressPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { profile, isLoading: authLoading } = useAuth();
  const { showXpToast } = useXpToast();

  const [map, setMap] = useState<(MapWithDetails & { achievements?: AchievementForPreview[]; unlockedAchievementIds?: string[] }) | null>(null);
  const mapWithAchievements = map;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [saveErrorModalMessage, setSaveErrorModalMessage] = useState<string | null>(null);

  const [challengeForms, setChallengeForms] = useState<
    Record<string, { roundReached: string; playerCount: PlayerCount; difficulty?: string; proofUrls: string[]; notes: string; completionTimeSeconds: number | null; teammateUserIds: string[]; teammateNonUserNames: string[]; requestVerification: boolean }>
  >({});

  /** Multi-select: which challenges are toggled on. When user saves, one log is created per selected challenge with shared form data. */
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<Set<string>>(new Set());
  /** Single shared form for all selected challenges (round, player count, proof, notes, etc.). */
  const [sharedChallengeForm, setSharedChallengeForm] = useState<{
    roundReached: string;
    playerCount: PlayerCount;
    difficulty?: string;
    proofUrls: string[];
    notes: string;
    completionTimeSeconds: number | null;
    teammateUserIds: string[];
    teammateNonUserNames: string[];
    requestVerification: boolean;
  }>({
    roundReached: '',
    playerCount: 'SOLO',
    proofUrls: [],
    notes: '',
    completionTimeSeconds: null,
    teammateUserIds: [],
    teammateNonUserNames: [],
    requestVerification: false,
  });
  const [challengeRulesModalOpen, setChallengeRulesModalOpen] = useState(false);
  /** Main Quest EE tab: 'ee-none' = none selected (default), 'ee-<id>' = that EE selected. Selecting an EE clears challenges. */
  const [eeTabValue, setEeTabValue] = useState<string>('ee-none');

  const [easterEggForms, setEasterEggForms] = useState<
    Record<
      string,
      {
        completed: boolean;
        roundCompleted: string;
        playerCount: PlayerCount;
        difficulty?: string;
        isSolo: boolean;
        isNoGuide: boolean;
        proofUrls: string[];
        notes: string;
        completionTimeSeconds: number | null;
        teammateUserIds: string[];
        teammateNonUserNames: string[];
        requestVerification: boolean;
      }
    >
  >({});

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push(`/maps/${slug}`);
    }
  }, [authLoading, profile, router, slug]);

  useEffect(() => {
    async function fetchMap() {
      try {
        const res = await fetch(`/api/maps/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setMap(data);

          const mainQuestEasterEggs = (data.easterEggs ?? []).filter((ee: { type: string }) => ee.type === 'MAIN_QUEST');

          const isBo4 = (data.game?.shortName ?? '') === 'BO4';
          const challengeInitial: Record<string, { roundReached: string; playerCount: PlayerCount; difficulty?: string; proofUrls: string[]; notes: string; completionTimeSeconds: number | null; teammateUserIds: string[]; teammateNonUserNames: string[]; requestVerification: boolean }> = {};
          for (const challenge of data.challenges) {
            challengeInitial[challenge.id] = {
              roundReached: '',
              playerCount: 'SOLO',
              ...(isBo4 && { difficulty: 'NORMAL' }),
              proofUrls: [],
              notes: '',
              completionTimeSeconds: null,
              teammateUserIds: [],
              teammateNonUserNames: [],
              requestVerification: false,
            };
          }
          setChallengeForms(challengeInitial);
          setSharedChallengeForm({
            roundReached: '',
            playerCount: 'SOLO',
            ...(isBo4 && { difficulty: 'NORMAL' }),
            proofUrls: [],
            notes: '',
            completionTimeSeconds: null,
            teammateUserIds: [],
            teammateNonUserNames: [],
            requestVerification: false,
          });

          const highRoundChallenge = (data.challenges ?? []).find((c: { type: string }) => c.type === 'HIGHEST_ROUND');
          setSelectedChallengeIds(highRoundChallenge ? new Set([highRoundChallenge.id]) : new Set());

          const eeInitial: Record<string, {
            completed: boolean;
            roundCompleted: string;
            playerCount: PlayerCount;
            isSolo: boolean;
            isNoGuide: boolean;
            proofUrls: string[];
            notes: string;
            completionTimeSeconds: number | null;
            teammateUserIds: string[];
            teammateNonUserNames: string[];
            requestVerification: boolean;
          }> = {};
          for (const ee of mainQuestEasterEggs) {
            eeInitial[ee.id] = {
              completed: false,
              roundCompleted: '',
              playerCount: 'SOLO',
              ...(isBo4 && { difficulty: 'NORMAL' }),
              isSolo: false,
              isNoGuide: false,
              proofUrls: [],
              notes: '',
              completionTimeSeconds: null,
              teammateUserIds: [],
              teammateNonUserNames: [],
              requestVerification: false,
            };
          }
          setEasterEggForms(eeInitial);
        }
      } catch (error) {
        console.error('Error fetching map:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMap();
  }, [slug]);

  const handleChallengeChange = (
    challengeId: string,
    field: keyof (typeof challengeForms)[string],
    value: string | number | string[] | null
  ) => {
    setChallengeForms((prev) => ({
      ...prev,
      [challengeId]: {
        ...prev[challengeId],
        [field]: value,
      },
    }));
  };

  const toggleChallenge = (challengeId: string) => {
    const isAdding = !selectedChallengeIds.has(challengeId);
    if (isAdding) setEeTabValue('ee-none');
    setSelectedChallengeIds((prev) => {
      const next = new Set(prev);
      if (next.has(challengeId)) next.delete(challengeId);
      else next.add(challengeId);
      return next;
    });
  };

  const handleSharedChallengeChange = (
    field: keyof typeof sharedChallengeForm,
    value: string | number | boolean | string[] | null | undefined
  ) => {
    setSharedChallengeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSelectedChallenges = async () => {
    if (!profile || !map || selectedChallengeIds.size === 0) return;
    const form = sharedChallengeForm;
    const round = parseInt(form.roundReached, 10);
    if (!form.roundReached || Number.isNaN(round) || round <= 0) return;
    if (form.requestVerification) {
      const hasProof = (form.proofUrls ?? []).filter(Boolean).length > 0;
      if (!hasProof) {
        setSaveErrorModalMessage('To request verification, add at least one proof (URL or screenshot) or uncheck "Request verification".');
        return;
      }
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setSaveErrorMessage(null);
    setSaveErrorModalMessage(null);
    let totalXpGained = 0;
    let lastTotalXp: number | undefined;

    try {
      const ids = Array.from(selectedChallengeIds);
      for (const challengeId of ids) {
        const res = await fetch('/api/challenge-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            mapId: map.id,
            roundReached: round,
            playerCount: form.playerCount,
            ...(map.game?.shortName === 'BO4' && form.difficulty && { difficulty: form.difficulty }),
            proofUrls: normalizeProofUrls(form.proofUrls ?? []),
            notes: form.notes || null,
            completionTimeSeconds: form.completionTimeSeconds ?? null,
            teammateUserIds: form.teammateUserIds ?? [],
            teammateNonUserNames: form.teammateNonUserNames ?? [],
            requestVerification: form.requestVerification ?? false,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save');
        totalXpGained += typeof data.xpGained === 'number' ? data.xpGained : 0;
        if (typeof data.totalXp === 'number') lastTotalXp = data.totalXp;
      }
      if (totalXpGained > 0) {
        showXpToast(totalXpGained, lastTotalXp != null ? { totalXp: lastTotalXp } : undefined);
      }
      setSaveStatus('success');
      setTimeout(() => router.push(`/maps/${slug}?achievementUpdated=1`), 1500);
    } catch (error) {
      console.error('Error saving challenge logs:', error);
      setSaveErrorModalMessage(error instanceof Error ? error.message : 'Error saving progress. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEasterEggChange = (
    eeId: string,
    field: keyof (typeof easterEggForms)[string],
    value: string | boolean | number | string[] | null
  ) => {
    setEasterEggForms((prev) => ({
      ...prev,
      [eeId]: {
        ...prev[eeId],
        [field]: value,
      },
    }));
  };

  const handleSaveChallenge = async (challengeId: string) => {
    if (!profile || !map) return;

    const form = challengeForms[challengeId];
    if (!form?.roundReached || parseInt(form.roundReached) <= 0) return;

    if (form.requestVerification) {
      const hasProof = (form.proofUrls ?? []).filter(Boolean).length > 0;
      if (!hasProof) {
        setSaveErrorModalMessage('To request verification, add at least one proof (URL or screenshot) or uncheck "Request verification".');
        return;
      }
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setSaveErrorMessage(null);
    setSaveErrorModalMessage(null);

    try {
      const res = await fetch('/api/challenge-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          mapId: map.id,
          roundReached: parseInt(form.roundReached),
          playerCount: form.playerCount,
          ...(map.game?.shortName === 'BO4' && form.difficulty && { difficulty: form.difficulty }),
          proofUrls: normalizeProofUrls(form.proofUrls ?? []),
          notes: form.notes || null,
          completionTimeSeconds: form.completionTimeSeconds ?? null,
          teammateUserIds: form.teammateUserIds ?? [],
          teammateNonUserNames: form.teammateNonUserNames ?? [],
          requestVerification: form.requestVerification ?? false,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save');

      if (typeof data.xpGained === 'number' && data.xpGained > 0) {
        showXpToast(data.xpGained, typeof data.totalXp === 'number' ? { totalXp: data.totalXp } : undefined);
      }
      setSaveStatus('success');
      setTimeout(() => router.push(`/maps/${slug}?achievementUpdated=1`), 1500);
    } catch (error) {
      console.error('Error saving challenge log:', error);
      setSaveErrorModalMessage(error instanceof Error ? error.message : 'Error saving progress. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEasterEgg = async (eeId: string) => {
    if (!profile || !map) return;

    const form = easterEggForms[eeId];
    if (!form?.completed) return;

    if (form.requestVerification) {
      const hasProof = (form.proofUrls ?? []).filter(Boolean).length > 0;
      if (!hasProof) {
        setSaveErrorModalMessage('To request verification, add at least one proof (URL or screenshot) or uncheck "Request verification".');
        return;
      }
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setSaveErrorMessage(null);
    setSaveErrorModalMessage(null);

    try {
      const res = await fetch('/api/easter-egg-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          easterEggId: eeId,
          mapId: map.id,
          roundCompleted: form.roundCompleted ? parseInt(form.roundCompleted) : null,
          playerCount: form.playerCount,
          ...(map.game?.shortName === 'BO4' && form.difficulty && { difficulty: form.difficulty }),
          isSolo: form.isSolo,
          isNoGuide: form.isNoGuide,
          proofUrls: normalizeProofUrls(form.proofUrls ?? []),
          notes: form.notes || null,
          completionTimeSeconds: form.completionTimeSeconds ?? null,
          teammateUserIds: form.teammateUserIds ?? [],
          teammateNonUserNames: form.teammateNonUserNames ?? [],
          requestVerification: form.requestVerification ?? false,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save');

      if (typeof data.xpGained === 'number' && data.xpGained > 0) {
        showXpToast(data.xpGained, typeof data.totalXp === 'number' ? { totalXp: data.totalXp } : undefined);
      }
      setSaveStatus('success');
      setTimeout(() => router.push(`/maps/${slug}?achievementUpdated=1`), 1500);
    } catch (error) {
      console.error('Error saving Easter Egg log:', error);
      setSaveErrorModalMessage(error instanceof Error ? error.message : 'Error saving progress. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const mainQuestEasterEggs = useMemo(
    () => (map?.easterEggs ?? []).filter((ee: { type: string }) => ee.type === 'MAIN_QUEST'),
    [map?.easterEggs]
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <PageLoader message="Loading..." fullScreen />
      </div>
    );
  }

  if (!map) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Logo size="xl" animated={false} className="mx-auto mb-4 opacity-50" />
          <h1 className="text-xl sm:text-2xl font-zombies text-white mb-4">Map Not Found</h1>
          <Link href="/maps">
            <Button variant="secondary">Back to Maps</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bunker-950">
      {/* Header */}
      <div className="bg-bunker-900 border-b border-bunker-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href={`/maps/${slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-3.5 py-2 text-sm font-medium text-white shadow-md transition-colors hover:border-bunker-400 hover:bg-bunker-700/95 mb-3 sm:mb-4 w-fit"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back to {map.name}
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-zombies text-white tracking-wide">
            Log Progress
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-bunker-400">
            Track your achievements on {map.name}. Choose what you want to log below.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-6 sm:space-y-8 min-w-0">
        {/* Challenges: same tab-style UI as Main Quest, multi-select toggles + one shared form */}
        {map.challenges.length > 0 && (
          <Tabs value="challenges-multi" variant="separate" className="space-y-4 min-w-0">
            <div className="space-y-3 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-bunker-200 mb-0 pl-0.5">
                Challenges
              </p>
              <p className="text-sm text-bunker-400">
                Toggle the challenges you completed in this run. One log will be created per selected challenge with the same details below.
              </p>
              <TabsList className="min-w-0 w-full">
                {map.challenges.map((challenge) => {
                  const isSelected = selectedChallengeIds.has(challenge.id);
                  return (
                    <button
                      key={challenge.id}
                      type="button"
                      onClick={() => toggleChallenge(challenge.id)}
                      className={cn(
                        'w-full min-w-0 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 text-center',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blood-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bunker-900',
                        isSelected
                          ? 'border-blood-500/80 bg-blood-950/50 text-white shadow-sm'
                          : 'border-bunker-600 bg-bunker-800 text-bunker-300 hover:border-bunker-500 hover:bg-bunker-700/70 hover:text-bunker-200'
                      )}
                    >
                      {challengeTypeLabels[challenge.type] || challenge.name}
                    </button>
                  );
                })}
              </TabsList>
            </div>
          </Tabs>
        )}

        {/* Main Quest Easter Eggs (left 3/4) + Challenge Rules button (right 1/4) - between Challenges and logging */}
        <Tabs
          value={eeTabValue}
          onChange={(value) => {
            setEeTabValue(value);
            if (value.startsWith('ee-') && value !== 'ee-none') setSelectedChallengeIds(new Set());
          }}
          variant="separate"
          className="space-y-3 sm:space-y-4 min-w-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-stretch min-w-0">
            <div className="sm:col-span-3 space-y-3 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-bunker-200 mb-0 pl-0.5">
                Main Quest Easter Eggs
              </p>
              {mainQuestEasterEggs.length > 0 ? (
                <TabsList>
                  {mainQuestEasterEggs.map((ee: { id: string; name: string }) => (
                    <TabsTrigger key={ee.id} value={`ee-${ee.id}`}>
                      {ee.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              ) : (
                <p className="text-sm text-bunker-500">No main quest Easter Eggs on this map.</p>
              )}
            </div>
            <div className="sm:col-span-1 flex flex-col justify-center min-w-0 sm:items-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setChallengeRulesModalOpen(true)}
                className="border-element-500/60 bg-element-950/40 text-element-200 hover:bg-element-900/50 hover:text-element-100 w-full sm:w-auto !px-3 !py-2.5 text-sm font-medium min-h-[2.75rem] rounded-lg"
                leftIcon={<BookOpen className="w-4 h-4 shrink-0" />}
              >
                Challenge Rules
              </Button>
            </div>
          </div>

          <Modal
            isOpen={challengeRulesModalOpen}
            onClose={() => setChallengeRulesModalOpen(false)}
            title="Challenge Rules"
            description="Rules and requirements for each challenge type"
            size="md"
          >
            <p className="text-bunker-300 text-sm">
              Challenge rules are coming soon. Rules will vary by game, and we&apos;ll add them here so you can quickly check requirements for No Perks, No Power, Pistol Only, and other challenges.
            </p>
          </Modal>

          {/* Challenge logging form (when one or more challenges selected) */}
          {map.challenges.length > 0 && selectedChallengeIds.size > 0 && (
            <>
              <Card variant="bordered">
                <CardContent className="py-4 sm:py-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4 min-w-0">
                    <p className="text-sm text-bunker-400">
                      Same run details will apply to all {selectedChallengeIds.size} selected challenge{selectedChallengeIds.size !== 1 ? 's' : ''}.
                    </p>
                    {mapWithAchievements?.achievements && (
                      <Badge variant="info" size="sm" className="self-start sm:flex-shrink-0 shrink-0">
                        +{Array.from(selectedChallengeIds).reduce((sum, challengeId) => {
                          const challenge = map.challenges.find((c) => c.id === challengeId);
                          if (!challenge || !mapWithAchievements?.achievements) return sum;
                          return sum + getXpForChallengeLog(
                            mapWithAchievements.achievements,
                            mapWithAchievements.unlockedAchievementIds ?? [],
                            challenge.type,
                            parseInt(sharedChallengeForm.roundReached || '0', 10) || 0,
                            map.roundCap ?? null,
                            map?.game?.shortName === 'BO4' ? (sharedChallengeForm.difficulty ?? 'NORMAL') : undefined
                          );
                        }, 0)} XP
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 min-w-0">
                    <Input
                      label="Round Reached"
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      value={sharedChallengeForm.roundReached}
                      onChange={(e) => handleSharedChallengeChange('roundReached', e.target.value)}
                    />
                    <Select
                      label="Player Count"
                      options={playerCountOptions}
                      value={sharedChallengeForm.playerCount}
                      onChange={(e) => handleSharedChallengeChange('playerCount', e.target.value)}
                    />
                    {map?.game?.shortName === 'BO4' && (
                      <Select
                        label="Difficulty"
                        options={BO4_DIFFICULTIES.map((d) => ({ value: d, label: getBo4DifficultyLabel(d) }))}
                        value={sharedChallengeForm.difficulty || 'NORMAL'}
                        onChange={(e) => handleSharedChallengeChange('difficulty', e.target.value)}
                      />
                    )}
                    <div className="sm:col-span-3 mt-1 min-w-0">
                      <ProofUrlsInput
                        label="Proof URLs (optional)"
                        value={sharedChallengeForm.proofUrls}
                        onChange={(urls) => handleSharedChallengeChange('proofUrls', urls)}
                      />
                    </div>
                  </div>

                  {sharedChallengeForm.playerCount !== 'SOLO' && (
                    <div className="mt-3 sm:mt-4">
                      <TeammatePicker
                        value={{
                          teammateUserIds: sharedChallengeForm.teammateUserIds,
                          teammateNonUserNames: sharedChallengeForm.teammateNonUserNames,
                        }}
                        onChange={({ teammateUserIds, teammateNonUserNames }) => {
                          handleSharedChallengeChange('teammateUserIds', teammateUserIds);
                          handleSharedChallengeChange('teammateNonUserNames', teammateNonUserNames);
                        }}
                        currentUserId={profile?.id}
                      />
                    </div>
                  )}

                  <div className="mt-3 sm:mt-4">
                    <TimeInput
                      label="Run time (optional)"
                      valueSeconds={sharedChallengeForm.completionTimeSeconds}
                      onChange={(seconds) => handleSharedChallengeChange('completionTimeSeconds', seconds)}
                    />
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <Input
                      label="Notes (optional)"
                      type="text"
                      placeholder="Any notes about this run"
                      value={sharedChallengeForm.notes}
                      onChange={(e) => handleSharedChallengeChange('notes', e.target.value)}
                    />
                  </div>

                  <label className="mt-3 sm:mt-4 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sharedChallengeForm.requestVerification ?? false}
                      onChange={(e) => handleSharedChallengeChange('requestVerification', e.target.checked)}
                      className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500"
                    />
                    <span className="text-sm text-bunker-300">Request verification for this run</span>
                  </label>

                  {(sharedChallengeForm.proofUrls?.filter(Boolean).length ?? 0) > 0 && (
                    <div className="mt-3 sm:mt-4 flex flex-col gap-4">
                      {(sharedChallengeForm.proofUrls ?? []).filter(Boolean).map((url, i) => (
                        <ProofEmbed key={i} url={url} className="rounded-lg overflow-hidden" />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <SaveProgressRow
                onSave={handleSaveSelectedChallenges}
                isSaving={isSaving}
                saveStatus={saveStatus}
                saveDisabled={!sharedChallengeForm.roundReached || parseInt(sharedChallengeForm.roundReached, 10) <= 0}
                saveErrorMessage={saveErrorMessage}
                hideInlineError={!!saveErrorModalMessage}
              />
            </>
          )}

          {/* Tab content: one per Main Quest Easter Egg */}
          {mainQuestEasterEggs.map((ee) => (
            <TabsContent key={ee.id} value={`ee-${ee.id}`} className="space-y-4">
              <Card variant="bordered">
                <CardContent className="py-4 sm:py-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{ee.name}</h2>
                      <p className="text-sm text-bunker-400 mt-1">
                        {ee.description ||
                          'Log your Easter Egg completion. Check completed, enter the round you finished on, player count, and optional proof.'}
                      </p>
                    </div>
                    <Badge
                      variant={ee.type === 'MAIN_QUEST' ? 'purple' : 'default'}
                      size="sm"
                      className="self-start sm:flex-shrink-0"
                    >
                      {ee.type === 'MAIN_QUEST' ? 'Main' : 'Side'}
                    </Badge>
                  </div>
                  {mapWithAchievements?.achievements && (
                    <div className="mb-4 shrink-0">
                      <Badge variant="info" size="sm">
                        +{ee.type === 'MAIN_QUEST'
                          ? (ee.xpReward ?? getXpForEasterEggLog(
                              mapWithAchievements.achievements,
                              mapWithAchievements.unlockedAchievementIds ?? [],
                              ee.id,
                              map?.game?.shortName === 'BO4' ? (easterEggForms[ee.id]?.difficulty ?? 'NORMAL') : undefined
                            ))
                          : getXpForEasterEggLog(
                              mapWithAchievements.achievements,
                              mapWithAchievements.unlockedAchievementIds ?? [],
                              ee.id,
                              map?.game?.shortName === 'BO4' ? (easterEggForms[ee.id]?.difficulty ?? 'NORMAL') : undefined
                            )} XP
                      </Badge>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={easterEggForms[ee.id]?.completed || false}
                      onChange={(e) =>
                        handleEasterEggChange(ee.id, 'completed', e.target.checked)
                      }
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded border-bunker-600 bg-bunker-800 text-blood-500 focus:ring-blood-500"
                    />
                    <span className="font-medium text-white">I completed this Easter Egg</span>
                  </label>

                  {easterEggForms[ee.id]?.completed && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <Input
                          label="Round Completed"
                          type="number"
                          min="1"
                          placeholder="e.g. 18"
                          value={easterEggForms[ee.id]?.roundCompleted || ''}
                          onChange={(e) =>
                            handleEasterEggChange(ee.id, 'roundCompleted', e.target.value)
                          }
                        />
                        <Select
                          label="Player Count"
                          options={playerCountOptions}
                          value={easterEggForms[ee.id]?.playerCount || 'SOLO'}
                          onChange={(e) =>
                            handleEasterEggChange(ee.id, 'playerCount', e.target.value)
                          }
                        />
                        {map?.game?.shortName === 'BO4' && (
                          <Select
                            label="Difficulty"
                            options={BO4_DIFFICULTIES.map((d) => ({ value: d, label: getBo4DifficultyLabel(d) }))}
                            value={easterEggForms[ee.id]?.difficulty || 'NORMAL'}
                            onChange={(e) =>
                              handleEasterEggChange(ee.id, 'difficulty', e.target.value)
                            }
                          />
                        )}
                        <div className="sm:col-span-3">
                          <ProofUrlsInput
                            label="Proof URLs (optional)"
                            value={easterEggForms[ee.id]?.proofUrls ?? []}
                            onChange={(urls) => handleEasterEggChange(ee.id, 'proofUrls', urls)}
                          />
                        </div>
                      </div>

                      {easterEggForms[ee.id]?.playerCount && easterEggForms[ee.id].playerCount !== 'SOLO' && (
                        <div className="mt-3 sm:mt-4">
                          <TeammatePicker
                            value={{
                              teammateUserIds: easterEggForms[ee.id]?.teammateUserIds ?? [],
                              teammateNonUserNames: easterEggForms[ee.id]?.teammateNonUserNames ?? [],
                            }}
                            onChange={({ teammateUserIds, teammateNonUserNames }) => {
                              handleEasterEggChange(ee.id, 'teammateUserIds', teammateUserIds);
                              handleEasterEggChange(ee.id, 'teammateNonUserNames', teammateNonUserNames);
                            }}
                            currentUserId={profile?.id}
                          />
                        </div>
                      )}

                      <div className="mt-3 sm:mt-4">
                        <TimeInput
                          label="Run time (optional)"
                          valueSeconds={easterEggForms[ee.id]?.completionTimeSeconds ?? null}
                          onChange={(seconds) =>
                            handleEasterEggChange(ee.id, 'completionTimeSeconds', seconds)
                          }
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={easterEggForms[ee.id]?.isSolo || false}
                            onChange={(e) =>
                              handleEasterEggChange(ee.id, 'isSolo', e.target.checked)
                            }
                            className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500 focus:ring-blood-500"
                          />
                          <span className="text-sm text-bunker-300">Solo completion</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={easterEggForms[ee.id]?.isNoGuide || false}
                            onChange={(e) =>
                              handleEasterEggChange(ee.id, 'isNoGuide', e.target.checked)
                            }
                            className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500 focus:ring-blood-500"
                          />
                          <span className="text-sm text-bunker-300">No guide used</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={easterEggForms[ee.id]?.requestVerification || false}
                            onChange={(e) =>
                              handleEasterEggChange(ee.id, 'requestVerification', e.target.checked)
                            }
                            className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500 focus:ring-blood-500"
                          />
                          <span className="text-sm text-bunker-300">Request verification for this run</span>
                        </label>
                      </div>

                      {(easterEggForms[ee.id]?.proofUrls?.filter(Boolean).length ?? 0) > 0 && (
                        <div className="mt-3 sm:mt-4 flex flex-col gap-4">
                          {(easterEggForms[ee.id].proofUrls ?? []).filter(Boolean).map((url, i) => (
                            <ProofEmbed key={i} url={url} className="rounded-lg overflow-hidden" />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <SaveProgressRow
                onSave={() => handleSaveEasterEgg(ee.id)}
                isSaving={isSaving}
                saveStatus={saveStatus}
                saveDisabled={!easterEggForms[ee.id]?.completed}
                saveErrorMessage={saveErrorMessage}
                hideInlineError={!!saveErrorModalMessage}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Modal
        isOpen={!!saveErrorModalMessage}
        onClose={() => setSaveErrorModalMessage(null)}
        title="Can't save"
        description={saveErrorModalMessage ?? undefined}
        size="sm"
      >
        <div className="flex justify-end pt-2">
          <Button onClick={() => setSaveErrorModalMessage(null)}>OK</Button>
        </div>
      </Modal>
    </div>
  );
}
