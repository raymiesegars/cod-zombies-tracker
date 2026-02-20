'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { RoundCounter, XpDisplay, RelockAchievementButton, RankHelpContent, PendingCoOpSection, PendingVerificationSection } from '@/components/game';
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  getAchievementCategory,
  getAchievementCategoryFilterOptions,
  getSortedCategoryKeys,
  sortAchievementsByXp,
} from '@/lib/achievements/categories';
import { getAssetUrl } from '@/lib/assets';
import { getDisplayAvatarUrl } from '@/lib/avatar';
import { getBo4DifficultyLabel } from '@/lib/bo4';
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
} from 'lucide-react';

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
  onFilterGameChange,
  onFilterMapChange,
  onFilterCategoryChange,
  isOwnProfile,
  onRelock,
  isMapAchievementsLoading = false,
}: {
  overview: AchievementsOverview | null;
  totalAchievementsFallback: number; // e.g. 2081 when overview is empty so we show 0/2081 not 0/0
  filterGame: string;
  filterMap: string;
  filterCategory: string;
  onFilterGameChange: (v: string) => void;
  onFilterMapChange: (v: string) => void;
  onFilterCategoryChange: (v: string) => void;
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

  const filteredAchievements = useMemo(() => {
    if (!overview?.achievements || !filterMap) return [];
    return overview.achievements
      .filter((a) => a.map?.id === filterMap)
      .filter((a) => !filterCategory || getAchievementCategory(a) === filterCategory);
  }, [overview?.achievements, filterMap, filterCategory]);

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
          }}
          className="w-full sm:w-56"
          disabled={!filterGame}
        />
        <Select
          options={getAchievementCategoryFilterOptions()}
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          className="w-full sm:w-44"
          disabled={!filterMap}
        />
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
              {filterCategory
                ? `No ${(ACHIEVEMENT_CATEGORY_LABELS[filterCategory] ?? filterCategory).toLowerCase()} achievements found for this map.`
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
                          {sortAchievementsByXp(byCategory[cat]).map((a) => {
                            const unlocked = unlockedSet.has(a.id);
                            const c = a.criteria;
                            const subLabel = c?.isCap ? 'Cap' : c?.round != null ? `Round ${c.round}` : null;
                            const displayName = a.easterEgg?.name ?? a.name;
                            return (
                              <li
                                key={a.id}
                                className={
                                  unlocked
                                    ? 'flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-military-950/30 border border-military-800/50'
                                    : 'flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-bunker-800/30 border border-bunker-700/50'
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
                                <span className="flex items-center flex-shrink-0 min-w-[11rem] gap-2">
                                  <span className="text-sm font-medium text-blood-400 min-w-[7.5rem] whitespace-nowrap text-left">+{a.xpReward.toLocaleString()} XP</span>
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
  }>({ totalMaps: 0, totalMainEasterEggs: 0, totalChallenges: 0, totalAchievements: 0 });
  const [achievementsOverview, setAchievementsOverview] = useState<AchievementsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [achievementFilterGame, setAchievementFilterGame] = useState('');
  const [achievementFilterMap, setAchievementFilterMap] = useState('');
  const [achievementFilterCategory, setAchievementFilterCategory] = useState('');
  const [achievementMapLoading, setAchievementMapLoading] = useState(false);
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);

  const [adminMe, setAdminMe] = useState<{ isAdmin: boolean; isSuperAdmin: boolean } | null>(null);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [demoteModalOpen, setDemoteModalOpen] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);

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
    if (!currentProfile) {
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
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setMapStats(statsData.mapStats ?? []);
          setStatsTotals({
            totalMaps: statsData.totalMaps ?? 0,
            totalMainEasterEggs: statsData.totalMainEasterEggs ?? 0,
            totalChallenges: statsData.totalChallenges ?? 0,
            totalAchievements: statsData.totalAchievements ?? 0,
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
  const totalEasterEggs = mapStats.filter((m) => m.hasCompletedMainEE).length;
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
                  <XpDisplay totalXp={profile.totalXp} />
                </div>
                <HelpTrigger
                  title="How leveling and ranks work"
                  description="Where to earn XP and every rank’s threshold."
                  modalSize="xl"
                >
                  <RankHelpContent />
                </HelpTrigger>
              </div>

              {/* Join date */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-bunker-400 mt-3 sm:mt-4">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card variant="bordered" className="text-center p-3 sm:p-4">
            <MapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blood-400 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-zombies text-white">
              {totalMapsPlayed}/{totalMaps} <span className="text-blood-400/80">({mapsPct}%)</span>
            </p>
            <p className="text-xs text-bunker-400">Maps Played</p>
          </Card>
          <Card variant="bordered" className="text-center p-3 sm:p-4">
            <EasterEggIcon className="w-5 h-5 sm:w-6 sm:h-6 text-element-400 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-zombies text-white">
              {totalEasterEggs}/{totalMainEasterEggs} <span className="text-element-400/80">({easterEggsPct}%)</span>
            </p>
            <p className="text-xs text-bunker-400">Easter Eggs</p>
          </Card>
          <Card variant="bordered" className="text-center p-3 sm:p-4">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-zombies text-white">{avgRoundDisplay}</p>
            <p className="text-xs text-bunker-400">Avg Round</p>
          </Card>
          <Card variant="bordered" className="text-center p-3 sm:p-4">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-zombies text-white">
              {achievementsUnlocked}/{totalAchievements} <span className="text-yellow-400/80">({achievementsPct}%)</span>
            </p>
            <p className="text-xs text-bunker-400">Achievements</p>
          </Card>
        </div>

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
          onFilterGameChange={setAchievementFilterGame}
          onFilterMapChange={setAchievementFilterMap}
          onFilterCategoryChange={setAchievementFilterCategory}
          isOwnProfile={isOwnProfile}
          onRelock={refetchAchievementsAfterRelock}
          isMapAchievementsLoading={achievementMapLoading}
        />
      </div>

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
