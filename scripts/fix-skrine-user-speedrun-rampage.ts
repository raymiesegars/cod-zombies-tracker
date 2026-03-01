#!/usr/bin/env npx tsx
/**
 * Fix Skrine user: set all speedrun ChallengeLogs to "with rampage" (rampageInducerUsed = true).
 * Run this for user cmlvocpbj0006ar6ml9vz7hsm after fixing the import script so future imports
 * default speedruns to with rampage. This corrects logs that were already imported as without rampage.
 *
 * Usage: npx tsx scripts/fix-skrine-user-speedrun-rampage.ts [--dry-run]
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

const TARGET_USER_ID = 'cmlvocpbj0006ar6ml9vz7hsm';

const SPEEDRUN_CHALLENGE_TYPES = [
  'ROUND_5_SPEEDRUN',
  'ROUND_10_SPEEDRUN',
  'ROUND_15_SPEEDRUN',
  'ROUND_20_SPEEDRUN',
  'ROUND_30_SPEEDRUN',
  'ROUND_50_SPEEDRUN',
  'ROUND_70_SPEEDRUN',
  'ROUND_100_SPEEDRUN',
  'ROUND_200_SPEEDRUN',
  'ROUND_255_SPEEDRUN',
  'ROUND_935_SPEEDRUN',
  'ROUND_999_SPEEDRUN',
  'EXFIL_SPEEDRUN',
  'EXFIL_R5_SPEEDRUN',
  'EXFIL_R10_SPEEDRUN',
  'EXFIL_R20_SPEEDRUN',
  'EXFIL_R21_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN',
  'INSTAKILL_ROUND_SPEEDRUN',
  'SUPER_30_SPEEDRUN',
  'BUILD_EE_SPEEDRUN',
] as const;

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('*** DRY RUN – no updates ***\n');

  const logs = await prisma.challengeLog.findMany({
    where: {
      userId: TARGET_USER_ID,
      rampageInducerUsed: { not: true },
      challenge: { type: { in: [...SPEEDRUN_CHALLENGE_TYPES] } },
    },
    select: { id: true, challenge: { select: { type: true } }, map: { select: { name: true, slug: true } } },
  });

  console.log(`User ${TARGET_USER_ID}: found ${logs.length} speedrun log(s) with rampage not true.`);
  if (logs.length === 0) {
    await prisma.$disconnect();
    return;
  }

  if (!dryRun) {
    const result = await prisma.challengeLog.updateMany({
      where: {
        userId: TARGET_USER_ID,
        rampageInducerUsed: { not: true },
        challenge: { type: { in: [...SPEEDRUN_CHALLENGE_TYPES] } },
      },
      data: { rampageInducerUsed: true },
    });
    console.log(`Updated ${result.count} log(s) to with rampage.`);
  } else {
    for (const log of logs) {
      console.log(`  Would update: ${log.map?.name ?? log.map?.slug} – ${log.challenge.type} (id: ${log.id})`);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
