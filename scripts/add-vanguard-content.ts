/**
 * Add Vanguard Zombies content (game, maps, challenges, Easter eggs, achievements)
 * without truncating or wiping existing data. Safe for production.
 *
 * Prerequisites: Run db:migrate:deploy first (adds vanguardVoidUsed, EXFIL_R5/R10/R20_SPEEDRUN).
 *
 * Run: pnpm run db:add-vanguard
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
// Default: local (.env + .env.local). Add .env.production only when DEPLOY_VANGUARD_PRODUCTION=1
const envFiles = process.env.DEPLOY_VANGUARD_PRODUCTION === '1' ? ['.env', '.env.local', '.env.production'] : ['.env', '.env.local'];
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
import { getVanguardMapConfig, getVanguardChallengeTypeLabel } from '../src/lib/vanguard/vanguard-map-config';
import { SPECIFIC_EASTER_EGGS_BASE } from '../prisma/seed-easter-eggs-base';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const VANGUARD_MAPS = [
  {
    name: 'Der Anfang',
    slug: 'der-anfang',
    isDlc: false,
    hasEasterEgg: true,
    order: 1,
    imageUrl: '/images/maps/der-anfang.webp',
    description: 'Vanguard Zombies launch map. Stalingrad-inspired hub with Void portals. Prologue Quest (story objectives). With/Without Void filter. Exfil at Round 5 or 10.',
  },
  {
    name: 'Terra Maledicta',
    slug: 'terra-maledicta',
    isDlc: true,
    hasEasterEgg: true,
    order: 2,
    imageUrl: '/images/maps/terra-maledicta.webp',
    description: 'Vanguard Zombies DLC. Egyptian-themed map with Story Event, secret room and antenna EEs. With/Without Void filter. Exfil at Round 5 or 10.',
  },
  {
    name: 'Shi No Numa Reborn',
    slug: 'shi-no-numa-reborn',
    isDlc: true,
    hasEasterEgg: true,
    order: 3,
    imageUrl: '/images/maps/shi-no-numa-reborn.jpg',
    description: 'Vanguard Zombies DLC. Reimagined Shi No Numa swamp with Wunderwaffe DG-2 buildable. Full main quest. Rampage Inducer support. Exfil at Round 10 or 20.',
  },
  {
    name: 'The Archon',
    slug: 'the-archon',
    isDlc: true,
    hasEasterEgg: true,
    order: 4,
    imageUrl: '/images/maps/the-archon.webp',
    description: 'Vanguard Zombies finale. Fight the Archon. Vanishing Shore musical EE, Mr. Peeks side quest. Rampage Inducer support. Exfil at Round 10 or 20.',
  },
];

const roundChallengeTypes: Record<string, { name: string; description: string }> = {
  HIGHEST_ROUND: { name: 'Highest Round', description: 'Reach the highest round possible' },
  NO_DOWNS: { name: 'No Downs', description: 'Survive without going down' },
  NO_PERKS: { name: 'No Perks', description: 'Survive without purchasing any perks' },
  NO_ARMOR: { name: 'No Armor', description: 'No armor' },
  NO_JUG: { name: 'No Jug', description: 'No Juggernog' },
  STARTING_ROOM: { name: 'Starting Room Only', description: 'Never leave the starting room' },
  ROUND_10_SPEEDRUN: { name: 'Round 10 Speedrun', description: 'Reach round 10 as fast as possible' },
  ROUND_20_SPEEDRUN: { name: 'Round 20 Speedrun', description: 'Reach round 20 as fast as possible' },
  ROUND_30_SPEEDRUN: { name: 'Round 30 Speedrun', description: 'Reach round 30 as fast as possible' },
  ROUND_50_SPEEDRUN: { name: 'Round 50 Speedrun', description: 'Reach round 50 as fast as possible' },
  ROUND_70_SPEEDRUN: { name: 'Round 70 Speedrun', description: 'Reach round 70 as fast as possible' },
  ROUND_100_SPEEDRUN: { name: 'Round 100 Speedrun', description: 'Reach round 100 as fast as possible' },
  ROUND_200_SPEEDRUN: { name: 'Round 200 Speedrun', description: 'Reach round 200 as fast as possible' },
  EXFIL_R5_SPEEDRUN: { name: 'Exfil Round 5 Speedrun', description: 'Exfil at round 5 as fast as possible' },
  EXFIL_R10_SPEEDRUN: { name: 'Exfil Round 10 Speedrun', description: 'Exfil at round 10 as fast as possible' },
  EXFIL_R20_SPEEDRUN: { name: 'Exfil Round 20 Speedrun', description: 'Exfil at round 20 as fast as possible' },
  EASTER_EGG_SPEEDRUN: { name: 'Easter Egg Speedrun', description: 'Complete the main Easter egg as fast as possible' },
  BUILD_EE_SPEEDRUN: { name: 'Build% EE Speedrun', description: 'Build% Easter egg speedrun' },
};

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL. Load .env.local or production env.');
    process.exit(1);
  }
  console.log('Adding Vanguard Zombies content (no truncate)...');

  let vanguardGame = await prisma.game.findUnique({ where: { shortName: 'VANGUARD' } });
  if (!vanguardGame) {
    vanguardGame = await prisma.game.create({
      data: { name: 'Call of Duty: Vanguard', shortName: 'VANGUARD', releaseYear: 2021, order: 11 },
    });
    console.log('Created Vanguard game');
  } else {
    console.log('Vanguard game already exists');
  }

  const createdMaps: { id: string; slug: string; gameId: string }[] = [];
  for (const mapInfo of VANGUARD_MAPS) {
    let map = await prisma.map.findFirst({
      where: { slug: mapInfo.slug, gameId: vanguardGame.id },
    });
    if (!map) {
      const roundCap = getRoundCapForMap(mapInfo.slug, 'VANGUARD') ?? null;
      map = await prisma.map.create({
        data: {
          name: mapInfo.name,
          slug: mapInfo.slug,
          gameId: vanguardGame.id,
          isDlc: mapInfo.isDlc,
          order: mapInfo.order,
          imageUrl: mapInfo.imageUrl ?? `/images/maps/${mapInfo.slug}.webp`,
          roundCap,
          description: mapInfo.description ?? 'Vanguard Zombies map.',
        },
      });
      createdMaps.push(map);
      console.log(`Created map: ${mapInfo.name}`);
    }
  }
  if (createdMaps.length > 0) console.log(`Created ${createdMaps.length} Vanguard maps`);

  const allVanguardMaps = await prisma.map.findMany({
    where: { gameId: vanguardGame.id },
    include: { game: { select: { shortName: true } } },
  });

  // Deactivate "No Jug No Armor" challenges (removed — use "No Jug" and "No Armor" instead)
  const deprecated = await prisma.challenge.updateMany({
    where: {
      mapId: { in: allVanguardMaps.map((m) => m.id) },
      type: 'NO_JUG_NO_ARMOR',
    },
    data: { isActive: false },
  });
  if (deprecated.count > 0) {
    console.log(`Deactivated ${deprecated.count} deprecated "No Jug No Armor" challenge(s)`);
  }

  let challengesCreated = 0;
  for (const map of allVanguardMaps) {
    const vgCfg = getVanguardMapConfig(map.slug);
    if (!vgCfg) continue;
    for (const cType of vgCfg.challengeTypes) {
      const slug = (cType as string).toLowerCase().replace(/_/g, '-');
      const exists = await prisma.challenge.findFirst({ where: { mapId: map.id, slug } });
      if (exists) continue;
      const info = roundChallengeTypes[cType as string];
      const name = getVanguardChallengeTypeLabel(cType) || info?.name || (cType as string).replace(/_/g, ' ');
      const desc = info?.description || `Challenge: ${cType}`;
      await prisma.challenge.create({
        data: { name, slug, type: cType as any, mapId: map.id, xpReward: 0, description: desc },
      });
      challengesCreated++;
    }
  }
  if (challengesCreated > 0) console.log(`Created ${challengesCreated} Vanguard challenges`);

  const vanguardEes = SPECIFIC_EASTER_EGGS_BASE.filter((ee) => ee.gameShortName === 'VANGUARD');
  let eesCreated = 0;
  let eesUpdated = 0;
  for (const eeData of vanguardEes) {
    const map = allVanguardMaps.find((m) => m.slug === eeData.mapSlug);
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
    // Upsert EASTER_EGG_COMPLETE achievement (create or update name/xp)
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
    console.log(`Vanguard Easter eggs: ${eesCreated} created, ${eesUpdated} updated`);
  } else {
    const total = await prisma.easterEgg.count({
      where: { map: { gameId: vanguardGame.id } },
    });
    console.log(`Vanguard Easter eggs: ${total} in DB (synced this run)`);
  }

  let achievementsCreated = 0;
  for (const map of allVanguardMaps) {
    const mapWithChallenges = await prisma.map.findUnique({
      where: { id: map.id },
      include: { game: { select: { shortName: true } }, challenges: { where: { isActive: true } } },
    });
    if (!mapWithChallenges) continue;
    const mapDefs = getMapAchievementDefinitions(
      mapWithChallenges.slug,
      mapWithChallenges.roundCap,
      mapWithChallenges.game?.shortName ?? 'VANGUARD'
    );
    const speedrunDefs = getSpeedrunAchievementDefinitions(
      mapWithChallenges.slug,
      mapWithChallenges.game?.shortName ?? 'VANGUARD'
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
  if (achievementsCreated > 0) console.log(`Created ${achievementsCreated} Vanguard achievements`);

  console.log('Vanguard content added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
