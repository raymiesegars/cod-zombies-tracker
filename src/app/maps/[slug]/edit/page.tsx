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
} from '@/components/ui';
import { ProofEmbed } from '@/components/game';
import { useXpToast } from '@/context/xp-toast-context';
import { getXpForChallengeLog, getXpForEasterEggLog, type AchievementForPreview } from '@/lib/xp-preview';
import type { MapWithDetails, ChallengeType, PlayerCount } from '@/types';
import { ChevronLeft, Save, CheckCircle, AlertCircle } from 'lucide-react';

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
}: {
  onSave: () => void;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  saveDisabled?: boolean;
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
        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 text-blood-400 text-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Error saving progress. Please try again.
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

  const [challengeForms, setChallengeForms] = useState<
    Record<string, { roundReached: string; playerCount: PlayerCount; proofUrl: string; notes: string; completionTimeSeconds: number | null }>
  >({});

  const [easterEggForms, setEasterEggForms] = useState<
    Record<
      string,
      {
        completed: boolean;
        roundCompleted: string;
        playerCount: PlayerCount;
        isSolo: boolean;
        isNoGuide: boolean;
        proofUrl: string;
        notes: string;
        completionTimeSeconds: number | null;
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

          const challengeInitial: Record<string, { roundReached: string; playerCount: PlayerCount; proofUrl: string; notes: string; completionTimeSeconds: number | null }> = {};
          for (const challenge of data.challenges) {
            challengeInitial[challenge.id] = {
              roundReached: '',
              playerCount: 'SOLO',
              proofUrl: '',
              notes: '',
              completionTimeSeconds: null,
            };
          }
          setChallengeForms(challengeInitial);

          const eeInitial: Record<string, {
            completed: boolean;
            roundCompleted: string;
            playerCount: PlayerCount;
            isSolo: boolean;
            isNoGuide: boolean;
            proofUrl: string;
            notes: string;
            completionTimeSeconds: number | null;
          }> = {};
          for (const ee of mainQuestEasterEggs) {
            eeInitial[ee.id] = {
              completed: false,
              roundCompleted: '',
              playerCount: 'SOLO',
              isSolo: false,
              isNoGuide: false,
              proofUrl: '',
              notes: '',
              completionTimeSeconds: null,
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
    value: string | number | null
  ) => {
    setChallengeForms((prev) => ({
      ...prev,
      [challengeId]: {
        ...prev[challengeId],
        [field]: value,
      },
    }));
  };

  const handleEasterEggChange = (
    eeId: string,
    field: keyof (typeof easterEggForms)[string],
    value: string | boolean | number | null
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

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const res = await fetch('/api/challenge-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          mapId: map.id,
          roundReached: parseInt(form.roundReached),
          playerCount: form.playerCount,
          proofUrl: form.proofUrl || null,
          notes: form.notes || null,
          completionTimeSeconds: form.completionTimeSeconds ?? null,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save');

      if (typeof data.xpGained === 'number' && data.xpGained > 0) {
        showXpToast(data.xpGained, typeof data.totalXp === 'number' ? { totalXp: data.totalXp } : undefined);
      }
      setSaveStatus('success');
      setTimeout(() => router.push(`/maps/${slug}`), 1500);
    } catch (error) {
      console.error('Error saving challenge log:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEasterEgg = async (eeId: string) => {
    if (!profile || !map) return;

    const form = easterEggForms[eeId];
    if (!form?.completed) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const res = await fetch('/api/easter-egg-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          easterEggId: eeId,
          mapId: map.id,
          roundCompleted: form.roundCompleted ? parseInt(form.roundCompleted) : null,
          playerCount: form.playerCount,
          isSolo: form.isSolo,
          isNoGuide: form.isNoGuide,
          proofUrl: form.proofUrl || null,
          notes: form.notes || null,
          completionTimeSeconds: form.completionTimeSeconds ?? null,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save');

      if (typeof data.xpGained === 'number' && data.xpGained > 0) {
        showXpToast(data.xpGained, typeof data.totalXp === 'number' ? { totalXp: data.totalXp } : undefined);
      }
      setSaveStatus('success');
      setTimeout(() => router.push(`/maps/${slug}`), 1500);
    } catch (error) {
      console.error('Error saving Easter Egg log:', error);
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

  const firstChallengeId = map.challenges[0]?.id;
  const firstEeId = mainQuestEasterEggs[0]?.id;
  const defaultTab = firstChallengeId
    ? `challenge-${firstChallengeId}`
    : firstEeId
      ? `ee-${firstEeId}`
      : 'challenge-none';

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

      {/* One tab per challenge + one per Easter Egg — separate variant: grid, equal widths, uniform padding */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <Tabs defaultValue={defaultTab} variant="separate" className="space-y-3 sm:space-y-4">
          <div className="space-y-3">
            {map.challenges.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-bunker-200 mb-1.5 pl-0.5">
                  Challenges
                </p>
                <TabsList>
                  {map.challenges.map((challenge) => (
                    <TabsTrigger key={challenge.id} value={`challenge-${challenge.id}`}>
                      {challengeTypeLabels[challenge.type] || challenge.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            )}
            {mainQuestEasterEggs.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-bunker-200 mb-1.5 pl-0.5">
                  Main Quest Easter Eggs
                </p>
                <TabsList>
                  {mainQuestEasterEggs.map((ee: { id: string; name: string }) => (
                    <TabsTrigger key={ee.id} value={`ee-${ee.id}`}>
                      {ee.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            )}
          </div>

          {/* Tab content: one per challenge */}
          {map.challenges.map((challenge) => (
            <TabsContent key={challenge.id} value={`challenge-${challenge.id}`} className="space-y-4">
              <Card variant="bordered">
                <CardContent className="py-4 sm:py-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {challengeTypeLabels[challenge.type] || challenge.name}
                      </h2>
                      <p className="text-sm text-bunker-400 mt-1">
                        {challenge.description ||
                          'Log your best round reached for this challenge. Enter the round you got to, player count, and optional proof link.'}
                      </p>
                    </div>
                    {mapWithAchievements?.achievements && (
                      <Badge variant="info" size="sm" className="self-start sm:flex-shrink-0">
                        +{getXpForChallengeLog(
                          mapWithAchievements.achievements,
                          mapWithAchievements.unlockedAchievementIds ?? [],
                          challenge.type,
                          parseInt(challengeForms[challenge.id]?.roundReached || '0', 10) || 0,
                          map.roundCap ?? null
                        )} XP
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <Input
                      label="Round Reached"
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      value={challengeForms[challenge.id]?.roundReached || ''}
                      onChange={(e) =>
                        handleChallengeChange(challenge.id, 'roundReached', e.target.value)
                      }
                    />
                    <Select
                      label="Player Count"
                      options={playerCountOptions}
                      value={challengeForms[challenge.id]?.playerCount || 'SOLO'}
                      onChange={(e) =>
                        handleChallengeChange(challenge.id, 'playerCount', e.target.value)
                      }
                    />
                    <Input
                      label="Proof URL (optional)"
                      type="url"
                      placeholder="YouTube or Twitch link"
                      value={challengeForms[challenge.id]?.proofUrl || ''}
                      onChange={(e) =>
                        handleChallengeChange(challenge.id, 'proofUrl', e.target.value)
                      }
                    />
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <TimeInput
                      label="Run time (optional)"
                      valueSeconds={challengeForms[challenge.id]?.completionTimeSeconds ?? null}
                      onChange={(seconds) =>
                        handleChallengeChange(challenge.id, 'completionTimeSeconds', seconds)
                      }
                    />
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <Input
                      label="Notes (optional)"
                      type="text"
                      placeholder="Any notes about this run"
                      value={challengeForms[challenge.id]?.notes || ''}
                      onChange={(e) =>
                        handleChallengeChange(challenge.id, 'notes', e.target.value)
                      }
                    />
                  </div>

                  {challengeForms[challenge.id]?.proofUrl && (
                    <div className="mt-3 sm:mt-4">
                      <ProofEmbed url={challengeForms[challenge.id].proofUrl} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <SaveProgressRow
                onSave={() => handleSaveChallenge(challenge.id)}
                isSaving={isSaving}
                saveStatus={saveStatus}
              />
            </TabsContent>
          ))}

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
                    <div className="mb-4">
                      <Badge variant="info" size="sm">
                        +{ee.type === 'MAIN_QUEST'
                          ? (ee.xpReward ?? getXpForEasterEggLog(
                              mapWithAchievements.achievements,
                              mapWithAchievements.unlockedAchievementIds ?? [],
                              ee.id
                            ))
                          : getXpForEasterEggLog(
                              mapWithAchievements.achievements,
                              mapWithAchievements.unlockedAchievementIds ?? [],
                              ee.id
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
                        <Input
                          label="Proof URL (optional)"
                          type="url"
                          placeholder="YouTube or Twitch link"
                          value={easterEggForms[ee.id]?.proofUrl || ''}
                          onChange={(e) =>
                            handleEasterEggChange(ee.id, 'proofUrl', e.target.value)
                          }
                        />
                      </div>

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
                      </div>

                      {easterEggForms[ee.id]?.proofUrl && (
                        <ProofEmbed url={easterEggForms[ee.id].proofUrl} />
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
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
