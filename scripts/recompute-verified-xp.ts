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
 *   BACKFILL_USER_ID=userId pnpm db:recompute-verified-xp [--dry-run]  # Only that user (clear/grant/recalc for them only)
 *   BACKFILL_GAMES=BO4,BOCW,BO6,BO7 pnpm db:recompute-verified-xp     # Only maps in these games + recalc only affected users (faster)
 *   BACKFILL_MAP_SLUGS=tranzit,die-rise pnpm db:recompute-verified-xp  # Only these map slugs
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
const filterUserId = process.env.BACKFILL_USER_ID?.trim();
/** Optional: comma-separated game shortNames — only process maps in these games and recalc only affected users. */
const backfillGames = process.env.BACKFILL_GAMES?.trim()
  ? new Set(process.env.BACKFILL_GAMES.split(',').map((g) => g.trim()).filter(Boolean))
  : null;
/** Optional: comma-separated map slugs — intersects with BACKFILL_GAMES if both are set. */
const backfillMapSlugs = process.env.BACKFILL_MAP_SLUGS?.trim()
  ? new Set(process.env.BACKFILL_MAP_SLUGS.split(',').map((s) => s.trim()).filter(Boolean))
  : null;

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
  if (backfillGames) {
    console.log(`Filtering to games: ${Array.from(backfillGames).join(', ')}\n`);
  }
  if (backfillMapSlugs) {
    console.log(`Filtering to map slugs: ${Array.from(backfillMapSlugs).join(', ')}\n`);
  }

  let allowedMapIds: Set<string> | null = null;
  if (backfillGames || backfillMapSlugs) {
    const maps = await prisma.map.findMany({
      where: {
        ...(backfillGames
          ? { game: { shortName: { in: Array.from(backfillGames) } } }
          : {}),
        ...(backfillMapSlugs ? { slug: { in: Array.from(backfillMapSlugs) } } : {}),
      },
      select: { id: true },
    });
    allowedMapIds = new Set(maps.map((m) => m.id));
    console.log(`  ${allowedMapIds.size} maps in selected filters.\n`);
  }

  const baseWhere = filterUserId ? { isVerified: true, userId: filterUserId } : { isVerified: true };
  const mapWhere = allowedMapIds ? { mapId: { in: Array.from(allowedMapIds) } } : {};

  console.log('1. Finding (userId, mapId) pairs with verified runs...');
  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { ...baseWhere, ...mapWhere },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { ...baseWhere, ...mapWhere },
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

  const clearWhere = allowedMapIds
    ? {
        verifiedAt: { not: null },
        achievement: { mapId: { in: Array.from(allowedMapIds) } },
        ...(filterUserId ? { userId: filterUserId } : {}),
      }
    : filterUserId
      ? { userId: filterUserId, verifiedAt: { not: null } }
      : { verifiedAt: { not: null } };

  if (!DRY_RUN) {
    console.log('2. Clearing verifiedAt on UserAchievement...');
    const cleared = await prisma.userAchievement.updateMany({
      where: clearWhere,
      data: { verifiedAt: null },
    });
    console.log(`   Cleared ${cleared.count} records.\n`);
  } else {
    const count = await prisma.userAchievement.count({
      where: clearWhere,
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

  console.log('4. Recalculating totalXp, level, verifiedTotalXp...');
  const affectedUserIds =
    filterUserId
      ? new Set([filterUserId])
      : allowedMapIds && verifiedPairs.length > 0
        ? new Set(verifiedPairs.map((p) => p.userId))
        : null;
  const users = affectedUserIds
    ? await prisma.user.findMany({ where: { id: { in: Array.from(affectedUserIds) } }, select: { id: true } })
    : await prisma.user.findMany({ select: { id: true } });
  if (affectedUserIds) {
    console.log(`   Recalculating for ${users.length} affected users only.\n`);
  }
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
    const forceUpdateSingleUser = !!filterUserId && users.length === 1;

    if ((needsUpdate || forceUpdateSingleUser) && !DRY_RUN) {
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
