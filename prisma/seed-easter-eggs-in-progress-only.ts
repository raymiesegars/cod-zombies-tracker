// Re-seed only in-progress map(s). Run: pnpm run db:seed:easter-eggs:in-progress
// Use while developing a map: deletes that map’s EEs, then re-creates Main Quest (if any) + all from SPECIFIC_EASTER_EGGS_IN_PROGRESS. Way faster than full EE seed. DB must be fully seeded once first.

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { MAIN_QUEST_MAP_SLUGS } from './main-quest-map-slugs';
import { SPECIFIC_EASTER_EGGS_IN_PROGRESS } from './seed-easter-eggs-in-progress';

function loadEnv() {
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
}
loadEnv();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  if (SPECIFIC_EASTER_EGGS_IN_PROGRESS.length === 0) {
    console.log('No in-progress Easter Eggs. Add entries to prisma/seed-easter-eggs-in-progress.ts');
    return;
  }

  const maps = await prisma.map.findMany({ include: { game: true } });
  const mapKey = (m: { slug: string; game: { shortName: string } }) =>
    `${m.game.shortName}:${m.slug}`;
  const mapByKey = new Map(maps.map((m) => [mapKey(m), m]));

  const keys = new Set(
    SPECIFIC_EASTER_EGGS_IN_PROGRESS.map((ee) => `${ee.gameShortName}:${ee.mapSlug}`)
  );
  const targetMaps = Array.from(keys)
    .map((k) => mapByKey.get(k))
    .filter((m): m is NonNullable<typeof m> => m != null);

  if (targetMaps.length === 0) {
    console.warn('No maps found for in-progress EEs. Check gameShortName and mapSlug.');
    return;
  }

  const mapIds = targetMaps.map((m) => m.id);
  console.log(
    `Re-seeding in-progress EEs for: ${targetMaps.map((m) => m.name).join(', ')}`
  );

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

  // Delete all EEs for these maps (Achievement.easterEggId will be nulled by FK ON DELETE SET NULL)
  const deleted = await prisma.easterEgg.deleteMany({
    where: { mapId: { in: mapIds } },
  });
  console.log(`Deleted ${deleted.count} existing Easter Egg(s) for in-progress map(s).`);

  // Re-create Main Quest placeholders only for in-progress maps that don't already have a specific main quest
  const hasSpecificMainQuest = new Set(
    SPECIFIC_EASTER_EGGS_IN_PROGRESS.filter((ee) => ee.type === 'MAIN_QUEST').map(
      (ee) => `${ee.gameShortName}:${ee.mapSlug}`
    )
  );
  for (const map of targetMaps) {
    if (!MAIN_QUEST_MAP_SLUGS.has(map.slug)) continue;
    if (hasSpecificMainQuest.has(mapKey(map))) continue; // already have e.g. Apocalypse Averted
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
  }

  // Create all in-progress specific EEs
  let count = 0;
  for (const ee of SPECIFIC_EASTER_EGGS_IN_PROGRESS) {
    const map = mapByKey.get(`${ee.gameShortName}:${ee.mapSlug}`);
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
    count++;
    console.log(`  Created "${ee.name}" (${ee.steps.length} steps) for ${map.name}.`);
  }
  console.log(`Created ${count} in-progress Easter Egg(s).`);

  // Re-link Main Quest achievements for the maps we touched
  const mainQuestEasterEggs = await prisma.easterEgg.findMany({
    where: { slug: 'main-quest', type: 'MAIN_QUEST', mapId: { in: mapIds } },
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
    console.log(`Re-linked ${relinked} Main Quest achievement(s).`);
  }

  console.log('In-progress Easter Egg seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
