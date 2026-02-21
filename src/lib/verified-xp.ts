import prisma from '@/lib/prisma';

/**
 * When a run is verified, grant verified status to all map-specific achievements
 * the user has unlocked on that map, and recalculate their verifiedTotalXp.
 * Returns the new verifiedTotalXp and the XP gained from this verification.
 */
export async function grantVerifiedAchievementsForMap(
  userId: string,
  mapId: string
): Promise<{ verifiedTotalXp: number; xpGained: number }> {
  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { verifiedTotalXp: true },
  });
  const previousVerifiedTotalXp = user?.verifiedTotalXp ?? 0;

  // Get all map-specific achievements for this map
  const mapAchievementIds = await prisma.achievement.findMany({
    where: { mapId },
    select: { id: true, xpReward: true },
  });

  if (mapAchievementIds.length === 0) {
    return { verifiedTotalXp: previousVerifiedTotalXp, xpGained: 0 };
  }

  // Update UserAchievement: set verifiedAt for any unlocked achievement on this map that isn't already verified
  await prisma.userAchievement.updateMany({
    where: {
      userId,
      achievementId: { in: mapAchievementIds.map((a) => a.id) },
      verifiedAt: null,
    },
    data: { verifiedAt: now },
  });

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
 * When a verified run is deleted, if the user has no other verified run on this map,
 * clear verifiedAt on all map achievements and recalculate verifiedTotalXp.
 */
export async function revokeVerifiedAchievementsForMapIfNeeded(
  userId: string,
  mapId: string
): Promise<void> {
  const [challengeCount, easterEggCount] = await Promise.all([
    prisma.challengeLog.count({ where: { userId, mapId, isVerified: true } }),
    prisma.easterEggLog.count({ where: { userId, mapId, isVerified: true } }),
  ]);
  if (challengeCount > 0 || easterEggCount > 0) return;

  await prisma.userAchievement.updateMany({
    where: {
      userId,
      achievement: { mapId },
      verifiedAt: { not: null },
    },
    data: { verifiedAt: null },
  });

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
