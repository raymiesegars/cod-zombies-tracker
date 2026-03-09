/**
 * Revalidate BO4 Speedrun Achievements
 *
 * After fixing BO4 speedrun WR times (per difficulty: Normal/Hardcore/Realistic)
 * with correct 5% rule tiers, run this to:
 * 1. Sync achievement definitions (new times, per-difficulty)
 * 2. Re-unlock achievements for BO4 maps (re-evaluate users against new definitions)
 * 3. Recompute verified XP for affected users
 *
 * Usage:
 *   pnpm db:revalidate-bo4-speedruns           # Run all steps
 *   pnpm db:revalidate-bo4-speedruns --dry-run # Pass --dry-run to reunlock and recompute (sync still runs)
 */

import { spawn } from 'child_process';

const root = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');

function run(bin: string, args: string[], env: Record<string, string> = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, {
      stdio: 'inherit',
      cwd: root,
      env: { ...process.env, ...env },
    });
    proc.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${bin} ${args.join(' ')} exited ${code}`))
    );
  });
}

async function main() {
  console.log('1. Syncing BO4 achievement definitions...\n');
  await run('pnpm', ['db:sync-achievements'], { GAMES: 'BO4' });

  console.log('\n2. Re-unlocking achievements for BO4 maps...\n');
  const reunlockArgs = DRY_RUN ? ['--dry-run'] : [];
  await run('pnpm', ['db:reunlock-achievements', ...reunlockArgs], { BACKFILL_GAMES: 'BO4' });

  console.log('\n3. Recomputing verified XP for affected users...\n');
  const recomputeArgs = DRY_RUN ? ['--dry-run'] : [];
  await run('pnpm', ['db:recompute-verified-xp', ...recomputeArgs], { BACKFILL_GAMES: 'BO4' });

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
