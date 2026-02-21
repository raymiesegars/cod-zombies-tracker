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
  const LOCKSMITH_VIDEO = 'https://www.youtube.com/embed/NjxUwLRwKSs';
  if (!locksmithEe) {
    locksmithEe = await prisma.easterEgg.create({
      data: {
        name: 'Locksmith',
        slug: 'locksmith',
        type: 'MAIN_QUEST',
        mapId: raveMap.id,
        xpReward: 2500,
        description: 'Main quest of Rave in the Redwoods. Obtain the second piece of the Soul Key. Requires power, boat engine, and projector on Turtle Island.',
        videoEmbedUrl: LOCKSMITH_VIDEO,
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
    if (!locksmithEe.videoEmbedUrl) {
      await prisma.easterEgg.update({
        where: { id: locksmithEe.id },
        data: { videoEmbedUrl: LOCKSMITH_VIDEO },
      });
      console.log('Updated Locksmith Easter Egg with video');
    }
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

  // ——— Shaolin Shuffle ———
  const shaolinRoundCap = getRoundCapForMap('shaolin-shuffle', 'IW') ?? null;
  let shaolinMap = await prisma.map.findFirst({
    where: { slug: 'shaolin-shuffle', gameId: iwGame.id },
  });
  if (!shaolinMap) {
    shaolinMap = await prisma.map.create({
      data: {
        name: 'Shaolin Shuffle',
        slug: 'shaolin-shuffle',
        gameId: iwGame.id,
        isDlc: false,
        order: 3,
        imageUrl: '/images/maps/shaolin-shuffle.webp',
        roundCap: shaolinRoundCap,
        description: '1970s New York kung fu and disco. Recover the third piece of the Soul Key and clear the rat infestation in the Pest Control main quest.',
      },
    });
    console.log('Created Shaolin Shuffle map');
  } else {
    console.log('Shaolin Shuffle map already exists');
  }

  let shaolinChallengesCreated = 0;
  for (const info of allChallengeInfos) {
    const exists = await prisma.challenge.findFirst({
      where: { mapId: shaolinMap.id, slug: info.slug },
    });
    if (!exists) {
      await prisma.challenge.create({
        data: {
          name: info.name,
          slug: info.slug,
          type: info.type,
          mapId: shaolinMap.id,
          xpReward: 0,
          description: info.description,
        },
      });
      shaolinChallengesCreated++;
    }
  }
  if (shaolinChallengesCreated > 0) console.log(`Created ${shaolinChallengesCreated} challenges for Shaolin Shuffle`);

  const PEST_CONTROL_VIDEO = 'https://www.youtube.com/embed/6ipByM44x28';
  const PEST_CONTROL_STEPS = [
    { order: 1, label: 'To Prove Worthy: Complete first Skating Diva wave, speak to Pam Grier. Use the four sake gourds in Black Cat Dojo; complete first level to unlock Shuriken.' },
    { order: 2, label: 'Rat Cages: Use shuriken to smash rat crates around the map, follow the rat to each cage and smash it. Yellow ring spawns; kill 5–10 zombies (with a zombie in ring). Kill Ninja Zombies, pick up key.' },
    { order: 3, label: 'Chinese Symbols: Open the locker with symbols in the second subway. Shoot the left symbol on the brick building (Dojo), then the symbol in Inferno Club bathroom, then the first two symbols by the Volk.' },
    { order: 4, label: 'First Rat King: Interact with orange Rat King symbol in front of Black Cat Dojo. Shoot Rat King until he drops the green eyeball; take it to Pam.' },
    { order: 5, label: 'Dragon Symbols & Morse: Use the eye (Vision Pulse style) to find orange dragon symbols (13 locations); shoot 6. Answer the gray ringing phone in the subway for Morse code; translate to a 3-digit number and find the Nightmare Summer poster with that film number.' },
    { order: 6, label: 'Rooftop Cipher: Place poster on spotlight on Inferno roof. Destroy the window with the X. Kill Ninja Zombies; use the six rooftop symbols to spell a word (gong when correct).' },
    { order: 7, label: 'Second Rat King: Interact with symbol by RPR Evo on roof. Shoot Rat King for the brain; bring to Pam.' },
    { order: 8, label: 'Missing Reel: Three rounds after talking to Pam, film burns and you spawn at Dojo with zombies and fire blocking exits. Kill all zombies; pick up turnstile part and insert it in the first subway.' },
    { order: 9, label: 'Yellow Rings: From scaffolding by Karma-45, shoot the symbol in the window above Heebie Jeebies to spawn a ring. Kill zombies in the ring (you and a zombie inside) five more times at the spawned ring locations.' },
    { order: 10, label: 'Disco Zombie: Interact with turntable in DJ booth (Inferno). Kill the disco zombie while another zombie is on the dance floor; keep passing the ball until gong.' },
    { order: 11, label: 'Third Rat King: Interact with symbol by Pink Cat. Shoot Rat King for the heart (lethal grenade).' },
    { order: 12, label: 'Final Rat King: Talk to Pam, enter Rat King\'s lair in the sewers. Shoot him until he retreats. Complete three stages in any order (heart = clear acid; brain = blue zombies destroy it; eyeball = shoot revealed symbols). Fight Rat King between each; then kill him and collect the third Soul Key piece.' },
  ];
  let pestControlEe = await prisma.easterEgg.findFirst({
    where: { mapId: shaolinMap.id, slug: 'pest-control' },
  });
  if (!pestControlEe) {
    pestControlEe = await prisma.easterEgg.create({
      data: {
        name: 'Pest Control',
        slug: 'pest-control',
        type: 'MAIN_QUEST',
        mapId: shaolinMap.id,
        xpReward: 2500,
        description: 'Main quest of Shaolin Shuffle. Recover the third piece of the Soul Key and clear the rat infestation. Requires Shuriken and Pam Grier\'s tasks.',
        videoEmbedUrl: PEST_CONTROL_VIDEO,
      },
    });
    await prisma.easterEggStep.createMany({
      data: PEST_CONTROL_STEPS.map((s) => ({
        easterEggId: pestControlEe!.id,
        order: s.order,
        label: s.label,
        imageUrl: null,
        buildableReferenceSlug: null,
      })),
    });
    console.log(`Created Pest Control Easter Egg (${PEST_CONTROL_STEPS.length} steps)`);
  } else {
    if (!pestControlEe.videoEmbedUrl) {
      await prisma.easterEgg.update({
        where: { id: pestControlEe.id },
        data: { videoEmbedUrl: PEST_CONTROL_VIDEO },
      });
      console.log('Updated Pest Control Easter Egg with video');
    }
    console.log('Pest Control Easter Egg already exists');
  }

  const shaolinWithChallenges = await prisma.map.findUnique({
    where: { id: shaolinMap.id },
    include: { game: { select: { shortName: true } }, challenges: { where: { isActive: true } } },
  });
  if (shaolinWithChallenges) {
    const defs = getMapAchievementDefinitions(
      shaolinWithChallenges.slug,
      shaolinWithChallenges.roundCap,
      shaolinWithChallenges.game?.shortName ?? 'IW'
    );
    const shaolinChallengesByType = Object.fromEntries(shaolinWithChallenges.challenges.map((c) => [c.type, c]));
    let shaolinAchievementsCreated = 0;
    for (const def of defs) {
      const criteria = def.criteria as { round?: number; challengeType?: string };
      const challengeId = criteria.challengeType
        ? shaolinChallengesByType[criteria.challengeType as keyof typeof shaolinChallengesByType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: shaolinMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: shaolinMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'ROUND_MILESTONE' | 'CHALLENGE_COMPLETE' | 'EASTER_EGG_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        shaolinAchievementsCreated++;
      }
    }
    if (shaolinAchievementsCreated > 0) console.log(`Created ${shaolinAchievementsCreated} map achievements for Shaolin Shuffle`);
  }

  const shaolinSpeedrunDefs = getSpeedrunAchievementDefinitions('shaolin-shuffle', 'IW');
  if (shaolinSpeedrunDefs.length > 0 && shaolinWithChallenges) {
    const shaolinChallengesByType = Object.fromEntries(shaolinWithChallenges.challenges.map((c) => [c.type, c]));
    let shaolinSpeedrunCreated = 0;
    for (const def of shaolinSpeedrunDefs) {
      const criteria = def.criteria as { challengeType?: string };
      const challengeId = criteria.challengeType
        ? (shaolinChallengesByType as Record<string, { id: string }>)[criteria.challengeType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: shaolinMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: shaolinMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'CHALLENGE_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        shaolinSpeedrunCreated++;
      } else if (existing.xpReward !== def.xpReward) {
        await prisma.achievement.update({
          where: { id: existing.id },
          data: { xpReward: def.xpReward },
        });
      }
    }
    if (shaolinSpeedrunCreated > 0) console.log(`Created ${shaolinSpeedrunCreated} speedrun achievements for Shaolin Shuffle`);
  }

  const pestControlEeForAchievement = await prisma.easterEgg.findFirst({
    where: { mapId: shaolinMap.id, slug: 'pest-control' },
  });
  const pestControlAchievementExists = pestControlEeForAchievement
    ? await prisma.achievement.findFirst({ where: { easterEggId: pestControlEeForAchievement.id } })
    : null;
  if (!pestControlAchievementExists && pestControlEeForAchievement && (pestControlEeForAchievement.xpReward ?? 0) > 0) {
    await prisma.achievement.create({
      data: {
        mapId: shaolinMap.id,
        easterEggId: pestControlEeForAchievement.id,
        name: pestControlEeForAchievement.name,
        slug: 'pest-control',
        type: 'EASTER_EGG_COMPLETE',
        rarity: 'LEGENDARY',
        xpReward: pestControlEeForAchievement.xpReward ?? 2500,
        criteria: {},
      },
    });
    console.log('Created Pest Control achievement');
  }

  // ——— Attack of the Radioactive Thing ———
  const aotrtRoundCap = getRoundCapForMap('attack-of-the-radioactive-thing', 'IW') ?? null;
  let aotrtMap = await prisma.map.findFirst({
    where: { slug: 'attack-of-the-radioactive-thing', gameId: iwGame.id },
  });
  if (!aotrtMap) {
    aotrtMap = await prisma.map.create({
      data: {
        name: 'Attack of the Radioactive Thing',
        slug: 'attack-of-the-radioactive-thing',
        gameId: iwGame.id,
        isDlc: false,
        order: 4,
        imageUrl: '/images/maps/attack-of-the-radioactive-thing.webp',
        roundCap: aotrtRoundCap,
        description: 'A 50s beach town and drive-in. Recover the fourth piece of the Soul Key in the Soul-Less main quest by building the chemical station, creating the right compound, and defeating the Radioactive Thing.',
      },
    });
    console.log('Created Attack of the Radioactive Thing map');
  } else {
    console.log('Attack of the Radioactive Thing map already exists');
  }

  let aotrtChallengesCreated = 0;
  for (const info of allChallengeInfos) {
    const exists = await prisma.challenge.findFirst({
      where: { mapId: aotrtMap.id, slug: info.slug },
    });
    if (!exists) {
      await prisma.challenge.create({
        data: {
          name: info.name,
          slug: info.slug,
          type: info.type,
          mapId: aotrtMap.id,
          xpReward: 0,
          description: info.description,
        },
      });
      aotrtChallengesCreated++;
    }
  }
  if (aotrtChallengesCreated > 0) console.log(`Created ${aotrtChallengesCreated} challenges for Attack of the Radioactive Thing`);

  const SOULLESS_VIDEO = 'https://www.youtube.com/embed/0KMioQ-3d_k';
  const SOULLESS_STEPS = [
    { order: 1, label: 'Acquiring the Key: Collect zombie body parts (head in RV via Projection Room; torso in freezer at beach market; arms at trailer park fire pit and beach power switch with Seismic Wave Generator; legs from Radioactive Soldier with Cleaver and from tree by Racin\' Stripes with explosive). Bring parts to green gurney in spawn. Collect Elvira\'s mirror (when she\'s off couch), car mirror (crashed white car, crowbar), broken mirror (Restrooms trailer park), punch card (Ice Cream shop). Place mirrors and punch card; input five-digit code from Extinction reels (left two, floor, right two; digits 3,4,5,6,8; last digit always 8). Use ray gun to turn corpse into zombie, then same code backwards to turn zombie into key.' },
    { order: 2, label: 'Building the Chemical Station: Use key to open garage at Gas Station. Collect three parts: back office of market (couch), hill from beach to trailer park (bench), trailer park next to open RV (bench). Build chemical station on work table in garage.' },
    { order: 3, label: 'Acquiring Nuclear Bomb Parts and Codes: Collect three bomb parts: under red car between Motel and TV Station; by door Racin\' Stripes to TV Station; under wooden bridge on beach. Memorize four-digit code under desk in Beachside Market office. Melee four pressure gauges with Crowbar to match code (power switch near Blue Bolts; next to Quickies; Motel room behind Bombstoppers; behind Gas Station). Open safe in market office for Nuclear Codes.' },
    { order: 4, label: 'Changing the Color Filter: Find m-looking symbol number in Motel Office above couch with radio. Find correct O-looking symbol (one of four: under concrete bridge, RV from Projection Room, back of market office above fridge, Gas Station door). Change color to red and green; the O that keeps the equal sign in all three colors is correct. Eye number = O × M. Check Elvira\'s TV and stick to that color for next steps.' },
    { order: 5, label: 'Creating the Right Compound: Listen to two radios (battery from backpack zombies): power switch area and Motel office. One of four compounds: 1/3/5-Tetra-Nitra-Phenol, 3-Methyl-2 4-Di Nitrobenzen, 3/4-Di-Nitroxy-Methyl-Propane, Octa-Hydro-2 5-Nitro-3 4/7-Para-Zocine. Use chalkboards (spawn, beach, trailer park, outside TV station, behind market, chemical station) for diamond numbers; input = sum of ingredients minus O number. Create compound at chemical station from household items; add compound and bomb parts to atomic bomb in garage.' },
    { order: 6, label: 'Defeating the Radioactive Thing: Pick up book pages in chemical station; interact with bomb to teleport. Escort bomb (Radioactive Thing attacks with fireballs and Crogs). After escort, boss devours bomb and attacks with laser or ground slam. Use Death Ray cannons on chest weak spot. After enough damage, interact with carrier cart; survive acid and Crogs under bridge. Pass laser maze and interact with cart in time limit. Enter Nuclear Codes (typewriter style) inside the boss. All players enter code to finish; first-try success awards Belly of the Beast.' },
  ];
  let soullessEe = await prisma.easterEgg.findFirst({
    where: { mapId: aotrtMap.id, slug: 'soul-less' },
  });
  if (!soullessEe) {
    soullessEe = await prisma.easterEgg.create({
      data: {
        name: 'Soul-Less',
        slug: 'soul-less',
        type: 'MAIN_QUEST',
        mapId: aotrtMap.id,
        xpReward: 2500,
        description: 'Main quest for Attack of the Radioactive Thing. Collect the fourth piece of the Soul Key by building the chemical station, acquiring nuclear bomb parts and codes, creating the correct compound, and defeating the Radioactive Thing. Achievable in solo or co-op.',
        videoEmbedUrl: SOULLESS_VIDEO,
        rewardsDescription: 'Soul Key piece, Soul-Less achievement. First-try code entry: Belly of the Beast achievement.',
      },
    });
    await prisma.easterEggStep.createMany({
      data: SOULLESS_STEPS.map((s) => ({
        easterEggId: soullessEe!.id,
        order: s.order,
        label: s.label,
        imageUrl: null,
        buildableReferenceSlug: null,
      })),
    });
    console.log(`Created Soul-Less Easter Egg (${SOULLESS_STEPS.length} steps)`);
  } else {
    if (!soullessEe.videoEmbedUrl) {
      await prisma.easterEgg.update({
        where: { id: soullessEe.id },
        data: { videoEmbedUrl: SOULLESS_VIDEO },
      });
      console.log('Updated Soul-Less Easter Egg with video');
    }
    console.log('Soul-Less Easter Egg already exists');
  }

  const aotrtWithChallenges = await prisma.map.findUnique({
    where: { id: aotrtMap.id },
    include: { game: { select: { shortName: true } }, challenges: { where: { isActive: true } } },
  });
  if (aotrtWithChallenges) {
    const defs = getMapAchievementDefinitions(
      aotrtWithChallenges.slug,
      aotrtWithChallenges.roundCap,
      aotrtWithChallenges.game?.shortName ?? 'IW'
    );
    const aotrtChallengesByType = Object.fromEntries(aotrtWithChallenges.challenges.map((c) => [c.type, c]));
    let aotrtAchievementsCreated = 0;
    for (const def of defs) {
      const criteria = def.criteria as { round?: number; challengeType?: string };
      const challengeId = criteria.challengeType
        ? aotrtChallengesByType[criteria.challengeType as keyof typeof aotrtChallengesByType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: aotrtMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: aotrtMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'ROUND_MILESTONE' | 'CHALLENGE_COMPLETE' | 'EASTER_EGG_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        aotrtAchievementsCreated++;
      }
    }
    if (aotrtAchievementsCreated > 0) console.log(`Created ${aotrtAchievementsCreated} map achievements for Attack of the Radioactive Thing`);
  }

  const aotrtSpeedrunDefs = getSpeedrunAchievementDefinitions('attack-of-the-radioactive-thing', 'IW');
  if (aotrtSpeedrunDefs.length > 0 && aotrtWithChallenges) {
    const aotrtChallengesByType = Object.fromEntries(aotrtWithChallenges.challenges.map((c) => [c.type, c]));
    let aotrtSpeedrunCreated = 0;
    for (const def of aotrtSpeedrunDefs) {
      const criteria = def.criteria as { challengeType?: string };
      const challengeId = criteria.challengeType
        ? (aotrtChallengesByType as Record<string, { id: string }>)[criteria.challengeType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: aotrtMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: aotrtMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'CHALLENGE_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        aotrtSpeedrunCreated++;
      } else if (existing.xpReward !== def.xpReward) {
        await prisma.achievement.update({
          where: { id: existing.id },
          data: { xpReward: def.xpReward },
        });
      }
    }
    if (aotrtSpeedrunCreated > 0) console.log(`Created ${aotrtSpeedrunCreated} speedrun achievements for Attack of the Radioactive Thing`);
  }

  const soullessEeForAchievement = await prisma.easterEgg.findFirst({
    where: { mapId: aotrtMap.id, slug: 'soul-less' },
  });
  const soullessAchievementExists = soullessEeForAchievement
    ? await prisma.achievement.findFirst({ where: { easterEggId: soullessEeForAchievement.id } })
    : null;
  if (!soullessAchievementExists && soullessEeForAchievement && (soullessEeForAchievement.xpReward ?? 0) > 0) {
    await prisma.achievement.create({
      data: {
        mapId: aotrtMap.id,
        easterEggId: soullessEeForAchievement.id,
        name: soullessEeForAchievement.name,
        slug: 'soul-less',
        type: 'EASTER_EGG_COMPLETE',
        rarity: 'LEGENDARY',
        xpReward: soullessEeForAchievement.xpReward ?? 2500,
        criteria: {},
      },
    });
    console.log('Created Soul-Less achievement');
  }

  // ——— The Beast From Beyond (no Starting Room on this map) ———
  const BEAST_ROUND_CHALLENGE_TYPES = ROUND_CHALLENGE_TYPES.filter((c) => c.type !== 'STARTING_ROOM');
  const BEAST_SPEEDRUN_TYPES = [
    ...IW_SPEEDRUN_TYPES.filter((c) => c.type !== 'ALIENS_BOSS_FIGHT'),
    { type: 'CRYPTID_FIGHT' as const, name: 'Cryptid Fight', slug: 'cryptid-fight', description: 'Defeat the Cryptid swarm boss as fast as possible' },
    { type: 'MEPHISTOPHELES' as const, name: 'Mephistopheles', slug: 'mephistopheles', description: 'Defeat Mephistopheles as fast as possible' },
  ];
  const beastChallengeInfos = [...BEAST_ROUND_CHALLENGE_TYPES, ...BEAST_SPEEDRUN_TYPES];

  const beastRoundCap = getRoundCapForMap('the-beast-from-beyond', 'IW') ?? null;
  let beastMap = await prisma.map.findFirst({
    where: { slug: 'the-beast-from-beyond', gameId: iwGame.id },
  });
  if (!beastMap) {
    beastMap = await prisma.map.create({
      data: {
        name: 'The Beast From Beyond',
        slug: 'the-beast-from-beyond',
        gameId: iwGame.id,
        isDlc: false,
        order: 5,
        imageUrl: '/images/maps/the-beast-from-beyond.webp',
        roundCap: beastRoundCap,
        description: 'A military base and cinema overrun by Cryptids. Collect the fifth and final piece of the Soul Key in The End? main quest. With Director\'s Cut and Talisman Mask completed, face Mephistopheles.',
      },
    });
    console.log('Created The Beast From Beyond map');
  } else {
    console.log('The Beast From Beyond map already exists');
  }

  let beastChallengesCreated = 0;
  for (const info of beastChallengeInfos) {
    const exists = await prisma.challenge.findFirst({
      where: { mapId: beastMap.id, slug: info.slug },
    });
    if (!exists) {
      await prisma.challenge.create({
        data: {
          name: info.name,
          slug: info.slug,
          type: info.type,
          mapId: beastMap.id,
          xpReward: 0,
          description: info.description,
        },
      });
      beastChallengesCreated++;
    }
  }
  if (beastChallengesCreated > 0) console.log(`Created ${beastChallengesCreated} challenges for The Beast From Beyond`);

  const THE_END_VIDEO = 'https://www.youtube.com/embed/G8wRsZNLPTY';
  const THE_END_STEPS = [
    { order: 1, label: 'Powering the Station: Reach the Ops Center and jump down the hole to the ledge with the Tuff \'N Nuff machine. Proceed to N31L\'s head on the ground, take it to spawn and put it into the terminal.' },
    { order: 2, label: 'Obtain the Disks: First Disk from the first Phantom killed (Projector Room first entry or Round 10). Second Disk by the left side of the Projector Room portal. Get the Entangler. Third Disk: room with Proteus and fuse box, use Entangler on the ground when the Disk is visible, throw it into the smoke; Disk appears at a vent. Fourth Disk: Spawn, use Entangler on Astronaut Helmet, carry to the dead Cryptid room, throw helmet at green monitor to lower the wall; Disk is by a table.' },
    { order: 3, label: 'Enter the Disks: Match symbol order from papers (spawn ladder area left-to-right; Up \'N Atoms top-to-bottom; Cafe table left-to-right or top-to-bottom; Computer Room near red Venom-X buttons top-to-bottom). Insert Disks at N31L\'s terminal in that order (first symbol that matches a Disk shape). Wrong order spawns Cryptids and resets Disks.' },
    { order: 4, label: 'Hacking N31L: When N31L goes crazy, go to the real-life Theater. Right of the lampshade at the map border is a button on the wall. Use Entangler to take it to the Afterlife Arcade and throw it into the "The Beast From Beyond" poster. Find the button under the table in the dead Cryptid room. Push it to enable dials; set vertical dials to horizontal or all horizontal to vertical.' },
    { order: 5, label: "Moving N31L's Head: When N31L shows the happy face, grab him with the Entangler and carry him up to the Projector Room portal (doors open and close; wrong move can nuke zombies). Put his head inside the monitor; interact to teleport to the boss room." },
    { order: 6, label: "The Cryptid Swarm: N31L shoots containers—first four free Cryptid Rhinos. After the third Rhino, an opening to the back appears. After the fourth, rest. Portals turn on and Cryptid Scouts spawn; clear the swarm to open more area. Cryptid Phantoms appear. Use Sentry Guns and ammo box. Second swarm done: Rhinos from portals and N31L shoots at you. Three terminals turn on—turn them off in time. Third swarm (countdown 99 to 0 on a terminal); when countdown ends, interact with central terminal. Two Cryptid Mammoths spawn (high HP, fire ground). Defeat them to complete the Easter Egg." },
  ];
  let theEndEe = await prisma.easterEgg.findFirst({
    where: { mapId: beastMap.id, slug: 'the-end' },
  });
  if (!theEndEe) {
    theEndEe = await prisma.easterEgg.create({
      data: {
        name: 'The End?',
        slug: 'the-end',
        type: 'MAIN_QUEST',
        mapId: beastMap.id,
        xpReward: 2500,
        description: 'Main quest for The Beast From Beyond. Collect the fifth and final piece of the Soul Key by powering N31L, obtaining and entering the Disks, hacking N31L, moving his head to the Projector Room, and surviving the Cryptid swarm. With Director\'s Cut and Talisman Mask done, you can face Mephistopheles.',
        videoEmbedUrl: THE_END_VIDEO,
        rewardsDescription: 'Soul Key piece, The End? achievement. With Director\'s Cut + Talisman Mask: Mephistopheles boss fight.',
      },
    });
    await prisma.easterEggStep.createMany({
      data: THE_END_STEPS.map((s) => ({
        easterEggId: theEndEe!.id,
        order: s.order,
        label: s.label,
        imageUrl: null,
        buildableReferenceSlug: null,
      })),
    });
    console.log(`Created The End? Easter Egg (${THE_END_STEPS.length} steps)`);
  } else {
    if (!theEndEe.videoEmbedUrl) {
      await prisma.easterEgg.update({
        where: { id: theEndEe.id },
        data: { videoEmbedUrl: THE_END_VIDEO },
      });
      console.log('Updated The End? Easter Egg with video');
    }
    console.log('The End? Easter Egg already exists');
  }

  const beastWithChallenges = await prisma.map.findUnique({
    where: { id: beastMap.id },
    include: { game: { select: { shortName: true } }, challenges: { where: { isActive: true } } },
  });
  if (beastWithChallenges) {
    const defs = getMapAchievementDefinitions(
      beastWithChallenges.slug,
      beastWithChallenges.roundCap,
      beastWithChallenges.game?.shortName ?? 'IW'
    );
    const beastChallengesByType = Object.fromEntries(beastWithChallenges.challenges.map((c) => [c.type, c]));
    let beastAchievementsCreated = 0;
    for (const def of defs) {
      const criteria = def.criteria as { round?: number; challengeType?: string };
      const challengeId = criteria.challengeType
        ? beastChallengesByType[criteria.challengeType as keyof typeof beastChallengesByType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: beastMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: beastMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'ROUND_MILESTONE' | 'CHALLENGE_COMPLETE' | 'EASTER_EGG_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        beastAchievementsCreated++;
      }
    }
    if (beastAchievementsCreated > 0) console.log(`Created ${beastAchievementsCreated} map achievements for The Beast From Beyond`);
  }

  const beastSpeedrunDefs = getSpeedrunAchievementDefinitions('the-beast-from-beyond', 'IW');
  if (beastSpeedrunDefs.length > 0 && beastWithChallenges) {
    const beastChallengesByType = Object.fromEntries(beastWithChallenges.challenges.map((c) => [c.type, c]));
    let beastSpeedrunCreated = 0;
    for (const def of beastSpeedrunDefs) {
      const criteria = def.criteria as { challengeType?: string };
      const challengeId = criteria.challengeType
        ? (beastChallengesByType as Record<string, { id: string }>)[criteria.challengeType]?.id
        : null;
      const existing = await prisma.achievement.findFirst({
        where: { mapId: beastMap.id, slug: def.slug },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            mapId: beastMap.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'CHALLENGE_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: challengeId ?? undefined,
          },
        });
        beastSpeedrunCreated++;
      } else if (existing.xpReward !== def.xpReward) {
        await prisma.achievement.update({
          where: { id: existing.id },
          data: { xpReward: def.xpReward },
        });
      }
    }
    if (beastSpeedrunCreated > 0) console.log(`Created ${beastSpeedrunCreated} speedrun achievements for The Beast From Beyond`);
  }

  const theEndEeForAchievement = await prisma.easterEgg.findFirst({
    where: { mapId: beastMap.id, slug: 'the-end' },
  });
  const theEndAchievementExists = theEndEeForAchievement
    ? await prisma.achievement.findFirst({ where: { easterEggId: theEndEeForAchievement.id } })
    : null;
  if (!theEndAchievementExists && theEndEeForAchievement && (theEndEeForAchievement.xpReward ?? 0) > 0) {
    await prisma.achievement.create({
      data: {
        mapId: beastMap.id,
        easterEggId: theEndEeForAchievement.id,
        name: theEndEeForAchievement.name,
        slug: 'the-end',
        type: 'EASTER_EGG_COMPLETE',
        rarity: 'LEGENDARY',
        xpReward: theEndEeForAchievement.xpReward ?? 2500,
        criteria: {},
      },
    });
    console.log('Created The End? achievement');
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
