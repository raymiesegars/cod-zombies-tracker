/**
 * Deploy first room consolidation + game order migration.
 *
 * 1. Run Prisma migration (adds firstRoomVariant, updates game order, AW maps isDlc)
 * 2. Run data migration (create STARTING_ROOM challenges, migrate logs, migrate achievements)
 *
 * Run: pnpm run db:deploy-first-room
 */

import { execSync } from 'child_process';
import * as path from 'path';

const root = path.resolve(__dirname, '..');

console.log('Deploying first room + game order migration...\n');

// 1. Prisma migrate deploy
console.log('Step 1: Running Prisma migration...');
execSync('node scripts/run-prisma-with-env.js migrate deploy', {
  cwd: root,
  stdio: 'inherit',
});

// 2. Data migration
console.log('\nStep 2: Running first room data migration...');
execSync('tsx scripts/run-first-room-migration.ts', {
  cwd: root,
  stdio: 'inherit',
});

console.log('\nDone.');
