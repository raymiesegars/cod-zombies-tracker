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
