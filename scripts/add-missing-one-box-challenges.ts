/**
 * Add missing One Box Challenge records for maps that support it.
 * Safe to run multiple times (idempotent).
 *
 * Run: pnpm exec tsx scripts/add-missing-one-box-challenges.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
for (const file of ['.env', '.env.local', '.env.production']) {
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

import { PrismaClient } from '@prisma/client';
import { getWaWMapConfig } from '../src/lib/waw/waw-map-config';
import { getBo1MapConfig } from '../src/lib/bo1/bo1-map-config';
import { getBo2MapConfig } from '../src/lib/bo2/bo2-map-config';
import { getBo3MapConfig } from '../src/lib/bo3/bo3-map-config';
import { getBo4MapConfig } from '../src/lib/bo4/bo4-map-config';
import { getBocwMapConfig } from '../src/lib/bocw/bocw-map-config';
import { getBo6MapConfig } from '../src/lib/bo6/bo6-map-config';
import { getBo7MapConfig } from '../src/lib/bo7/bo7-map-config';
import { getWw2MapConfig } from '../src/lib/ww2/ww2-map-config';
import { getVanguardMapConfig } from '../src/lib/vanguard/vanguard-map-config';
import { getAwMapConfig } from '../src/lib/aw/aw-map-config';
import { IW_CHALLENGE_TYPES_ORDER } from '../src/lib/iw';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

function hasOneBox(gameShortName: string, mapSlug: string): boolean {
  const cfg =
    gameShortName === 'WAW' ? getWaWMapConfig(mapSlug)
    : gameShortName === 'BO1' ? getBo1MapConfig(mapSlug)
    : gameShortName === 'BO2' ? getBo2MapConfig(mapSlug)
    : gameShortName === 'BO3' ? getBo3MapConfig(mapSlug)
    : gameShortName === 'BO4' ? getBo4MapConfig(mapSlug)
    : gameShortName === 'BOCW' ? getBocwMapConfig(mapSlug)
    : gameShortName === 'BO6' ? getBo6MapConfig(mapSlug)
    : gameShortName === 'BO7' ? getBo7MapConfig(mapSlug)
    : gameShortName === 'WW2' ? getWw2MapConfig(mapSlug)
    : gameShortName === 'VANGUARD' ? getVanguardMapConfig(mapSlug)
    : gameShortName === 'AW' ? getAwMapConfig(mapSlug)
    : null;
  if (gameShortName === 'IW') return IW_CHALLENGE_TYPES_ORDER.includes('ONE_BOX');
  return cfg != null && cfg.challengeTypes.includes('ONE_BOX');
}

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  const maps = await prisma.map.findMany({
    include: {
      game: { select: { shortName: true } },
      challenges: { select: { type: true } },
    },
  });

  let created = 0;
  for (const map of maps) {
    const gameShortName = map.game.shortName;
    if (!hasOneBox(gameShortName, map.slug)) continue;

    const hasOneBoxChallenge = map.challenges.some((c) => c.type === 'ONE_BOX');
    if (hasOneBoxChallenge) continue;

    await prisma.challenge.create({
      data: {
        name: 'One Box Challenge',
        slug: 'one-box',
        type: 'ONE_BOX',
        mapId: map.id,
        xpReward: 0,
        description: 'Only hit the mystery box once',
        isActive: true,
      },
    });
    created++;
    console.log(`  Created One Box: ${gameShortName} / ${map.slug}`);
  }

  console.log(`\nDone. Created ${created} One Box challenge(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
