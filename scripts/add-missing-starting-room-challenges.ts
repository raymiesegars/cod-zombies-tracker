/**
 * Add STARTING_ROOM challenge to any map that has it in config but doesn't have it in DB.
 * Run after seed and add-* scripts. Fixes missing First Room on log page and challenge dropdowns.
 *
 * Run: pnpm exec tsx scripts/add-missing-starting-room-challenges.ts
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
import { getWaWMapConfig } from '../src/lib/waw/waw-map-config';
import { getBo1MapConfig } from '../src/lib/bo1/bo1-map-config';
import { getBo2MapConfig } from '../src/lib/bo2/bo2-map-config';
import { getBo3MapConfig } from '../src/lib/bo3/bo3-map-config';
import { getBo4MapConfig } from '../src/lib/bo4/bo4-map-config';
import { getBocwMapConfig } from '../src/lib/bocw/bocw-map-config';
import { getBo6MapConfig } from '../src/lib/bo6/bo6-map-config';
import { getBo7MapConfig } from '../src/lib/bo7/bo7-map-config';
import { getWw2MapConfig } from '../src/lib/ww2/ww2-map-config';
import { getVanguardMapConfig } from '../src/lib/vanguard/vanguard-map-config';
import { getAwMapConfig } from '../src/lib/aw/aw-map-config';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

function configHasStartingRoom(slug: string, gameShortName: string): boolean {
  switch (gameShortName) {
    case 'WAW':
      return getWaWMapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'BO1':
      return getBo1MapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'BO2':
      return getBo2MapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'BO3':
      return getBo3MapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'BO4':
      return getBo4MapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'BOCW':
      return getBocwMapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'BO6':
      return getBo6MapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'BO7':
      return getBo7MapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'WW2':
      return getWw2MapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'VANGUARD':
      return getVanguardMapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    case 'AW':
      return getAwMapConfig(slug)?.challengeTypes?.includes('STARTING_ROOM') ?? false;
    default:
      return false;
  }
}

async function main() {
  console.log('Add missing STARTING_ROOM challenges\n');

  const maps = await prisma.map.findMany({
    include: { game: { select: { shortName: true } }, challenges: { select: { type: true } } },
  });

  // 0. Set firstRoomVariant='PROCESSING' for Buried STARTING_ROOM logs that don't have it
  const buriedMap = await prisma.map.findFirst({ where: { slug: 'buried' } });
  if (buriedMap) {
    const buriedStartChal = await prisma.challenge.findFirst({
      where: { mapId: buriedMap.id, type: 'STARTING_ROOM' },
    });
    if (buriedStartChal) {
      const buriedResult = await prisma.challengeLog.updateMany({
        where: { challengeId: buriedStartChal.id, firstRoomVariant: null },
        data: { firstRoomVariant: 'PROCESSING' },
      });
      if (buriedResult.count > 0) {
        console.log(`  Set firstRoomVariant=PROCESSING for ${buriedResult.count} Buried first room logs`);
      }
    }
  }

  // 1b. Fix achievement names: replace "STARTING ROOM" / "STARTING_ROOM" with "First Room" (Buried, etc.)
  const capAchs = await prisma.achievement.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: 'STARTING ROOM', mode: 'insensitive' } },
        { name: { contains: 'STARTING_ROOM', mode: 'insensitive' } },
      ],
    },
  });
  for (const a of capAchs) {
    const fixed = a.name.replace(/\bSTARTING\s*ROOM\b/gi, 'First Room').replace(/STARTING_ROOM/gi, 'First Room');
    if (fixed !== a.name) await prisma.achievement.update({ where: { id: a.id }, data: { name: fixed } });
  }
  if (capAchs.length > 0) console.log(`  Fixed ${capAchs.length} achievement names (removed ALL CAPS)`);

  let created = 0;
  for (const map of maps) {
    if (!map.game?.shortName || !configHasStartingRoom(map.slug, map.game.shortName)) continue;
    const hasStartingRoom = map.challenges.some((c) => c.type === 'STARTING_ROOM');
    if (hasStartingRoom) continue;

    await prisma.challenge.create({
      data: {
        name: 'First Room',
        slug: 'starting-room',
        type: 'STARTING_ROOM',
        mapId: map.id,
        xpReward: 0,
        isActive: true,
      },
    });
    console.log(`  Created STARTING_ROOM challenge for ${map.slug} (${map.game.shortName})`);
    created++;
  }

  console.log(`\nDone. Created ${created} challenges.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
