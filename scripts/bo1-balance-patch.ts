/**
 * BO1 Balance Patch Migration
 *
 * SAFE: Only affects BO1 game maps. No truncation, no deletion of user logs.
 * - Deactivates challenges that don't exist per map (isActive=false)
 * - Creates new challenges (speedruns including R200, Verruckt first room jug/quick)
 * - Replaces BO1 achievements with WR-based definitions; recalculates user XP
 * - Call of the Dead: separate EE speedrun achievements for Stand-in (Solo) and Ensemble Cast (2+)
 *
 * IMPORTANT: NEVER deactivate EASTER_EGG_COMPLETE achievements (main quest completion).
 *
 * Run AFTER schema migration (20260229000000_add_round_200_speedrun).
 *
 * Usage:
 *   pnpm exec tsx scripts/bo1-balance-patch.ts           # Run against .env.local (dev)
 *   pnpm exec tsx scripts/bo1-balance-patch.ts --dry-run  # Preview without writing
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
import {
  getMapAchievementDefinitions,
  getSpeedrunAchievementDefinitions,
  getBo1CallOfTheDeadEeSpeedrunDefinitions,
} from '../src/lib/achievements/seed-achievements';
import { BO1_MAP_CONFIG, type Bo1MapSlug } from '../src/lib/bo1/bo1-map-config';
import type { ChallengeType } from '@prisma/client';

const DRY_RUN = process.argv.includes('--dry-run');

const BO1_SPEEDRUN_TYPES: { type: ChallengeType; name: string }[] = [
  { type: 'ROUND_30_SPEEDRUN', name: 'Round 30 Speedrun' },
  { type: 'ROUND_50_SPEEDRUN', name: 'Round 50 Speedrun' },
  { type: 'ROUND_70_SPEEDRUN', name: 'Round 70 Speedrun' },
  { type: 'ROUND_100_SPEEDRUN', name: 'Round 100 Speedrun' },
  { type: 'ROUND_200_SPEEDRUN', name: 'Round 200 Speedrun' },
  { type: 'EASTER_EGG_SPEEDRUN', name: 'Easter Egg Speedrun' },
];

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  const game = await prisma.game.findFirst({ where: { shortName: 'BO1' } });
  if (!game) {
    console.log('BO1 game not found. Exiting.');
    return;
  }

  const maps = await prisma.map.findMany({
    where: { gameId: game.id },
    include: { challenges: true },
  });

  if (maps.length === 0) {
    console.log('No BO1 maps found. Exiting.');
    return;
  }

  // 1. Update challenge isActive per map and create missing challenges
  console.log('1. Updating challenge visibility (isActive) and creating missing challenges...');
  let challengesDeactivated = 0;
  let challengesCreated = 0;

  for (const map of maps) {
    const cfg = BO1_MAP_CONFIG[map.slug as Bo1MapSlug];
    if (!cfg) continue;

    const allowedTypes = new Set(cfg.challengeTypes);

    for (const ch of map.challenges) {
      const shouldBeActive = allowedTypes.has(ch.type);
      if (ch.isActive !== shouldBeActive) {
        if (!DRY_RUN) {
          await prisma.challenge.update({
            where: { id: ch.id },
            data: { isActive: shouldBeActive },
          });
        }
        challengesDeactivated += ch.isActive && !shouldBeActive ? 1 : 0;
      }
    }

    const existingTypes = new Set(map.challenges.map((c) => c.type));

    // bo1-verruckt: create First Room Jug/Quick if missing
    if (map.slug === 'bo1-verruckt') {
      for (const t of ['STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE'] as const) {
        if (existingTypes.has(t)) continue;
        const name = t === 'STARTING_ROOM_JUG_SIDE' ? 'First Room (Jug Side)' : 'First Room (Quick Side)';
        if (!DRY_RUN) {
          await prisma.challenge.create({
            data: {
              name,
              slug: t.toLowerCase().replace(/_/g, '-'),
              type: t,
              mapId: map.id,
              xpReward: 0,
              isActive: true,
            },
          });
        }
        challengesCreated++;
      }
    }

    // Create speedrun challenges based on config
    const hasR200 = cfg.speedrunWRs?.r200 != null;
    const hasEe = cfg.eeSpeedrunWR != null || cfg.eeSpeedrunSoloWR != null;

    for (const { type, name } of BO1_SPEEDRUN_TYPES) {
      if (type === 'ROUND_200_SPEEDRUN' && !hasR200) continue;
      if (type === 'EASTER_EGG_SPEEDRUN' && !hasEe) continue;
      // Call of the Dead: EE speedruns are per-EasterEgg, not per-Challenge; we don't create EE speedrun challenge
      if (map.slug === 'call-of-the-dead' && type === 'EASTER_EGG_SPEEDRUN') continue;

      if (existingTypes.has(type)) continue;
      if (!DRY_RUN) {
        await prisma.challenge.create({
          data: {
            name,
            slug: type.toLowerCase().replace(/_/g, '-'),
            type,
            mapId: map.id,
            xpReward: 0,
            isActive: true,
          },
        });
      }
      challengesCreated++;
    }
  }

  console.log(`   Deactivated: ${challengesDeactivated}, Created: ${challengesCreated}`);

  // 1b. Update Fly Trap on BO1 Der Riese: SIDE_QUEST → MAIN_QUEST with 500 XP
  const bo1DerRiese = maps.find((m) => m.slug === 'bo1-der-riese');
  if (bo1DerRiese) {
    const flyTrap = await prisma.easterEgg.findFirst({
      where: { mapId: bo1DerRiese.id, slug: 'fly-trap' },
    });
    if (flyTrap && (flyTrap.type !== 'MAIN_QUEST' || flyTrap.xpReward !== 500)) {
      if (!DRY_RUN) {
        await prisma.easterEgg.update({
          where: { id: flyTrap.id },
          data: { type: 'MAIN_QUEST', xpReward: 500 },
        });
      }
      console.log('   Updated Fly Trap (BO1 Der Riese): MAIN_QUEST, 500 XP');
    }
  }

  // 2. Replace BO1 achievements
  console.log('2. Updating BO1 achievements...');

  const mapsWithChallenges = await prisma.map.findMany({
    where: { gameId: game.id },
    include: {
      game: { select: { shortName: true } },
      challenges: { where: { isActive: true } },
      achievements: true,
      easterEggs: true,
    },
  });

  const existingBySlug = new Map<string, { id: string; xpReward: number; isActive: boolean; type: string }>();
  for (const map of mapsWithChallenges) {
    for (const a of map.achievements) {
      const key = `${map.id}:${a.slug}:${a.difficulty ?? ''}`;
      existingBySlug.set(key, { id: a.id, xpReward: a.xpReward, isActive: a.isActive, type: a.type });
    }
  }

  let achievementsCreated = 0;
  let achievementsUpdated = 0;

  for (const map of mapsWithChallenges) {
    const mapDefs = getMapAchievementDefinitions(map.slug, map.roundCap, map.game?.shortName ?? 'BO1');
    let speedrunDefs = getSpeedrunAchievementDefinitions(map.slug, map.game?.shortName ?? 'BO1');

    // Call of the Dead: add EE speedrun definitions for Stand-in and Ensemble Cast
    if (map.slug === 'call-of-the-dead') {
      const cotdEeDefs = getBo1CallOfTheDeadEeSpeedrunDefinitions();
      for (const def of cotdEeDefs) {
        const eeSlug = def.easterEggSlug;
        if (!eeSlug) continue;
        const ee = map.easterEggs.find((e) => e.slug === eeSlug);
        if (!ee) continue;
        speedrunDefs = [...speedrunDefs, { ...def, easterEggId: ee.id, easterEggSlug: undefined }];
      }
    }

    const defs = [...mapDefs, ...speedrunDefs];
    const challengesByType = Object.fromEntries(map.challenges.map((c) => [c.type, c]));

    for (const def of defs) {
      const criteria = def.criteria as { round?: number; challengeType?: string; isCap?: boolean; maxTimeSeconds?: number };
      const challengeType = criteria.challengeType;
      const challengeId = challengeType
        ? challengesByType[challengeType as keyof typeof challengesByType]?.id ?? null
        : null;

      const key = `${map.id}:${def.slug}:${def.difficulty ?? ''}`;
      const existing = existingBySlug.get(key);

      if (existing) {
        if (existing.xpReward !== def.xpReward && !DRY_RUN) {
          await prisma.achievement.update({
            where: { id: existing.id },
            data: { xpReward: def.xpReward },
          });
          achievementsUpdated++;
        }
        existingBySlug.delete(key);
      } else {
        if (!DRY_RUN) {
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
              easterEggId: def.easterEggId ?? undefined,
              difficulty: def.difficulty ?? undefined,
            },
          });
        }
        achievementsCreated++;
      }
    }
  }

  let achievementsDeactivated = 0;
  for (const entry of Array.from(existingBySlug.values())) {
    const { id, isActive, type } = entry;
    // NEVER deactivate main easter egg completion achievements (EASTER_EGG_COMPLETE)
    if (type === 'EASTER_EGG_COMPLETE') continue;
    if (isActive && !DRY_RUN) {
      await prisma.achievement.update({
        where: { id },
        data: { isActive: false },
      });
      achievementsDeactivated++;
    }
  }

  console.log(`   Created: ${achievementsCreated}, Updated: ${achievementsUpdated}, Deactivated: ${achievementsDeactivated}`);

  // 3. Recalculate user totalXp
  console.log('3. Recalculating user XP...');

  const users = await prisma.user.findMany({
    select: { id: true },
  });

  let usersUpdated = 0;
  for (const user of users) {
    const uas = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: { select: { xpReward: true, isActive: true } } },
    });
    const totalXp = uas
      .filter((ua) => ua.achievement.isActive)
      .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);

    const verifiedUas = await prisma.userAchievement.findMany({
      where: { userId: user.id, verifiedAt: { not: null } },
      include: { achievement: { select: { xpReward: true, isActive: true } } },
    });
    const verifiedTotalXp = verifiedUas
      .filter((ua) => ua.achievement.isActive)
      .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);

    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { totalXp: true, level: true, verifiedTotalXp: true },
    });

    const { getLevelFromXp } = await import('../src/lib/ranks');
    const needsUpdate =
      (current && current.totalXp !== totalXp) ||
      (current && (current.verifiedTotalXp ?? 0) !== verifiedTotalXp);

    if (needsUpdate) {
      const { level } = getLevelFromXp(totalXp);
      if (!DRY_RUN) {
        await prisma.user.update({
          where: { id: user.id },
          data: { totalXp, level, verifiedTotalXp },
        });
      }
      usersUpdated++;
    }
  }

  console.log(`   Users updated: ${usersUpdated}`);

  if (DRY_RUN) {
    console.log('\n*** Dry run complete. Run without --dry-run to apply. ***');
  } else {
    console.log('\nBO1 balance patch applied successfully.');
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
