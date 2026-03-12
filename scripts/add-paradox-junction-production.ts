/**
 * Production-safe script: adds only Paradox Junction (map + challenges + Easter eggs).
 * Does not truncate or modify existing data. Safe to run once on production after deploying
 * the Paradox Junction code. Idempotent: skips if the map already exists.
 *
 * Run: pnpm exec tsx scripts/add-paradox-junction-production.ts
 * (Uses .env / .env.local for DATABASE_URL like other scripts.)
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { getBo7MapConfig, getBo7ChallengeTypeLabel } from '../src/lib/bo7/bo7-map-config';
import { getRoundCapForMap } from '../src/lib/achievements/map-round-config';

const MAP_SLUG = 'paradox-junction';
const GAME_SHORT_NAME = 'BO7';

const MAP_RECORD = {
  name: 'Paradox Junction',
  slug: MAP_SLUG,
  isDlc: true,
  hasEasterEgg: true,
  order: 7,
  description:
    'Black Ops 7 Zombies DLC. Nuketown Normal and Destroyed. The Dark Heart main quest.',
  imageUrl: '/images/maps/paradox-junction.webp',
};

const ROUND_CHALLENGE_TYPES: Record<string, { name: string; description: string }> = {
  HIGHEST_ROUND: { name: 'Highest Round', description: 'Reach the highest round possible' },
  NO_DOWNS: { name: 'No Downs', description: 'Survive without going down' },
  NO_PERKS: { name: 'No Perks', description: 'Survive without purchasing any perks' },
  NO_PACK: { name: 'No Pack-a-Punch', description: 'Survive without using Pack-a-Punch' },
  STARTING_ROOM: { name: 'Starting Room Only', description: 'Never leave the starting room' },
  ONE_BOX: { name: 'One Box Challenge', description: 'Only hit the mystery box once' },
  PISTOL_ONLY: { name: 'Pistol Only', description: 'Only use your starting pistol' },
  NO_POWER: { name: 'No Power', description: 'Never turn on the power' },
  NO_JUG: { name: 'No Jug', description: 'No Juggernog' },
};

const SPEEDRUN_DESCRIPTION = 'Reach target as fast as possible';

const PARADOX_EASTER_EGGS = [
  {
    name: 'The Dark Heart',
    slug: 'the-dark-heart-paradox',
    type: 'MAIN_QUEST' as const,
    xpReward: 5000,
    description:
      'Obtain the Blundergat, upgrade to Sundergat, complete the Twins trials (Swing, Strange Tree, Hopscotch, Piano, Bouncing Ball, Toy Box & Four Square), align the clock tower, and defeat the Dark Heart boss. Normal and Destroyed Nuketown alternate; Sundergat required to fill souls on objects.',
    rewardsDescription: 'Main quest completion; cutscene.',
    steps: [
      { order: 1, label: 'Build Blundergat: 4 parts (Sealant—Yellow House shelf; Barrel—feed Cysts in Destroyed Nuketown; Hammer—H2SO4 from sink, pour on mannequin; Stock—explosive on humming wall in Normal, collect in Destroyed). Build at workbench in Destroyed Truck Interior.' },
      { order: 2, label: 'Upgrade to Sundergat: Kill 2 Tortured Zombies then 1 Tortured Mimic near bench with Blundergat in Destroyed Nuketown. Melee bench in Normal then Destroyed to get Sundergat.' },
      { order: 3, label: 'The Twins Swing: Shoot swing in Yellow House Backyard, get Swing Seat. Destroyed: find RC-XD Controller (PaP boxes, Green House fence, Yellow House garage). Race RC-XD into garage, detonate. Get Chalk; place Swing Seat and Chalk on chains.' },
      { order: 4, label: 'Strange Tree: Destroyed—Yellow House Garage toolbox for Irradiated Seeds. Normal Trinity Ave.—place seeds, kill with Blundergat to fill tree. Destroyed: 3 Combat Axes at tree. Normal: place Strange Firewood in Yellow House fireplace, Molotov to light.' },
      { order: 5, label: 'Hopscotch and Music Box: Destroyed Trinity Ave.—step on X until blue. Normal: hopscotch trial (1 to 12, 12 to 1, avoid black smoke). Sundergat fill music box, escort to Yellow House fireplace.' },
      { order: 6, label: 'Piano Lesson: Destroyed Green House Backyard—Piano Teacher zombie; Brain Rot or Psych Grenade, follow. Teleport to Normal; Piano Teacher plays piano. Destroyed: 8 notes blink 1–8 (order). Normal Green House: play piano in that order (note Treble/Bass clef).' },
      { order: 7, label: 'Bouncing Ball and Music Sheet: Destroyed Green House Backyard—kill 3 floating zombies. Normal Trinity Ave.—Twins draw circle; bounce trial (kill zombies in air). Sundergat fill sheet, escort to Green House piano.' },
      { order: 8, label: 'Toy Box and Four Square: Destroyed—speaker pole, Wisp Tea for Goggles; Death Perception for Headset (3 locations). Normal: interact blue toy box. Destroyed: red ball to massive X. Normal: Four Square trial (melee ball into squares). Sundergat fill cymbals, escort to toy box.' },
      { order: 9, label: 'Clock Tower and The Twins: Destroyed—shoot crumbled clock to 0; during teleport animation shoot hands again. White orb triggers scene; yellow portal at swing starts boss.' },
      { order: 10, label: 'The Dark Heart Boss: Phase 1—fill 3 cysts at black goo piles (Trinity Ave., Yellow House Backyard, Green House Backyard), defend Concentration Field at each. Phase 2—kill zombies from green orbs, defend fields. Phase 3—Tortured Zombie at objects, defend fields. Damage Dark Heart to finish.' },
    ],
  },
  {
    name: 'Cursed Relics — Grim',
    slug: 'cursed-relics-grim-paradox-junction',
    type: 'SIDE_QUEST' as const,
    xpReward: 0,
    categoryTag: 'Relic',
    description:
      'Grim Relics (Paradox Junction): Unlock in Cursed mode. Trials at Round 20+. Each Grim relic fills one-third of a Cursed tier bar. Tier I unlocks Golden Armor (45,000 Essence).',
    steps: [{ order: 1, label: 'Reach Round 20+ in Cursed on Paradox Junction. Complete steps for desired Grim relic; complete its Relic Trial.' }],
  },
  {
    name: 'Cursed Relics — Sinister',
    slug: 'cursed-relics-sinister-paradox-junction',
    type: 'SIDE_QUEST' as const,
    xpReward: 0,
    categoryTag: 'Relic',
    description:
      'Sinister Relics (Paradox Junction): Round 40+ Tier I Cursed. Each Sinister relic fills two-thirds of a tier. Tier II enables Ultra Rarity (8000–17500 Salvage).',
    steps: [{ order: 1, label: 'Reach Round 40+ Tier I Cursed on Paradox Junction. Complete steps for desired Sinister relic and Trial.' }],
  },
  {
    name: 'Cursed Relics — Wicked',
    slug: 'cursed-relics-wicked-paradox-junction',
    type: 'SIDE_QUEST' as const,
    xpReward: 0,
    categoryTag: 'Relic',
    description:
      'Wicked Relics (Paradox Junction): Round 60+ Tier II Cursed. Each Wicked relic fills a full tier. Tier III enables Pack-a-Punch Level IV (100,000 Essence).',
    steps: [{ order: 1, label: 'Reach Round 60+ Tier II Cursed on Paradox Junction. Complete steps for desired Wicked relic and Trial.' }],
  },
];

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

function challengeDisplayName(cType: string): string {
  const label = getBo7ChallengeTypeLabel(cType);
  if (label !== cType.replace(/_/g, ' ')) return label;
  const info = ROUND_CHALLENGE_TYPES[cType];
  return info?.name ?? cType.replace(/_/g, ' ');
}

function challengeDescription(cType: string): string {
  const info = ROUND_CHALLENGE_TYPES[cType];
  if (info?.description) return info.description;
  if (
    [
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ].includes(cType)
  ) {
    return SPEEDRUN_DESCRIPTION;
  }
  if (cType === 'EXFIL_SPEEDRUN' || cType === 'EXFIL_R21_SPEEDRUN') return SPEEDRUN_DESCRIPTION;
  return `Challenge: ${cType}`;
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
  });

  const existing = await prisma.map.findUnique({ where: { slug: MAP_SLUG }, include: { game: true } });
  if (existing) {
    console.log(`Map "${MAP_SLUG}" already exists. Nothing to do.`);
    await prisma.$disconnect();
    process.exit(0);
  }

  const game = await prisma.game.findFirst({ where: { shortName: GAME_SHORT_NAME } });
  if (!game) {
    console.error(`Game ${GAME_SHORT_NAME} not found.`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const roundCap = getRoundCapForMap(MAP_SLUG, GAME_SHORT_NAME) ?? null;
  const map = await prisma.map.create({
    data: {
      name: MAP_RECORD.name,
      slug: MAP_RECORD.slug,
      gameId: game.id,
      isDlc: MAP_RECORD.isDlc,
      order: MAP_RECORD.order,
      imageUrl: MAP_RECORD.imageUrl,
      roundCap,
      description: MAP_RECORD.description,
    },
  });
  console.log(`Created map: ${map.name} (${map.slug}).`);

  const bo7Cfg = getBo7MapConfig(MAP_SLUG);
  if (!bo7Cfg) {
    console.error('getBo7MapConfig(paradox-junction) returned null.');
    await prisma.$disconnect();
    process.exit(1);
  }

  let challengeCount = 0;
  for (const cType of bo7Cfg.challengeTypes) {
    const name = challengeDisplayName(cType);
    const description = challengeDescription(cType);
    await prisma.challenge.create({
      data: {
        name,
        slug: cType.toLowerCase().replace(/_/g, '-'),
        type: cType as any,
        mapId: map.id,
        xpReward: 0,
        description,
      },
    });
    challengeCount++;
  }
  console.log(`Created ${challengeCount} challenges.`);

  for (const ee of PARADOX_EASTER_EGGS) {
    const created = await prisma.easterEgg.create({
      data: {
        name: ee.name,
        slug: ee.slug,
        type: ee.type,
        mapId: map.id,
        xpReward: ee.xpReward,
        description: ee.description,
        rewardsDescription: 'rewardsDescription' in ee ? (ee as { rewardsDescription?: string }).rewardsDescription ?? null : null,
        categoryTag: 'categoryTag' in ee ? (ee as { categoryTag?: string }).categoryTag ?? null : null,
      },
    });
    await prisma.easterEggStep.createMany({
      data: ee.steps.map((s) => ({
        easterEggId: created.id,
        order: s.order,
        label: s.label,
        imageUrl: null,
        buildableReferenceSlug: null,
      })),
    });
    console.log(`  Created Easter egg: ${ee.name} (${ee.steps.length} steps).`);
  }

  console.log('Paradox Junction added successfully.');
  console.log('Next: run pnpm db:sync-achievements-paradox-junction-only to create this map\'s achievements only.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
