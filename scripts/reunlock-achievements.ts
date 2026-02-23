/**
 * Re-unlock Achievements
 *
 * Re-evaluates users against ALL active achievements across ALL maps. For each
 * (userId, mapId) pair that has challenge or Easter Egg logs, runs the achievement
 * check to create any missing UserAchievement records. Use after balance patches
 * or migrations that change achievement definitions.
 *
 * SAFE: Only creates UserAchievement records. Does not delete or deactivate.
 *
 * Usage:
 *   pnpm exec tsx scripts/reunlock-achievements.ts           # Run and create unlocks
 *   pnpm exec tsx scripts/reunlock-achievements.ts --dry-run # Report only, no changes
 *   BACKFILL_USER_ID=xxx pnpm exec tsx scripts/reunlock-achievements.ts  # Single user
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
const filterUserId = process.env.BACKFILL_USER_ID?.trim();

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  if (filterUserId) {
    console.log(`Filtering to userId=${filterUserId}\n`);
  }

  const baseWhere = filterUserId ? { userId: filterUserId } : {};

  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: baseWhere,
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: baseWhere,
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);

  const pairSet = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...challengePairs, ...eePairs]) {
    pairSet.set(`${p.userId}:${p.mapId}`, { userId: p.userId, mapId: p.mapId });
  }
  const pairs = Array.from(pairSet.values());

  console.log(`Found ${pairs.length} (userId, mapId) pairs with logs.\n`);

  if (pairs.length === 0) {
    console.log('Nothing to process.');
    await prisma.$disconnect();
    return;
  }

  const mapsById = new Map(
    (await prisma.map.findMany({ select: { id: true, slug: true } })).map((m) => [m.id, m.slug])
  );

  let processed = 0;
  let totalNewUnlocks = 0;
  const usersWithNewUnlocks = new Set<string>();

  for (const { userId, mapId } of pairs) {
    const unlocked = await processMapAchievements(userId, mapId, DRY_RUN);
    processed++;
    if (unlocked.length > 0) {
      totalNewUnlocks += unlocked.length;
      usersWithNewUnlocks.add(userId);
      const mapSlug = mapsById.get(mapId) ?? mapId.slice(0, 8);
      if (DRY_RUN) {
        console.log(`  [DRY] Would unlock ${unlocked.length} for user ${userId.slice(0, 8)}... on ${mapSlug}`);
      } else {
        console.log(`  [${processed}/${pairs.length}] userId=${userId.slice(0, 8)}... ${mapSlug} → ${unlocked.length} new achievement(s)`);
      }
    }
    if (!DRY_RUN && processed % 100 === 0 && unlocked.length === 0) {
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
    console.log('\nRe-unlock complete.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
