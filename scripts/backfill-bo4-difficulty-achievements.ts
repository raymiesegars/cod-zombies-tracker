/**
 * Backfill BO4 achievements: add CASUAL, HARDCORE, and REALISTIC rows for each
 * BO4 map. (NORMAL already exists from migration backfill.)
 *
 * Run after the BO4 difficulty migration. Does not truncate or delete anything.
 *
 * Usage (dev): pnpm exec tsx scripts/backfill-bo4-difficulty-achievements.ts
 * Usage (prod): BACKFILL_USE_PRODUCTION=1 pnpm exec tsx scripts/backfill-bo4-difficulty-achievements.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');

const envFiles = process.env.BACKFILL_USE_PRODUCTION ? ['.env', '.env.production'] : ['.env', '.env.local'];

for (const file of envFiles) {
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
import { getMapAchievementDefinitions } from '../src/lib/achievements/seed-achievements';
import { BO4_DIFFICULTIES } from '../src/lib/bo4';

const DIFFICULTIES_TO_ADD = BO4_DIFFICULTIES.filter((d) => d !== 'NORMAL'); // NORMAL already backfilled

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL. Load .env.local (dev) or .env.production.');
    process.exit(1);
  }

  console.log('Fetching BO4 maps with challenges...');
  const bo4Maps = await prisma.map.findMany({
    where: { game: { shortName: 'BO4' } },
    include: {
      game: { select: { shortName: true } },
      challenges: { where: { isActive: true } },
    },
  });

  if (bo4Maps.length === 0) {
    console.log('No BO4 maps found. Exiting.');
    return;
  }

  console.log(`Found ${bo4Maps.length} BO4 map(s). Generating CASUAL / HARDCORE / REALISTIC achievements...`);

  let created = 0;
  let skipped = 0;

  for (const map of bo4Maps) {
    const defs = getMapAchievementDefinitions(map.slug, map.roundCap, map.game?.shortName ?? 'BO4');
    const challengesByType = Object.fromEntries(map.challenges.map((c) => [c.type, c]));

    const toCreate = defs.filter((d) => d.difficulty && DIFFICULTIES_TO_ADD.includes(d.difficulty));

    for (const def of toCreate) {
      const criteria = def.criteria as { round?: number; challengeType?: string; isCap?: boolean };
      const challengeId = criteria.challengeType
        ? challengesByType[criteria.challengeType as keyof typeof challengesByType]?.id ?? null
        : null;

      try {
        await prisma.achievement.create({
          data: {
            mapId: map.id,
            name: def.name,
            slug: def.slug,
            type: def.type as any,
            rarity: def.rarity as any,
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
            difficulty: def.difficulty as any,
          },
        });
        created++;
      } catch (e: any) {
        if (e?.code === 'P2002') {
          skipped++;
        } else {
          throw e;
        }
      }
    }
  }

  console.log(`Done. Created ${created} achievement(s), skipped ${skipped} (already existed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
