#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/lib/prisma';
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';
import { getLevelFromXp } from '../src/lib/ranks';

const root = path.resolve(__dirname, '..');
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
const mapSlugs = process.env.BACKFILL_MAP_SLUGS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
const concurrency = Number(process.env.BACKFILL_CONCURRENCY ?? '8');

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T, index: number) => Promise<void>) {
  let nextIndex = 0;
  let active = 0;
  await new Promise<void>((resolve, reject) => {
    const launch = () => {
      while (active < limit && nextIndex < items.length) {
        const idx = nextIndex++;
        active++;
        worker(items[idx]!, idx)
          .then(() => {
            active--;
            if (nextIndex >= items.length && active === 0) resolve();
            else launch();
          })
          .catch(reject);
      }
    };
    launch();
  });
}

async function main() {
  if (mapSlugs.length === 0) {
    throw new Error('Set BACKFILL_MAP_SLUGS to a comma-separated map slug list.');
  }
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Map slugs: ${mapSlugs.length}`);
  console.log(`Concurrency: ${concurrency}`);

  const maps = await prisma.map.findMany({
    where: { slug: { in: mapSlugs } },
    select: { id: true },
  });
  const mapIds = maps.map((m) => m.id);
  console.log(`Resolved map IDs: ${mapIds.length}`);

  const [challengePairs, eePairs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { isVerified: true, mapId: { in: mapIds } },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { isVerified: true, mapId: { in: mapIds } },
      select: { userId: true, mapId: true },
      distinct: ['userId', 'mapId'],
    }),
  ]);

  const pairMap = new Map<string, { userId: string; mapId: string }>();
  for (const p of [...challengePairs, ...eePairs]) pairMap.set(`${p.userId}:${p.mapId}`, p);
  const pairs = Array.from(pairMap.values());
  const impactedUsers = Array.from(new Set(pairs.map((p) => p.userId)));
  console.log(`Verified pairs to restore: ${pairs.length}`);
  console.log(`Impacted users: ${impactedUsers.length}`);

  const clearWhere = {
    verifiedAt: { not: null as Date | null },
    achievement: { mapId: { in: mapIds } },
  };

  if (!DRY_RUN) {
    const cleared = await prisma.userAchievement.updateMany({
      where: clearWhere,
      data: { verifiedAt: null },
    });
    console.log(`Cleared verifiedAt on ${cleared.count} rows.`);
  } else {
    const toClear = await prisma.userAchievement.count({ where: clearWhere });
    console.log(`[DRY] Would clear verifiedAt on ${toClear} rows.`);
  }

  if (!DRY_RUN) {
    let done = 0;
    await runWithConcurrency(pairs, Math.max(1, concurrency), async (pair) => {
      await grantVerifiedAchievementsForMap(pair.userId, pair.mapId, { skipUserUpdate: true });
      done++;
      if (done % 500 === 0) console.log(`Granted ${done}/${pairs.length} pairs...`);
    });
  } else {
    console.log(`[DRY] Would grant verified achievements for ${pairs.length} pairs.`);
  }

  if (!DRY_RUN) {
    let usersDone = 0;
    for (const userId of impactedUsers) {
      const uas = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: { select: { xpReward: true, isActive: true } } },
      });
      const totalXp = uas.filter((ua) => ua.achievement.isActive).reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
      const verifiedTotalXp = uas
        .filter((ua) => ua.achievement.isActive && ua.verifiedAt != null)
        .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
      const { level } = getLevelFromXp(totalXp);
      await prisma.user.update({
        where: { id: userId },
        data: { totalXp, level, verifiedTotalXp },
      });
      usersDone++;
      if (usersDone % 500 === 0) console.log(`Recomputed users ${usersDone}/${impactedUsers.length}...`);
    }
    console.log(`Recomputed users: ${usersDone}`);
  } else {
    console.log(`[DRY] Would recompute users: ${impactedUsers.length}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
