/**
 * Sync Achievements (production-safe)
 *
 * Upserts Achievement rows from getMapAchievementDefinitions + getSpeedrunAchievementDefinitions
 * for every map. Does NOT truncate or delete any data. Safe to run on production.
 *
 * - CREATES new achievements that don't exist (by mapId + slug + difficulty).
 * - UPDATES existing achievements (name, criteria, xpReward, rarity, challengeId) so they match
 *   current definitions (e.g. after rebalance).
 * - Does NOT delete Achievement rows (so existing UserAchievement references stay valid).
 * - Does NOT touch UserAchievement, ChallengeLog, EasterEggLog, User, or any other table.
 *
 * Run after changing seed-achievements or speedrun-tiers. Then run reunlock-achievements
 * and recompute-verified-xp so users get new unlocks and verified XP.
 *
 * Usage:
 *   pnpm db:sync-achievements           # Run and upsert
 *   pnpm db:sync-achievements --dry-run # Log what would be created/updated, no writes
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { getMapAchievementDefinitions, getSpeedrunAchievementDefinitions } from '../src/lib/achievements/seed-achievements';

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

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
});

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

  const allMaps = await prisma.map.findMany({
    include: {
      game: { select: { shortName: true } },
      challenges: { where: { isActive: true } },
    },
  });

  let created = 0;
  let updated = 0;

  let pruned = 0;

  for (const map of allMaps) {
    const gameShortName = map.game?.shortName ?? '';
    const mapDefs = getMapAchievementDefinitions(map.slug, map.roundCap, gameShortName);
    const speedrunDefs = getSpeedrunAchievementDefinitions(map.slug, gameShortName);
    const defs = [...mapDefs, ...speedrunDefs];
    const currentKeys = new Set(defs.map((d) => `${d.slug}\0${(d.difficulty ?? null) ?? ''}`));
    const challengesByType = Object.fromEntries(map.challenges.map((c) => [c.type, c]));

    for (const def of defs) {
      const criteria = def.criteria as { challengeType?: string; difficulty?: string };
      const challengeId = criteria.challengeType
        ? (challengesByType[criteria.challengeType as keyof typeof challengesByType] as { id: string } | undefined)?.id
        : null;

      const difficulty = def.difficulty ?? null;
      const data = {
        mapId: map.id,
        name: def.name,
        slug: def.slug,
        type: def.type,
        rarity: def.rarity,
        xpReward: def.xpReward,
        criteria: def.criteria as object,
        challengeId: challengeId ?? null,
        difficulty,
        isActive: true,
      };

      const existing = await prisma.achievement.findFirst({
        where: {
          mapId: map.id,
          slug: def.slug,
          difficulty: difficulty ?? null,
        },
      });

      if (DRY_RUN) {
        if (existing) {
          updated++;
          if (updated <= 3) {
            console.log(`Would update: ${map.slug} / ${def.slug} (${def.name})`);
          }
        } else {
          created++;
          if (created <= 3) {
            console.log(`Would create: ${map.slug} / ${def.slug} (${def.name})`);
          }
        }
        continue;
      }

      if (existing) {
        await prisma.achievement.update({
          where: { id: existing.id },
          data: {
            name: data.name,
            type: data.type,
            rarity: data.rarity,
            xpReward: data.xpReward,
            criteria: data.criteria,
            challengeId: data.challengeId ?? undefined,
            isActive: data.isActive,
          },
        });
        updated++;
      } else {
        await prisma.achievement.create({
          data: {
            ...data,
            challengeId: data.challengeId ?? undefined,
          },
        });
        created++;
      }
    }

    // Prune: deactivate achievements for this map that are no longer in defs (removes obsolete bands)
    if (!DRY_RUN && currentKeys.size > 0) {
      const existingAchievements = await prisma.achievement.findMany({
        where: { mapId: map.id, isActive: true },
        select: { id: true, slug: true, difficulty: true },
      });
      for (const a of existingAchievements) {
        const key = `${a.slug}\0${a.difficulty ?? ''}`;
        if (!currentKeys.has(key)) {
          await prisma.achievement.update({
            where: { id: a.id },
            data: { isActive: false },
          });
          pruned++;
        }
      }
    }
  }

  if (pruned > 0) {
    console.log(`Pruned (deactivated) ${pruned} obsolete achievements.`);
  }
  console.log(DRY_RUN ? `Would create ${created}, update ${updated} achievements.` : `Created ${created}, updated ${updated} achievements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
