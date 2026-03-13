/**
 * Re-verify achievement unlocks and XP for Vanguard only.
 *
 * 1. Finds all users who have any Vanguard log (challenge or Easter egg).
 * 2. For each (userId, mapId) on a Vanguard map: re-runs achievement checks (re-unlock).
 * 3. Grants verifiedAt for achievements satisfied by verified runs on those maps.
 * 4. Recalculates totalXp, level, and verifiedTotalXp for every affected user.
 *
 * Safe: only creates/updates UserAchievement and User; does not touch logs or other games.
 *
 * Run: pnpm db:reverify-vanguard-unlocks-and-xp
 *      pnpm db:reverify-vanguard-unlocks-and-xp --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { processMapAchievements } from '../src/lib/achievements';
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';
import { getLevelFromXp } from '../src/lib/ranks';

const GAME_SHORT_NAME = 'VANGUARD';

const root = path.resolve(__dirname, '..');
for (const file of ['.env', '.env.local']) {
  const p = path.join(root, file);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (match) {
        const value = match[2]!.replace(/^["']|["']$/g, '').trim();
        process.env[match[1]!] = value;
      }
    }
  }
}

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  const vanguardMaps = await prisma.map.findMany({
    where: { game: { shortName: GAME_SHORT_NAME } },
    select: { id: true, slug: true },
  });
  const vanguardMapIds = new Set(vanguardMaps.map((m) => m.id));

  if (vanguardMapIds.size === 0) {
    console.log('No Vanguard maps found.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${vanguardMapIds.size} Vanguard maps.\n`);

  const mapIdList = Array.from(vanguardMapIds);
  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { mapId: { in: mapIdList } },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { mapId: { in: mapIdList } },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);

  const pairSet = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...challengePairs, ...eePairs]) {
    pairSet.set(`${p.userId}:${p.mapId}`, { userId: p.userId, mapId: p.mapId });
  }
  const pairs = Array.from(pairSet.values());

  if (pairs.length === 0) {
    console.log('No users with Vanguard logs. Nothing to do.');
    await prisma.$disconnect();
    return;
  }

  const distinctUsers = new Set(pairs.map((p) => p.userId));
  console.log(`1. Re-unlocking achievements for ${distinctUsers.size} users (${pairs.length} user-map pairs)...`);

  let totalNewUnlocks = 0;
  for (const { userId, mapId } of pairs) {
    const unlocked = await processMapAchievements(userId, mapId, DRY_RUN);
    if (unlocked.length > 0) totalNewUnlocks += unlocked.length;
  }

  console.log(`   New unlocks: ${totalNewUnlocks}.\n`);

  if (!DRY_RUN && pairs.length > 0) {
    console.log('2. Granting verifiedAt for Vanguard maps (verified runs)...');
    for (const { userId, mapId } of pairs) {
      await grantVerifiedAchievementsForMap(userId, mapId, { skipUserUpdate: true });
    }
    console.log('   Done.\n');
  }

  console.log('3. Recalculating totalXp, level, verifiedTotalXp for affected users...');
  const userIdsToRecalc = DRY_RUN ? [] : Array.from(distinctUsers);

  if (DRY_RUN) {
    console.log(`   [DRY] Would recalc ${distinctUsers.size} users.\n`);
  } else {
    let usersUpdated = 0;
    for (const userId of userIdsToRecalc) {
      const uas = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: { select: { xpReward: true, isActive: true } } },
      });
      const totalXp = uas
        .filter((ua) => ua.achievement.isActive)
        .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
      const verifiedTotalXp = uas
        .filter((ua) => ua.achievement.isActive && ua.verifiedAt != null)
        .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
      const { level } = getLevelFromXp(totalXp);
      const current = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalXp: true, level: true, verifiedTotalXp: true },
      });
      const needsUpdate =
        current &&
        ((current.totalXp ?? 0) !== totalXp ||
          (current.level ?? 0) !== level ||
          (current.verifiedTotalXp ?? 0) !== verifiedTotalXp);
      if (needsUpdate && current) {
        await prisma.user.update({
          where: { id: userId },
          data: { totalXp, level, verifiedTotalXp },
        });
        usersUpdated++;
      }
    }
    console.log(`   Updated ${usersUpdated} users.\n`);
  }

  if (DRY_RUN) {
    console.log('*** Dry run complete. Run without --dry-run to apply. ***');
  } else {
    console.log('Vanguard re-verify complete.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
