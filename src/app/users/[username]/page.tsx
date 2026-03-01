'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
  Logo,
  EasterEggIcon,
  MapIcon,
  MysteryBoxIcon,
  Select,
  PageLoader,
  HelpTrigger,
  Button,
  Modal,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import {
  RoundCounter,
  XpRankDisplay,
  RelockAchievementButton,
  RankHelpContent,
  PendingCoOpSection,
  PendingVerificationSection,
  RunsModal,
  EasterEggsModal,
  MapsModal,
  AchievementsModal,
  WorldRecordsModal,
} from '@/components/game';
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  getAchievementCategory,
  getNonSpeedrunCategoryFilterOptions,
  getSpeedrunCategoryFilterOptions,
  getAllowedSpeedrunCategoriesForMap,
  getAllowedNonSpeedrunCategoriesForMap,
  getSortedCategoryKeys,
  sortAchievementsInCategory,
  isSpeedrunCategory,
  isRestrictedAchievement,
  getRestrictedFilterLabel,
} from '@/lib/achievements/categories';
import { getAssetUrl } from '@/lib/assets';
import { getDisplayAvatarUrl } from '@/lib/avatar';
import { getBo4DifficultyLabel } from '@/lib/bo4';
import { formatCompletionTime } from '@/components/ui/time-input';
import type { UserProfile, UserMapStats } from '@/types';
import {
  Trophy,
  Target,
  Lock,
  Calendar,
  Settings,
  CheckCircle2,
  Award,
  Filter,
  ShieldPlus,
  ShieldOff,
  Loader2,
  UserPlus,
  Check,
  X,
  Crown,
  ShieldCheck,
  ListOrdered,
  BadgeCheck,
  TrendingUp,
  Timer,
  LayoutGrid,
} from 'lucide-react';
import {
  PROFILE_STAT_BLOCK_IDS,
  DEFAULT_PROFILE_STAT_BLOCK_IDS,
  type ProfileStatBlockId,
} from '@/lib/profile-stat-blocks';

type AchievementWithMap = {
  id: string;
  name: string;
  slug: string;
  type: string;
  criteria: { round?: number; challengeType?: string; isCap?: boolean };
  xpReward: number;
  rarity: string;
  mapId: string | null;
  map: {
    id: string;
    name: string;
    slug: string;
    order?: number;
    game: { id: string; name: string; shortName: string; order: number };
  } | null;
  easterEgg?: { id: string; name: string; slug: string } | null;
};

type MapForFilter = {
  id: string;
  name: string;
  slug: string;
  order: number;
  game: { id: string; name: string; shortName: string; order: number };
};

type AchievementsOverview = {
  achievements: AchievementWithMap[];
  unlockedAchievementIds: string[];
  completionByGame: {
    gameId: string;
    gameName: string;
    shortName: string;
    order: number;
    total: number;
    unlocked: number;
    percentage: number;
  }[];
  mapsByGame?: Record<string, MapForFilter[]>;
};

function AchievementsSection({
  overview,
  totalAchievementsFallback,
  filterGame,
  filterMap,
  filterCategory,
  filterSpeedrun,
  filterRestricted,
  onFilterGameChange,
  onFilterMapChange,
  onFilterCategoryChange,
  onFilterSpeedrunChange,
  onFilterRestrictedChange,
  isOwnProfile,
  onRelock,
  isMapAchievementsLoading = false,
}: {
  overview: AchievementsOverview | null;
  totalAchievementsFallback: number; // e.g. 2081 when overview is empty so we show 0/2081 not 0/0
  filterGame: string;
  filterMap: string;
  filterCategory: string;
  filterSpeedrun: string;
  filterRestricted: boolean;
  onFilterGameChange: (v: string) => void;
  onFilterMapChange: (v: string) => void;
  onFilterCategoryChange: (v: string) => void;
  onFilterSpeedrunChange: (v: string) => void;
  onFilterRestrictedChange: (v: boolean) => void;
  isOwnProfile: boolean;
  onRelock?: () => void | Promise<void>;
  isMapAchievementsLoading?: boolean;
}) {
  const unlockedSet = useMemo(
    () => new Set(overview?.unlockedAchievementIds ?? []),
    [overview?.unlockedAchievementIds]
  );

  const games = useMemo(() => overview?.completionByGame ?? [], [overview]);
  const gameOptions = useMemo(
    () => games.map((g) => ({ value: g.gameId, label: `${g.shortName} (${g.percentage}%)` })),
    [games]
  );

  const mapsForFilter = useMemo(() => {
    if (!filterGame || !overview?.mapsByGame) return [];
    return overview.mapsByGame[filterGame] ?? [];
  }, [overview?.mapsByGame, filterGame]);

  const mapOptions = useMemo(
    () => mapsForFilter.map((m) => ({ value: m.id, label: m.name })),
    [mapsForFilter]
  );

  const mapAchievementsForFilterOptions = useMemo(() => {
    if (!overview?.achievements || !filterMap) return [];
    return overview.achievements.filter((a) => a.map?.id === filterMap);
  }, [overview?.achievements, filterMap]);

  const existingCategories = useMemo(
    () => Array.from(new Set(mapAchievementsForFilterOptions.map(getAchievementCategory))),
    [mapAchievementsForFilterOptions]
  );
  const nonSpeedrunCats = existingCategories.filter((c) => !isSpeedrunCategory(c));
  const speedrunCats = existingCategories.filter((c) => isSpeedrunCategory(c));
  const selectedMapData = mapAchievementsForFilterOptions[0]?.map;
  const allowedSpeedrunCats = getAllowedSpeedrunCategoriesForMap(
    selectedMapData?.game?.shortName,
    selectedMapData?.slug
  );
  const allowedNonSpeedrunCats = getAllowedNonSpeedrunCategoriesForMap(
    selectedMapData?.game?.shortName,
    selectedMapData?.slug
  );
  const categoryOptions = getNonSpeedrunCategoryFilterOptions(
    nonSpeedrunCats.length ? nonSpeedrunCats : undefined,
    allowedNonSpeedrunCats
  );
  const speedrunOptions = getSpeedrunCategoryFilterOptions(
    speedrunCats.length ? speedrunCats : undefined,
    allowedSpeedrunCats
  );

  const filteredAchievements = useMemo(() => {
    if (!overview?.achievements || !filterMap) return [];
    return overview.achievements
      .filter((a) => a.map?.id === filterMap)
      .filter((a) => !filterCategory || getAchievementCategory(a) === filterCategory)
      .filter((a) => !filterSpeedrun || getAchievementCategory(a) === filterSpeedrun)
      .filter((a) => !filterRestricted || isRestrictedAchievement(a));
  }, [overview?.achievements, filterMap, filterCategory, filterSpeedrun, filterRestricted]);

  const groupedByMapThenCategory = useMemo(() => {
    const byMap = new Map<
      string,
      { mapName: string; mapSlug: string; gameShortName: string; gameOrder: number; mapOrder: number; byCategory: Record<string, AchievementWithMap[]> }
    >();
    for (const a of filteredAchievements) {
      const map = a.map;
      if (!map) continue;
      const cat = getAchievementCategory(a);
      if (!byMap.has(map.id)) {
        byMap.set(map.id, {
          mapName: map.name,
          mapSlug: map.slug,
          gameShortName: map.game.shortName,
          gameOrder: map.game.order,
          mapOrder: map.order ?? 0,
          byCategory: {},
        });
      }
      const entry = byMap.get(map.id)!;
      if (!entry.byCategory[cat]) entry.byCategory[cat] = [];
      entry.byCategory[cat].push(a);
    }
    return Array.from(byMap.entries())
      .map(([mapId, data]) => ({ mapId, ...data }))
      .sort((a, b) => a.gameOrder - b.gameOrder || a.mapOrder - b.mapOrder || a.mapName.localeCompare(b.mapName));
  }, [filteredAchievements]);

  if (!overview) {
    return (
      <section>
        <h2 className="text-lg sm:text-xl font-zombies text-white mb-3 sm:mb-4 tracking-wide">
          Achievements
        </h2>
        <Card variant="bordered">
          <CardContent className="py-8 sm:py-12 text-center">
            <PageLoader message="Loading achievements…" inline />
          </CardContent>
        </Card>
      </section>
    );
  }

  const totalAchievements = filterMap
    ? (overview.achievements.length || 0)
    : games.reduce((s, g) => s + g.total, 0) || totalAchievementsFallback;
  const totalUnlocked = filterMap
    ? overview.unlockedAchievementIds.length
    : games.reduce((s, g) => s + g.unlocked, 0);
  const overallPct = totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <h2 className="text-lg sm:text-xl font-zombies text-white tracking-wide">
          Achievements
        </h2>
        <div className="flex items-center gap-2 text-sm text-bunker-400">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-white font-medium">{totalUnlocked}</span>
          <span>/</span>
          <span>{totalAchievements}</span>
          <span className="text-bunker-500">({overallPct}% complete)</span>
        </div>
      </div>

      {/* Filters: game, map, then achievement type (lazy loads achievements when map selected) */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-bunker-500 flex-shrink-0" />
        <Select
          options={[{ value: '', label: 'Select game…' }, ...gameOptions]}
          value={filterGame}
          onChange={(e) => {
            onFilterGameChange(e.target.value);
            onFilterMapChange('');
            onFilterCategoryChange('');
            onFilterSpeedrunChange('');
          }}
          className="w-full sm:w-44"
        />
        <Select
          options={[
            { value: '', label: filterGame ? 'Select map…' : 'Select game first' },
            ...mapOptions,
          ]}
          value={filterMap}
          onChange={(e) => {
            onFilterMapChange(e.target.value);
            onFilterCategoryChange('');
            onFilterSpeedrunChange('');
          }}
          className="w-full sm:w-56"
          disabled={!filterGame}
        />
        <Select
          options={categoryOptions}
          value={filterCategory}
          onChange={(e) => {
            onFilterCategoryChange(e.target.value);
            if (e.target.value) onFilterSpeedrunChange('');
          }}
          className="w-full sm:w-44"
          disabled={!filterMap}
        />
        {speedrunOptions.length > 1 && (
          <>
            <span className="text-xs font-medium text-bunker-400 w-full sm:w-auto">Speedruns:</span>
            <Select
              options={speedrunOptions}
              value={filterSpeedrun}
              onChange={(e) => {
                onFilterSpeedrunChange(e.target.value);
                if (e.target.value) onFilterCategoryChange('');
              }}
              className="w-full sm:w-44"
              disabled={!filterMap}
            />
          </>
        )}
        {filterMap && mapAchievementsForFilterOptions.some(isRestrictedAchievement) && (
          <label className="flex items-center gap-2 w-full sm:w-auto cursor-pointer select-none">
            <span className="text-xs font-medium text-bunker-400">Harder only:</span>
            <input
              type="checkbox"
              checked={filterRestricted}
              onChange={(e) => onFilterRestrictedChange(e.target.checked)}
              className="sr-only"
              aria-label="Show only harder achievements"
            />
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border border-bunker-500 bg-bunker-800 transition-colors ${
                filterRestricted ? 'bg-blood-500/20' : ''
              }`}
              aria-hidden
            >
              <span
                className={`pointer-events-none absolute top-0.5 block h-5 w-5 rounded-full bg-bunker-400 shadow ring-0 transition-transform ${
                  filterRestricted ? 'translate-x-5 bg-blood-500 left-0.5' : 'translate-x-0 left-0.5'
                }`}
              />
            </span>
            <span className="text-sm text-bunker-300">
              {getRestrictedFilterLabel(selectedMapData?.game?.shortName, filterCategory || filterSpeedrun || null)}
            </span>
          </label>
        )}
      </div>

      {/* Scrollable list - only shown when map selected (achievements lazy-loaded) */}
      <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-bunker-700/50 bg-bunker-900/30 pr-1">
        {!filterMap ? (
          <div className="py-12 sm:py-16 text-center">
            <Award className="w-10 h-10 sm:w-12 sm:h-12 text-bunker-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-bunker-400">
              Select a game and map above to view achievements.
            </p>
          </div>
        ) : isMapAchievementsLoading ? (
          <div className="py-12 sm:py-16 text-center">
            <PageLoader message="Loading achievements…" inline />
          </div>
        ) : groupedByMapThenCategory.length === 0 ? (
          <div className="py-12 sm:py-16 text-center">
            <Award className="w-10 h-10 sm:w-12 sm:h-12 text-bunker-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-bunker-400">
              {(filterCategory || filterSpeedrun || filterRestricted)
                ? (filterRestricted
                    ? `No ${getRestrictedFilterLabel(selectedMapData?.game?.shortName, filterCategory || filterSpeedrun || null).toLowerCase()} achievements for this map.`
                    : `No ${(ACHIEVEMENT_CATEGORY_LABELS[filterCategory || filterSpeedrun] ?? (filterCategory || filterSpeedrun)).toLowerCase()} achievements found for this map.`)
                : 'No achievements found for this map.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {groupedByMapThenCategory.map(({ mapId, mapName, mapSlug, gameShortName, byCategory }) => {
              const sortedCats = getSortedCategoryKeys(byCategory);
              return (
                <Card key={mapId} variant="bordered">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Link
                          href={`/maps/${mapSlug}`}
                          className="hover:text-blood-400 transition-colors"
                        >
                          {mapName}
                        </Link>
                        <Badge variant="default" size="sm">
                          {gameShortName}
                        </Badge>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sortedCats.map((cat) => (
                      <div key={cat}>
                        <p className="text-xs font-medium text-bunker-200 uppercase tracking-wider mb-2">
                          {ACHIEVEMENT_CATEGORY_LABELS[cat] ?? cat}
                        </p>
                        <ul className="space-y-2">
                          {sortAchievementsInCategory(byCategory[cat]).map((a) => {
                            const unlocked = unlockedSet.has(a.id);
                            const c = a.criteria as { round?: number; isCap?: boolean; maxTimeSeconds?: number } | undefined;
                            const subLabel = c?.round != null ? `Round ${c.round}` : null;
                            const maxTime = c?.maxTimeSeconds != null ? formatCompletionTime(c.maxTimeSeconds) : null;
                            const displayName = a.easterEgg?.name ?? a.name;
                            return (
                              <li
                                key={a.id}
                                className={
                                  unlocked
                                    ? 'flex items-center justify-between gap-3 py-2 pl-3 pr-4 rounded-lg bg-military-950/30 border border-military-800/50'
                                    : 'flex items-center justify-between gap-3 py-2 pl-3 pr-4 rounded-lg bg-bunker-800/30 border border-bunker-700/50'
                                }
                              >
                                <div className="flex items-center gap-3 min-w-0 min-h-[2.75rem]">
                                  {unlocked ? (
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-military-400" />
                                  ) : (
                                    <Lock className="w-5 h-5 flex-shrink-0 text-bunker-500" />
                                  )}
                                  <div className={`min-w-0 flex flex-col justify-center ${subLabel ? 'min-h-[2.25rem]' : ''}`}>
                                    <p className="font-medium text-sm text-white truncate">{displayName}</p>
                                    {subLabel && (
                                      <p className="text-xs text-bunker-400">{subLabel}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="flex items-center flex-shrink-0 justify-end gap-2 min-w-0 sm:min-w-[11rem]">
                                  <span className="text-sm font-medium text-blood-400 whitespace-nowrap text-right">+{a.xpReward.toLocaleString()} XP</span>
                                  <span className="w-8 flex shrink-0 justify-center">
                                    {isOwnProfile && unlocked && onRelock ? (
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
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { profile: currentProfile, user: currentUser, isProfileSettingUp, refreshProfile } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mapStats, setMapStats] = useState<UserMapStats[]>([]);
  const [statsTotals, setStatsTotals] = useState<{
    totalMaps: number;
    totalMainEasterEggs: number;
    totalChallenges: number;
    totalAchievements: number;
    easterEggAchievementsUnlocked?: number;
    totalRuns?: number;
    verifiedRuns?: number;
    highestRound?: number;
    avgRoundLoggedRuns?: number;
    speedrunCompletions?: number;
    mysteryBoxCompletions?: number;
    xpRank?: number;
    verifiedXpRank?: number;
    worldRecords?: number;
    verifiedWorldRecords?: number;
  }>({
    totalMaps: 0,
    totalMainEasterEggs: 0,
    totalChallenges: 0,
    totalAchievements: 0,
  });
  const [profileStatBlockSelection, setProfileStatBlockSelection] = useState<ProfileStatBlockId[]>([]);
  const [profileStatBlocksSaving, setProfileStatBlocksSaving] = useState(false);
  const [profileStatBlocksEditOpen, setProfileStatBlocksEditOpen] = useState(false);
  const [modalBlockTooltip, setModalBlockTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [achievementsOverview, setAchievementsOverview] = useState<AchievementsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [achievementFilterGame, setAchievementFilterGame] = useState('');
  const [achievementFilterMap, setAchievementFilterMap] = useState('');
  const [achievementFilterCategory, setAchievementFilterCategory] = useState('');
  const [achievementFilterSpeedrun, setAchievementFilterSpeedrun] = useState('');
  const [achievementFilterRestricted, setAchievementFilterRestricted] = useState(false);
  const [achievementMapLoading, setAchievementMapLoading] = useState(false);
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);

  const [runsModalOpen, setRunsModalOpen] = useState<'all' | 'verified' | null>(null);
  const [easterEggsModalOpen, setEasterEggsModalOpen] = useState(false);
  const [mapsModalOpen, setMapsModalOpen] = useState(false);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);
  const [worldRecordsModalOpen, setWorldRecordsModalOpen] = useState(false);
  const [adminMe, setAdminMe] = useState<{ isAdmin: boolean; isSuperAdmin: boolean } | null>(null);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [demoteModalOpen, setDemoteModalOpen] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [friendActionLoading, setFriendActionLoading] = useState<'add' | 'accept' | 'deny' | null>(null);

  // so "Your runs" vs "Back to runs" and map links point the right place
  const isOwnProfile = Boolean(profile && currentProfile && profile.id === currentProfile.id);
  const viewedUserIsAdmin = Boolean(profile && 'isAdmin' in profile && (profile as { isAdmin?: boolean }).isAdmin);

  // when they confirm a coop run we refetch so XP and map highs update without a full reload
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ username?: string }>).detail;
      if (detail?.username === username) setProfileRefreshTrigger((t) => t + 1);
    };
    window.addEventListener('cod-tracker-profile-refresh-requested', handler);
    return () => window.removeEventListener('cod-tracker-profile-refresh-requested', handler);
  }, [username]);

  // Admin: can current user promote/demote? Only fetch when logged in.
  useEffect(() => {
    const profileId = currentProfile?.id;
    if (!profileId) {
      setAdminMe(null);
      return;
    }
    let cancelled = false;
    fetch('/api/admin/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { isAdmin: false, isSuperAdmin: false }))
      .then((data) => {
        if (!cancelled) setAdminMe(data);
      })
      .catch(() => {
        if (!cancelled) setAdminMe(null);
      });
    return () => { cancelled = true; };
  }, [currentProfile?.id]);

  const refetchAchievementsAfterRelock = useCallback(async () => {
    await refreshProfile?.();
    if (!username) return;
    const url = achievementFilterMap
      ? `/api/users/${username}/achievements-overview?mapId=${encodeURIComponent(achievementFilterMap)}`
      : `/api/users/${username}/achievements-overview`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setAchievementsOverview((prev) => (prev ? { ...prev, ...data } : data));
    }
  }, [username, achievementFilterMap, refreshProfile]);

  const handlePromoteToAdmin = useCallback(async () => {
    if (!profile?.id) return;
    setAdminActionLoading(true);
    try {
      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to promote');
      setPromoteModalOpen(false);
      setProfileRefreshTrigger((t) => t + 1);
      const meRes = await fetch('/api/admin/me', { cache: 'no-store' });
      if (meRes.ok) setAdminMe(await meRes.json());
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAdminActionLoading(false);
    }
  }, [profile?.id]);

  const handleRemoveAdmin = useCallback(async () => {
    if (!profile?.id) return;
    setAdminActionLoading(true);
    try {
      const res = await fetch('/api/admin/demote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to remove admin');
      setDemoteModalOpen(false);
      setProfileRefreshTrigger((t) => t + 1);
      const meRes = await fetch('/api/admin/me', { cache: 'no-store' });
      if (meRes.ok) setAdminMe(await meRes.json());
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAdminActionLoading(false);
    }
  }, [profile?.id]);

  const friendshipStatus = (profile as { friendshipStatus?: 'friends' | 'pending_sent' | 'pending_received' | null })?.friendshipStatus ?? null;
  const friendRequestId = (profile as { friendRequestId?: string })?.friendRequestId as string | undefined;
  const friendCount = (profile as { friendCount?: number } | null)?.friendCount ?? 0;

  const handleAddFriend = useCallback(async () => {
    if (!profile?.id) return;
    setFriendActionLoading('add');
    try {
      const res = await fetch('/api/me/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: profile.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setProfileRefreshTrigger((t) => t + 1);
        window.dispatchEvent(new Event('cod-tracker-friends-updated'));
      } else alert(data.error ?? 'Failed to send friend request');
    } catch {
      alert('Failed to send friend request');
    } finally {
      setFriendActionLoading(null);
    }
  }, [profile?.id]);

  const handleAcceptFriend = useCallback(async () => {
    if (!friendRequestId) return;
    setFriendActionLoading('accept');
    try {
      const res = await fetch('/api/me/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendRequestId }),
      });
      if (res.ok) {
        setProfileRefreshTrigger((t) => t + 1);
        window.dispatchEvent(new Event('cod-tracker-friends-updated'));
        window.dispatchEvent(new Event('cod-tracker-notifications-refresh'));
      } else alert('Failed to accept friend request');
    } catch {
      alert('Failed to accept friend request');
    } finally {
      setFriendActionLoading(null);
    }
  }, [friendRequestId]);

  const handleDenyFriend = useCallback(async () => {
    if (!friendRequestId) return;
    setFriendActionLoading('deny');
    try {
      const res = await fetch('/api/me/friends/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendRequestId }),
      });
      if (res.ok) {
        setProfileRefreshTrigger((t) => t + 1);
        window.dispatchEvent(new Event('cod-tracker-notifications-refresh'));
      } else alert('Failed to deny friend request');
    } catch {
      alert('Failed to deny friend request');
    } finally {
      setFriendActionLoading(null);
    }
  }, [friendRequestId]);

  const handleSaveProfileStatBlocks = useCallback(async () => {
    setProfileStatBlocksSaving(true);
    try {
      const res = await fetch('/api/users/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileStatBlocks: {
            selectedBlockIds: profileStatBlockSelection.length === 4 ? profileStatBlockSelection : DEFAULT_PROFILE_STAT_BLOCK_IDS,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to save');
      }
      setProfileStatBlocksEditOpen(false);
      refreshProfile?.();
      setProfileRefreshTrigger((t) => t + 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setProfileStatBlocksSaving(false);
    }
  }, [profileStatBlockSelection, refreshProfile]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const [profileRes, statsRes, overviewRes] = await Promise.all([
          fetch(`/api/users/${username}`),
          fetch(`/api/users/${username}/stats`),
          fetch(`/api/users/${username}/achievements-overview`),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          const raw = (profileData as { profileStatBlocks?: { selectedBlockIds?: unknown[] } })?.profileStatBlocks?.selectedBlockIds;
          const ids = Array.isArray(raw) && raw.length === 4 && raw.every((x) => typeof x === 'string' && PROFILE_STAT_BLOCK_IDS.includes(x as ProfileStatBlockId))
            ? (raw as ProfileStatBlockId[])
            : DEFAULT_PROFILE_STAT_BLOCK_IDS;
          setProfileStatBlockSelection(ids);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setMapStats(statsData.mapStats ?? []);
          setStatsTotals({
            totalMaps: statsData.totalMaps ?? 0,
            totalMainEasterEggs: statsData.totalMainEasterEggs ?? 0,
            totalChallenges: statsData.totalChallenges ?? 0,
            totalAchievements: statsData.totalAchievements ?? 0,
            easterEggAchievementsUnlocked: statsData.easterEggAchievementsUnlocked ?? 0,
            totalRuns: statsData.totalRuns ?? 0,
            verifiedRuns: statsData.verifiedRuns ?? 0,
            highestRound: statsData.highestRound ?? 0,
            avgRoundLoggedRuns: statsData.avgRoundLoggedRuns ?? 0,
            speedrunCompletions: statsData.speedrunCompletions ?? 0,
            mysteryBoxCompletions: statsData.mysteryBoxCompletions ?? 0,
            xpRank: statsData.xpRank ?? undefined,
            verifiedXpRank: statsData.verifiedXpRank ?? undefined,
            worldRecords: statsData.worldRecords ?? 0,
            verifiedWorldRecords: statsData.verifiedWorldRecords ?? 0,
          });
        }

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setAchievementsOverview(overviewData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [username, profileRefreshTrigger]);

  // achievements load when they pick a map, clear when filter is cleared
  useEffect(() => {
    if (!achievementFilterMap) {
      setAchievementMapLoading(false);
      setAchievementsOverview((prev) =>
        prev ? { ...prev, achievements: [], unlockedAchievementIds: [] } : null
      );
      return;
    }
    if (!username) return;
    let cancelled = false;
    setAchievementMapLoading(true);
    async function fetchMapAchievements() {
      try {
        const res = await fetch(
          `/api/users/${username}/achievements-overview?mapId=${encodeURIComponent(achievementFilterMap)}`
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setAchievementsOverview((prev) =>
          prev ? { ...prev, ...data } : data
        );
      } catch (err) {
        if (!cancelled) console.error('Error fetching map achievements:', err);
      } finally {
        if (!cancelled) setAchievementMapLoading(false);
      }
    }
    fetchMapAchievements();
    return () => { cancelled = true; };
  }, [username, achievementFilterMap]);

  const isViewingOwnProfileDuringSetup =
    currentUser && !currentProfile && isProfileSettingUp && params.username === currentUser.id;

  if (isLoading || isViewingOwnProfileDuringSetup) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <PageLoader
          message={isViewingOwnProfileDuringSetup ? 'Setting up your profile...' : 'Loading profile...'}
          fullScreen
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Logo size="xl" animated={false} className="mx-auto mb-4 opacity-50" />
          <h1 className="text-xl sm:text-2xl font-zombies text-white mb-4">User Not Found</h1>
          <p className="text-sm sm:text-base text-bunker-400">This user doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // their profile is private and we're not them
  if (!profile.isPublic && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-bunker-600 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-zombies text-white mb-4">Private Profile</h1>
          <p className="text-sm sm:text-base text-bunker-400">
            This user&apos;s profile is private.
          </p>
        </div>
      </div>
    );
  }

  // dashboard counts and completion %
  const { totalMaps, totalMainEasterEggs, totalAchievements } = statsTotals;
  const totalMapsPlayed = mapStats.length;
  const totalEasterEggs = statsTotals.easterEggAchievementsUnlocked ?? mapStats.filter((m) => m.hasCompletedMainEE).length;
  // avg of each map's high round (no score = 0)
  const sumHighestRounds = mapStats.reduce((acc, m) => acc + m.highestRound, 0);
  const avgRound = totalMaps > 0 ? sumHighestRounds / totalMaps : 0;
  const avgRoundDisplay = avgRound.toFixed(2);
  const mapsPct = totalMaps > 0 ? Math.round((totalMapsPlayed / totalMaps) * 100) : 0;
  const easterEggsPct = totalMainEasterEggs > 0 ? Math.round((totalEasterEggs / totalMainEasterEggs) * 100) : 0;
  // completion by game (same source as achievements section; overview only has unlocked ids when a map is selected)
  const achievementsUnlocked = achievementsOverview?.completionByGame
    ? achievementsOverview.completionByGame.reduce((s, g) => s + g.unlocked, 0)
    : (achievementsOverview?.unlockedAchievementIds?.length ?? 0);
  const achievementsPct = totalAchievements > 0 ? Math.round((achievementsUnlocked / totalAchievements) * 100) : 0;

  const selectedBlockIds = profileStatBlockSelection.length === 4 ? profileStatBlockSelection : DEFAULT_PROFILE_STAT_BLOCK_IDS;

  // Verified-related blocks use element (verified blue) consistently
  const verifiedIconClass = 'text-element-400';

  const getBlockDisplay = (blockId: ProfileStatBlockId) => {
    const tooltips: Record<ProfileStatBlockId, string> = {
      'maps-played': 'Maps you’ve played at least one run on, out of all maps in the tracker.',
      'easter-eggs': 'Main-quest Easter eggs you’ve completed (unlocked the achievement), out of all main-quest EEs.',
      'avg-round': "Your average best round across all maps; maps you haven't played count as 0.",
      achievements: 'Map achievements you’ve unlocked, out of all available achievements.',
      'world-records': 'Leaderboard combinations across the site where you’re ranked #1.',
      'verified-world-records': 'Verified leaderboard combinations where you’re ranked #1.',
      'total-runs': 'Total challenge and Easter egg runs you’ve logged.',
      'verified-runs': 'Runs that have been verified by an admin.',
      'verified-rank': 'Your position on the global verified XP leaderboard.',
      rank: 'Your position on the global XP leaderboard (all XP).',
      'highest-round': 'Average round across every run you’ve logged (each run counts once).',
      speedruns: 'Speedrun challenge runs you’ve completed (time-based).',
      'mystery-box': "Mystery Box challenges you've completed for bonus XP.",
    };
    switch (blockId) {
      case 'maps-played':
        return { label: 'Maps Played', value: `${totalMapsPlayed}/${totalMaps}`, suffix: `(${mapsPct}%)`, icon: MapIcon, iconClass: 'text-blood-400', tooltip: tooltips['maps-played'] };
      case 'easter-eggs':
        return { label: 'Easter Eggs', value: `${totalEasterEggs}/${totalMainEasterEggs}`, suffix: `(${easterEggsPct}%)`, icon: EasterEggIcon, iconClass: 'text-element-400', tooltip: tooltips['easter-eggs'] };
      case 'avg-round':
        return { label: 'Map avg', value: avgRoundDisplay, suffix: null, icon: Trophy, iconClass: 'text-yellow-400', tooltip: tooltips['avg-round'] };
      case 'achievements':
        return { label: 'Achievements', value: `${achievementsUnlocked}/${totalAchievements}`, suffix: `(${achievementsPct}%)`, icon: Award, iconClass: 'text-yellow-400', tooltip: tooltips.achievements };
      case 'world-records':
        return { label: "Rank 1's", value: String(statsTotals.worldRecords ?? 0), suffix: null, icon: Crown, iconClass: 'text-yellow-400', tooltip: tooltips['world-records'] };
      case 'verified-world-records':
        return { label: "Verified Rank 1's", value: String(statsTotals.verifiedWorldRecords ?? 0), suffix: null, icon: ShieldCheck, iconClass: verifiedIconClass, tooltip: tooltips['verified-world-records'] };
      case 'total-runs':
        return { label: 'Total Runs', value: String(statsTotals.totalRuns ?? 0), suffix: null, icon: ListOrdered, iconClass: 'text-blood-400', tooltip: tooltips['total-runs'] };
      case 'verified-runs':
        return { label: 'Verified Runs', value: String(statsTotals.verifiedRuns ?? 0), suffix: null, icon: BadgeCheck, iconClass: verifiedIconClass, tooltip: tooltips['verified-runs'] };
      case 'verified-rank':
        return { label: 'Verified Rank', value: statsTotals.verifiedXpRank != null ? `#${statsTotals.verifiedXpRank}` : '—', suffix: null, icon: TrendingUp, iconClass: verifiedIconClass, tooltip: tooltips['verified-rank'] };
      case 'rank':
        return { label: 'XP Rank', value: statsTotals.xpRank != null ? `#${statsTotals.xpRank}` : '—', suffix: null, icon: TrendingUp, iconClass: 'text-blood-400', tooltip: tooltips.rank };
      case 'highest-round':
        return {
          label: 'Run avg',
          value: (statsTotals.avgRoundLoggedRuns ?? 0) > 0 ? (statsTotals.avgRoundLoggedRuns ?? 0).toFixed(2) : '—',
          suffix: null,
          icon: Target,
          iconClass: 'text-blood-400',
          tooltip: tooltips['highest-round'],
        };
      case 'speedruns':
        return { label: 'Speedruns', value: String(statsTotals.speedrunCompletions ?? 0), suffix: null, icon: Timer, iconClass: 'text-yellow-400', tooltip: tooltips.speedruns };
      case 'mystery-box':
        return { label: 'Box Challenges', value: String(statsTotals.mysteryBoxCompletions ?? 0), suffix: null, icon: MysteryBoxIcon, iconClass: 'text-amber-400', tooltip: tooltips['mystery-box'] };
      default:
        return { label: blockId, value: '—', suffix: null, icon: Award, iconClass: 'text-bunker-400', tooltip: 'Stat block.' };
    }
  };

  return (
    <div className="min-h-screen bg-bunker-950">
      {/* Profile Header */}
      <div className="bg-bunker-900 border-b border-bunker-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <Avatar
              src={getDisplayAvatarUrl(profile)}
              fallback={profile.displayName || profile.username}
              size="xl"
              className="mx-auto sm:mx-0"
            />

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-zombies text-white tracking-wide">
                  {profile.displayName || profile.username}
                </h1>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  {isOwnProfile && (
                    <Link href="/settings" aria-label="Settings">
                      <Settings className="w-5 h-5 text-bunker-400 hover:text-blood-400" />
                    </Link>
                  )}
                  {!isOwnProfile && adminMe?.isSuperAdmin && !viewedUserIsAdmin && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setPromoteModalOpen(true)}
                      leftIcon={<ShieldPlus className="w-4 h-4" />}
                    >
                      Promote to admin
                    </Button>
                  )}
                  {!isOwnProfile && adminMe?.isSuperAdmin && viewedUserIsAdmin && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setDemoteModalOpen(true)}
                      leftIcon={<ShieldOff className="w-4 h-4" />}
                    >
                      Remove admin
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-bunker-400 text-sm sm:text-base">@{profile.username}</p>
              
              {/* XP Display + rank help */}
              <div className="mt-3 sm:mt-4 flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <XpRankDisplay
                    totalXp={profile.totalXp}
                    verifiedTotalXp={(profile as { verifiedTotalXp?: number }).verifiedTotalXp ?? 0}
                    showBothXpRanks={(currentProfile as { showBothXpRanks?: boolean })?.showBothXpRanks ?? false}
                    preferredRankView={(currentProfile as { preferredRankView?: 'total' | 'verified' | null })?.preferredRankView ?? 'total'}
                    onPreferredRankViewChange={
                      currentProfile
                        ? async (view) => {
                            try {
                              const res = await fetch('/api/users/profile/update', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ preferredRankView: view }),
                              });
                              if (res.ok) refreshProfile?.();
                            } catch {
                              // ignore
                            }
                          }
                        : undefined
                    }
                  />
                </div>
                <HelpTrigger
                  title="How leveling and ranks work"
                  description="Where to earn XP and every rank’s threshold."
                  modalSize="xl"
                >
                  <RankHelpContent />
                </HelpTrigger>
              </div>

              {/* Friends, join date, and bio – responsive flex layout */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-4">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-bunker-400">
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>{friendCount} {friendCount === 1 ? 'friend' : 'friends'}</span>
                  </div>
                  {!isOwnProfile && currentProfile && (
                    <>
                      {friendshipStatus === null && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleAddFriend}
                          disabled={friendActionLoading !== null}
                          leftIcon={friendActionLoading === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        >
                          {friendActionLoading === 'add' ? 'Sending…' : 'Add friend'}
                        </Button>
                      )}
                      {friendshipStatus === 'pending_sent' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-bunker-600 bg-bunker-800/50 text-sm text-bunker-300">
                          Request sent
                        </span>
                      )}
                      {friendshipStatus === 'pending_received' && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAcceptFriend}
                            disabled={friendActionLoading !== null}
                            leftIcon={friendActionLoading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            className="!bg-element-600 hover:!bg-element-500"
                          >
                            {friendActionLoading === 'accept' ? 'Accepting…' : 'Accept'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDenyFriend}
                            disabled={friendActionLoading !== null}
                            leftIcon={friendActionLoading === 'deny' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          >
                            {friendActionLoading === 'deny' ? 'Denying…' : 'Deny'}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-bunker-400 shrink-0">
                  <Calendar className="w-4 h-4 shrink-0" />
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                {profile.bio && profile.bio.trim() && (
                  <div className="w-full sm:max-w-xs lg:max-w-sm sm:flex-1 sm:min-w-0">
                    <p className="text-xs sm:text-sm text-bunker-300 line-clamp-3 break-words">
                      {profile.bio.trim()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isOwnProfile && (
          <div className="mb-6 sm:mb-8">
            {adminMe?.isAdmin ? (
              <Tabs defaultValue="coop" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="coop">Pending Co-Op Runs</TabsTrigger>
                  <TabsTrigger value="verification">Pending Verification</TabsTrigger>
                </TabsList>
                <TabsContent value="coop">
                  <PendingCoOpSection />
                </TabsContent>
                <TabsContent value="verification">
                  <PendingVerificationSection />
                </TabsContent>
              </Tabs>
            ) : (
              <PendingCoOpSection />
            )}
          </div>
        )}

        {/* Stats Overview */}
        <div className="mb-6 sm:mb-8">
          {isOwnProfile && (
            <div className="flex justify-end mb-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setProfileStatBlocksEditOpen(true)}
                leftIcon={<LayoutGrid className="w-4 h-4" />}
              >
                Customize blocks
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {selectedBlockIds.map((blockId) => {
              const { label, value, suffix, icon: Icon, iconClass, tooltip } = getBlockDisplay(blockId);
              const isRunsBlock = blockId === 'total-runs' || blockId === 'verified-runs';
              const isEasterEggsBlock = blockId === 'easter-eggs';
              const isMapsBlock = blockId === 'maps-played';
              const isAchievementsBlock = blockId === 'achievements';
              const isWorldRecordsBlock = blockId === 'world-records' || blockId === 'verified-world-records';
              const handleClick = isRunsBlock
                ? () => setRunsModalOpen(blockId === 'verified-runs' ? 'verified' : 'all')
                : isEasterEggsBlock
                  ? () => setEasterEggsModalOpen(true)
                  : isMapsBlock
                    ? () => setMapsModalOpen(true)
                    : isAchievementsBlock
                      ? () => setAchievementsModalOpen(true)
                      : isWorldRecordsBlock
                        ? () => setWorldRecordsModalOpen(true)
                        : undefined;
              const Wrapper = handleClick ? 'button' : 'div';
              return (
                <div key={blockId} className="group relative">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bunker-800 rounded-lg shadow-xl border border-bunker-700 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 w-56 text-center">
                    <p className="text-xs text-bunker-300">{tooltip}</p>
                  </div>
                  <Wrapper
                    {...(handleClick
                      ? {
                          type: 'button' as const,
                          onClick: handleClick,
                          className: 'w-full text-left cursor-pointer hover:opacity-90 transition-opacity',
                        }
                      : { className: 'w-full' })}
                  >
                    <Card variant="bordered" className={`text-center p-3 sm:p-4 ${handleClick ? 'cursor-pointer' : ''}`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconClass} mx-auto mb-2`} />
                      <p className="text-xl sm:text-2xl font-zombies text-white">
                        {value}
                        {suffix != null && <span className={`${iconClass}/80`}> {suffix}</span>}
                      </p>
                      <p className="text-xs text-bunker-400">{label}</p>
                    </Card>
                  </Wrapper>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: pick 4 stat blocks (own profile only) */}
        {isOwnProfile && (
          <Modal
            isOpen={profileStatBlocksEditOpen}
            onClose={() => {
              setModalBlockTooltip(null);
              const raw = (profile as { profileStatBlocks?: { selectedBlockIds?: unknown[] } })?.profileStatBlocks?.selectedBlockIds;
              const saved =
                Array.isArray(raw) && raw.length === 4 && raw.every((x) => typeof x === 'string' && PROFILE_STAT_BLOCK_IDS.includes(x as ProfileStatBlockId))
                  ? (raw as ProfileStatBlockId[])
                  : DEFAULT_PROFILE_STAT_BLOCK_IDS;
              setProfileStatBlockSelection(saved);
              setProfileStatBlocksEditOpen(false);
            }}
            title="Choose 4 dashboard blocks"
            description="Select exactly 4 stats to show on your profile. These will be visible to you and anyone who visits your profile."
          >
            <div className="space-y-4">
              <p className="text-sm text-bunker-400">
                Selected: {profileStatBlockSelection.length}/4
                {profileStatBlockSelection.length !== 4 && ' — pick 4 to save.'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
                {PROFILE_STAT_BLOCK_IDS.map((id) => {
                  const { label, tooltip } = getBlockDisplay(id);
                  const checked = profileStatBlockSelection.includes(id);
                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-2 min-h-[2.75rem] py-2 px-3 rounded-lg border cursor-pointer transition-colors ${
                        checked ? 'border-blood-500 bg-blood-500/10' : 'border-bunker-600 bg-bunker-800/50 hover:border-bunker-500'
                      }`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setModalBlockTooltip({ text: tooltip, x: rect.left + rect.width / 2, y: rect.bottom + 6 });
                      }}
                      onMouseLeave={() => setModalBlockTooltip(null)}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setProfileStatBlockSelection((prev) => {
                            if (checked) return prev.filter((x) => x !== id);
                            if (prev.length >= 4) return prev;
                            return [...prev, id];
                          });
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-white flex-1 break-words">{label}</span>
                      {checked && <Check className="w-4 h-4 text-blood-400 shrink-0" />}
                    </label>
                  );
                })}
              </div>
              {typeof document !== 'undefined' &&
                modalBlockTooltip &&
                createPortal(
                  <div
                    className="fixed z-[10000] w-56 -translate-x-1/2 px-3 py-2 bg-bunker-800 rounded-lg shadow-xl border border-bunker-700 text-center"
                    style={{ left: modalBlockTooltip.x, top: modalBlockTooltip.y }}
                  >
                    <p className="text-xs text-bunker-300">{modalBlockTooltip.text}</p>
                  </div>,
                  document.body
                )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setProfileStatBlocksEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={profileStatBlockSelection.length !== 4 || profileStatBlocksSaving}
                  onClick={handleSaveProfileStatBlocks}
                  leftIcon={profileStatBlocksSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {profileStatBlocksSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Maps Played Section */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-zombies text-white mb-3 sm:mb-4 tracking-wide">
            Maps Played
          </h2>
          {mapStats.length > 0 ? (
            <div className="max-h-[380px] overflow-y-auto rounded-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {mapStats.map((stats) => (
                <Link
                  key={stats.mapId}
                  href={isOwnProfile ? `/maps/${stats.mapSlug}` : `/users/${profile?.username ?? username}/maps/${stats.mapSlug}/runs`}
                >
                  <Card variant="bordered" interactive className="h-full">
                    <CardContent className="p-3 sm:py-4">
                      <div className="relative aspect-[4/3] mb-2 sm:mb-3 rounded-lg overflow-hidden bg-bunker-800">
                        {stats.mapImageUrl ? (
                          <Image
                            src={getAssetUrl(stats.mapImageUrl)}
                            alt={stats.mapName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Logo size="md" animated={false} className="opacity-30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-bunker-950/80 via-transparent to-transparent" />
                        {/* Bottom-left: round at bottom, Easter egg above it */}
                        {(stats.hasCompletedMainEE || stats.highestRound > 0) && (
                          <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1">
                            {stats.hasCompletedMainEE && (
                              <div className="flex items-center justify-center p-1.5 rounded-lg bg-bunker-950/90 border border-element-600/50 shadow-lg">
                                <EasterEggIcon className="w-4 h-4 sm:w-5 sm:h-5 text-element-400" />
                              </div>
                            )}
                            <RoundCounter round={stats.highestRound} size="xs" animated={false} />
                          </div>
                        )}
                        {/* Bottom-right: BO4 difficulty */}
                        {stats.gameShortName === 'BO4' && stats.highestRoundDifficulty && (
                          <div className="absolute bottom-2 right-2">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-bunker-500/80 bg-bunker-900/90 text-bunker-300">
                              {getBo4DifficultyLabel(stats.highestRoundDifficulty)}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-xs sm:text-sm text-white truncate">
                        {stats.mapName}
                      </h3>
                      <div className="flex items-center justify-between mt-1 sm:mt-2">
                        <Badge variant="default" size="sm">
                          {stats.gameShortName}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              </div>
            </div>
          ) : (
            <Card variant="bordered">
              <CardContent className="py-8 sm:py-12 text-center">
                <Logo size="lg" animated={false} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base text-bunker-400">
                  {isOwnProfile ? "You haven't logged any progress yet." : "No maps played yet."}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/maps"
                    className="inline-block mt-4 text-blood-400 hover:text-blood-300 text-sm"
                  >
                    Start tracking your progress →
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Achievements Section - full list with filters and completion by game */}
        <AchievementsSection
          overview={achievementsOverview}
          totalAchievementsFallback={statsTotals.totalAchievements}
          filterGame={achievementFilterGame}
          filterMap={achievementFilterMap}
          filterCategory={achievementFilterCategory}
          filterSpeedrun={achievementFilterSpeedrun}
          filterRestricted={achievementFilterRestricted}
          onFilterGameChange={setAchievementFilterGame}
          onFilterMapChange={setAchievementFilterMap}
          onFilterCategoryChange={setAchievementFilterCategory}
          onFilterSpeedrunChange={setAchievementFilterSpeedrun}
          onFilterRestrictedChange={setAchievementFilterRestricted}
          isOwnProfile={isOwnProfile}
          onRelock={refetchAchievementsAfterRelock}
          isMapAchievementsLoading={achievementMapLoading}
        />
      </div>

      {/* Runs modal (total / verified) */}
      <RunsModal
        isOpen={runsModalOpen !== null}
        onClose={() => setRunsModalOpen(null)}
        username={username}
        title={runsModalOpen === 'verified' ? 'Verified Runs' : 'Total Runs'}
        verifiedOnly={runsModalOpen === 'verified'}
      />

      <EasterEggsModal
        isOpen={easterEggsModalOpen}
        onClose={() => setEasterEggsModalOpen(false)}
        username={username}
      />

      <WorldRecordsModal
        isOpen={worldRecordsModalOpen}
        onClose={() => setWorldRecordsModalOpen(false)}
        username={username}
      />

      <MapsModal
        isOpen={mapsModalOpen}
        onClose={() => setMapsModalOpen(false)}
        username={username}
        isOwnProfile={isOwnProfile}
      />

      <AchievementsModal
        isOpen={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
        username={username}
      />

      {/* Promote to admin confirmation */}
      <Modal
        isOpen={promoteModalOpen}
        onClose={() => !adminActionLoading && setPromoteModalOpen(false)}
        title="Promote to admin?"
        description={`${profile?.displayName || profile?.username || 'This user'} will be able to promote others to admin and see admin-only features.`}
        size="sm"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setPromoteModalOpen(false)} disabled={adminActionLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePromoteToAdmin}
            disabled={adminActionLoading}
            leftIcon={adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldPlus className="w-4 h-4" />}
          >
            {adminActionLoading ? 'Promoting…' : 'Promote to admin'}
          </Button>
        </div>
      </Modal>

      {/* Remove admin confirmation */}
      <Modal
        isOpen={demoteModalOpen}
        onClose={() => !adminActionLoading && setDemoteModalOpen(false)}
        title="Remove admin?"
        description={`${profile?.displayName || profile?.username || 'This user'} will no longer have admin access. Only super admins can remove admin.`}
        size="sm"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setDemoteModalOpen(false)} disabled={adminActionLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRemoveAdmin}
            disabled={adminActionLoading}
            leftIcon={adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
          >
            {adminActionLoading ? 'Removing…' : 'Remove admin'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
