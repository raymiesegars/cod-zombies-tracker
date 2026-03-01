/**
 * One-off: Deactivate the STARTING_ROOM (First Room) challenge for BO7 Mars.
 * Mars does not have a first room challenge per game rules.
 *
 * Run once after removing STARTING_ROOM from Mars in bo7-map-config:
 *   pnpm exec tsx scripts/deactivate-mars-first-room.ts
 *
 * Then run pnpm db:sync-achievements to prune First Room achievements for Mars.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

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
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
});

async function main() {
  const map = await prisma.map.findFirst({
    where: { slug: 'mars' },
    include: { game: { select: { shortName: true } } },
  });
  if (!map || map.game?.shortName !== 'BO7') {
    console.log('Mars (BO7) map not found. Nothing to do.');
    return;
  }
  const updated = await prisma.challenge.updateMany({
    where: { mapId: map.id, type: 'STARTING_ROOM', isActive: true },
    data: { isActive: false },
  });
  console.log(
    updated.count > 0
      ? `Deactivated ${updated.count} STARTING_ROOM challenge(s) for Mars. First Room is no longer loggable or on leaderboards for this map.`
      : 'Mars had no active STARTING_ROOM challenge. Nothing changed.'
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
