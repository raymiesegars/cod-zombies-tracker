import prisma from './prisma';
import type { AchievementType, Achievement, ChallengeType, Bo4Difficulty } from '@prisma/client';
import { getLevelFromXp } from './ranks';
import { getBo4DifficultiesBelow, BO4_DIFFICULTY_ORDER } from './bo4';

/** Modifier fields on ChallengeLog used to filter which runs count for an achievement (e.g. CLASSIC_ONLY vs MEGA). */
export type ChallengeLogModifiers = {
  firstRoomVariant?: string | null;
  bo3GobbleGumMode?: string | null;
  bo4ElixirMode?: string | null;
  bocwSupportMode?: string | null;
  bo6GobbleGumMode?: string | null;
  bo6SupportMode?: string | null;
  bo7SupportMode?: string | null;
  useFortuneCards?: boolean | null;
  useDirectorsCut?: boolean | null;
  rampageInducerUsed?: boolean | null;
};

// Pre-fetched so we avoid N+1 when checking a bunch of achievements
export type MapAchievementContext = {
  map: { id: string; roundCap: number | null } | null;
  challengeLogs: ({
    challengeType: string;
    roundReached: number;
    killsReached?: number | null;
    scoreReached?: number | null;
    difficulty?: Bo4Difficulty | null;
    completionTimeSeconds?: number | null;
    wawNoJug?: boolean | null;
  } & ChallengeLogModifiers)[];
  easterEggIds: Set<string>;
  /** EE completions with time (for EE speedrun tier achievements) */
  easterEggLogsWithTime: { easterEggId: string; completionTimeSeconds: number }[];
  easterEggRoundsOnMap: { round: number; difficulty: Bo4Difficulty | null }[]; // roundCompleted + difficulty for this map
  /** EE IDs where user checked all steps (unlocks achievement even without EasterEggLog) */
  eeIdsWithAllStepsChecked?: Set<string>;
  /** When map has exactly 1 main quest EE with XP and user has EE speedrun, this is that EE's id */
  eeSpeedrunUnlockEeId?: string | null;
};

type AchievementChecker = (userId: string, criteria: any, achievement: Achievement) => Promise<boolean>;

const achievementCheckers: Record<AchievementType, AchievementChecker> = {
  ROUND_MILESTONE: async (userId, criteria, achievement) => {
    if (!achievement.mapId) return false;
    const { round, isCap } = criteria as { round?: number; isCap?: boolean };
    const targetRound = round as number | undefined;
    if (targetRound == null && !isCap) return false;

    const baseWhere = { userId, mapId: achievement.mapId };
    const difficulty = achievement.difficulty ?? undefined;
    const challengeWhere = difficulty != null ? { ...baseWhere, difficulty } : baseWhere;
    const eeWhere =
      difficulty != null
        ? { ...baseWhere, roundCompleted: { not: null }, difficulty }
        : { ...baseWhere, roundCompleted: { not: null } };

    const [challengeMax, eeMax] = await Promise.all([
      prisma.challengeLog.aggregate({
        where: challengeWhere,
        _max: { roundReached: true },
      }),
      prisma.easterEggLog.aggregate({
        where: eeWhere,
        _max: { roundCompleted: true },
      }),
    ]);
    const maxRound = Math.max(
      challengeMax._max.roundReached ?? 0,
      eeMax._max.roundCompleted ?? 0
    );

    if (isCap) {
      const map = await prisma.map.findUnique({
        where: { id: achievement.mapId },
        select: { roundCap: true },
      });
      if (map?.roundCap == null) return false;
      return maxRound >= map.roundCap;
    }
    return maxRound >= (targetRound as number);
  },

  CHALLENGE_COMPLETE: async (userId, criteria, achievement) => {
    if (!achievement.mapId) return false;
    const { round, kills, score, challengeType, firstRoomVariant, isCap, maxTimeSeconds } = criteria as {
      round?: number;
      kills?: number;
      score?: number;
      challengeType?: string;
      firstRoomVariant?: string;
      isCap?: boolean;
      maxTimeSeconds?: number;
    };
    const targetRound = round as number | undefined;
    const targetKills = kills as number | undefined;
    const targetScore = score as number | undefined;

    // EE speedrun tier (e.g. Call of the Dead Stand-in vs Ensemble Cast): check EasterEggLog by easterEggId
    if (
      achievement.easterEggId &&
      maxTimeSeconds != null &&
      typeof maxTimeSeconds === 'number' &&
      challengeType === 'EASTER_EGG_SPEEDRUN'
    ) {
      const log = await prisma.easterEggLog.findFirst({
        where: {
          userId,
          easterEggId: achievement.easterEggId,
          completionTimeSeconds: { not: null, lte: maxTimeSeconds },
        },
      });
      return !!log;
    }

    // NO_JUG: match logs that are either NO_JUG challenge type or HIGHEST_ROUND + wawNoJug (legacy).
    if (challengeType === 'NO_JUG') {
      const noJugWhere: any = {
        userId,
        mapId: achievement.mapId,
        OR: [
          { challenge: { type: 'NO_JUG' } },
          { wawNoJug: true, challenge: { type: 'HIGHEST_ROUND' } },
        ],
      };
      if (achievement.difficulty != null) noJugWhere.difficulty = achievement.difficulty;
      if (targetRound != null) noJugWhere.roundReached = { gte: targetRound };
      const log = await prisma.challengeLog.findFirst({ where: noJugWhere });
      return !!log;
    }

    const baseWhere: any = {
      userId,
      mapId: achievement.mapId,
      challenge: { type: challengeType as ChallengeType },
    };
    if (achievement.difficulty != null) baseWhere.difficulty = achievement.difficulty;
    if (firstRoomVariant != null && firstRoomVariant !== '') {
      (baseWhere as Record<string, unknown>).firstRoomVariant = firstRoomVariant;
    }
    for (const key of MODIFIER_CRITERIA_KEYS) {
      if (key === 'firstRoomVariant') continue;
      const v = (criteria as Record<string, unknown>)[key];
      if (v !== undefined && v !== null) (baseWhere as Record<string, unknown>)[key] = v;
    }

    // Speedrun tier: qualify if user has a run with completionTimeSeconds <= maxTimeSeconds
    if (maxTimeSeconds != null && typeof maxTimeSeconds === 'number' && challengeType) {
      const log = await prisma.challengeLog.findFirst({
        where: {
          ...baseWhere,
          completionTimeSeconds: { not: null, lte: maxTimeSeconds },
        },
      });
      return !!log;
    }

    if (isCap) {
      const map = await prisma.map.findUnique({
        where: { id: achievement.mapId },
        select: { roundCap: true },
      });
      if (map?.roundCap == null) return false;
      const log = await prisma.challengeLog.findFirst({
        where: { ...baseWhere, roundReached: { gte: map.roundCap } },
      });
      return !!log;
    }

    if (challengeType === 'NO_MANS_LAND' && targetKills != null) {
      (baseWhere as Record<string, unknown>).killsReached = { gte: targetKills };
    } else if (challengeType === 'RUSH' && targetScore != null) {
      (baseWhere as Record<string, unknown>).scoreReached = { gte: targetScore };
    } else if (targetRound != null) {
      baseWhere.roundReached = { gte: targetRound };
    }

    const log = await prisma.challengeLog.findFirst({
      where: baseWhere,
    });
    return !!log;
  },

  EASTER_EGG_COMPLETE: async (userId, criteria, achievement) => {
    const eeId = achievement.easterEggId;
    const mapId = achievement.mapId;
    if (!eeId || !mapId) return false;

    // Path 1: User logged this Easter egg specifically
    const log = await prisma.easterEggLog.findFirst({
      where: { userId, easterEggId: eeId },
    });
    if (log) return true;

    // Path 2: User completed the EE speedrun for this map (only when map has exactly one main quest with XP)
    const mainQuestEesOnMap = await prisma.easterEgg.count({
      where: { mapId, type: 'MAIN_QUEST', xpReward: { gt: 0 }, isActive: true },
    });
    if (mainQuestEesOnMap === 1) {
      const eeSpeedrunLog = await prisma.challengeLog.findFirst({
        where: {
          userId,
          mapId,
          challenge: { type: 'EASTER_EGG_SPEEDRUN' },
        },
      });
      if (eeSpeedrunLog) return true;
    }

    // Path 3: User checked all boxes in the Easter egg guide
    const ee = await prisma.easterEgg.findUnique({
      where: { id: eeId },
      include: { steps: true },
    });
    if (ee && ee.steps.length > 0) {
      const stepIds = ee.steps.map((s) => s.id);
      const checkedCount = await prisma.userEasterEggStepProgress.count({
        where: {
          userId,
          easterEggStepId: { in: stepIds },
        },
      });
      if (checkedCount === ee.steps.length) return true;
    }

    return false;
  },

  MAPS_PLAYED: async (userId, criteria, _achievement) => {
    const { targetCount } = criteria;
    const uniqueMaps = await prisma.challengeLog.groupBy({
      by: ['mapId'],
      where: { userId },
    });
    return uniqueMaps.length >= targetCount;
  },

  TOTAL_ROUNDS: async (userId, criteria, _achievement) => {
    const { targetTotal } = criteria;
    const result = await prisma.challengeLog.aggregate({
      where: { userId },
      _sum: { roundReached: true },
    });
    return (result._sum.roundReached || 0) >= targetTotal;
  },

  STREAK: async (_userId, _criteria, _achievement) => false,

  COLLECTOR: async (userId, criteria, _achievement) => {
    const { targetCount } = criteria;
    const count = await prisma.userAchievement.count({
      where: { userId },
    });
    return count >= targetCount;
  },
};

// Does this user qualify for this achievement?
export async function checkAchievement(
  userId: string,
  achievement: Achievement
): Promise<boolean> {
  const checker = achievementCheckers[achievement.type];
  if (!checker) {
    console.warn(`No checker for achievement type: ${achievement.type}`);
    return false;
  }

  try {
    return await checker(userId, achievement.criteria, achievement);
  } catch (error) {
    console.error(`Error checking achievement ${achievement.id}:`, error);
    return false;
  }
}

// Run through all achievements and unlock whatever the user just earned
export async function checkAllAchievements(userId: string): Promise<Achievement[]> {
  const unlockedAchievements: Achievement[] = [];

  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const qualifies = await checkAchievement(userId, achievement);

    if (qualifies) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: achievement.xpReward },
        },
      });

      unlockedAchievements.push(achievement);
    }
  }

  if (unlockedAchievements.length > 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (user) {
      const { level } = getLevelFromXp(user.totalXp);
      if (level !== user.level) {
        await prisma.user.update({
          where: { id: userId },
          data: { level },
        });
      }
    }
  }

  return unlockedAchievements;
}

/** Minimal achievement fields needed for context-based checks (verified XP, etc.) */
export type AchievementForContextCheck = Pick<
  Achievement,
  'type' | 'criteria' | 'difficulty' | 'easterEggId'
>;

const MODIFIER_CRITERIA_KEYS = [
  'firstRoomVariant',
  'bo3GobbleGumMode',
  'bo4ElixirMode',
  'bocwSupportMode',
  'bo6GobbleGumMode',
  'bo6SupportMode',
  'bo7SupportMode',
  'useFortuneCards',
  'useDirectorsCut',
  'rampageInducerUsed',
] as const;

/** True if the log satisfies any modifier constraints in criteria. If criteria has no modifier keys, returns true. */
function logMatchesModifierCriteria(
  log: MapAchievementContext['challengeLogs'][number],
  criteria: Record<string, unknown>
): boolean {
  for (const key of MODIFIER_CRITERIA_KEYS) {
    const critVal = criteria[key];
    if (critVal === undefined || critVal === null) continue;
    const logVal = log[key as keyof typeof log];
    if (typeof critVal === 'boolean') {
      if (logVal !== critVal) return false;
    } else {
      if (String(logVal) !== String(critVal)) return false;
    }
  }
  return true;
}

// Uses pre-fetched context only (no DB). ROUND_MILESTONE, CHALLENGE_COMPLETE, EASTER_EGG_COMPLETE.
export function checkWithContext(
  achievement: AchievementForContextCheck,
  ctx: MapAchievementContext
): boolean {
  const criteria = achievement.criteria as Record<string, unknown>;
  const achDifficulty = achievement.difficulty ?? null;

  switch (achievement.type) {
    case 'ROUND_MILESTONE': {
      const { round, isCap } = criteria;
      const targetRound = round != null ? Number(round) : undefined;
      if (targetRound == null && !isCap) return false;
      const capRaw = isCap && ctx.map?.roundCap != null ? ctx.map.roundCap : targetRound;
      const cap = capRaw != null ? Number(capRaw) : undefined;
      if (cap == null || Number.isNaN(cap)) return false;
      const challengeLogsFiltered =
        achDifficulty != null
          ? ctx.challengeLogs.filter((l) => l.difficulty === achDifficulty)
          : ctx.challengeLogs;
      const eeRoundsFiltered =
        achDifficulty != null
          ? ctx.easterEggRoundsOnMap.filter((e) => e.difficulty === achDifficulty).map((e) => e.round)
          : ctx.easterEggRoundsOnMap.map((e) => e.round);
      const challengeRounds = challengeLogsFiltered.map((l) => l.roundReached);
      const allRounds = [...challengeRounds, ...eeRoundsFiltered];
      const maxRound = allRounds.length > 0 ? Math.max(...allRounds) : 0;
      return maxRound >= cap;
    }
    case 'CHALLENGE_COMPLETE': {
      const { round, kills, score, challengeType, isCap, maxTimeSeconds } = criteria;
      const targetRound = round != null ? Number(round) : undefined;
      const targetKills = kills != null ? Number(kills) : undefined;
      const targetScore = score != null ? Number(score) : undefined;
      const type = challengeType as string;
      if (!type) return false;
      const logsByDifficulty =
        achDifficulty != null
          ? ctx.challengeLogs.filter((l) => l.difficulty === achDifficulty)
          : ctx.challengeLogs;
      const logs = logsByDifficulty.filter((l) => logMatchesModifierCriteria(l, criteria));
      const maxTime = maxTimeSeconds != null ? Number(maxTimeSeconds) : undefined;
      // EE speedrun tier (e.g. Call of the Dead Stand-in vs Ensemble Cast): check EasterEggLog
      if (
        achievement.easterEggId &&
        maxTime != null &&
        !Number.isNaN(maxTime) &&
        type === 'EASTER_EGG_SPEEDRUN'
      ) {
        return ctx.easterEggLogsWithTime.some(
          (e) =>
            e.easterEggId === achievement.easterEggId && e.completionTimeSeconds <= maxTime
        );
      }
      // Speedrun tier: qualify if any log has completionTimeSeconds <= maxTimeSeconds
      if (maxTime != null && !Number.isNaN(maxTime)) {
        return logs.some(
          (l) =>
            l.challengeType === type &&
            l.completionTimeSeconds != null &&
            l.completionTimeSeconds <= maxTime
        );
      }
      // No Man's Land: use killsReached
      if (type === 'NO_MANS_LAND' && targetKills != null && !Number.isNaN(targetKills)) {
        return logs.some(
          (l) =>
            l.challengeType === type &&
            l.killsReached != null &&
            l.killsReached >= targetKills
        );
      }
      // RUSH: use scoreReached
      if (type === 'RUSH' && targetScore != null && !Number.isNaN(targetScore)) {
        return logs.some(
          (l) =>
            l.challengeType === type &&
            l.scoreReached != null &&
            l.scoreReached >= targetScore
        );
      }
      // NO_JUG: match NO_JUG challenge type or HIGHEST_ROUND + wawNoJug (legacy)
      if (type === 'NO_JUG') {
        const capRaw = isCap && ctx.map?.roundCap != null ? ctx.map.roundCap : targetRound;
        const cap = capRaw != null ? Number(capRaw) : undefined;
        return logs.some(
          (l) =>
            (l.challengeType === 'NO_JUG' || (l.challengeType === 'HIGHEST_ROUND' && l.wawNoJug === true)) &&
            (cap == null || (!Number.isNaN(cap) && l.roundReached >= cap))
        );
      }
      const capRaw = isCap && ctx.map?.roundCap != null ? ctx.map.roundCap : targetRound;
      const cap = capRaw != null ? Number(capRaw) : undefined;
      return logs.some(
        (l) => l.challengeType === type && (cap == null || (!Number.isNaN(cap) && l.roundReached >= cap))
      );
    }
    case 'EASTER_EGG_COMPLETE': {
      const eeId = achievement.easterEggId;
      if (eeId == null) return false;
      if (ctx.easterEggIds.has(eeId)) return true;
      if (ctx.eeIdsWithAllStepsChecked?.has(eeId)) return true;
      if (ctx.eeSpeedrunUnlockEeId === eeId) return true;
      return false;
    }
    default:
      return false;
  }
}

// After logging a challenge or EE on a map: batch-fetch, then run map-specific checks and unlock + XP in one go.
// When dryRun is true, returns what would unlock without creating records.
export async function processMapAchievements(
  userId: string,
  mapId: string,
  dryRun?: boolean
): Promise<Achievement[]> {
  const [achievements, userAchievements, map, challengeLogs, easterEggLogs, stepProgressRaw, mainQuestEe] =
    await Promise.all([
      prisma.achievement.findMany({
        where: {
          isActive: true,
          OR: [{ mapId }, { easterEgg: { mapId } }],
        },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
      prisma.map.findUnique({ where: { id: mapId }, select: { id: true, roundCap: true } }),
      prisma.challengeLog.findMany({
        where: { userId, mapId },
        select: {
          challenge: { select: { type: true } },
          roundReached: true,
          killsReached: true,
          scoreReached: true,
          difficulty: true,
          completionTimeSeconds: true,
          wawNoJug: true,
          firstRoomVariant: true,
          bo3GobbleGumMode: true,
          bo4ElixirMode: true,
          bocwSupportMode: true,
          bo6GobbleGumMode: true,
          bo6SupportMode: true,
          bo7SupportMode: true,
          useFortuneCards: true,
          useDirectorsCut: true,
          rampageInducerUsed: true,
        },
      }),
      prisma.easterEggLog.findMany({
        where: { userId },
        select: { easterEggId: true, mapId: true, roundCompleted: true, difficulty: true, completionTimeSeconds: true },
      }),
      // EE step progress: which EEs on this map have all steps checked (for Fly Trap etc.)
      prisma.userEasterEggStepProgress.findMany({
        where: {
          userId,
          easterEggStep: { easterEgg: { mapId } },
        },
        select: {
          easterEggStepId: true,
          easterEggStep: {
            select: {
              easterEggId: true,
              easterEgg: {
                select: { id: true, steps: { select: { id: true } } },
              },
            },
          },
        },
      }),
      // When map has exactly 1 main quest with XP, EE speedrun unlocks that achievement
      prisma.easterEgg.findFirst({
        where: { mapId, type: 'MAIN_QUEST', xpReward: { gt: 0 }, isActive: true },
        select: { id: true },
      }),
    ]);

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
  const eeIdsWithAllStepsChecked = new Set<string>();
  const checkedByEe = new Map<string, Set<string>>();
  for (const p of stepProgressRaw) {
    const eeId = p.easterEggStep?.easterEggId;
    if (!eeId) continue;
    if (!checkedByEe.has(eeId)) checkedByEe.set(eeId, new Set());
    checkedByEe.get(eeId)!.add(p.easterEggStepId);
  }
  for (const p of stepProgressRaw) {
    const ee = p.easterEggStep?.easterEgg;
    if (!ee || !ee.steps?.length || eeIdsWithAllStepsChecked.has(ee.id)) continue;
    const stepIds = new Set(ee.steps.map((s) => s.id));
    const checked = checkedByEe.get(ee.id);
    if (checked && checked.size === stepIds.size && Array.from(checked).every((id) => stepIds.has(id))) {
      eeIdsWithAllStepsChecked.add(ee.id);
    }
  }
  const hasEeSpeedrunOnMap = challengeLogs.some((l) => l.challenge?.type === 'EASTER_EGG_SPEEDRUN');
  const mainQuestCount = await prisma.easterEgg.count({
    where: { mapId, type: 'MAIN_QUEST', xpReward: { gt: 0 }, isActive: true },
  });
  const eeSpeedrunUnlockEeId =
    mainQuestCount === 1 && hasEeSpeedrunOnMap && mainQuestEe ? mainQuestEe.id : null;
  const easterEggRoundsOnMap = easterEggLogs
    .filter((e) => e.mapId === mapId && e.roundCompleted != null)
    .map((e) => ({ round: e.roundCompleted!, difficulty: e.difficulty ?? null }));
  const easterEggLogsWithTime = easterEggLogs
    .filter((e) => e.completionTimeSeconds != null)
    .map((e) => ({ easterEggId: e.easterEggId, completionTimeSeconds: e.completionTimeSeconds! }));
  const ctx: MapAchievementContext = {
    map,
    eeIdsWithAllStepsChecked,
    eeSpeedrunUnlockEeId,
    challengeLogs: challengeLogs.map((l) => ({
      challengeType: l.challenge.type,
      roundReached: l.roundReached,
      killsReached: l.killsReached ?? undefined,
      scoreReached: l.scoreReached ?? undefined,
      difficulty: l.difficulty ?? undefined,
      completionTimeSeconds: l.completionTimeSeconds ?? undefined,
      wawNoJug: l.wawNoJug ?? undefined,
      firstRoomVariant: l.firstRoomVariant ?? undefined,
      bo3GobbleGumMode: l.bo3GobbleGumMode ?? undefined,
      bo4ElixirMode: l.bo4ElixirMode ?? undefined,
      bocwSupportMode: l.bocwSupportMode ?? undefined,
      bo6GobbleGumMode: l.bo6GobbleGumMode ?? undefined,
      bo6SupportMode: l.bo6SupportMode ?? undefined,
      bo7SupportMode: l.bo7SupportMode ?? undefined,
      useFortuneCards: l.useFortuneCards ?? undefined,
      useDirectorsCut: l.useDirectorsCut ?? undefined,
      rampageInducerUsed: l.rampageInducerUsed ?? undefined,
    })),
    easterEggIds: new Set(easterEggLogs.map((e) => e.easterEggId)),
    easterEggLogsWithTime,
    easterEggRoundsOnMap,
  };

  const toUnlock: Achievement[] = [];
  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;
    const qualifies =
      ['ROUND_MILESTONE', 'CHALLENGE_COMPLETE', 'EASTER_EGG_COMPLETE'].includes(
        achievement.type
      )
        ? checkWithContext(achievement, ctx)
        : await checkAchievement(userId, achievement);
    if (qualifies) {
      toUnlock.push(achievement);
      unlockedIds.add(achievement.id);
    }
  }

  // BO4 cascade: unlocking a higher difficulty also unlocks all lower difficulties (same mapId + slug) and awards their XP
  const cascadeByKey = new Map<string, string>();
  for (const a of toUnlock) {
    const d = a.difficulty as Bo4Difficulty | null;
    if (!d) continue;
    const key = `${a.mapId}:${a.slug}`;
    const existing = cascadeByKey.get(key);
    const orderCur = BO4_DIFFICULTY_ORDER[d as keyof typeof BO4_DIFFICULTY_ORDER];
    const orderExisting = existing != null ? BO4_DIFFICULTY_ORDER[existing as keyof typeof BO4_DIFFICULTY_ORDER] : -1;
    if (orderCur > orderExisting) cascadeByKey.set(key, d);
  }
  const cascadeEntries = Array.from(cascadeByKey.entries());
  for (let i = 0; i < cascadeEntries.length; i++) {
    const [key, maxDifficulty] = cascadeEntries[i]!;
    const [mapId, slug] = key.split(':');
    const below = getBo4DifficultiesBelow(maxDifficulty);
    if (below.length === 0) continue;
    const lowerAchievements = await prisma.achievement.findMany({
      where: { mapId, slug, difficulty: { in: below }, isActive: true },
    });
    for (const lower of lowerAchievements) {
      if (unlockedIds.has(lower.id)) continue;
      toUnlock.push(lower as Achievement);
      unlockedIds.add(lower.id);
    }
  }

  if (toUnlock.length === 0) return [];
  if (dryRun) return toUnlock;

  const totalXpToAdd = toUnlock.reduce((s, a) => s + a.xpReward, 0);

  await prisma.$transaction([
    prisma.userAchievement.createMany({
      data: toUnlock.map((a) => ({ userId, achievementId: a.id })),
    }),
    prisma.user.update({
      where: { id: userId },
      data: { totalXp: { increment: totalXpToAdd } },
    }),
  ]);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const { level } = getLevelFromXp(user.totalXp);
    if (level !== user.level) {
      await prisma.user.update({ where: { id: userId }, data: { level } });
    }
  }

  return toUnlock;
}

/**
 * Check if an achievement is satisfied by VERIFIED runs only.
 * Used for verified XP: only achievements unlocked by verified runs count.
 * For ROUND_MILESTONE, CHALLENGE_COMPLETE, EASTER_EGG_COMPLETE - builds context from verified logs and runs checkWithContext.
 */
export async function isAchievementSatisfiedByVerifiedRun(
  userId: string,
  achievement: AchievementForContextCheck,
  mapId: string
): Promise<boolean> {
  if (!['ROUND_MILESTONE', 'CHALLENGE_COMPLETE', 'EASTER_EGG_COMPLETE'].includes(achievement.type)) {
    return false;
  }

  const [map, challengeLogs, easterEggLogs] = await Promise.all([
    prisma.map.findUnique({ where: { id: mapId }, select: { id: true, roundCap: true } }),
    prisma.challengeLog.findMany({
      where: { userId, mapId, isVerified: true },
      select: {
        challenge: { select: { type: true } },
        roundReached: true,
        killsReached: true,
        scoreReached: true,
        difficulty: true,
        completionTimeSeconds: true,
        wawNoJug: true,
        firstRoomVariant: true,
        bo3GobbleGumMode: true,
        bo4ElixirMode: true,
        bocwSupportMode: true,
        bo6GobbleGumMode: true,
        bo6SupportMode: true,
        bo7SupportMode: true,
        useFortuneCards: true,
        useDirectorsCut: true,
        rampageInducerUsed: true,
      },
    }),
    prisma.easterEggLog.findMany({
      where: { userId, mapId, isVerified: true },
      select: { easterEggId: true, roundCompleted: true, difficulty: true, completionTimeSeconds: true },
    }),
  ]);

  const easterEggRoundsOnMap = easterEggLogs
    .filter((e) => e.roundCompleted != null)
    .map((e) => ({ round: e.roundCompleted!, difficulty: e.difficulty ?? null }));
  const easterEggLogsWithTime = easterEggLogs
    .filter((e) => e.completionTimeSeconds != null)
    .map((e) => ({ easterEggId: e.easterEggId, completionTimeSeconds: e.completionTimeSeconds! }));

  const ctx: MapAchievementContext = {
    map,
    challengeLogs: challengeLogs.map((l) => ({
      challengeType: l.challenge.type,
      roundReached: l.roundReached,
      killsReached: l.killsReached ?? undefined,
      scoreReached: l.scoreReached ?? undefined,
      difficulty: l.difficulty ?? undefined,
      completionTimeSeconds: l.completionTimeSeconds ?? undefined,
      wawNoJug: l.wawNoJug ?? undefined,
      firstRoomVariant: l.firstRoomVariant ?? undefined,
      bo3GobbleGumMode: l.bo3GobbleGumMode ?? undefined,
      bo4ElixirMode: l.bo4ElixirMode ?? undefined,
      bocwSupportMode: l.bocwSupportMode ?? undefined,
      bo6GobbleGumMode: l.bo6GobbleGumMode ?? undefined,
      bo6SupportMode: l.bo6SupportMode ?? undefined,
      bo7SupportMode: l.bo7SupportMode ?? undefined,
      useFortuneCards: l.useFortuneCards ?? undefined,
      useDirectorsCut: l.useDirectorsCut ?? undefined,
      rampageInducerUsed: l.rampageInducerUsed ?? undefined,
    })),
    easterEggIds: new Set(easterEggLogs.map((e) => e.easterEggId)),
    easterEggLogsWithTime,
    easterEggRoundsOnMap,
  };

  return checkWithContext(achievement, ctx);
}

export async function getAchievementProgress(
  userId: string,
  achievement: Achievement
): Promise<{ current: number; target: number; percentage: number }> {
  const criteria = achievement.criteria as any;

  switch (achievement.type) {
    case 'ROUND_MILESTONE': {
      const target = criteria.round ?? criteria.targetRound;
      if (target == null) return { current: 0, target: 1, percentage: 0 };
      if (!achievement.mapId) return { current: 0, target: 1, percentage: 0 };
      const baseWhere = { userId, mapId: achievement.mapId };
      const difficulty = achievement.difficulty ?? undefined;
      const challengeWhere = difficulty != null ? { ...baseWhere, difficulty } : baseWhere;
      const eeWhere =
        difficulty != null
          ? { ...baseWhere, roundCompleted: { not: null }, difficulty }
          : { ...baseWhere, roundCompleted: { not: null } };
      const [challengeMax, eeMax] = await Promise.all([
        prisma.challengeLog.aggregate({
          where: challengeWhere,
          _max: { roundReached: true },
        }),
        prisma.easterEggLog.aggregate({
          where: eeWhere,
          _max: { roundCompleted: true },
        }),
      ]);
      const current = Math.max(
        challengeMax._max.roundReached ?? 0,
        eeMax._max.roundCompleted ?? 0
      );
      return {
        current,
        target,
        percentage: Math.min((current / target) * 100, 100),
      };
    }

    case 'MAPS_PLAYED': {
      const uniqueMaps = await prisma.challengeLog.groupBy({
        by: ['mapId'],
        where: { userId },
      });
      const current = uniqueMaps.length;
      const target = criteria.targetCount;
      return {
        current,
        target,
        percentage: Math.min((current / target) * 100, 100),
      };
    }

    case 'TOTAL_ROUNDS': {
      const result = await prisma.challengeLog.aggregate({
        where: { userId },
        _sum: { roundReached: true },
      });
      const current = result._sum.roundReached || 0;
      const target = criteria.targetTotal;
      return {
        current,
        target,
        percentage: Math.min((current / target) * 100, 100),
      };
    }

    case 'COLLECTOR': {
      const count = await prisma.userAchievement.count({
        where: { userId },
      });
      const target = criteria.targetCount;
      return {
        current: count,
        target,
        percentage: Math.min((count / target) * 100, 100),
      };
    }

    default:
      return { current: 0, target: 1, percentage: 0 };
  }
}

// When a log is deleted, re-check this map and revoke any achievements they no longer qualify for; subtract XP and fix level.
export async function revokeAchievementsForMapAfterDelete(
  userId: string,
  mapId: string
): Promise<{ revoked: Achievement[]; xpSubtracted: number }> {
  const [achievements, userAchievements, map, challengeLogs, easterEggLogs] =
    await Promise.all([
      prisma.achievement.findMany({
        where: { isActive: true, mapId },
      }),
      prisma.userAchievement.findMany({
        where: { userId, achievement: { mapId } },
        include: { achievement: true },
      }),
      prisma.map.findUnique({ where: { id: mapId }, select: { id: true, roundCap: true } }),
      prisma.challengeLog.findMany({
        where: { userId, mapId },
        select: {
          challenge: { select: { type: true } },
          roundReached: true,
          killsReached: true,
          scoreReached: true,
          difficulty: true,
          completionTimeSeconds: true,
          wawNoJug: true,
          firstRoomVariant: true,
          bo3GobbleGumMode: true,
          bo4ElixirMode: true,
          bocwSupportMode: true,
          bo6GobbleGumMode: true,
          bo6SupportMode: true,
          bo7SupportMode: true,
          useFortuneCards: true,
          useDirectorsCut: true,
          rampageInducerUsed: true,
        },
      }),
      prisma.easterEggLog.findMany({
        where: { userId },
        select: { easterEggId: true, mapId: true, roundCompleted: true, difficulty: true, completionTimeSeconds: true },
      }),
    ]);

  const easterEggRoundsOnMap = easterEggLogs
    .filter((e) => e.mapId === mapId && e.roundCompleted != null)
    .map((e) => ({ round: e.roundCompleted!, difficulty: e.difficulty ?? null }));
  const easterEggLogsWithTime = easterEggLogs
    .filter((e) => e.completionTimeSeconds != null)
    .map((e) => ({ easterEggId: e.easterEggId, completionTimeSeconds: e.completionTimeSeconds! }));
  const ctx: MapAchievementContext = {
    map,
    challengeLogs: challengeLogs.map((l) => ({
      challengeType: l.challenge.type,
      roundReached: l.roundReached,
      killsReached: l.killsReached ?? undefined,
      scoreReached: l.scoreReached ?? undefined,
      difficulty: l.difficulty ?? undefined,
      completionTimeSeconds: l.completionTimeSeconds ?? undefined,
      wawNoJug: l.wawNoJug ?? undefined,
      firstRoomVariant: l.firstRoomVariant ?? undefined,
      bo3GobbleGumMode: l.bo3GobbleGumMode ?? undefined,
      bo4ElixirMode: l.bo4ElixirMode ?? undefined,
      bocwSupportMode: l.bocwSupportMode ?? undefined,
      bo6GobbleGumMode: l.bo6GobbleGumMode ?? undefined,
      bo6SupportMode: l.bo6SupportMode ?? undefined,
      bo7SupportMode: l.bo7SupportMode ?? undefined,
      useFortuneCards: l.useFortuneCards ?? undefined,
      useDirectorsCut: l.useDirectorsCut ?? undefined,
      rampageInducerUsed: l.rampageInducerUsed ?? undefined,
    })),
    easterEggIds: new Set(easterEggLogs.map((e) => e.easterEggId)),
    easterEggLogsWithTime,
    easterEggRoundsOnMap,
  };

  const toRevoke: Achievement[] = [];
  for (const ua of userAchievements) {
    const achievement = ua.achievement as Achievement;
    const qualifies =
      ['ROUND_MILESTONE', 'CHALLENGE_COMPLETE', 'EASTER_EGG_COMPLETE'].includes(
        achievement.type
      )
        ? checkWithContext(achievement, ctx)
        : await checkAchievement(userId, achievement);
    if (!qualifies) toRevoke.push(achievement);
  }

  if (toRevoke.length === 0) return { revoked: [], xpSubtracted: 0 };

  const xpToSubtract = toRevoke.reduce((s, a) => s + a.xpReward, 0);

  await prisma.$transaction([
    prisma.userAchievement.deleteMany({
      where: {
        userId,
        achievementId: { in: toRevoke.map((a) => a.id) },
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: { decrement: xpToSubtract },
      },
    }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXp: true, level: true },
  });
  if (user) {
    const newTotalXp = Math.max(0, user.totalXp);
    if (newTotalXp !== user.totalXp) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalXp: newTotalXp },
      });
    }
    const { level } = getLevelFromXp(newTotalXp);
    if (level !== user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level },
      });
    }
  }

  return { revoked: toRevoke, xpSubtracted: xpToSubtract };
}

// Re-lock one achievement (e.g. accidental unlock). Removes unlock, subtracts XP, fixes level. Safe to call if already locked.
export async function revokeSingleAchievement(
  userId: string,
  achievementId: string
): Promise<{ revoked: boolean; xpSubtracted: number }> {
  const ua = await prisma.userAchievement.findFirst({
    where: { userId, achievementId },
    include: { achievement: true },
  });
  if (!ua) return { revoked: false, xpSubtracted: 0 };

  const xpReward = (ua.achievement as { xpReward: number }).xpReward;

  await prisma.$transaction([
    prisma.userAchievement.delete({
      where: { id: ua.id },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { totalXp: { decrement: xpReward } },
    }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXp: true, level: true },
  });
  if (user) {
    const newTotalXp = Math.max(0, user.totalXp);
    if (newTotalXp !== user.totalXp) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalXp: newTotalXp },
      });
    }
    const { level } = getLevelFromXp(newTotalXp);
    if (level !== user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level },
      });
    }
  }

  return { revoked: true, xpSubtracted: xpReward };
}
