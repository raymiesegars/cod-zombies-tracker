/**
 * Revalidate Speedrun Achievements
 *
 * After fixing speedrun tier times (short-run buffers, VG void split, Terra exfil, etc.):
 * 1. Add BO7 R15 challenges if missing
 * 2. Deactivate ROUND_30_SPEEDRUN for Der Anfang and Terra Maledicta
 * 3. Sync achievement definitions
 * 4. Re-unlock achievements for all maps
 * 5. Recompute verified XP
 *
 * Usage:
 *   pnpm db:revalidate-speedrun-achievements
 *   pnpm db:revalidate-speedrun-achievements --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

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

import prisma from '../src/lib/prisma';

const rootDir = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');

function run(bin: string, args: string[], env: Record<string, string> = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, {
      stdio: 'inherit',
      cwd: rootDir,
      env: { ...process.env, ...env },
    });
    proc.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${bin} ${args.join(' ')} exited ${code}`))
    );
  });
}

async function main() {
  console.log('1. Adding BO7 R15 challenges if missing...\n');
  const addArgs = DRY_RUN ? ['--dry-run'] : [];
  await run('pnpm', ['exec', 'tsx', 'scripts/add-round-5-15-speedrun.ts', ...addArgs]);

  console.log('\n2. Deactivating ROUND_30_SPEEDRUN for Der Anfang and Terra Maledicta...\n');
  const vgMaps = await prisma.map.findMany({
    where: {
      slug: { in: ['der-anfang', 'terra-maledicta'] },
      game: { shortName: 'VANGUARD' },
    },
    select: { id: true, slug: true },
  });
  for (const map of vgMaps) {
    const updated = await prisma.challenge.updateMany({
      where: { mapId: map.id, type: 'ROUND_30_SPEEDRUN' },
      data: { isActive: false },
    });
    if (updated.count > 0) console.log(`  Deactivated ROUND_30_SPEEDRUN for ${map.slug}`);
  }

  console.log('\n3. Syncing achievement definitions...\n');
  await run('pnpm', ['db:sync-achievements']);

  console.log('\n4. Re-unlocking achievements...\n');
  const reunlockArgs = DRY_RUN ? ['--dry-run'] : [];
  await run('pnpm', ['db:reunlock-achievements', ...reunlockArgs]);

  console.log('\n5. Recomputing verified XP...\n');
  const recomputeArgs = DRY_RUN ? ['--dry-run'] : [];
  await run('pnpm', ['db:recompute-verified-xp', ...recomputeArgs]);

  console.log('\nDone.');
}

main()
  .finally(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
