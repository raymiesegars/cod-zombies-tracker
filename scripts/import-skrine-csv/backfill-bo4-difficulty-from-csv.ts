#!/usr/bin/env npx tsx
/**
 * Backfill BO4 difficulty for users we've already imported from ZWR CSV.
 * Reads each user's CSV from top-178-csv, finds BO4 rows where the CSV has a
 * difficulty (e.g. all-elixirs-talismans-hardcore → HARDCORE), and updates the
 * matching ChallengeLog in the DB so achievements/leaderboards work.
 *
 * Only touches users in ZWR_TO_CZT_USERS who have a CSV in top-178-csv.
 * Run after fix-bo4-null-difficulty if you want to set NORMAL for everyone first,
 * then this script to set HARDCORE/REALISTIC/CASUAL where the CSV had it.
 *
 * Usage: npx tsx scripts/import-skrine-csv/backfill-bo4-difficulty-from-csv.ts [--dry-run]
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
import { parseCsv, parseProofUrls, parseAchieved } from './run';
import type { ParsedCsvRow } from './types';
import { normalizeProofUrls } from '../../src/lib/utils';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const TOP_178_DIR = path.join(root, 'top-178-csv');

type Bo4Difficulty = 'CASUAL' | 'NORMAL' | 'HARDCORE' | 'REALISTIC';

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

function rowHasPlayer(row: ParsedCsvRow, sourcePlayerId: string): boolean {
  const players = [row.player_1, row.player_2, row.player_3, row.player_4].map((p) => (p || '').trim());
  return players.includes(sourcePlayerId);
}

async function findMatchingLog(
  userId: string,
  mapId: string,
  challengeId: string,
  roundReached: number,
  completionTimeSeconds: number | null,
  proofUrls: string[]
): Promise<{ id: string; difficulty: string | null } | null> {
  const candidates = await prisma.challengeLog.findMany({
    where: {
      userId,
      mapId,
      challengeId,
      roundReached,
      ...(completionTimeSeconds != null ? { completionTimeSeconds } : {}),
    },
    select: { id: true, difficulty: true, proofUrls: true },
  });
  if (candidates.length === 0) return null;
  const normalizedProof = normalizeProofUrls(proofUrls);
  const match = candidates.find((c) => {
    const same = c.proofUrls.length === normalizedProof.length && normalizedProof.every((u, i) => c.proofUrls[i] === u);
    return same;
  });
  return match ? { id: match.id, difficulty: match.difficulty } : { id: candidates[0]!.id, difficulty: candidates[0]!.difficulty };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('*** DRY RUN – no updates ***\n');

  const entries = Object.entries(ZWR_TO_CZT_USERS);
  let totalUpdated = 0;

  for (const [sourcePlayerId, entry] of entries) {
    const cztUserId = entry.cztUserId;
    let csvPath = path.join(TOP_178_DIR, `${sourcePlayerId}.csv`);
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(TOP_178_DIR, `${entry.displayName}.csv`);
    }
    if (!fs.existsSync(csvPath)) {
      console.log(`Skip ${sourcePlayerId}: no CSV at ${sourcePlayerId}.csv or ${entry.displayName}.csv`);
      continue;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const allRows = parseCsv(content);
    const rows = allRows.filter((r) => rowHasPlayer(r, sourcePlayerId));
    const bo4Rows = rows.filter((r) => r.game.toLowerCase().trim() === 'bo4');
    if (bo4Rows.length === 0) {
      console.log(`${sourcePlayerId}: ${rows.length} rows, 0 BO4 – skip`);
      continue;
    }

    let userUpdated = 0;
    for (const row of bo4Rows) {
      const mapping = getRecordMapping(row.record, row.sub_record);
      if (!mapping) continue;
      const mods = mapping.modifiers as Record<string, unknown>;
      const difficulty = (mods.difficulty as Bo4Difficulty) ?? null;
      if (difficulty == null) continue;

      const mapRecord = await resolveMap(row.game.toLowerCase().trim(), row.map.toLowerCase().trim());
      if (!mapRecord) continue;
      const challenge = await resolveChallenge(mapRecord.id, mapping.challengeType as string);
      if (!challenge) continue;

      const { round, completionTimeSeconds } = parseAchieved(row.achieved);
      const roundReached = round ?? 0;
      const proofUrls = parseProofUrls(row);

      const log = await findMatchingLog(cztUserId, mapRecord.id, challenge.id, roundReached, completionTimeSeconds, proofUrls);
      if (!log) continue;
      if (log.difficulty === difficulty) continue;

      if (dryRun) {
        console.log(`  [DRY] ${row.record}|${row.sub_record} round ${roundReached} → would set difficulty ${log.difficulty ?? 'null'} → ${difficulty}`);
        userUpdated++;
        continue;
      }

      await prisma.challengeLog.update({
        where: { id: log.id },
        data: { difficulty },
      });
      console.log(`  ${row.record}|${row.sub_record} round ${roundReached}: ${log.difficulty ?? 'null'} → ${difficulty}`);
      userUpdated++;
    }

    if (userUpdated > 0) {
      console.log(`${sourcePlayerId}: ${userUpdated} BO4 log(s) updated`);
      totalUpdated += userUpdated;
    }
  }

  console.log(`\nTotal BO4 difficulty updates: ${totalUpdated}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
