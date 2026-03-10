#!/usr/bin/env npx tsx
/**
 * Fix wrongly-tagged modifiers on ZWR-imported ChallengeLogs (all games).
 *
 * ZWR CSV sub_record values were incompletely mapped; runs were imported with wrong
 * modifier tags (e.g. BO3 Mega as Classic, IW fortune cards, BO4 elixirs, BOCW/BO6/BO7 support).
 * This script:
 *   1. Re-reads each ZWR user's CSV from top-178-csv
 *   2. For each row, computes correct modifiers from record+sub_record via config
 *   3. Finds the matching ChallengeLog (user, map, challenge, round/time, proof)
 *   4. Updates modifier fields when they differ
 *   5. Runs reunlock-achievements and recompute-verified-xp for all affected users
 *
 * Usage: npx tsx scripts/import-skrine-csv/fix-bo3-gobblegum-from-csv.ts [--dry-run]
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
import { GAME_CODES, MAP_SLUG_BY_GAME, MAP_SLUG_OVERRIDES, getRecordMapping, DEFAULTS } from './config';
import { ZWR_TO_CZT_USERS } from './zwr-to-czt-users';
import { parseCsv, parseProofUrls, parseAchieved } from './run';
import type { ParsedCsvRow } from './types';
import { normalizeProofUrls } from '../../src/lib/utils';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const TOP_178_DIR = path.join(root, 'top-178-csv');
const dryRun = process.argv.includes('--dry-run');

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

const LOG_MODIFIER_SELECT = {
  id: true,
  proofUrls: true,
  bo3GobbleGumMode: true,
  useFortuneCards: true,
  useDirectorsCut: true,
  bo4ElixirMode: true,
  difficulty: true,
  bocwSupportMode: true,
  bo6GobbleGumMode: true,
  bo6SupportMode: true,
  bo7GobbleGumMode: true,
  bo7SupportMode: true,
  rampageInducerUsed: true,
} as const;

type LogModifiers = {
  id: string;
  proofUrls: string[];
  bo3GobbleGumMode: string | null;
  useFortuneCards: boolean | null;
  useDirectorsCut: boolean | null;
  bo4ElixirMode: string | null;
  difficulty: string | null;
  bocwSupportMode: string | null;
  bo6GobbleGumMode: string | null;
  bo6SupportMode: string | null;
  bo7GobbleGumMode: string | null;
  bo7SupportMode: string | null;
  rampageInducerUsed: boolean | null;
};

async function findMatchingChallengeLog(
  userId: string,
  mapId: string,
  challengeId: string,
  roundReached: number,
  completionTimeSeconds: number | null,
  proofUrls: string[]
): Promise<LogModifiers | null> {
  const normalizedProof = normalizeProofUrls(proofUrls);
  const candidates = await prisma.challengeLog.findMany({
    where: {
      userId,
      mapId,
      challengeId,
      roundReached,
      ...(completionTimeSeconds != null ? { completionTimeSeconds } : {}),
    },
    select: LOG_MODIFIER_SELECT,
  });
  if (candidates.length === 0) return null;
  const match = candidates.find(
    (c) =>
      c.proofUrls.length === normalizedProof.length &&
      normalizedProof.every((u, i) => c.proofUrls[i] === u)
  );
  const log = match ?? candidates[0]!;
  return log as LogModifiers;
}

function buildCorrectModifiers(
  gameCode: string,
  mods: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (gameCode === 'bo3') {
    const v = (mods.bo3GobbleGumMode as string) ?? DEFAULTS.bo3GobbleGumMode;
    if (v != null) out.bo3GobbleGumMode = v;
  }
  if (gameCode === 'iw') {
    if (mods.useFortuneCards !== undefined) out.useFortuneCards = mods.useFortuneCards;
    if (mods.useDirectorsCut !== undefined) out.useDirectorsCut = mods.useDirectorsCut;
  }
  if (gameCode === 'bo4') {
    if (mods.bo4ElixirMode != null) out.bo4ElixirMode = mods.bo4ElixirMode;
    const d = (mods.difficulty as string) ?? DEFAULTS.bo4Difficulty;
    if (d != null) out.difficulty = d;
  }
  if (gameCode === 'bocw') {
    const v = (mods.bocwSupportMode as string) ?? DEFAULTS.bocwSupportMode;
    if (v != null) out.bocwSupportMode = v;
    if (mods.rampageInducerUsed !== undefined) out.rampageInducerUsed = mods.rampageInducerUsed;
  }
  if (gameCode === 'bo6') {
    if (mods.bo6GobbleGumMode != null) out.bo6GobbleGumMode = mods.bo6GobbleGumMode;
    const support = (mods.bo6SupportMode as string) ?? DEFAULTS.bo6SupportMode;
    if (support != null) out.bo6SupportMode = support;
    if (mods.rampageInducerUsed !== undefined) out.rampageInducerUsed = mods.rampageInducerUsed;
  }
  if (gameCode === 'bo7') {
    const gg = (mods.bo7GobbleGumMode as string) ?? DEFAULTS.bo7GobbleGumMode;
    if (gg != null) out.bo7GobbleGumMode = gg;
    const v = (mods.bo7SupportMode as string) ?? DEFAULTS.bo7SupportMode;
    if (v != null) out.bo7SupportMode = v;
    if (mods.rampageInducerUsed !== undefined) out.rampageInducerUsed = mods.rampageInducerUsed;
  }
  return out;
}

function buildUpdatePayload(
  correct: Record<string, unknown>,
  existing: LogModifiers,
  gameCode: string
): Record<string, unknown> | null {
  const updates: Record<string, unknown> = {};
  for (const [key, correctVal] of Object.entries(correct)) {
    const current = (existing as Record<string, unknown>)[key];
    const cur = current === undefined ? null : current;
    const eq = cur === correctVal || (cur == null && correctVal == null);
    if (!eq) updates[key] = correctVal;
  }
  return Object.keys(updates).length > 0 ? updates : null;
}

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL or DATABASE_URL in .env.local');
    process.exit(1);
  }

  const usersWithCsv: { sourcePlayerId: string; cztUserId: string; csvPath: string }[] = [];
  for (const [sourcePlayerId, entry] of Object.entries(ZWR_TO_CZT_USERS)) {
    let csvPath = path.join(TOP_178_DIR, `${sourcePlayerId}.csv`);
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(TOP_178_DIR, `${entry.displayName}.csv`);
    }
    if (fs.existsSync(csvPath)) {
      usersWithCsv.push({ sourcePlayerId, cztUserId: entry.cztUserId, csvPath });
    }
  }

  const GAMES_TO_FIX = new Set(['bo3', 'iw', 'bo4', 'bocw', 'bo6', 'bo7']);
  console.log('\n--- Fix ZWR modifier tags from CSV (BO3, IW, BO4, BOCW, BO6, BO7) ---\n');
  if (dryRun) console.log('*** DRY RUN – no DB updates, no reunlock/recompute ***\n');

  const affectedUserIds = new Set<string>();
  let fixed = 0;
  let notFound = 0;

  for (const { sourcePlayerId, cztUserId, csvPath } of usersWithCsv) {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCsv(content).filter(
      (r) => GAMES_TO_FIX.has(r.game.toLowerCase().trim()) && rowHasPlayer(r, sourcePlayerId)
    );
    if (rows.length === 0) continue;

    for (const row of rows) {
      const gameCode = row.game.toLowerCase().trim();
      const mapping = getRecordMapping(row.record, row.sub_record);
      if (!mapping) continue;

      const mods = mapping.modifiers as Record<string, unknown>;
      const correct = buildCorrectModifiers(gameCode, mods);
      if (Object.keys(correct).length === 0) continue;

      const mapRecord = await resolveMap(gameCode, row.map.toLowerCase());
      if (!mapRecord) continue;

      const challenge = await resolveChallenge(mapRecord.id, mapping.challengeType);
      if (!challenge) continue;

      const { round, completionTimeSeconds } = parseAchieved(row.achieved);
      const roundReached = round ?? 0;
      const proofUrls = parseProofUrls(row);

      const existing = await findMatchingChallengeLog(
        cztUserId,
        mapRecord.id,
        challenge.id,
        roundReached,
        completionTimeSeconds,
        proofUrls
      );

      if (!existing) {
        notFound++;
        continue;
      }

      const updates = buildUpdatePayload(correct, existing, gameCode);
      if (!updates) continue;

      const diffStr = Object.entries(updates)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');

      if (dryRun) {
        console.log(
          `[DRY] ${sourcePlayerId} | ${gameCode} ${row.map} ${row.record}/${row.sub_record} | ${diffStr} (log ${existing.id})`
        );
      } else {
        await prisma.challengeLog.update({
          where: { id: existing.id },
          data: updates as never,
        });
        console.log(
          `Fixed ${sourcePlayerId} | ${gameCode} ${row.map} ${row.record}/${row.sub_record} | ${diffStr}`
        );
      }
      fixed++;
      affectedUserIds.add(cztUserId);
    }
  }

  console.log(`\nFixed ${fixed} logs (${notFound} CSV rows had no matching log).`);
  if (affectedUserIds.size === 0) {
    console.log('No users affected. Done.');
    return;
  }

  if (dryRun) {
    console.log('\n[DRY] Would run reunlock-achievements and recompute-verified-xp for:', [...affectedUserIds]);
    return;
  }

  console.log('\n--- Revalidating (reunlock + recompute verified XP) for', affectedUserIds.size, 'users ---');
  for (const userId of affectedUserIds) {
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
  console.log('\n--- Done. ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
