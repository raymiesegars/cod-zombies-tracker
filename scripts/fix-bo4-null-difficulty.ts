#!/usr/bin/env npx tsx
/**
 * Set all BO4 ChallengeLog and EasterEggLog with null difficulty to NORMAL.
 * BO4 runs must have a difficulty for achievements/leaderboards; legacy and
 * import runs that have null are treated as NORMAL site-wide.
 *
 * Usage: npx tsx scripts/fix-bo4-null-difficulty.ts [--dry-run]
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
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('*** DRY RUN – no updates ***\n');

  const bo4Game = await prisma.game.findFirst({
    where: { shortName: 'BO4' },
    select: { id: true },
  });
  if (!bo4Game) {
    console.log('BO4 game not found.');
    await prisma.$disconnect();
    return;
  }

  const bo4MapIds = await prisma.map.findMany({
    where: { gameId: bo4Game.id },
    select: { id: true },
  }).then((maps) => maps.map((m) => m.id));

  if (bo4MapIds.length === 0) {
    console.log('No BO4 maps found.');
    await prisma.$disconnect();
    return;
  }

  const challengeCount = await prisma.challengeLog.count({
    where: {
      mapId: { in: bo4MapIds },
      difficulty: null,
    },
  });

  const eeCount = await prisma.easterEggLog.count({
    where: {
      mapId: { in: bo4MapIds },
      difficulty: null,
    },
  });

  console.log(`BO4 ChallengeLogs with null difficulty: ${challengeCount}`);
  console.log(`BO4 EasterEggLogs with null difficulty: ${eeCount}`);

  if (challengeCount === 0 && eeCount === 0) {
    console.log('Nothing to update.');
    await prisma.$disconnect();
    return;
  }

  if (!dryRun) {
    const challengeResult = await prisma.challengeLog.updateMany({
      where: {
        mapId: { in: bo4MapIds },
        difficulty: null,
      },
      data: { difficulty: 'NORMAL' },
    });
    const eeResult = await prisma.easterEggLog.updateMany({
      where: {
        mapId: { in: bo4MapIds },
        difficulty: null,
      },
      data: { difficulty: 'NORMAL' },
    });
    console.log(`\nUpdated ${challengeResult.count} ChallengeLog(s) to difficulty NORMAL.`);
    console.log(`Updated ${eeResult.count} EasterEggLog(s) to difficulty NORMAL.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
