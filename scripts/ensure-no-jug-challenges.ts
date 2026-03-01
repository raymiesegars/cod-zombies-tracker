/**
 * Ensure every map that has noJugWR in config has an active NO_JUG challenge.
 * Run after seed or when adding NO_JUG to new maps. Safe to run multiple times.
 *
 * Run: pnpm exec tsx scripts/ensure-no-jug-challenges.ts
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

import { PrismaClient } from '@prisma/client';
import { hasNoJugSupport } from '../src/lib/no-jug-support';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

async function main() {
  console.log('Ensure NO_JUG challenges exist and are active for maps with noJugWR\n');

  const maps = await prisma.map.findMany({
    include: { game: { select: { shortName: true } } },
  });

  let created = 0;
  let activated = 0;
  let alreadyOk = 0;

  for (const map of maps) {
    const gameShortName = map.game?.shortName ?? null;
    if (!map.slug || !hasNoJugSupport(map.slug, gameShortName)) continue;

    const existing = await prisma.challenge.findFirst({
      where: { mapId: map.id, type: 'NO_JUG' },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.challenge.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
        console.log(`  Activated NO_JUG: ${map.slug} (${gameShortName})`);
        activated++;
      } else {
        alreadyOk++;
      }
      continue;
    }

    await prisma.challenge.create({
      data: {
        mapId: map.id,
        type: 'NO_JUG',
        name: 'No Jug',
        slug: 'no-jug',
        description: 'No Juggernog',
        xpReward: 0,
        isActive: true,
      },
    });
    console.log(`  Created NO_JUG: ${map.slug} (${gameShortName})`);
    created++;
  }

  console.log(`\nDone. Created ${created}, activated ${activated}, already OK ${alreadyOk}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
