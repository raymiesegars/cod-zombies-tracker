// Easter Eggs only. Run: pnpm run db:seed:easter-eggs. Truncates EE-related tables, re-creates Main Quest placeholders + all specific EEs. Data from seed-easter-eggs-base.ts (through BO7).

import { PrismaClient } from '@prisma/client';
import { MAIN_QUEST_MAP_SLUGS } from './main-quest-map-slugs';
import { SPECIFIC_EASTER_EGGS_BASE } from './seed-easter-eggs-base';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

const SPECIFIC_EASTER_EGGS = SPECIFIC_EASTER_EGGS_BASE;


async function main() {
  console.log('Seeding Easter Eggs only...');

  // TRUNCATE EasterEgg CASCADE would wipe Achievement and UserAchievement (they reference EasterEgg).
  // Break the FK chain: null out easterEggId, drop FK, truncate, re-add FK.
  await prisma.achievement.updateMany({
    where: { easterEggId: { not: null } },
    data: { easterEggId: null },
  });

  await prisma.$executeRaw`ALTER TABLE "Achievement" DROP CONSTRAINT IF EXISTS "Achievement_easterEggId_fkey"`;

  await prisma.$executeRaw`TRUNCATE TABLE "UserEasterEggStepProgress" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "MainEasterEggXpAwarded" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "EasterEggLog" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "EasterEggStep" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "EasterEgg" CASCADE`;

  await prisma.$executeRaw`ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_easterEggId_fkey" FOREIGN KEY ("easterEggId") REFERENCES "EasterEgg"("id") ON DELETE SET NULL ON UPDATE CASCADE`;

  // Ensure optional EasterEgg columns exist (in case migrations haven't been applied)
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "EasterEgg" ADD COLUMN IF NOT EXISTS "variantTag" TEXT'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "EasterEgg" ADD COLUMN IF NOT EXISTS "categoryTag" TEXT'
    );
  } catch (e) {
    console.warn('Could not ensure EasterEgg columns (variantTag/categoryTag):', e);
  }

  console.log('Easter Egg tables cleared.');

  const maps = await prisma.map.findMany({
    include: { game: true },
  });
  const mapBySlug = new Map(maps.map((m) => [m.slug, m]));

  const hasSpecificMainQuest = new Set(
    SPECIFIC_EASTER_EGGS.filter((ee) => ee.type === 'MAIN_QUEST').map(
      (ee) => `${ee.gameShortName}:${ee.mapSlug}`
    )
  );
  const mapKey = (m: { slug: string; game: { shortName: string } }) => `${m.game.shortName}:${m.slug}`;
  let mainQuestCount = 0;
  for (const map of maps) {
    if (!MAIN_QUEST_MAP_SLUGS.has(map.slug)) continue;
    if (hasSpecificMainQuest.has(mapKey(map))) continue;
    await prisma.easterEgg.create({
      data: {
        name: 'Main Quest',
        slug: 'main-quest',
        type: 'MAIN_QUEST',
        mapId: map.id,
        xpReward: 1250,
        description: `Complete the main Easter Egg quest on ${map.name}`,
      },
    });
    mainQuestCount++;
  }
  console.log(`Created ${mainQuestCount} Main Quest placeholders.`);

  let specificCount = 0;
  for (const ee of SPECIFIC_EASTER_EGGS) {
    const map = maps.find(
      (m) => m.slug === ee.mapSlug && m.game.shortName === ee.gameShortName
    );
    if (!map) {
      console.warn(`Map not found for EE "${ee.name}" (${ee.gameShortName} / ${ee.mapSlug}), skipping.`);
      continue;
    }
    const created = await prisma.easterEgg.create({
      data: {
        name: ee.name,
        slug: ee.slug,
        type: ee.type,
        mapId: map.id,
        xpReward: ee.xpReward ?? 0,
        description: ee.description ?? null,
        playerCountRequirement: ee.playerCountRequirement ?? null,
        rewardsDescription: ee.rewardsDescription ?? null,
        videoEmbedUrl: ee.videoEmbedUrl ?? null,
        variantTag: ee.variantTag ?? null,
        categoryTag: ee.categoryTag ?? null,
      },
    });
    await prisma.easterEggStep.createMany({
      data: ee.steps.map((s) => ({
        easterEggId: created.id,
        order: s.order,
        label: s.label,
        imageUrl: s.imageUrl ?? null,
        buildableReferenceSlug: s.buildableReferenceSlug ?? null,
      })),
    });
    specificCount++;
    console.log(`  Created "${ee.name}" (${ee.steps.length} steps) for ${map.name}.`);
  }
  console.log(`Created ${specificCount} specific Easter Eggs.`);

  // Re-link Main Quest achievements to the new Easter Egg IDs (we nulled them before truncate)
  const mainQuestEasterEggs = await prisma.easterEgg.findMany({
    where: { slug: 'main-quest', type: 'MAIN_QUEST' },
    select: { id: true, mapId: true },
  });
  let relinked = 0;
  for (const ee of mainQuestEasterEggs) {
    const result = await prisma.achievement.updateMany({
      where: { mapId: ee.mapId, type: 'EASTER_EGG_COMPLETE' },
      data: { easterEggId: ee.id },
    });
    relinked += result.count;
  }
  if (relinked > 0) {
    console.log(`Re-linked ${relinked} Main Quest achievements to Easter Eggs.`);
  }

  console.log('Easter Egg seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
