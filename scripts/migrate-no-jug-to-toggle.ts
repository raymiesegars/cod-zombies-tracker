/**
 * Migrate NO_JUG challenge logs to HIGHEST_ROUND + wawNoJug=true.
 * NO_JUG is now a run modifier (toggle), not a challenge. This script converts existing logs.
 *
 * Run: pnpm exec tsx scripts/migrate-no-jug-to-toggle.ts
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

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

async function main() {
  console.log('Migrate NO_JUG challenge logs to HIGHEST_ROUND + wawNoJug\n');

  const noJugChallenges = await prisma.challenge.findMany({
    where: { type: 'NO_JUG' },
    include: { map: { select: { slug: true } } },
  });

  let migrated = 0;
  let skipped = 0;

  for (const noJugChal of noJugChallenges) {
    const highRoundChal = await prisma.challenge.findFirst({
      where: { mapId: noJugChal.mapId, type: 'HIGHEST_ROUND', isActive: true },
    });
    if (!highRoundChal) {
      console.warn(`  No HIGHEST_ROUND challenge for map ${noJugChal.map?.slug}, skipping`);
      skipped++;
      continue;
    }

    const result = await prisma.challengeLog.updateMany({
      where: { challengeId: noJugChal.id },
      data: { challengeId: highRoundChal.id, wawNoJug: true },
    });

    if (result.count > 0) {
      console.log(`  Migrated ${result.count} logs: ${noJugChal.map?.slug} NO_JUG → HIGHEST_ROUND + No Jug`);
      migrated += result.count;
    }
  }

  // Deactivate NO_JUG challenges so they don't appear in dropdowns
  const deactivated = await prisma.challenge.updateMany({
    where: { type: 'NO_JUG' },
    data: { isActive: false },
  });
  if (deactivated.count > 0) {
    console.log(`\n  Deactivated ${deactivated.count} NO_JUG challenges`);
  }

  console.log(`\nDone. Migrated ${migrated} logs, skipped ${skipped} maps.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
