/**
 * Add WW2 Zombies content (game, maps, challenges, Easter eggs, achievements)
 * without truncating or wiping existing data. Safe for production.
 *
 * Prerequisites: Run db:migrate:deploy first (adds NO_BLITZ, SUPER_30_SPEEDRUN, ww2ConsumablesUsed).
 *
 * Run: pnpm run db:add-ww2
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

import { PrismaClient } from '@prisma/client';
import { getMapAchievementDefinitions, getSpeedrunAchievementDefinitions } from '../src/lib/achievements/seed-achievements';
import { getRoundCapForMap } from '../src/lib/achievements/map-round-config';
import { getWw2MapConfig, getWw2ChallengeTypeLabel } from '../src/lib/ww2/ww2-map-config';
import { SPECIFIC_EASTER_EGGS_BASE } from '../prisma/seed-easter-eggs-base';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const WW2_MAPS = [
  { name: 'Prologue', slug: 'prologue', isDlc: false, hasEasterEgg: false, order: 1, imageUrl: '/images/maps/prologue.webp', description: 'WW2 Zombies prologue map. Small survival challenge.' },
  { name: 'The Final Reich', slug: 'the-final-reich', isDlc: false, hasEasterEgg: true, order: 2, imageUrl: '/images/maps/the-final-reich.webp', description: 'WW2 Zombies. Mittelburg underground bunker and village. Fireworks and Dark Reunion main quests.' },
  { name: 'Gröesten Haus', slug: 'groesten-haus', isDlc: true, hasEasterEgg: false, order: 3, imageUrl: '/images/maps/groesten-haus.webp', description: 'WW2 Zombies. Classic survival in a small house.' },
  { name: 'The Darkest Shore', slug: 'the-darkest-shore', isDlc: true, hasEasterEgg: true, order: 4, imageUrl: '/images/maps/the-darkest-shore.webp', description: 'WW2 Zombies. U-boat pen on Heligoland. Making History main quest.' },
  { name: 'The Shadowed Throne', slug: 'the-shadowed-throne', isDlc: true, hasEasterEgg: true, order: 5, imageUrl: '/images/maps/the-shadowed-throne.webp', description: 'WW2 Zombies. Battle of Berlin. Stadtjäger Down main quest.' },
  { name: 'Bodega Cervantes', slug: 'bodega-cervantes', isDlc: true, hasEasterEgg: false, order: 6, imageUrl: '/images/maps/bodega-cervantes.webp', description: 'WW2 Zombies. The Tortured Path. Spanish bodega survival.' },
  { name: 'U.S.S. Mount Olympus', slug: 'uss-mount-olympus', isDlc: true, hasEasterEgg: false, order: 7, imageUrl: '/images/maps/uss-mount-olympus.webp', description: 'WW2 Zombies. The Tortured Path. Naval vessel survival.' },
  { name: 'Altar of Blood', slug: 'altar-of-blood', isDlc: true, hasEasterEgg: true, order: 8, imageUrl: '/images/maps/altar-of-blood.webp', description: 'WW2 Zombies. The Tortured Path. Blood altar and Raven Lords.' },
  { name: 'The Frozen Dawn', slug: 'the-frozen-dawn', isDlc: true, hasEasterEgg: true, order: 9, imageUrl: '/images/maps/the-frozen-dawn.webp', description: 'WW2 Zombies. Lost city of Thule. Kingfall main quest.' },
];

const roundChallengeTypes: Record<string, { name: string; description: string }> = {
  HIGHEST_ROUND: { name: 'Highest Round', description: 'Reach the highest round possible' },
  NO_DOWNS: { name: 'No Downs', description: 'Survive without going down' },
  NO_PERKS: { name: 'No Perks', description: 'Survive without purchasing any perks' },
  NO_PACK: { name: 'No Pack-a-Punch', description: 'Survive without using Pack-a-Punch' },
  STARTING_ROOM: { name: 'Starting Room Only', description: 'Never leave the starting room' },
  ONE_BOX: { name: 'One Box Challenge', description: 'Only hit the mystery box once' },
  PISTOL_ONLY: { name: 'Pistol Only', description: 'Only use your starting pistol' },
  NO_POWER: { name: 'No Power', description: 'Never turn on the power' },
  NO_ARMOR: { name: 'No Armor', description: 'No armor' },
  NO_BLITZ: { name: 'No Blitz', description: 'No Blitz (WW2 perks)' },
  ROUND_10_SPEEDRUN: { name: 'Round 10 Speedrun', description: 'Reach round 10 as fast as possible' },
  ROUND_30_SPEEDRUN: { name: 'Round 30 Speedrun', description: 'Reach round 30 as fast as possible' },
  ROUND_50_SPEEDRUN: { name: 'Round 50 Speedrun', description: 'Reach round 50 as fast as possible' },
  ROUND_70_SPEEDRUN: { name: 'Round 70 Speedrun', description: 'Reach round 70 as fast as possible' },
  ROUND_100_SPEEDRUN: { name: 'Round 100 Speedrun', description: 'Reach round 100 as fast as possible' },
  ROUND_200_SPEEDRUN: { name: 'Round 200 Speedrun', description: 'Reach round 200 as fast as possible' },
  SUPER_30_SPEEDRUN: { name: 'Super 30 Speedrun', description: 'Multi-map R30 run (Final Reich → Groesten Haus → Darkest Shore → Shadowed Throne → Frozen Dawn)' },
  EASTER_EGG_SPEEDRUN: { name: 'Easter Egg Speedrun', description: 'Complete the main Easter egg as fast as possible' },
};

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL. Load .env.local or production env.');
    process.exit(1);
  }
  console.log('Adding WW2 Zombies content (no truncate)...');

  let ww2Game = await prisma.game.findUnique({ where: { shortName: 'WW2' } });
  if (!ww2Game) {
    ww2Game = await prisma.game.create({
      data: { name: 'Call of Duty: WWII', shortName: 'WW2', releaseYear: 2017, order: 10 },
    });
    console.log('Created WW2 game');
  } else {
    console.log('WW2 game already exists');
  }

  const createdMaps: { id: string; slug: string; gameId: string }[] = [];
  for (const mapInfo of WW2_MAPS) {
    let map = await prisma.map.findFirst({
      where: { slug: mapInfo.slug, gameId: ww2Game.id },
    });
    if (!map) {
      const roundCap = getRoundCapForMap(mapInfo.slug, 'WW2') ?? null;
      map = await prisma.map.create({
        data: {
          name: mapInfo.name,
          slug: mapInfo.slug,
          gameId: ww2Game.id,
          isDlc: mapInfo.isDlc,
          order: mapInfo.order,
          imageUrl: mapInfo.imageUrl ?? `/images/maps/${mapInfo.slug}.webp`,
          roundCap,
          description: mapInfo.description ?? 'WW2 Zombies map.',
        },
      });
      createdMaps.push(map);
      console.log(`Created map: ${mapInfo.name}`);
    }
  }
  if (createdMaps.length > 0) console.log(`Created ${createdMaps.length} WW2 maps`);

  const allWw2Maps = await prisma.map.findMany({
    where: { gameId: ww2Game.id },
    include: { game: { select: { shortName: true } } },
  });

  let challengesCreated = 0;
  for (const map of allWw2Maps) {
    const ww2Cfg = getWw2MapConfig(map.slug);
    if (!ww2Cfg) continue;
    for (const cType of ww2Cfg.challengeTypes) {
      const slug = (cType as string).toLowerCase().replace(/_/g, '-');
      const exists = await prisma.challenge.findFirst({ where: { mapId: map.id, slug } });
      if (exists) continue;
      const info = roundChallengeTypes[cType as string];
      const name = getWw2ChallengeTypeLabel(cType) || info?.name || (cType as string).replace(/_/g, ' ');
      const desc = info?.description || `Challenge: ${cType}`;
      await prisma.challenge.create({
        data: { name, slug, type: cType as any, mapId: map.id, xpReward: 0, description: desc },
      });
      challengesCreated++;
    }
  }
  if (challengesCreated > 0) console.log(`Created ${challengesCreated} WW2 challenges`);

  const ww2Ees = SPECIFIC_EASTER_EGGS_BASE.filter((ee) => ee.gameShortName === 'WW2');
  let eesCreated = 0;
  for (const eeData of ww2Ees) {
    const map = allWw2Maps.find((m) => m.slug === eeData.mapSlug);
    if (!map) continue;
    const exists = await prisma.easterEgg.findFirst({ where: { mapId: map.id, slug: eeData.slug } });
    if (exists) continue;
    const ee = await prisma.easterEgg.create({
      data: {
        name: eeData.name,
        slug: eeData.slug,
        type: eeData.type,
        mapId: map.id,
        xpReward: eeData.xpReward ?? 0,
        description: eeData.description ?? null,
        videoEmbedUrl: eeData.videoEmbedUrl ?? null,
        rewardsDescription: eeData.rewardsDescription ?? null,
      },
    });
    await prisma.easterEggStep.createMany({
      data: eeData.steps.map((s) => ({
        easterEggId: ee.id,
        order: s.order,
        label: s.label,
        imageUrl: s.imageUrl ?? null,
        buildableReferenceSlug: s.buildableReferenceSlug ?? null,
      })),
    });
    eesCreated++;
  }
  if (eesCreated > 0) console.log(`Created ${eesCreated} WW2 Easter eggs`);

  let achievementsCreated = 0;
  for (const map of allWw2Maps) {
    const mapWithChallenges = await prisma.map.findUnique({
      where: { id: map.id },
      include: { game: { select: { shortName: true } }, challenges: { where: { isActive: true } } },
    });
    if (!mapWithChallenges) continue;
    const mapDefs = getMapAchievementDefinitions(
      mapWithChallenges.slug,
      mapWithChallenges.roundCap,
      mapWithChallenges.game?.shortName ?? 'WW2'
    );
    const speedrunDefs = getSpeedrunAchievementDefinitions(
      mapWithChallenges.slug,
      mapWithChallenges.game?.shortName ?? 'WW2'
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
  if (achievementsCreated > 0) console.log(`Created ${achievementsCreated} WW2 achievements`);

  console.log('WW2 content added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
