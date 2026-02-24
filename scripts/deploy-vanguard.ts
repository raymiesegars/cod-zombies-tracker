/**
 * Safe deployment for Vanguard Zombies.
 * Single script: migrate deploy + add-vanguard content.
 *
 * DEFAULT: Targets LOCAL/DEV database (.env + .env.local) — same as pnpm dev.
 * Use --production to target production (.env.production).
 *
 * GUARANTEES:
 * - NO truncation, NO deletion, NO modification of existing user data
 * - Only ADDS: game, maps, challenges, Easter eggs, achievements
 * - Skips any record that already exists
 *
 * Run: pnpm run db:deploy-vanguard              # Local/dev DB (default)
 * Run: pnpm run db:deploy-vanguard -- --production   # Production DB
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

const root = path.resolve(__dirname, '..');
const useProduction = process.argv.includes('--production');

// Default: local (.env + .env.local). Use --production to add .env.production
const envFiles = useProduction ? ['.env', '.env.local', '.env.production'] : ['.env', '.env.local'];
for (const file of envFiles) {
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

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Missing DIRECT_URL/DATABASE_URL. Set in .env, .env.local, or .env.production');
  process.exit(1);
}

try {
  const u = new URL(dbUrl.replace(/^postgresql:/, 'postgres:'));
  console.log('Target DB:', u.hostname, useProduction ? '(production)' : '(local/dev — same as pnpm dev)');
} catch {
  // ignore
}
console.log('=== Vanguard Zombies Deployment (safe, additive only) ===\n');

// Step 1: Prisma generate (ensure client matches schema)
console.log('Step 1: Running prisma generate...');
const genResult = spawnSync('npx', ['prisma', 'generate'], {
  stdio: 'inherit',
  env: process.env,
  cwd: root,
});
if (genResult.status !== 0) {
  console.error('Prisma generate failed.');
  process.exit(1);
}

// Step 2: Migrate deploy (applies pending migrations; Vanguard migrations use IF NOT EXISTS)
console.log('\nStep 2: Running prisma migrate deploy...');
const migrateResult = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: process.env,
  cwd: root,
});
if (migrateResult.status !== 0) {
  console.error('Migration failed.');
  process.exit(1);
}

// Step 3: Add Vanguard content (creates only; skips existing)
console.log('\nStep 3: Adding Vanguard content (game, maps, challenges, easter eggs, achievements)...');
const addEnv = { ...process.env, ...(useProduction ? { DEPLOY_VANGUARD_PRODUCTION: '1' } : {}) };
const addResult = spawnSync('pnpm', ['run', 'db:add-vanguard'], {
  stdio: 'inherit',
  env: addEnv,
  cwd: root,
});
if (addResult.status !== 0) {
  console.error('Add Vanguard content failed.');
  process.exit(1);
}

console.log('\n=== Vanguard deployment complete. ===');
