#!/usr/bin/env npx tsx
/**
 * Revalidate only users/maps impacted by Any% EE speedrun logs.
 *
 * Scope:
 * - ChallengeLog.challenge.type = EASTER_EGG_SPEEDRUN
 * - Any of these fields == 'ANY_PERCENT':
 *   bo3GobbleGumMode, bo4ElixirMode, bo6GobbleGumMode, bo7GobbleGumMode
 *
 * For each impacted user, runs:
 * - pnpm db:reunlock-achievements
 * - pnpm db:recompute-verified-xp
 * scoped by BACKFILL_USER_ID + BACKFILL_MAP_SLUGS (only impacted maps).
 *
 * Usage:
 *   npx tsx scripts/revalidate-any-percent-ee-impacted.ts --dry-run
 *   npx tsx scripts/revalidate-any-percent-ee-impacted.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import prisma from '../src/lib/prisma';

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

const dryRun = process.argv.includes('--dry-run');

async function main() {
  const impactedLogs = await prisma.challengeLog.findMany({
    where: {
      challenge: { type: 'EASTER_EGG_SPEEDRUN' },
      OR: [
        { bo3GobbleGumMode: 'ANY_PERCENT' },
        { bo4ElixirMode: 'ANY_PERCENT' },
        { bo6GobbleGumMode: 'ANY_PERCENT' },
        { bo7GobbleGumMode: 'ANY_PERCENT' },
      ],
    },
    select: {
      userId: true,
      map: { select: { slug: true } },
    },
  });

  const byUser = new Map<string, Set<string>>();
  for (const log of impactedLogs) {
    const slug = log.map?.slug;
    if (!slug) continue;
    if (!byUser.has(log.userId)) byUser.set(log.userId, new Set<string>());
    byUser.get(log.userId)!.add(slug);
  }

  console.log('Impacted logs:', impactedLogs.length);
  console.log('Impacted users:', byUser.size);
  console.log('Mode:', dryRun ? 'DRY RUN' : 'LIVE');

  let processed = 0;
  for (const [userId, slugs] of byUser.entries()) {
    processed++;
    const slugCsv = Array.from(slugs).join(',');
    console.log(`[${processed}/${byUser.size}] user=${userId.slice(0, 10)}... maps=${slugs.size}`);
    if (dryRun) continue;

    const env = {
      ...process.env,
      BACKFILL_USER_ID: userId,
      BACKFILL_MAP_SLUGS: slugCsv,
    };
    execSync('pnpm db:reunlock-achievements', { cwd: root, stdio: 'inherit', env });
    execSync('pnpm db:recompute-verified-xp', { cwd: root, stdio: 'inherit', env });
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

