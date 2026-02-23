/**
 * BO6 Balance Patch Migration
 *
 * SAFE: Only affects BO6 game maps. No truncation, no deletion of user logs.
 * - Deactivates challenges that don't exist per map (isActive=false)
 * - Creates new challenges (including ROUND_999_SPEEDRUN, BUILD_EE_SPEEDRUN where applicable)
 * - Replaces BO6 achievements with WR-based definitions; recalculates user XP
 *
 * Run AFTER schema migration (20260303000000_add_round_999_speedrun).
 *
 * Usage:
 *   pnpm exec tsx scripts/bo6-balance-patch.ts           # Run against .env.local (dev)
 *   pnpm exec tsx scripts/bo6-balance-patch.ts --dry-run  # Preview without writing
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
} from '../src/lib/achievements/seed-achievements';
import { BO6_MAP_CONFIG, getBo6ChallengeTypeLabel, type Bo6MapSlug } from '../src/lib/bo6/bo6-map-config';
import type { ChallengeType } from '@prisma/client';

const DRY_RUN = process.argv.includes('--dry-run');

const BO6_SPEEDRUN_TYPES: { type: ChallengeType; name: string }[] = [
  { type: 'ROUND_30_SPEEDRUN', name: 'Round 30 Speedrun' },
  { type: 'ROUND_50_SPEEDRUN', name: 'Round 50 Speedrun' },
  { type: 'ROUND_70_SPEEDRUN', name: 'Round 70 Speedrun' },
  { type: 'ROUND_100_SPEEDRUN', name: 'Round 100 Speedrun' },
  { type: 'ROUND_200_SPEEDRUN', name: 'Round 200 Speedrun' },
  { type: 'ROUND_999_SPEEDRUN', name: 'Round 999 Speedrun' },
  { type: 'EXFIL_SPEEDRUN', name: 'Exfil Round 11' },
  { type: 'EXFIL_R21_SPEEDRUN', name: 'Exfil Round 21' },
  { type: 'BUILD_EE_SPEEDRUN', name: 'Build% EE Speedrun' },
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

  const game = await prisma.game.findFirst({ where: { shortName: 'BO6' } });
  if (!game) {
    console.log('BO6 game not found. Exiting.');
    return;
  }

  const maps = await prisma.map.findMany({
    where: { gameId: game.id },
    include: { challenges: true },
  });

  if (maps.length === 0) {
    console.log('No BO6 maps found. Exiting.');
    return;
  }

  console.log('1. Updating challenge visibility (isActive) and creating missing challenges...');
  let challengesDeactivated = 0;
  let challengesCreated = 0;

  for (const map of maps) {
    const cfg = BO6_MAP_CONFIG[map.slug as Bo6MapSlug];
    if (!cfg) continue;

    const allowedTypes = new Set(cfg.challengeTypes);
    const speedrunTypeSet = new Set(BO6_SPEEDRUN_TYPES.map((s) => s.type));

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

    for (const t of Array.from(allowedTypes)) {
      if (speedrunTypeSet.has(t)) continue;
      if (existingTypes.has(t)) continue;
      const name = getBo6ChallengeTypeLabel(t) || t.replace(/_/g, ' ');
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

    const speedrunToCreate = BO6_SPEEDRUN_TYPES.filter(({ type }) => {
      if (type === 'BUILD_EE_SPEEDRUN' && !cfg.speedrunWRs?.buildEeSpeedrunWR) return false;
      if (type === 'ROUND_999_SPEEDRUN' && !cfg.speedrunWRs?.r999) return false;
      if (type === 'EXFIL_SPEEDRUN' && !cfg.speedrunWRs?.exfilSpeedrunWR) return false;
      if (type === 'EXFIL_R21_SPEEDRUN' && !cfg.speedrunWRs?.exfilR21SpeedrunWR) return false;
      if (type === 'ROUND_30_SPEEDRUN' && !cfg.speedrunWRs?.r30) return false;
      if (type === 'ROUND_50_SPEEDRUN' && !cfg.speedrunWRs?.r50) return false;
      if (type === 'ROUND_70_SPEEDRUN' && !cfg.speedrunWRs?.r70) return false;
      if (type === 'ROUND_100_SPEEDRUN' && !cfg.speedrunWRs?.r100) return false;
      if (type === 'ROUND_200_SPEEDRUN' && !cfg.speedrunWRs?.r200) return false;
      if (type === 'EASTER_EGG_SPEEDRUN' && !cfg.speedrunWRs?.eeSpeedrunWR) return false;
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

  console.log('2. Updating BO6 achievements...');

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
      existingBySlug.set(`${map.id}:${a.slug}`, { id: a.id, xpReward: a.xpReward, isActive: a.isActive, type: a.type });
    }
  }

  let achievementsCreated = 0;
  let achievementsUpdated = 0;

  for (const map of mapsWithChallenges) {
    const mapDefs = getMapAchievementDefinitions(map.slug, 0, map.game?.shortName ?? 'BO6');
    const speedrunDefs = getSpeedrunAchievementDefinitions(map.slug, map.game?.shortName ?? 'BO6');
    const defs = [...mapDefs, ...speedrunDefs];
    const challengesByType = Object.fromEntries(map.challenges.map((c) => [c.type, c]));

    for (const def of defs) {
      const criteria = def.criteria as { round?: number; challengeType?: string };
      const challengeType = criteria.challengeType;
      const challengeId = challengeType
        ? challengesByType[challengeType as keyof typeof challengesByType]?.id ?? null
        : null;

      const key = `${map.id}:${def.slug}`;
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

  console.log('3. Recalculating user XP (totalXp and verifiedTotalXp)...');

  const users = await prisma.user.findMany({ select: { id: true } });
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
    console.log('\nBO6 balance patch applied successfully.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
