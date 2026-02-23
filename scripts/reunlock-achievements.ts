/**
 * Re-unlock Achievements
 *
 * Re-evaluates users against ALL active achievements across ALL maps. For each
 * (userId, mapId) pair that has challenge or Easter Egg logs, runs the achievement
 * check to create any missing UserAchievement records. Use after balance patches
 * or migrations that change achievement definitions.
 *
 * SAFE: Only creates UserAchievement records. Does not delete, deactivate, or modify logs.
 * - Creates UserAchievement for any achievement the user qualifies for based on existing logs
 * - If the user has a verified run on that map, grants verifiedAt (and verifiedTotalXp) for the new achievements
 * - Recalculates totalXp and level for affected users
 *
 * Usage (use pnpm db:reunlock-achievements - it uses DIRECT_URL to avoid connection limits):
 *   pnpm db:reunlock-achievements           # Run and create unlocks
 *   pnpm db:reunlock-achievements --dry-run # Report only, no changes
 *   BACKFILL_USER_ID=xxx pnpm db:reunlock-achievements  # Single user
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
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';

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
  /** (userId, mapId) pairs that got new unlocks - for granting verified XP if run is verified */
  const pairsWithNewUnlocks = new Map<string, { userId: string; mapId: string }>();

  for (const { userId, mapId } of pairs) {
    const unlocked = await processMapAchievements(userId, mapId, DRY_RUN);
    processed++;
    if (unlocked.length > 0) {
      totalNewUnlocks += unlocked.length;
      usersWithNewUnlocks.add(userId);
      pairsWithNewUnlocks.set(`${userId}:${mapId}`, { userId, mapId });
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

  if (!DRY_RUN && totalNewUnlocks > 0) {
    // Grant verified XP: for each (userId, mapId) where we created unlocks, if user has a verified run on that map, set verifiedAt on the new achievements
    let verifiedGrants = 0;
    for (const { userId, mapId } of Array.from(pairsWithNewUnlocks.values())) {
      const [hasVerifiedChallenge, hasVerifiedEe] = await Promise.all([
        prisma.challengeLog.findFirst({ where: { userId, mapId, isVerified: true }, select: { id: true } }).then((r) => !!r),
        prisma.easterEggLog.findFirst({ where: { userId, mapId, isVerified: true }, select: { id: true } }).then((r) => !!r),
      ]);
      if (hasVerifiedChallenge || hasVerifiedEe) {
        await grantVerifiedAchievementsForMap(userId, mapId);
        verifiedGrants++;
      }
    }
    if (verifiedGrants > 0) {
      console.log(`\nGranted verified XP for ${verifiedGrants} (userId, mapId) pairs with verified runs.`);
    }

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
