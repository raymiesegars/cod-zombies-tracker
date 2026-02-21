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

  // ——— Rave in the Redwoods ———
  const raveRoundCap = getRoundCapForMap('rave-in-the-redwoods', 'IW') ?? null;
  let raveMap = await prisma.map.findFirst({
    where: { slug: 'rave-in-the-redwoods', gameId: iwGame.id },
  });
  if (!raveMap) {
    raveMap = await prisma.map.create({
      data: {
        name: 'Rave in the Redwoods',
        slug: 'rave-in-the-redwoods',
        gameId: iwGame.id,
        isDlc: false,
        order: 2,
        imageUrl: '/images/maps/rave-in-the-redwoods.webp',
        roundCap: raveRoundCap,
        description: 'A campground and rave in the redwoods. Obtain the second piece of the Soul Key in the Locksmith main quest.',
      },
    });
    console.log('Created Rave in the Redwoods map');
  } else {
    console.log('Rave in the Redwoods map already exists');
  }

  let raveChallengesCreated = 0;
  for (const info of allChallengeInfos) {
    const exists = await prisma.challenge.findFirst({
      where: { mapId: raveMap.id, slug: info.slug },
    });
    if (!exists) {
      await prisma.challenge.create({
        data: {
          name: info.name,
          slug: info.slug,
          type: info.type,
          mapId: raveMap.id,
          xpReward: 0,
          description: info.description,
        },
      });
      raveChallengesCreated++;
    }
  }
  if (raveChallengesCreated > 0) console.log(`Created ${raveChallengesCreated} challenges for Rave in the Redwoods`);

  const LOCKSMITH_STEPS = [
    { order: 1, label: 'Turn on power, build the boat engine (parts: Bear Lodge mess hall, Recreation Area keg stall, Bear Lodge bunk room after power), fix projector on Turtle Island.' },
    { order: 2, label: 'Take boat to Turtle Island; meet Kevin Smith. Pick up first torn photo part in Recreation Area (behind zombie effigy).' },
    { order: 3, label: 'Place photo in Thunderbird Amphitheater (between damaged tree and tents). In Rave mode, shoot off 10 zombie arms near the picture; kill Slasher and take photo (Jason Mewes).' },
    { order: 4, label: 'Second photo part in Bunk Room (near Tuff \'Nuff). Place in Recreation Area rave; kill 10 crawlers near picture, kill Slasher, take photo (Kevin). Take to Kevin.' },
    { order: 5, label: 'Interact with crumpled skeleton in Bear Cabin basement (near Old Marvin Mine exit); take skull to White Tail Beach. Get headshot kills near skull; kill Slasher, take skull; Kevin leaves. Press button in Bear Cabin basement.' },
    { order: 6, label: 'Ride boat to Turtle Island; Kevin reveals he killed Jason and becomes the Slasher. In Rave mode fill orbs, lure Slasher into circle and shoot glowing spots; enter green circles to survive (x3). Defeat Slasher and collect the second Soul Key piece.' },
  ];
  let locksmithEe = await prisma.easterEgg.findFirst({
    where: { mapId: raveMap.id, slug: 'locksmith' },
  });
  if (!locksmithEe) {
    locksmithEe = await prisma.easterEgg.create({
      data: {
        name: 'Locksmith',
        slug: 'locksmith',
        type: 'MAIN_QUEST',
        mapId: raveMap.id,
        xpReward: 2500,
        description: 'Main quest of Rave in the Redwoods. Obtain the second piece of the Soul Key. Requires power, boat engine, and projector on Turtle Island.',
      },
    });
    await prisma.easterEggStep.createMany({
      data: LOCKSMITH_STEPS.map((s) => ({
        easterEggId: locksmithEe!.id,
        order: s.order,
        label: s.label,
        imageUrl: null,
        buildableReferenceSlug: null,
      })),
    });
    console.log(`Created Locksmith Easter Egg (${LOCKSMITH_STEPS.length} steps)`);
  } else {
    console.log('Locksmith Easter Egg already exists');
  }

  const raveWithChallenges = await prisma.map.findUnique({
    where: { id: raveMap.id },
    include: { game: { select: { shortName: true } }, challenges: { where: { isActive: true } } },
  });
  if (raveWithChallenges) {
    const defs = getMapAchievementDefinitions(
      raveWithChallenges.slug,
      raveWithChallenges.roundCap,
      raveWithChallenges.game?.shortName ?? 'IW'
    );
    const raveChallengesByType = Object.fromEntries(raveWithChallenges.challenges.map((c) => [c.type, c]));
    let raveAchievementsCreated = 0;
    for (const def of defs) {
      const criteria = def.criteria as { round?: number; challengeType?: string };
      const challengeId = criteria.challengeType
        ? raveChallengesByType[criteria.challengeType as keyof typeof raveChallengesByType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: raveMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: raveMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'ROUND_MILESTONE' | 'CHALLENGE_COMPLETE' | 'EASTER_EGG_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        raveAchievementsCreated++;
      }
    }
    if (raveAchievementsCreated > 0) console.log(`Created ${raveAchievementsCreated} map achievements for Rave in the Redwoods`);
  }

  const raveSpeedrunDefs = getSpeedrunAchievementDefinitions('rave-in-the-redwoods', 'IW');
  if (raveSpeedrunDefs.length > 0 && raveWithChallenges) {
    const raveChallengesByType = Object.fromEntries(raveWithChallenges.challenges.map((c) => [c.type, c]));
    let raveSpeedrunCreated = 0;
    for (const def of raveSpeedrunDefs) {
      const criteria = def.criteria as { challengeType?: string };
      const challengeId = criteria.challengeType
        ? (raveChallengesByType as Record<string, { id: string }>)[criteria.challengeType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: raveMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: raveMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'CHALLENGE_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        raveSpeedrunCreated++;
      } else if (existing.xpReward !== def.xpReward) {
        await prisma.achievement.update({
          where: { id: existing.id },
          data: { xpReward: def.xpReward },
        });
      }
    }
    if (raveSpeedrunCreated > 0) console.log(`Created ${raveSpeedrunCreated} speedrun achievements for Rave in the Redwoods`);
  }

  const locksmithEeForAchievement = await prisma.easterEgg.findFirst({
    where: { mapId: raveMap.id, slug: 'locksmith' },
  });
  const locksmithAchievementExists = locksmithEeForAchievement
    ? await prisma.achievement.findFirst({ where: { easterEggId: locksmithEeForAchievement.id } })
    : null;
  if (!locksmithAchievementExists && locksmithEeForAchievement && (locksmithEeForAchievement.xpReward ?? 0) > 0) {
    await prisma.achievement.create({
      data: {
        mapId: raveMap.id,
        easterEggId: locksmithEeForAchievement.id,
        name: locksmithEeForAchievement.name,
        slug: 'locksmith',
        type: 'EASTER_EGG_COMPLETE',
        rarity: 'LEGENDARY',
        xpReward: locksmithEeForAchievement.xpReward ?? 2500,
        criteria: {},
      },
    });
    console.log('Created Locksmith achievement');
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
