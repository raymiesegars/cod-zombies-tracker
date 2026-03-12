/**
 * Reverify all achievement unlocks and XP from existing logs.
 *
 * 1. Remove unlocks for inactive achievements (no XP; DB cleanup).
 * 2. Remove unlocks where the user no longer qualifies (e.g. log removed).
 * 3. Add any missing unlocks from existing logs (map-based + global).
 * 4. Clear verifiedAt everywhere, then grant verifiedAt ONLY for achievements
 *    satisfied by verified runs.
 * 5. Recalculate totalXp, customZombiesTotalXp, verifiedTotalXp,
 *    verifiedCustomZombiesTotalXp, and level for all users.
 *
 * Safe: only adjusts UserAchievement and User XP from existing logs.
 * No logs are modified or deleted.
 *
 * Usage:
 *   pnpm exec tsx scripts/reverify-unlocks-and-xp.ts --dry-run
 *   pnpm exec tsx scripts/reverify-unlocks-and-xp.ts
 *   BACKFILL_USER_ID=userId pnpm exec tsx scripts/reverify-unlocks-and-xp.ts [--dry-run]  # single user
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
import { checkAchievement, checkAllAchievements, processMapAchievements } from '../src/lib/achievements';
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';
import { getLevelFromXp } from '../src/lib/ranks';

const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_GLOBAL = process.argv.includes('--skip-global');
const FULL_GLOBAL_PASS = process.argv.includes('--full-global-pass');
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
  if (SKIP_GLOBAL) {
    console.log('*** SKIP GLOBAL – step 4 (checkAllAchievements) will be skipped ***\n');
  }
  if (FULL_GLOBAL_PASS) {
    console.log('*** FULL GLOBAL PASS – step 4 will run legacy checkAllAchievements for all active achievements ***\n');
  }
  if (filterUserId) {
    console.log(`Filtering to userId=${filterUserId}\n`);
  }

  const userWhere = filterUserId ? { id: filterUserId } : {};

  console.log('1. Removing UserAchievement for inactive achievements...');
  const inactiveCount = await prisma.userAchievement.count({
    where: {
      ...(filterUserId ? { userId: filterUserId } : {}),
      achievement: { isActive: false },
    },
  });
  if (!DRY_RUN && inactiveCount > 0) {
    const result = await prisma.userAchievement.deleteMany({
      where: {
        ...(filterUserId ? { userId: filterUserId } : {}),
        achievement: { isActive: false },
      },
    });
    console.log(`   Removed ${result.count} (inactive).`);
  } else {
    console.log(`   ${DRY_RUN ? '[DRY] Would remove ' : 'Removed '}${inactiveCount} (inactive).`);
  }

  console.log('2. Removing unlocks where user no longer qualifies...');
  const uasWithActive = await prisma.userAchievement.findMany({
    where: {
      ...(filterUserId ? { userId: filterUserId } : {}),
      achievement: { isActive: true },
    },
    include: {
      achievement: {
        include: {
          map: { select: { game: { select: { shortName: true } } } },
          easterEgg: { select: { map: { select: { game: { select: { shortName: true } } } } } },
        },
      },
    },
  });

  const toRemove: string[] = [];
  let checked = 0;
  for (const ua of uasWithActive) {
    const qualifies = await checkAchievement(ua.userId, ua.achievement);
    checked++;
    if (checked % 500 === 0) {
      console.log(`   Checked ${checked}/${uasWithActive.length}...`);
    }
    if (!qualifies) toRemove.push(ua.id);
  }

  if (toRemove.length > 0 && !DRY_RUN) {
    await prisma.userAchievement.deleteMany({ where: { id: { in: toRemove } } });
  }
  console.log(`   ${toRemove.length} no longer qualify (removed).`);

  console.log('3. Adding missing unlocks from logs (map-based)...');
  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: userWhere,
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: userWhere,
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);
  const pairSet = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...challengePairs, ...eePairs]) {
    pairSet.set(`${p.userId}:${p.mapId}`, { userId: p.userId, mapId: p.mapId });
  }
  const pairs = Array.from(pairSet.values());
  let mapUnlocks = 0;
  for (const { userId, mapId } of pairs) {
    const unlocked = await processMapAchievements(userId, mapId, DRY_RUN);
    mapUnlocks += unlocked.length;
  }
  console.log(`   Processed ${pairs.length} (userId, mapId) pairs; ${mapUnlocks} new unlocks.`);

  console.log('4. Adding missing unlocks (global achievements)...');
  let globalUnlocks = 0;
  if (SKIP_GLOBAL) {
    console.log('   Skipped global achievement pass.');
  } else {
    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });
    const totalUsers = users.length;
    if (FULL_GLOBAL_PASS) {
      console.log(`   Checking ${totalUsers} users with legacy full pass...`);
      if (!DRY_RUN) {
        for (let i = 0; i < users.length; i++) {
          const user = users[i]!;
          const added = await checkAllAchievements(user.id);
          globalUnlocks += added.length;
          if ((i + 1) % 100 === 0 || i === users.length - 1) {
            console.log(`   Checked ${i + 1}/${totalUsers} users, ${globalUnlocks} new global unlocks so far.`);
          }
        }
      }
    } else {
      const globalAchievements = await prisma.achievement.findMany({
        where: {
          isActive: true,
          mapId: null,
          easterEggId: null,
        },
      });
      console.log(`   Checking ${totalUsers} users across ${globalAchievements.length} global achievements...`);
      const globalAchievementIds = globalAchievements.map((a) => a.id);
      if (!DRY_RUN && globalAchievements.length > 0) {
        for (let i = 0; i < users.length; i++) {
          const user = users[i]!;
          const existing = await prisma.userAchievement.findMany({
            where: {
              userId: user.id,
              achievementId: { in: globalAchievementIds },
            },
            select: { achievementId: true },
          });
          const existingSet = new Set(existing.map((e) => e.achievementId));
          const toCreate: { userId: string; achievementId: string }[] = [];
          for (const achievement of globalAchievements) {
            if (existingSet.has(achievement.id)) continue;
            const qualifies = await checkAchievement(user.id, achievement);
            if (qualifies) {
              toCreate.push({ userId: user.id, achievementId: achievement.id });
            }
          }
          if (toCreate.length > 0) {
            await prisma.userAchievement.createMany({
              data: toCreate,
              skipDuplicates: true,
            });
            globalUnlocks += toCreate.length;
          }
          if ((i + 1) % 25 === 0 || i === users.length - 1) {
            console.log(`   Checked ${i + 1}/${totalUsers} users, ${globalUnlocks} new global unlocks so far.`);
          }
        }
      }
    }
  }
  console.log(`   ${globalUnlocks} new global/map unlocks from checkAllAchievements.`);

  console.log('5. Clearing verifiedAt, then granting only for verified runs...');
  const clearWhere = filterUserId ? { userId: filterUserId, verifiedAt: { not: null } } : { verifiedAt: { not: null } };
  if (!DRY_RUN) {
    await prisma.userAchievement.updateMany({
      where: clearWhere,
      data: { verifiedAt: null },
    });
  }
  const [verifiedChallengePairs, verifiedEePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { ...userWhere, isVerified: true },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { ...userWhere, isVerified: true },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);
  const verifiedSet = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...verifiedChallengePairs, ...verifiedEePairs]) {
    verifiedSet.set(`${p.userId}:${p.mapId}`, { userId: p.userId, mapId: p.mapId });
  }
  let verifiedGrants = 0;
  for (const { userId, mapId } of Array.from(verifiedSet.values())) {
    if (!DRY_RUN) {
      await grantVerifiedAchievementsForMap(userId, mapId, { skipUserUpdate: true });
      verifiedGrants++;
    }
  }
  console.log(`   Granted verifiedAt for ${verifiedGrants} (userId, mapId) pairs.`);

  console.log('6. Recalculating totalXp, level, verifiedTotalXp, verifiedCustomZombiesTotalXp...');
  const usersToRecalc = await prisma.user.findMany({
    where: userWhere,
    select: { id: true },
  });
  let usersUpdated = 0;
  for (const user of usersToRecalc) {
    const uas = await prisma.userAchievement.findMany({
      where: { userId: user.id },
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
      where: { id: user.id },
      select: { totalXp: true, level: true, verifiedTotalXp: true, customZombiesTotalXp: true, verifiedCustomZombiesTotalXp: true },
    });
    const needsUpdate =
      current &&
      (current.totalXp !== totalXp ||
        current.level !== level ||
        (current.verifiedTotalXp ?? 0) !== verifiedTotalXp ||
        (current.customZombiesTotalXp ?? 0) !== customZombiesTotalXp ||
        (current.verifiedCustomZombiesTotalXp ?? 0) !== verifiedCustomZombiesTotalXp);
    if (needsUpdate && !DRY_RUN) {
      await prisma.user.update({
        where: { id: user.id },
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
  }
  console.log(`   Updated ${usersUpdated} users.`);

  if (DRY_RUN) {
    console.log('\n*** Dry run complete. Run without --dry-run to apply. ***');
  } else {
    console.log('\nReverify unlocks and XP complete.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
