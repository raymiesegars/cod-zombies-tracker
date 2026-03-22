import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, type PlayerCount } from '@prisma/client';
import { processMapAchievements } from '../src/lib/achievements';
import { grantVerifiedAchievementsForMap } from '../src/lib/verified-xp';
import { getLevelFromXp } from '../src/lib/ranks';
import { getSoloWR, parseAchieved } from '../src/lib/achievements/number-ones-loader';
import { formatSpeedrunTime } from '../src/lib/achievements/speedrun-tiers';
import { parseCsv, parseAchieved as parseZwrAchieved } from './import-skrine-csv/run';

const ROOT = path.resolve(__dirname, '..');
const TOP_CSV_DIR = path.join(ROOT, 'top-178-csv');
const DRY_RUN = process.argv.includes('--dry-run');

function loadEnv() {
  for (const file of ['.env', '.env.local']) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) continue;
      const value = match[2]!.replace(/^["']|["']$/g, '').trim();
      process.env[match[1]!] = value;
    }
  }
}

function normalizeUrl(url: string | null | undefined): string {
  const raw = String(url ?? '').trim();
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '');
}

function csvPlayerCountToEnum(raw: string): PlayerCount | null {
  const n = parseInt(String(raw).trim(), 10);
  if (n === 1) return 'SOLO';
  if (n === 2) return 'DUO';
  if (n === 3) return 'TRIO';
  if (n === 4) return 'SQUAD';
  return null;
}

function buildLogKey(completionTimeSeconds: number, playerCount: PlayerCount, proofUrl: string): string {
  return `${completionTimeSeconds}|${playerCount}|${normalizeUrl(proofUrl)}`;
}

function classifyFinalReichEeSlug(subRecord: string): 'fireworks' | 'dark-reunion' | null {
  const s = subRecord.trim().toLowerCase();
  if (s.includes('hardcore-ee')) return 'dark-reunion';
  if (s.includes('casual-ee')) return 'fireworks';
  return null;
}

function buildEeTiersFromWr(
  wrSeconds: number,
  xpRewards: [number, number, number, number]
): Array<{ maxTimeSeconds: number; xpReward: number; rarity: 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' }> {
  return [
    { maxTimeSeconds: Math.round(wrSeconds * 1.5), xpReward: xpRewards[0], rarity: 'UNCOMMON' },
    { maxTimeSeconds: Math.round(wrSeconds * 1.2), xpReward: xpRewards[1], rarity: 'RARE' },
    { maxTimeSeconds: Math.round(wrSeconds * 1.1), xpReward: xpRewards[2], rarity: 'EPIC' },
    { maxTimeSeconds: Math.round(wrSeconds * 1.05), xpReward: xpRewards[3], rarity: 'LEGENDARY' },
  ];
}

async function recomputeUserXp(prisma: PrismaClient, userId: string) {
  const uas = await prisma.userAchievement.findMany({
    where: { userId },
    select: {
      verifiedAt: true,
      achievement: {
        select: {
          isActive: true,
          xpReward: true,
          map: { select: { game: { select: { shortName: true } } } },
          easterEgg: { select: { map: { select: { game: { select: { shortName: true } } } } } },
        },
      },
    },
  });

  let totalXp = 0;
  let customZombiesTotalXp = 0;
  let verifiedTotalXp = 0;
  let verifiedCustomZombiesTotalXp = 0;

  for (const ua of uas) {
    if (!ua.achievement.isActive) continue;
    const gameShortName = ua.achievement.map?.game?.shortName ?? ua.achievement.easterEgg?.map?.game?.shortName ?? null;
    const xp = ua.achievement.xpReward;
    const isCustom = gameShortName === 'BO3_CUSTOM';
    if (isCustom) customZombiesTotalXp += xp;
    else totalXp += xp;

    if (ua.verifiedAt) {
      if (isCustom) verifiedCustomZombiesTotalXp += xp;
      else verifiedTotalXp += xp;
    }
  }

  const { level } = getLevelFromXp(totalXp);
  if (!DRY_RUN) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXp,
        customZombiesTotalXp,
        verifiedTotalXp,
        verifiedCustomZombiesTotalXp,
        level,
      },
    });
  }
}

async function main() {
  loadEnv();
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
  });

  try {
    const map = await prisma.map.findUnique({
      where: { slug: 'the-final-reich' },
      select: {
        id: true,
        slug: true,
        game: { select: { shortName: true } },
        challenges: { where: { type: 'EASTER_EGG_SPEEDRUN' }, select: { id: true } },
        easterEggs: {
          where: { type: 'MAIN_QUEST' },
          select: { id: true, slug: true, name: true },
        },
      },
    });
    if (!map || map.game?.shortName !== 'WW2') throw new Error('The Final Reich map not found in WW2.');

    const fireworks = map.easterEggs.find((e) => e.slug === 'fireworks');
    const darkReunion = map.easterEggs.find((e) => e.slug === 'dark-reunion');
    const eeSpeedrunChallengeId = map.challenges[0]?.id;
    if (!fireworks || !darkReunion || !eeSpeedrunChallengeId) {
      throw new Error('Missing Final Reich main quest Easter eggs or EE speedrun challenge.');
    }

    const csvKeyToTargetEeId = new Map<string, string>();
    const csvFiles = fs.readdirSync(TOP_CSV_DIR).filter((f) => f.toLowerCase().endsWith('.csv'));
    for (const file of csvFiles) {
      const abs = path.join(TOP_CSV_DIR, file);
      const rows = parseCsv(fs.readFileSync(abs, 'utf-8'));
      for (const row of rows) {
        if (row.game !== 'wwii' || row.map !== 'the-final-reich' || row.record !== 'ee-speedrun') continue;
        const eeSlug = classifyFinalReichEeSlug(row.sub_record);
        if (!eeSlug) continue;
        const targetEeId = eeSlug === 'fireworks' ? fireworks.id : darkReunion.id;
        const playerCount = csvPlayerCountToEnum(row.player_count);
        if (!playerCount) continue;
        const parsed = parseZwrAchieved(row.achieved);
        if (parsed.completionTimeSeconds == null) continue;
        const key = buildLogKey(parsed.completionTimeSeconds, playerCount, row.main_video);
        const existing = csvKeyToTargetEeId.get(key);
        if (existing && existing !== targetEeId) {
          csvKeyToTargetEeId.delete(key);
          continue;
        }
        csvKeyToTargetEeId.set(key, targetEeId);
      }
    }

    const verifiedEeLogs = await prisma.easterEggLog.findMany({
      where: {
        mapId: map.id,
        isVerified: true,
        completionTimeSeconds: { not: null },
        easterEggId: { in: [fireworks.id, darkReunion.id] },
      },
      select: {
        id: true,
        userId: true,
        easterEggId: true,
        completionTimeSeconds: true,
        playerCount: true,
        proofUrls: true,
      },
    });

    const updates: Array<{ id: string; from: string; to: string; userId: string }> = [];
    for (const log of verifiedEeLogs) {
      const key = buildLogKey(log.completionTimeSeconds!, log.playerCount, log.proofUrls[0] ?? '');
      const targetEeId = csvKeyToTargetEeId.get(key);
      if (!targetEeId) continue;
      if (targetEeId !== log.easterEggId) {
        updates.push({ id: log.id, from: log.easterEggId, to: targetEeId, userId: log.userId });
      }
    }

    if (!DRY_RUN) {
      for (const upd of updates) {
        await prisma.easterEggLog.update({
          where: { id: upd.id },
          data: { easterEggId: upd.to },
        });
      }
    }
    console.log(`Final Reich EE log reassignment: ${updates.length} log(s) ${DRY_RUN ? 'would be updated' : 'updated'}.`);

    const fireworksWr = (() => {
      const rec = getSoloWR('wwii', 'ee-speedrun', 'the-final-reich', 'casual-ee');
      const parsed = rec ? parseAchieved(rec.achieved) : null;
      if (!parsed || !('timeSeconds' in parsed)) return 23 * 60;
      return parsed.timeSeconds;
    })();
    const darkReunionWr = (() => {
      const rec = getSoloWR('wwii', 'ee-speedrun', 'the-final-reich', 'hardcore-ee');
      const parsed = rec ? parseAchieved(rec.achieved) : null;
      if (!parsed || !('timeSeconds' in parsed)) return 55 * 60;
      return parsed.timeSeconds;
    })();

    const achievementDefs = [
      {
        eeId: fireworks.id,
        eeSlug: fireworks.slug,
        eeLabel: 'Fireworks',
        tiers: buildEeTiersFromWr(fireworksWr, [200, 600, 1500, 2500]),
      },
      {
        eeId: darkReunion.id,
        eeSlug: darkReunion.slug,
        eeLabel: 'Dark Reunion',
        tiers: buildEeTiersFromWr(darkReunionWr, [1200, 2600, 5200, 9000]),
      },
    ];

    if (!DRY_RUN) {
      await prisma.achievement.updateMany({
        where: {
          mapId: map.id,
          type: 'CHALLENGE_COMPLETE',
          challengeId: eeSpeedrunChallengeId,
          easterEggId: null,
        },
        data: { isActive: false },
      });
    }

    const touchedAchievementIds = new Set<string>();
    for (const def of achievementDefs) {
      for (const tier of def.tiers) {
        const timeStr = formatSpeedrunTime(tier.maxTimeSeconds).replace(/:/g, '-');
        const slug = `easter-egg-speedrun-${def.eeSlug}-under-${timeStr}`.replace(/\s/g, '-');
        const name = `${def.eeLabel} EE in under ${formatSpeedrunTime(tier.maxTimeSeconds)}`;
        const criteria = { challengeType: 'EASTER_EGG_SPEEDRUN', maxTimeSeconds: tier.maxTimeSeconds };

        const existing = await prisma.achievement.findFirst({
          where: { mapId: map.id, slug },
          select: { id: true },
        });
        if (!existing) {
          if (!DRY_RUN) {
            const created = await prisma.achievement.create({
              data: {
                mapId: map.id,
                challengeId: eeSpeedrunChallengeId,
                easterEggId: def.eeId,
                slug,
                name,
                type: 'CHALLENGE_COMPLETE',
                rarity: tier.rarity,
                xpReward: tier.xpReward,
                criteria,
                isActive: true,
              },
              select: { id: true },
            });
            touchedAchievementIds.add(created.id);
          }
        } else {
          touchedAchievementIds.add(existing.id);
          if (!DRY_RUN) {
            await prisma.achievement.update({
              where: { id: existing.id },
              data: {
                challengeId: eeSpeedrunChallengeId,
                easterEggId: def.eeId,
                name,
                rarity: tier.rarity,
                xpReward: tier.xpReward,
                criteria,
                isActive: true,
              },
            });
          }
        }
      }
    }

    const allEeSpeedrunAchievements = await prisma.achievement.findMany({
      where: {
        mapId: map.id,
        type: 'CHALLENGE_COMPLETE',
        challengeId: eeSpeedrunChallengeId,
      },
      select: { id: true },
    });
    for (const a of allEeSpeedrunAchievements) touchedAchievementIds.add(a.id);

    const impactedUserIds = new Set<string>();
    for (const u of updates) impactedUserIds.add(u.userId);
    const usersWithEeLogs = await prisma.easterEggLog.findMany({
      where: { mapId: map.id, easterEggId: { in: [fireworks.id, darkReunion.id] } },
      distinct: ['userId'],
      select: { userId: true },
    });
    for (const row of usersWithEeLogs) impactedUserIds.add(row.userId);
    const usersWithEeChallengeLogs = await prisma.challengeLog.findMany({
      where: { mapId: map.id, challengeId: eeSpeedrunChallengeId },
      distinct: ['userId'],
      select: { userId: true },
    });
    for (const row of usersWithEeChallengeLogs) impactedUserIds.add(row.userId);

    const impacted = Array.from(impactedUserIds);
    if (impacted.length > 0) {
      console.log(`Revalidating Final Reich EE achievements for ${impacted.length} user(s)...`);
      if (!DRY_RUN) {
        await prisma.userAchievement.deleteMany({
          where: {
            userId: { in: impacted },
            achievementId: { in: Array.from(touchedAchievementIds) },
          },
        });
      }

      for (const userId of impacted) {
        if (!DRY_RUN) {
          await processMapAchievements(userId, map.id, false);
          await grantVerifiedAchievementsForMap(userId, map.id);
          await recomputeUserXp(prisma, userId);
        }
      }
    }

    console.log(`Final Reich split repair complete${DRY_RUN ? ' (dry run)' : ''}.`);
    console.log(`- EE WR (Fireworks): ${formatSpeedrunTime(fireworksWr)}`);
    console.log(`- EE WR (Dark Reunion): ${formatSpeedrunTime(darkReunionWr)} (top tier uses 5% rule)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
