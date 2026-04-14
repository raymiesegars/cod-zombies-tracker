#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/lib/prisma';
import { getWw2MapConfig, getWw2ChallengeTypeLabel } from '../src/lib/ww2/ww2-map-config';

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

function challengeSlug(type: string): string {
  return type.toLowerCase().replace(/_/g, '-');
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`);
  const ww2Maps = await prisma.map.findMany({
    where: { game: { shortName: 'WW2' } },
    select: {
      id: true,
      slug: true,
      challenges: { select: { type: true } },
    },
  });

  let created = 0;
  const toCreate: Array<{ mapSlug: string; type: string }> = [];
  for (const map of ww2Maps) {
    const cfg = getWw2MapConfig(map.slug);
    if (!cfg) continue;
    const existing = new Set(map.challenges.map((c) => c.type));
    for (const type of cfg.challengeTypes) {
      if (type === 'HIGHEST_ROUND' || type === 'NO_DOWNS' || type === 'ONE_BOX' || type === 'STARTING_ROOM' || type === 'NO_POWER' || type === 'NO_ARMOR' || type === 'NO_BLITZ' || type === 'EASTER_EGG_SPEEDRUN' || type.startsWith('ROUND_') || type === 'SUPER_30_SPEEDRUN') {
        if (!existing.has(type)) {
          toCreate.push({ mapSlug: map.slug, type });
        }
      }
    }
  }

  if (toCreate.length === 0) {
    console.log('No missing WW2 config challenge types detected.');
    return;
  }

  console.log(`Missing challenge rows to create: ${toCreate.length}`);
  for (const row of toCreate) {
    console.log(`  - ${row.mapSlug}: ${row.type}`);
  }

  if (DRY_RUN) return;

  for (const row of toCreate) {
    const map = ww2Maps.find((m) => m.slug === row.mapSlug);
    if (!map) continue;
    await prisma.challenge.create({
      data: {
        mapId: map.id,
        type: row.type as never,
        name: getWw2ChallengeTypeLabel(row.type),
        slug: challengeSlug(row.type),
        description:
          row.type === 'ROUND_10_SPEEDRUN'
            ? 'Reach round 10 as fast as possible'
            : row.type === 'ROUND_15_SPEEDRUN'
              ? 'Reach round 15 as fast as possible'
              : row.type === 'ROUND_5_SPEEDRUN'
                ? 'Reach round 5 as fast as possible'
                : row.type === 'SUPER_30_SPEEDRUN'
                  ? 'Complete the multi-map Super 30 run as fast as possible'
                  : `${getWw2ChallengeTypeLabel(row.type)} challenge`,
        xpReward: 0,
        isActive: true,
      },
    });
    created++;
  }

  console.log(`Created WW2 challenge rows: ${created}`);
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
