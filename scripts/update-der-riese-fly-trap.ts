/**
 * Safely update Der Riese (WAW) Fly Trap Easter Egg to Main Quest with 500 XP.
 *
 * SAFE: Only updates this single EE + its achievement. No truncation, no deletion.
 * - EasterEgg: type → MAIN_QUEST, xpReward → 500
 * - Achievement: creates or updates EASTER_EGG_COMPLETE with 500 XP
 *
 * Usage:
 *   pnpm exec tsx scripts/update-der-riese-fly-trap.ts           # Run
 *   pnpm exec tsx scripts/update-der-riese-fly-trap.ts --dry-run  # Preview only
 *
 * Loads .env, .env.local, .env.production (in that order).
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
for (const file of ['.env', '.env.local', '.env.production']) {
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

import prisma from '../src/lib/prisma';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  // 1. Find WAW Der Riese map
  const game = await prisma.game.findFirst({ where: { shortName: 'WAW' } });
  if (!game) {
    console.error('WAW game not found.');
    process.exit(1);
  }

  const map = await prisma.map.findFirst({
    where: { slug: 'der-riese', gameId: game.id },
  });
  if (!map) {
    console.error('Der Riese (WAW) map not found.');
    process.exit(1);
  }

  // 2. Find Fly Trap easter egg
  const easterEgg = await prisma.easterEgg.findFirst({
    where: { mapId: map.id, slug: 'fly-trap' },
  });
  if (!easterEgg) {
    console.error('Fly Trap easter egg not found on Der Riese.');
    process.exit(1);
  }

  console.log('Found:', {
    map: map.name,
    ee: easterEgg.name,
    currentType: easterEgg.type,
    currentXpReward: easterEgg.xpReward,
  });

  const needsEeUpdate =
    easterEgg.type !== 'MAIN_QUEST' || easterEgg.xpReward !== 500;

  if (needsEeUpdate && !DRY_RUN) {
    await prisma.easterEgg.update({
      where: { id: easterEgg.id },
      data: { type: 'MAIN_QUEST', xpReward: 500 },
    });
    console.log('Updated EasterEgg: type=MAIN_QUEST, xpReward=500');
  } else if (needsEeUpdate) {
    console.log('[Dry run] Would update EasterEgg: type=MAIN_QUEST, xpReward=500');
  } else {
    console.log('EasterEgg already up to date.');
  }

  // 3. Ensure achievement exists with 500 XP
  let achievement = await prisma.achievement.findFirst({
    where: { easterEggId: easterEgg.id, type: 'EASTER_EGG_COMPLETE' },
  });

  if (achievement) {
    if (achievement.xpReward !== 500 && !DRY_RUN) {
      await prisma.achievement.update({
        where: { id: achievement.id },
        data: { xpReward: 500 },
      });
      console.log('Updated Achievement: xpReward=500');
    } else if (achievement.xpReward !== 500) {
      console.log('[Dry run] Would update Achievement: xpReward=500');
    } else {
      console.log('Achievement already has xpReward=500.');
    }
  } else {
    const slugBase = 'fly-trap';
    let slug = slugBase;
    let attempt = 0;
    while (true) {
      const exists = await prisma.achievement.findFirst({
        where: { mapId: map.id, slug },
      });
      if (!exists) break;
      attempt++;
      slug = `${slugBase}-${attempt}`;
      if (attempt > 10) {
        console.error('Could not find unique achievement slug.');
        process.exit(1);
      }
    }
    if (!DRY_RUN) {
      await prisma.achievement.create({
        data: {
          mapId: map.id,
          easterEggId: easterEgg.id,
          name: 'Fly Trap',
          slug,
          type: 'EASTER_EGG_COMPLETE',
          rarity: 'LEGENDARY',
          xpReward: 500,
          criteria: {},
        },
      });
      console.log('Created Achievement: Fly Trap, 500 XP');
    } else {
      console.log('[Dry run] Would create Achievement: Fly Trap, 500 XP');
    }
  }

  if (DRY_RUN) {
    console.log('\n*** Dry run complete. Run without --dry-run to apply. ***');
  } else {
    console.log('\nDer Riese Fly Trap update complete.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
