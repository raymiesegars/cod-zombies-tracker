'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { dispatchXpToast } from '@/context/xp-toast-context';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  Logo,
  EasterEggIcon,
  Modal,
  PageLoader,
  HelpTrigger,
} from '@/components/ui';
import { RoundCounter, LeaderboardEntry, RelockAchievementButton, ChallengeTypeIcon, MapChallengesEeHelpContent } from '@/components/game';
import { getPlayerCountLabel, cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/assets';
import { getBo4DifficultyLabel, BO4_DIFFICULTIES } from '@/lib/bo4';
import { isIwGame, isIwSpeedrunChallengeType, IW_CHALLENGE_TYPES_ORDER } from '@/lib/iw';
import { formatCompletionTime } from '@/components/ui/time-input';
import type { MapWithDetails, LeaderboardEntry as LeaderboardEntryType, PlayerCount, ChallengeType } from '@/types';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Trophy,
  Target,
  Users,
  Edit,
  Check,
  CheckCircle2,
  Lock,
  Award,
  RotateCcw,
  ListChecks,
  Filter,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  getAchievementCategory,
  getSortedCategoryKeys,
  getNonSpeedrunCategoryFilterOptions,
  getSpeedrunCategoryFilterOptions,
  isSpeedrunCategory,
} from '@/lib/achievements/categories';

const BUILDABLE_PART_CACHE_KEY_PREFIX = 'buildable-parts';
const BUILDABLE_PART_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function getBuildablePartCacheKey(mapSlug: string, buildableId: string) {
  return `${BUILDABLE_PART_CACHE_KEY_PREFIX}-${mapSlug}-${buildableId}`;
}

function readBuildablePartCache(mapSlug: string, buildableId: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(getBuildablePartCacheKey(mapSlug, buildableId));
    if (!raw) return {};
    const data = JSON.parse(raw) as { expiresAt?: number; parts?: Record<string, boolean> };
    if (data.expiresAt != null && Date.now() > data.expiresAt) {
      localStorage.removeItem(getBuildablePartCacheKey(mapSlug, buildableId));
      return {};
    }
    return data.parts ?? {};
  } catch {
    return {};
  }
}

function writeBuildablePartCache(
  mapSlug: string,
  buildableId: string,
  parts: Record<string, boolean>
) {
  if (typeof window === 'undefined') return;
  try {
    const key = getBuildablePartCacheKey(mapSlug, buildableId);
    localStorage.setItem(
      key,
      JSON.stringify({ expiresAt: Date.now() + BUILDABLE_PART_CACHE_TTL_MS, parts })
    );
  } catch {
    // ignore
  }
}

type BuildableStep = { id: string; order: number; label: string; imageUrl?: string | null };

function parseBuildableSteps(steps: BuildableStep[]): {
  intro: BuildableStep | null;
  craftingTable: BuildableStep | null;
  craftingTableLocationSteps: BuildableStep[];
  parts: { partName: string; steps: BuildableStep[] }[];
} {
  if (!steps.length) return { intro: null, craftingTable: null, craftingTableLocationSteps: [], parts: [] };
  const ordered = [...steps].sort((a, b) => a.order - b.order);
  const first = ordered[0];
  const isIntro =
    (first?.label?.toLowerCase().startsWith('how it works:') ||
      first?.label?.toLowerCase().startsWith('overview:')) ?? false;
  const intro = isIntro ? first : null;
  let afterIntro = isIntro ? ordered.slice(1) : ordered;
  const next = afterIntro[0];
  const isCraftingFirst =
    next?.label?.toLowerCase().startsWith('crafting table:') ?? false;
  const craftingTable = isCraftingFirst ? next : null;
  const rest = isCraftingFirst ? afterIntro.slice(1) : afterIntro;

  const partMap = new Map<string, BuildableStep[]>();
  const craftingTableLocationSteps: BuildableStep[] = [];
  for (const step of rest) {
    const colon = step.label.indexOf(':');
    const partName = colon >= 0 ? step.label.slice(0, colon).trim() : `Step ${step.order}`;
    const locationLabel = colon >= 0 ? step.label.slice(colon + 1).trim() : step.label;
    const entry = { ...step, label: locationLabel };
    if (partName.toLowerCase() === 'crafting table') {
      craftingTableLocationSteps.push(entry);
    } else {
      if (!partMap.has(partName)) partMap.set(partName, []);
      partMap.get(partName)!.push(entry);
    }
  }
  const parts = Array.from(partMap.entries()).map(([partName, partSteps]) => ({
    partName,
    steps: partSteps,
  }));
  return { intro, craftingTable, craftingTableLocationSteps, parts };
}

// Buildable text: newlines → bullet list, else one paragraph.
function BuildableText({ text, className = 'text-sm text-bunker-300' }: { text: string; className?: string }) {
  const lines = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length <= 1) {
    return <p className={className}>{text.trim()}</p>;
  }
  return (
    <ul className={`${className} space-y-1 list-none pl-0`}>
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-bunker-500 flex-shrink-0 select-none">•</span>
          <span>{line.replace(/^[•\-]\s*/, '')}</span>
        </li>
      ))}
    </ul>
  );
}

function useBuildablePartProgress(mapSlug: string, buildableId: string | null) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!mapSlug || !buildableId) {
      setChecked({});
      return;
    }
    setChecked(readBuildablePartCache(mapSlug, buildableId));
  }, [mapSlug, buildableId]);
  const setPartChecked = useCallback(
    (partName: string, value: boolean) => {
      if (!buildableId) return;
      setChecked((prev) => {
        const next = { ...prev, [partName]: value };
        writeBuildablePartCache(mapSlug, buildableId, next);
        return next;
      });
    },
    [mapSlug, buildableId]
  );
  return { checkedParts: checked, setPartChecked };
}

function AchievementsTabContent({
  achievements,
  unlockedIds,
  canRelock,
  onRelock,
  gameShortName,
}: {
  achievements?: { id: string; name: string; slug: string; type: string; difficulty?: string | null; criteria: { round?: number; challengeType?: string; isCap?: boolean }; xpReward: number; rarity: string; easterEggId?: string | null; easterEgg?: { id: string; name: string; slug: string } | null }[];
  unlockedIds?: string[];
  canRelock?: boolean;
  onRelock?: () => void | Promise<void>;
  gameShortName?: string;
}) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [speedrunFilter, setSpeedrunFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');

  const isBo4 = gameShortName === 'BO4';
  const achievementsBeforeTypeFilter = isBo4 && difficultyFilter
    ? (achievements ?? []).filter((a) => (a as { difficulty?: string | null }).difficulty === difficultyFilter)
    : (achievements ?? []);

  let achievementsFiltered = achievementsBeforeTypeFilter;
  if (categoryFilter) {
    achievementsFiltered = achievementsFiltered.filter((a) => getAchievementCategory(a) === categoryFilter);
  }
  if (speedrunFilter) {
    achievementsFiltered = achievementsFiltered.filter((a) => getAchievementCategory(a) === speedrunFilter);
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <Award className="w-10 h-10 sm:w-12 sm:h-12 text-bunker-600 mx-auto mb-4" />
        <p className="text-bunker-400 text-sm sm:text-base">No achievements for this map yet.</p>
      </div>
    );
  }

  const unlockedSet = new Set(unlockedIds ?? []);
  const byCategory = achievementsFiltered.reduce<Record<string, typeof achievementsFiltered>>((acc, a) => {
    const cat = getAchievementCategory(a);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  const sortedCategories = getSortedCategoryKeys(byCategory as Record<string, unknown[]>);
  const visibleCategories =
    categoryFilter ? (sortedCategories.includes(categoryFilter) ? [categoryFilter] : sortedCategories)
    : speedrunFilter ? (sortedCategories.includes(speedrunFilter) ? [speedrunFilter] : sortedCategories)
    : sortedCategories;

  const byCategoryForOptions = achievementsBeforeTypeFilter.reduce<Record<string, typeof achievementsBeforeTypeFilter>>((acc, a) => {
    const cat = getAchievementCategory(a);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});
  const sortedCategoriesForOptions = getSortedCategoryKeys(byCategoryForOptions as Record<string, unknown[]>);
  const nonSpeedrunCatsForOptions = sortedCategoriesForOptions.filter((c) => !isSpeedrunCategory(c));
  const speedrunCatsForOptions = sortedCategoriesForOptions.filter((c) => isSpeedrunCategory(c));
  const categoryOptions = getNonSpeedrunCategoryFilterOptions(nonSpeedrunCatsForOptions.length ? nonSpeedrunCatsForOptions : undefined);
  const speedrunOptions = getSpeedrunCategoryFilterOptions(speedrunCatsForOptions.length ? speedrunCatsForOptions : undefined);

  const visibleCount = visibleCategories.reduce((sum, cat) => sum + (byCategory[cat]?.length ?? 0), 0);
  const filterEmpty =
    (categoryFilter && visibleCount === 0) ||
    (speedrunFilter && visibleCount === 0) ||
    (isBo4 && difficultyFilter && achievementsFiltered.length === 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-xs font-medium text-bunker-400 w-full sm:w-auto">Filter by type:</span>
        <Select
          options={categoryOptions}
          value={categoryFilter ?? ''}
          onChange={(e) => {
            setCategoryFilter(e.target.value || null);
            if (e.target.value) setSpeedrunFilter('');
          }}
          className="w-full min-w-0 sm:w-48 max-w-full"
        />
        {speedrunOptions.length > 1 && (
          <>
            <span className="text-xs font-medium text-bunker-400 w-full sm:w-auto">Speedruns:</span>
            <Select
              options={speedrunOptions}
              value={speedrunFilter}
              onChange={(e) => {
                setSpeedrunFilter(e.target.value || '');
                if (e.target.value) setCategoryFilter(null);
              }}
              className="w-full min-w-0 sm:w-44 max-w-full"
            />
          </>
        )}
        {isBo4 && (
          <>
            <span className="text-xs font-medium text-bunker-400 w-full sm:w-auto mt-2 sm:mt-0">Difficulty:</span>
            <Select
              options={[
                { value: '', label: 'All' },
                ...BO4_DIFFICULTIES.map((d) => ({ value: d, label: getBo4DifficultyLabel(d) })),
              ]}
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full min-w-0 sm:w-40 max-w-full"
            />
          </>
        )}
      </div>

      {filterEmpty ? (
        <div className="text-center py-8 sm:py-12">
          <Award className="w-10 h-10 sm:w-12 sm:h-12 text-bunker-600 mx-auto mb-4" />
          <p className="text-bunker-400 text-sm sm:text-base">
            {isBo4 && difficultyFilter && achievementsFiltered.length === 0
              ? `No achievements for ${getBo4DifficultyLabel(difficultyFilter)} yet.`
              : `No ${(ACHIEVEMENT_CATEGORY_LABELS[categoryFilter || speedrunFilter || ''] ?? (categoryFilter || speedrunFilter || '')).toLowerCase()} achievements on this map.`}
          </p>
        </div>
      ) : (
      <div className="space-y-6 sm:space-y-8">
      {visibleCategories.map((cat) => (
        <Card key={cat} variant="bordered">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              {ACHIEVEMENT_CATEGORY_LABELS[cat] ?? cat}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4 pl-6 pr-2">
            <ul className="space-y-2 min-w-0 w-full">
              {(byCategory[cat]!).map((a) => {
                const unlocked = unlockedSet.has(a.id);
                const c = a.criteria as { round?: number; isCap?: boolean; maxTimeSeconds?: number };
                const subLabel = c.isCap ? 'Cap' : c.round != null ? `Round ${c.round}` : null;
                const maxTime = c.maxTimeSeconds != null ? formatCompletionTime(c.maxTimeSeconds) : null;
                const displayName = (a as { easterEgg?: { name: string } | null }).easterEgg?.name ?? a.name;
                return (
                  <li
                    key={a.id}
                    className={unlocked
                      ? 'grid grid-cols-[1fr_auto] items-center gap-x-3 py-2 pl-3 pr-1 rounded-lg bg-military-950/30 border border-military-800/50 min-w-0'
                      : 'grid grid-cols-[1fr_auto] items-center gap-x-3 py-2 pl-3 pr-1 rounded-lg bg-bunker-800/30 border border-bunker-700/50 min-w-0'
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0 min-h-[2.75rem] overflow-hidden">
                      {unlocked ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-military-400" />
                      ) : (
                        <Lock className="w-5 h-5 flex-shrink-0 text-bunker-500" />
                      )}
                      <div className={`min-w-0 flex flex-col justify-center overflow-hidden ${subLabel ? 'min-h-[2.25rem]' : ''}`}>
                        <p className="font-medium text-sm text-white truncate">{displayName}</p>
                        {subLabel && (
                          <p className="text-xs text-bunker-400">{subLabel}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 w-max min-w-0 shrink-0">
                      <span className="text-sm font-medium text-blood-400 whitespace-nowrap">+{a.xpReward.toLocaleString()} XP</span>
                      <span className="w-8 flex shrink-0 justify-center">
                        {canRelock && unlocked ? (
                          <RelockAchievementButton
                            achievementId={a.id}
                            achievementName={displayName}
                            xpReward={a.xpReward}
                            onRelocked={async () => {
                              await onRelock?.();
                            }}
                            className="p-1 rounded hover:bg-bunker-700"
                          />
                        ) : (
                          <span className="w-5 h-5 block" aria-hidden />
                        )}
                      </span>
                      {maxTime != null && (
                        <span className="text-sm font-zombies text-element-400 tabular-nums whitespace-nowrap flex-shrink-0" aria-label={`Time: ${maxTime}`}>
                          {maxTime}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ))}
      </div>
      )}
    </div>
  );
}

const challengeTypeLabels: Record<string, string> = {
  HIGHEST_ROUND: 'Highest Round',
  NO_DOWNS: 'No Downs',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  STARTING_ROOM: 'Starting Room Only',
  ONE_BOX: 'One Box Challenge',
  PISTOL_ONLY: 'Pistol Only',
  NO_POWER: 'No Power',
  ROUND_30_SPEEDRUN: 'Round 30 Speedrun',
  ROUND_50_SPEEDRUN: 'Round 50 Speedrun',
  ROUND_70_SPEEDRUN: 'Round 70 Speedrun',
  ROUND_100_SPEEDRUN: 'Round 100 Speedrun',
  EASTER_EGG_SPEEDRUN: 'Easter Egg Speedrun',
  GHOST_AND_SKULLS: 'Ghost and Skulls',
  ALIENS_BOSS_FIGHT: 'Aliens Boss Fight',
};

type StepSection = { heading?: string; lines: string[] };

// Pull title + sections from step text. Supports "[Heading]:" or legacy **Heading:** (we strip the markers in UI).
function formatStepLabel(label: string): { title: string | null; sections: StepSection[] } {
  const nodeMatch = label.match(/^(Node \d+):\s*([\s\S]*)$/);
  const stepMatch = !nodeMatch && label.match(/^(Step \d+):\s*([\s\S]*)$/);
  const match = nodeMatch ?? stepMatch;
  const body = match ? match[2].trim() : label;
  const title = match ? match[1].trim() : null;

  const sectionMarker = /\s*(?:\[([^\]]+)\]\s*:\s*|\*\*([^*]+)\*\*:\s*)/g;
  const hasMarkers = sectionMarker.test(body);
  sectionMarker.lastIndex = 0;

  if (hasMarkers) {
    const splitPattern = /\s*(?:\[[^\]]+\]\s*:\s*|\*\*[^*]+\*\*:\s*)/g;
    const parts = body.split(splitPattern).filter(Boolean);
    const headings = Array.from(body.matchAll(/\s*(?:\[([^\]]+)\]\s*:\s*|\*\*([^*]+)\*\*:\s*)/g)).map((m) => (m[1] ?? m[2] ?? '').trim());
    const sections: StepSection[] = [];
    // Don't split on "e.g." or "i.e."
    const sentenceSplit = /(?<=[.!])\s+(?![a-z]|\d)/;
    parts.forEach((block, i) => {
      const heading = headings[i] ?? null;
      const lines = block
        .split(sentenceSplit)
        .map((s) => s.trim())
        .filter(Boolean);
      if (lines.length > 0) sections.push({ heading: heading ?? undefined, lines });
    });
    return { title, sections };
  }

  // No section markers – first sentence = key action, rest = details
  const sentenceSplit = /(?<=[.!])\s+(?![a-z]|\d)/;
  const sentences = body
    .split(sentenceSplit)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return { title, sections: [{ lines: [body] }] };
  if (sentences.length === 1) return { title, sections: [{ lines: sentences }] };
  return {
    title,
    sections: [
      { heading: 'What to do', lines: [sentences[0]] },
      { heading: 'Details', lines: sentences.slice(1) },
    ],
  };
}

type MapDetailPageProps = {
  initialMap?: (MapWithDetails & { unlockedAchievementIds?: string[] }) | null;
  initialMapStats?: {
    easterEggCompletions: Record<string, number>;
    totalPlayers: number;
    highestRound: number;
  } | null;
};

export default function MapDetailClient({ initialMap = null, initialMapStats = null }: MapDetailPageProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { profile, refreshProfile } = useAuth();
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'your-runs' ? 'your-runs' : 'overview';

  const [map, setMap] = useState<MapWithDetails | null>(initialMap ?? null);
  const [refreshMapCounter, setRefreshMapCounter] = useState(0);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryType[]>([]);
  const [leaderboardFetchedOnce, setLeaderboardFetchedOnce] = useState(false);
  const [mapStats, setMapStats] = useState<{
    easterEggCompletions: Record<string, number>;
    totalPlayers: number;
    highestRound: number;
  } | null>(initialMapStats ?? null);
  const [isLoading, setIsLoading] = useState(!initialMap);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  // EE step checkboxes (synced when logged in)
  const [eeProgress, setEeProgress] = useState<{
    checkedStepIds: string[];
    mainEeXpAwardedEasterEggIds: string[];
  }>({ checkedStepIds: [], mainEeXpAwardedEasterEggIds: [] });
  const [eeProgressLoading, setEeProgressLoading] = useState(false);
  const [togglingStepId, setTogglingStepId] = useState<string | null>(null);
  const [openEasterEggIds, setOpenEasterEggIds] = useState<Set<string>>(new Set());
  const [eeCategoryFilter, setEeCategoryFilter] = useState<'' | 'MAIN_QUEST' | 'SIDE_QUEST' | 'MUSICAL' | 'BUILDABLE' | 'CIPHER' | 'WEARABLE' | 'RELIC' | 'FREE_POWERUP'>('');
  const [selectedBuildableId, setSelectedBuildableId] = useState<string | null>(null);
  const [buildableOpenParts, setBuildableOpenParts] = useState<Set<string>>(new Set());
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const { checkedParts: buildableCheckedParts, setPartChecked: setBuildablePartChecked } =
    useBuildablePartProgress(slug, selectedBuildableId ?? null);

  const [selectedPlayerCount, setSelectedPlayerCount] = useState<PlayerCount | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('NORMAL');
  /** Same as Leaderboards page: 'HIGHEST_ROUND', challenge type, or 'ee-time-{easterEggId}' */
  const [selectedLeaderboardCategory, setSelectedLeaderboardCategory] = useState<string>('HIGHEST_ROUND');
  const [leaderboardVerifiedOnly, setLeaderboardVerifiedOnly] = useState(false);
  const [leaderboardFortuneCards, setLeaderboardFortuneCards] = useState<string>('false'); // 'false' = Fate only (default), 'true' = Fate & Fortune
  const [leaderboardDirectorsCut, setLeaderboardDirectorsCut] = useState(false);
  const leaderboardSlugRef = useRef<string | null>(null);

  // Your runs for this map when logged in; URL ?tab=your-runs triggers fetch on load
  const [myRunsData, setMyRunsData] = useState<{
    challengeLogs: Array<{ id: string; mapId: string; roundReached: number; playerCount: string; difficulty?: string | null; completedAt: string; completionTimeSeconds: number | null; notes: string | null; challenge: { name: string; type: string }; map: { slug: string } }>;
    easterEggLogs: Array<{ id: string; mapId: string; roundCompleted: number | null; playerCount: string; difficulty?: string | null; isSolo: boolean; completedAt: string; completionTimeSeconds: number | null; notes: string | null; easterEgg: { name: string }; map: { slug: string } }>;
  } | null>(null);
  const [myRunsLoading, setMyRunsLoading] = useState(false);
  const [myRunsFilterType, setMyRunsFilterType] = useState('');

  // Sync when server passes new data (e.g. client nav to another map)
  useEffect(() => {
    if (initialMap != null) {
      setMap(initialMap);
      setMapStats(initialMapStats ?? null);
      setIsLoading(false);
    }
  }, [initialMap, initialMapStats]);

  // After redirect from edit page (e.g. after logging EE), refetch map + profile so achievements update without manual refresh
  useEffect(() => {
    if (searchParams.get('achievementUpdated') !== '1') return;
    setRefreshMapCounter((c) => c + 1);
    refreshProfile?.();
    const u = new URLSearchParams(searchParams.toString());
    u.delete('achievementUpdated');
    const next = u.toString() ? `?${u.toString()}` : window.location.pathname;
    router.replace(next, { scroll: false });
  }, [searchParams, router, refreshProfile]);

  // Refetch only when user triggers refresh (not on initial load when we have server data)
  useEffect(() => {
    if (initialMap != null && refreshMapCounter === 0) return;
    async function fetchMap() {
      try {
        const [mapRes, statsRes] = await Promise.all([
          fetch(`/api/maps/${slug}`),
          fetch(`/api/maps/${slug}/stats`),
        ]);
        if (mapRes.ok) {
          const data = await mapRes.json();
          setMap(data);
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setMapStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching map:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMap();
  }, [slug, refreshMapCounter, initialMap]);

  // Leaderboard – round (high round) or EE completion time
  useEffect(() => {
    if (!map) return;

    const isNewMap = leaderboardSlugRef.current !== slug;
    if (isNewMap) {
      leaderboardSlugRef.current = slug;
      setSelectedLeaderboardCategory('HIGHEST_ROUND');
    }

    setLeaderboard([]);
    setLeaderboardFetchedOnce(false);
    setIsLeaderboardLoading(true);

    const isEeTimeView = selectedLeaderboardCategory.startsWith('ee-time-');
    const eeId = isEeTimeView ? selectedLeaderboardCategory.replace(/^ee-time-/, '') : null;

    (async () => {
      try {
        if (isEeTimeView && eeId) {
          const params = new URLSearchParams();
          params.set('easterEggId', eeId);
          if (selectedPlayerCount) params.set('playerCount', selectedPlayerCount);
          if (map.game?.shortName === 'BO4' && selectedDifficulty) params.set('difficulty', selectedDifficulty);
          if (leaderboardVerifiedOnly) params.set('verified', 'true');
          const res = await fetch(`/api/maps/${slug}/easter-egg-leaderboard?${params}`);
          if (res.ok) {
            const data = await res.json();
            setLeaderboard(data.entries ?? []);
          }
        } else {
          const params = new URLSearchParams();
          if (selectedPlayerCount) params.set('playerCount', selectedPlayerCount);
          const challengeType = selectedLeaderboardCategory === 'HIGHEST_ROUND' ? '' : selectedLeaderboardCategory;
          if (challengeType) params.set('challengeType', challengeType);
          if (map.game?.shortName === 'BO4' && selectedDifficulty) params.set('difficulty', selectedDifficulty);
          if (leaderboardVerifiedOnly) params.set('verified', 'true');
          if (map.game?.shortName === 'IW') {
            if (leaderboardFortuneCards === 'true') params.set('fortuneCards', 'true');
            else if (leaderboardFortuneCards === 'false') params.set('fortuneCards', 'false');
            if (leaderboardDirectorsCut) params.set('directorsCut', 'true');
          }
          const res = await fetch(`/api/maps/${slug}/leaderboard?${params}`);
          if (res.ok) {
            const data = await res.json();
            setLeaderboard(data.entries ?? []);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLeaderboardLoading(false);
        setLeaderboardFetchedOnce(true);
      }
    })();
    // Intentionally omit leaderboard.length / leaderboardFetchedOnce to avoid re-fetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, slug, selectedLeaderboardCategory, selectedPlayerCount, selectedDifficulty, leaderboardVerifiedOnly, leaderboardFortuneCards, leaderboardDirectorsCut]);

  // Sync activeTab with URL so switching to Your Runs triggers fetch
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load current user's runs for this map when Your Runs tab is active
  useEffect(() => {
    if (activeTab !== 'your-runs' || !profile || !map) return;
    setMyRunsLoading(true);
    const mapId = encodeURIComponent(map.id);
    fetch(`/api/me/logs?mapId=${mapId}`, { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { challengeLogs: [], easterEggLogs: [] }))
      .then((data) => {
        setMyRunsData({
          challengeLogs: data.challengeLogs ?? [],
          easterEggLogs: data.easterEggLogs ?? [],
        });
      })
      .catch(() => setMyRunsData({ challengeLogs: [], easterEggLogs: [] }))
      .finally(() => setMyRunsLoading(false));
    // Stable deps: map?.id and profile to avoid re-run on object reference change only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, profile, map?.id]);

  const myRunsTypeOptions = useMemo(() => {
    if (!myRunsData) return [{ value: '', label: 'All run types' }];
    const names = new Set<string>();
    myRunsData.challengeLogs.forEach((l) => names.add(l.challenge.name));
    myRunsData.easterEggLogs.forEach((l) => names.add(l.easterEgg.name));
    const sorted = Array.from(names).sort((a, b) => a.localeCompare(b));
    return [
      { value: '', label: 'All run types' },
      ...sorted.map((n) => ({ value: n, label: n })),
    ];
  }, [myRunsData]);

  const filteredMyChallengeLogs = useMemo(() => {
    if (!myRunsData) return [];
    if (!myRunsFilterType) return myRunsData.challengeLogs;
    return myRunsData.challengeLogs.filter((l) => l.challenge.name === myRunsFilterType);
  }, [myRunsData, myRunsFilterType]);

  const filteredMyEasterEggLogs = useMemo(() => {
    if (!myRunsData) return [];
    if (!myRunsFilterType) return myRunsData.easterEggLogs;
    return myRunsData.easterEggLogs.filter((l) => l.easterEgg.name === myRunsFilterType);
  }, [myRunsData, myRunsFilterType]);

  // All runs (challenge + EE) for this map, newest first
  const myRunsChronological = useMemo(() => {
    const withDate = [
      ...filteredMyChallengeLogs.map((log) => ({ kind: 'challenge' as const, completedAt: log.completedAt, log })),
      ...filteredMyEasterEggLogs.map((log) => ({ kind: 'easterEgg' as const, completedAt: log.completedAt, log })),
    ];
    return withDate.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [filteredMyChallengeLogs, filteredMyEasterEggLogs]);

  const totalMyRuns = filteredMyChallengeLogs.length + filteredMyEasterEggLogs.length;

  // EEs in order: Main Quest, Musical, Side, Buildables
  const sortedEasterEggs = useMemo(() => {
    if (!map?.easterEggs?.length) return [];
    const order = { MAIN_QUEST: 0, MUSICAL: 1, SIDE_QUEST: 2, BUILDABLE: 3 } as const;
    return [...map.easterEggs].sort((a, b) => {
      const aOrd = order[a.type as keyof typeof order] ?? 4;
      const bOrd = order[b.type as keyof typeof order] ?? 4;
      return aOrd - bOrd;
    });
  }, [map?.easterEggs]);

  const buildables = useMemo(
    () => sortedEasterEggs.filter((ee) => ee.type === 'BUILDABLE'),
    [sortedEasterEggs]
  );

  const availableEeCategories = useMemo(() => {
    if (!map?.easterEggs?.length) return [];
    const set = new Set(map.easterEggs.map((ee) => ee.type));
    const order = ['MAIN_QUEST', 'MUSICAL', 'SIDE_QUEST', 'BUILDABLE'] as const;
    return order.filter((t) => set.has(t));
  }, [map?.easterEggs]);

  const easterEggsOnly = useMemo(
    () => sortedEasterEggs.filter((ee) => ee.type !== 'BUILDABLE'),
    [sortedEasterEggs]
  );

  const filteredEasterEggs = useMemo(() => {
    if (!eeCategoryFilter) return sortedEasterEggs;
    if (eeCategoryFilter === 'CIPHER') return sortedEasterEggs.filter((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Cipher');
    if (eeCategoryFilter === 'WEARABLE') return sortedEasterEggs.filter((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Wearable');
    if (eeCategoryFilter === 'RELIC') return sortedEasterEggs.filter((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Relic');
    if (eeCategoryFilter === 'FREE_POWERUP') return sortedEasterEggs.filter((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Free Powerup');
    return sortedEasterEggs.filter((ee) => ee.type === eeCategoryFilter);
  }, [sortedEasterEggs, eeCategoryFilter]);

  // Left column on large screens: eggs list (same filter, no buildables)
  const filteredEasterEggsLeft = useMemo(() => {
    if (!eeCategoryFilter || eeCategoryFilter === 'BUILDABLE') return easterEggsOnly;
    if (eeCategoryFilter === 'CIPHER') return easterEggsOnly.filter((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Cipher');
    if (eeCategoryFilter === 'WEARABLE') return easterEggsOnly.filter((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Wearable');
    if (eeCategoryFilter === 'RELIC') return easterEggsOnly.filter((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Relic');
    if (eeCategoryFilter === 'FREE_POWERUP') return easterEggsOnly.filter((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Free Powerup');
    return easterEggsOnly.filter((ee) => ee.type === eeCategoryFilter);
  }, [easterEggsOnly, eeCategoryFilter]);

  const hasCipherEasterEggs = useMemo(
    () => map?.easterEggs?.some((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Cipher') ?? false,
    [map?.easterEggs]
  );

  const hasWearableEasterEggs = useMemo(
    () => map?.easterEggs?.some((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Wearable') ?? false,
    [map?.easterEggs]
  );

  const hasRelicEasterEggs = useMemo(
    () => map?.easterEggs?.some((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Relic') ?? false,
    [map?.easterEggs]
  );

  const hasFreePowerupEasterEggs = useMemo(
    () => map?.easterEggs?.some((ee) => (ee as { categoryTag?: string | null }).categoryTag === 'Free Powerup') ?? false,
    [map?.easterEggs]
  );

  const availableEeCategoriesWithoutBuildable = useMemo(
    () => availableEeCategories.filter((c) => c !== 'BUILDABLE'),
    [availableEeCategories]
  );

  const selectedBuildable = useMemo(
    () => buildables.find((b) => b.id === selectedBuildableId) ?? buildables[0] ?? null,
    [buildables, selectedBuildableId]
  );

  useEffect(() => {
    if (buildables.length > 0 && (!selectedBuildableId || !buildables.some((b) => b.id === selectedBuildableId))) {
      setSelectedBuildableId(buildables[0].id);
    }
  }, [buildables, selectedBuildableId]);

  useEffect(() => {
    setBuildableOpenParts(new Set());
  }, [selectedBuildableId]);

  // Load EE step progress when map loads (logged-in only)
  useEffect(() => {
    if (!map || !profile) {
      if (!profile) setEeProgress({ checkedStepIds: [], mainEeXpAwardedEasterEggIds: [] });
      return;
    }
    let cancelled = false;
    setEeProgressLoading(true);
    fetch(`/api/maps/${slug}/easter-egg-progress`)
      .then((res) => res.ok ? res.json() : { checkedStepIds: [], mainEeXpAwardedEasterEggIds: [] })
      .then((data) => {
        if (!cancelled) {
          setEeProgress({
            checkedStepIds: data.checkedStepIds ?? [],
            mainEeXpAwardedEasterEggIds: data.mainEeXpAwardedEasterEggIds ?? [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) setEeProgress({ checkedStepIds: [], mainEeXpAwardedEasterEggIds: [] });
      })
      .finally(() => {
        if (!cancelled) setEeProgressLoading(false);
      });
    return () => { cancelled = true; };
    // Stable deps by id to avoid re-run on object reference change only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map?.id, slug, profile?.id, sortedEasterEggs]);

  const playerCountOptions = [
    { value: '', label: 'All Players' },
    { value: 'SOLO', label: 'Solo' },
    { value: 'DUO', label: 'Duo' },
    { value: 'TRIO', label: 'Trio' },
    { value: 'SQUAD', label: 'Squad' },
  ];

  // Single category dropdown like Leaderboards page: Highest Round, all map challenges (IW in canonical order), all loggable EEs (Time)
  const mapChallengeTypes = useMemo(() => {
    const types = Array.from(new Set((map?.challenges ?? []).map((c) => c.type)));
    if (map?.game?.shortName === 'IW' && types.length > 0) {
      return IW_CHALLENGE_TYPES_ORDER.filter((t) => t !== 'HIGHEST_ROUND' && types.includes(t as ChallengeType));
    }
    return types.filter((t) => t !== 'HIGHEST_ROUND').sort((a, b) => a.localeCompare(b));
  }, [map?.challenges, map?.game?.shortName]);
  const mainQuestEasterEggs = (map?.easterEggs ?? []).filter((ee) => ee.type === 'MAIN_QUEST');
  const leaderboardCategoryOptions = [
    { value: 'HIGHEST_ROUND', label: 'Highest Round' },
    ...mapChallengeTypes.map((type) => ({
      value: type,
      label: challengeTypeLabels[type] ?? type,
    })),
    ...mainQuestEasterEggs.map((ee) => ({
      value: `ee-time-${ee.id}`,
      label: `${ee.name} (Time)` as string,
    })),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <PageLoader message="Loading map..." fullScreen />
      </div>
    );
  }

  if (!map) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Logo size="xl" animated={false} className="mx-auto mb-4 opacity-50" />
          <h1 className="text-xl sm:text-2xl font-zombies text-white mb-4">Map Not Found</h1>
          <Link
            href="/maps"
            className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-4 py-2.5 text-sm font-medium text-white shadow-md backdrop-blur-sm transition-colors hover:border-bunker-400 hover:bg-bunker-700/95"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            All Maps
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bunker-950 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden pt-14 sm:pt-0">
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

        {/* Top bar */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-auto z-10 flex items-center gap-2 flex-wrap">
          <Link
            href="/maps"
            className="inline-flex items-center gap-2 rounded-lg border border-bunker-500 bg-bunker-800/95 px-3.5 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:border-bunker-400 hover:bg-bunker-700/95 hover:text-white flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4 flex-shrink-0" aria-hidden />
            <span className="hidden sm:inline">All Maps</span>
            <span className="sm:hidden">Back</span>
          </Link>
          {/* Mobile only */}
          <div className="flex items-center gap-2 flex-shrink-0 sm:hidden">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-blood-600/60 bg-blood-950/95 text-white text-xs font-semibold shadow-[0_0_1px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,0.9),0_1px_4px_rgba(0,0,0,0.8)] [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_1px_3px_rgba(0,0,0,0.9)]">
              {map.game.shortName}
            </span>
            {map.isDlc && <Badge variant="purple">DLC</Badge>}
          </div>
        </div>

        {/* Map info overlay */}
        <div className="absolute bottom-0 left-0 right-0 pt-12 sm:pt-10 pb-4 px-4 sm:pb-6 sm:px-6 md:pt-12 md:pb-8 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                {/* Tags: hidden on mobile (shown above under back button), visible sm+ */}
                <div className="hidden sm:flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-blood-600/60 bg-blood-950/95 text-white text-xs font-semibold shadow-[0_0_1px_rgba(0,0,0,1),0_0_3px_rgba(0,0,0,0.9),0_1px_4px_rgba(0,0,0,0.8)] [text-shadow:0_0_1px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1),0_1px_3px_rgba(0,0,0,0.9)]">
                    {map.game.shortName}
                  </span>
                  {map.isDlc && <Badge variant="purple">DLC</Badge>}
                </div>
                <h1 className="text-2xl pt-6 sm:text-3xl md:text-4xl lg:text-5xl font-zombies text-white tracking-wide [text-shadow:0_0_2px_rgba(0,0,0,0.95),0_0_6px_rgba(0,0,0,0.9),0_1px_8px_rgba(0,0,0,0.85),0_2px_12px_rgba(0,0,0,0.7)]">
                  {map.name}
                </h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/95 [text-shadow:0_0_2px_rgba(0,0,0,0.95),0_1px_4px_rgba(0,0,0,0.8)]">{map.game.name}</p>
                {map.description && (
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/85 max-w-2xl [text-shadow:0_0_2px_rgba(0,0,0,0.9),0_1px_3px_rgba(0,0,0,0.7)] hidden min-[700px]:block">
                    {map.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        <div
          className={
            activeTab === 'easter-eggs' && buildables.length > 0
              ? 'lg:grid lg:grid-cols-[1fr,minmax(300px,420px)] lg:gap-6 lg:items-start'
              : ''
          }
        >
          <div className="min-w-0">
        <Tabs key={initialTab} value={activeTab} defaultValue={initialTab} onChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Below 874px: vertical stack (? above Log Progress, then dropdown). At 874px+: row (? left of Log Progress, then tabs). */}
          <div className="overflow-x-hidden -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-col min-[874px]:flex-row min-[874px]:flex-wrap min-[874px]:items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <HelpTrigger
                title="Challenges & Easter eggs on this map"
                description="What counts as a challenge, main vs side EEs, and how to use these tabs."
                modalSize="md"
              >
                <MapChallengesEeHelpContent />
              </HelpTrigger>
            </div>
            {profile && !(activeTab === 'easter-eggs' && buildables.length > 0) && (
              <Link href={`/maps/${slug}/edit`} className="flex-shrink-0 w-full min-[874px]:w-auto">
                <Button leftIcon={<span className="mr-2 inline-flex shrink-0"><Edit className="w-4 h-4" /></span>} size="lg" className="!text-white w-full min-[874px]:w-auto justify-center min-[874px]:justify-start">
                  Log Progress
                </Button>
              </Link>
            )}
            <div className="w-full min-[874px]:flex-1 min-w-0">
              {/* Below 874px: dropdown; at 874px+: tab bar */}
              <div className="min-[874px]:hidden w-full">
                <Select
                  options={[
                    { value: 'overview', label: 'Overview' },
                    { value: 'achievements', label: 'Achievements' },
                    { value: 'easter-eggs', label: 'Easter Eggs' },
                    { value: 'leaderboard', label: 'Leaderboard' },
                    ...(profile ? [{ value: 'your-runs', label: 'Your Runs' }] : []),
                  ]}
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full"
                  aria-label="Section"
                />
              </div>
              <div className="hidden min-[874px]:block overflow-x-auto [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
                <TabsList className="w-max inline-flex gap-1 p-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="easter-eggs">Easter Eggs</TabsTrigger>
                  <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                  {profile && (
                    <TabsTrigger value="your-runs">Your Runs</TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>
          </div>

          {/* Overview Tab – forceMount so all tab content is in DOM for crawlers */}
          <TabsContent value="overview" forceMount>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Map Description – hidden below 700px to free space */}
              <Card variant="bordered" className="lg:col-span-2 min-h-0 hidden min-[700px]:flex flex-col">
                <CardHeader>
                  <CardTitle>About This Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-bunker-300">
                    {map.description || 'No description available for this map yet.'}
                  </p>
                  
                  {/* Quick stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                    <div className="text-center p-3 sm:p-4 bg-bunker-800/50 rounded-lg border border-bunker-700">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blood-400 mx-auto mb-1 sm:mb-2" />
                      <p className="text-xl sm:text-2xl font-zombies text-white">
                        {map.challenges.length}
                      </p>
                      <p className="text-xs text-bunker-400">Challenges</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-bunker-800/50 rounded-lg border border-bunker-700">
                      <EasterEggIcon className="w-5 h-5 sm:w-6 sm:h-6 text-element-400 mx-auto mb-1 sm:mb-2" />
                      <p className="text-xl sm:text-2xl font-zombies text-white">
                        {map.easterEggs.length > 0 
                          ? Object.values(mapStats?.easterEggCompletions || {}).reduce((a, b) => a + b, 0)
                          : '—'}
                      </p>
                      <p className="text-xs text-bunker-400">EE Completions</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-bunker-800/50 rounded-lg border border-bunker-700">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1 sm:mb-2" />
                      <p className={`text-xl sm:text-2xl font-zombies ${(selectedLeaderboardCategory.startsWith('ee-time-') || isIwSpeedrunChallengeType(selectedLeaderboardCategory)) ? 'text-element-400' : 'text-white'}`}>
                        {(selectedLeaderboardCategory.startsWith('ee-time-') || isIwSpeedrunChallengeType(selectedLeaderboardCategory))
                          ? (leaderboard[0]?.value != null && Number.isFinite(Number(leaderboard[0].value))
                              ? formatCompletionTime(Number(leaderboard[0].value))
                              : '—')
                          : (mapStats?.highestRound || leaderboard[0]?.value || '—')}
                      </p>
                      <p className="text-xs text-bunker-400">
                        {(selectedLeaderboardCategory.startsWith('ee-time-') || isIwSpeedrunChallengeType(selectedLeaderboardCategory)) ? 'Top Time' : 'Top Round'}
                      </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-bunker-800/50 rounded-lg border border-bunker-700">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blood-400 mx-auto mb-1 sm:mb-2" />
                      <p className="text-xl sm:text-2xl font-zombies text-white">
                        {!selectedLeaderboardCategory.startsWith('ee-time-')
                          ? (mapStats?.totalPlayers ?? leaderboard.length)
                          : leaderboard.length}
                      </p>
                      <p className="text-xs text-bunker-400">Players</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Players Preview — stretches to match left column height */}
              <Card variant="bordered" className="lg:h-full flex flex-col min-h-0">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Top Players
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 flex-1 min-h-0 flex flex-col">
                  {(!leaderboardFetchedOnce || (isLeaderboardLoading && leaderboard.length === 0)) ? (
                    <div className="flex-1 flex items-center justify-center min-h-[8rem]">
                      <PageLoader inline />
                    </div>
                  ) : leaderboard.length > 0 ? (
                    <div className="min-w-0">
                      {leaderboard.slice(0, 5).map((entry) => (
                        <div
                          key={`${entry.user.id}-${entry.playerCount}`}
                          className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-bunker-800/50"
                        >
                          <span className="w-6 flex-shrink-0 text-center text-xs sm:text-sm font-zombies text-blood-500">
                            #{entry.rank}
                          </span>
                          <Link
                            href={`/users/${entry.user.username}`}
                            className="flex-1 min-w-0 text-xs sm:text-sm text-bunker-200 hover:text-blood-400 truncate"
                          >
                            {entry.user.displayName || entry.user.username}
                          </Link>
                          <span className="flex-shrink-0 w-14 text-xs sm:text-sm text-bunker-400 font-medium">
                            {getPlayerCountLabel(entry.playerCount)}
                          </span>
                          <div className="flex-shrink-0 min-w-[3.5rem] flex justify-end">
                            {(selectedLeaderboardCategory.startsWith('ee-time-') || isIwSpeedrunChallengeType(selectedLeaderboardCategory)) ? (
                              <span className="text-xs sm:text-sm font-zombies font-semibold text-element-400 tabular-nums">
                                {formatCompletionTime(entry.value)}
                              </span>
                            ) : (
                              <RoundCounter round={entry.value} size="sm" animated={false} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <p className="text-center text-bunker-400 text-sm">
                        No entries yet. Be the first!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" forceMount>
            <AchievementsTabContent
              achievements={(map as MapWithDetails & { achievements?: Array<{ id: string; name: string; slug: string; type: string; difficulty?: string | null; criteria: { round?: number; challengeType?: string; isCap?: boolean }; xpReward: number; rarity: string; easterEggId?: string | null; easterEgg?: { id: string; name: string; slug: string } | null }>; unlockedAchievementIds?: string[] } | null)?.achievements ?? []}
              unlockedIds={(map as MapWithDetails & { unlockedAchievementIds?: string[] } | null)?.unlockedAchievementIds}
              canRelock={!!profile}
              onRelock={async () => {
                setRefreshMapCounter((c) => c + 1);
                await refreshProfile?.();
              }}
              gameShortName={map?.game?.shortName}
            />
          </TabsContent>

          {/* Easter Eggs Tab */}
          <TabsContent value="easter-eggs" forceMount>
            <div className="space-y-4">
              {isIwGame(map?.game?.shortName) && sortedEasterEggs.length === 0 && (
                <Card variant="bordered" className="border-bunker-700">
                  <CardContent className="py-8 text-center">
                    <p className="text-bunker-400 text-lg">Easter Eggs Coming Soon</p>
                    <p className="text-bunker-500 text-sm mt-2">We&apos;re working on adding Easter Egg tracking for Infinite Warfare maps.</p>
                  </CardContent>
                </Card>
              )}
              {/* Easter eggs list (on large screens buildables are in a separate column aligned with tabs) */}
              <div className="space-y-4 min-w-0">
                {/* Category filter: on large screens no Buildables button (buildables are on the right) */}
                {sortedEasterEggs.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-bunker-400 mr-1">Show:</span>
                    <button
                      type="button"
                      onClick={() => setEeCategoryFilter('')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        eeCategoryFilter === ''
                          ? 'bg-element-700/60 text-element-100 border border-element-500/60'
                          : 'bg-bunker-800/60 text-bunker-300 border border-bunker-600 hover:bg-bunker-700/60'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      All
                    </button>
                    {availableEeCategoriesWithoutBuildable.includes('MAIN_QUEST') && (
                      <button
                        type="button"
                        onClick={() => setEeCategoryFilter('MAIN_QUEST')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          eeCategoryFilter === 'MAIN_QUEST'
                            ? 'bg-blood-900/50 text-white border border-blood-600/60'
                            : 'bg-bunker-800/60 text-bunker-300 border border-bunker-600 hover:bg-bunker-700/60'
                        }`}
                      >
                        Main Quest
                      </button>
                    )}
                    {availableEeCategoriesWithoutBuildable.includes('MUSICAL') && (
                      <button
                        type="button"
                        onClick={() => setEeCategoryFilter('MUSICAL')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          eeCategoryFilter === 'MUSICAL'
                            ? 'bg-element-700/60 text-element-100 border border-element-500/60'
                            : 'bg-bunker-800/60 text-bunker-300 border border-bunker-600 hover:bg-bunker-700/60'
                        }`}
                      >
                        Musical EE
                      </button>
                    )}
                    {availableEeCategoriesWithoutBuildable.includes('SIDE_QUEST') && (
                      <button
                        type="button"
                        onClick={() => setEeCategoryFilter('SIDE_QUEST')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          eeCategoryFilter === 'SIDE_QUEST'
                            ? 'bg-element-700/60 text-element-100 border border-element-500/60'
                            : 'bg-bunker-800/60 text-bunker-300 border border-bunker-600 hover:bg-bunker-700/60'
                        }`}
                      >
                        Side Quest
                      </button>
                    )}
                    {hasCipherEasterEggs && (
                      <button
                        type="button"
                        onClick={() => setEeCategoryFilter('CIPHER')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          eeCategoryFilter === 'CIPHER'
                            ? 'bg-amber-900/50 text-amber-100 border border-amber-600/60'
                            : 'bg-bunker-800/60 text-bunker-300 border border-bunker-600 hover:bg-bunker-700/60'
                        }`}
                      >
                        Cipher
                      </button>
                    )}
                    {hasWearableEasterEggs && (
                      <button
                        type="button"
                        onClick={() => setEeCategoryFilter('WEARABLE')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          eeCategoryFilter === 'WEARABLE'
                            ? 'bg-element-700/60 text-element-100 border border-element-500/60'
                            : 'bg-bunker-800/60 text-bunker-300 border border-bunker-600 hover:bg-bunker-700/60'
                        }`}
                      >
                        Wearable
                      </button>
                    )}
                    {hasRelicEasterEggs && (
                      <button
                        type="button"
                        onClick={() => setEeCategoryFilter('RELIC')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          eeCategoryFilter === 'RELIC'
                            ? 'bg-element-700/60 text-element-100 border border-element-500/60'
                            : 'bg-bunker-800/60 text-bunker-300 border border-bunker-600 hover:bg-bunker-700/60'
                        }`}
                      >
                        Relic
                      </button>
                    )}
                    {hasFreePowerupEasterEggs && (
                      <button
                        type="button"
                        onClick={() => setEeCategoryFilter('FREE_POWERUP')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          eeCategoryFilter === 'FREE_POWERUP'
                            ? 'bg-element-700/60 text-element-100 border border-element-500/60'
                            : 'bg-bunker-800/60 text-bunker-300 border border-bunker-600 hover:bg-bunker-700/60'
                        }`}
                      >
                        Free Powerup
                      </button>
                    )}
                    {/* Buildables filter: only on small screens where buildables are in the list */}
                    {availableEeCategories.includes('BUILDABLE') && (
                      <button
                        type="button"
                        onClick={() => setEeCategoryFilter('BUILDABLE')}
                        className={`lg:hidden px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          eeCategoryFilter === 'BUILDABLE'
                            ? 'bg-element-700/60 text-element-100 border border-element-500/60'
                            : 'bg-bunker-800/60 text-bunker-300 border border-bunker-600 hover:bg-bunker-700/60'
                        }`}
                      >
                        Buildables
                      </button>
                    )}
                  </div>
                )}

                {/* List: large = eggs only (left column); small = all filtered. Page grows with content; scroll the page. */}
                {[
                  { items: filteredEasterEggsLeft, className: 'hidden lg:block space-y-3 pr-1.5', key: 'lg' },
                  { items: filteredEasterEggs, className: 'lg:hidden space-y-3 pr-1.5', key: 'sm' },
                ].map(({ items, className, key: listKey }) => (
                  <div key={listKey} className={className}>
                  {items.map((ee) => {
                const steps = (ee as { steps?: { id: string; order: number; label: string; imageUrl?: string | null }[] }).steps ?? [];
                const checkedCount = steps.filter((s) => eeProgress.checkedStepIds.includes(s.id)).length;
                const allChecked = steps.length > 0 && checkedCount === steps.length;
                const isMainQuest = ee.type === 'MAIN_QUEST';
                const xpAlreadyAwarded = eeProgress.mainEeXpAwardedEasterEggIds.includes(ee.id);
                const isOpen = openEasterEggIds.has(ee.id);
                const completionCount = mapStats?.easterEggCompletions[ee.id] || 0;

                const toggleOpen = () => {
                  setOpenEasterEggIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(ee.id)) next.delete(ee.id);
                    else next.add(ee.id);
                    return next;
                  });
                };

                const handleToggleStep = async (easterEggStepId: string) => {
                  if (!profile) return;
                  const currentlyChecked = eeProgress.checkedStepIds.includes(easterEggStepId);
                  // Toggle UI right away so check/strikethrough show before API finishes
                  setEeProgress((p) => ({
                    ...p,
                    checkedStepIds: currentlyChecked
                      ? p.checkedStepIds.filter((id) => id !== easterEggStepId)
                      : [...p.checkedStepIds, easterEggStepId],
                  }));
                  setTogglingStepId(easterEggStepId);
                  try {
                    const res = await fetch(`/api/maps/${slug}/easter-egg-progress`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'toggle', easterEggStepId }),
                    });
                    const data = await res.json();
                    console.log('[EE progress] response', { ok: res.ok, action: data.action, xpAwarded: data.xpAwarded, totalXp: data.totalXp, _debug: data._debug });
                    if (res.ok && data.action === 'checked') {
                      const xpAwarded = data.xpAwarded != null ? Number(data.xpAwarded) : 0;
                      console.log('[EE progress] checked, xpAwarded', xpAwarded);
                      if (xpAwarded > 0) {
                        setEeProgress((p) => ({
                          ...p,
                          mainEeXpAwardedEasterEggIds: p.mainEeXpAwardedEasterEggIds.includes(ee.id)
                            ? p.mainEeXpAwardedEasterEggIds
                            : [...p.mainEeXpAwardedEasterEggIds, ee.id],
                        }));
                        const totalXp = data.totalXp != null ? Number(data.totalXp) : undefined;
                        console.log('[EE progress] scheduling toast', { xpAwarded, totalXp });
                        // Defer toast so it fires after this handler; dispatch so it works even if we're outside the provider
                        setTimeout(() => {
                          console.log('[EE progress] calling dispatchXpToast', { xpAwarded, totalXp });
                          dispatchXpToast(xpAwarded, totalXp != null ? { totalXp } : undefined);
                        }, 0);
                        // Refetch map + profile so achievements tab shows the new unlock without manual refresh
                        setRefreshMapCounter((c) => c + 1);
                        refreshProfile?.();
                      }
                    } else if (!res.ok || (data.action !== 'checked' && data.action !== 'unchecked')) {
                      const fresh = await fetch(`/api/maps/${slug}/easter-egg-progress`).then((r) => r.json());
                      setEeProgress({
                        checkedStepIds: fresh.checkedStepIds ?? [],
                        mainEeXpAwardedEasterEggIds: fresh.mainEeXpAwardedEasterEggIds ?? [],
                      });
                    }
                  } catch (err) {
                    console.log('[EE progress] fetch failed or threw', err);
                    const fresh = await fetch(`/api/maps/${slug}/easter-egg-progress`).then((r) => r.json());
                    setEeProgress({
                      checkedStepIds: fresh.checkedStepIds ?? [],
                      mainEeXpAwardedEasterEggIds: fresh.mainEeXpAwardedEasterEggIds ?? [],
                    });
                  } finally {
                    setTogglingStepId(null);
                  }
                };

                const handleClearAll = async () => {
                  if (!profile || checkedCount === 0) return;
                  if (!confirm('Uncheck all steps for this Easter Egg? (You can re-check them anytime. XP for main quest is only awarded once.)')) return;
                  setEeProgressLoading(true);
                  try {
                    await fetch(`/api/maps/${slug}/easter-egg-progress`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'clear', easterEggId: ee.id }),
                    });
                    setEeProgress((p) => ({
                      ...p,
                      checkedStepIds: p.checkedStepIds.filter(
                        (id) => !steps.some((s) => s.id === id)
                      ),
                    }));
                  } finally {
                    setEeProgressLoading(false);
                  }
                };

                const typeLabel = isMainQuest
                  ? 'Main Quest'
                  : ee.type === 'MUSICAL'
                    ? 'Musical EE'
                    : ee.type === 'BUILDABLE'
                      ? 'Buildable'
                      : 'Side Quest';
                const variantTag = (ee as { variantTag?: string | null }).variantTag;
                const categoryTag = (ee as { categoryTag?: string | null }).categoryTag;

                return (
                  <Card key={ee.id} variant="bordered" className={allChecked ? 'border-military-600/50 bg-military-950/20' : ''}>
                    <div className="divide-y divide-bunker-700/50">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={toggleOpen}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleOpen();
                          }
                        }}
                        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-bunker-800/50 transition-colors rounded-t-lg cursor-pointer"
                      >
                        {isOpen ? (
                          <ChevronDown className="w-5 h-5 flex-shrink-0 text-bunker-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 flex-shrink-0 text-bunker-400" />
                        )}
                        <div className="p-2 bg-element-900/30 border border-element-600/30 rounded-lg">
                          <EasterEggIcon className="w-5 h-5 text-element-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-white">{ee.name}</h3>
                            <Badge variant={isMainQuest ? 'purple' : 'default'} size="sm">
                              {typeLabel}
                            </Badge>
                            {variantTag && (
                              <Badge variant="default" size="sm" className="text-bunker-300 border-element-600">
                                {variantTag}
                              </Badge>
                            )}
                            {categoryTag && (
                              <Badge variant="default" size="sm" className="text-bunker-300 border-amber-600/60 text-amber-200/90">
                                {categoryTag}
                              </Badge>
                            )}
                            {(ee as { playerCountRequirement?: string }).playerCountRequirement && (
                              <Badge variant="default" size="sm" className="text-bunker-300 border-bunker-600">
                                {{
                                  SOLO: 'Solo only',
                                  DUO: '2+ players',
                                  TRIO: '3+ players',
                                  SQUAD: '4 players',
                                }[(ee as { playerCountRequirement: string }).playerCountRequirement]}
                              </Badge>
                            )}
                            {allChecked && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-military-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Complete
                              </span>
                            )}
                            {isMainQuest && xpAlreadyAwarded && (
                              <span className="text-xs text-bunker-500">+{ee.xpReward} XP awarded</span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-bunker-400 mt-0.5">
                            {steps.length > 0
                              ? `${checkedCount}/${steps.length} steps`
                              : ee.description || 'No steps added yet.'}
                          </p>
                        </div>
                        {profile && steps.length > 0 && checkedCount > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearAll();
                            }}
                            className="flex-shrink-0 text-bunker-400 hover:text-blood-400"
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          >
                            Clear all
                          </Button>
                        )}
                      </div>

                      {isOpen && (
                        <CardContent className="pt-4 sm:pt-5 px-4 sm:px-5 pb-4 sm:pb-5">
                          {(ee as { videoEmbedUrl?: string | null }).videoEmbedUrl && (
                            <div className="mb-4 rounded-lg overflow-hidden border border-bunker-700/60 bg-bunker-800/40 aspect-video max-w-2xl">
                              <iframe
                                title={`${ee.name} guide video`}
                                src={(ee as { videoEmbedUrl: string }).videoEmbedUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                              />
                            </div>
                          )}
                          {steps.length === 0 ? (
                            <p className="text-sm text-bunker-500 py-3">
                              {ee.description || 'Steps for this Easter Egg will be added soon.'}
                            </p>
                          ) : (
                            <ul className={isMainQuest ? 'space-y-4 pt-2' : 'space-y-1.5 pt-2'}>
                              {steps.map((step, stepIndex) => {
                                const checked = eeProgress.checkedStepIds.includes(step.id);
                                const parts = isMainQuest ? formatStepLabel(step.label) : null;
                                const stepBlock = (
                                  <div
                                    className={
                                      isMainQuest
                                        ? 'flex gap-3 p-4 rounded-lg border border-bunker-700/60 bg-bunker-900/40'
                                        : 'flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-bunker-800/30'
                                    }
                                  >
                                    {profile ? (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStep(step.id)}
                                        disabled={togglingStepId === step.id}
                                        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-element-500 disabled:opacity-50 ${isMainQuest ? 'mt-0.5' : ''}`}
                                        style={{
                                          borderColor: checked ? 'var(--color-military-400)' : 'var(--color-bunker-500)',
                                          backgroundColor: checked ? 'var(--color-military-500)' : 'transparent',
                                        }}
                                      >
                                        {checked && <Check className="w-4 h-4 text-military-200 stroke-[3]" />}
                                      </button>
                                    ) : (
                                      <div
                                        className={`flex-shrink-0 w-6 h-6 rounded border-2 border-bunker-600 flex items-center justify-center ${isMainQuest ? 'mt-0.5' : ''}`}
                                      >
                                        {checked && <Check className="w-4 h-4 text-military-400 stroke-[3]" />}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      {isMainQuest && parts ? (
                                        <div className="space-y-4">
                                          {parts.title && (
                                            <div className="flex items-center gap-2">
                                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-element-800/50 border border-element-600/40 text-xs font-semibold text-element-200">
                                                {stepIndex + 1}
                                              </span>
                                              <span className={`font-semibold text-element-100 ${checked ? 'line-through text-bunker-400' : ''}`}>
                                                {parts.title}
                                              </span>
                                            </div>
                                          )}
                                          {parts.sections.map((section, sectionIdx) => (
                                            <div key={sectionIdx} className="space-y-1.5">
                                              {section.heading && (
                                                <p className="text-xs font-semibold uppercase tracking-wider text-bunker-200">
                                                  {section.heading}
                                                </p>
                                              )}
                                              {section.lines.length === 1 ? (
                                                <p className={`text-sm ${checked ? 'text-bunker-400 line-through' : 'text-bunker-200'} ${section.heading ? 'font-medium' : ''}`}>
                                                  {section.lines[0]}
                                                </p>
                                              ) : (
                                                <ul className="list-none space-y-1 pl-0">
                                                  {section.lines.map((line, i) => (
                                                    <li
                                                      key={i}
                                                      className={`text-sm flex gap-2 ${checked ? 'text-bunker-400 line-through' : 'text-bunker-200'}`}
                                                    >
                                                      <span className="text-bunker-500 flex-shrink-0 select-none">•</span>
                                                      <span>{line}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className={`text-sm ${checked ? 'text-bunker-400 line-through' : 'text-bunker-200'}`}>
                                          {step.label}
                                        </span>
                                      )}
                                      {(step as { imageUrl?: string | null }).imageUrl && (
                                        <button
                                          type="button"
                                          onClick={() => setLightboxImageUrl(getAssetUrl((step as { imageUrl: string }).imageUrl))}
                                          className="mt-3 rounded-lg overflow-hidden border border-bunker-700/60 bg-bunker-800/40 block w-full text-left focus:outline-none focus:ring-2 focus:ring-element-500"
                                        >
                                          <Image
                                            src={getAssetUrl((step as { imageUrl: string }).imageUrl)}
                                            alt="Step reference"
                                            width={560}
                                            height={315}
                                            className="w-full h-auto object-contain max-h-64 sm:max-h-80 cursor-pointer"
                                          />
                                        </button>
                                      )}
                                      {(step as { buildableReferenceSlug?: string | null }).buildableReferenceSlug && (() => {
                                        const refSlug = (step as { buildableReferenceSlug?: string | null }).buildableReferenceSlug!;
                                        const refEe = sortedEasterEggs.find((e) => (e as { slug?: string }).slug === refSlug);
                                        const refName = refEe?.name ?? refSlug;
                                        const isBuildable = refEe?.type === 'BUILDABLE';
                                        return (
                                          <p className={`mt-2 text-xs font-medium ${checked ? 'text-bunker-500' : 'text-element-300'}`}>
                                            {isBuildable ? (
                                              <>
                                                <span className="hidden lg:inline">
                                                  Reference the {refName} buildable guide on the right side of the screen.
                                                </span>
                                                <span className="lg:hidden">
                                                  Reference the {refName} buildable guide below.
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <span className="hidden lg:inline">
                                                  Reference the {refName} Easter egg in the list above.
                                                </span>
                                                <span className="lg:hidden">
                                                  Reference the {refName} Easter egg in the list below.
                                                </span>
                                              </>
                                            )}
                                          </p>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                );
                                return <li key={step.id}>{stepBlock}</li>;
                              })}
                            </ul>
                          )}
                          {(ee as { rewardsDescription?: string | null }).rewardsDescription && (
                            <div className="mt-4 pt-4 border-t border-bunker-700/60 space-y-1.5">
                              <p className="text-xs font-semibold uppercase tracking-wider text-bunker-200">Rewards</p>
                              <p className="text-sm text-bunker-300">
                                {(ee as { rewardsDescription: string }).rewardsDescription}
                              </p>
                            </div>
                          )}
                          {completionCount > 0 && (
                            <p className="text-xs text-bunker-500 mt-3 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-military-500" />
                              {completionCount} {completionCount === 1 ? 'player' : 'players'} logged a full completion
                            </p>
                          )}
                        </CardContent>
                      )}
                    </div>
                  </Card>
                );
                  })}
                  {items.length === 0 && (
                    <div className="text-center py-8 sm:py-12">
                      <EasterEggIcon className="w-10 h-10 sm:w-12 sm:h-12 text-bunker-600 mx-auto mb-4" />
                      <p className="text-bunker-400 text-sm sm:text-base">
                        {eeCategoryFilter
                          ? `No ${eeCategoryFilter === 'MAIN_QUEST' ? 'Main Quest' : eeCategoryFilter === 'MUSICAL' ? 'Musical' : eeCategoryFilter === 'SIDE_QUEST' ? 'Side Quest' : eeCategoryFilter === 'CIPHER' ? 'Ciphers' : eeCategoryFilter === 'WEARABLE' ? 'Wearables' : eeCategoryFilter === 'RELIC' ? 'Relics' : eeCategoryFilter === 'FREE_POWERUP' ? 'Free Powerups' : 'Buildables'} for this map.`
                          : 'No Easter Eggs documented for this map.'}
                      </p>
                    </div>
                  )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" forceMount>
            <Card variant="bordered">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Leaderboard
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
                    <Select
                      options={leaderboardCategoryOptions}
                      value={selectedLeaderboardCategory}
                      onChange={(e) => setSelectedLeaderboardCategory(e.target.value)}
                      className="w-full min-w-0 sm:w-52 max-w-full"
                    />
                    <Select
                      options={playerCountOptions}
                      value={selectedPlayerCount}
                      onChange={(e) => setSelectedPlayerCount(e.target.value as PlayerCount | '')}
                      className="w-full min-w-0 sm:w-36 max-w-full"
                    />
                    {map?.game?.shortName === 'BO4' && (
                      <Select
                        options={BO4_DIFFICULTIES.map((d) => ({ value: d, label: getBo4DifficultyLabel(d) }))}
                        value={selectedDifficulty || 'NORMAL'}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full min-w-0 sm:w-36 max-w-full"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setLeaderboardVerifiedOnly((v) => !v)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors min-h-[40px]',
                        leaderboardVerifiedOnly
                          ? 'border-blue-500/60 bg-blue-950/80 text-blue-200 hover:bg-blue-900/60'
                          : 'border-bunker-600 bg-bunker-800/80 text-bunker-300 hover:bg-bunker-700/80'
                      )}
                      aria-pressed={leaderboardVerifiedOnly}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {leaderboardVerifiedOnly ? 'Verified' : 'Unverified'}
                    </button>
                    {isIwGame(map?.game?.shortName) && (
                      <>
                        <button
                          type="button"
                          onClick={() => setLeaderboardDirectorsCut((v) => !v)}
                          className={cn(
                            'flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                            leaderboardDirectorsCut
                              ? 'border-blood-500/60 bg-blood-950/80 text-white hover:bg-blood-900/60'
                              : 'border-bunker-600 bg-bunker-800/80 text-bunker-300 hover:bg-bunker-700/80'
                          )}
                          aria-pressed={leaderboardDirectorsCut}
                        >
                          Directors Cut
                        </button>
                        <Select
                          options={[
                            { value: 'false', label: 'Fate only' },
                            { value: 'true', label: 'Fate & Fortune' },
                          ]}
                          value={leaderboardFortuneCards}
                          onChange={(e) => setLeaderboardFortuneCards(e.target.value)}
                          className="w-full min-w-0 sm:w-40 max-w-full"
                        />
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 min-h-[20rem] flex flex-col min-w-0">
                  {(!leaderboardFetchedOnce || (isLeaderboardLoading && leaderboard.length === 0)) ? (
                    <div className="flex-1 flex items-center justify-center py-12 min-h-[18rem]">
                      <PageLoader inline />
                    </div>
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((entry, index) => (
                      <LeaderboardEntry
                        key={selectedLeaderboardCategory.startsWith('ee-time-') ? `${entry.user.id}-${entry.playerCount}-${index}` : `${entry.user.id}-${entry.playerCount}`}
                        entry={entry}
                        index={index}
                        isCurrentUser={entry.user.id === profile?.id}
                        valueKind={selectedLeaderboardCategory.startsWith('ee-time-') || isIwSpeedrunChallengeType(selectedLeaderboardCategory) ? 'time' : 'round'}
                        mapSlug={slug}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12 min-h-[18rem] flex flex-col items-center justify-center">
                      <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-bunker-600 mx-auto mb-4" />
                      <p className="text-bunker-400 text-sm sm:text-base">
                        No entries yet for this challenge category.
                      </p>
                      {profile && (
                        <Link href={`/maps/${slug}/edit`}>
                          <Button variant="secondary" className="mt-4">
                            Be the First
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {profile && (
            <TabsContent value="your-runs" className="space-y-4" forceMount>
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="w-4 h-4 text-bunker-500 flex-shrink-0" />
                <Select
                  options={myRunsTypeOptions}
                  value={myRunsFilterType}
                  onChange={(e) => setMyRunsFilterType(e.target.value)}
                  className="w-full sm:w-56"
                />
                {myRunsFilterType && (
                  <button
                    type="button"
                    onClick={() => setMyRunsFilterType('')}
                    className="text-sm text-bunker-400 hover:text-blood-400"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              {myRunsLoading ? (
                <div className="flex justify-center py-12">
                  <PageLoader message="Loading runs..." inline />
                </div>
              ) : totalMyRuns === 0 ? (
                <Card variant="bordered">
                  <CardContent className="py-12 text-center">
                    <ListChecks className="w-12 h-12 text-bunker-600 mx-auto mb-4" />
                    <p className="text-bunker-400">
                      {!myRunsData
                        ? "You haven't logged any runs on this map yet."
                        : (myRunsData.challengeLogs.length + myRunsData.easterEggLogs.length) === 0
                          ? "You haven't logged any runs on this map yet."
                          : 'No runs match the current filter.'}
                    </p>
                    <Link href={`/maps/${slug}/edit`} className="inline-block mt-4 text-blood-400 hover:text-blood-300 text-sm">
                      Log progress on this map →
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-2 px-2 sm:px-4 min-w-0">
                  {myRunsChronological.map((item) =>
                    item.kind === 'challenge' ? (
                      <Link key={`c-${item.log.id}`} href={`/maps/${slug}/run/challenge/${item.log.id}`} className="block min-w-0">
                        <Card variant="bordered" interactive className="transition-opacity hover:opacity-95">
                          <CardContent className="p-3 sm:p-4 grid items-center gap-x-2 gap-y-1 min-w-0
                            grid-cols-[auto_minmax(0,1fr)_auto]
                            sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]
                            md:grid-cols-[auto_minmax(0,1fr)_4.5rem_auto_auto]
                            lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,8rem)_4.5rem_auto_auto_auto]">
                            <ChallengeTypeIcon type={item.log.challenge.type ?? 'HIGHEST_ROUND'} className="w-5 h-5 text-blood-400 flex-shrink-0" size={20} />
                            <span className="font-medium text-white truncate min-w-0 flex items-center gap-1.5">
                              {item.log.challenge.name}
                              {(item.log as { isVerified?: boolean }).isVerified && (
                                <span className="flex-shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/90 text-white" title="Verified run">
                                  <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                                </span>
                              )}
                            </span>
                            <span className="hidden lg:block text-sm text-bunker-500 truncate min-w-0" title={item.log.notes ?? undefined}>
                              {item.log.notes || null}
                            </span>
                            <span className="hidden md:flex items-center justify-end gap-1.5 text-sm text-bunker-500 flex-shrink-0 tabular-nums w-[4.5rem]" title={item.log.completionTimeSeconds != null && item.log.completionTimeSeconds > 0 ? formatCompletionTime(item.log.completionTimeSeconds) : undefined}>
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              {item.log.completionTimeSeconds != null && item.log.completionTimeSeconds > 0
                                ? formatCompletionTime(item.log.completionTimeSeconds)
                                : null}
                            </span>
                            <span className="hidden sm:flex items-center justify-end gap-1.5 text-sm text-bunker-400 flex-shrink-0">
                              {item.log.playerCount}
                              {map?.game?.shortName === 'BO4' && item.log.difficulty && (
                                <span className="text-bunker-500">· {getBo4DifficultyLabel(item.log.difficulty)}</span>
                              )}
                            </span>
                            <span className="flex justify-end flex-shrink-0 min-w-[3rem]">
                              <RoundCounter round={item.log.roundReached} size="xs" animated={false} />
                            </span>
                          </CardContent>
                        </Card>
                      </Link>
                    ) : (
                      <Link key={`e-${item.log.id}`} href={`/maps/${slug}/run/easter-egg/${item.log.id}`} className="block min-w-0">
                        <Card variant="bordered" interactive className="transition-opacity hover:opacity-95">
                          <CardContent className="p-3 sm:p-4 grid items-center gap-x-2 gap-y-1 min-w-0
                            grid-cols-[auto_minmax(0,1fr)_auto]
                            sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]
                            md:grid-cols-[auto_minmax(0,1fr)_4.5rem_auto_auto]
                            lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,8rem)_4.5rem_auto_auto_auto]">
                            <EasterEggIcon className="w-5 h-5 text-element-400 flex-shrink-0" />
                            <span className="font-medium text-white truncate min-w-0 flex items-center gap-1.5">
                              {item.log.easterEgg.name}
                              {(item.log as { isVerified?: boolean }).isVerified && (
                                <span className="flex-shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/90 text-white" title="Verified run">
                                  <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                                </span>
                              )}
                            </span>
                            <span className="hidden lg:block text-sm text-bunker-500 truncate min-w-0" title={item.log.notes ?? undefined}>
                              {item.log.notes || null}
                            </span>
                            <span className="hidden md:flex items-center justify-end gap-1.5 text-sm text-bunker-500 flex-shrink-0 tabular-nums w-[4.5rem]" title={item.log.completionTimeSeconds != null && item.log.completionTimeSeconds > 0 ? formatCompletionTime(item.log.completionTimeSeconds) : undefined}>
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              {item.log.completionTimeSeconds != null && item.log.completionTimeSeconds > 0
                                ? formatCompletionTime(item.log.completionTimeSeconds)
                                : null}
                            </span>
                            <span className="hidden sm:flex items-center justify-end gap-2 flex-shrink-0">
                              <span className="text-sm text-bunker-400">{item.log.playerCount}</span>
                              {map?.game?.shortName === 'BO4' && item.log.difficulty && (
                                <span className="text-sm text-bunker-500">{getBo4DifficultyLabel(item.log.difficulty)}</span>
                              )}
                              {item.log.isSolo && <Badge variant="default" size="sm">Solo</Badge>}
                            </span>
                            <span className="flex justify-end flex-shrink-0 min-w-[3rem]">
                              {item.log.roundCompleted != null ? (
                                <RoundCounter round={item.log.roundCompleted} size="xs" animated={false} />
                              ) : null}
                            </span>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  )}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
          </div>

          {/* Right column (large screens): Log Progress + Buildables aligned with tabs row */}
          {activeTab === 'easter-eggs' && buildables.length > 0 && (
            <div className="hidden lg:flex lg:flex-col lg:min-w-0 lg:space-y-4">
              {profile && (
                <div className="flex justify-end flex-shrink-0">
                  <Link href={`/maps/${slug}/edit`}>
                    <Button leftIcon={<span className="mr-2 inline-flex shrink-0"><Edit className="w-4 h-4" /></span>} size="lg" className="!text-white">
                      Log Progress
                    </Button>
                  </Link>
                </div>
              )}
              <div className="rounded-xl border border-bunker-600/80 bg-bunker-900/95 overflow-hidden flex flex-col">
              <div className="p-3 sm:p-4 border-b border-bunker-700/60 flex-shrink-0">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-bunker-300 mb-3">Buildables</h3>
                <Select
                  options={buildables.map((b) => ({ value: b.id, label: b.name }))}
                  value={selectedBuildableId ?? ''}
                  onChange={(e) => setSelectedBuildableId(e.target.value || null)}
                  placeholder="Select a buildable"
                  className="w-full"
                />
              </div>
              {selectedBuildable && (() => {
                const steps = (selectedBuildable as { steps?: BuildableStep[] }).steps ?? [];
                const buildableSlug = (selectedBuildable as { slug?: string }).slug ?? '';
                const isPackAPunch = buildableSlug === 'pack-a-punch';
                const partIsGuideOnly = (partName: string) => isPackAPunch && partName === 'Opening Pack-a-Punch';
                const { intro, craftingTable, craftingTableLocationSteps, parts } = parseBuildableSteps(steps);
                const togglePartOpen = (partName: string) => {
                  setBuildableOpenParts((prev) => {
                    const next = new Set(prev);
                    if (next.has(partName)) next.delete(partName);
                    else next.add(partName);
                    return next;
                  });
                };
                const isPartOpen = (partName: string) =>
                  buildableOpenParts.size === 0 || !buildableOpenParts.has(partName);
                return (
                  <div className="p-3 sm:p-4 space-y-4">
                    {/* Optional intro (e.g. How it works) — before crafting table */}
                    {intro && (
                      <section className="rounded-lg border border-bunker-600/80 bg-bunker-800/40 overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-bunker-700/60 bg-bunker-800/70">
                          <h4 className="text-sm font-semibold text-element-200 uppercase tracking-wider">
                            How it works
                          </h4>
                        </div>
                        <div className="p-3">
                          <BuildableText
                            text={intro.label.includes(':') ? intro.label.slice(intro.label.indexOf(':') + 1).trim() : intro.label}
                            className="text-sm text-bunker-200 leading-relaxed"
                          />
                        </div>
                      </section>
                    )}
                    {/* Optional guide video (e.g. Jet Gun, NAV Table) — above crafting table */}
                    {(selectedBuildable as { videoEmbedUrl?: string | null }).videoEmbedUrl && (
                      <section className="rounded-lg border border-bunker-600/80 bg-bunker-800/40 overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-bunker-700/60 bg-bunker-800/70">
                          <h4 className="text-sm font-semibold text-element-200 uppercase tracking-wider">
                            Guide video
                          </h4>
                        </div>
                        <div className="aspect-video">
                          <iframe
                            title={`${(selectedBuildable as { name?: string }).name ?? 'Buildable'} guide video`}
                            src={(selectedBuildable as { videoEmbedUrl: string }).videoEmbedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                      </section>
                    )}
                    {/* The Crafting Table — always first, clearly separated */}
                    {craftingTable && (
                      <section className="rounded-lg border border-bunker-600/80 bg-bunker-800/50 overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-bunker-700/60 bg-bunker-800/70">
                          <h4 className="text-sm font-semibold text-element-200 uppercase tracking-wider">
                            The Crafting Table
                          </h4>
                        </div>
                        <div className="p-3 space-y-2">
                          <BuildableText text={craftingTable.label} className="text-sm text-bunker-200" />
                          {craftingTableLocationSteps.length > 0 ? (
                            <div className="space-y-2">
                              {craftingTableLocationSteps.map((locStep, idx) =>
                                locStep.imageUrl ? (
                                  <button
                                    key={locStep.id}
                                    type="button"
                                    onClick={() => setLightboxImageUrl(locStep.imageUrl ? getAssetUrl(locStep.imageUrl) : null)}
                                    className="rounded-lg overflow-hidden border border-bunker-700/60 bg-bunker-800/40 block w-full text-left focus:outline-none focus:ring-2 focus:ring-element-500"
                                  >
                                    <Image
                                      src={getAssetUrl(locStep.imageUrl ?? '')}
                                      alt={locStep.label || `Crafting table location ${idx + 1}`}
                                      width={400}
                                      height={225}
                                      className="w-full h-auto object-contain max-h-48 cursor-pointer"
                                    />
                                    {locStep.label && (
                                      <p className="text-xs text-bunker-400 mt-1 px-2 pb-1.5">{locStep.label}</p>
                                    )}
                                  </button>
                                ) : null
                              )}
                            </div>
                          ) : craftingTable.imageUrl ? (
                            <button
                              type="button"
                              onClick={() => setLightboxImageUrl(craftingTable.imageUrl ? getAssetUrl(craftingTable.imageUrl) : null)}
                              className="rounded-lg overflow-hidden border border-bunker-700/60 bg-bunker-800/40 block w-full text-left focus:outline-none focus:ring-2 focus:ring-element-500"
                            >
                              <Image
                                src={getAssetUrl(craftingTable.imageUrl ?? '')}
                                alt="Crafting table location"
                                width={400}
                                height={225}
                                className="w-full h-auto object-contain max-h-48 cursor-pointer"
                              />
                            </button>
                          ) : null}
                        </div>
                      </section>
                    )}
                    {/* Parts: collapsible; checkboxes (and green when checked) except for guide-only parts e.g. Opening Pack-a-Punch */}
                    {parts.map(({ partName, steps: partSteps }) => {
                      const guideOnly = partIsGuideOnly(partName);
                      const checked = guideOnly ? false : (buildableCheckedParts[partName] ?? false);
                      const open = isPartOpen(partName);
                      return (
                        <section
                          key={partName}
                          className={`rounded-lg border overflow-hidden transition-colors ${
                            !guideOnly && checked
                              ? 'border-element-600/60 bg-element-950/30'
                              : 'border-bunker-700/60 bg-bunker-800/40'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => togglePartOpen(partName)}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-left border-b border-bunker-700/60 transition-colors ${
                              !guideOnly && checked ? 'bg-element-900/40 hover:bg-element-800/50' : 'bg-bunker-800/60 hover:bg-bunker-700/50'
                            }`}
                          >
                            <span className="flex-shrink-0 text-bunker-400">
                              {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                            {!guideOnly && (
                              <label
                                className="flex items-start gap-2 flex-1 min-w-0 cursor-pointer pt-0.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => setBuildablePartChecked(partName, e.target.checked)}
                                  className="rounded border-bunker-500 bg-bunker-800 text-element-500 focus:ring-element-500"
                                />
                                <span className={`text-sm font-medium break-words ${checked ? 'text-element-200' : 'text-bunker-200'}`}>
                                  {partName}
                                </span>
                              </label>
                            )}
                            {guideOnly && (
                              <span className="text-sm font-medium text-bunker-200 flex-1 min-w-0 break-words">
                                {partName}
                              </span>
                            )}
                          </button>
                          {open && (
                            <div className="p-3 pt-2 space-y-3 border-t border-bunker-700/40">
                              {partSteps.map((step, idx) => (
                                <div
                                  key={step.id}
                                  className="flex gap-3 rounded-lg border border-bunker-700/50 bg-bunker-900/50 p-2.5"
                                >
                                  <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md bg-bunker-700/80 border border-bunker-600/60 text-xs font-semibold text-bunker-200">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <BuildableText text={step.label} />
                                    {step.imageUrl && (
                                      <button
                                        type="button"
                                        onClick={() => setLightboxImageUrl(step.imageUrl ? getAssetUrl(step.imageUrl) : null)}
                                        className="rounded-lg overflow-hidden border border-bunker-700/60 bg-bunker-800/40 block w-full text-left focus:outline-none focus:ring-2 focus:ring-element-500"
                                      >
                                        <Image
                                          src={getAssetUrl(step.imageUrl ?? '')}
                                          alt={`${partName} location ${idx + 1}`}
                                          width={400}
                                          height={225}
                                          className="w-full h-auto object-contain max-h-40 cursor-pointer"
                                        />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                );
              })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image lightbox: click any step image to enlarge */}
      <Modal
        isOpen={lightboxImageUrl != null}
        onClose={() => setLightboxImageUrl(null)}
        size="xl"
        className="!max-w-4xl"
      >
        <div className="p-0" onClick={(e) => e.stopPropagation()}>
          {lightboxImageUrl && (
            <Image
              src={lightboxImageUrl}
              alt="Enlarged step reference"
              width={1024}
              height={576}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
