import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/lib/prisma';
import { checkAchievement, processMapAchievements } from '../src/lib/achievements';
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';
import { getLevelFromXp } from '../src/lib/ranks';

const root = path.resolve(__dirname, '..');
for (const file of ['.env', '.env.local']) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[2]!.replace(/^["']|["']$/g, '').trim();
    process.env[match[1]!] = value;
  }
}

async function main() {
  const map = await prisma.map.findUnique({
    where: { slug: 'der-anfang' },
    select: { id: true, slug: true, game: { select: { shortName: true } } },
  });
  if (!map) throw new Error('Map der-anfang not found.');
  if (map.game?.shortName !== 'VANGUARD') throw new Error(`Map der-anfang is not VANGUARD (found ${map.game?.shortName ?? 'unknown'}).`);

  const targetAchievements = await prisma.achievement.findMany({
    where: {
      mapId: map.id,
      type: 'CHALLENGE_COMPLETE',
      isActive: true,
      criteria: { path: ['challengeType'], equals: 'ROUND_20_SPEEDRUN' },
      AND: [{ criteria: { path: ['vanguardVoidUsed'], equals: true } }],
    },
  });
  if (targetAchievements.length === 0) {
    console.log('No active Der Anfang ROUND_20 with-void achievements found. Nothing to reverify.');
    await prisma.$disconnect();
    return;
  }

  const [challengeUsers, eeUsers] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { mapId: map.id },
      select: { userId: true },
      distinct: ['userId'],
    }),
    prisma.easterEggLog.findMany({
      where: { mapId: map.id },
      select: { userId: true },
      distinct: ['userId'],
    }),
  ]);
  const userIds = Array.from(new Set([...challengeUsers, ...eeUsers].map((u) => u.userId)));
  if (userIds.length === 0) {
    console.log('No users with Der Anfang logs found. Nothing to reverify.');
    await prisma.$disconnect();
    return;
  }

  let mapUnlockAdds = 0;
  let targetedAdds = 0;
  let targetedRemovals = 0;
  const targetIds = targetAchievements.map((a) => a.id);

  for (const userId of userIds) {
    const unlocked = await processMapAchievements(userId, map.id, false);
    mapUnlockAdds += unlocked.length;

    const existing = await prisma.userAchievement.findMany({
      where: { userId, achievementId: { in: targetIds } },
      select: { achievementId: true },
    });
    const existingSet = new Set(existing.map((e) => e.achievementId));

    for (const ach of targetAchievements) {
      const qualifies = await checkAchievement(userId, ach);
      if (qualifies && !existingSet.has(ach.id)) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: ach.id },
        });
        targetedAdds++;
      }
      if (!qualifies && existingSet.has(ach.id)) {
        await prisma.userAchievement.deleteMany({
          where: { userId, achievementId: ach.id },
        });
        targetedRemovals++;
      }
    }
  }

  await prisma.userAchievement.updateMany({
    where: {
      userId: { in: userIds },
      achievement: { mapId: map.id },
      verifiedAt: { not: null },
    },
    data: { verifiedAt: null },
  });

  for (const userId of userIds) {
    await grantVerifiedAchievementsForMap(userId, map.id, { skipUserUpdate: true });
  }

  let usersUpdated = 0;
  for (const userId of userIds) {
    const uas = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: {
          select: {
            xpReward: true,
            isActive: true,
            map: { select: { game: { select: { shortName: true } } } },
            easterEgg: { select: { map: { select: { game: { select: { shortName: true } } } } } },
          },
        },
      },
    });
    const active = uas.filter((ua) => ua.achievement.isActive);
    let totalXp = 0;
    let customZombiesTotalXp = 0;
    let verifiedTotalXp = 0;
    let verifiedCustomZombiesTotalXp = 0;
    for (const ua of active) {
      const shortName = ua.achievement.map?.game?.shortName ?? ua.achievement.easterEgg?.map?.game?.shortName ?? null;
      const xp = ua.achievement.xpReward;
      if (shortName === 'BO3_CUSTOM') {
        customZombiesTotalXp += xp;
        if (ua.verifiedAt) verifiedCustomZombiesTotalXp += xp;
      } else {
        totalXp += xp;
        if (ua.verifiedAt) verifiedTotalXp += xp;
      }
    }
    const { level } = getLevelFromXp(totalXp);
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalXp: true,
        level: true,
        verifiedTotalXp: true,
        customZombiesTotalXp: true,
        verifiedCustomZombiesTotalXp: true,
      },
    });
    if (!current) continue;
    const needsUpdate =
      current.totalXp !== totalXp ||
      current.level !== level ||
      (current.verifiedTotalXp ?? 0) !== verifiedTotalXp ||
      (current.customZombiesTotalXp ?? 0) !== customZombiesTotalXp ||
      (current.verifiedCustomZombiesTotalXp ?? 0) !== verifiedCustomZombiesTotalXp;
    if (!needsUpdate) continue;
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXp,
        level,
        verifiedTotalXp,
        customZombiesTotalXp,
        verifiedCustomZombiesTotalXp,
      },
    });
    usersUpdated++;
  }

  console.log(`Der Anfang reverify complete.`);
  console.log(`Users considered: ${userIds.length}`);
  console.log(`Map unlock additions: ${mapUnlockAdds}`);
  console.log(`Targeted with-void additions: ${targetedAdds}`);
  console.log(`Targeted with-void removals: ${targetedRemovals}`);
  console.log(`Users XP updated: ${usersUpdated}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

