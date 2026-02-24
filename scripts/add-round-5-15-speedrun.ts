/**
 * Add Round 5 and Round 15 speedrun challenges and achievements.
 *
 * SAFE: No truncation, no deletion of user data. Only creates missing challenges
 * and achievements. Run after migration 20260305000000_add_round_5_and_15_speedrun.
 *
 * Usage:
 *   pnpm exec tsx scripts/add-round-5-15-speedrun.ts
 *   pnpm exec tsx scripts/add-round-5-15-speedrun.ts --dry-run
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
import { getSpeedrunAchievementDefinitions } from '../src/lib/achievements/seed-achievements';
import { ROUND_5_15_WR_BY_GAME_MAP } from '../src/lib/achievements/round-5-15-wr-data';

const DRY_RUN = process.argv.includes('--dry-run');

const R5_R15_TYPES = [
  { type: 'ROUND_5_SPEEDRUN' as const, name: 'Round 5 Speedrun', description: 'Reach round 5 as fast as possible' },
  { type: 'ROUND_15_SPEEDRUN' as const, name: 'Round 15 Speedrun', description: 'Reach round 15 as fast as possible' },
];

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  const games = await prisma.game.findMany({
    include: { maps: { include: { challenges: true } } },
  });

  const gameByShortName = new Map(games.map((g) => [g.shortName, g]));
  let challengesCreated = 0;
  let achievementsCreated = 0;

  for (const [gameShortName, mapWrs] of Object.entries(ROUND_5_15_WR_BY_GAME_MAP)) {
    const game = gameByShortName.get(gameShortName);
    if (!game) continue;

    for (const [mapSlug, wr] of Object.entries(mapWrs)) {
      const map = game.maps.find((m) => m.slug === mapSlug);
      if (!map) continue;

      const existingTypes = new Set(map.challenges.map((c) => c.type));

      for (const { type, name, description } of R5_R15_TYPES) {
        const hasWr = type === 'ROUND_5_SPEEDRUN' ? wr.r5 != null : wr.r15 != null;
        if (!hasWr || existingTypes.has(type)) continue;

        if (!DRY_RUN) {
          await prisma.challenge.create({
            data: {
              name,
              slug: type.toLowerCase().replace(/_/g, '-'),
              type,
              mapId: map.id,
              xpReward: 0,
              description,
              isActive: true,
            },
          });
        }
        challengesCreated++;
      }

      const speedrunDefs = getSpeedrunAchievementDefinitions(mapSlug, gameShortName);
      const r5r15Defs = speedrunDefs.filter((d) =>
        d.criteria?.challengeType === 'ROUND_5_SPEEDRUN' || d.criteria?.challengeType === 'ROUND_15_SPEEDRUN'
      );

      for (const def of r5r15Defs) {
        const existing = await prisma.achievement.findFirst({
          where: {
            mapId: map.id,
            slug: def.slug,
          },
        });
        if (existing) continue;

        const challenge = await prisma.challenge.findFirst({
          where: { mapId: map.id, type: def.criteria?.challengeType as string },
        });

        if (!DRY_RUN) {
          await prisma.achievement.create({
            data: {
              name: def.name,
              slug: def.slug,
              type: def.type,
              criteria: def.criteria as object,
              xpReward: def.xpReward,
              rarity: def.rarity,
              mapId: map.id,
              challengeId: challenge?.id ?? null,
              isActive: true,
            },
          });
        }
        achievementsCreated++;
      }
    }
  }

  console.log(`Challenges created: ${challengesCreated}`);
  console.log(`Achievements created: ${achievementsCreated}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
