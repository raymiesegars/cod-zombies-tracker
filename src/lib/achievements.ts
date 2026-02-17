import prisma from './prisma';
import type { AchievementType, Achievement, ChallengeType } from '@prisma/client';
import { getLevelFromXp } from './ranks';

// Pre-fetched so we avoid N+1 when checking a bunch of achievements
export type MapAchievementContext = {
  map: { id: string; roundCap: number | null } | null;
  challengeLogs: { challengeType: string; roundReached: number }[];
  easterEggIds: Set<string>;
};

type AchievementChecker = (userId: string, criteria: any, achievement: Achievement) => Promise<boolean>;

const achievementCheckers: Record<AchievementType, AchievementChecker> = {
  ROUND_MILESTONE: async (userId, criteria, achievement) => {
    if (!achievement.mapId) return false;
    const { round, isCap } = criteria as { round?: number; isCap?: boolean };
    const targetRound = round as number | undefined;
    if (targetRound == null && !isCap) return false;

    if (isCap) {
      const map = await prisma.map.findUnique({
        where: { id: achievement.mapId },
        select: { roundCap: true },
      });
      if (map?.roundCap == null) return false;
      const log = await prisma.challengeLog.findFirst({
        where: {
          userId,
          mapId: achievement.mapId,
          roundReached: { gte: map.roundCap },
          challenge: { type: 'HIGHEST_ROUND' },
        },
      });
      return !!log;
    }

    const log = await prisma.challengeLog.findFirst({
      where: {
        userId,
        mapId: achievement.mapId,
        roundReached: { gte: targetRound },
        challenge: { type: 'HIGHEST_ROUND' },
      },
    });
    return !!log;
  },

  CHALLENGE_COMPLETE: async (userId, criteria, achievement) => {
    if (!achievement.mapId) return false;
    const { round, challengeType, isCap } = criteria as { round?: number; challengeType?: string; isCap?: boolean };
    const targetRound = round as number | undefined;

    if (isCap) {
      const map = await prisma.map.findUnique({
        where: { id: achievement.mapId },
        select: { roundCap: true },
      });
      if (map?.roundCap == null) return false;
      const log = await prisma.challengeLog.findFirst({
        where: {
          userId,
          mapId: achievement.mapId,
          roundReached: { gte: map.roundCap },
          challenge: { type: challengeType as ChallengeType },
        },
      });
      return !!log;
    }

    const query: any = {
      userId,
      mapId: achievement.mapId,
      challenge: { type: challengeType as ChallengeType },
    };
    if (targetRound != null) query.roundReached = { gte: targetRound };

    const log = await prisma.challengeLog.findFirst({
      where: query,
    });
    return !!log;
  },

  EASTER_EGG_COMPLETE: async (userId, criteria, achievement) => {
    const eeId = achievement.easterEggId;
    if (!eeId) return false;
    const log = await prisma.easterEggLog.findFirst({
      where: { userId, easterEggId: eeId },
    });
    return !!log;
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

// Uses pre-fetched context only (no DB). ROUND_MILESTONE, CHALLENGE_COMPLETE, EASTER_EGG_COMPLETE.
function checkWithContext(
  achievement: Achievement,
  ctx: MapAchievementContext
): boolean {
  const criteria = achievement.criteria as Record<string, unknown>;
  switch (achievement.type) {
    case 'ROUND_MILESTONE': {
      const { round, isCap } = criteria;
      const targetRound = round as number | undefined;
      if (targetRound == null && !isCap) return false;
      const cap = isCap && ctx.map?.roundCap != null ? ctx.map.roundCap : targetRound;
      if (cap == null) return false;
      return ctx.challengeLogs.some(
        (l) => l.challengeType === 'HIGHEST_ROUND' && l.roundReached >= cap
      );
    }
    case 'CHALLENGE_COMPLETE': {
      const { round, challengeType, isCap } = criteria;
      const targetRound = round as number | undefined;
      const type = challengeType as string;
      if (!type) return false;
      const cap = isCap && ctx.map?.roundCap != null ? ctx.map.roundCap : targetRound;
      return ctx.challengeLogs.some(
        (l) => l.challengeType === type && (cap == null || l.roundReached >= cap)
      );
    }
    case 'EASTER_EGG_COMPLETE': {
      const eeId = achievement.easterEggId;
      return eeId != null && ctx.easterEggIds.has(eeId);
    }
    default:
      return false;
  }
}

// After logging a challenge or EE on a map: batch-fetch, then run map-specific checks and unlock + XP in one go.
export async function processMapAchievements(
  userId: string,
  mapId: string
): Promise<Achievement[]> {
  const [achievements, userAchievements, map, challengeLogs, easterEggLogs] =
    await Promise.all([
      prisma.achievement.findMany({ where: { isActive: true, mapId } }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
      prisma.map.findUnique({ where: { id: mapId }, select: { id: true, roundCap: true } }),
      prisma.challengeLog.findMany({
        where: { userId, mapId },
        select: { challenge: { select: { type: true } }, roundReached: true },
      }),
      prisma.easterEggLog.findMany({
        where: { userId },
        select: { easterEggId: true },
      }),
    ]);

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
  const ctx: MapAchievementContext = {
    map,
    challengeLogs: challengeLogs.map((l) => ({
      challengeType: l.challenge.type,
      roundReached: l.roundReached,
    })),
    easterEggIds: new Set(easterEggLogs.map((e) => e.easterEggId)),
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

  if (toUnlock.length === 0) return [];

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

export async function getAchievementProgress(
  userId: string,
  achievement: Achievement
): Promise<{ current: number; target: number; percentage: number }> {
  const criteria = achievement.criteria as any;

  switch (achievement.type) {
    case 'ROUND_MILESTONE': {
      const target = criteria.round ?? criteria.targetRound;
      if (target == null) return { current: 0, target: 1, percentage: 0 };
      const log = await prisma.challengeLog.findFirst({
        where: {
          userId,
          mapId: achievement.mapId ?? undefined,
          challenge: { type: 'HIGHEST_ROUND' },
        },
        orderBy: { roundReached: 'desc' },
      });
      const current = log?.roundReached || 0;
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
        select: { challenge: { select: { type: true } }, roundReached: true },
      }),
      prisma.easterEggLog.findMany({
        where: { userId },
        select: { easterEggId: true },
      }),
    ]);

  const ctx: MapAchievementContext = {
    map,
    challengeLogs: challengeLogs.map((l) => ({
      challengeType: l.challenge.type,
      roundReached: l.roundReached,
    })),
    easterEggIds: new Set(easterEggLogs.map((e) => e.easterEggId)),
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
