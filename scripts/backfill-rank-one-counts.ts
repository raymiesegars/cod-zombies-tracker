/**
 * Backfill persisted Rank #1 counts for fast leaderboards.
 *
 * Usage:
 *   pnpm db:backfill-rank-ones
 *   pnpm db:backfill-rank-ones --include-games --include-maps
 */

import prisma from '@/lib/prisma';
import { refreshStoredRankOneCountsForScope } from '@/lib/world-records';

async function main() {
  const includeGames = process.argv.includes('--include-games');
  const includeMaps = process.argv.includes('--include-maps');

  console.log('Backfilling rank-one counts...');
  console.log(`- global: yes`);
  console.log(`- game scopes: ${includeGames ? 'yes' : 'no'}`);
  console.log(`- map scopes: ${includeMaps ? 'yes' : 'no'}`);

  const global = await refreshStoredRankOneCountsForScope();
  console.log(`Global scope rows: ${global.size}`);

  if (includeGames) {
    const games = await prisma.game.findMany({
      select: { id: true, shortName: true },
      orderBy: { shortName: 'asc' },
    });
    for (const g of games) {
      const counts = await refreshStoredRankOneCountsForScope({ gameId: g.id });
      console.log(`Game ${g.shortName}: ${counts.size} rows`);
    }
  }

  if (includeMaps) {
    const maps = await prisma.map.findMany({
      select: { id: true, slug: true, game: { select: { shortName: true } } },
      orderBy: [{ game: { shortName: 'asc' } }, { slug: 'asc' }],
    });
    let i = 0;
    for (const m of maps) {
      i += 1;
      const counts = await refreshStoredRankOneCountsForScope({ mapId: m.id });
      console.log(`Map ${i}/${maps.length} ${m.game.shortName}/${m.slug}: ${counts.size} rows`);
    }
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error('backfill-rank-one-counts failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

