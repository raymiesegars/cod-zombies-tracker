#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { grantVerifiedAchievementsForMap } from '../../src/lib/verified-xp';
import { getLevelFromXp } from '../../src/lib/ranks';

const root = path.resolve(__dirname, '../..');
for (const file of ['.env', '.env.local']) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[2]!.replace(/^["']|["']$/g, '').trim();
    process.env[match[1]!] = value;
  }
}

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

type Args = {
  since: Date;
  until: Date;
  dryRun: boolean;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let sinceRaw = '';
  let untilRaw = '';
  let dryRun = false;
  for (const a of args) {
    if (a.startsWith('--since=')) sinceRaw = a.slice(8).trim().replace(/^=+/, '');
    else if (a.startsWith('--until=')) untilRaw = a.slice(8).trim().replace(/^=+/, '');
    else if (a === '--dry-run') dryRun = true;
  }

  if (!sinceRaw) {
    throw new Error('Missing --since=<ISO datetime>.');
  }
  const since = new Date(sinceRaw);
  if (Number.isNaN(since.getTime())) throw new Error(`Invalid --since value: ${sinceRaw}`);
  const until = untilRaw ? new Date(untilRaw) : new Date();
  if (Number.isNaN(until.getTime())) throw new Error(`Invalid --until value: ${untilRaw}`);

  return { since, until, dryRun };
}

async function main() {
  const { since, until, dryRun } = parseArgs();
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Window: ${since.toISOString()} -> ${until.toISOString()}`);

  const updatedPairs = await prisma.challengeLog.findMany({
    where: {
      isVerified: true,
      verifiedById: null,
      verifiedAt: {
        gte: since,
        lte: until,
      },
      user: {
        externalIdentities: {
          some: { source: 'SRC' },
        },
      },
    },
    select: { userId: true, mapId: true },
    distinct: ['userId', 'mapId'],
  });

  if (updatedPairs.length === 0) {
    console.log('No updated SRC challenge logs found in this window.');
    return;
  }

  const impactedUsers = Array.from(new Set(updatedPairs.map((p) => p.userId)));
  const impactedMaps = Array.from(new Set(updatedPairs.map((p) => p.mapId)));
  console.log(`Impacted pairs: ${updatedPairs.length}`);
  console.log(`Impacted users: ${impactedUsers.length}`);
  console.log(`Impacted maps: ${impactedMaps.length}`);

  const clearWhere = {
    userId: { in: impactedUsers },
    verifiedAt: { not: null as Date | null },
    achievement: { mapId: { in: impactedMaps } },
  };

  if (!dryRun) {
    const cleared = await prisma.userAchievement.updateMany({
      where: clearWhere,
      data: { verifiedAt: null },
    });
    console.log(`Cleared verifiedAt on ${cleared.count} UserAchievement rows.`);
  } else {
    const toClear = await prisma.userAchievement.count({ where: clearWhere });
    console.log(`[DRY] Would clear verifiedAt on ${toClear} UserAchievement rows.`);
  }

  if (!dryRun) {
    let processed = 0;
    for (const pair of updatedPairs) {
      await grantVerifiedAchievementsForMap(pair.userId, pair.mapId, { skipUserUpdate: true });
      processed++;
      if (processed % 100 === 0) {
        console.log(`Granted verified achievements for ${processed}/${updatedPairs.length} pairs...`);
      }
    }
  } else {
    console.log(`[DRY] Would grant verified achievements for ${updatedPairs.length} user/map pairs.`);
  }

  if (!dryRun) {
    let usersUpdated = 0;
    for (const userId of impactedUsers) {
      const uas = await prisma.userAchievement.findMany({
        where: { userId, achievement: { isActive: true } },
        select: {
          verifiedAt: true,
          achievement: {
            select: {
              xpReward: true,
              map: { select: { game: { select: { shortName: true } } } },
              easterEgg: { select: { map: { select: { game: { select: { shortName: true } } } } } },
            },
          },
        },
      });

      let totalXp = 0;
      let customZombiesTotalXp = 0;
      let verifiedTotalXp = 0;
      let verifiedCustomZombiesTotalXp = 0;

      for (const ua of uas) {
        const shortName =
          ua.achievement.map?.game?.shortName ??
          ua.achievement.easterEgg?.map?.game?.shortName ??
          null;
        const xp = ua.achievement.xpReward;
        const isCustom = shortName === 'BO3_CUSTOM';
        if (isCustom) customZombiesTotalXp += xp;
        else totalXp += xp;
        if (ua.verifiedAt) {
          if (isCustom) verifiedCustomZombiesTotalXp += xp;
          else verifiedTotalXp += xp;
        }
      }

      const level = getLevelFromXp(totalXp).level;
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXp,
          customZombiesTotalXp,
          verifiedTotalXp,
          verifiedCustomZombiesTotalXp,
          level,
        },
      });
      usersUpdated++;
      if (usersUpdated % 100 === 0) {
        console.log(`Recomputed XP fields for ${usersUpdated}/${impactedUsers.length} users...`);
      }
    }
    console.log(`Recomputed XP fields for ${usersUpdated} users.`);
  } else {
    console.log(`[DRY] Would recompute XP fields for ${impactedUsers.length} users.`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
