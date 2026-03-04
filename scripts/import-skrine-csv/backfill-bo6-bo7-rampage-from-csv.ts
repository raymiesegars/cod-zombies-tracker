#!/usr/bin/env npx tsx
/**
 * Backfill BO6/BO7 rampageInducerUsed to false when ZWR CSV doesn't say anything.
 * Rule: "for bo6 round / exfils if it doesnt say anything then its no ramp."
 *
 * For each ZWR→CZT user with a CSV: for each BO6/BO7 row where sub_record does NOT
 * contain rampage-allowed, with-rampage, inducer, or rage-inducer, find the matching
 * ChallengeLog and set rampageInducerUsed = false. Then reunlock achievements and
 * recompute verified XP for every affected user.
 *
 * Usage: npx tsx scripts/import-skrine-csv/backfill-bo6-bo7-rampage-from-csv.ts [--dry-run]
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
import { parseCsv, parseProofUrls, parseAchieved } from './run';
import type { ParsedCsvRow } from './types';
import { normalizeProofUrls } from '../../src/lib/utils';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const TOP_178_DIR = path.join(root, 'top-178-csv');

const RAMPAGE_SUB_RECORD_MARKERS = ['rampage-allowed', 'with-rampage', 'inducer', 'rage-inducer'];

function subRecordImpliesRampage(subRecord: string): boolean {
  const s = (subRecord || '').toLowerCase();
  return RAMPAGE_SUB_RECORD_MARKERS.some((m) => s.includes(m));
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

function rowHasPlayer(row: ParsedCsvRow, sourcePlayerId: string): boolean {
  const players = [row.player_1, row.player_2, row.player_3, row.player_4].map((p) => (p || '').trim());
  return players.includes(sourcePlayerId);
}

async function findChallengeLog(
  userId: string,
  mapId: string,
  challengeId: string,
  roundReached: number,
  completionTimeSeconds: number | null,
  proofUrls: string[]
): Promise<{ id: string; rampageInducerUsed: boolean | null } | null> {
  const normalizedProof = normalizeProofUrls(proofUrls);
  const candidates = await prisma.challengeLog.findMany({
    where: {
      userId,
      mapId,
      challengeId,
      roundReached,
      ...(completionTimeSeconds != null ? { completionTimeSeconds } : {}),
    },
    select: { id: true, rampageInducerUsed: true, proofUrls: true },
  });
  if (candidates.length === 0) return null;
  const match = candidates.find(
    (c) =>
      c.proofUrls.length === normalizedProof.length &&
      normalizedProof.every((u, i) => c.proofUrls[i] === u)
  );
  const log = match ?? candidates[0]!;
  return { id: log.id, rampageInducerUsed: log.rampageInducerUsed };
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
      const gameCode = row.game.toLowerCase().trim();
      if (gameCode !== 'bo6' && gameCode !== 'bo7') continue;
      if (subRecordImpliesRampage(row.sub_record)) continue;

      const mapping = getRecordMapping(row.record, row.sub_record);
      if (!mapping) continue;

      const { round, completionTimeSeconds } = parseAchieved(row.achieved);
      const roundReached = round ?? 0;
      const proofUrls = parseProofUrls(row);
      const mapRecord = await resolveMap(gameCode, row.map.toLowerCase().trim());
      if (!mapRecord) continue;
      const challenge = await resolveChallenge(mapRecord.id, mapping.challengeType as string);
      if (!challenge) continue;

      const log = await findChallengeLog(
        cztUserId,
        mapRecord.id,
        challenge.id,
        roundReached,
        completionTimeSeconds,
        proofUrls
      );
      if (!log) continue;
      if (log.rampageInducerUsed === false) continue;

      if (dryRun) {
        console.log(
          `  [DRY] ${row.record}|${row.sub_record} → would set ChallengeLog ${log.id} rampageInducerUsed = false`
        );
      } else {
        await prisma.challengeLog.update({
          where: { id: log.id },
          data: { rampageInducerUsed: false },
        });
        console.log(`  Set rampageInducerUsed = false: ChallengeLog ${log.id} (${row.record}|${row.sub_record})`);
      }
      userFixed++;
      totalFixed++;
      affectedUserIds.add(cztUserId);
    }

    if (userFixed > 0) {
      console.log(`${sourcePlayerId}: ${userFixed} BO6/BO7 rampage fix(es)`);
    }
  }

  console.log(`\nTotal BO6/BO7 rampage fixes: ${totalFixed}`);
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
    console.log('\n--- Done. BO6/BO7 rampage backfill and revalidation complete. ---');
  } else if (dryRun && affectedUserIds.size > 0) {
    console.log('\n[DRY] Would run reunlock-achievements and recompute-verified-xp for above users.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
