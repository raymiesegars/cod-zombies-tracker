/**
 * Fix Terminus Starting Room Only achievements only.
 *
 * 1. Syncs ONLY Terminus STARTING_ROOM achievements from seed (adds missing tiers from number_ones WRs).
 * 2. Re-unlocks achievements for every user who has a Terminus STARTING_ROOM log.
 * 3. Recomputes totalXp, level, and verifiedTotalXp for those users.
 *
 * Safe: does not prune or deactivate other achievements. Does not touch other maps.
 *
 * Run: pnpm db:fix-terminus-starting-room-only
 *      pnpm db:fix-terminus-starting-room-only --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { getMapAchievementDefinitions } from '../src/lib/achievements/seed-achievements';
import { isRestrictedAchievement } from '../src/lib/achievements/categories';
import { processMapAchievements } from '../src/lib/achievements';
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';
import { getLevelFromXp } from '../src/lib/ranks';

const MAP_SLUG = 'terminus';

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

  const map = await prisma.map.findUnique({
    where: { slug: MAP_SLUG },
    include: {
      game: { select: { shortName: true } },
      challenges: { where: { isActive: true } },
    },
  });

  if (!map) {
    console.error(`Map "${MAP_SLUG}" not found.`);
    process.exit(1);
  }

  const gameShortName = map.game?.shortName ?? '';
  if (gameShortName !== 'BO6') {
    console.error(`Map ${MAP_SLUG} is not BO6.`);
    process.exit(1);
  }

  const allMapDefs = getMapAchievementDefinitions(map.slug, map.roundCap, gameShortName);
  const startingRoomDefs = allMapDefs.filter(
    (d) => (d.criteria as { challengeType?: string }).challengeType === 'STARTING_ROOM'
  );
  const challengesByType = Object.fromEntries(map.challenges.map((c) => [c.type, c]));

  console.log(`1. Syncing Terminus STARTING_ROOM achievements (${startingRoomDefs.length} definitions)...`);
  let created = 0;
  let updated = 0;

  for (const def of startingRoomDefs) {
    const criteria = def.criteria as { challengeType?: string };
    const challengeId = criteria.challengeType
      ? (challengesByType[criteria.challengeType as keyof typeof challengesByType] as { id: string } | undefined)?.id
      : null;
    const difficulty = def.difficulty ?? null;
    const data = {
      mapId: map.id,
      name: def.name,
      slug: def.slug,
      type: def.type,
      rarity: def.rarity,
      xpReward: def.xpReward,
      criteria: def.criteria as object,
      challengeId: challengeId ?? null,
      difficulty,
      isActive: true,
    };

    const existingCandidates = await prisma.achievement.findMany({
      where: {
        mapId: map.id,
        slug: def.slug,
        difficulty: difficulty ?? null,
      },
      select: { id: true, criteria: true, isActive: true },
    });
    const expectedRestricted = isRestrictedAchievement({ criteria: def.criteria as Record<string, unknown> });
    const existing = existingCandidates
      .slice()
      .sort((a, b) => {
        const aRestricted = isRestrictedAchievement({ criteria: (a.criteria ?? {}) as Record<string, unknown> });
        const bRestricted = isRestrictedAchievement({ criteria: (b.criteria ?? {}) as Record<string, unknown> });
        const scoreA = (aRestricted === expectedRestricted ? 2 : 0) + (a.isActive ? 1 : 0);
        const scoreB = (bRestricted === expectedRestricted ? 2 : 0) + (b.isActive ? 1 : 0);
        return scoreB - scoreA;
      })[0];

    if (DRY_RUN) {
      if (existing) updated++;
      else created++;
      continue;
    }

    if (existing) {
      await prisma.achievement.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          type: data.type,
          rarity: data.rarity,
          xpReward: data.xpReward,
          criteria: data.criteria,
          challengeId: data.challengeId ?? undefined,
          isActive: data.isActive,
        },
      });
      const duplicateIds = existingCandidates.filter((c) => c.id !== existing.id).map((c) => c.id);
      if (duplicateIds.length > 0) {
        await prisma.achievement.updateMany({
          where: { id: { in: duplicateIds }, isActive: true },
          data: { isActive: false },
        });
      }
      updated++;
    } else {
      await prisma.achievement.create({
        data: {
          ...data,
          challengeId: data.challengeId ?? undefined,
        },
      });
      created++;
    }
  }

  console.log(`   Created ${created}, updated ${updated} STARTING_ROOM achievements.\n`);

  const pairs = await prisma.challengeLog.findMany({
    where: { mapId: map.id, challenge: { type: 'STARTING_ROOM' } },
    select: { userId: true, mapId: true },
    distinct: ['userId', 'mapId'],
  });
  const uniquePairs = Array.from(new Map(pairs.map((p) => [`${p.userId}:${p.mapId}`, p])).values());

  console.log(`2. Re-unlocking achievements for ${uniquePairs.length} users with Terminus STARTING_ROOM logs...`);
  let totalNewUnlocks = 0;
  const affectedUserIds = new Set<string>();

  for (const { userId, mapId } of uniquePairs) {
    const unlocked = await processMapAchievements(userId, mapId, DRY_RUN);
    if (unlocked.length > 0) {
      totalNewUnlocks += unlocked.length;
      affectedUserIds.add(userId);
    }
  }

  console.log(`   New unlocks: ${totalNewUnlocks} (${affectedUserIds.size} users).\n`);

  if (!DRY_RUN && uniquePairs.length > 0) {
    console.log('3. Granting verifiedAt for Terminus (verified runs)...');
    for (const { userId, mapId } of uniquePairs) {
      await grantVerifiedAchievementsForMap(userId, mapId, { skipUserUpdate: true });
    }
    console.log('   Done.\n');
  }

  console.log('4. Recalculating totalXp, level, verifiedTotalXp for affected users...');
  const distinctUserIds = DRY_RUN ? [] : Array.from(new Set(uniquePairs.map((p) => p.userId)));

  if (distinctUserIds.length === 0 && !DRY_RUN) {
    console.log('   No users to recalc.\n');
  } else if (DRY_RUN) {
    console.log(`   [DRY] Would recalc ${uniquePairs.length} users.\n`);
  } else {
    let usersUpdated = 0;
    for (const userId of distinctUserIds) {
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
    console.log('Terminus Starting Room fix complete.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
