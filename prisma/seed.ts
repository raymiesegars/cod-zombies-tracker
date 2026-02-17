import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { RANKS, getRankIconPath } from '../src/lib/ranks';
import { getMapAchievementDefinitions, getEasterEggAchievementDefinition } from '../src/lib/achievements/seed-achievements';
import { getRoundCapForMap } from '../src/lib/achievements/map-round-config';
import { MAIN_QUEST_MAP_SLUGS } from './main-quest-map-slugs';

// Load .env then .env.local (same order as Next.js) so seed uses the SAME DB as the app
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

// Use direct URL for seeding to avoid connection pooler issues (must match app's DIRECT_URL)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL and DATABASE_URL. Seed needs the same env as the app (e.g. .env.local).');
    process.exit(1);
  }
  console.log('Seeding database...');

  // Clear existing data for fresh seed using raw SQL for better compatibility
  console.log('Clearing existing data...');
  
  // Delete in correct order to respect foreign key constraints
  await prisma.$executeRaw`TRUNCATE TABLE "UserAchievement" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "UserEasterEggStepProgress" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "MainEasterEggXpAwarded" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "EasterEggLog" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ChallengeLog" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Achievement" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "EasterEggStep" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "EasterEgg" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Challenge" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Map" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Game" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "LevelThreshold" CASCADE`;

  // reset XP/level so rank always matches current achievements
  await prisma.user.updateMany({
    data: { totalXp: 0, level: 1 },
  });

  console.log('Existing data cleared.');

  // Seed Games
  const games = await Promise.all([
    prisma.game.create({
      data: {
        name: 'World at War',
        shortName: 'WAW',
        releaseYear: 2008,
        order: 1,
      },
    }),
    prisma.game.create({
      data: {
        name: 'Black Ops',
        shortName: 'BO1',
        releaseYear: 2010,
        order: 2,
      },
    }),
    prisma.game.create({
      data: {
        name: 'Black Ops II',
        shortName: 'BO2',
        releaseYear: 2012,
        order: 3,
      },
    }),
    prisma.game.create({
      data: {
        name: 'Black Ops III',
        shortName: 'BO3',
        releaseYear: 2015,
        order: 4,
      },
    }),
    prisma.game.create({
      data: {
        name: 'Black Ops 4',
        shortName: 'BO4',
        releaseYear: 2018,
        order: 5,
      },
    }),
    prisma.game.create({
      data: {
        name: 'Black Ops Cold War',
        shortName: 'BOCW',
        releaseYear: 2020,
        order: 6,
      },
    }),
    prisma.game.create({
      data: {
        name: 'Black Ops 6',
        shortName: 'BO6',
        releaseYear: 2024,
        order: 7,
      },
    }),
    prisma.game.create({
      data: {
        name: 'Black Ops 7',
        shortName: 'BO7',
        releaseYear: 2025,
        order: 8,
      },
    }),
  ]);

  const gameMap = new Map(games.map(g => [g.shortName, g]));
  console.log(`Created ${games.length} games`);

  // Map data by game - release order. roundCap is set from map-round-config when creating maps.
  const mapData: Record<string, Array<{
    name: string;
    slug: string;
    isDlc: boolean;
    description?: string;
    hasEasterEgg: boolean;
    order: number;
    imageUrl?: string;
  }>> = {
    WAW: [
      { name: 'Nacht der Untoten', slug: 'nacht-der-untoten', isDlc: false, hasEasterEgg: false, order: 1, description: 'The original. A small abandoned airfield bunker. No perks, no Pack-a-Punch. Pure survival.' },
      { name: 'Verrückt', slug: 'verruckt', isDlc: true, hasEasterEgg: false, order: 2, imageUrl: '/images/maps/verruckt.webp', description: 'A haunted asylum in Berlin. The first map to feature perks and electroshock traps. (Map Pack)' },
      { name: 'Shi No Numa', slug: 'shi-no-numa', isDlc: true, hasEasterEgg: true, order: 3, description: 'A swamp-based Japanese research facility. Introduced hellhounds and the Wunderwaffe DG-2. (Map Pack)' },
      { name: 'Der Riese', slug: 'der-riese', isDlc: true, hasEasterEgg: true, order: 4, description: 'The Giant. A Nazi research facility that introduced Pack-a-Punch and teleporters. (Map Pack)' },
    ],
    BO1: [
      { name: 'Kino der Toten', slug: 'kino-der-toten', isDlc: false, hasEasterEgg: true, order: 1, description: 'An abandoned German theater overrun by the undead. A fan favorite.' },
      { name: 'Five', slug: 'five', isDlc: false, hasEasterEgg: true, order: 2, description: 'The Pentagon is under attack. Play as JFK, Nixon, McNamara, and Castro.' },
      { name: 'Ascension', slug: 'ascension', isDlc: true, hasEasterEgg: true, order: 3, description: 'A Soviet cosmodrome. Introduced PhD Flopper and space monkeys.' },
      { name: 'Call of the Dead', slug: 'call-of-the-dead', isDlc: true, hasEasterEgg: true, order: 4, description: 'A Siberian lighthouse. Features George Romero as a boss zombie.' },
      { name: 'Shangri-La', slug: 'shangri-la', isDlc: true, hasEasterEgg: true, order: 5, description: 'An ancient temple in the Himalayas. One of the hardest Easter Eggs.' },
      { name: 'Moon', slug: 'moon', isDlc: true, hasEasterEgg: true, order: 6, description: 'Area 51 and a secret Nazi moon base. Blow up the Earth!' },
      // Rezurrection DLC (remakes; separate leaderboards, reuse WAW images)
      { name: 'Nacht der Untoten (Rezurrection)', slug: 'bo1-nacht-der-untoten', isDlc: true, hasEasterEgg: false, order: 7, imageUrl: '/images/maps/nacht-der-untoten.webp', description: 'Rezurrection DLC. The original Nacht der Untoten remastered for Black Ops.' },
      { name: 'Verrückt (Rezurrection)', slug: 'bo1-verruckt', isDlc: true, hasEasterEgg: false, order: 8, imageUrl: '/images/maps/verruckt.webp', description: 'Rezurrection DLC. Verrückt remastered for Black Ops.' },
      { name: 'Shi No Numa (Rezurrection)', slug: 'bo1-shi-no-numa', isDlc: true, hasEasterEgg: true, order: 9, imageUrl: '/images/maps/shi-no-numa.webp', description: 'Rezurrection DLC. Shi No Numa remastered for Black Ops.' },
      { name: 'Der Riese (Rezurrection)', slug: 'bo1-der-riese', isDlc: true, hasEasterEgg: true, order: 10, imageUrl: '/images/maps/der-riese.webp', description: 'Rezurrection DLC. Der Riese remastered for Black Ops.' },
    ],
    BO2: [
      { name: 'TranZit', slug: 'tranzit', isDlc: false, hasEasterEgg: true, order: 1, description: 'Travel across post-apocalyptic America on a bus. The most ambitious Zombies map.' },
      { name: 'Bus Depot', slug: 'bus-depot', isDlc: false, hasEasterEgg: false, order: 2, description: 'Survival map at the starting area of TranZit.' },
      { name: 'Farm', slug: 'farm', isDlc: false, hasEasterEgg: false, order: 3, description: 'Survival and Grief map set in the farm area of TranZit.' },
      { name: 'Town', slug: 'town', isDlc: false, hasEasterEgg: false, order: 4, description: 'Survival and Grief map set in the town area of TranZit.' },
      { name: 'Nuketown Zombies', slug: 'nuketown-zombies', isDlc: true, hasEasterEgg: true, order: 5, description: 'Season Pass Bonus or Stand-alone. The iconic multiplayer map, now overrun with zombies.' },
      { name: 'Die Rise', slug: 'die-rise', isDlc: true, hasEasterEgg: true, order: 6, description: 'Revolution DLC. A destroyed skyscraper in Shanghai. Verticality is key.' },
      { name: 'Mob of the Dead', slug: 'mob-of-the-dead', isDlc: true, hasEasterEgg: true, order: 7, description: 'Uprising DLC. Alcatraz prison. Play as mobsters trying to escape purgatory.' },
      { name: 'Buried', slug: 'buried', isDlc: true, hasEasterEgg: true, order: 8, description: 'Vengeance DLC. An underground Wild West town. Features the friendly giant Leroy.' },
      { name: 'Origins', slug: 'origins', isDlc: true, hasEasterEgg: true, order: 9, description: 'Origins is the Apocalypse DLC finale for Black Ops II, set in WWI France where the Primis crew must build the four elemental staffs (Ice, Fire, Wind, Lightning) and free Samantha from the clutches of the Apothicons beneath the excavation site.' },
    ],
    BO3: [
      { name: 'Shadows of Evil', slug: 'shadows-of-evil', isDlc: false, hasEasterEgg: true, order: 1, description: 'A noir 1940s city. Four strangers must stop the Shadowman.' },
      { name: 'The Giant', slug: 'the-giant', isDlc: true, hasEasterEgg: true, order: 2, description: 'A reimagining of Der Riese with updated graphics and mechanics.' },
      { name: 'Der Eisendrache', slug: 'der-eisendrache', isDlc: true, hasEasterEgg: true, order: 3, description: 'Der Eisendrache is a Black Ops III DLC map set in an Austrian castle. The Primis crew must build one of four elemental bows (Wolf, Fire, Void, Lightning) to defeat the Keeper and progress the Origins storyline.' },
      { name: 'Zetsubou No Shima', slug: 'zetsubou-no-shima', isDlc: true, hasEasterEgg: true, order: 4, description: 'A Japanese swamp island. Mutated plants and spiders await.' },
      { name: 'Gorod Krovi', slug: 'gorod-krovi', isDlc: true, hasEasterEgg: true, order: 5, description: 'A war-torn Stalingrad with dragons. The end approaches.' },
      { name: 'Revelations', slug: 'revelations', isDlc: true, hasEasterEgg: true, order: 6, description: 'Revelations is the final, chaotic chapter of the Call of Duty: Black Ops III Origins Zombies saga, where the Primis crew journeys through a cosmic amalgamation of iconic, floating map fragments to battle the Apothicon threat in Agartha.' },
      // Zombie Chronicles DLC (remakes; separate leaderboards, reuse original map images)
      { name: 'Nacht der Untoten (Zombie Chronicles)', slug: 'bo3-nacht-der-untoten', isDlc: true, hasEasterEgg: true, order: 7, imageUrl: '/images/maps/nacht-der-untoten.webp', description: 'Zombie Chronicles. The original Nacht remastered for Black Ops III.' },
      { name: 'Verrückt (Zombie Chronicles)', slug: 'bo3-verruckt', isDlc: true, hasEasterEgg: true, order: 8, imageUrl: '/images/maps/verruckt.webp', description: 'Zombie Chronicles. Verrückt remastered for Black Ops III.' },
      { name: 'Shi No Numa (Zombie Chronicles)', slug: 'bo3-shi-no-numa', isDlc: true, hasEasterEgg: true, order: 9, imageUrl: '/images/maps/shi-no-numa.webp', description: 'Zombie Chronicles. Shi No Numa remastered for Black Ops III.' },
      { name: 'Kino der Toten (Zombie Chronicles)', slug: 'bo3-kino-der-toten', isDlc: true, hasEasterEgg: true, order: 10, imageUrl: '/images/maps/kino-der-toten.webp', description: 'Zombie Chronicles. Kino der Toten remastered for Black Ops III.' },
      { name: 'Ascension (Zombie Chronicles)', slug: 'bo3-ascension', isDlc: true, hasEasterEgg: true, order: 11, imageUrl: '/images/maps/ascension.webp', description: 'Zombie Chronicles. Ascension remastered for Black Ops III.' },
      { name: 'Shangri-La (Zombie Chronicles)', slug: 'bo3-shangri-la', isDlc: true, hasEasterEgg: true, order: 12, imageUrl: '/images/maps/shangri-la.webp', description: 'Zombie Chronicles. Shangri-La remastered for Black Ops III.' },
      { name: 'Moon (Zombie Chronicles)', slug: 'bo3-moon', isDlc: true, hasEasterEgg: true, order: 13, imageUrl: '/images/maps/moon.webp', description: 'Zombie Chronicles. Moon remastered for Black Ops III.' },
      { name: 'Origins (Zombie Chronicles)', slug: 'bo3-origins', isDlc: true, hasEasterEgg: true, order: 14, imageUrl: '/images/maps/origins.webp', description: 'Zombie Chronicles. Origins remastered for Black Ops III.' },
    ],
    BO4: [
      { name: 'Voyage of Despair', slug: 'voyage-of-despair', isDlc: false, hasEasterEgg: true, order: 1, description: 'The Titanic, overrun by the undead. A new story begins.' },
      { name: 'IX', slug: 'ix', isDlc: false, hasEasterEgg: true, order: 2, description: 'A Roman colosseum. Fight as gladiators against zombie hordes.' },
      { name: 'Blood of the Dead', slug: 'blood-of-the-dead', isDlc: false, hasEasterEgg: true, order: 3, description: 'Return to Alcatraz with Richtofen and crew.' },
      { name: 'Classified', slug: 'classified', isDlc: true, hasEasterEgg: true, order: 4, description: 'Back to the Pentagon with Ultimis crew.' },
      { name: 'Dead of the Night', slug: 'dead-of-the-night', isDlc: true, hasEasterEgg: true, order: 5, description: 'A haunted manor. Werewolves and vampires join the undead.' },
      { name: 'Ancient Evil', slug: 'ancient-evil', isDlc: true, hasEasterEgg: true, order: 6, description: 'Ancient Greece and the underworld. Wield godly weapons.' },
      { name: 'Alpha Omega', slug: 'alpha-omega', isDlc: true, hasEasterEgg: true, order: 7, description: 'Nuketown reimagined. Elemental Nova crawlers.' },
      { name: 'Tag der Toten', slug: 'tag-der-toten', isDlc: true, hasEasterEgg: true, order: 8, description: 'The Aether story finale. Call of the Dead reimagined.' },
    ],
    BOCW: [
      { name: 'Die Maschine', slug: 'die-maschine', isDlc: false, hasEasterEgg: true, order: 1, description: 'Nacht der Untoten with a twist. The Dark Aether awaits.' },
      { name: 'Firebase Z', slug: 'firebase-z', isDlc: true, hasEasterEgg: true, order: 2, description: 'A Vietnam outpost. Rescue Samantha Maxis from Omega Group.' },
      { name: 'Outbreak', slug: 'outbreak', isDlc: true, hasEasterEgg: true, order: 3, description: 'Open-world Zombies across the Ural Mountains.' },
      { name: 'Mauer der Toten', slug: 'mauer-der-toten', isDlc: true, hasEasterEgg: true, order: 4, description: 'East Berlin, 1985. Valentina has awakened something terrible.' },
      { name: 'Forsaken', slug: 'forsaken', isDlc: true, hasEasterEgg: true, order: 5, description: 'The finale. Enter the Dark Aether and stop The Forsaken.' },
    ],
    BO6: [
      { name: 'Terminus', slug: 'terminus', isDlc: false, hasEasterEgg: true, order: 1, description: 'Black Ops 6 Zombies. A mysterious island prison facility. Dark secrets lie within.' },
      { name: 'Liberty Falls', slug: 'liberty-falls', isDlc: false, hasEasterEgg: true, order: 2, description: 'Black Ops 6 Zombies. A small American town overrun during a zombie outbreak.' },
      { name: 'Citadelle des Morts', slug: 'citadelle-des-morts', isDlc: true, hasEasterEgg: true, order: 3, description: 'Black Ops 6 Zombies DLC. A haunted medieval castle in France.' },
      { name: 'The Tomb', slug: 'the-tomb', isDlc: true, hasEasterEgg: true, order: 4, description: 'Black Ops 6 Zombies DLC.' },
      { name: 'Shattered Veil', slug: 'shattered-veil', isDlc: true, hasEasterEgg: true, order: 5, description: 'Black Ops 6 Zombies DLC.' },
      { name: 'Reckoning', slug: 'reckoning', isDlc: true, hasEasterEgg: true, order: 6, description: 'Black Ops 6 Zombies DLC.' },
    ],
    BO7: [
      { name: 'Ashes of the Damned', slug: 'ashes-of-the-damned', isDlc: false, hasEasterEgg: true, order: 1, description: 'Black Ops 7 Zombies. Survive the undead.' },
      { name: 'Astra Malorum', slug: 'astra-malorum', isDlc: false, hasEasterEgg: true, order: 2, description: 'Black Ops 7 Zombies. Thurston Observatory and Mars.' },
      { name: 'Mars', slug: 'mars', isDlc: true, hasEasterEgg: false, order: 3, description: 'Black Ops 7 Zombies DLC. Survival map on Mars.', imageUrl: '/images/maps/mars.webp' },
      { name: 'Vandorn Farm', slug: 'vandorn-farm', isDlc: false, hasEasterEgg: true, order: 4, description: 'Black Ops 7 Zombies. Survival map.' },
      { name: 'Exit 115', slug: 'exit-115', isDlc: false, hasEasterEgg: true, order: 5, description: 'Black Ops 7 Zombies. Survival map.' },
      { name: 'Zarya Cosmodrome', slug: 'zarya-cosmodrome', isDlc: false, hasEasterEgg: true, order: 6, description: 'Black Ops 7 Zombies. Survival map. A cosmodrome under siege.' },
    ],
  };

  // Create maps
  const createdMaps: any[] = [];
  
  for (const [gameShortName, maps] of Object.entries(mapData)) {
    const game = gameMap.get(gameShortName);
    if (!game) continue;

    for (const mapInfo of maps) {
      const roundCap = getRoundCapForMap(mapInfo.slug, gameShortName) ?? null;
      const map = await prisma.map.create({
        data: {
          name: mapInfo.name,
          slug: mapInfo.slug,
          gameId: game.id,
          isDlc: mapInfo.isDlc,
          order: mapInfo.order,
          imageUrl: mapInfo.imageUrl ?? `/images/maps/${mapInfo.slug}.webp`,
          roundCap,
          description: mapInfo.description || `Classic Treyarch Zombies map from ${game.name}. Survive waves of the undead and uncover the mysteries within.`,
        },
      });
      createdMaps.push({ ...map, hasEasterEgg: mapInfo.hasEasterEgg });
    }
  }

  console.log(`Created ${createdMaps.length} maps`);

  // Create challenges for each map
  const challengeTypes = [
    { type: 'HIGHEST_ROUND', name: 'Highest Round', description: 'Reach the highest round possible' },
    { type: 'NO_DOWNS', name: 'No Downs', description: 'Survive without going down' },
    { type: 'NO_PERKS', name: 'No Perks', description: 'Survive without purchasing any perks' },
    { type: 'NO_PACK', name: 'No Pack-a-Punch', description: 'Survive without using Pack-a-Punch' },
    { type: 'STARTING_ROOM', name: 'Starting Room Only', description: 'Never leave the starting room' },
    { type: 'ONE_BOX', name: 'One Box Challenge', description: 'Only hit the mystery box once' },
    { type: 'PISTOL_ONLY', name: 'Pistol Only', description: 'Only use your starting pistol' },
    { type: 'NO_POWER', name: 'No Power', description: 'Never turn on the power' },
  ];

  let challengeCount = 0;
  
  for (const map of createdMaps) {
    for (const challengeInfo of challengeTypes) {
      await prisma.challenge.create({
        data: {
          name: challengeInfo.name,
          slug: challengeInfo.type.toLowerCase().replace(/_/g, '-'),
          type: challengeInfo.type as any,
          mapId: map.id,
          xpReward: 0, // XP is now calculated dynamically
          description: challengeInfo.description,
        },
      });
      challengeCount++;
    }
  }

  console.log(`Created ${challengeCount} challenges`);

  // Create Main Quest placeholders only for maps that have a real main EE (not for maps with only side/musical EEs like Kino)
  let eeCount = 0;
  for (const map of createdMaps) {
    if (MAIN_QUEST_MAP_SLUGS.has(map.slug)) {
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
      eeCount++;
    }
  }

  console.log(`Created ${eeCount} Easter Eggs`);

  // Create specific Easter Eggs (musical, side, etc.) with steps — by map slug
  const nachtWaw = await prisma.map.findFirst({ where: { slug: 'nacht-der-untoten', gameId: gameMap.get('WAW')!.id } });
  if (nachtWaw) {
    const musicRadio = await prisma.easterEgg.create({
      data: {
        name: 'Music Radio',
        slug: 'music-radio',
        type: 'MUSICAL',
        mapId: nachtWaw.id,
        xpReward: 0,
        description: 'A radio in the Help! room plays music when knifed or shot. In World at War it plays various songs (e.g. Black Cats soundtrack, Red Army theme, Königgrätzer Marsch, or WTF). In Call of Duty: Zombies (Black Ops), knifing it unlocks the "Radio Silence?" achievement.',
      },
    });
    await prisma.easterEggStep.createMany({
      data: [
        { easterEggId: musicRadio.id, order: 1, label: 'Go to the "Help!" room — the room that contains the Mystery Box.' },
        { easterEggId: musicRadio.id, order: 2, label: 'Find the radio on the wall to the right of the Mystery Box.' },
        { easterEggId: musicRadio.id, order: 3, label: 'Knife or shoot the radio to play music. In World at War it can play the Black Cats soundtrack, Red Army theme, Königgrätzer Marsch, or WTF. In Call of Duty: Zombies (Black Ops), knifing it unlocks the "Radio Silence?" achievement.' },
      ],
    });
    eeCount += 1;
    console.log('Created Music Radio (musical) Easter Egg for Nacht der Untoten (WAW)');
  }

  // Per-map achievements (round milestones, challenge types, Easter Egg). Level thresholds from RANKS.
  const allMaps = await prisma.map.findMany({
    include: {
      game: { select: { shortName: true } },
      challenges: { where: { isActive: true } },
      easterEggs: { where: { isActive: true, slug: 'main-quest' } },
    },
  });

  let achievementCount = 0;
  for (const map of allMaps) {
    const gameShortName = map.game?.shortName ?? '';
    const defs = getMapAchievementDefinitions(map.slug, map.roundCap, gameShortName);
    const challengesByType = Object.fromEntries(map.challenges.map((c) => [c.type, c]));

    for (const def of defs) {
      const criteria = def.criteria as { round?: number; challengeType?: string; isCap?: boolean };
      const challengeId = criteria.challengeType
        ? challengesByType[criteria.challengeType as keyof typeof challengesByType]?.id
        : null;

      await prisma.achievement.create({
        data: {
          mapId: map.id,
          name: def.name,
          slug: def.slug,
          type: def.type as any,
          rarity: def.rarity as any,
          xpReward: def.xpReward,
          criteria: def.criteria,
          challengeId: challengeId ?? undefined,
        },
      });
      achievementCount++;
    }

    if (map.easterEggs.length > 0) {
      const eeDef = getEasterEggAchievementDefinition();
      const mainQuest = map.easterEggs[0]!;
      await prisma.achievement.create({
        data: {
          mapId: map.id,
          easterEggId: mainQuest.id,
          name: eeDef.name,
          slug: eeDef.slug,
          type: eeDef.type as any,
          rarity: eeDef.rarity as any,
          xpReward: eeDef.xpReward,
          criteria: eeDef.criteria,
        },
      });
      achievementCount++;
    }
  }

  console.log(`Created ${achievementCount} map achievements`);

  for (const rank of RANKS) {
    await prisma.levelThreshold.upsert({
      where: { level: rank.level },
      create: {
        level: rank.level,
        xpRequired: rank.xpRequired,
        rankName: rank.name,
        rankBadgeUrl: getRankIconPath(rank.icon),
      },
      update: {
        xpRequired: rank.xpRequired,
        rankName: rank.name,
        rankBadgeUrl: getRankIconPath(rank.icon),
      },
    });
  }

  console.log(`Created ${RANKS.length} level thresholds (ranks)`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
