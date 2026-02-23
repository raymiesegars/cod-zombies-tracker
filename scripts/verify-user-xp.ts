/**
 * Verify a user's XP: compare stored totalXp/verifiedTotalXp to sum of UserAchievement.
 * Usage: pnpm exec tsx scripts/verify-user-xp.ts [displayName-or-username]
 * Default: Raymie
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

const search = process.argv[2] || 'Raymie';

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { displayName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      totalXp: true,
      verifiedTotalXp: true,
    },
  });

  if (!user) {
    console.log(`No user found matching "${search}"`);
    await prisma.$disconnect();
    return;
  }

  const [challengeRuns, verifiedChallengeRuns, eeRuns, verifiedEeRuns, achievements] = await Promise.all([
    prisma.challengeLog.count({ where: { userId: user.id } }),
    prisma.challengeLog.count({ where: { userId: user.id, isVerified: true } }),
    prisma.easterEggLog.count({ where: { userId: user.id } }),
    prisma.easterEggLog.count({ where: { userId: user.id, isVerified: true } }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: { include: { map: { select: { name: true } } } } },
    }),
  ]);

  const activeAchievements = achievements.filter((ua) => ua.achievement.isActive);
  const computedTotalXp = activeAchievements.reduce((s, ua) => s + ua.achievement.xpReward, 0);
  const verifiedAchievements = activeAchievements.filter((ua) => ua.verifiedAt != null);
  const computedVerifiedXp = verifiedAchievements.reduce((s, ua) => s + ua.achievement.xpReward, 0);

  const totalRuns = challengeRuns + eeRuns;
  const verifiedRuns = verifiedChallengeRuns + verifiedEeRuns;

  console.log('\n=== User ===');
  console.log(`Username: ${user.username}`);
  console.log(`Display: ${user.displayName}`);
  console.log(`Stored totalXp: ${(user.totalXp ?? 0).toLocaleString()}`);
  console.log(`Stored verifiedTotalXp: ${(user.verifiedTotalXp ?? 0).toLocaleString()}`);
  console.log(`Runs: ${totalRuns} total (${challengeRuns} challenge, ${eeRuns} EE)`);
  console.log(`Verified runs: ${verifiedRuns} (${verifiedChallengeRuns} challenge, ${verifiedEeRuns} EE)`);

  console.log('\n=== XP Verification ===');
  console.log(`Computed total XP (from achievements): ${computedTotalXp.toLocaleString()}`);
  console.log(`Computed verified XP: ${computedVerifiedXp.toLocaleString()}`);
  console.log(`Achievements unlocked: ${activeAchievements.length} (${verifiedAchievements.length} verified)`);

  const totalMatch = (user.totalXp ?? 0) === computedTotalXp;
  const verifiedMatch = (user.verifiedTotalXp ?? 0) === computedVerifiedXp;

  if (totalMatch && verifiedMatch) {
    console.log('\n✓ Stored XP matches computed XP.');
  } else {
    console.log('\n⚠ MISMATCH:');
    if (!totalMatch) console.log(`  totalXp: stored ${user.totalXp} vs computed ${computedTotalXp}`);
    if (!verifiedMatch) console.log(`  verifiedTotalXp: stored ${user.verifiedTotalXp} vs computed ${computedVerifiedXp}`);
  }

  // Breakdown by map
  const byMap = new Map<string, { achievements: number; xp: number; verified: number }>();
  for (const ua of activeAchievements) {
    const mapName = ua.achievement.map?.name ?? '(global)';
    const cur = byMap.get(mapName) ?? { achievements: 0, xp: 0, verified: 0 };
    cur.achievements++;
    cur.xp += ua.achievement.xpReward;
    if (ua.verifiedAt) cur.verified++;
    byMap.set(mapName, cur);
  }

  const sorted = Array.from(byMap.entries()).sort((a, b) => b[1].xp - a[1].xp).slice(0, 15);

  console.log('\n=== Top maps by XP ===');
  for (const [mapName, data] of sorted) {
    console.log(`  ${mapName}: ${data.xp.toLocaleString()} XP (${data.achievements} achievements, ${data.verified} verified)`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
