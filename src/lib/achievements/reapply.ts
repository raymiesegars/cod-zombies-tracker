/**
 * Reapply achievements for a map after definition changes.
 * Used by admin achievement editor: after editing criteria/xpReward, we
 * 1. Remove UserAchievement for the edited achievement(s)
 * 2. Recalc totalXp for affected users
 * 3. Re-run processMapAchievements for all (userId, mapId) pairs with logs
 * 4. Grant verifiedAt for achievements satisfied by verified runs
 * 5. Recalc verifiedTotalXp for affected users
 */

import prisma from '@/lib/prisma';
import { processMapAchievements } from '@/lib/achievements';
import { grantVerifiedAchievementsForMap } from '@/lib/verified-xp';
import { getLevelFromXp } from '@/lib/ranks';

export type ReapplyResult = {
  achievementId: string;
  mapId: string;
  deletedCount: number;
  pairsProcessed: number;
  newUnlocks: number;
  verifiedGrants: number;
  usersRecalcXp: number;
};

/**
 * Reapply a single achievement: remove existing unlocks, re-evaluate all users with logs on the map.
 * Safe: only affects this achievement and users who have logs on its map.
 */
export async function reapplyAchievement(
  achievementId: string,
  dryRun?: boolean
): Promise<ReapplyResult> {
  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId },
    include: { easterEgg: { select: { mapId: true } } },
  });
  if (!achievement) throw new Error('Achievement not found');
  const mapId = achievement.mapId ?? achievement.easterEgg?.mapId ?? null;
  if (!mapId) throw new Error('Achievement has no map (global achievements not supported for reapply)');

  const result: ReapplyResult = {
    achievementId,
    mapId,
    deletedCount: 0,
    pairsProcessed: 0,
    newUnlocks: 0,
    verifiedGrants: 0,
    usersRecalcXp: 0,
  };

  const uasToDelete = await prisma.userAchievement.findMany({
    where: { achievementId },
    select: { id: true, userId: true },
  });
  result.deletedCount = uasToDelete.length;
  const affectedUserIds = new Set(uasToDelete.map((u) => u.userId));

  if (!dryRun && uasToDelete.length > 0) {
    await prisma.userAchievement.deleteMany({
      where: { achievementId },
    });

    for (const userId of Array.from(affectedUserIds)) {
      const uas = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: { select: { xpReward: true, isActive: true } } },
      });
      const totalXp = uas
        .filter((ua) => ua.achievement.isActive)
        .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
      const verifiedTotalXp = uas
        .filter((ua) => ua.achievement.isActive)
        .reduce(
          (sum, ua) => sum + ((ua as { verifiedAt?: Date | null }).verifiedAt ? ua.achievement.xpReward : 0),
          0
        );
      const { level } = getLevelFromXp(totalXp);
      await prisma.user.update({
        where: { id: userId },
        data: { totalXp, level, verifiedTotalXp },
      });
      result.usersRecalcXp++;
    }
  }

  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { mapId },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { mapId },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);
  const pairSet = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...challengePairs, ...eePairs]) {
    pairSet.set(`${p.userId}:${p.mapId}`, { userId: p.userId, mapId: p.mapId });
  }
  const pairs = Array.from(pairSet.values());
  result.pairsProcessed = pairs.length;

  const pairsWithNewUnlocks = new Map<string, { userId: string; mapId: string }>();
  for (const { userId, mapId: mId } of pairs) {
    const unlocked = await processMapAchievements(userId, mId, dryRun ?? false);
    if (unlocked.length > 0) {
      result.newUnlocks += unlocked.length;
      pairsWithNewUnlocks.set(`${userId}:${mId}`, { userId, mapId: mId });
    }
  }

  if (!dryRun && pairsWithNewUnlocks.size > 0) {
    for (const { userId, mapId: mId } of Array.from(pairsWithNewUnlocks.values())) {
      const [hasVerifiedChallenge, hasVerifiedEe] = await Promise.all([
        prisma.challengeLog.findFirst({ where: { userId, mapId: mId, isVerified: true }, select: { id: true } }).then((r) => !!r),
        prisma.easterEggLog.findFirst({ where: { userId, mapId: mId, isVerified: true }, select: { id: true } }).then((r) => !!r),
      ]);
      if (hasVerifiedChallenge || hasVerifiedEe) {
        await grantVerifiedAchievementsForMap(userId, mId);
        result.verifiedGrants++;
      }
    }
  }

  return result;
}

/**
 * Reapply all achievements on a map (e.g. after adding a new achievement).
 * Does NOT delete any UserAchievement - only runs processMapAchievements to add new unlocks.
 */
export async function reapplyMapAchievements(
  mapId: string,
  dryRun?: boolean
): Promise<{ pairsProcessed: number; newUnlocks: number; verifiedGrants: number }> {
  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { mapId },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { mapId },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);
  const pairSet = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...challengePairs, ...eePairs]) {
    pairSet.set(`${p.userId}:${p.mapId}`, { userId: p.userId, mapId: p.mapId });
  }
  const pairs = Array.from(pairSet.values());

  let newUnlocks = 0;
  const pairsWithNewUnlocks = new Map<string, { userId: string; mapId: string }>();
  for (const { userId, mapId: mId } of pairs) {
    const unlocked = await processMapAchievements(userId, mId, dryRun ?? false);
    if (unlocked.length > 0) {
      newUnlocks += unlocked.length;
      pairsWithNewUnlocks.set(`${userId}:${mId}`, { userId, mapId: mId });
    }
  }

  let verifiedGrants = 0;
  if (!dryRun && pairsWithNewUnlocks.size > 0) {
    for (const { userId, mapId: mId } of Array.from(pairsWithNewUnlocks.values())) {
      const [hasVerifiedChallenge, hasVerifiedEe] = await Promise.all([
        prisma.challengeLog.findFirst({ where: { userId, mapId: mId, isVerified: true }, select: { id: true } }).then((r) => !!r),
        prisma.easterEggLog.findFirst({ where: { userId, mapId: mId, isVerified: true }, select: { id: true } }).then((r) => !!r),
      ]);
      if (hasVerifiedChallenge || hasVerifiedEe) {
        await grantVerifiedAchievementsForMap(userId, mId);
        verifiedGrants++;
      }
    }
  }

  return { pairsProcessed: pairs.length, newUnlocks, verifiedGrants };
}
