import prisma from '@/lib/prisma';
import { isAchievementSatisfiedByVerifiedRun } from '@/lib/achievements';
import { claimVerifiedLevelMilestones } from '@/lib/verified-level-milestones';

/**
 * When a run is verified, grant verified status ONLY to map-specific achievements
 * that are satisfied by verified runs (not all unlocked achievements on the map).
 * Recalculates verifiedTotalXp.
 * Returns the new verifiedTotalXp and the XP gained from this verification.
 */
export async function grantVerifiedAchievementsForMap(
  userId: string,
  mapId: string,
  options?: { skipUserUpdate?: boolean; recordMilestones?: boolean }
): Promise<{ verifiedTotalXp: number; verifiedCustomZombiesTotalXp: number; xpGained: number }> {
  const now = new Date();
  const skipUserUpdate = options?.skipUserUpdate ?? false;
  const recordMilestones = options?.recordMilestones ?? false;

  const user = skipUserUpdate
    ? null
    : await prisma.user.findUnique({
        where: { id: userId },
        select: { verifiedTotalXp: true, verifiedCustomZombiesTotalXp: true },
      });
  const previousVerifiedTotalXp = user?.verifiedTotalXp ?? 0;
  const previousVerifiedCustomXp = user?.verifiedCustomZombiesTotalXp ?? 0;

  // Get all UNLOCKED map-specific achievements (mapId = X or easterEgg.mapId = X)
  const userAchievements = await prisma.userAchievement.findMany({
    where: {
      userId,
      achievement: {
        isActive: true,
        OR: [{ mapId }, { easterEgg: { mapId } }],
      },
    },
    include: {
      achievement: {
        select: {
          id: true,
          type: true,
          mapId: true,
          easterEggId: true,
          criteria: true,
          difficulty: true,
          xpReward: true,
          easterEgg: { select: { mapId: true } },
        },
      },
    },
  });

  const toVerify: string[] = [];
  for (const ua of userAchievements) {
    if (ua.verifiedAt != null) continue;
    const ach = ua.achievement;
    const effectiveMapId = ach.mapId ?? ach.easterEgg?.mapId ?? null;
    if (!effectiveMapId) continue;
    const satisfied = await isAchievementSatisfiedByVerifiedRun(userId, ach, effectiveMapId);
    if (satisfied) toVerify.push(ua.id);
  }

  if (toVerify.length > 0) {
    await prisma.userAchievement.updateMany({
      where: { id: { in: toVerify } },
      data: { verifiedAt: now },
    });
  }

  if (skipUserUpdate) {
    return { verifiedTotalXp: 0, verifiedCustomZombiesTotalXp: 0, xpGained: 0 };
  }

  const verified = await prisma.userAchievement.findMany({
    where: { userId, verifiedAt: { not: null } },
    select: {
      achievement: {
        select: {
          xpReward: true,
          map: { select: { game: { select: { shortName: true } } } },
          easterEgg: { select: { map: { select: { game: { select: { shortName: true } } } } } },
        },
      },
    },
  });

  let verifiedTotalXp = 0;
  let verifiedCustomZombiesTotalXp = 0;
  for (const ua of verified) {
    const shortName = ua.achievement.map?.game?.shortName ?? ua.achievement.easterEgg?.map?.game?.shortName ?? null;
    const xp = ua.achievement.xpReward;
    if (shortName === 'BO3_CUSTOM') {
      verifiedCustomZombiesTotalXp += xp;
    } else {
      verifiedTotalXp += xp;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { verifiedTotalXp, verifiedCustomZombiesTotalXp },
  });

  if (recordMilestones) {
    await claimVerifiedLevelMilestones(userId, previousVerifiedTotalXp, verifiedTotalXp);
  }

  const xpGained = Math.max(
    0,
    verifiedTotalXp - previousVerifiedTotalXp + (verifiedCustomZombiesTotalXp - previousVerifiedCustomXp)
  );
  return { verifiedTotalXp, verifiedCustomZombiesTotalXp, xpGained };
}

/**
 * When a verified run is deleted, re-evaluate all map achievements that currently
 * have verifiedAt. Clear verifiedAt for any that are no longer satisfied by
 * verified runs, then recalculate verifiedTotalXp.
 */
export async function revokeVerifiedAchievementsForMapIfNeeded(
  userId: string,
  mapId: string
): Promise<void> {
  const userAchievements = await prisma.userAchievement.findMany({
    where: {
      userId,
      verifiedAt: { not: null },
      achievement: {
        isActive: true,
        OR: [{ mapId }, { easterEgg: { mapId } }],
      },
    },
    include: {
      achievement: {
        select: {
          id: true,
          type: true,
          mapId: true,
          easterEggId: true,
          criteria: true,
          difficulty: true,
          easterEgg: { select: { mapId: true } },
        },
      },
    },
  });

  const toRevoke: string[] = [];
  for (const ua of userAchievements) {
    const ach = ua.achievement;
    const effectiveMapId = ach.mapId ?? ach.easterEgg?.mapId ?? null;
    if (!effectiveMapId) continue;
    const stillSatisfied = await isAchievementSatisfiedByVerifiedRun(userId, ach, effectiveMapId);
    if (!stillSatisfied) toRevoke.push(ua.id);
  }

  if (toRevoke.length > 0) {
    await prisma.userAchievement.updateMany({
      where: { id: { in: toRevoke } },
      data: { verifiedAt: null },
    });
  }

  const verified = await prisma.userAchievement.findMany({
    where: { userId, verifiedAt: { not: null } },
    select: {
      achievement: {
        select: {
          xpReward: true,
          map: { select: { game: { select: { shortName: true } } } },
          easterEgg: { select: { map: { select: { game: { select: { shortName: true } } } } } },
        },
      },
    },
  });

  let verifiedTotalXp = 0;
  let verifiedCustomZombiesTotalXp = 0;
  for (const ua of verified) {
    const shortName = ua.achievement.map?.game?.shortName ?? ua.achievement.easterEgg?.map?.game?.shortName ?? null;
    const xp = ua.achievement.xpReward;
    if (shortName === 'BO3_CUSTOM') {
      verifiedCustomZombiesTotalXp += xp;
    } else {
      verifiedTotalXp += xp;
    }
  }
  await prisma.user.update({
    where: { id: userId },
    data: { verifiedTotalXp, verifiedCustomZombiesTotalXp },
  });
}
