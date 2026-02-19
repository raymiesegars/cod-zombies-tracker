import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');

const envFiles = process.env.BACKFILL_USE_PRODUCTION
  ? ['.env', '.env.production']
  : ['.env', '.env.local'];

for (const file of envFiles) {
  const p = path.join(root, file);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (match) {
        let value = match[2]!.replace(/^["']|["']$/g, '').trim();
        if (value.startsWith('=')) value = value.slice(1).trim();
        process.env[match[1]!] = value;
      }
    }
  }
}

import prisma from '../src/lib/prisma';
import { processMapAchievements } from '../src/lib/achievements';

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL. Load .env.local (dev) or production env.');
    process.exit(1);
  }
  const host = dbUrl.includes('@') ? new URL(dbUrl.replace(/^postgresql:/, 'postgres:')).hostname : 'unknown';
  if (process.env.BACKFILL_USE_PRODUCTION) {
    console.log('BACKFILL_USE_PRODUCTION=1 → loaded .env.production');
  }
  console.log('Using DB host:', host);

  const filterUserId = process.env.BACKFILL_USER_ID?.trim();
  let pairs: { userId: string; mapId: string }[];

  if (filterUserId) {
    console.log(`Fetching ChallengeLog rows for userId=${filterUserId}...`);
    pairs = await prisma.challengeLog.findMany({
      where: { userId: filterUserId },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    });
    console.log(`Found ${pairs.length} user+map pair(s) for this user.`);
  } else {
    console.log('Fetching distinct (userId, mapId) from ChallengeLog...');
    const [allPairs, totalLogs] = await Promise.all([
      prisma.challengeLog.findMany({
        select: { userId: true, mapId: true },
        distinct: ['userId', 'mapId'],
      }),
      prisma.challengeLog.count(),
    ]);
    pairs = allPairs;
    console.log(`ChallengeLog: ${totalLogs} total row(s), ${pairs.length} distinct (userId, mapId).`);
  }

  const verbose = process.env.BACKFILL_VERBOSE === '1';
  console.log(`Found ${pairs.length} user+map combinations. Running processMapAchievements for each...${verbose ? ' (verbose)' : ''}`);

  let processed = 0;
  let totalNewUnlocks = 0;

  for (const { userId, mapId } of pairs) {
    if (verbose) {
      const logs = await prisma.challengeLog.findMany({
        where: { userId, mapId },
        select: { roundReached: true },
      });
      const maxRound = logs.length ? Math.max(...logs.map((l) => l.roundReached)) : 0;
      const roundMilestones = await prisma.achievement.findMany({
        where: { mapId, type: 'ROUND_MILESTONE' },
        select: { id: true, name: true, criteria: true },
      });
      const unlockedIds = new Set(
        (
          await prisma.userAchievement.findMany({
            where: { userId, achievementId: { in: roundMilestones.map((a) => a.id) } },
            select: { achievementId: true },
          })
        ).map((u) => u.achievementId)
      );
      const toUnlock = roundMilestones.filter((a) => !unlockedIds.has(a.id));
      console.log(
        `  [${processed + 1}/${pairs.length}] user=${userId.slice(0, 8)}... map=${mapId.slice(0, 8)}... maxRound=${maxRound} roundMilestones=${roundMilestones.length} alreadyUnlocked=${unlockedIds.size} toUnlock=${toUnlock.length}`
      );
      if (verbose) {
        console.log(`      userId=${userId} mapId=${mapId}`);
      }
      for (const a of toUnlock) {
        const c = (a.criteria as { round?: number; isCap?: boolean }) ?? {};
        const cap = c.round ?? (c.isCap ? 'mapCap' : '?');
        const qualifies =
          typeof cap === 'number' ? maxRound >= cap : c.isCap ? '(map cap)' : false;
        console.log(`      would unlock: "${a.name}" (round >= ${cap}) qualifies=${qualifies}`);
      }
    }
    const unlocked = await processMapAchievements(userId, mapId);
    processed++;
    if (unlocked.length > 0) {
      totalNewUnlocks += unlocked.length;
      console.log(`  [${processed}/${pairs.length}] userId=${userId.slice(0, 8)}... mapId=${mapId.slice(0, 8)}... → ${unlocked.length} new achievement(s)`);
    }
    if (!verbose && processed % 100 === 0 && unlocked.length === 0) {
      console.log(`  [${processed}/${pairs.length}] ...`);
    }
  }

  console.log('Done.');
  console.log(`Processed ${processed} user+map pairs. Total new achievements unlocked: ${totalNewUnlocks}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
