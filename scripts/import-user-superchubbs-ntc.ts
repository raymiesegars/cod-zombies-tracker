#!/usr/bin/env npx tsx
/**
 * Full transfer for SuperChubbs_NTC: import CSV → reunlock achievements → recompute verified XP.
 * Safe: only affects the single CZT user cmm9llf5a0006aaf6wopuumqg.
 *
 * CSV: top-178-csv/SuperChubbs_NTC.csv (source player = SuperChubbs_NTC)
 * CZT user ID: cmm9llf5a0006aaf6wopuumqg
 *
 * Usage:
 *   pnpm db:import-user-superchubbs-ntc              # Run all 3 steps
 *   pnpm exec tsx scripts/import-user-superchubbs-ntc.ts --dry-run   # Import dry-run only (no DB writes)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const root = path.resolve(__dirname, '..');

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

const CZT_USER_ID = 'cmm9llf5a0006aaf6wopuumqg';
const SOURCE_PLAYER_ID = 'SuperChubbs_NTC';
const CSV_PATH = path.join(root, 'top-178-csv', 'SuperChubbs_NTC.csv');

const dryRun = process.argv.includes('--dry-run');

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found:', CSV_PATH);
    process.exit(1);
  }

  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL or DATABASE_URL in .env.local');
    process.exit(1);
  }

  console.log('--- SuperChubbs_NTC full transfer ---');
  console.log('CZT user:', CZT_USER_ID);
  console.log('CSV:', CSV_PATH);
  console.log('Source player (in CSV):', SOURCE_PLAYER_ID);
  if (dryRun) {
    console.log('\n*** DRY RUN: only step 1 will run with --dry-run (no DB writes) ***\n');
  }

  console.log('\n[1/3] Importing from CSV...');
  execSync(
    `pnpm exec tsx scripts/import-skrine-csv/run.ts --csv="${CSV_PATH}" --source-player-id=${SOURCE_PLAYER_ID} --czt-user=${CZT_USER_ID} --skip-existing${dryRun ? ' --dry-run' : ''}`,
    { stdio: 'inherit', cwd: root, env: process.env }
  );

  if (dryRun) {
    console.log('\nDry run: skipping reunlock and recompute-verified-xp.');
    return;
  }

  console.log('\n[2/3] Re-unlocking achievements for this user...');
  execSync('pnpm db:reunlock-achievements', {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, BACKFILL_USER_ID: CZT_USER_ID },
  });

  console.log('\n[3/3] Recomputing verified XP for this user...');
  execSync('pnpm db:recompute-verified-xp', {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, BACKFILL_USER_ID: CZT_USER_ID },
  });

  console.log('\n--- Done. SuperChubbs_NTC transfer complete. ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
