/**
 * Revalidate XP for users with tiered achievements (round-based, speedrun).
 *
 * Run after sync-achievements when XP values change. Finds users who have
 * ROUND_MILESTONE or CHALLENGE_COMPLETE (round/speedrun) achievements unlocked,
 * recalculates their totalXp and verifiedTotalXp, then updates User.
 *
 * Usage:
 *   pnpm db:revalidate-tiered-xp              # Sync + recalc for affected users
 *   pnpm db:revalidate-tiered-xp --skip-sync  # Skip sync (run sync-achievements separately first)
 *   pnpm db:revalidate-tiered-xp --dry-run    # Preview only
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

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
import { getLevelFromXp } from '../src/lib/ranks';

const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_SYNC = process.argv.includes('--skip-sync');

function isTieredAchievement(a: { type: string; criteria: unknown }): boolean {
  if (a.type === 'ROUND_MILESTONE') return true;
  if (a.type !== 'CHALLENGE_COMPLETE') return false;
  const c = a.criteria as Record<string, unknown> | null;
  if (!c) return false;
  return c.round != null || c.maxTimeSeconds != null;
}

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  if (!SKIP_SYNC && !DRY_RUN) {
    console.log('1. Running sync-achievements to update Achievement.xpReward...');
    const res = spawnSync('pnpm', ['db:sync-achievements'], {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env },
    });
    if (res.status !== 0) {
      console.error('sync-achievements failed.');
      process.exit(res.status ?? 1);
    }
    console.log('');
  } else if (SKIP_SYNC) {
    console.log('1. Skipping sync (--skip-sync). Ensure you ran pnpm db:sync-achievements first.\n');
  }

  console.log('2. Finding tiered achievements (round-based, speedrun)...');
  const allAchievements = await prisma.achievement.findMany({
    where: { isActive: true },
    select: { id: true, type: true, criteria: true },
  });
  const tieredIds = new Set(
    allAchievements.filter(isTieredAchievement).map((a) => a.id)
  );
  console.log(`   Found ${tieredIds.size} tiered achievements.\n`);

  console.log('3. Finding users who have tiered achievements unlocked...');
  const userAchievements = await prisma.userAchievement.findMany({
    where: { achievementId: { in: Array.from(tieredIds) } },
    select: { userId: true },
    distinct: ['userId'],
  });
  const affectedUserIds = userAchievements.map((ua) => ua.userId);
  console.log(`   Found ${affectedUserIds.length} affected users.\n`);

  if (affectedUserIds.length === 0) {
    console.log('No users to update.');
    await prisma.$disconnect();
    return;
  }

  console.log('4. Recalculating totalXp, level, verifiedTotalXp...');
  let usersUpdated = 0;
  for (const userId of affectedUserIds) {
    const uas = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: { select: { xpReward: true, isActive: true } } },
    });
    const totalXp = uas
      .filter((ua) => ua.achievement.isActive)
      .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
    const verifiedTotalXp = uas
      .filter((ua) => ua.achievement.isActive && ua.verifiedAt != null)
      .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);

    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true, level: true, verifiedTotalXp: true },
    });
    const needsUpdate =
      current &&
      ((current.totalXp ?? 0) !== totalXp ||
        (current.verifiedTotalXp ?? 0) !== verifiedTotalXp);

    if (needsUpdate && !DRY_RUN) {
      const { level } = getLevelFromXp(totalXp);
      await prisma.user.update({
        where: { id: userId },
        data: { totalXp, level, verifiedTotalXp },
      });
      usersUpdated++;
      if (usersUpdated % 100 === 0) {
        console.log(`   Updated ${usersUpdated}/${affectedUserIds.length}...`);
      }
    }
  }

  if (DRY_RUN) {
    console.log(`   [DRY] Would recalc for ${affectedUserIds.length} users.`);
  } else {
    console.log(`   Updated ${usersUpdated} users.`);
  }

  console.log('\nRevalidate complete.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
