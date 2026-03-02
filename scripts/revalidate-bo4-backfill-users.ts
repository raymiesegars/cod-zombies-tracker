#!/usr/bin/env npx tsx
/**
 * Revalidate achievements and verified XP for users who had BO4 difficulty
 * updated by db:backfill-bo4-difficulty-from-csv (Bradley0104, Gardningtools, THAT GUY).
 *
 * Runs reunlock-achievements and recompute-verified-xp for each of those users only.
 *
 * Usage: pnpm db:revalidate-bo4-backfill-users [--dry-run]
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

/** CZT user IDs that had BO4 difficulty updated by backfill-bo4-difficulty-from-csv */
const BO4_BACKFILL_USER_IDS: { id: string; name: string }[] = [
  { id: 'cmlqtmbgx00059uzbkloqjiyi', name: 'Bradley0104' },
  { id: 'cmlvf1ikw000097igho2zsb3d', name: 'Gardningtools' },
  { id: 'cmlqtjqng000cu994seq1kii3', name: 'THAT GUY' },
];

function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('*** DRY RUN – no reunlock/recompute ***\n');
  }

  for (const { id, name } of BO4_BACKFILL_USER_IDS) {
    console.log(`\n--- ${name} (${id}) ---`);
    if (dryRun) {
      console.log(`  Would run: BACKFILL_USER_ID=${id} pnpm db:reunlock-achievements`);
      console.log(`  Would run: BACKFILL_USER_ID=${id} pnpm db:recompute-verified-xp`);
      continue;
    }
    console.log('Reunlock achievements...');
    execSync('pnpm db:reunlock-achievements', {
      stdio: 'inherit',
      cwd: root,
      env: { ...process.env, BACKFILL_USER_ID: id },
    });
    console.log('Recompute verified XP...');
    execSync('pnpm db:recompute-verified-xp', {
      stdio: 'inherit',
      cwd: root,
      env: { ...process.env, BACKFILL_USER_ID: id },
    });
  }

  console.log('\n--- Done. Revalidated achievements and verified XP for BO4 backfill users. ---');
}

main();
