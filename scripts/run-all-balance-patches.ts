/**
 * Run all game-specific balance patches in sequence.
 *
 * Each balance patch uses getMapAchievementDefinitions + getSpeedrunAchievementDefinitions
 * to determine the canonical set of achievements, then:
 * - Creates missing achievements
 * - Updates XP for existing ones
 * - Deactivates achievements not in defs (obsolete bands, duplicates)
 * - Never touches EASTER_EGG_COMPLETE
 *
 * This cleans up duplicates/extras while preserving harder versions (classics, fate only,
 * no support, etc.) because the defs include them with correct slugs.
 *
 * Games covered: WAW, BO1, BO2, BO3, BO4, BOCW, BO6, BO7
 * Games without balance patches: IW, WW2, Vanguard, AW (run db:sync-achievements for those)
 *
 * Usage:
 *   pnpm exec tsx scripts/run-all-balance-patches.ts           # Apply
 *   pnpm exec tsx scripts/run-all-balance-patches.ts --dry-run # Preview
 */

import { spawnSync } from 'child_process';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const EXTRA = DRY_RUN ? ['--dry-run'] : [];

const PATCHES = [
  'scripts/waw-balance-patch.ts',
  'scripts/bo1-balance-patch.ts',
  'scripts/bo2-balance-patch.ts',
  'scripts/bo3-balance-patch.ts',
  'scripts/bo4-balance-patch.ts',
  'scripts/bocw-balance-patch.ts',
  'scripts/bo6-balance-patch.ts',
  'scripts/bo7-balance-patch.ts',
];

const root = path.resolve(__dirname, '..');

function main() {
  if (DRY_RUN) {
    console.log('*** DRY RUN – balance patches will not write changes ***\n');
  }

  for (const script of PATCHES) {
    const name = path.basename(script, '.ts').replace(/-balance-patch$/, '').toUpperCase();
    console.log(`\n========== ${name} ==========`);
    const result = spawnSync('pnpm', ['exec', 'tsx', script, ...EXTRA], {
      cwd: root,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      console.error(`\n${name} balance patch failed with exit code ${result.status}`);
      process.exit(result.status ?? 1);
    }
  }

  console.log('\n========== Done ==========');
  if (DRY_RUN) {
    console.log('Run without --dry-run to apply.');
  } else {
    console.log('All balance patches applied. Consider: pnpm db:recompute-verified-xp');
  }
}

main();
