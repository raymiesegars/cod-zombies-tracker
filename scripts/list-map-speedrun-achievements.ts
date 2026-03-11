/**
 * Lists speedrun achievements for a map. Shows whether each row has restricted criteria (so UI can show "No Rampage" etc.).
 * Usage: pnpm exec tsx scripts/list-map-speedrun-achievements.ts [mapSlug] [challengeType]
 * Example: pnpm exec tsx scripts/list-map-speedrun-achievements.ts revelations
 * Example: pnpm exec tsx scripts/list-map-speedrun-achievements.ts firebase-z ROUND_5_SPEEDRUN
 */
import prisma from '../src/lib/prisma';
import { isRestrictedAchievement } from '../src/lib/achievements/categories';

const SPEEDRUN_TYPES = [
  'ROUND_5_SPEEDRUN',
  'ROUND_15_SPEEDRUN',
  'ROUND_30_SPEEDRUN',
  'ROUND_50_SPEEDRUN',
  'ROUND_70_SPEEDRUN',
  'ROUND_100_SPEEDRUN',
  'ROUND_200_SPEEDRUN',
] as const;

async function main() {
  const mapSlug = process.argv[2] ?? 'revelations';
  const challengeType = process.argv[3] ?? 'ROUND_30_SPEEDRUN';

  const map = await prisma.map.findUnique({
    where: { slug: mapSlug },
    select: { id: true, name: true, slug: true, game: { select: { shortName: true } } },
  });
  if (!map) {
    console.error(`Map not found: ${mapSlug}`);
    process.exit(1);
  }

  const validType = SPEEDRUN_TYPES.includes(challengeType as (typeof SPEEDRUN_TYPES)[number])
    ? challengeType
    : 'ROUND_30_SPEEDRUN';

  const achievements = await prisma.achievement.findMany({
    where: {
      mapId: map.id,
      type: 'CHALLENGE_COMPLETE',
      criteria: { path: ['challengeType'], equals: validType },
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

  const c = (crit: unknown) => (crit as Record<string, unknown>) || {};
  console.log(`\n${map.game?.shortName ?? '?'} / ${map.name} (${map.slug}) – ${validType}\n`);
  console.log(`Total: ${achievements.length} (active: ${achievements.filter((a) => a.isActive).length})\n`);

  const base = achievements.filter((a) => !isRestrictedAchievement({ criteria: a.criteria as Record<string, unknown> }));
  const restricted = achievements.filter((a) => isRestrictedAchievement({ criteria: a.criteria as Record<string, unknown> }));

  console.log('--- Base (megas / all gums) ---');
  for (const a of base) {
    const mod = c(a.criteria).rampageInducerUsed ?? c(a.criteria).bo3GobbleGumMode ?? '';
    console.log(`  ${a.isActive ? '✓' : '✗'} ${a.slug}  ${a.name}  +${a.xpReward} XP  ${mod ? `criteria: ${JSON.stringify(mod)}` : ''}`);
  }
  console.log('\n--- Classic / No Rampage / restricted ---');
  for (const a of restricted) {
    const mod = c(a.criteria).rampageInducerUsed ?? c(a.criteria).bo3GobbleGumMode ?? c(a.criteria).bo6GobbleGumMode ?? '';
    console.log(`  ${a.isActive ? '✓' : '✗'} ${a.slug}  ${a.name}  +${a.xpReward} XP  ${mod !== '' ? `criteria: ${JSON.stringify(mod)}` : ''}`);
  }
  if (restricted.length === 0 && (map.game?.shortName === 'BOCW' || map.game?.shortName === 'BO3' || map.game?.shortName === 'BO6' || map.game?.shortName === 'BO7')) {
    console.log('  (none – restricted tiers may be missing or have wrong criteria in DB; re-run sync to fix)');
  }
  console.log('');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
