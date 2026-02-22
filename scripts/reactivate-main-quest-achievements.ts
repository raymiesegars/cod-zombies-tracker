/**
 * Re-activate Main Quest Easter Egg Completion Achievements
 *
 * Balance patches (WAW, BO1, BO2) incorrectly deactivated EASTER_EGG_COMPLETE achievements
 * because they were not in the defs list. This script restores them so users who had
 * completed main quests get their achievements and XP back.
 *
 * Run this before or with your next push to restore everyone's main quest completion achievements.
 *
 * Usage:
 *   pnpm exec tsx scripts/reactivate-main-quest-achievements.ts           # Apply
 *   pnpm exec tsx scripts/reactivate-main-quest-achievements.ts --dry-run  # Preview only
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

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  // 1. Find all EASTER_EGG_COMPLETE achievements that were wrongly deactivated
  const toReactivate = await prisma.achievement.findMany({
    where: {
      type: 'EASTER_EGG_COMPLETE',
      isActive: false,
    },
    include: {
      map: { select: { name: true, slug: true, game: { select: { shortName: true } } } },
    },
  });

  console.log(`Found ${toReactivate.length} main quest completion achievements to re-activate`);

  if (toReactivate.length === 0) {
    console.log('Nothing to do.');
    await prisma.$disconnect();
    return;
  }

  for (const a of toReactivate) {
    console.log(`  - ${a.map?.game?.shortName} / ${a.map?.name}: "${a.name}" (${a.slug})`);
  }

  let reactivated = 0;
  if (!DRY_RUN) {
    const result = await prisma.achievement.updateMany({
      where: {
        type: 'EASTER_EGG_COMPLETE',
        isActive: false,
      },
      data: { isActive: true },
    });
    reactivated = result.count;
    console.log(`\nRe-activated ${reactivated} achievements.`);
  }

  // 2. Recalculate XP for users who have UserAchievement for these (so their totals reflect restored XP)
  const achievementIds = toReactivate.map((a) => a.id);
  const usersWithAffectedAchievements = await prisma.userAchievement.findMany({
    where: { achievementId: { in: achievementIds } },
    select: { userId: true },
    distinct: ['userId'],
  });
  const userIds = usersWithAffectedAchievements.map((ua) => ua.userId);
  console.log(`\n${userIds.length} users have these achievements unlocked; recalculating their XP...`);

  const { getLevelFromXp } = await import('../src/lib/ranks');
  let usersUpdated = 0;

  for (const userId of userIds) {
    const uas = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: { select: { xpReward: true, isActive: true } } },
    });
    const totalXp = uas
      .filter((ua) => ua.achievement.isActive)
      .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);

    const verifiedUas = await prisma.userAchievement.findMany({
      where: { userId, verifiedAt: { not: null } },
      include: { achievement: { select: { xpReward: true, isActive: true } } },
    });
    const verifiedTotalXp = verifiedUas
      .filter((ua) => ua.achievement.isActive)
      .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);

    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true, level: true, verifiedTotalXp: true },
    });

    const needsUpdate =
      current &&
      (current.totalXp !== totalXp || (current.verifiedTotalXp ?? 0) !== verifiedTotalXp);

    if (needsUpdate && !DRY_RUN) {
      const { level } = getLevelFromXp(totalXp);
      await prisma.user.update({
        where: { id: userId },
        data: { totalXp, level, verifiedTotalXp },
      });
      usersUpdated++;
    }
  }

  console.log(`   Users updated: ${usersUpdated}`);

  if (DRY_RUN) {
    console.log('\n*** Dry run complete. Run without --dry-run to apply. ***');
  } else {
    console.log('\nMain quest achievements re-activated successfully.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
