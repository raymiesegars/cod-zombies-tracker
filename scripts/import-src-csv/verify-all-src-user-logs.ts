#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as path from 'path';
import prisma from '../../src/lib/prisma';
import { processMapAchievements } from '../../src/lib/achievements';
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

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`);

  const srcUserRows = await prisma.user.findMany({
    where: {
      externalIdentities: {
        some: { source: 'SRC' },
      },
    },
    select: { id: true },
  });
  const srcUserIds = srcUserRows.map((u) => u.id);
  console.log(`SRC users found: ${srcUserIds.length}`);
  if (srcUserIds.length === 0) return;

  const [pendingChallengeUsers, pendingEeUsers] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { userId: { in: srcUserIds }, isVerified: false },
      select: { userId: true },
      distinct: ['userId'],
    }),
    prisma.easterEggLog.findMany({
      where: { userId: { in: srcUserIds }, isVerified: false },
      select: { userId: true },
      distinct: ['userId'],
    }),
  ]);

  const impactedUserIdSet = new Set<string>();
  for (const row of pendingChallengeUsers) impactedUserIdSet.add(row.userId);
  for (const row of pendingEeUsers) impactedUserIdSet.add(row.userId);
  const impactedUserIds = Array.from(impactedUserIdSet);
  console.log(`SRC users with non-verified logs: ${impactedUserIds.length}`);

  if (impactedUserIds.length === 0) {
    console.log('No SRC logs need verification changes.');
    return;
  }

  if (!DRY_RUN) {
    const now = new Date();
    const [challengeUpdated, eeUpdated] = await Promise.all([
      prisma.challengeLog.updateMany({
        where: { userId: { in: impactedUserIds }, isVerified: false },
        data: {
          isVerified: true,
          verifiedAt: now,
          verifiedById: null,
          verificationRequestedAt: null,
        },
      }),
      prisma.easterEggLog.updateMany({
        where: { userId: { in: impactedUserIds }, isVerified: false },
        data: {
          isVerified: true,
          verifiedAt: now,
          verifiedById: null,
          verificationRequestedAt: null,
        },
      }),
    ]);
    console.log(`Updated challenge logs: ${challengeUpdated.count}`);
    console.log(`Updated easter egg logs: ${eeUpdated.count}`);
  } else {
    const [challengeCount, eeCount] = await Promise.all([
      prisma.challengeLog.count({ where: { userId: { in: impactedUserIds }, isVerified: false } }),
      prisma.easterEggLog.count({ where: { userId: { in: impactedUserIds }, isVerified: false } }),
    ]);
    console.log(`[DRY] Would update challenge logs: ${challengeCount}`);
    console.log(`[DRY] Would update easter egg logs: ${eeCount}`);
  }

  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { userId: { in: impactedUserIds }, isVerified: true },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { userId: { in: impactedUserIds }, isVerified: true },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);

  const pairMap = new Map<string, { userId: string; mapId: string }>();
  for (const pair of [...challengePairs, ...eePairs]) {
    pairMap.set(`${pair.userId}:${pair.mapId}`, pair);
  }
  const pairs = Array.from(pairMap.values());
  console.log(`Impacted verified user/map pairs: ${pairs.length}`);

  if (!DRY_RUN) {
    let done = 0;
    for (const pair of pairs) {
      await processMapAchievements(pair.userId, pair.mapId, false);
      await grantVerifiedAchievementsForMap(pair.userId, pair.mapId, { skipUserUpdate: true });
      done++;
      if (done % 500 === 0) console.log(`Revalidated ${done}/${pairs.length} user/map pairs...`);
    }
  } else {
    console.log(`[DRY] Would revalidate achievements + verified flags for ${pairs.length} user/map pairs.`);
  }

  if (!DRY_RUN) {
    let usersUpdated = 0;
    for (const userId of impactedUserIds) {
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
      if (usersUpdated % 500 === 0) console.log(`Recomputed XP for ${usersUpdated}/${impactedUserIds.length} users...`);
    }
    console.log(`Recomputed XP fields for users: ${usersUpdated}`);
  } else {
    console.log(`[DRY] Would recompute XP fields for users: ${impactedUserIds.length}`);
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
