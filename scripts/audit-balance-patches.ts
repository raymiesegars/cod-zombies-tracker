/**
 * Audit what balance patches WOULD do, without making any changes.
 * Reports achievements that would be deactivated (and could be reviewed for safety).
 *
 * Usage:
 *   pnpm exec tsx scripts/audit-balance-patches.ts
 *   GAMES=BO3,BO4 pnpm exec tsx scripts/audit-balance-patches.ts  # specific games
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
import { isRestrictedAchievement } from '../src/lib/achievements/categories';

const GAMES_FILTER = process.env.GAMES?.trim()
  ? new Set(process.env.GAMES.split(',').map((g) => g.trim().toUpperCase()))
  : new Set(['WAW', 'BO1', 'BO2', 'BO3', 'BO4', 'BOCW', 'BO6', 'BO7']);

function getKey(
  game: string,
  mapId: string,
  slug: string,
  difficulty: string | null
): string {
  const includeDiff = ['BO4', 'BO3', 'BO2', 'BO1', 'WAW'].includes(game);
  return includeDiff ? `${mapId}:${slug}:${difficulty ?? ''}` : `${mapId}:${slug}`;
}

async function main() {
  const games = await prisma.game.findMany({
    where: { shortName: { in: Array.from(GAMES_FILTER) } },
    include: {
      maps: {
        include: {
          achievements: true,
          easterEggs: true,
          challenges: { where: { isActive: true } },
        },
      },
    },
  });

  let totalWouldDeactivate = 0;
  let totalWouldCreate = 0;
  let totalWouldKeep = 0;
  let totalRestrictedKept = 0;

  for (const game of games) {
    const gameShortName = game.shortName ?? '';
    console.log(`\n========== ${gameShortName} ==========`);

    const defKeys = new Map<string, boolean>();
    const existingByKey = new Map<string, { id: string; name: string; slug: string; type: string; criteria: unknown }>();

    for (const map of game.maps) {
      const mapDefs = getMapAchievementDefinitions(map.slug, map.roundCap ?? 0, gameShortName);
      let speedrunDefs = getSpeedrunAchievementDefinitions(map.slug, gameShortName);
      const mainEe = map.easterEggs.find((e) => e.slug === 'main-quest')
        ?? map.easterEggs.find((e) => e.type === 'MAIN_QUEST');
      if (mainEe) {
        speedrunDefs = speedrunDefs.map((def) => {
          const c = def.criteria as { challengeType?: string };
          if (c.challengeType === 'EASTER_EGG_SPEEDRUN') {
            return { ...def, easterEggId: mainEe.id };
          }
          return def;
        });
      }
      const defs = [...mapDefs, ...speedrunDefs];
      for (const def of defs) {
        const key = getKey(gameShortName, map.id, def.slug, def.difficulty ?? null);
        defKeys.set(key, true);
      }
      for (const a of map.achievements) {
        const key = getKey(gameShortName, map.id, a.slug, a.difficulty);
        existingByKey.set(key, {
          id: a.id,
          name: a.name,
          slug: a.slug,
          type: a.type,
          criteria: a.criteria as unknown,
        });
      }
    }

    const wouldDeactivate: { name: string; slug: string; type: string; isRestricted: boolean }[] = [];
    const wouldKeep: string[] = [];
    const wouldSkipRestricted: { name: string; slug: string }[] = [];
    for (const [key, entry] of existingByKey) {
      if (defKeys.has(key)) {
        wouldKeep.push(entry.slug);
      } else if (entry.type !== 'EASTER_EGG_COMPLETE') {
        const isRestricted = isRestrictedAchievement({ criteria: entry.criteria as Record<string, unknown> });
        if (isRestricted) {
          wouldSkipRestricted.push({ name: entry.name, slug: entry.slug });
        } else {
          wouldDeactivate.push({
            name: entry.name,
            slug: entry.slug,
            type: entry.type,
            isRestricted: false,
          });
        }
      }
    }

    const defCount = defKeys.size;
    const existingCount = existingByKey.size;
    const createCount = Array.from(defKeys.keys()).filter((k) => !existingByKey.has(k)).length;

    totalWouldDeactivate += wouldDeactivate.length;
    totalWouldCreate += createCount;
    totalWouldKeep += wouldKeep.length;
    totalRestrictedKept += wouldSkipRestricted.length;

    console.log(`  Defs: ${defCount}, Existing: ${existingCount}, Would create: ${createCount}, Would keep: ${wouldKeep.length}, Would deactivate: ${wouldDeactivate.length}`);
    if (wouldSkipRestricted.length > 0) {
      console.log(`  ✓ Would KEEP ${wouldSkipRestricted.length} restricted (harder) achievements (balance patches now skip deactivating these)`);
    }
    if (wouldDeactivate.length > 0) {
      console.log(`  Would deactivate ${wouldDeactivate.length} (non-restricted) achievements`);
      wouldDeactivate.slice(0, 5).forEach((w) => console.log(`     - ${w.name} (${w.slug})`));
      if (wouldDeactivate.length > 5) console.log(`     ... and ${wouldDeactivate.length - 5} more`);
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Would keep: ${totalWouldKeep}`);
  console.log(`Would create: ${totalWouldCreate}`);
  console.log(`Would deactivate: ${totalWouldDeactivate}`);
  console.log(`\n✓ Balance patches NEVER deactivate restricted achievements (classics/fate only/no support). ${totalRestrictedKept} restricted achievements would stay active.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
