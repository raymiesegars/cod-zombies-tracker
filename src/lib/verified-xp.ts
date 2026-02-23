import prisma from '@/lib/prisma';
import { isAchievementSatisfiedByVerifiedRun } from '@/lib/achievements';

/**
 * When a run is verified, grant verified status ONLY to map-specific achievements
 * that are satisfied by verified runs (not all unlocked achievements on the map).
 * Recalculates verifiedTotalXp.
 * Returns the new verifiedTotalXp and the XP gained from this verification.
 */
export async function grantVerifiedAchievementsForMap(
  userId: string,
  mapId: string,
  options?: { skipUserUpdate?: boolean }
): Promise<{ verifiedTotalXp: number; xpGained: number }> {
  const now = new Date();
  const skipUserUpdate = options?.skipUserUpdate ?? false;

  const user = skipUserUpdate
    ? null
    : await prisma.user.findUnique({
        where: { id: userId },
        select: { verifiedTotalXp: true },
      });
  const previousVerifiedTotalXp = user?.verifiedTotalXp ?? 0;

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
    return { verifiedTotalXp: 0, xpGained: 0 };
  }

  // Recalculate verifiedTotalXp for this user
  const verified = await prisma.userAchievement.findMany({
    where: { userId, verifiedAt: { not: null } },
    select: { achievement: { select: { xpReward: true } } },
  });
  const verifiedTotalXp = verified.reduce((s, ua) => s + ua.achievement.xpReward, 0);

  await prisma.user.update({
    where: { id: userId },
    data: { verifiedTotalXp },
  });

  const xpGained = Math.max(0, verifiedTotalXp - previousVerifiedTotalXp);
  return { verifiedTotalXp, xpGained };
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
    select: { achievement: { select: { xpReward: true } } },
  });
  const verifiedTotalXp = verified.reduce((s, ua) => s + ua.achievement.xpReward, 0);
  await prisma.user.update({
    where: { id: userId },
    data: { verifiedTotalXp },
  });
}
