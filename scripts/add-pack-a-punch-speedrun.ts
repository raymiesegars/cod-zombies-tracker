#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as path from 'path';

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

import prisma from '../src/lib/prisma';
import { getSpeedrunAchievementDefinitions } from '../src/lib/achievements/seed-achievements';
import { noMapSlugToCzt } from '../src/lib/achievements/wr-to-tiers';

const DRY_RUN = process.argv.includes('--dry-run');
const GAME_KEY_TO_SHORT: Record<string, string> = {
  aw: 'AW',
  waw: 'WAW',
  bo: 'BO1',
  bo2: 'BO2',
  bo3: 'BO3',
  bo4: 'BO4',
  iw: 'IW',
  wwii: 'WW2',
};

async function main() {
  const numberOnesPath = path.join(root, 'number_ones.json');
  if (!fs.existsSync(numberOnesPath)) {
    throw new Error('number_ones.json not found');
  }
  const data = JSON.parse(fs.readFileSync(numberOnesPath, 'utf-8')) as Record<string, unknown>;

  let mapsSeen = 0;
  let challengesCreated = 0;
  let achievementsCreated = 0;
  let skippedMaps = 0;

  for (const [gameKey, shortName] of Object.entries(GAME_KEY_TO_SHORT)) {
    const byGame = data[gameKey] as Record<string, unknown> | undefined;
    const byCategory = byGame?.['pack-a-punch-speedrun'] as Record<string, unknown> | undefined;
    if (!byCategory || typeof byCategory !== 'object') continue;

    for (const mapKey of Object.keys(byCategory)) {
      mapsSeen++;
      const mapSlug = noMapSlugToCzt(shortName, mapKey);
      const map = await prisma.map.findFirst({
        where: { slug: mapSlug, game: { shortName } },
        select: { id: true, slug: true, game: { select: { shortName: true } } },
      });
      if (!map) {
        skippedMaps++;
        continue;
      }

      let challenge = await prisma.challenge.findFirst({
        where: { mapId: map.id, type: 'PACK_A_PUNCH_SPEEDRUN' as never },
        select: { id: true },
      });
      if (!challenge) {
        if (!DRY_RUN) {
          challenge = await prisma.challenge.create({
            data: {
              mapId: map.id,
              type: 'PACK_A_PUNCH_SPEEDRUN' as never,
              name: 'Pack-a-Punch Speedrun',
              slug: 'pack-a-punch-speedrun',
              description: 'Reach Pack-a-Punch / weapon upgrade as fast as possible',
              xpReward: 0,
              isActive: true,
            },
            select: { id: true },
          });
        } else {
          challenge = { id: 'dry-run-challenge' };
        }
        challengesCreated++;
      }

      const defs = getSpeedrunAchievementDefinitions(map.slug, map.game.shortName).filter(
        (d) => d.criteria?.challengeType === 'PACK_A_PUNCH_SPEEDRUN'
      );
      for (const def of defs) {
        const existing = await prisma.achievement.findFirst({
          where: { mapId: map.id, slug: def.slug },
          select: { id: true },
        });
        if (existing) continue;
        if (!DRY_RUN) {
          await prisma.achievement.create({
            data: {
              name: def.name,
              slug: def.slug,
              type: def.type as never,
              criteria: def.criteria as object,
              xpReward: def.xpReward,
              rarity: def.rarity as never,
              mapId: map.id,
              challengeId: challenge.id,
              isActive: true,
            } as never,
          });
        }
        achievementsCreated++;
      }
    }
  }

  console.log(`Maps seen: ${mapsSeen}`);
  console.log(`Challenges created: ${challengesCreated}`);
  console.log(`Achievements created: ${achievementsCreated}`);
  console.log(`Skipped maps (no match): ${skippedMaps}`);
  if (DRY_RUN) console.log('Dry run only. No writes made.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

