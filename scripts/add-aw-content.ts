/**
 * Add Advanced Warfare Exo Zombies content (game, maps, challenges, Easter eggs, achievements)
 * without truncating or wiping existing data. Safe for production.
 *
 * Prerequisites: Run db:migrate:deploy first (adds NO_EXO_SUIT, NO_EXO_HEALTH, DOUBLE_FEATURE).
 *
 * Run: pnpm run db:add-aw
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
// Default: local (.env + .env.local). Add .env.production only when DEPLOY_AW_PRODUCTION=1
const envFiles = process.env.DEPLOY_AW_PRODUCTION === '1' ? ['.env', '.env.local', '.env.production'] : ['.env', '.env.local'];
for (const file of envFiles) {
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

import { PrismaClient } from '@prisma/client';
import { getMapAchievementDefinitions, getSpeedrunAchievementDefinitions } from '../src/lib/achievements/seed-achievements';
import { getRoundCapForMap } from '../src/lib/achievements/map-round-config';
import { getAwMapConfig, getAwChallengeTypeLabel } from '../src/lib/aw/aw-map-config';
import { SPECIFIC_EASTER_EGGS_BASE } from '../prisma/seed-easter-eggs-base';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const AW_MAPS = [
  {
    name: 'Outbreak',
    slug: 'aw-outbreak',
    isDlc: true,
    hasEasterEgg: true,
    order: 1,
    imageUrl: '/images/maps/outbreak-aw.webp',
    description: 'AW Exo Zombies launch map. Atlas facility. Game Over Man main quest, Ride of the Valkyries musical EE.',
  },
  {
    name: 'Infection',
    slug: 'aw-infection',
    isDlc: true,
    hasEasterEgg: true,
    order: 2,
    imageUrl: '/images/maps/infection.webp',
    description: 'AW Exo Zombies DLC. Burgertown-themed. MEAT IS MURDER main quest, Toccata and Fugue musical, toilet side quest.',
  },
  {
    name: 'Carrier',
    slug: 'aw-carrier',
    isDlc: true,
    hasEasterEgg: true,
    order: 3,
    imageUrl: '/images/maps/carrier.webp',
    description: 'AW Exo Zombies DLC. Naval carrier. Flotsam & Jetsam main quest, Mars musical EE.',
  },
  {
    name: 'Descent',
    slug: 'aw-descent',
    isDlc: true,
    hasEasterEgg: true,
    order: 4,
    imageUrl: '/images/maps/descent.webp',
    description: 'AW Exo Zombies finale. Reunion main quest, Dies Irae musical. Double Feature challenge available.',
  },
];

const roundChallengeTypes: Record<string, { name: string; description: string }> = {
  HIGHEST_ROUND: { name: 'Highest Round', description: 'Reach the highest round possible' },
  NO_DOWNS: { name: 'No Downs', description: 'Survive without going down' },
  NO_PERKS: { name: 'No Perks', description: 'Survive without purchasing any perks' },
  NO_PACK: { name: 'No Pack-a-Punch', description: 'Survive without Pack-a-Punch' },
  STARTING_ROOM: { name: 'Starting Room Only', description: 'Never leave the starting room' },
  NO_POWER: { name: 'No Power', description: 'Never turn on power' },
  NO_EXO_SUIT: { name: 'No Exo Suit', description: 'Survive without Exo Suit upgrades' },
  NO_EXO_HEALTH: { name: 'No Exo Health', description: 'Survive without Exo Health upgrades' },
  DOUBLE_FEATURE: { name: 'Double Feature', description: 'Complete Descent Double Feature mode (Descent only)' },
  ROUND_30_SPEEDRUN: { name: 'Round 30 Speedrun', description: 'Reach round 30 as fast as possible' },
  ROUND_50_SPEEDRUN: { name: 'Round 50 Speedrun', description: 'Reach round 50 as fast as possible' },
  ROUND_70_SPEEDRUN: { name: 'Round 70 Speedrun', description: 'Reach round 70 as fast as possible' },
  ROUND_100_SPEEDRUN: { name: 'Round 100 Speedrun', description: 'Reach round 100 as fast as possible' },
  EASTER_EGG_SPEEDRUN: { name: 'Easter Egg Speedrun', description: 'Complete the main Easter egg as fast as possible' },
};

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL. Load .env.local or production env.');
    process.exit(1);
  }
  console.log('Adding Advanced Warfare Exo Zombies content (no truncate)...');

  let awGame = await prisma.game.findUnique({ where: { shortName: 'AW' } });
  if (!awGame) {
    awGame = await prisma.game.create({
      data: { name: 'Call of Duty: Advanced Warfare', shortName: 'AW', releaseYear: 2014, order: 12 },
    });
    console.log('Created AW game');
  } else {
    console.log('AW game already exists');
  }

  const createdMaps: { id: string; slug: string; gameId: string }[] = [];
  for (const mapInfo of AW_MAPS) {
    let map = await prisma.map.findFirst({
      where: { slug: mapInfo.slug, gameId: awGame.id },
    });
    if (!map) {
      const roundCap = getRoundCapForMap(mapInfo.slug, 'AW') ?? null;
      map = await prisma.map.create({
        data: {
          name: mapInfo.name,
          slug: mapInfo.slug,
          gameId: awGame.id,
          isDlc: mapInfo.isDlc,
          order: mapInfo.order,
          imageUrl: mapInfo.imageUrl ?? `/images/maps/${mapInfo.slug}.webp`,
          roundCap,
          description: mapInfo.description ?? 'AW Exo Zombies map.',
        },
      });
      createdMaps.push(map);
      console.log(`Created map: ${mapInfo.name}`);
    } else if (mapInfo.imageUrl && map.imageUrl !== mapInfo.imageUrl) {
      await prisma.map.update({
        where: { id: map.id },
        data: { imageUrl: mapInfo.imageUrl },
      });
      console.log(`Updated map image: ${mapInfo.name}`);
    }
  }
  if (createdMaps.length > 0) console.log(`Created ${createdMaps.length} AW maps`);

  const allAwMaps = await prisma.map.findMany({
    where: { gameId: awGame.id },
    include: { game: { select: { shortName: true } } },
  });

  let challengesCreated = 0;
  for (const map of allAwMaps) {
    const awCfg = getAwMapConfig(map.slug);
    if (!awCfg) continue;
    for (const cType of awCfg.challengeTypes) {
      const slug = (cType as string).toLowerCase().replace(/_/g, '-');
      const exists = await prisma.challenge.findFirst({ where: { mapId: map.id, slug } });
      if (exists) continue;
      const info = roundChallengeTypes[cType as string];
      const name = getAwChallengeTypeLabel(cType) || info?.name || (cType as string).replace(/_/g, ' ');
      const desc = info?.description || `Challenge: ${cType}`;
      await prisma.challenge.create({
        data: { name, slug, type: cType as any, mapId: map.id, xpReward: 0, description: desc },
      });
      challengesCreated++;
    }
  }
  if (challengesCreated > 0) console.log(`Created ${challengesCreated} AW challenges`);

  const awEes = SPECIFIC_EASTER_EGGS_BASE.filter((ee) => ee.gameShortName === 'AW');
  let eesCreated = 0;
  let eesUpdated = 0;
  for (const eeData of awEes) {
    const map = allAwMaps.find((m) => m.slug === eeData.mapSlug);
    if (!map) {
      console.warn(`  [EE] Map not found for "${eeData.name}" (${eeData.mapSlug}), skipping.`);
      continue;
    }
    const existing = await prisma.easterEgg.findFirst({
      where: { mapId: map.id, slug: eeData.slug },
      include: { steps: true },
    });
    const eePayload = {
      name: eeData.name,
      slug: eeData.slug,
      type: eeData.type,
      xpReward: eeData.xpReward ?? 0,
      description: eeData.description ?? null,
      videoEmbedUrl: eeData.videoEmbedUrl ?? null,
      rewardsDescription: eeData.rewardsDescription ?? null,
      playerCountRequirement: (eeData as { playerCountRequirement?: string }).playerCountRequirement ?? null,
      variantTag: (eeData as { variantTag?: string | null }).variantTag ?? null,
      categoryTag: (eeData as { categoryTag?: string | null }).categoryTag ?? null,
    };
    let ee: { id: string; name: string };
    if (existing) {
      await prisma.easterEgg.update({
        where: { id: existing.id },
        data: eePayload,
      });
      await prisma.easterEggStep.deleteMany({ where: { easterEggId: existing.id } });
      await prisma.easterEggStep.createMany({
        data: eeData.steps.map((s) => ({
          easterEggId: existing.id,
          order: s.order,
          label: s.label,
          imageUrl: s.imageUrl ?? null,
          buildableReferenceSlug: s.buildableReferenceSlug ?? null,
        })),
      });
      ee = { id: existing.id, name: eeData.name };
      eesUpdated++;
      console.log(`  Updated Easter egg: "${eeData.name}" on ${map.name} (${eeData.steps.length} steps)`);
    } else {
      const created = await prisma.easterEgg.create({
        data: {
          ...eePayload,
          mapId: map.id,
        },
      });
      await prisma.easterEggStep.createMany({
        data: eeData.steps.map((s) => ({
          easterEggId: created.id,
          order: s.order,
          label: s.label,
          imageUrl: s.imageUrl ?? null,
          buildableReferenceSlug: s.buildableReferenceSlug ?? null,
        })),
      });
      ee = { id: created.id, name: eeData.name };
      eesCreated++;
      console.log(`  Created Easter egg: "${eeData.name}" on ${map.name}`);
    }
    if ((eeData.xpReward ?? 0) > 0) {
      const ach = await prisma.achievement.findFirst({
        where: { easterEggId: ee.id, type: 'EASTER_EGG_COMPLETE' },
      });
      if (ach) {
        await prisma.achievement.update({
          where: { id: ach.id },
          data: { name: eeData.name, xpReward: eeData.xpReward ?? 0 },
        });
      } else {
        await prisma.achievement.create({
          data: {
            mapId: map.id,
            easterEggId: ee.id,
            name: eeData.name,
            slug: eeData.slug,
            type: 'EASTER_EGG_COMPLETE',
            rarity: 'LEGENDARY',
            xpReward: eeData.xpReward ?? 0,
            criteria: {},
          },
        });
      }
    }
  }
  if (eesCreated > 0 || eesUpdated > 0) {
    console.log(`AW Easter eggs: ${eesCreated} created, ${eesUpdated} updated`);
  } else {
    const total = await prisma.easterEgg.count({
      where: { map: { gameId: awGame.id } },
    });
    console.log(`AW Easter eggs: ${total} in DB (synced this run)`);
  }

  let achievementsCreated = 0;
  for (const map of allAwMaps) {
    const mapWithChallenges = await prisma.map.findUnique({
      where: { id: map.id },
      include: { game: { select: { shortName: true } }, challenges: { where: { isActive: true } } },
    });
    if (!mapWithChallenges) continue;
    const mapDefs = getMapAchievementDefinitions(
      mapWithChallenges.slug,
      mapWithChallenges.roundCap,
      mapWithChallenges.game?.shortName ?? 'AW'
    );
    const speedrunDefs = getSpeedrunAchievementDefinitions(
      mapWithChallenges.slug,
      mapWithChallenges.game?.shortName ?? 'AW'
    );
    const defs = [...mapDefs, ...speedrunDefs];
    const challengesByType = Object.fromEntries(mapWithChallenges.challenges.map((c) => [c.type, c]));
    for (const def of defs) {
      const existing = await prisma.achievement.findFirst({ where: { mapId: map.id, slug: def.slug } });
      if (existing) continue;
      const criteria = def.criteria as { round?: number; challengeType?: string; easterEggSlug?: string };
      const challengeId = criteria.challengeType ? challengesByType[criteria.challengeType as string]?.id : null;
      const easterEggId = criteria.easterEggSlug
        ? (await prisma.easterEgg.findFirst({ where: { mapId: map.id, slug: criteria.easterEggSlug } }))?.id
        : null;
      await prisma.achievement.create({
        data: {
          mapId: map.id,
          name: def.name,
          slug: def.slug,
          type: def.type as any,
          rarity: def.rarity as any,
          xpReward: def.xpReward,
          criteria: def.criteria as any,
          challengeId: challengeId ?? null,
          easterEggId: easterEggId ?? null,
        },
      });
      achievementsCreated++;
    }
  }
  if (achievementsCreated > 0) console.log(`Created ${achievementsCreated} AW achievements`);

  console.log('AW content added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
