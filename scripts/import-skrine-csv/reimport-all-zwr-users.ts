#!/usr/bin/env npx tsx
/**
 * Re-import all ZWR→CZT users with current rules (BO7 support, BO6/BO7 no-rampage default),
 * then backfill BO6/BO7 rampage where CSV doesn't say anything, then reunlock achievements
 * and recompute verified XP for everyone.
 *
 * For each user in ZWR_TO_CZT_USERS that has a CSV in top-178-csv:
 *   1. Run import with --skip-existing (adds BO7 rows, uses new defaults for any new rows).
 *   2. Run reunlock-achievements and recompute-verified-xp for that user.
 * Then:
 *   3. Run backfill-bo6-bo7-rampage-from-csv (sets rampageInducerUsed = false where CSV
 *      doesn't mention rampage; that script runs reunlock/recompute for affected users).
 *
 * Usage: npx tsx scripts/import-skrine-csv/reimport-all-zwr-users.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const root = path.resolve(__dirname, '../..');

function loadEnv() {
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
}

loadEnv();

import { ZWR_TO_CZT_USERS } from './zwr-to-czt-users';

const TOP_178_DIR = path.join(root, 'top-178-csv');
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL or DATABASE_URL in .env.local');
    process.exit(1);
  }

  const entries = Object.entries(ZWR_TO_CZT_USERS);
  const usersWithCsv: { sourcePlayerId: string; cztUserId: string; csvPath: string }[] = [];

  for (const [sourcePlayerId, entry] of entries) {
    let csvPath = path.join(TOP_178_DIR, `${sourcePlayerId}.csv`);
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(TOP_178_DIR, `${entry.displayName}.csv`);
    }
    if (fs.existsSync(csvPath)) {
      usersWithCsv.push({ sourcePlayerId, cztUserId: entry.cztUserId, csvPath });
    } else {
      console.log(`Skip ${sourcePlayerId}: no CSV at ${csvPath}`);
    }
  }

  console.log(`\n--- Re-import all ZWR users (${usersWithCsv.length} with CSV) ---\n`);
  if (dryRun) console.log('*** DRY RUN ***\n');

  for (const { sourcePlayerId, cztUserId, csvPath } of usersWithCsv) {
    console.log(`\n--- ${sourcePlayerId} (${cztUserId}) ---`);
    console.log('[1/3] Import from CSV (--skip-existing)...');
    execSync(
      `pnpm exec tsx scripts/import-skrine-csv/run.ts --csv="${csvPath}" --source-player-id=${sourcePlayerId} --czt-user=${cztUserId} --skip-existing${dryRun ? ' --dry-run' : ''}`,
      { stdio: 'inherit', cwd: root, env: process.env }
    );
    if (dryRun) {
      console.log('[2/3] [DRY] Skip reunlock/recompute for this user.');
      continue;
    }
    console.log('[2/3] Reunlock achievements...');
    execSync('pnpm db:reunlock-achievements', {
      stdio: 'inherit',
      cwd: root,
      env: { ...process.env, BACKFILL_USER_ID: cztUserId },
    });
    console.log('[3/3] Recompute verified XP...');
    execSync('pnpm db:recompute-verified-xp', {
      stdio: 'inherit',
      cwd: root,
      env: { ...process.env, BACKFILL_USER_ID: cztUserId },
    });
  }

  if (dryRun) {
    console.log('\n[DRY] Skipping backfill-bo6-bo7-rampage-from-csv.');
    console.log('Done (dry run).');
    return;
  }

  console.log('\n--- Backfill BO6/BO7 rampage (no ramp when CSV does not say) ---\n');
  execSync('pnpm exec tsx scripts/import-skrine-csv/backfill-bo6-bo7-rampage-from-csv.ts', {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
  });

  console.log('\n--- Re-import all ZWR users complete. ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
