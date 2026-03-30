#!/usr/bin/env npx tsx
/**
 * Backfill speedrun completion times for ZWR-imported users.
 * Detects parser mismatches against source CSV and fixes outliers in either direction:
 * - minute-like values that should be hour-format (e.g. 2:41:00 stored as 2:41)
 * - hour-like values that should be minute-format from old parser edge cases
 *
 * Only processes users in ZWR_TO_CZT_USERS who have a CSV in top-178-csv.
 *
 * Usage:
 *   npx tsx scripts/import-skrine-csv/backfill-speedrun-times-from-csv.ts [--dry-run]
 *   npx tsx scripts/import-skrine-csv/backfill-speedrun-times-from-csv.ts --game=bo2 --challenge-type=EASTER_EGG_SPEEDRUN --map=tranzit
 *   npx tsx scripts/import-skrine-csv/backfill-speedrun-times-from-csv.ts --only-player=Notyoursistermister --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '../..');
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

import { PrismaClient } from '@prisma/client';
import { GAME_CODES, MAP_SLUG_BY_GAME, MAP_SLUG_OVERRIDES, getRecordMapping } from './config';
import { ZWR_TO_CZT_USERS } from './zwr-to-czt-users';
import { parseCsv, parseProofUrls, parseAchieved, parseAchievedLegacy } from './run';
import type { ParsedCsvRow } from './types';
import { normalizeProofUrls } from '../../src/lib/utils';
import { processMapAchievements } from '../../src/lib/achievements';
import { grantVerifiedAchievementsForMap } from '../../src/lib/verified-xp';
import { getLevelFromXp } from '../../src/lib/ranks';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const TOP_178_DIR = path.join(root, 'top-178-csv');
const SAVED_PLAYERS_DIR = path.join(root, 'saved player csv');

type Args = {
  dryRun: boolean;
  onlyPlayer: string | null;
  cztUser: string | null;
  includeAllCsv: boolean;
  gameFilter: string | null;
  challengeTypeFilter: string | null;
  mapFilter: string | null;
  limitUsers: number | null;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let dryRun = false;
  let onlyPlayer: string | null = null;
  let cztUser: string | null = null;
  let includeAllCsv = true;
  let gameFilter: string | null = null;
  let challengeTypeFilter: string | null = null;
  let mapFilter: string | null = null;
  let limitUsers: number | null = null;

  for (const a of args) {
    if (a === '--dry-run') dryRun = true;
    else if (a.startsWith('--only-player=')) onlyPlayer = a.slice(14).trim() || null;
    else if (a.startsWith('--czt-user=')) cztUser = a.slice(11).trim() || null;
    else if (a === '--mapped-only') includeAllCsv = false;
    else if (a.startsWith('--game=')) gameFilter = a.slice(7).trim().toLowerCase() || null;
    else if (a.startsWith('--challenge-type=')) challengeTypeFilter = a.slice(17).trim().toUpperCase() || null;
    else if (a.startsWith('--map=')) mapFilter = a.slice(6).trim().toLowerCase() || null;
    else if (a.startsWith('--limit-users=')) {
      const n = parseInt(a.slice(14).trim(), 10);
      if (!Number.isNaN(n) && n > 0) limitUsers = n;
    }
  }

  return { dryRun, onlyPlayer, cztUser, includeAllCsv, gameFilter, challengeTypeFilter, mapFilter, limitUsers };
}

function normalizeExternalKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCsvBasenames(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.csv'))
    .map((f) => f.replace(/\.csv$/i, '').trim())
    .filter(Boolean);
}

async function resolveAuditUserId(sourcePlayerName: string, mappedUserId?: string | null): Promise<string | null> {
  if (mappedUserId) {
    const byId = await prisma.user.findUnique({ where: { id: mappedUserId }, select: { id: true } });
    if (byId) return byId.id;
  }

  const externalKey = normalizeExternalKey(sourcePlayerName);
  try {
    const identity = await prisma.externalAccountIdentity.findUnique({
      where: { source_externalKey: { source: 'ZWR', externalKey } },
      select: { userId: true },
    });
    if (identity?.userId) return identity.userId;
  } catch {
    // External identity table can be absent in older environments; continue with name-based lookup.
  }

  const byName = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: sourcePlayerName, mode: 'insensitive' } },
        { displayName: { equals: sourcePlayerName, mode: 'insensitive' } },
        { externalDisplayName: { equals: sourcePlayerName, mode: 'insensitive' } },
      ],
    },
    select: { id: true, mergedIntoUserId: true, isArchived: true },
  });
  if (!byName) return null;
  if (byName.isArchived && byName.mergedIntoUserId) return byName.mergedIntoUserId;
  return byName.id;
}

async function resolveCztUserId(cztUser: string): Promise<string | null> {
  if (!cztUser) return null;
  const byId = await prisma.user.findUnique({ where: { id: cztUser }, select: { id: true } });
  if (byId) return byId.id;
  const byUsername = await prisma.user.findUnique({ where: { username: cztUser }, select: { id: true } });
  if (byUsername) return byUsername.id;
  const byDisplay = await prisma.user.findFirst({ where: { displayName: cztUser }, select: { id: true } });
  if (byDisplay) return byDisplay.id;
  return null;
}

async function resolveMap(gameCode: string, mapSlug: string): Promise<{ id: string } | null> {
  const code = gameCode.toLowerCase();
  const shortName = GAME_CODES[code];
  if (!shortName) return null;
  const gameOverrides = MAP_SLUG_BY_GAME[code];
  const slug =
    gameOverrides && gameOverrides[mapSlug] !== undefined
      ? gameOverrides[mapSlug]
      : (MAP_SLUG_OVERRIDES[mapSlug] ?? mapSlug);
  if (slug === null) return null;
  const map = await prisma.map.findFirst({
    where: { slug, game: { shortName } },
    select: { id: true },
  });
  return map;
}

async function resolveChallenge(mapId: string, challengeType: string): Promise<{ id: string } | null> {
  const c = await prisma.challenge.findFirst({
    where: { mapId, type: challengeType as never },
    select: { id: true },
  });
  return c;
}

async function resolveMainQuestEasterEgg(mapId: string): Promise<{ id: string } | null> {
  const ee = await prisma.easterEgg.findFirst({
    where: { mapId, type: 'MAIN_QUEST' },
    select: { id: true },
  });
  return ee;
}

function rowHasPlayer(row: ParsedCsvRow, sourcePlayerId: string): boolean {
  const players = [row.player_1, row.player_2, row.player_3, row.player_4].map((p) => (p || '').trim());
  return players.includes(sourcePlayerId);
}

/** Old buggy interpretation for X:Y:00 where trailing :00 was treated as MM:SS. */
function parseAchievedTrailingZeroAsMinutes(achieved: string): number | null {
  const s = (achieved || '').trim();
  if (!s) return null;
  const parts = s.split(':').map((p) => p.trim());
  if (parts.length !== 3) return null;
  const [a, b, c] = parts;
  const nA = parseInt(a ?? '', 10);
  const nB = parseInt(b ?? '', 10);
  const nC = parseInt((c ?? '').split('.')[0] ?? '', 10);
  if ([nA, nB, nC].some(Number.isNaN)) return null;
  if (nC !== 0) return null;
  return nA * 60 + nB;
}

async function findChallengeLogByWrongTime(
  userId: string,
  mapId: string,
  challengeId: string,
  roundReached: number,
  wrongTimeSeconds: number,
  proofUrls: string[]
): Promise<{ id: string; completionTimeSeconds: number | null } | null> {
  const normalizedProof = normalizeProofUrls(proofUrls);
  const candidates = await prisma.challengeLog.findMany({
    where: {
      userId,
      mapId,
      challengeId,
      roundReached,
      completionTimeSeconds: wrongTimeSeconds,
    },
    select: { id: true, proofUrls: true, completionTimeSeconds: true },
  });
  if (candidates.length === 0) return null;
  const match = candidates.find(
    (c) =>
      c.proofUrls.length === normalizedProof.length &&
      normalizedProof.every((u, i) => c.proofUrls[i] === u)
  );
  const log = match ?? candidates[0]!;
  return { id: log.id, completionTimeSeconds: log.completionTimeSeconds };
}

/** Find log by user/map/challenge/round + proof (no filter on time). Used when CSV has correct 2-part time but DB has wrong hours. */
async function findChallengeLogByProof(
  userId: string,
  mapId: string,
  challengeId: string,
  roundReached: number,
  proofUrls: string[]
): Promise<{ id: string; completionTimeSeconds: number | null } | null> {
  const normalizedProof = normalizeProofUrls(proofUrls);
  const candidates = await prisma.challengeLog.findMany({
    where: { userId, mapId, challengeId, roundReached },
    select: { id: true, proofUrls: true, completionTimeSeconds: true },
  });
  if (candidates.length === 0) return null;
  const match = candidates.find(
    (c) =>
      c.proofUrls.length === normalizedProof.length &&
      normalizedProof.every((u, i) => c.proofUrls[i] === u)
  );
  const log = match ?? candidates[0]!;
  return { id: log.id, completionTimeSeconds: log.completionTimeSeconds };
}

/** True if stored and correct are likely a 60x parser mismatch in either direction. */
function looksLikeSixtyXMismatch(storedSeconds: number | null, correctSeconds: number): boolean {
  if (storedSeconds == null || storedSeconds === correctSeconds) return false;
  if (correctSeconds <= 0) return false;
  if (storedSeconds <= 0) return false;
  const ratio = Math.max(storedSeconds, correctSeconds) / Math.min(storedSeconds, correctSeconds);
  return ratio >= 55 && ratio <= 65; // ~60x (min→hour)
}

async function findEasterEggLogByWrongTime(
  userId: string,
  mapId: string,
  easterEggId: string,
  wrongTimeSeconds: number,
  proofUrls: string[]
): Promise<{ id: string } | null> {
  const normalizedProof = normalizeProofUrls(proofUrls);
  const candidates = await prisma.easterEggLog.findMany({
    where: {
      userId,
      mapId,
      easterEggId,
      completionTimeSeconds: wrongTimeSeconds,
    },
    select: { id: true, proofUrls: true },
  });
  if (candidates.length === 0) return null;
  const match = candidates.find(
    (c) =>
      c.proofUrls.length === normalizedProof.length &&
      normalizedProof.every((u, i) => c.proofUrls[i] === u)
  );
  return match ? { id: match.id } : candidates[0] ? { id: candidates[0].id } : null;
}

async function recomputeUserTotals(userId: string): Promise<void> {
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
  const { level } = getLevelFromXp(totalXp);
  await prisma.user.update({
    where: { id: userId },
    data: { totalXp, verifiedTotalXp, level },
  });
}

async function main() {
  const { dryRun, onlyPlayer, cztUser, includeAllCsv, gameFilter, challengeTypeFilter, mapFilter, limitUsers } = parseArgs();
  if (dryRun) console.log('*** DRY RUN – no DB updates, no achievement/XP revalidation writes ***\n');
  if (onlyPlayer) console.log(`Filter: only player "${onlyPlayer}"`);
  if (cztUser) console.log(`Filter: czt user "${cztUser}"`);
  if (!includeAllCsv) console.log('Filter: mapped users only');
  if (gameFilter) console.log(`Filter: game=${gameFilter}`);
  if (challengeTypeFilter) console.log(`Filter: challengeType=${challengeTypeFilter}`);
  if (mapFilter) console.log(`Filter: map=${mapFilter}`);
  if (limitUsers != null) console.log(`Filter: limit users=${limitUsers}`);
  if (onlyPlayer || gameFilter || challengeTypeFilter || mapFilter || limitUsers != null) console.log('');

  type ImportEntry = { sourcePlayerId: string; displayName: string; cztUserId: string | null };
  const mappedEntries: ImportEntry[] = Object.entries(ZWR_TO_CZT_USERS).map(([sourcePlayerId, entry]) => ({
    sourcePlayerId,
    displayName: entry.displayName,
    cztUserId: entry.cztUserId,
  }));
  let entries: ImportEntry[] = mappedEntries;
  if (includeAllCsv) {
    const csvNames = new Set<string>([
      ...getCsvBasenames(TOP_178_DIR),
      ...getCsvBasenames(SAVED_PLAYERS_DIR),
    ]);
    const existingKeys = new Set(entries.map((e) => normalizeExternalKey(e.sourcePlayerId)));
    for (const name of csvNames) {
      const key = normalizeExternalKey(name);
      if (existingKeys.has(key)) continue;
      entries.push({ sourcePlayerId: name, displayName: name, cztUserId: null });
      existingKeys.add(key);
    }
  }
  if (onlyPlayer) {
    const needle = onlyPlayer.trim().toLowerCase();
    entries = entries.filter((e) =>
      e.sourcePlayerId.toLowerCase() === needle || e.displayName.toLowerCase() === needle
    );
    if (entries.length === 0) {
      const resolvedUserId = cztUser ? await resolveCztUserId(cztUser) : await resolveCztUserId(onlyPlayer);
      if (!resolvedUserId) {
        console.log('No mapping found for --only-player and could not resolve --czt-user. Provide --czt-user=<id|username|displayName>.');
        await prisma.$disconnect();
        return;
      }
      entries = [{ sourcePlayerId: onlyPlayer, displayName: onlyPlayer, cztUserId: resolvedUserId }];
    }
  }
  if (cztUser && !onlyPlayer) {
    const resolvedUserId = await resolveCztUserId(cztUser);
    if (!resolvedUserId) {
      console.log('Could not resolve --czt-user. Provide a valid id/username/displayName.');
      await prisma.$disconnect();
      return;
    }
    entries = entries.filter((e) => e.cztUserId === resolvedUserId || e.cztUserId == null);
  }
  if (limitUsers != null) entries = entries.slice(0, limitUsers);
  console.log(`Users queued: ${entries.length}`);
  if (entries.length === 0) {
    console.log('No users matched filters.');
    await prisma.$disconnect();
    return;
  }
  const affectedUserMapIds = new Map<string, Set<string>>();
  const revalidateUserMapIds = new Map<string, Set<string>>();
  let totalFixed = 0;
  let unresolvedUserEntries = 0;
  let totalRowsScanned = 0;
  let totalCandidateRows = 0;
  let totalMismatchRows = 0;
  let totalNoDbMatchRows = 0;
  const mismatchReasonCounts = new Map<string, number>();
  let totalAlreadyCorrectMatches = 0;

  for (let userIndex = 0; userIndex < entries.length; userIndex++) {
    const entry = entries[userIndex]!;
    const sourcePlayerId = entry.sourcePlayerId;
    const cztUserId = cztUser
      ? (await resolveCztUserId(cztUser))
      : (entry.cztUserId ?? (await resolveAuditUserId(sourcePlayerId, entry.cztUserId)));
    if (!cztUserId) {
      unresolvedUserEntries++;
      console.log(`\n[User ${userIndex + 1}/${entries.length}] ${sourcePlayerId} -> unresolved (skip)`);
      continue;
    }
    console.log(`\n[User ${userIndex + 1}/${entries.length}] ${sourcePlayerId} -> ${cztUserId}`);
    let csvPath = path.join(TOP_178_DIR, `${sourcePlayerId}.csv`);
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(TOP_178_DIR, `${entry.displayName}.csv`);
    }
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(SAVED_PLAYERS_DIR, `${sourcePlayerId}.csv`);
    }
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(SAVED_PLAYERS_DIR, `${entry.displayName}.csv`);
    }
    if (!fs.existsSync(csvPath)) {
      console.log(`Skip ${sourcePlayerId}: no CSV found`);
      continue;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const allRows = parseCsv(content);
    const rows = allRows.filter(
      (r) => rowHasPlayer(r, sourcePlayerId) || rowHasPlayer(r, entry.displayName)
    );
    totalRowsScanned += rows.length;
    console.log(`  CSV matched rows: ${rows.length}`);

    const isSpeedrun = (ct: string) => (ct || '').includes('SPEEDRUN');
    let userFixed = 0;
    for (const row of rows) {
      if (gameFilter && row.game.toLowerCase().trim() !== gameFilter) continue;
      if (mapFilter && row.map.toLowerCase().trim() !== mapFilter) continue;
      const mapping = getRecordMapping(row.record, row.sub_record);
      if (!mapping) continue;
      if (challengeTypeFilter && String(mapping.challengeType).toUpperCase() !== challengeTypeFilter) continue;
      totalCandidateRows++;

      const correct = parseAchieved(row.achieved);
      const legacy = parseAchievedLegacy(row.achieved);
      const trailingZeroMinutes = parseAchievedTrailingZeroAsMinutes(row.achieved);
      const correctSeconds = correct.completionTimeSeconds ?? legacy.completionTimeSeconds;
      if (correctSeconds == null) continue;

      const roundReached = correct.round ?? legacy.round ?? 0;
      const mapRecord = await resolveMap(row.game.toLowerCase().trim(), row.map.toLowerCase().trim());
      if (!mapRecord) continue;
      const challenge = await resolveChallenge(mapRecord.id, mapping.challengeType as string);
      if (!challenge) continue;

      const proofUrls = parseProofUrls(row);
      let challengeLog: { id: string; completionTimeSeconds: number | null } | null = null;
      let wrongSeconds: number | null = null;

      const wrongCandidates = Array.from(
        new Set(
          [legacy.completionTimeSeconds, trailingZeroMinutes].filter(
            (v): v is number => v != null && v !== correctSeconds
          )
        )
      );
      if (wrongCandidates.length > 0) {
        totalMismatchRows++;
        const reason =
          trailingZeroMinutes != null && wrongCandidates.includes(trailingZeroMinutes)
            ? 'h:mm:00-was-read-as-mm:ss'
            : 'legacy-hh:mm:ss-mismatch';
        mismatchReasonCounts.set(reason, (mismatchReasonCounts.get(reason) ?? 0) + 1);
      }

      if (wrongCandidates.length > 0) {
        wrongSeconds = wrongCandidates[0] ?? null;
        challengeLog = await findChallengeLogByWrongTime(
          cztUserId,
          mapRecord.id,
          challenge.id,
          roundReached,
          wrongSeconds!,
          proofUrls
        );
        if (!challengeLog) {
          for (let i = 1; i < wrongCandidates.length; i++) {
            const candidate = wrongCandidates[i]!;
            const maybe = await findChallengeLogByWrongTime(
              cztUserId,
              mapRecord.id,
              challenge.id,
              roundReached,
              candidate,
              proofUrls
            );
            if (maybe) {
              challengeLog = maybe;
              wrongSeconds = candidate;
              break;
            }
          }
        }
      }

      if (!challengeLog && isSpeedrun(mapping.challengeType as string)) {
        challengeLog = await findChallengeLogByProof(
          cztUserId,
          mapRecord.id,
          challenge.id,
          roundReached,
          proofUrls
        );
        if (
          challengeLog &&
          challengeLog.completionTimeSeconds != null &&
          challengeLog.completionTimeSeconds !== correctSeconds &&
          looksLikeSixtyXMismatch(challengeLog.completionTimeSeconds, correctSeconds)
        ) {
          wrongSeconds = challengeLog.completionTimeSeconds;
          if (!revalidateUserMapIds.has(cztUserId)) revalidateUserMapIds.set(cztUserId, new Set());
          revalidateUserMapIds.get(cztUserId)!.add(mapRecord.id);
        } else if (challengeLog && challengeLog.completionTimeSeconds === correctSeconds) {
          totalAlreadyCorrectMatches++;
          if (!revalidateUserMapIds.has(cztUserId)) revalidateUserMapIds.set(cztUserId, new Set());
          revalidateUserMapIds.get(cztUserId)!.add(mapRecord.id);
          challengeLog = null;
        } else if (challengeLog && !looksLikeSixtyXMismatch(challengeLog.completionTimeSeconds, correctSeconds)) {
          challengeLog = null;
        }
      }

      if (challengeLog && wrongSeconds != null) {
        if (dryRun) {
          console.log(
            `  [DRY] ${row.record}|${row.sub_record} achieved="${row.achieved}" → would fix ChallengeLog ${challengeLog.id}: ${wrongSeconds}s → ${correctSeconds}s`
          );
        } else {
          await prisma.challengeLog.update({
            where: { id: challengeLog.id },
            data: { completionTimeSeconds: correctSeconds },
          });
          console.log(
            `  Fixed ChallengeLog ${challengeLog.id}: "${row.achieved}" ${wrongSeconds}s → ${correctSeconds}s`
          );
        }
        userFixed++;
        totalFixed++;
        if (!affectedUserMapIds.has(cztUserId)) affectedUserMapIds.set(cztUserId, new Set());
        affectedUserMapIds.get(cztUserId)!.add(mapRecord.id);
        if (!revalidateUserMapIds.has(cztUserId)) revalidateUserMapIds.set(cztUserId, new Set());
        revalidateUserMapIds.get(cztUserId)!.add(mapRecord.id);
      } else if (wrongCandidates.length > 0) {
        totalNoDbMatchRows++;
        console.log(
          `  [INFO] mismatch detected but no DB match: row ${row._rowIndex} ${row.game}/${row.map} ${row.record}/${row.sub_record} achieved="${row.achieved}"`
        );
      }

      if (mapping.createEasterEggLog && (challengeLog || wrongSeconds != null)) {
        const mainEe = await resolveMainQuestEasterEgg(mapRecord.id);
        if (mainEe) {
          const eeByWrong = wrongSeconds != null ? await findEasterEggLogByWrongTime(
            cztUserId,
            mapRecord.id,
            mainEe.id,
            wrongSeconds,
            proofUrls
          ) : null;
          if (eeByWrong) {
            if (dryRun) {
              console.log(`  [DRY] would fix EasterEggLog ${eeByWrong.id}: ${wrongSeconds}s → ${correctSeconds}s`);
            } else {
              await prisma.easterEggLog.update({
                where: { id: eeByWrong.id },
                data: { completionTimeSeconds: correctSeconds },
              });
              console.log(`  Fixed EasterEggLog ${eeByWrong.id}: ${wrongSeconds}s → ${correctSeconds}s`);
            }
            if (!challengeLog) {
              userFixed++;
              totalFixed++;
              if (!affectedUserMapIds.has(cztUserId)) affectedUserMapIds.set(cztUserId, new Set());
              affectedUserMapIds.get(cztUserId)!.add(mapRecord.id);
              if (!revalidateUserMapIds.has(cztUserId)) revalidateUserMapIds.set(cztUserId, new Set());
              revalidateUserMapIds.get(cztUserId)!.add(mapRecord.id);
            }
          }
        }
      }
    }

    if (userFixed > 0) {
      console.log(`${sourcePlayerId}: ${userFixed} speedrun time(s) corrected`);
    }
    if ((userIndex + 1) % 100 === 0) {
      console.log(
        `Progress: users ${userIndex + 1}/${entries.length}, rows scanned ${totalRowsScanned}, fixes ${totalFixed}`
      );
    }
  }

  console.log(`\nTotal speedrun time fixes: ${totalFixed}`);
  console.log(`Affected users: ${affectedUserMapIds.size}`);
  console.log(`Rows scanned: ${totalRowsScanned}`);
  console.log(`Candidate speedrun rows after filters: ${totalCandidateRows}`);
  console.log(`Rows with parser mismatch: ${totalMismatchRows}`);
  console.log(`Mismatch rows without DB match: ${totalNoDbMatchRows}`);
  console.log(`Mismatch rows already correct in DB: ${totalAlreadyCorrectMatches}`);
  console.log(`Unresolved user entries skipped: ${unresolvedUserEntries}`);
  if (mismatchReasonCounts.size > 0) {
    console.log('Mismatch reason breakdown:');
    for (const [reason, count] of mismatchReasonCounts.entries()) {
      console.log(`  - ${reason}: ${count}`);
    }
  }

  if (revalidateUserMapIds.size > 0 && !dryRun) {
    console.log('\n--- Revalidating achievements/XP for affected users/maps ---');
    for (const [userId, mapIds] of revalidateUserMapIds.entries()) {
      const scopedMapIds = Array.from(mapIds);
      if (scopedMapIds.length === 0) continue;
      console.log(`\n--- User ${userId} (${scopedMapIds.length} map(s)) ---`);

      const speedrunAchievementRows = await prisma.achievement.findMany({
        where: {
          mapId: { in: scopedMapIds },
          isActive: true,
        },
        select: { id: true, challenge: { select: { type: true } } },
      });
      const speedrunAchievementIds = speedrunAchievementRows
        .filter((a) => (a.challenge?.type ?? '').includes('SPEEDRUN'))
        .map((a) => a.id);

      if (speedrunAchievementIds.length > 0) {
        const deleted = await prisma.userAchievement.deleteMany({
          where: { userId, achievementId: { in: speedrunAchievementIds } },
        });
        if (deleted.count > 0) {
          console.log(`  Reset ${deleted.count} speedrun achievement unlock(s)`);
        }
      }

      await recomputeUserTotals(userId);

      for (const mapId of scopedMapIds) {
        const unlocked = await processMapAchievements(userId, mapId, false);
        if (unlocked.length > 0) {
          console.log(`  map ${mapId.slice(0, 8)}... unlocked ${unlocked.length}`);
        }
        const [hasVerifiedChallenge, hasVerifiedEe] = await Promise.all([
          prisma.challengeLog.findFirst({
            where: {
              userId,
              mapId,
              isVerified: true,
              completionTimeSeconds: { not: null },
            },
            select: { id: true },
          }).then((r) => !!r),
          prisma.easterEggLog.findFirst({
            where: { userId, mapId, isVerified: true, completionTimeSeconds: { not: null } },
            select: { id: true },
          }).then((r) => !!r),
        ]);
        if (hasVerifiedChallenge || hasVerifiedEe) {
          await grantVerifiedAchievementsForMap(userId, mapId);
        }
      }
    }
    console.log('\n--- Done. Speedrun time backfill + targeted achievement revalidation complete. ---');
  } else if (dryRun && revalidateUserMapIds.size > 0) {
    console.log('\n[DRY] Would revalidate only affected user/map achievements and XP.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
