/**
 * Add Infinite Warfare content (game, Zombies in Spaceland map, challenges, Sooooul Key EE, achievements)
 * without truncating or wiping existing data. Safe for dev and production.
 *
 * Run: pnpm run db:add-iw
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
import { SPECIFIC_EASTER_EGGS_BASE } from '../prisma/seed-easter-eggs-base';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
});

const ROUND_CHALLENGE_TYPES = [
  { type: 'HIGHEST_ROUND' as const, name: 'Highest Round', slug: 'highest-round', description: 'Reach the highest round possible' },
  { type: 'NO_DOWNS' as const, name: 'No Downs', slug: 'no-downs', description: 'Survive without going down' },
  { type: 'NO_PERKS' as const, name: 'No Perks', slug: 'no-perks', description: 'Survive without purchasing any perks' },
  { type: 'NO_PACK' as const, name: 'No Pack-a-Punch', slug: 'no-pack', description: 'Survive without using Pack-a-Punch' },
  { type: 'STARTING_ROOM' as const, name: 'Starting Room Only', slug: 'starting-room', description: 'Never leave the starting room' },
  { type: 'ONE_BOX' as const, name: 'One Box Challenge', slug: 'one-box', description: 'Only hit the mystery box once' },
  { type: 'PISTOL_ONLY' as const, name: 'Pistol Only', slug: 'pistol-only', description: 'Only use your starting pistol' },
  { type: 'NO_POWER' as const, name: 'No Power', slug: 'no-power', description: 'Never turn on the power' },
];

const IW_SPEEDRUN_TYPES = [
  { type: 'ROUND_30_SPEEDRUN' as const, name: 'Round 30 Speedrun', slug: 'round-30-speedrun', description: 'Reach round 30 as fast as possible' },
  { type: 'ROUND_50_SPEEDRUN' as const, name: 'Round 50 Speedrun', slug: 'round-50-speedrun', description: 'Reach round 50 as fast as possible' },
  { type: 'ROUND_70_SPEEDRUN' as const, name: 'Round 70 Speedrun', slug: 'round-70-speedrun', description: 'Reach round 70 as fast as possible' },
  { type: 'ROUND_100_SPEEDRUN' as const, name: 'Round 100 Speedrun', slug: 'round-100-speedrun', description: 'Reach round 100 as fast as possible' },
  { type: 'EASTER_EGG_SPEEDRUN' as const, name: 'Easter Egg Speedrun', slug: 'easter-egg-speedrun', description: 'Complete the main Easter egg as fast as possible' },
  { type: 'GHOST_AND_SKULLS' as const, name: 'Ghost and Skulls', slug: 'ghost-and-skulls', description: 'Complete Ghost and Skulls as fast as possible' },
  { type: 'ALIENS_BOSS_FIGHT' as const, name: 'Aliens Boss Fight', slug: 'aliens-boss-fight', description: 'Defeat the Aliens boss as fast as possible' },
];

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL. Load .env.local or production env.');
    process.exit(1);
  }
  console.log('Adding IW content (no truncate)...');

  // 1. Upsert IW game
  let iwGame = await prisma.game.findUnique({ where: { shortName: 'IW' } });
  if (!iwGame) {
    iwGame = await prisma.game.create({
      data: {
        name: 'Infinite Warfare',
        shortName: 'IW',
        releaseYear: 2016,
        order: 5,
      },
    });
    console.log('Created IW game');
    // Bump BO4+ order if they exist
    await prisma.game.updateMany({
      where: { shortName: { in: ['BO4', 'BOCW', 'BO6', 'BO7'] } },
      data: {}, // No-op; we need conditional updates. Do it per game.
    });
    for (const [sn, ord] of [['BO4', 6], ['BOCW', 7], ['BO6', 8], ['BO7', 9]] as const) {
      await prisma.game.updateMany({ where: { shortName: sn }, data: { order: ord } });
    }
  } else {
    console.log('IW game already exists');
  }

  // 2. Upsert Zombies in Spaceland map
  const roundCap = getRoundCapForMap('zombies-in-spaceland', 'IW') ?? null;
  let zisMap = await prisma.map.findFirst({
    where: { slug: 'zombies-in-spaceland', gameId: iwGame.id },
  });
  if (!zisMap) {
    zisMap = await prisma.map.create({
      data: {
        name: 'Zombies in Spaceland',
        slug: 'zombies-in-spaceland',
        gameId: iwGame.id,
        isDlc: false,
        order: 1,
        imageUrl: '/images/maps/zombies-in-spaceland.webp',
        roundCap,
        description: 'An 80s theme park overrun by zombies. Features arcade games, roller coasters, and David Hasselhoff.',
      },
    });
    console.log('Created Zombies in Spaceland map');
  } else {
    console.log('Zombies in Spaceland map already exists');
  }

  // 3. Create challenges for ZIS if missing
  const allChallengeInfos = [...ROUND_CHALLENGE_TYPES, ...IW_SPEEDRUN_TYPES];
  let challengesCreated = 0;
  for (const info of allChallengeInfos) {
    const exists = await prisma.challenge.findFirst({
      where: { mapId: zisMap.id, slug: info.slug },
    });
    if (!exists) {
      await prisma.challenge.create({
        data: {
          name: info.name,
          slug: info.slug,
          type: info.type,
          mapId: zisMap.id,
          xpReward: 0,
          description: info.description,
        },
      });
      challengesCreated++;
    }
  }
  if (challengesCreated > 0) console.log(`Created ${challengesCreated} challenges for Zombies in Spaceland`);

  // 4. Create Sooooul Key Easter Egg if missing
  const sooooulKeyData = SPECIFIC_EASTER_EGGS_BASE.find(
    (ee) => ee.gameShortName === 'IW' && ee.mapSlug === 'zombies-in-spaceland' && ee.slug === 'sooooul-key'
  );
  if (!sooooulKeyData) {
    console.error('Sooooul Key EE not found in seed-easter-eggs-base. Ensure it is defined.');
    process.exit(1);
  }
  let sooooulKeyEe = await prisma.easterEgg.findFirst({
    where: { mapId: zisMap.id, slug: 'sooooul-key' },
  });
  if (!sooooulKeyEe) {
    sooooulKeyEe = await prisma.easterEgg.create({
      data: {
        name: sooooulKeyData.name,
        slug: sooooulKeyData.slug,
        type: sooooulKeyData.type,
        mapId: zisMap.id,
        xpReward: sooooulKeyData.xpReward ?? 0,
        description: sooooulKeyData.description ?? null,
        videoEmbedUrl: sooooulKeyData.videoEmbedUrl ?? null,
        rewardsDescription: sooooulKeyData.rewardsDescription ?? null,
      },
    });
    await prisma.easterEggStep.createMany({
      data: sooooulKeyData.steps.map((s) => ({
        easterEggId: sooooulKeyEe!.id,
        order: s.order,
        label: s.label,
        imageUrl: s.imageUrl ?? null,
        buildableReferenceSlug: s.buildableReferenceSlug ?? null,
      })),
    });
    console.log(`Created Sooooul Key Easter Egg (${sooooulKeyData.steps.length} steps)`);
  } else {
    console.log('Sooooul Key Easter Egg already exists');
  }

  // 5. Create map achievements for ZIS if missing
  const zisWithChallenges = await prisma.map.findUnique({
    where: { id: zisMap.id },
    include: { game: { select: { shortName: true } }, challenges: { where: { isActive: true } } },
  });
  if (zisWithChallenges) {
    const defs = getMapAchievementDefinitions(
      zisWithChallenges.slug,
      zisWithChallenges.roundCap,
      zisWithChallenges.game?.shortName ?? 'IW'
    );
    const challengesByType = Object.fromEntries(zisWithChallenges.challenges.map((c) => [c.type, c]));
    let achievementsCreated = 0;
    for (const def of defs) {
      const criteria = def.criteria as { round?: number; challengeType?: string };
      const challengeId = criteria.challengeType
        ? challengesByType[criteria.challengeType as keyof typeof challengesByType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: zisMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: zisMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'ROUND_MILESTONE' | 'CHALLENGE_COMPLETE' | 'EASTER_EGG_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        achievementsCreated++;
      }
    }
    if (achievementsCreated > 0) console.log(`Created ${achievementsCreated} map achievements for Zombies in Spaceland`);
  }

  // 5b. Create speedrun tier achievements for ZIS if missing
  const speedrunDefs = getSpeedrunAchievementDefinitions('zombies-in-spaceland', 'IW');
  if (speedrunDefs.length > 0 && zisWithChallenges) {
    const challengesByType = Object.fromEntries(zisWithChallenges.challenges.map((c) => [c.type, c]));
    let speedrunAchievementsCreated = 0;
    for (const def of speedrunDefs) {
      const criteria = def.criteria as { challengeType?: string };
      const challengeId = criteria.challengeType
        ? (challengesByType as Record<string, { id: string }>)[criteria.challengeType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: zisMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: zisMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'CHALLENGE_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        speedrunAchievementsCreated++;
      } else if (existing.xpReward !== def.xpReward) {
        await prisma.achievement.update({
          where: { id: existing.id },
          data: { xpReward: def.xpReward },
        });
      }
    }
    if (speedrunAchievementsCreated > 0) console.log(`Created ${speedrunAchievementsCreated} speedrun achievements for Zombies in Spaceland`);
  }

  // 6. Create achievement for Sooooul Key EE if missing
  const sooooulKeyEeForAchievement = await prisma.easterEgg.findFirst({
    where: { mapId: zisMap.id, slug: 'sooooul-key' },
  });
  const eeAchievementExists = sooooulKeyEeForAchievement
    ? await prisma.achievement.findFirst({ where: { easterEggId: sooooulKeyEeForAchievement.id } })
    : null;
  if (!eeAchievementExists && sooooulKeyEeForAchievement && (sooooulKeyEeForAchievement.xpReward ?? 0) > 0) {
    await prisma.achievement.create({
      data: {
        mapId: zisMap.id,
        easterEggId: sooooulKeyEeForAchievement.id,
        name: sooooulKeyEeForAchievement.name,
        slug: sooooulKeyEeForAchievement.slug,
        type: 'EASTER_EGG_COMPLETE',
        rarity: 'LEGENDARY',
        xpReward: sooooulKeyEeForAchievement.xpReward ?? 2500,
        criteria: {},
      },
    });
    console.log('Created Sooooul Key achievement');
  }

  console.log('Add IW content complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
