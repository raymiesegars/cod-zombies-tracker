/**
 * One-time fix: set roundReached on existing speedrun ChallengeLogs to the round
 * for that speedrun type (e.g. ROUND_30_SPEEDRUN → 30), so high-round achievements unlock.
 *
 * 1. Finds all ChallengeLogs whose challenge type is a round-based speedrun and
 *    roundReached is below the speedrun round (e.g. 0 for ROUND_100_SPEEDRUN).
 *    Updates roundReached to the speedrun round only when it's too low. Leaves
 *    higher values (e.g. 102) unchanged.
 * 2. Re-unlocks achievements for each affected (userId, mapId).
 * 3. Grants verifiedAt where the run is verified.
 * 4. Recalculates totalXp, level, verifiedTotalXp for affected users only.
 *
 * Safe: only updates ChallengeLog.roundReached, UserAchievement, and User. Does not
 * delete or deactivate anything. Only touches logs that have a speedrun challenge type
 * with a defined round and currently wrong roundReached.
 *
 * Run: pnpm db:fix-speedrun-logs-round-reached
 *      pnpm db:fix-speedrun-logs-round-reached --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { getRoundForSpeedrunChallengeType } from './import-skrine-csv/speedrun-round-by-type';
import { processMapAchievements } from '../src/lib/achievements';
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';
import { getLevelFromXp } from '../src/lib/ranks';

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

  const speedrunTypesWithRound = [
    'ROUND_5_SPEEDRUN', 'ROUND_10_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_20_SPEEDRUN',
    'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN',
    'ROUND_200_SPEEDRUN', 'ROUND_255_SPEEDRUN', 'ROUND_935_SPEEDRUN', 'ROUND_999_SPEEDRUN',
    'EXFIL_SPEEDRUN', 'EXFIL_R21_SPEEDRUN', 'EXFIL_R5_SPEEDRUN', 'EXFIL_R10_SPEEDRUN', 'EXFIL_R20_SPEEDRUN',
    'SUPER_30_SPEEDRUN', 'INSTAKILL_ROUND_SPEEDRUN',
  ];

  const logs = await prisma.challengeLog.findMany({
    where: { challenge: { type: { in: speedrunTypesWithRound } } },
    select: {
      id: true,
      userId: true,
      mapId: true,
      roundReached: true,
      challenge: { select: { type: true } },
    },
  });

  const toUpdate: { id: string; roundReached: number }[] = [];
  for (const log of logs) {
    const type = log.challenge?.type;
    if (!type) continue;
    const expectedRound = getRoundForSpeedrunChallengeType(type);
    if (expectedRound == null) continue;
    if (log.roundReached >= expectedRound) continue;
    toUpdate.push({ id: log.id, roundReached: expectedRound });
  }

  console.log(`1. Speedrun logs with roundReached below target (will fix): ${toUpdate.length}`);

  if (toUpdate.length === 0) {
    console.log('   Nothing to update.');
    await prisma.$disconnect();
    return;
  }

  if (!DRY_RUN) {
    for (const { id, roundReached } of toUpdate) {
      await prisma.challengeLog.update({
        where: { id },
        data: { roundReached },
      });
    }
    console.log(`   Updated ${toUpdate.length} ChallengeLog(s).\n`);
  } else {
    console.log(`   [DRY] Would update ${toUpdate.length} ChallengeLog(s).\n`);
  }

  const updatedIds = new Set(toUpdate.map((u) => u.id));
  const logsForPairs = logs.filter((l) => updatedIds.has(l.id));
  const pairSet = new Map<string, { userId: string; mapId: string }>();
  for (const l of logsForPairs) {
    pairSet.set(`${l.userId}:${l.mapId}`, { userId: l.userId, mapId: l.mapId });
  }
  const pairs = Array.from(pairSet.values());

  console.log(`2. Re-unlocking achievements for ${pairs.length} (userId, mapId) pairs...`);
  let totalNewUnlocks = 0;
  for (const { userId, mapId } of pairs) {
    const unlocked = await processMapAchievements(userId, mapId, DRY_RUN);
    if (unlocked.length > 0) totalNewUnlocks += unlocked.length;
  }
  console.log(`   New unlocks: ${totalNewUnlocks}.\n`);

  if (!DRY_RUN && pairs.length > 0) {
    console.log('3. Granting verifiedAt for verified runs...');
    for (const { userId, mapId } of pairs) {
      await grantVerifiedAchievementsForMap(userId, mapId, { skipUserUpdate: true });
    }
    console.log('   Done.\n');
  }

  console.log('4. Recalculating totalXp, level, verifiedTotalXp for affected users...');
  const userIds = Array.from(new Set(pairs.map((p) => p.userId)));

  if (DRY_RUN) {
    console.log(`   [DRY] Would recalc ${userIds.length} users.\n`);
  } else if (userIds.length > 0) {
    let usersUpdated = 0;
    for (const userId of userIds) {
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
    console.log('Speedrun roundReached fix complete.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
