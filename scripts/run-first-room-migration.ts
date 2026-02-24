/**
 * First Room Consolidation Migration
 *
 * Run AFTER: prisma migrate deploy (which adds firstRoomVariant column)
 *
 * 1. Create STARTING_ROOM challenge for verruckt, bo1-verruckt, bo3-verruckt (replace JUG/QUICK)
 * 2. Migrate logs: STARTING_ROOM_JUG_SIDE → STARTING_ROOM + firstRoomVariant=JUG_SIDE
 * 3. Migrate logs: STARTING_ROOM_QUICK_SIDE → STARTING_ROOM + firstRoomVariant=QUICK_SIDE
 * 4. Set firstRoomVariant='PROCESSING' for existing Buried STARTING_ROOM logs
 * 5. Deactivate old JUG_SIDE and QUICK_SIDE challenges
 *
 * Run: pnpm exec tsx scripts/run-first-room-migration.ts
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

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const VERRUCKT_SLUGS = ['verruckt', 'bo1-verruckt', 'bo3-verruckt'] as const;

async function main() {
  console.log('First Room Consolidation Migration\n');

  // 1. Create STARTING_ROOM challenge for Verrückt maps (if not exists)
  for (const slug of VERRUCKT_SLUGS) {
    const map = await prisma.map.findFirst({ where: { slug }, include: { challenges: true } });
    if (!map) {
      console.log(`  Skipping ${slug}: map not found`);
      continue;
    }
    const hasStartingRoom = map.challenges.some((c) => c.type === 'STARTING_ROOM');
    if (!hasStartingRoom) {
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
      console.log(`  Created STARTING_ROOM challenge for ${slug}`);
    }
  }

  // 2 & 3. Migrate JUG_SIDE and QUICK_SIDE logs to STARTING_ROOM + firstRoomVariant
  for (const [oldType, variant] of [
    ['STARTING_ROOM_JUG_SIDE', 'JUG_SIDE'] as const,
    ['STARTING_ROOM_QUICK_SIDE', 'QUICK_SIDE'] as const,
  ]) {
    const oldChallenges = await prisma.challenge.findMany({
      where: { type: oldType },
      include: { map: true },
    });
    for (const oldChal of oldChallenges) {
      const startRoomChal = await prisma.challenge.findFirst({
        where: { mapId: oldChal.mapId, type: 'STARTING_ROOM' },
      });
      if (!startRoomChal) {
        console.warn(`  No STARTING_ROOM challenge for map ${oldChal.map?.slug}, skipping migration for ${oldType}`);
        continue;
      }
      const result = await prisma.challengeLog.updateMany({
        where: { challengeId: oldChal.id },
        data: { challengeId: startRoomChal.id, firstRoomVariant: variant },
      });
      if (result.count > 0) {
        console.log(`  Migrated ${result.count} logs from ${oldType} to STARTING_ROOM + ${variant} (${oldChal.map?.slug})`);
      }
    }
  }

  // 4. Set firstRoomVariant='PROCESSING' for Buried STARTING_ROOM logs that don't have it
  const buriedMap = await prisma.map.findFirst({ where: { slug: 'buried' } });
  if (buriedMap) {
    const buriedStartChal = await prisma.challenge.findFirst({
      where: { mapId: buriedMap.id, type: 'STARTING_ROOM' },
    });
    if (buriedStartChal) {
      const logs = await prisma.challengeLog.findMany({
        where: { challengeId: buriedStartChal.id, firstRoomVariant: null },
      });
      if (logs.length > 0) {
        await prisma.challengeLog.updateMany({
          where: { challengeId: buriedStartChal.id, firstRoomVariant: null },
          data: { firstRoomVariant: 'PROCESSING' },
        });
        console.log(`  Set firstRoomVariant=PROCESSING for ${logs.length} Buried first room logs`);
      }
    }
  }

  // 5. Migrate achievements: STARTING_ROOM_JUG_SIDE/QUICK_SIDE → STARTING_ROOM + firstRoomVariant in criteria
  const oldTypes = ['STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE'] as const;
  let achievementsUpdated = 0;
  for (const oldType of oldTypes) {
    const variant = oldType === 'STARTING_ROOM_JUG_SIDE' ? 'JUG_SIDE' : 'QUICK_SIDE';
    const oldAchievements = await prisma.achievement.findMany({
      where: { challenge: { type: oldType } },
      include: { challenge: { include: { map: true } } },
    });
    for (const ach of oldAchievements) {
      const startRoomChal = await prisma.challenge.findFirst({
        where: { mapId: ach.challenge!.mapId, type: 'STARTING_ROOM' },
      });
      if (!startRoomChal) continue;
      const criteria = (ach.criteria as Record<string, unknown>) ?? {};
      await prisma.achievement.update({
        where: { id: ach.id },
        data: {
          challengeId: startRoomChal.id,
          criteria: { ...criteria, challengeType: 'STARTING_ROOM', firstRoomVariant: variant },
        },
      });
      achievementsUpdated++;
    }
  }
  if (achievementsUpdated > 0) {
    console.log(`  Migrated ${achievementsUpdated} achievements to STARTING_ROOM + firstRoomVariant`);
  }

  // 6. Deactivate old JUG_SIDE and QUICK_SIDE challenges
  const deactivated = await prisma.challenge.updateMany({
    where: { type: { in: ['STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE'] } },
    data: { isActive: false },
  });
  if (deactivated.count > 0) {
    console.log(`  Deactivated ${deactivated.count} old JUG/QUICK challenges`);
  }

  // 7. Consolidate Verrückt first room achievements: one per round, no variants, proper names
  for (const slug of VERRUCKT_SLUGS) {
    const map = await prisma.map.findFirst({ where: { slug }, include: { game: { select: { shortName: true } } } });
    if (!map) continue;
    const startRoomChal = await prisma.challenge.findFirst({
      where: { mapId: map.id, type: 'STARTING_ROOM' },
    });
    if (!startRoomChal) continue;

    const firstRoomAchs = await prisma.achievement.findMany({
      where: {
        mapId: map.id,
        challengeId: startRoomChal.id,
        isActive: true,
      },
      include: { challenge: true },
    });

    const byRound = new Map<number, typeof firstRoomAchs>();
    for (const a of firstRoomAchs) {
      const c = a.criteria as { round?: number } | null;
      const r = c?.round;
      if (r == null) continue;
      if (!byRound.has(r)) byRound.set(r, []);
      byRound.get(r)!.push(a);
    }

    for (const [round, achs] of byRound) {
      const canonical = achs.find((a) => {
        const c = a.criteria as { firstRoomVariant?: string } | null;
        return !c?.firstRoomVariant;
      });
      const keep = canonical ?? achs[0]!;
      const toDeactivate = achs.filter((a) => a.id !== keep.id);
      for (const a of toDeactivate) {
        await prisma.achievement.update({ where: { id: a.id }, data: { isActive: false } });
      }
      const criteria = keep.criteria as Record<string, unknown> | null;
      const newCriteria = { ...(criteria ?? {}), challengeType: 'STARTING_ROOM', round };
      delete (newCriteria as Record<string, unknown>).firstRoomVariant;
      await prisma.achievement.update({
        where: { id: keep.id },
        data: {
          name: `First Room Round ${round}`,
          slug: `starting-room-${round}`,
          criteria: newCriteria,
        },
      });
    }
  }
  console.log('  Consolidated Verrückt first room achievements (one per round)');

  // 8. Fix achievement names: replace "STARTING ROOM" / "STARTING_ROOM" with "First Room"
  const allFirstRoomAchs = await prisma.achievement.findMany({
    where: {
      OR: [
        { name: { contains: 'STARTING ROOM', mode: 'insensitive' } },
        { name: { contains: 'STARTING_ROOM', mode: 'insensitive' } },
      ],
      isActive: true,
    },
  });
  for (const a of allFirstRoomAchs) {
    const fixed = a.name
      .replace(/\bSTARTING\s*ROOM\b/gi, 'First Room')
      .replace(/STARTING_ROOM/gi, 'First Room');
    if (fixed !== a.name) {
      await prisma.achievement.update({ where: { id: a.id }, data: { name: fixed } });
    }
  }
  if (allFirstRoomAchs.length > 0) {
    console.log(`  Fixed ${allFirstRoomAchs.length} achievement names (removed ALL CAPS)`);
  }

  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
