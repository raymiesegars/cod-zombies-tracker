/**
 * Recompute Verified XP from Scratch
 *
 * Ensures verifiedTotalXp is accurate by:
 * 1. Clearing ALL verifiedAt on UserAchievement (removes any incorrectly set values)
 * 2. For each (userId, mapId) where the user has at least one VERIFIED run,
 *    granting verifiedAt ONLY on achievements that are satisfied by verified runs
 *    (not all unlocked achievements on the map)
 * 3. Recalculating totalXp and verifiedTotalXp for all users
 *
 * Run after db:reunlock-achievements to fix verified XP.
 *
 * Usage:
 *   pnpm db:recompute-verified-xp           # Run against .env.local (dev)
 *   pnpm db:recompute-verified-xp --dry-run # Preview without writing
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
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';
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

  console.log('1. Finding all (userId, mapId) pairs with verified runs...');
  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { isVerified: true },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { isVerified: true },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);

  const verifiedPairSet = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...challengePairs, ...eePairs]) {
    verifiedPairSet.set(`${p.userId}:${p.mapId}`, { userId: p.userId, mapId: p.mapId });
  }
  const verifiedPairs = Array.from(verifiedPairSet.values());
  console.log(`   Found ${verifiedPairs.length} (userId, mapId) pairs with verified runs.\n`);

  if (!DRY_RUN) {
    console.log('2. Clearing all verifiedAt on UserAchievement...');
    const cleared = await prisma.userAchievement.updateMany({
      where: { verifiedAt: { not: null } },
      data: { verifiedAt: null },
    });
    console.log(`   Cleared ${cleared.count} records.\n`);
  } else {
    const count = await prisma.userAchievement.count({
      where: { verifiedAt: { not: null } },
    });
    console.log(`   [DRY] Would clear verifiedAt on ${count} records.\n`);
  }

  console.log('3. Granting verifiedAt for achievements on maps with verified runs...');
  let granted = 0;
  for (const { userId, mapId } of verifiedPairs) {
    if (!DRY_RUN) {
      await grantVerifiedAchievementsForMap(userId, mapId, { skipUserUpdate: true });
      granted++;
      if (granted % 50 === 0) {
        console.log(`   Processed ${granted}/${verifiedPairs.length}...`);
      }
    }
  }
  if (DRY_RUN) {
    console.log(`   [DRY] Would grant verifiedAt for ${verifiedPairs.length} (userId, mapId) pairs.`);
  } else {
    console.log(`   Granted for ${granted} pairs.\n`);
  }

  console.log('4. Recalculating totalXp, level, verifiedTotalXp for all users...');
  const users = await prisma.user.findMany({ select: { id: true } });
  let usersUpdated = 0;

  for (const user of users) {
    const uas = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: { select: { xpReward: true, isActive: true } } },
    });
    const totalXp = uas
      .filter((ua) => ua.achievement.isActive)
      .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
    const verifiedTotalXp = uas
      .filter((ua) => ua.achievement.isActive && ua.verifiedAt != null)
      .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);

    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { totalXp: true, level: true, verifiedTotalXp: true },
    });
    const needsUpdate =
      current &&
      ((current.totalXp ?? 0) !== totalXp ||
        (current.verifiedTotalXp ?? 0) !== verifiedTotalXp);

    if (needsUpdate && !DRY_RUN) {
      const { level } = getLevelFromXp(totalXp);
      await prisma.user.update({
        where: { id: user.id },
        data: { totalXp, level, verifiedTotalXp },
      });
      usersUpdated++;
    }
  }

  if (DRY_RUN) {
    console.log('   [DRY] Would recalculate for all users.');
  } else {
    console.log(`   Updated ${usersUpdated} users.`);
  }

  if (DRY_RUN) {
    console.log('\n*** Dry run complete. Run without --dry-run to apply. ***');
  } else {
    console.log('\nRecompute verified XP complete.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
