/**
 * Creates achievements ONLY for the BO7 map Paradox Junction.
 * Does not touch any other map or existing achievements. Safe for production.
 * Run after db:add-paradox-junction. No logs exist for this map so no reunlock/XP steps needed.
 *
 * Run: pnpm db:sync-achievements-paradox-junction-only
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import {
  getMapAchievementDefinitions,
  getSpeedrunAchievementDefinitions,
} from '../src/lib/achievements/seed-achievements';
import { isRestrictedAchievement } from '../src/lib/achievements/categories';

const MAP_SLUG = 'paradox-junction';

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

async function main() {
  const map = await prisma.map.findUnique({
    where: { slug: MAP_SLUG },
    include: {
      game: { select: { shortName: true } },
      challenges: { where: { isActive: true } },
      easterEggs: { where: { isActive: true }, select: { id: true, slug: true, name: true, xpReward: true } },
    },
  });

  if (!map) {
    console.error(`Map "${MAP_SLUG}" not found. Run db:add-paradox-junction first.`);
    process.exit(1);
  }

  const gameShortName = map.game?.shortName ?? '';
  if (gameShortName !== 'BO7') {
    console.error(`Map ${MAP_SLUG} is not BO7.`);
    process.exit(1);
  }

  const mapDefs = getMapAchievementDefinitions(map.slug, map.roundCap, gameShortName);
  const speedrunDefs = getSpeedrunAchievementDefinitions(map.slug, gameShortName);
  const defs = [...mapDefs, ...speedrunDefs];
  const challengesByType = Object.fromEntries(map.challenges.map((c) => [c.type, c]));
  const easterEggsBySlug = Object.fromEntries(map.easterEggs.map((e) => [e.slug, e]));

  let created = 0;
  for (const def of defs) {
    const criteria = def.criteria as { challengeType?: string };
    const challengeId = criteria.challengeType
      ? (challengesByType[criteria.challengeType as keyof typeof challengesByType] as { id: string } | undefined)?.id
      : null;
    const difficulty = def.difficulty ?? null;
    let easterEggId: string | null = null;
    if ('easterEggId' in def && def.easterEggId) {
      easterEggId = def.easterEggId as string;
    } else if ('easterEggSlug' in def && def.easterEggSlug) {
      easterEggId = easterEggsBySlug[def.easterEggSlug as string]?.id ?? null;
    }

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

    if (existing) continue;

    await prisma.achievement.create({
      data: {
        mapId: map.id,
        name: def.name,
        slug: def.slug,
        type: def.type,
        rarity: def.rarity,
        xpReward: def.xpReward,
        criteria: def.criteria as object,
        challengeId: challengeId ?? undefined,
        easterEggId: easterEggId ?? undefined,
        difficulty,
        isActive: true,
      },
    });
    created++;
  }

  for (const ee of map.easterEggs) {
    if (ee.xpReward <= 0) continue;
    const existing = await prisma.achievement.findFirst({
      where: { easterEggId: ee.id },
    });
    if (existing) continue;
    const slugBase = (ee.slug || `ee-${ee.id.slice(-8)}`).replace(/[^a-z0-9-]/gi, '-').toLowerCase().replace(/-+/g, '-') || 'easter-egg';
    let attempt = 0;
    while (true) {
      const slug = attempt === 0 ? slugBase : `${slugBase}-${attempt}`;
      try {
        await prisma.achievement.create({
          data: {
            mapId: map.id,
            easterEggId: ee.id,
            name: ee.name,
            slug,
            type: 'EASTER_EGG_COMPLETE',
            rarity: 'LEGENDARY',
            xpReward: ee.xpReward,
            criteria: {},
          },
        });
        created++;
        break;
      } catch (err: unknown) {
        const isUniqueViolation = err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002';
        if (isUniqueViolation && attempt < 100) {
          attempt++;
        } else {
          throw err;
        }
      }
    }
  }

  console.log(`Paradox Junction: created ${created} achievements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
