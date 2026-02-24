/**
 * Verrückt First Room Fix (All 3 games: WAW, BO1, BO3)
 *
 * Fixes challenges, logs, and achievements for Verrückt maps only.
 * Does NOT run full balance patches (no XP recalc, no other maps).
 *
 * CORE FIX: Activates STARTING_ROOM challenge for WAW & BO1 (was inactive; API only returns isActive: true).
 *
 * 0. Activate STARTING_ROOM for verruckt, bo1-verruckt
 * 1. Create STARTING_ROOM challenge if missing
 * 2. Migrate JUG_SIDE/QUICK_SIDE logs → STARTING_ROOM + firstRoomVariant
 * 3. Migrate JUG_SIDE/QUICK_SIDE achievements → STARTING_ROOM challenge
 * 4. Deactivate JUG_SIDE/QUICK_SIDE challenges
 * 5. Consolidate duplicate first room achievements (one per round)
 * 6. Fix achievement names (STARTING ROOM → First Room)
 * 7. Create first room achievements for WAW/BO1 if missing (enables achievement tab filter)
 *
 * Usage:
 *   pnpm exec tsx scripts/fix-verruckt-starting-room-only.ts
 *   pnpm exec tsx scripts/fix-verruckt-starting-room-only.ts --dry-run
 *   pnpm exec tsx scripts/fix-verruckt-starting-room-only.ts --verbose  # Show what's in DB
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

import prisma from '../src/lib/prisma';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const VERRUCKT_SLUGS = ['verruckt', 'bo1-verruckt', 'bo3-verruckt'] as const;

async function main() {
  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  // ─── 0. Verbose: show current state
  if (VERBOSE) {
    console.log('Current state:\n');
    for (const slug of VERRUCKT_SLUGS) {
      const map = await prisma.map.findFirst({ where: { slug }, include: { challenges: true, achievements: { where: { challenge: { type: { in: ['STARTING_ROOM', 'STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE'] } } } } } });
      if (!map) {
        console.log(`  [${slug}] Map not found`);
        continue;
      }
      const frChals = map.challenges.filter((c) =>
        ['STARTING_ROOM', 'STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE'].includes(c.type)
      );
      console.log(`  [${slug}] Challenges: ${frChals.map((c) => `${c.type}${c.isActive ? '' : '(inactive)'}`).join(', ') || 'none'}`);
      const frAchs = map.achievements.filter((a) => a.isActive);
      if (frAchs.length > 0) {
        console.log(`  [${slug}] First room achievements: ${frAchs.map((a) => a.name).join(' | ')}`);
      }
    }
    console.log('');
  }

  let challengesCreated = 0;
  let challengesActivated = 0;
  let challengesDeactivated = 0;
  let logsMigrated = 0;
  let achievementsMigrated = 0;
  let achievementsCreated = 0;
  let achievementsConsolidated = 0;
  let achievementNamesFixed = 0;

  // ─── 0. CORE FIX: Activate STARTING_ROOM challenge for WAW and BO1 Verrückt
  // (They were inactive; only BO3 had it active. API returns only isActive: true challenges.)
  for (const slug of ['verruckt', 'bo1-verruckt'] as const) {
    const startRoomChal = await prisma.challenge.findFirst({
      where: { map: { slug }, type: 'STARTING_ROOM' },
    });
    if (startRoomChal?.id && !startRoomChal.isActive) {
      if (!DRY_RUN) {
        await prisma.challenge.update({
          where: { id: startRoomChal.id },
          data: { isActive: true },
        });
      }
      console.log(`  [${slug}] Activated STARTING_ROOM challenge`);
      challengesActivated++;
    }
  }

  // ─── 1. Create STARTING_ROOM challenge if missing
  for (const slug of VERRUCKT_SLUGS) {
    const map = await prisma.map.findFirst({ where: { slug }, include: { challenges: true } });
    if (!map) continue;

    const hasStartingRoom = map.challenges.some((c) => c.type === 'STARTING_ROOM');
    if (!hasStartingRoom) {
      if (!DRY_RUN) {
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
      }
      console.log(`  [${slug}] Created STARTING_ROOM challenge`);
      challengesCreated++;
    }
  }

  // ─── 2. Migrate JUG_SIDE/QUICK_SIDE logs → STARTING_ROOM + firstRoomVariant
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
      if (!startRoomChal) continue;
      const result = await prisma.challengeLog.updateMany({
        where: { challengeId: oldChal.id },
        data: { challengeId: startRoomChal.id, firstRoomVariant: variant },
      });
      if (result.count > 0) {
        console.log(`  Migrated ${result.count} logs from ${oldType} → STARTING_ROOM (${oldChal.map?.slug})`);
        logsMigrated += result.count;
      }
    }
  }

  // ─── 3. Migrate JUG_SIDE/QUICK_SIDE achievements → STARTING_ROOM challenge
  for (const oldType of ['STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE'] as const) {
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
      if (!DRY_RUN) {
        await prisma.achievement.update({
          where: { id: ach.id },
          data: {
            challengeId: startRoomChal.id,
            criteria: { ...criteria, challengeType: 'STARTING_ROOM', firstRoomVariant: variant },
          },
        });
      }
      achievementsMigrated++;
    }
  }
  if (achievementsMigrated > 0) {
    console.log(`  Migrated ${achievementsMigrated} achievements to STARTING_ROOM challenge`);
  }

  // ─── 4. Deactivate JUG_SIDE/QUICK_SIDE challenges
  const deactivated = await prisma.challenge.updateMany({
    where: { type: { in: ['STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE'] }, isActive: true },
    data: { isActive: false },
  });
  if (deactivated.count > 0) {
    console.log(`  Deactivated ${deactivated.count} JUG/QUICK challenges`);
    challengesDeactivated = deactivated.count;
  }

  // ─── 5. Consolidate achievements: one per round
  for (const slug of VERRUCKT_SLUGS) {
    const map = await prisma.map.findFirst({ where: { slug } });
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
        if (!DRY_RUN) {
          await prisma.achievement.update({ where: { id: a.id }, data: { isActive: false } });
        }
        achievementsConsolidated++;
      }
      const criteria = keep.criteria as Record<string, unknown> | null;
      const newCriteria = { ...(criteria ?? {}), challengeType: 'STARTING_ROOM', round };
      delete (newCriteria as Record<string, unknown>).firstRoomVariant;
      const newName = `First Room Round ${round}`;
      const needsUpdate = keep.name !== newName || JSON.stringify(keep.criteria) !== JSON.stringify(newCriteria);
      if (needsUpdate && !DRY_RUN) {
        await prisma.achievement.update({
          where: { id: keep.id },
          data: {
            name: newName,
            slug: `starting-room-${round}`,
            criteria: newCriteria,
          },
        });
      }
    }
  }
  if (achievementsConsolidated > 0) {
    console.log(`  Consolidated ${achievementsConsolidated} duplicate achievements`);
  }

  // ─── 6. Fix achievement names: STARTING ROOM → First Room
  const allFirstRoomAchs = await prisma.achievement.findMany({
    where: {
      map: { slug: { in: [...VERRUCKT_SLUGS] } },
      challenge: { type: 'STARTING_ROOM' },
      isActive: true,
      OR: [
        { name: { contains: 'STARTING ROOM', mode: 'insensitive' } },
        { name: { contains: 'STARTING_ROOM', mode: 'insensitive' } },
      ],
    },
  });
  for (const a of allFirstRoomAchs) {
    const fixed = a.name
      .replace(/\bSTARTING\s*ROOM\b/gi, 'First Room')
      .replace(/STARTING_ROOM/gi, 'First Room');
    if (fixed !== a.name) {
      if (!DRY_RUN) {
        await prisma.achievement.update({ where: { id: a.id }, data: { name: fixed } });
      }
      achievementNamesFixed++;
    }
  }
  if (achievementNamesFixed > 0) {
    console.log(`  Fixed ${achievementNamesFixed} achievement names`);
  }

  // ─── 7. Ensure first room achievements exist and are active for WAW/BO1 (filter + unlock on log)
  // Create from defs if missing; activate & fix criteria if existing but inactive or linked to JUG/QUICK
  const { getMapAchievementDefinitions } = await import('../src/lib/achievements/seed-achievements');
  for (const slug of ['verruckt', 'bo1-verruckt'] as const) {
    const map = await prisma.map.findFirst({
      where: { slug },
      include: { challenges: { where: { type: 'STARTING_ROOM', isActive: true } }, game: true },
    });
    if (!map?.challenges[0]) continue;
    const startRoomChal = map.challenges[0];
    const gameShortName = (map.game as { shortName?: string })?.shortName ?? (slug.startsWith('bo1') ? 'BO1' : 'WAW');
    const defs = getMapAchievementDefinitions(slug, map.roundCap ?? undefined, gameShortName);
    const firstRoomDefs = defs.filter(
      (d) => (d.criteria as { challengeType?: string })?.challengeType === 'STARTING_ROOM'
    );
    let created = 0;
    let fixed = 0;
    for (const def of firstRoomDefs) {
      const round = (def.criteria as { round?: number })?.round;
      let existing = await prisma.achievement.findFirst({
        where: { mapId: map.id, slug: def.slug },
        include: { challenge: { select: { type: true } } },
      });
      if (!existing && round != null) {
        const allFirstRoom = await prisma.achievement.findMany({
          where: {
            mapId: map.id,
            challenge: { type: { in: ['STARTING_ROOM', 'STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE'] } },
          },
          include: { challenge: { select: { type: true } } },
        });
        existing = allFirstRoom.find((a) => (a.criteria as { round?: number })?.round === round) ?? null;
      }
      const needsActivate =
        existing?.isActive === false ||
        existing?.challenge?.type === 'STARTING_ROOM_JUG_SIDE' ||
        existing?.challenge?.type === 'STARTING_ROOM_QUICK_SIDE';
      const criteriaOk =
        (existing?.criteria as { challengeType?: string; firstRoomVariant?: string })?.challengeType ===
          'STARTING_ROOM' &&
        !(existing?.criteria as { firstRoomVariant?: string })?.firstRoomVariant;

      if (existing) {
        if (needsActivate || !criteriaOk || existing.challengeId !== startRoomChal.id) {
          if (!DRY_RUN) {
            const newCriteria = { round, challengeType: 'STARTING_ROOM' } as Record<string, unknown>;
            await prisma.achievement.update({
              where: { id: existing.id },
              data: {
                isActive: true,
                challengeId: startRoomChal.id,
                name: def.name,
                slug: def.slug,
                criteria: newCriteria,
                xpReward: def.xpReward,
                rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY',
              },
            });
          }
          fixed++;
          achievementsCreated++;
        }
        continue;
      }
      if (!DRY_RUN) {
        await prisma.achievement.create({
          data: {
            mapId: map.id,
            name: def.name,
            slug: def.slug,
            type: def.type as 'CHALLENGE_COMPLETE',
            rarity: def.rarity as 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY',
            xpReward: def.xpReward,
            criteria: def.criteria,
            challengeId: startRoomChal.id,
          },
        });
      }
      created++;
      achievementsCreated++;
    }
    if (created > 0 || fixed > 0) {
      console.log(`  [${slug}] First room achievements: ${created} created, ${fixed} fixed`);
    }

    // Deactivate duplicate legacy achievements (JUG/QUICK variants) now that we have canonical ones
    const toDeactivate = await prisma.achievement.findMany({
      where: {
        mapId: map.id,
        challenge: { type: { in: ['STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE'] } },
        isActive: true,
      },
    });
    for (const a of toDeactivate) {
      const round = (a.criteria as { round?: number })?.round;
      const hasCanonical = firstRoomDefs.some((d) => (d.criteria as { round?: number })?.round === round);
      if (hasCanonical && !DRY_RUN) {
        await prisma.achievement.update({ where: { id: a.id }, data: { isActive: false } });
        achievementsConsolidated++;
      }
    }
  }

  console.log(`\nSummary: Created ${challengesCreated}, Activated ${challengesActivated}, Deactivated ${challengesDeactivated}, Logs ${logsMigrated}, Ach migrated ${achievementsMigrated}, Ach created ${achievementsCreated}, Consolidated ${achievementsConsolidated}, Names fixed ${achievementNamesFixed}`);
  if (DRY_RUN) console.log('Run without --dry-run to apply.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
