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
import { ProofEmbed, ProofUrlsInput, TeammatePicker, Bo7RelicPicker } from '@/components/game';
import { cn, normalizeProofUrls } from '@/lib/utils';
import { useXpToast } from '@/context/xp-toast-context';
import { getXpForChallengeLog, getXpForEasterEggLog, type AchievementForPreview } from '@/lib/xp-preview';
import { isBo4Game, BO4_DIFFICULTIES, getBo4DifficultyLabel } from '@/lib/bo4';
import { isIwGame, isIwSpeedrunChallengeType, isSpeedrunChallengeType, getMinRoundForSpeedrunChallengeType } from '@/lib/iw';
import { isBo3Game, BO3_GOBBLEGUM_MODES, BO3_GOBBLEGUM_DEFAULT, getBo3GobbleGumLabel } from '@/lib/bo3';
import { isBocwGame, BOCW_SUPPORT_MODES, BOCW_SUPPORT_DEFAULT, getBocwSupportLabel } from '@/lib/bocw';
import { isBo6Game, BO6_GOBBLEGUM_MODES, BO6_GOBBLEGUM_DEFAULT, BO6_SUPPORT_MODES, BO6_SUPPORT_DEFAULT, getBo6GobbleGumLabel, getBo6SupportLabel } from '@/lib/bo6';
import { isBo7Game, BO7_SUPPORT_MODES, BO7_SUPPORT_DEFAULT, getBo7SupportLabel } from '@/lib/bo7';
import type { MapWithDetails, ChallengeType, PlayerCount } from '@/types';
import { ChevronLeft, Save, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { WAW_OFFICIAL_RULES } from '@/lib/waw/waw-official-rules';
import { BO1_OFFICIAL_RULES } from '@/lib/bo1/bo1-official-rules';
import { BO2_OFFICIAL_RULES } from '@/lib/bo2/bo2-official-rules';
import { BO3_OFFICIAL_RULES } from '@/lib/bo3/bo3-official-rules';
import { BO4_OFFICIAL_RULES } from '@/lib/bo4/bo4-official-rules';
import { BOCW_OFFICIAL_RULES } from '@/lib/bocw/bocw-official-rules';
import { getBo6OfficialRulesForMap } from '@/lib/bo6/bo6-official-rules';
import { getBo7OfficialRulesForMap } from '@/lib/bo7/bo7-official-rules';
import { WW2_OFFICIAL_RULES } from '@/lib/ww2/ww2-official-rules';
import { VANGUARD_OFFICIAL_RULES } from '@/lib/vanguard/vanguard-official-rules';
import { isWw2Game } from '@/lib/ww2';
import { isVanguardGame, hasVanguardVoidFilter, hasVanguardRampageFilter } from '@/lib/vanguard';
import { isRuleLink, isRuleInlineLinks } from '@/lib/rules/types';
import { getWaWMapConfig } from '@/lib/waw/waw-map-config';
import { hasNoJugSupport } from '@/lib/no-jug-support';
import { getBo2MapConfig } from '@/lib/bo2/bo2-map-config';
import { hasFirstRoomVariantFilter, getFirstRoomVariantsForMap } from '@/lib/first-room-variants';
import { ACHIEVEMENT_CATEGORY_LABELS } from '@/lib/achievements/categories';

const challengeTypeLabels: Record<string, string> = {
  HIGHEST_ROUND: 'Highest Round',
  NO_DOWNS: 'No Downs',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  STARTING_ROOM: 'Starting Room Only',
  STARTING_ROOM_JUG_SIDE: 'First Room (Jug Side)',
  STARTING_ROOM_QUICK_SIDE: 'First Room (Quick Side)',
  ONE_BOX: 'One Box Challenge',
  PISTOL_ONLY: 'Pistol Only',
  NO_POWER: 'No Power',
  NO_MAGIC: 'No Magic',
  ROUND_30_SPEEDRUN: 'Round 30 Speedrun',
  ROUND_50_SPEEDRUN: 'Round 50 Speedrun',
  ROUND_70_SPEEDRUN: 'Round 70 Speedrun',
  ROUND_100_SPEEDRUN: 'Round 100 Speedrun',
  ROUND_200_SPEEDRUN: 'Round 200 Speedrun',
  ROUND_255_SPEEDRUN: 'Round 255 Speedrun',
  NO_JUG: 'No Jug',
  NO_ATS: 'No AATs',
  NO_MANS_LAND: "No Man's Land",
  EASTER_EGG_SPEEDRUN: 'Easter Egg Speedrun',
  GHOST_AND_SKULLS: 'Ghost and Skulls',
  ALIENS_BOSS_FIGHT: 'Aliens Boss Fight',
  CRYPTID_FIGHT: 'Cryptid Fight',
  MEPHISTOPHELES: 'Mephistopheles',
  RUSH: 'Rush',
  PURIST: 'Purist',
  NO_ARMOR: 'No Armor',
  INSTAKILL_ROUND_SPEEDRUN: 'Instakill Round Speedrun',
  EXFIL_SPEEDRUN: 'Exfil Round 11',
  EXFIL_R21_SPEEDRUN: 'Exfil Round 21',
  BUILD_EE_SPEEDRUN: 'Build% EE Speedrun',
  ROUND_10_SPEEDRUN: 'Round 10 Speedrun',
  ROUND_20_SPEEDRUN: 'Round 20 Speedrun',
  ROUND_935_SPEEDRUN: 'Round 935 Speedrun',
  ROUND_999_SPEEDRUN: 'Round 999 Speedrun',
  NO_EXO_SUIT: 'No Exo Suit',
  NO_EXO_HEALTH: 'No Exo Health',
  DOUBLE_FEATURE: 'Double Feature',
};

const playerCountOptions = [
  { value: 'SOLO', label: 'Solo' },
  { value: 'DUO', label: 'Duo' },
  { value: 'TRIO', label: 'Trio' },
  { value: 'SQUAD', label: 'Squad' },
];

const CATEGORY_ORDER_FOR_RULES = [
  'EASTER_EGG', 'BASE_ROUNDS', 'HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM',
  'STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'NO_MAGIC',
  'NO_JUG', 'NO_ARMOR', 'NO_ATS', 'NO_MANS_LAND', 'ROUND_10_SPEEDRUN', 'ROUND_20_SPEEDRUN',
  'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN',
  'ROUND_255_SPEEDRUN', 'ROUND_935_SPEEDRUN', 'ROUND_999_SPEEDRUN', 'EXFIL_SPEEDRUN', 'EXFIL_R21_SPEEDRUN', 'BUILD_EE_SPEEDRUN', 'INSTAKILL_ROUND_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN', 'RUSH', 'PURIST', 'GHOST_AND_SKULLS', 'ALIENS_BOSS_FIGHT', 'CRYPTID_FIGHT', 'MEPHISTOPHELES', 'OTHER',
];

function OfficialRulesModal({
  isOpen,
  onClose,
  gameShortName,
  mapSlug,
  mapChallengeTypes,
}: {
  isOpen: boolean;
  onClose: () => void;
  gameShortName?: string | null;
  mapSlug?: string | null;
  mapChallengeTypes?: string[];
}) {
  const isWaw = gameShortName === 'WAW';
  const isBo1 = gameShortName === 'BO1';
  const isBo2 = gameShortName === 'BO2';
  const isBo3 = gameShortName === 'BO3';
  const isBo4 = gameShortName === 'BO4';
  const isBocw = gameShortName === 'BOCW';
  const isBo6 = gameShortName === 'BO6';
  const isBo7 = gameShortName === 'BO7';
  const isWw2 = gameShortName === 'WW2';
  const isVanguard = gameShortName === 'VANGUARD';
  const hasRules = isWaw || isBo1 || isBo2 || isBo3 || isBo4 || isBocw || isBo6 || isBo7 || isWw2 || isVanguard;
  const rules = isWaw ? WAW_OFFICIAL_RULES : isBo1 ? BO1_OFFICIAL_RULES : isBo2 ? BO2_OFFICIAL_RULES : isBo3 ? BO3_OFFICIAL_RULES : isBo4 ? BO4_OFFICIAL_RULES : isBocw ? BOCW_OFFICIAL_RULES : isBo6 && mapSlug ? getBo6OfficialRulesForMap(mapSlug) : isBo7 && mapSlug ? getBo7OfficialRulesForMap(mapSlug) : isWw2 ? WW2_OFFICIAL_RULES : isVanguard ? VANGUARD_OFFICIAL_RULES : null;

  const byType = rules && 'challengeRulesByType' in rules ? (rules as { challengeRulesByType: Record<string, string> }).challengeRulesByType : null;
  const typesToShow = (mapChallengeTypes && mapChallengeTypes.length > 0
    ? Array.from(new Set(mapChallengeTypes))
    : byType ? Object.keys(byType) : []
  ).sort((a, b) => {
    const ia = CATEGORY_ORDER_FOR_RULES.indexOf(a);
    const ib = CATEGORY_ORDER_FOR_RULES.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Rules"
      description={hasRules ? `Rules and requirements for ${isWaw ? 'World at War' : isBo1 ? 'Black Ops 1' : isBo2 ? 'Black Ops 2' : isBo3 ? 'Black Ops 3' : isBo4 ? 'Black Ops 4' : isBocw ? 'Black Ops Cold War' : isBo6 ? 'Black Ops 6' : isBo7 ? 'Black Ops 7' : isWw2 ? 'WWII Zombies' : isVanguard ? 'Vanguard Zombies' : 'submissions'}` : 'Rules and requirements for challenge submissions'}
      size="lg"
    >
      {rules ? (
        <Tabs defaultValue="general" className="w-full" variant="separate">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-2 mb-4 p-2 gap-2">
            <TabsTrigger value="general" className="py-1.5 px-3 text-sm">General Rules</TabsTrigger>
            <TabsTrigger value="challenges" className="py-1.5 px-3 text-sm">Challenge Rules</TabsTrigger>
          </TabsList>
          <div className="max-h-[60vh] min-h-[12rem] overflow-y-auto overflow-x-hidden pr-2">
            <TabsContent value="general" className="mt-0 space-y-4">
              {rules.generalRules.map((section) => (
                <div key={section.title}>
                  <h4 className="text-sm font-semibold text-bunker-100 mb-2">{section.title}</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-bunker-300">
                    {section.items.map((item, i) => (
                      <li key={i}>
                        {isRuleInlineLinks(item)
                          ? item.parts.map((part, j) =>
                              typeof part === 'string' ? (
                                part
                              ) : (
                                <a key={j} href={part.href} target="_blank" rel="noopener noreferrer" className="text-military-400 hover:underline">
                                  {part.text}
                                </a>
                              )
                            )
                          : isRuleLink(item) ? (
                              <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-military-400 hover:underline">
                                {item.text}
                              </a>
                            ) : (
                              item
                            )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="challenges" className="mt-0 space-y-4">
              {typesToShow.map((type) => {
                const label = ACHIEVEMENT_CATEGORY_LABELS[type] ?? type.replace(/_/g, ' ');
                const desc = byType?.[type] ?? 'Official rules coming soon.';
                return (
                  <div key={type}>
                    <h4 className="text-sm font-semibold text-bunker-100 mb-1">{label}</h4>
                    <p className="text-sm text-bunker-300">{desc}</p>
                  </div>
                );
              })}
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <p className="text-bunker-300 text-sm">
          Official rules for this game are coming soon. Rules will vary by game, and we&apos;ll add them here so you can quickly check requirements for challenges.
        </p>
      )}
    </Modal>
  );
}

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
  /** Per-speedrun completion times: challengeId → seconds. Only used for speedrun challenge types. */
  const [speedrunTimes, setSpeedrunTimes] = useState<Record<string, number | null>>({});
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
    useFortuneCards?: boolean | null;
    useDirectorsCut?: boolean;
    bo3GobbleGumMode?: string;
    bo4ElixirMode?: string;
    bocwSupportMode?: string;
    bo6GobbleGumMode?: string;
    bo6SupportMode?: string;
    bo7SupportMode?: string;
    bo7IsCursedRun?: boolean;
    bo7RelicsUsed?: string[];
    rampageInducerUsed?: boolean;
    wawNoJug?: boolean;
    wawFixedWunderwaffe?: boolean;
    bo2BankUsed?: boolean | null;
    bo3AatUsed?: boolean | null;
    ww2ConsumablesUsed?: boolean;
    vanguardVoidUsed?: boolean;
    firstRoomVariant?: string;
    killsReached?: string;
    scoreReached?: string;
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
        rampageInducerUsed?: boolean;
        vanguardVoidUsed?: boolean;
        ww2ConsumablesUsed?: boolean;
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
          for (const challenge of (data.challenges ?? []).filter((c: { type: string }) => c.type !== 'NO_JUG')) {
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
          const isIw = (data.game?.shortName ?? '') === 'IW';
          const isBo3 = isBo3Game(data.game?.shortName);
          const isBocw = isBocwGame(data.game?.shortName);
          const isBo6 = isBo6Game(data.game?.shortName);
          const isBo7 = isBo7Game(data.game?.shortName);
          const isWw2 = isWw2Game(data.game?.shortName);
          const isVanguard = isVanguardGame(data.game?.shortName);
          const hasVoidFilter = isVanguard && data.slug && hasVanguardVoidFilter(data.slug);
          const hasRampageFilter = isVanguard && data.slug && hasVanguardRampageFilter(data.slug);
          setSharedChallengeForm({
            roundReached: '',
            playerCount: 'SOLO',
            ...(isBo4 && { difficulty: 'NORMAL' }),
            ...(isIw && { useFortuneCards: false, useDirectorsCut: false }),
            ...(isBo3 && { bo3GobbleGumMode: BO3_GOBBLEGUM_DEFAULT }),
            ...(isBocw && { bocwSupportMode: BOCW_SUPPORT_DEFAULT, rampageInducerUsed: false }),
            ...(isBo6 && { bo6GobbleGumMode: BO6_GOBBLEGUM_DEFAULT, bo6SupportMode: BO6_SUPPORT_DEFAULT, rampageInducerUsed: false }),
            ...(isBo7 && { bo7SupportMode: BO7_SUPPORT_DEFAULT, bo7IsCursedRun: false, bo7RelicsUsed: [], rampageInducerUsed: false }),
            ...((data.game?.shortName ?? '') === 'BO2' && getBo2MapConfig(data.slug)?.hasBank && { bo2BankUsed: true }),
            ...(isWw2 && { ww2ConsumablesUsed: true }),
            ...(hasVoidFilter && { vanguardVoidUsed: true }),
            ...(hasRampageFilter && { rampageInducerUsed: false }),
            ...(data.slug && hasNoJugSupport(data.slug, data.game?.shortName) && { wawNoJug: false }),
            ...((data.game?.shortName ?? '') === 'WAW' && data.slug === 'der-riese' && { wawFixedWunderwaffe: false }),
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
            rampageInducerUsed?: boolean;
            vanguardVoidUsed?: boolean;
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
              ...((isBocw || isBo6 || isBo7 || (isVanguardGame(data.game?.shortName) && hasVanguardRampageFilter(data.slug))) && { rampageInducerUsed: false }),
              ...(isVanguardGame(data.game?.shortName) && hasVanguardVoidFilter(data.slug) && { vanguardVoidUsed: true }),
              ...(isWw2Game(data.game?.shortName) && { ww2ConsumablesUsed: true }),
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

  useEffect(() => {
    const wawCfg = map?.game?.shortName === 'WAW' ? getWaWMapConfig(map?.slug ?? '') : null;
    const hasNoDowns = map && Array.from(selectedChallengeIds).some((cid) =>
      map.challenges.find((ch) => ch.id === cid)?.type === 'NO_DOWNS'
    );
    if (wawCfg && !wawCfg.noDownsSoloAllowed && hasNoDowns && sharedChallengeForm.playerCount === 'SOLO') {
      setSharedChallengeForm((prev) => ({ ...prev, playerCount: 'DUO' }));
    }
  }, [map, selectedChallengeIds, sharedChallengeForm.playerCount]);

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
    const challenge = map?.challenges.find((c) => c.id === challengeId);
    const isNoMansLand = challenge?.type === 'NO_MANS_LAND';
    const isRush = challenge?.type === 'RUSH';
    if (isAdding) setEeTabValue('ee-none');
    setSelectedChallengeIds((prev) => {
      const hasRushSelected = Array.from(prev).some(
        (id) => map?.challenges.find((c) => c.id === id)?.type === 'RUSH'
      );
      if (hasRushSelected && isAdding && !isRush) return prev;
      const next = new Set(prev);
      if (next.has(challengeId)) next.delete(challengeId);
      else {
        next.add(challengeId);
        if (isRush) return new Set([challengeId]);
        if (isNoMansLand) return new Set([challengeId]);
        const noMansLandId = map?.challenges.find((c) => c.type === 'NO_MANS_LAND')?.id;
        if (noMansLandId) next.delete(noMansLandId);
      }
      return next;
    });
    // Init speedrun time slot when adding a speedrun
    if (isAdding && challenge && isSpeedrunChallengeType(challenge.type)) {
      setSpeedrunTimes((prev) => ({ ...prev, [challengeId]: null }));
    } else if (!isAdding) {
      setSpeedrunTimes((prev) => { const next = { ...prev }; delete next[challengeId]; return next; });
    }
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
    const selectedChallenges = Array.from(selectedChallengeIds).map((cid) => map.challenges.find((c) => c.id === cid));
    const isNoMansLandOnly =
      selectedChallengeIds.size === 1 && selectedChallenges[0]?.type === 'NO_MANS_LAND';
    const isRushOnly =
      selectedChallengeIds.size === 1 && selectedChallenges[0]?.type === 'RUSH';
    if (isNoMansLandOnly) {
      const kills = parseInt(form.killsReached ?? '', 10);
      if (!form.killsReached || Number.isNaN(kills) || kills <= 0) {
        setSaveErrorModalMessage("No Man's Land requires a valid kills count (1+).");
        return;
      }
    } else if (isRushOnly) {
      const score = parseInt(form.scoreReached ?? '', 10);
      if (!form.scoreReached || Number.isNaN(score) || score <= 0) {
        setSaveErrorModalMessage('Rush requires a valid score (1+).');
        return;
      }
    } else {
      const round = parseInt(form.roundReached, 10);
      if (!form.roundReached || Number.isNaN(round) || round <= 0) return;
      const minRound = Math.max(...Array.from(selectedChallengeIds).map((cid) => {
        const c = map.challenges.find((ch) => ch.id === cid);
        return c && isSpeedrunChallengeType(c.type) ? getMinRoundForSpeedrunChallengeType(c.type) : 1;
      }));
      if (round < minRound) {
        setSaveErrorModalMessage(`Round must be at least ${minRound} for the selected speedrun challenge(s) (e.g. Round ${minRound} Speedrun requires round ${minRound}+).`);
        return;
      }
    }
    const isIw = isIwGame(map.game?.shortName);
    const isBo3 = isBo3Game(map.game?.shortName);
    const isBocw = isBocwGame(map.game?.shortName);
    const isBo6 = isBo6Game(map.game?.shortName);
    const isBo7 = isBo7Game(map.game?.shortName);
    const anySpeedrun = Array.from(selectedChallengeIds).some((cid) => {
      const c = map.challenges.find((ch) => ch.id === cid);
      return c && isSpeedrunChallengeType(c.type);
    });
    if (isIw && (form.useFortuneCards !== true && form.useFortuneCards !== false)) {
      setSaveErrorModalMessage('IW maps require Fortune Cards selection: Fate & Fortune cards or Fate cards only.');
      return;
    }
    if (anySpeedrun) {
      const selectedSpeedruns = Array.from(selectedChallengeIds).filter((cid) => {
        const c = map.challenges.find((ch) => ch.id === cid);
        return c && isSpeedrunChallengeType(c.type);
      });
      const missingTime = selectedSpeedruns.some((cid) => speedrunTimes[cid] == null || (speedrunTimes[cid] ?? 0) < 0);
      if (missingTime) {
        setSaveErrorModalMessage('All selected speedrun challenges require a completion time.');
        return;
      }
    }
    const anyFirstRoom = Array.from(selectedChallengeIds).some((cid) => {
      const c = map.challenges.find((ch) => ch.id === cid);
      return c?.type === 'STARTING_ROOM';
    });
    if (anyFirstRoom && map.slug && hasFirstRoomVariantFilter(map.slug)) {
      if (!form.firstRoomVariant) {
        setSaveErrorModalMessage('First room challenge on this map requires selecting which room variant.');
        return;
      }
    }
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
        const challenge = map.challenges.find((ch) => ch.id === challengeId);
        const isNoMansLand = challenge?.type === 'NO_MANS_LAND';
        const isRush = challenge?.type === 'RUSH';
        const roundReached = isNoMansLand || isRush ? 1 : parseInt(form.roundReached, 10);
        const killsReached = isNoMansLand ? parseInt(String(form.killsReached ?? '').trim().replace(/\D/g, ''), 10) : undefined;
        const scoreReached = isRush ? parseInt(String(form.scoreReached ?? '').trim().replace(/\D/g, ''), 10) : undefined;
        const res = await fetch('/api/challenge-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            mapId: map.id,
            roundReached,
            ...(killsReached != null && killsReached > 0 && { killsReached }),
            ...(scoreReached != null && scoreReached > 0 && { scoreReached }),
            playerCount: form.playerCount,
            ...(map.game?.shortName === 'BO4' && form.difficulty && { difficulty: form.difficulty }),
            ...(isIw && {
              useFortuneCards: form.useFortuneCards === true,
              useDirectorsCut: form.useDirectorsCut ?? false,
            }),
            ...(isBo3 && {
              bo3GobbleGumMode: form.bo3GobbleGumMode ?? BO3_GOBBLEGUM_DEFAULT,
              bo3AatUsed: ids.some((cid) => map.challenges.find((c) => c.id === cid)?.type === 'NO_ATS')
                ? false
                : form.bo3AatUsed,
            }),
            ...(isBo4Game(map.game?.shortName) && form.bo4ElixirMode && { bo4ElixirMode: form.bo4ElixirMode }),
            ...(isBocw && { bocwSupportMode: form.bocwSupportMode ?? BOCW_SUPPORT_DEFAULT }),
            ...(isBo6 && {
              bo6GobbleGumMode: form.bo6GobbleGumMode ?? BO6_GOBBLEGUM_DEFAULT,
              bo6SupportMode: form.bo6SupportMode ?? BO6_SUPPORT_DEFAULT,
            }),
            ...(isBo7 && {
              bo7SupportMode: form.bo7SupportMode ?? BO7_SUPPORT_DEFAULT,
              bo7IsCursedRun: form.bo7IsCursedRun ?? false,
              bo7RelicsUsed: form.bo7IsCursedRun ? (form.bo7RelicsUsed ?? []) : [],
            }),
            ...((isBocw || isBo6 || isBo7 || (isVanguardGame(map?.game?.shortName) && hasVanguardRampageFilter(map?.slug))) && { rampageInducerUsed: form.rampageInducerUsed ?? false }),
            ...(isVanguardGame(map?.game?.shortName) && hasVanguardVoidFilter(map?.slug) && { vanguardVoidUsed: form.vanguardVoidUsed ?? true }),
            ...(map?.slug && hasNoJugSupport(map.slug, map.game?.shortName) && { wawNoJug: form.wawNoJug ?? false }),
            ...(map?.game?.shortName === 'WAW' && map?.slug === 'der-riese' && { wawFixedWunderwaffe: form.wawFixedWunderwaffe ?? false }),
            ...(map?.game?.shortName === 'BO2' && getBo2MapConfig(map.slug)?.hasBank && { bo2BankUsed: form.bo2BankUsed ?? true }),
            ...(isWw2Game(map?.game?.shortName) && { ww2ConsumablesUsed: form.ww2ConsumablesUsed ?? true }),
            ...(challenge?.type === 'STARTING_ROOM' && map.slug && hasFirstRoomVariantFilter(map.slug) && form.firstRoomVariant && { firstRoomVariant: form.firstRoomVariant }),
            proofUrls: normalizeProofUrls(form.proofUrls ?? []),
            notes: form.notes || null,
            completionTimeSeconds: (() => {
              const c = map.challenges.find((ch) => ch.id === challengeId);
              return c && isSpeedrunChallengeType(c.type)
                ? (speedrunTimes[challengeId] ?? null)
                : (form.completionTimeSeconds ?? null);
            })(),
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
          ...(map?.slug && hasNoJugSupport(map.slug, map.game?.shortName) && { wawNoJug: sharedChallengeForm.wawNoJug ?? false }),
          ...(map?.game?.shortName === 'WAW' && map?.slug === 'der-riese' && { wawFixedWunderwaffe: sharedChallengeForm.wawFixedWunderwaffe ?? false }),
            ...(map.game?.shortName === 'BO2' && getBo2MapConfig(map.slug)?.hasBank && { bo2BankUsed: sharedChallengeForm.bo2BankUsed ?? true }),
            ...((isBocwGame(map?.game?.shortName) || isBo6Game(map?.game?.shortName) || isBo7Game(map?.game?.shortName) || (isVanguardGame(map?.game?.shortName) && hasVanguardRampageFilter(map?.slug))) && { rampageInducerUsed: sharedChallengeForm.rampageInducerUsed ?? false }),
            ...(isVanguardGame(map?.game?.shortName) && hasVanguardVoidFilter(map?.slug) && { vanguardVoidUsed: sharedChallengeForm.vanguardVoidUsed ?? true }),
            ...(isWw2Game(map?.game?.shortName) && { ww2ConsumablesUsed: sharedChallengeForm.ww2ConsumablesUsed ?? true }),
            ...(isBo3Game(map?.game?.shortName) && {
              bo3GobbleGumMode: sharedChallengeForm.bo3GobbleGumMode ?? BO3_GOBBLEGUM_DEFAULT,
              bo3AatUsed: sharedChallengeForm.bo3AatUsed,
            }),
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
          ...((isBocwGame(map.game?.shortName) || isBo6Game(map.game?.shortName) || isBo7Game(map.game?.shortName) || (isVanguardGame(map.game?.shortName) && hasVanguardRampageFilter(map.slug))) && { rampageInducerUsed: form.rampageInducerUsed ?? false }),
          ...(isVanguardGame(map.game?.shortName) && hasVanguardVoidFilter(map.slug) && { vanguardVoidUsed: form.vanguardVoidUsed ?? true }),
          ...(isWw2Game(map.game?.shortName) && { ww2ConsumablesUsed: form.ww2ConsumablesUsed ?? true }),
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
        {(map.challenges?.filter((c) => c.type !== 'NO_JUG') ?? []).length > 0 && (
          <Tabs value="challenges-multi" variant="separate" className="space-y-4 min-w-0">
            <div className="space-y-3 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-bunker-200 mb-0 pl-0.5">
                Challenges
              </p>
              <p className="text-sm text-bunker-400">
                Toggle the challenges you completed in this run. One log will be created per selected challenge with the same details below.
              </p>
              <TabsList className="min-w-0 w-full">
                {map.challenges.filter((c) => c.type !== 'NO_JUG').map((challenge) => {
                  const isSelected = selectedChallengeIds.has(challenge.id);
                  const isSpeedrun = isSpeedrunChallengeType(challenge.type);
                  return (
                    <button
                      key={challenge.id}
                      type="button"
                      onClick={() => toggleChallenge(challenge.id)}
                      className={cn(
                        'w-full min-w-0 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 text-center',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blood-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bunker-900',
                        isSelected && isSpeedrun
                          ? 'border-amber-500/80 bg-amber-950/50 text-amber-100 shadow-sm'
                          : isSelected
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
            <div className="sm:col-span-1 flex flex-col min-w-0 overflow-hidden self-stretch">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setChallengeRulesModalOpen(true)}
                className="border-element-500/60 bg-element-950/40 text-element-200 hover:bg-element-900/50 hover:text-element-100 hover:border-element-400/70 w-full h-full min-h-[4rem] sm:min-h-[5.5rem] md:min-h-[6rem] !px-4 !py-4 sm:!px-5 sm:!py-5 md:!px-6 md:!py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-element-950/30 border-2 flex items-center justify-center gap-3"
                leftIcon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />}
              >
                Official Rules
              </Button>
            </div>
          </div>

          <OfficialRulesModal
            isOpen={challengeRulesModalOpen}
            onClose={() => setChallengeRulesModalOpen(false)}
            gameShortName={map?.game?.shortName}
            mapSlug={map?.slug}
            mapChallengeTypes={map?.challenges?.map((c) => c.type) ?? undefined}
          />

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
                            map?.game?.shortName === 'BO4' ? (sharedChallengeForm.difficulty ?? 'NORMAL') : undefined,
                            sharedChallengeForm.completionTimeSeconds ?? undefined,
                            sharedChallengeForm.killsReached ? parseInt(sharedChallengeForm.killsReached, 10) : undefined,
                            sharedChallengeForm.scoreReached ? parseInt(sharedChallengeForm.scoreReached, 10) : undefined
                          );
                        }, 0)} XP
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 min-w-0">
                    {(() => {
                      const isNoMansLandOnly =
                        selectedChallengeIds.size === 1 &&
                        map.challenges.find((c) => c.id === Array.from(selectedChallengeIds)[0])?.type === 'NO_MANS_LAND';
                      const isRushOnly =
                        selectedChallengeIds.size === 1 &&
                        map.challenges.find((c) => c.id === Array.from(selectedChallengeIds)[0])?.type === 'RUSH';
                      if (isNoMansLandOnly) {
                        return (
                          <Input
                            label="Kills"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={1}
                            placeholder="e.g. 450"
                            value={sharedChallengeForm.killsReached ?? ''}
                            onChange={(e) => handleSharedChallengeChange('killsReached', e.target.value.replace(/\D/g, ''))}
                          />
                        );
                      }
                      if (isRushOnly) {
                        return (
                          <Input
                            label="Score"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={1}
                            placeholder="e.g. 1782651900"
                            value={sharedChallengeForm.scoreReached ?? ''}
                            onChange={(e) => handleSharedChallengeChange('scoreReached', e.target.value.replace(/\D/g, ''))}
                          />
                        );
                      }
                      const minRound = selectedChallengeIds.size > 0
                        ? Math.max(...Array.from(selectedChallengeIds).map((cid) => {
                            const c = map.challenges.find((ch) => ch.id === cid);
                            return c && isSpeedrunChallengeType(c.type) ? getMinRoundForSpeedrunChallengeType(c.type) : 1;
                          }))
                        : 1;
                      const enteredRound = parseInt(sharedChallengeForm.roundReached || '0', 10);
                      const roundTooLow = minRound > 1 && enteredRound > 0 && enteredRound < minRound;
                      return (
                        <div>
                          <Input
                            label="Round Reached"
                            type="number"
                            min={minRound}
                            placeholder={minRound > 1 ? `e.g. ${minRound}+` : 'e.g. 50'}
                            value={sharedChallengeForm.roundReached}
                            onChange={(e) => handleSharedChallengeChange('roundReached', e.target.value)}
                          />
                          {minRound > 1 && (
                            <p className={`text-xs mt-1 ${roundTooLow ? 'text-blood-400' : 'text-bunker-500'}`}>
                              Min. round {minRound} required
                            </p>
                          )}
                        </div>
                      );
                    })()}
                    <Select
                      label="Player Count"
                      options={(() => {
                        const wawCfg = map?.game?.shortName === 'WAW' ? getWaWMapConfig(map.slug) : null;
                        const hasNoDownsSelected = Array.from(selectedChallengeIds).some((cid) => {
                          const c = map.challenges.find((ch) => ch.id === cid);
                          return c?.type === 'NO_DOWNS';
                        });
                        if (wawCfg && !wawCfg.noDownsSoloAllowed && hasNoDownsSelected) {
                          return playerCountOptions.filter((o) => o.value !== 'SOLO');
                        }
                        return playerCountOptions;
                      })()}
                      value={sharedChallengeForm.playerCount}
                      onChange={(e) => handleSharedChallengeChange('playerCount', e.target.value)}
                    />
                    {map?.slug && hasFirstRoomVariantFilter(map.slug) && Array.from(selectedChallengeIds).some((cid) => map.challenges.find((c) => c.id === cid)?.type === 'STARTING_ROOM') && (
                      <Select
                        label="Room Variant (required)"
                        options={[
                          { value: '', label: 'Select variant…' },
                          ...(getFirstRoomVariantsForMap(map.slug) ?? []).map((o) => ({ value: o.value, label: o.label })),
                        ]}
                        value={sharedChallengeForm.firstRoomVariant ?? ''}
                        onChange={(e) => handleSharedChallengeChange('firstRoomVariant', e.target.value || undefined)}
                        placeholder="Required"
                      />
                    )}
                    {map?.game?.shortName === 'BO4' && (
                      <Select
                        label="Difficulty"
                        options={BO4_DIFFICULTIES.map((d) => ({ value: d, label: getBo4DifficultyLabel(d) }))}
                        value={sharedChallengeForm.difficulty || 'NORMAL'}
                        onChange={(e) => handleSharedChallengeChange('difficulty', e.target.value)}
                      />
                    )}
                    {map?.game?.shortName === 'IW' && (
                      <>
                        <Select
                          label="Fortune Cards"
                          options={[
                            { value: 'false', label: 'Fate cards only' },
                            { value: 'true', label: 'Fate & Fortune cards' },
                          ]}
                          value={sharedChallengeForm.useFortuneCards === true ? 'true' : sharedChallengeForm.useFortuneCards === false ? 'false' : ''}
                          onChange={(e) => handleSharedChallengeChange('useFortuneCards', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
                          placeholder="Required"
                        />
                        <label className="flex items-center gap-2 cursor-pointer self-end pb-2 sm:pb-0">
                          <input
                            type="checkbox"
                            checked={sharedChallengeForm.useDirectorsCut ?? false}
                            onChange={(e) => handleSharedChallengeChange('useDirectorsCut', e.target.checked)}
                            className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500"
                          />
                          <span className="text-sm text-bunker-300">Directors Cut</span>
                        </label>
                      </>
                    )}
                    {map?.slug && hasNoJugSupport(map.slug, map.game?.shortName) && (
                      <Select
                        label="No Jug"
                        options={[
                          { value: 'false', label: 'Standard (Jug allowed)' },
                          { value: 'true', label: 'No Jug' },
                        ]}
                        value={sharedChallengeForm.wawNoJug === true ? 'true' : 'false'}
                        onChange={(e) => handleSharedChallengeChange('wawNoJug', e.target.value === 'true')}
                        className="w-full"
                      />
                    )}
                    {map?.game?.shortName === 'WAW' && (
                      <>
                        {map?.slug === 'der-riese' && (
                          <Select
                            label="Fixed Wunderwaffe"
                            options={[
                              { value: 'false', label: 'Standard' },
                              { value: 'true', label: 'Fixed Wunderwaffe' },
                            ]}
                            value={sharedChallengeForm.wawFixedWunderwaffe === true ? 'true' : 'false'}
                            onChange={(e) => handleSharedChallengeChange('wawFixedWunderwaffe', e.target.value === 'true')}
                            className="w-full"
                          />
                        )}
                      </>
                    )}
                    {map?.game?.shortName === 'BO2' && getBo2MapConfig(map.slug)?.hasBank && (
                      <Select
                        label={getBo2MapConfig(map.slug)?.bankIncludesStorage ? 'Bank & Storage' : 'Bank'}
                        options={[
                          { value: 'true', label: getBo2MapConfig(map.slug)?.bankIncludesStorage ? 'Bank+Storage (default)' : 'Bank Used (default)' },
                          { value: 'false', label: getBo2MapConfig(map.slug)?.bankIncludesStorage ? 'No Bank No Storage' : 'No Bank' },
                        ]}
                        value={sharedChallengeForm.bo2BankUsed === true ? 'true' : sharedChallengeForm.bo2BankUsed === false ? 'false' : 'true'}
                        onChange={(e) => handleSharedChallengeChange('bo2BankUsed', e.target.value === 'true')}
                        className="w-full"
                      />
                    )}
                    {isWw2Game(map?.game?.shortName) && (
                      <Select
                        label="Consumables"
                        options={[
                          { value: 'true', label: 'With Consumables (default)' },
                          { value: 'false', label: 'No Consumables' },
                        ]}
                        value={sharedChallengeForm.ww2ConsumablesUsed === true ? 'true' : 'false'}
                        onChange={(e) => handleSharedChallengeChange('ww2ConsumablesUsed', e.target.value === 'true')}
                        className="w-full"
                      />
                    )}
                    {isVanguardGame(map?.game?.shortName) && hasVanguardVoidFilter(map?.slug) && (
                      <Select
                        label="Void"
                        options={[
                          { value: 'true', label: 'With Void (default)' },
                          { value: 'false', label: 'Without Void' },
                        ]}
                        value={sharedChallengeForm.vanguardVoidUsed === true ? 'true' : 'false'}
                        onChange={(e) => handleSharedChallengeChange('vanguardVoidUsed', e.target.value === 'true')}
                        className="w-full"
                      />
                    )}
                    {isBo3Game(map?.game?.shortName) && (
                      <>
                        <Select
                          label="GobbleGums"
                          options={BO3_GOBBLEGUM_MODES.map((m) => ({ value: m, label: getBo3GobbleGumLabel(m) }))}
                          value={sharedChallengeForm.bo3GobbleGumMode ?? BO3_GOBBLEGUM_DEFAULT}
                          onChange={(e) => handleSharedChallengeChange('bo3GobbleGumMode', e.target.value)}
                        />
                        {!Array.from(selectedChallengeIds).some(
                          (cid) => map?.challenges.find((c) => c.id === cid)?.type === 'NO_ATS'
                        ) && (
                          <Select
                            label="AATs"
                            options={[
                              { value: '', label: 'Any' },
                              { value: 'true', label: 'AATs Used' },
                              { value: 'false', label: 'No AATs' },
                            ]}
                            value={
                              sharedChallengeForm.bo3AatUsed === true
                                ? 'true'
                                : sharedChallengeForm.bo3AatUsed === false
                                  ? 'false'
                                  : ''
                            }
                            onChange={(e) =>
                              handleSharedChallengeChange(
                                'bo3AatUsed',
                                e.target.value === '' ? undefined : e.target.value === 'true'
                              )
                            }
                          />
                        )}
                      </>
                    )}
                    {map?.game?.shortName === 'BO4' && (
                      <Select
                        label="Elixirs / Talismans"
                        options={[
                          { value: 'CLASSIC_ONLY', label: 'Classic Elixirs Only' },
                          { value: 'ALL_ELIXIRS_TALISMANS', label: 'All Elixirs & Talismans' },
                        ]}
                        value={sharedChallengeForm.bo4ElixirMode ?? ''}
                        onChange={(e) => handleSharedChallengeChange('bo4ElixirMode', e.target.value || undefined)}
                        placeholder="Optional"
                      />
                    )}
                    {isBocwGame(map?.game?.shortName) && (
                      <Select
                        label="Support"
                        options={BOCW_SUPPORT_MODES.map((m) => ({ value: m, label: getBocwSupportLabel(m) }))}
                        value={sharedChallengeForm.bocwSupportMode ?? BOCW_SUPPORT_DEFAULT}
                        onChange={(e) => handleSharedChallengeChange('bocwSupportMode', e.target.value)}
                      />
                    )}
                    {isBo6Game(map?.game?.shortName) && (
                      <>
                        <Select
                          label="GobbleGums"
                          options={BO6_GOBBLEGUM_MODES.map((m) => ({ value: m, label: getBo6GobbleGumLabel(m) }))}
                          value={sharedChallengeForm.bo6GobbleGumMode ?? BO6_GOBBLEGUM_DEFAULT}
                          onChange={(e) => handleSharedChallengeChange('bo6GobbleGumMode', e.target.value)}
                        />
                        <Select
                          label="Support"
                          options={BO6_SUPPORT_MODES.map((m) => ({ value: m, label: getBo6SupportLabel(m) }))}
                          value={sharedChallengeForm.bo6SupportMode ?? BO6_SUPPORT_DEFAULT}
                          onChange={(e) => handleSharedChallengeChange('bo6SupportMode', e.target.value)}
                        />
                      </>
                    )}
                    {((isBocwGame(map?.game?.shortName) || isBo6Game(map?.game?.shortName) || isBo7Game(map?.game?.shortName) || (isVanguardGame(map?.game?.shortName) && hasVanguardRampageFilter(map?.slug))) && (
                      <Select
                        label="Rampage Inducer"
                        options={[
                          { value: 'false', label: 'No Rampage Inducer' },
                          { value: 'true', label: 'Rampage Inducer' },
                        ]}
                        value={sharedChallengeForm.rampageInducerUsed === true ? 'true' : 'false'}
                        onChange={(e) => handleSharedChallengeChange('rampageInducerUsed', e.target.value === 'true')}
                      />
                    ))}
                    {isBo7Game(map?.game?.shortName) && (
                      <>
                        <Select
                          label="Support"
                          options={BO7_SUPPORT_MODES.map((m) => ({ value: m, label: getBo7SupportLabel(m) }))}
                          value={sharedChallengeForm.bo7SupportMode ?? BO7_SUPPORT_DEFAULT}
                          onChange={(e) => handleSharedChallengeChange('bo7SupportMode', e.target.value)}
                        />
                        <label className="flex items-center gap-2 cursor-pointer self-end pb-2 sm:pb-0">
                          <input
                            type="checkbox"
                            checked={sharedChallengeForm.bo7IsCursedRun ?? false}
                            onChange={(e) => {
                              handleSharedChallengeChange('bo7IsCursedRun', e.target.checked);
                              if (!e.target.checked) handleSharedChallengeChange('bo7RelicsUsed', []);
                            }}
                            className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500"
                          />
                          <span className="text-sm text-bunker-300">Cursed Run</span>
                        </label>
                        {sharedChallengeForm.bo7IsCursedRun && (
                          <div className="flex flex-col gap-1 self-end">
                            <span className="text-xs text-bunker-400">Relics used</span>
                            <Bo7RelicPicker
                              value={sharedChallengeForm.bo7RelicsUsed ?? []}
                              onChange={(relics) => handleSharedChallengeChange('bo7RelicsUsed', relics)}
                              placeholder="None (0 relics)"
                              className="w-48"
                            />
                          </div>
                        )}
                      </>
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

                  {/* Per-speedrun time inputs (one per selected speedrun) */}
                  {(() => {
                    const selectedSpeedrunChallenges = Array.from(selectedChallengeIds)
                      .map((cid) => map.challenges.find((c) => c.id === cid))
                      .filter((c): c is NonNullable<typeof c> => !!c && isSpeedrunChallengeType(c.type));
                    const hasNonSpeedrun = Array.from(selectedChallengeIds).some((cid) => {
                      const c = map.challenges.find((ch) => ch.id === cid);
                      return c && !isSpeedrunChallengeType(c.type);
                    });
                    return (
                      <>
                        {selectedSpeedrunChallenges.map((c) => (
                          <div key={c.id} className="mt-3 sm:mt-4">
                            <TimeInput
                              label={`${challengeTypeLabels[c.type as keyof typeof challengeTypeLabels] ?? c.name} — Time (required)`}
                              valueSeconds={speedrunTimes[c.id] ?? null}
                              onChange={(seconds) => setSpeedrunTimes((prev) => ({ ...prev, [c.id]: seconds }))}
                            />
                          </div>
                        ))}
                        {(hasNonSpeedrun || selectedSpeedrunChallenges.length === 0) && (
                          <div className="mt-3 sm:mt-4">
                            <TimeInput
                              label={selectedSpeedrunChallenges.length === 0 ? 'Run time (optional)' : 'Non-speedrun run time (optional)'}
                              valueSeconds={sharedChallengeForm.completionTimeSeconds}
                              onChange={(seconds) => handleSharedChallengeChange('completionTimeSeconds', seconds)}
                            />
                          </div>
                        )}
                      </>
                    );
                  })()}

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
                saveDisabled={
                  (() => {
                    const isNoMansLandOnly =
                      selectedChallengeIds.size === 1 &&
                      map?.challenges.find((c) => c.id === Array.from(selectedChallengeIds)[0])?.type === 'NO_MANS_LAND';
                    const isRushOnly =
                      selectedChallengeIds.size === 1 &&
                      map?.challenges.find((c) => c.id === Array.from(selectedChallengeIds)[0])?.type === 'RUSH';
                    const hasValidRound = sharedChallengeForm.roundReached && parseInt(sharedChallengeForm.roundReached, 10) > 0;
                    const hasValidKills = isNoMansLandOnly &&
                      sharedChallengeForm.killsReached &&
                      parseInt(sharedChallengeForm.killsReached, 10) > 0;
                    const hasValidScore = isRushOnly &&
                      sharedChallengeForm.scoreReached &&
                      parseInt(sharedChallengeForm.scoreReached, 10) > 0;
                    const roundOrKillsOrScoreOk = isNoMansLandOnly ? hasValidKills : isRushOnly ? hasValidScore : hasValidRound;
                    return (
                      !roundOrKillsOrScoreOk ||
                      (isIwGame(map?.game?.shortName) && sharedChallengeForm.useFortuneCards !== true && sharedChallengeForm.useFortuneCards !== false) ||
                      Array.from(selectedChallengeIds).some((cid) => {
                        const c = map?.challenges.find((ch) => ch.id === cid);
                        return c && isSpeedrunChallengeType(c.type) && !(speedrunTimes[cid] != null && (speedrunTimes[cid] as number) > 0);
                      })
                    );
                  })()
                }
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
                        {(isBocwGame(map?.game?.shortName) || isBo6Game(map?.game?.shortName) || isBo7Game(map?.game?.shortName) || (isVanguardGame(map?.game?.shortName) && hasVanguardRampageFilter(map?.slug))) && (
                          <Select
                            label="Rampage Inducer"
                            options={[
                              { value: 'false', label: 'No Rampage Inducer' },
                              { value: 'true', label: 'Rampage Inducer' },
                            ]}
                            value={easterEggForms[ee.id]?.rampageInducerUsed === true ? 'true' : 'false'}
                            onChange={(e) =>
                              handleEasterEggChange(ee.id, 'rampageInducerUsed', e.target.value === 'true')
                            }
                          />
                        )}
                        {isVanguardGame(map?.game?.shortName) && hasVanguardVoidFilter(map?.slug) && (
                          <Select
                            label="Void"
                            options={[
                              { value: 'true', label: 'With Void (default)' },
                              { value: 'false', label: 'Without Void' },
                            ]}
                            value={easterEggForms[ee.id]?.vanguardVoidUsed === true ? 'true' : 'false'}
                            onChange={(e) =>
                              handleEasterEggChange(ee.id, 'vanguardVoidUsed', e.target.value === 'true')
                            }
                          />
                        )}
                        {isWw2Game(map?.game?.shortName) && (
                          <Select
                            label="Consumables"
                            options={[
                              { value: 'true', label: 'With Consumables (default)' },
                              { value: 'false', label: 'No Consumables' },
                            ]}
                            value={easterEggForms[ee.id]?.ww2ConsumablesUsed === true ? 'true' : 'false'}
                            onChange={(e) =>
                              handleEasterEggChange(ee.id, 'ww2ConsumablesUsed', e.target.value === 'true')
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
