/**
 * Lists ROUND_30_SPEEDRUN (and optionally other) achievements for a map.
 * Usage: pnpm exec tsx scripts/list-map-speedrun-achievements.ts [mapSlug]
 * Example: pnpm exec tsx scripts/list-map-speedrun-achievements.ts revelations
 */
import prisma from '../src/lib/prisma';
import { isRestrictedAchievement } from '../src/lib/achievements/categories';

async function main() {
  const mapSlug = process.argv[2] ?? 'revelations';

  const map = await prisma.map.findUnique({
    where: { slug: mapSlug },
    select: { id: true, name: true, slug: true, game: { select: { shortName: true } } },
  });
  if (!map) {
    console.error(`Map not found: ${mapSlug}`);
    process.exit(1);
  }

  const achievements = await prisma.achievement.findMany({
    where: {
      mapId: map.id,
      type: 'CHALLENGE_COMPLETE',
      criteria: { path: ['challengeType'], equals: 'ROUND_30_SPEEDRUN' },
    },
    orderBy: [{ slug: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      isActive: true,
      criteria: true,
      xpReward: true,
    },
  });

  console.log(`\n${map.game?.shortName ?? '?'} / ${map.name} (${map.slug}) – ROUND_30_SPEEDRUN\n`);
  console.log(`Total: ${achievements.length} (active: ${achievements.filter((a) => a.isActive).length})\n`);

  const base = achievements.filter((a) => !isRestrictedAchievement({ criteria: a.criteria as Record<string, unknown> }));
  const restricted = achievements.filter((a) => isRestrictedAchievement({ criteria: a.criteria as Record<string, unknown> }));

  console.log('--- Base (megas / all gums) ---');
  for (const a of base) {
    console.log(`  ${a.isActive ? '✓' : '✗'} ${a.slug}  ${a.name}  +${a.xpReward} XP`);
  }
  console.log('\n--- Classic / restricted ---');
  for (const a of restricted) {
    console.log(`  ${a.isActive ? '✓' : '✗'} ${a.slug}  ${a.name}  +${a.xpReward} XP`);
  }
  console.log('');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
