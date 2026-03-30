/**
 * Backfill BO2 EE speedrun achievements only (targeted).
 *
 * Use this AFTER sync-achievements when BO2 EE speedrun definitions changed.
 * It only processes users/maps that have BO2 EE speedrun activity:
 * - ChallengeLog with challenge type EASTER_EGG_SPEEDRUN on selected BO2 maps
 * - EasterEggLog with completionTimeSeconds on selected BO2 maps
 *
 * It then:
 * 1) runs processMapAchievements(userId, mapId) to create only missing unlocks (+XP/level)
 * 2) if new unlocks were created and user has verified speedrun evidence on that map,
 *    runs grantVerifiedAchievementsForMap(userId, mapId) to update verified XP.
 *
 * Usage:
 *   pnpm db:backfill-bo2-ee-speedrun-achievements --dry-run
 *   pnpm db:backfill-bo2-ee-speedrun-achievements
 *   pnpm db:backfill-bo2-ee-speedrun-achievements --map-slugs=tranzit,die-rise
 *   BACKFILL_USER_ID=<userId> pnpm db:backfill-bo2-ee-speedrun-achievements
 */

import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/lib/prisma';
import { processMapAchievements } from '../src/lib/achievements';
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';

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

const DEFAULT_BO2_EE_MAP_SLUGS = ['tranzit', 'die-rise', 'buried', 'mob-of-the-dead', 'origins'];
const DRY_RUN = process.argv.includes('--dry-run');
const filterUserId = process.env.BACKFILL_USER_ID?.trim() || null;

function parseMapSlugsArg(): Set<string> {
  const arg = process.argv.find((a) => a.startsWith('--map-slugs='));
  if (!arg) return new Set(DEFAULT_BO2_EE_MAP_SLUGS);
  const raw = arg.slice('--map-slugs='.length).trim();
  if (!raw) return new Set(DEFAULT_BO2_EE_MAP_SLUGS);
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  const mapSlugs = parseMapSlugsArg();
  console.log(`Target map slugs: ${Array.from(mapSlugs).join(', ')}`);
  if (filterUserId) console.log(`Target user: ${filterUserId}`);
  if (DRY_RUN) console.log('*** DRY RUN – no writes ***');
  console.log('');

  const maps = await prisma.map.findMany({
    where: {
      slug: { in: Array.from(mapSlugs) },
      game: { shortName: 'BO2' },
    },
    select: { id: true, slug: true },
  });
  if (maps.length === 0) {
    console.log('No BO2 maps matched the selected slugs.');
    return;
  }
  const mapIds = maps.map((m) => m.id);
  const mapSlugById = new Map(maps.map((m) => [m.id, m.slug]));

  const userFilter = filterUserId ? { userId: filterUserId } : {};
  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: {
        ...userFilter,
        mapId: { in: mapIds },
        challenge: { type: 'EASTER_EGG_SPEEDRUN' as never },
      },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: {
        ...userFilter,
        mapId: { in: mapIds },
        completionTimeSeconds: { not: null },
      },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);

  const pairMap = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...challengePairs, ...eePairs]) {
    pairMap.set(`${p.userId}:${p.mapId}`, { userId: p.userId, mapId: p.mapId });
  }
  const pairs = Array.from(pairMap.values());
  console.log(`Found ${pairs.length} user/map pair(s) with BO2 EE speedrun activity.\n`);
  if (pairs.length === 0) return;

  let processed = 0;
  let totalNewUnlocks = 0;
  let totalVerifiedUpdates = 0;

  for (const { userId, mapId } of pairs) {
    const mapSlug = mapSlugById.get(mapId) ?? mapId;
    const unlocked = await processMapAchievements(userId, mapId, DRY_RUN);
    processed++;
    if (unlocked.length > 0) {
      totalNewUnlocks += unlocked.length;
      if (DRY_RUN) {
        console.log(`[DRY] ${userId.slice(0, 8)}... ${mapSlug}: would unlock ${unlocked.length}`);
      } else {
        console.log(`[${processed}/${pairs.length}] ${userId.slice(0, 8)}... ${mapSlug}: unlocked ${unlocked.length}`);
      }

      if (!DRY_RUN) {
        const [hasVerifiedEeSrChallenge, hasVerifiedTimedEeLog] = await Promise.all([
          prisma.challengeLog.findFirst({
            where: { userId, mapId, isVerified: true, challenge: { type: 'EASTER_EGG_SPEEDRUN' as never } },
            select: { id: true },
          }).then((r) => !!r),
          prisma.easterEggLog.findFirst({
            where: { userId, mapId, isVerified: true, completionTimeSeconds: { not: null } },
            select: { id: true },
          }).then((r) => !!r),
        ]);
        if (hasVerifiedEeSrChallenge || hasVerifiedTimedEeLog) {
          await grantVerifiedAchievementsForMap(userId, mapId);
          totalVerifiedUpdates++;
        }
      }
    } else if (!DRY_RUN && processed % 100 === 0) {
      console.log(`[${processed}/${pairs.length}] ...`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Processed pairs: ${pairs.length}`);
  console.log(`New unlocks: ${totalNewUnlocks}`);
  console.log(`Verified XP map updates: ${totalVerifiedUpdates}`);
  if (DRY_RUN) {
    console.log('\nDry-run complete. Run without --dry-run to apply.');
  } else {
    console.log('\nBO2 EE speedrun targeted backfill complete.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
