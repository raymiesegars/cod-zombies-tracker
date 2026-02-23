/**
 * BO6 Re-unlock Achievements
 *
 * After the BO6 balance patch, users may have logs that qualify them for the NEW
 * achievements (different slugs/IDs than the old deactivated ones), but they
 * don't have UserAchievement records for them. This script re-evaluates users
 * with BO6 logs against active achievements and creates any missing unlocks.
 *
 * SAFE: Only creates UserAchievement records. Does not delete or deactivate.
 * Run after db:bo6-balance-patch.
 *
 * Usage:
 *   pnpm exec tsx scripts/bo6-reunlock-achievements.ts           # Run and create unlocks
 *   pnpm exec tsx scripts/bo6-reunlock-achievements.ts --dry-run # Report only, no changes
 */

import * as fs from 'fs';
import * as path from 'path';

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

import prisma from '../src/lib/prisma';
import { processMapAchievements } from '../src/lib/achievements';
import { getLevelFromXp } from '../src/lib/ranks';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  const bo6Game = await prisma.game.findFirst({ where: { shortName: 'BO6' } });
  if (!bo6Game) {
    console.log('BO6 game not found. Exiting.');
    return;
  }

  const bo6Maps = await prisma.map.findMany({
    where: { gameId: bo6Game.id },
    select: { id: true, slug: true },
  });
  const bo6MapIds = bo6Maps.map((m) => m.id);

  if (bo6MapIds.length === 0) {
    console.log('No BO6 maps found. Exiting.');
    return;
  }

  console.log(`BO6 maps: ${bo6Maps.map((m) => m.slug).join(', ')}`);

  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { mapId: { in: bo6MapIds } },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { mapId: { in: bo6MapIds } },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);

  const pairSet = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...challengePairs, ...eePairs]) {
    pairSet.set(`${p.userId}:${p.mapId}`, { userId: p.userId, mapId: p.mapId });
  }
  const pairs = Array.from(pairSet.values());

  console.log(`Found ${pairs.length} (userId, mapId) pairs with BO6 logs.\n`);

  if (pairs.length === 0) {
    console.log('Nothing to process.');
    await prisma.$disconnect();
    return;
  }

  let processed = 0;
  let totalNewUnlocks = 0;
  const usersWithNewUnlocks = new Set<string>();

  for (const { userId, mapId } of pairs) {
    const unlocked = await processMapAchievements(userId, mapId, DRY_RUN);
    processed++;
    if (unlocked.length > 0) {
      totalNewUnlocks += unlocked.length;
      usersWithNewUnlocks.add(userId);
      if (DRY_RUN) {
        const map = bo6Maps.find((m) => m.id === mapId);
        console.log(`  [DRY] Would unlock ${unlocked.length} for user ${userId.slice(0, 8)}... on ${map?.slug ?? mapId}`);
      } else {
        console.log(`  [${processed}/${pairs.length}] userId=${userId.slice(0, 8)}... mapId=${mapId.slice(0, 8)}... → ${unlocked.length} new achievement(s)`);
      }
    }
    if (!DRY_RUN && processed % 50 === 0 && unlocked.length === 0) {
      console.log(`  [${processed}/${pairs.length}] ...`);
    }
  }

  console.log(`\nProcessed ${pairs.length} pairs. Total new unlocks: ${totalNewUnlocks} (${usersWithNewUnlocks.size} users).`);

  if (!DRY_RUN && usersWithNewUnlocks.size > 0 && totalNewUnlocks > 0) {
    console.log('\nRecalculating totalXp and level for affected users...');
    let usersUpdated = 0;
    for (const userId of Array.from(usersWithNewUnlocks)) {
      const uas = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: { select: { xpReward: true, isActive: true } } },
      });
      const totalXp = uas
        .filter((ua) => ua.achievement.isActive)
        .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
      const current = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalXp: true, level: true },
      });
      if (current && (current.totalXp !== totalXp || current.level !== getLevelFromXp(totalXp).level)) {
        const { level } = getLevelFromXp(totalXp);
        await prisma.user.update({
          where: { id: userId },
          data: { totalXp, level },
        });
        usersUpdated++;
      }
    }
    console.log(`  Updated totalXp/level for ${usersUpdated} users.`);
  }

  if (DRY_RUN) {
    console.log('\n*** Dry run complete. Run without --dry-run to apply. ***');
  } else {
    console.log('\nBO6 re-unlock complete.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
