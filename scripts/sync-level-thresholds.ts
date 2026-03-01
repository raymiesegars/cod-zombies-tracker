/**
 * Sync LevelThreshold table from RANKS in src/lib/ranks.ts.
 * Use this to update rank/level data (e.g. after changing to 1–100) without running a full seed.
 *
 * Usage: pnpm exec tsx scripts/sync-level-thresholds.ts
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
import { RANKS, getRankIconPath } from '../src/lib/ranks';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  for (const rank of RANKS) {
    await prisma.levelThreshold.upsert({
      where: { level: rank.level },
      create: {
        level: rank.level,
        xpRequired: rank.xpRequired,
        rankName: rank.name,
        rankBadgeUrl: getRankIconPath(rank.icon),
      },
      update: {
        xpRequired: rank.xpRequired,
        rankName: rank.name,
        rankBadgeUrl: getRankIconPath(rank.icon),
      },
    });
  }
  console.log(`Synced ${RANKS.length} level thresholds (ranks 1–${RANKS.length}).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
