/**
 * Remove duplicate EASTER_EGG_COMPLETE achievements.
 * Keeps one per (mapId, name). Reassigns UserAchievement to the kept one before deleting.
 *
 * Safe: No user data removed. UserAchievement records are migrated to the primary achievement.
 *
 * Run: pnpm run db:dedupe-ee-achievements
 * Dry run: pnpm run db:dedupe-ee-achievements -- --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local last so it overrides .env.production when running locally
const root = path.resolve(__dirname, '..');
for (const file of ['.env', '.env.production', '.env.local']) {
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

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL');
    process.exit(1);
  }

  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('DRY RUN (no changes will be made)\n');

  console.log('Finding duplicate EASTER_EGG_COMPLETE achievements...');

  const eeAchievements = await prisma.achievement.findMany({
    where: { type: 'EASTER_EGG_COMPLETE', isActive: true },
    include: { easterEgg: { select: { id: true, mapId: true, name: true } } },
    orderBy: { id: 'asc' },
  });

  // Group by (mapId, name) - same EE achievement can appear multiple times (e.g. orphan + linked)
  const groups = new Map<string, typeof eeAchievements>();
  for (const a of eeAchievements) {
    const key = `${a.mapId ?? 'n'}::${a.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }

  let deleted = 0;
  for (const [, list] of Array.from(groups.entries())) {
    if (list.length <= 1) continue;

    // Keep first (prefer one with easterEggId set)
    const sorted = [...list].sort((a, b) => {
      if (a.easterEggId && !b.easterEggId) return -1;
      if (!a.easterEggId && b.easterEggId) return 1;
      return 0;
    });
    const keep = sorted[0]!;
    const duplicates = sorted.slice(1);

    for (const dup of duplicates) {
      if (!dryRun) {
        // Reassign UserAchievement: move unlocks to "keep", or delete if user already has keep
        const dupUnlocks = await prisma.userAchievement.findMany({
          where: { achievementId: dup.id },
        });
        for (const ua of dupUnlocks) {
          const hasKeep = await prisma.userAchievement.findUnique({
            where: {
              userId_achievementId: { userId: ua.userId, achievementId: keep.id },
            },
          });
          if (hasKeep) {
            await prisma.userAchievement.delete({ where: { id: ua.id } });
          } else {
            await prisma.userAchievement.update({
              where: { id: ua.id },
              data: { achievementId: keep.id },
            });
          }
        }
        await prisma.achievement.delete({ where: { id: dup.id } });
      }
      deleted++;
      console.log(`  ${dryRun ? 'Would delete' : 'Deleted'} duplicate: "${dup.name}" (${dup.slug}) on map ${dup.mapId}`);
    }
  }

  if (deleted > 0) {
    console.log(`\nRemoved ${deleted} duplicate achievement(s).`);
  } else {
    console.log('No duplicates found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
