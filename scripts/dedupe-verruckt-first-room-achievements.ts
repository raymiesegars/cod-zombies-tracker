/**
 * Deduplicate First Room achievements for WAW and BO1 Verrückt.
 * Keeps one achievement per round, deactivates duplicates.
 *
 * Run: pnpm exec tsx scripts/dedupe-verruckt-first-room-achievements.ts
 *      pnpm exec tsx scripts/dedupe-verruckt-first-room-achievements.ts --dry-run
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

const DRY_RUN = process.argv.includes('--dry-run');
const VERRUCKT_SLUGS = ['verruckt', 'bo1-verruckt'] as const;

async function main() {
  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  console.log('Deduplicate First Room achievements (verruckt, bo1-verruckt)\n');

  let totalDeactivated = 0;

  for (const slug of VERRUCKT_SLUGS) {
    const map = await prisma.map.findFirst({ where: { slug } });
    if (!map) {
      console.log(`  [${slug}] Map not found, skipping`);
      continue;
    }

    const startRoomChal = await prisma.challenge.findFirst({
      where: { mapId: map.id, type: 'STARTING_ROOM' },
    });
    if (!startRoomChal) {
      console.log(`  [${slug}] No STARTING_ROOM challenge, skipping`);
      continue;
    }

    const firstRoomAchs = await prisma.achievement.findMany({
      where: {
        mapId: map.id,
        challengeId: startRoomChal.id,
        isActive: true,
      },
    });

    const byRound = new Map<number, typeof firstRoomAchs>();
    for (const a of firstRoomAchs) {
      const c = a.criteria as { round?: number } | null;
      const r = c?.round;
      if (r == null) continue;
      if (!byRound.has(r)) byRound.set(r, []);
      byRound.get(r)!.push(a);
    }

    for (const [round, achs] of byRound) {
      if (achs.length <= 1) continue;

      const canonical = achs.find((a) => {
        const c = a.criteria as { firstRoomVariant?: string } | null;
        return !c?.firstRoomVariant;
      });
      const keep = canonical ?? achs[0]!;
      const toDeactivate = achs.filter((a) => a.id !== keep.id);

      for (const a of toDeactivate) {
        console.log(`  [${slug}] Deactivating duplicate: ${a.name} (round ${round}, id ${a.id})`);
        if (!DRY_RUN) {
          await prisma.achievement.update({
            where: { id: a.id },
            data: { isActive: false },
          });
        }
        totalDeactivated++;
      }
    }
  }

  console.log(`\nDone. Deactivated ${totalDeactivated} duplicate achievements.`);
  if (DRY_RUN) console.log('Run without --dry-run to apply.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
