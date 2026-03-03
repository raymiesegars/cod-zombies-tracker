#!/usr/bin/env npx tsx
/**
 * Backfill speedrun completion times for ZWR-imported users.
 * ZWR sometimes exported times as "34:50:00" (34 min 50 sec) which we wrongly
 * parsed as 34 hours 50 minutes. This script re-reads each user's CSV, detects
 * rows where the corrected parse (parseAchieved) differs from the legacy parse
 * (parseAchievedLegacy), finds the matching ChallengeLog/EasterEggLog in the DB,
 * updates completionTimeSeconds to the correct value, then runs reunlock-achievements
 * and recompute-verified-xp for every affected user.
 *
 * Only processes users in ZWR_TO_CZT_USERS who have a CSV in top-178-csv.
 *
 * Usage: npx tsx scripts/import-skrine-csv/backfill-speedrun-times-from-csv.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const TOP_178_DIR = path.join(root, 'top-178-csv');

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

async function findChallengeLogByWrongTime(
  userId: string,
  mapId: string,
  challengeId: string,
  roundReached: number,
  wrongTimeSeconds: number,
  proofUrls: string[]
): Promise<{ id: string } | null> {
  const normalizedProof = normalizeProofUrls(proofUrls);
  const candidates = await prisma.challengeLog.findMany({
    where: {
      userId,
      mapId,
      challengeId,
      roundReached,
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

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('*** DRY RUN – no DB updates, no reunlock/recompute ***\n');

  const entries = Object.entries(ZWR_TO_CZT_USERS);
  const affectedUserIds = new Set<string>();
  let totalFixed = 0;

  for (const [sourcePlayerId, entry] of entries) {
    const cztUserId = entry.cztUserId;
    let csvPath = path.join(TOP_178_DIR, `${sourcePlayerId}.csv`);
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(TOP_178_DIR, `${entry.displayName}.csv`);
    }
    if (!fs.existsSync(csvPath)) {
      console.log(`Skip ${sourcePlayerId}: no CSV found`);
      continue;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const allRows = parseCsv(content);
    const rows = allRows.filter((r) => rowHasPlayer(r, sourcePlayerId));

    let userFixed = 0;
    for (const row of rows) {
      const mapping = getRecordMapping(row.record, row.sub_record);
      if (!mapping) continue;

      const correct = parseAchieved(row.achieved);
      const legacy = parseAchievedLegacy(row.achieved);

      if (correct.completionTimeSeconds == null || legacy.completionTimeSeconds == null) continue;
      if (correct.completionTimeSeconds === legacy.completionTimeSeconds) continue;

      const wrongSeconds = legacy.completionTimeSeconds;
      const correctSeconds = correct.completionTimeSeconds;
      const roundReached = correct.round ?? legacy.round ?? 0;

      const mapRecord = await resolveMap(row.game.toLowerCase().trim(), row.map.toLowerCase().trim());
      if (!mapRecord) continue;
      const challenge = await resolveChallenge(mapRecord.id, mapping.challengeType as string);
      if (!challenge) continue;

      const proofUrls = parseProofUrls(row);

      const challengeLog = await findChallengeLogByWrongTime(
        cztUserId,
        mapRecord.id,
        challenge.id,
        roundReached,
        wrongSeconds,
        proofUrls
      );

      if (challengeLog) {
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
        affectedUserIds.add(cztUserId);
      }

      if (mapping.createEasterEggLog) {
        const mainEe = await resolveMainQuestEasterEgg(mapRecord.id);
        if (mainEe) {
          const eeLog = await findEasterEggLogByWrongTime(
            cztUserId,
            mapRecord.id,
            mainEe.id,
            wrongSeconds,
            proofUrls
          );
          if (eeLog) {
            if (dryRun) {
              console.log(
                `  [DRY] would fix EasterEggLog ${eeLog.id}: ${wrongSeconds}s → ${correctSeconds}s`
              );
            } else {
              await prisma.easterEggLog.update({
                where: { id: eeLog.id },
                data: { completionTimeSeconds: correctSeconds },
              });
              console.log(`  Fixed EasterEggLog ${eeLog.id}: ${wrongSeconds}s → ${correctSeconds}s`);
            }
            if (!challengeLog) {
              userFixed++;
              totalFixed++;
              affectedUserIds.add(cztUserId);
            }
          }
        }
      }
    }

    if (userFixed > 0) {
      console.log(`${sourcePlayerId}: ${userFixed} speedrun time(s) corrected`);
    }
  }

  console.log(`\nTotal speedrun time fixes: ${totalFixed}`);
  console.log(`Affected users: ${affectedUserIds.size}`);

  if (affectedUserIds.size > 0 && !dryRun) {
    console.log('\n--- Reunlock achievements & recompute verified XP for affected users ---');
    for (const userId of affectedUserIds) {
      console.log(`\n--- User ${userId} ---`);
      execSync('pnpm db:reunlock-achievements', {
        stdio: 'inherit',
        cwd: root,
        env: { ...process.env, BACKFILL_USER_ID: userId },
      });
      execSync('pnpm db:recompute-verified-xp', {
        stdio: 'inherit',
        cwd: root,
        env: { ...process.env, BACKFILL_USER_ID: userId },
      });
    }
    console.log('\n--- Done. Speedrun time backfill and revalidation complete. ---');
  } else if (dryRun && affectedUserIds.size > 0) {
    console.log('\n[DRY] Would run reunlock-achievements and recompute-verified-xp for above users.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
