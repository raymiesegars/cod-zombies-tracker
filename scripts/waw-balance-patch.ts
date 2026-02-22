/**
 * WAW Balance Patch Migration
 *
 * SAFE: Only affects WAW game maps. No truncation, no deletion of user logs.
 * - Deactivates challenges that don't exist per map (isActive=false)
 * - Creates new challenges (First Room Jug/Quick for Verruckt, speedruns for all WAW)
 * - Replaces WAW achievements with WR-based definitions; recalculates user XP
 *
 * Run AFTER schema migration (20260228000000_waw_balance_patch).
 *
 * Usage:
 *   pnpm exec tsx scripts/waw-balance-patch.ts           # Run against .env.local (dev)
 *   pnpm exec tsx scripts/waw-balance-patch.ts --dry-run  # Preview without writing
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
import { getMapAchievementDefinitions, getSpeedrunAchievementDefinitions } from '../src/lib/achievements/seed-achievements';
import { WAW_MAP_CONFIG, type WaWMapSlug } from '../src/lib/waw/waw-map-config';
import type { ChallengeType } from '@prisma/client';

const DRY_RUN = process.argv.includes('--dry-run');

const WAW_SPEEDRUN_TYPES: { type: ChallengeType; name: string }[] = [
  { type: 'ROUND_30_SPEEDRUN', name: 'Round 30 Speedrun' },
  { type: 'ROUND_50_SPEEDRUN', name: 'Round 50 Speedrun' },
  { type: 'ROUND_70_SPEEDRUN', name: 'Round 70 Speedrun' },
  { type: 'ROUND_100_SPEEDRUN', name: 'Round 100 Speedrun' },
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

  const game = await prisma.game.findFirst({ where: { shortName: 'WAW' } });
  if (!game) {
    console.log('WAW game not found. Exiting.');
    return;
  }

  const maps = await prisma.map.findMany({
    where: { gameId: game.id },
    include: { challenges: true },
  });

  if (maps.length === 0) {
    console.log('No WAW maps found. Exiting.');
    return;
  }

  // 1. Update challenge isActive per map
  console.log('1. Updating challenge visibility (isActive)...');
  let challengesDeactivated = 0;
  let challengesCreated = 0;

  for (const map of maps) {
    const cfg = WAW_MAP_CONFIG[map.slug as WaWMapSlug];
    if (!cfg) continue;

    const allowedTypes = new Set(cfg.challengeTypes);
    // Speedruns: allow R30/R50/R70/R100 for all WAW; add EE speedrun for Der Riese
    if (cfg.speedrunWRs) {
      allowedTypes.add('ROUND_30_SPEEDRUN');
      allowedTypes.add('ROUND_50_SPEEDRUN');
      allowedTypes.add('ROUND_70_SPEEDRUN');
      allowedTypes.add('ROUND_100_SPEEDRUN');
      if (cfg.eeSpeedrunWR != null) allowedTypes.add('EASTER_EGG_SPEEDRUN');
    }

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

    // Create new challenges: Verruckt First Room variants, speedruns
    const existingTypes = new Set(map.challenges.map((c) => c.type));

    if (map.slug === 'verruckt') {
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

    const speedrunTypesToCreate = map.slug === 'der-riese'
      ? WAW_SPEEDRUN_TYPES
      : WAW_SPEEDRUN_TYPES.filter((s) => s.type !== 'EASTER_EGG_SPEEDRUN');

    for (const { type, name } of speedrunTypesToCreate) {
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

  // 2. Replace WAW achievements
  console.log('2. Updating WAW achievements...');

  const mapsWithChallenges = await prisma.map.findMany({
    where: { gameId: game.id },
    include: {
      game: { select: { shortName: true } },
      challenges: { where: { isActive: true } },
      achievements: true,
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
    const mapDefs = getMapAchievementDefinitions(map.slug, map.roundCap, map.game?.shortName ?? 'WAW');
    const speedrunDefs = getSpeedrunAchievementDefinitions(map.slug, map.game?.shortName ?? 'WAW');
    const defs = [...mapDefs, ...speedrunDefs];

    const challengesByType = Object.fromEntries(map.challenges.map((c) => [c.type, c]));

    for (const def of defs) {
      const criteria = def.criteria as { round?: number; challengeType?: string; isCap?: boolean; maxTimeSeconds?: number };
      const challengeId = criteria.challengeType
        ? challengesByType[criteria.challengeType as keyof typeof challengesByType]?.id ?? null
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
    console.log('\nWAW balance patch applied successfully.');
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
