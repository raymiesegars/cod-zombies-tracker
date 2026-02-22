/**
 * BO2 Balance Patch Migration
 *
 * SAFE: Only affects BO2 game maps. No truncation, no deletion of user logs.
 * - Deactivates challenges that don't exist per map (isActive=false)
 * - Creates new challenges (NO_MAGIC, round speedruns, EE speedruns)
 * - Replaces BO2 achievements with WR-based definitions; recalculates user XP
 * - Tranzit, Die Rise, Buried: separate EE speedrun achievements for Richtofen vs Maxis
 *
 * Run AFTER schema migration (20260230000000_add_no_magic_and_bo2_bank).
 *
 * Usage:
 *   pnpm exec tsx scripts/bo2-balance-patch.ts           # Run against .env.local (dev)
 *   pnpm exec tsx scripts/bo2-balance-patch.ts --dry-run  # Preview without writing
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
  getBo2EeSpeedrunDefinitions,
} from '../src/lib/achievements/seed-achievements';
import { BO2_MAP_CONFIG, type Bo2MapSlug } from '../src/lib/bo2/bo2-map-config';
import type { ChallengeType } from '@prisma/client';

const DRY_RUN = process.argv.includes('--dry-run');

const BO2_SPEEDRUN_TYPES: { type: ChallengeType; name: string }[] = [
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

  const game = await prisma.game.findFirst({ where: { shortName: 'BO2' } });
  if (!game) {
    console.log('BO2 game not found. Exiting.');
    return;
  }

  const maps = await prisma.map.findMany({
    where: { gameId: game.id },
    include: { challenges: true },
  });

  if (maps.length === 0) {
    console.log('No BO2 maps found. Exiting.');
    return;
  }

  // 1. Update challenge isActive per map and create missing challenges
  console.log('1. Updating challenge visibility (isActive) and creating missing challenges...');
  let challengesDeactivated = 0;
  let challengesCreated = 0;

  for (const map of maps) {
    const cfg = BO2_MAP_CONFIG[map.slug as Bo2MapSlug];
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
    const speedrunTypeSet = new Set(BO2_SPEEDRUN_TYPES.map((s) => s.type));

    // Create non-speedrun challenges (NO_MAGIC, etc.)
    for (const t of Array.from(allowedTypes)) {
      if (speedrunTypeSet.has(t)) continue; // speedruns handled below
      if (existingTypes.has(t)) continue;
      const name = t === 'NO_MAGIC' ? 'No Magic' : t.replace(/_/g, ' ');
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
      existingTypes.add(t);
      challengesCreated++;
    }

    // Create speedrun challenges (round speedruns; EE speedruns use EasterEggLog)
    const speedrunToCreate = BO2_SPEEDRUN_TYPES.filter(({ type }) => {
      if (type === 'ROUND_200_SPEEDRUN' && !cfg.speedrunWRs?.r200) return false;
      if (type === 'ROUND_100_SPEEDRUN' && !cfg.speedrunWRs?.r100) return false;
      if (type === 'EASTER_EGG_SPEEDRUN') return allowedTypes.has(type); // Mob, Origins have single EE
      return allowedTypes.has(type);
    });

    for (const { type, name } of speedrunToCreate) {
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

  // 2. Replace BO2 achievements
  console.log('2. Updating BO2 achievements...');

  const mapsWithChallenges = await prisma.map.findMany({
    where: { gameId: game.id },
    include: {
      game: { select: { shortName: true } },
      challenges: { where: { isActive: true } },
      achievements: true,
      easterEggs: true,
    },
  });

  const existingBySlug = new Map<string, { id: string; xpReward: number; isActive: boolean }>();
  for (const map of mapsWithChallenges) {
    for (const a of map.achievements) {
      const key = `${map.id}:${a.slug}:${a.difficulty ?? ''}`;
      existingBySlug.set(key, { id: a.id, xpReward: a.xpReward, isActive: a.isActive });
    }
  }

  let achievementsCreated = 0;
  let achievementsUpdated = 0;

  for (const map of mapsWithChallenges) {
    const mapDefs = getMapAchievementDefinitions(map.slug, 0, map.game?.shortName ?? 'BO2');
    let speedrunDefs = getSpeedrunAchievementDefinitions(map.slug, map.game?.shortName ?? 'BO2');

    // Tranzit, Die Rise, Buried: add EE speedrun definitions for Richtofen and Maxis
    const bo2EeDefs = getBo2EeSpeedrunDefinitions(map.slug);
    for (const def of bo2EeDefs) {
      const eeSlug = def.easterEggSlug;
      if (!eeSlug) continue;
      const ee = map.easterEggs.find((e) => e.slug === eeSlug);
      if (!ee) continue;
      speedrunDefs = [...speedrunDefs, { ...def, easterEggId: ee.id, easterEggSlug: undefined }];
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
  for (const { id, isActive } of Array.from(existingBySlug.values())) {
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
    console.log('\nBO2 balance patch applied successfully.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
