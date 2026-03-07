#!/usr/bin/env npx tsx
/**
 * Revalidate verified XP and achievements for users with WW2 map logs.
 * Run after importing or fixing WW2 runs (e.g. Groesten Haus, No Blitz, No Armor).
 *
 * Usage: pnpm db:revalidate-ww2-users [--dry-run]
 */

import { execSync } from 'child_process';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

function main() {
  console.log('Revalidating WW2 users: reunlock achievements + recompute verified XP\n');
  if (dryRun) console.log('*** DRY RUN ***\n');

  const env = { ...process.env, BACKFILL_GAMES: 'WW2' };

  console.log('[1/2] Reunlock achievements (WW2 maps only)...');
  execSync(`pnpm db:reunlock-achievements${dryRun ? ' --dry-run' : ''}`, {
    stdio: 'inherit',
    cwd: root,
    env,
  });

  console.log('\n[2/2] Recompute verified XP (WW2 maps only)...');
  execSync(`pnpm db:recompute-verified-xp${dryRun ? ' --dry-run' : ''}`, {
    stdio: 'inherit',
    cwd: root,
    env,
  });

  console.log('\nWW2 revalidation complete.');
}

main();
