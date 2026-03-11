/**
 * Reactivate achievements that were wrongly pruned by db:sync-achievements.
 *
 * The sync-achievements prune logic deactivates any achievement not in the
 * current definitions. Due to slug collisions (base + restricted tiers sharing
 * the same slug for non-BO4 games), ~2080 achievements were incorrectly pruned
 * — including CW rampage splits, BO3 megas splits, IW splits, BO4 splits, etc.
 *
 * This script reactivates ALL deactivated achievements to restore the site.
 *
 * Usage:
 *   pnpm exec tsx scripts/reactivate-pruned-achievements.ts           # Apply
 *   pnpm exec tsx scripts/reactivate-pruned-achievements.ts --dry-run  # Preview only
 */

import * as fs from 'fs';
import * as path from 'path';

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

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  const toReactivate = await prisma.achievement.findMany({
    where: { isActive: false },
    include: {
      map: { select: { name: true, slug: true, game: { select: { shortName: true } } } },
    },
    orderBy: [{ mapId: 'asc' }, { slug: 'asc' }],
  });

  console.log(`Found ${toReactivate.length} deactivated achievements to re-activate.`);

  if (toReactivate.length === 0) {
    console.log('Nothing to do.');
    await prisma.$disconnect();
    return;
  }

  const byGame = toReactivate.reduce<Record<string, number>>((acc, a) => {
    const g = a.map?.game?.shortName ?? 'unknown';
    acc[g] = (acc[g] ?? 0) + 1;
    return acc;
  }, {});
  console.log('By game:', byGame);
  if (toReactivate.length <= 20) {
    for (const a of toReactivate) {
      console.log(`  - ${a.map?.game?.shortName} / ${a.map?.name}: ${a.slug} (${a.difficulty ?? 'n/a'})`);
    }
  }

  if (!DRY_RUN) {
    const result = await prisma.achievement.updateMany({
      where: { isActive: false },
      data: { isActive: true },
    });
    console.log(`\nRe-activated ${result.count} achievements.`);
  } else {
    console.log('\n*** Dry run complete. Run without --dry-run to apply. ***');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
