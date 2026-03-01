#!/usr/bin/env npx tsx
/**
 * ZWR/Skrine CSV → CZT import script.
 *
 * Imports verified leaderboard runs from a CSV (one source-site user per run)
 * into a single CZT user. Only rows where the source player appears in
 * player_1..player_4 are imported. Teammates: if their ZWR ID is in
 * zwr-to-czt-users.ts we store them as teammateUserIds (site user); otherwise
 * teammateNonUserNames (placeholder "Player {id}"). EE speedrun rows create
 * both a ChallengeLog and an EasterEggLog.
 *
 * ZWR → CZT user mapping: see zwr-to-czt-users.ts in this folder. Add entries
 * there when a ZWR player has a CZT account so future imports link them as
 * site users instead of placeholders.
 *
 * Usage:
 *   npx tsx scripts/import-skrine-csv/run.ts --csv=path/to/file.csv \
 *     --source-player-id=17046 --czt-user=cmlvocpbj0006ar6ml9vz7hsm [--dry-run] [--report=report.json]
 *
 * See README.md in this folder for full options and mapping docs.
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
import { GAME_CODES, SKIP_GAMES, MAP_SLUG_BY_GAME, MAP_SLUG_OVERRIDES, getRecordMapping, DEFAULTS } from './config';
import type { ParsedCsvRow, ReportRow } from './types';
import { getCztUserIdForZwrId } from './zwr-to-czt-users';
import { normalizeProofUrls } from '../../src/lib/utils';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const CSV_HEADERS = [
  'game', 'map', 'record', 'sub_record', 'platform', 'main_video', 'other_links',
  'game_type', 'achieved', 'player_count', 'player_1', 'player_2', 'player_3', 'player_4',
  'is_world_record', 'added',
];

type PlayerCount = 'SOLO' | 'DUO' | 'TRIO' | 'SQUAD';

function parsePlayerCount(n: string): PlayerCount {
  const num = parseInt(String(n).trim(), 10);
  if (num === 1) return 'SOLO';
  if (num === 2) return 'DUO';
  if (num === 3) return 'TRIO';
  if (num === 4) return 'SQUAD';
  return 'SOLO';
}

/** Parse "achieved" — round number or time (HH:MM:SS or MM:SS) to seconds. */
function parseAchieved(achieved: string): { round: number | null; completionTimeSeconds: number | null } {
  const s = (achieved || '').trim();
  if (!s) return { round: null, completionTimeSeconds: null };

  const round = parseInt(s, 10);
  if (!Number.isNaN(round) && s === String(round)) return { round, completionTimeSeconds: null };

  const parts = s.split(':').map((p) => parseInt(p.trim(), 10));
  if (parts.some(Number.isNaN)) return { round: null, completionTimeSeconds: null };
  if (parts.length === 2) {
    const [min, sec] = parts;
    return { round: null, completionTimeSeconds: (min ?? 0) * 60 + (sec ?? 0) };
  }
  if (parts.length === 3) {
    const [h, min, sec] = parts;
    return { round: null, completionTimeSeconds: (h ?? 0) * 3600 + (min ?? 0) * 60 + (sec ?? 0) };
  }
  return { round: null, completionTimeSeconds: null };
}

function parseCsv(content: string): ParsedCsvRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = lines[0]!.toLowerCase();
  const idx = (name: string) => {
    const i = CSV_HEADERS.indexOf(name);
    if (i >= 0) return i;
    const h = header.split(',').map((c) => c.trim().replace(/^"|"$/g, '').toLowerCase());
    const j = h.indexOf(name);
    return j >= 0 ? j : -1;
  };
  const get = (row: string[], key: string) => {
    const i = idx(key);
    if (i < 0) return '';
    const cell = row[i];
    return (cell ?? '').trim().replace(/^"|"$/g, '');
  };

  const rows: ParsedCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    const row: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === ',' && !inQuotes) || c === undefined) {
        row.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    row.push(cur);

    rows.push({
      game: get(row, 'game'),
      map: get(row, 'map'),
      record: get(row, 'record'),
      sub_record: get(row, 'sub_record'),
      platform: get(row, 'platform'),
      main_video: get(row, 'main_video'),
      other_links: get(row, 'other_links'),
      game_type: get(row, 'game_type'),
      achieved: get(row, 'achieved'),
      player_count: get(row, 'player_count'),
      player_1: get(row, 'player_1'),
      player_2: get(row, 'player_2'),
      player_3: get(row, 'player_3'),
      player_4: get(row, 'player_4'),
      is_world_record: get(row, 'is_world_record'),
      added: get(row, 'added'),
      _rowIndex: i + 1,
    });
  }
  return rows;
}

function parseProofUrls(row: ParsedCsvRow): string[] {
  const urls: string[] = [];
  if (row.main_video) urls.push(row.main_video.trim());
  if (row.other_links) {
    try {
      const parsed = JSON.parse(row.other_links) as unknown;
      if (Array.isArray(parsed)) {
        for (const u of parsed) if (typeof u === 'string' && u.trim()) urls.push(u.trim());
      }
    } catch {
      const split = row.other_links.split(/[\s,]+/).map((u) => u.trim()).filter(Boolean);
      urls.push(...split);
    }
  }
  if (urls.length === 0) urls.push(DEFAULTS.placeholderProofUrl);
  return normalizeProofUrls(urls);
}

function parseAddedDate(added: string): Date {
  if (!added || !added.trim()) return new Date();
  const parts = added.trim().split(/\s+/);
  if (parts.length >= 1) {
    const [datePart, timePart] = parts;
    const [m, d, y] = (datePart ?? '').split(/[/-]/).map((x) => parseInt(x, 10));
    let hours = 0, minutes = 0;
    if (timePart) {
      const [h, min] = timePart.split(':').map((x) => parseInt(x, 10));
      hours = h ?? 0;
      minutes = min ?? 0;
    }
    if (!Number.isNaN(m) && !Number.isNaN(d) && !Number.isNaN(y)) {
      const year = y! < 100 ? 2000 + y! : y!;
      return new Date(year, (m ?? 1) - 1, d ?? 1, hours, minutes, 0, 0);
    }
  }
  return new Date();
}

/** Split teammates into CZT user IDs (from zwr-to-czt-users.ts) and placeholder names for non-site users. */
function getTeammateUserIdsAndNames(row: ParsedCsvRow, sourcePlayerId: string): { teammateUserIds: string[]; teammateNonUserNames: string[] } {
  const ids = [row.player_1, row.player_2, row.player_3, row.player_4]
    .map((p) => (p || '').trim())
    .filter((p) => p && p !== '0' && p !== sourcePlayerId);
  const unique = [...new Set(ids)];
  const teammateUserIds: string[] = [];
  const teammateNonUserNames: string[] = [];
  for (const id of unique) {
    const cztId = getCztUserIdForZwrId(id);
    if (cztId) teammateUserIds.push(cztId);
    else teammateNonUserNames.push(`Player ${id}`);
  }
  return { teammateUserIds, teammateNonUserNames };
}

function parseArgs(): {
  csvPath: string;
  sourcePlayerId: string;
  cztUser: string;
  dryRun: boolean;
  reportPath: string | null;
  skipExisting: boolean;
} {
  const args = process.argv.slice(2);
  let csvPath = '';
  let sourcePlayerId = '';
  let cztUser = '';
  let dryRun = false;
  let reportPath: string | null = null;
  let skipExisting = true;

  for (const a of args) {
    if (a.startsWith('--csv=')) csvPath = a.slice(6).trim().replace(/^=+/, '');
    else if (a.startsWith('--source-player-id=')) sourcePlayerId = a.slice(18).trim().replace(/^=+/, '');
    else if (a.startsWith('--czt-user=')) cztUser = a.slice(11).trim().replace(/^=+/, '');
    else if (a === '--dry-run') dryRun = true;
    else if (a.startsWith('--report=')) reportPath = a.slice(9).trim().replace(/^=+/, '') || null;
    else if (a === '--no-skip-existing') skipExisting = false;
  }

  if (!csvPath || !sourcePlayerId || !cztUser) {
    console.error('Usage: npx tsx scripts/import-skrine-csv/run.ts --csv=<path> --source-player-id=<id> --czt-user=<username|id|displayName> [--dry-run] [--report=<path>] [--no-skip-existing]');
    process.exit(1);
  }
  return { csvPath, sourcePlayerId, cztUser, dryRun, reportPath, skipExisting };
}

async function resolveCztUser(cztUser: string): Promise<{ id: string }> {
  const byId = await prisma.user.findUnique({ where: { id: cztUser }, select: { id: true } });
  if (byId) return byId;
  const byUsername = await prisma.user.findUnique({ where: { username: cztUser }, select: { id: true } });
  if (byUsername) return byUsername;
  const byDisplay = await prisma.user.findFirst({ where: { displayName: cztUser }, select: { id: true } });
  if (byDisplay) return byDisplay;
  throw new Error(`CZT user not found: ${cztUser} (tried id, username, displayName)`);
}

async function resolveMap(gameCode: string, mapSlug: string): Promise<{ id: string; gameShortName: string } | null> {
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
    select: { id: true, game: { select: { shortName: true } } },
  });
  if (!map) return null;
  return { id: map.id, gameShortName: map.game.shortName };
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

async function findExistingChallengeLog(
  userId: string,
  mapId: string,
  challengeId: string,
  roundReached: number,
  completionTimeSeconds: number | null,
  proofUrls: string[]
): Promise<boolean> {
  const existing = await prisma.challengeLog.findFirst({
    where: {
      userId,
      mapId,
      challengeId,
      roundReached,
      ...(completionTimeSeconds != null ? { completionTimeSeconds } : {}),
    },
    select: { id: true },
  });
  if (!existing) return false;
  const log = await prisma.challengeLog.findUnique({
    where: { id: existing.id },
    select: { proofUrls: true },
  });
  if (!log) return false;
  const sameProof = log.proofUrls.length === proofUrls.length && proofUrls.every((u, i) => log.proofUrls[i] === u);
  return sameProof;
}

async function findExistingEasterEggLog(
  userId: string,
  mapId: string,
  easterEggId: string,
  completionTimeSeconds: number | null,
  proofUrls: string[]
): Promise<boolean> {
  const existing = await prisma.easterEggLog.findFirst({
    where: {
      userId,
      mapId,
      easterEggId,
      ...(completionTimeSeconds != null ? { completionTimeSeconds } : {}),
    },
    select: { id: true, proofUrls: true },
  });
  if (!existing) return false;
  const sameProof = existing.proofUrls.length === proofUrls.length && proofUrls.every((u, i) => existing.proofUrls[i] === u);
  return sameProof;
}

async function main() {
  const { csvPath, sourcePlayerId, cztUser, dryRun, reportPath, skipExisting } = parseArgs();
  const csvAbs = path.isAbsolute(csvPath) ? csvPath : path.resolve(process.cwd(), csvPath);
  if (!fs.existsSync(csvAbs)) {
    console.error('CSV file not found:', csvAbs);
    process.exit(1);
  }

  console.log('Resolving CZT user...');
  const user = await resolveCztUser(cztUser);
  console.log('CZT user id:', user.id);

  const content = fs.readFileSync(csvAbs, 'utf-8');
  const allRows = parseCsv(content);
  const rows = allRows.filter((r) => {
    const players = [r.player_1, r.player_2, r.player_3, r.player_4].map((p) => (p || '').trim());
    return players.includes(sourcePlayerId);
  });
  console.log(`CSV rows: ${allRows.length} total, ${rows.length} where source player "${sourcePlayerId}" is in the run`);

  const report: ReportRow[] = [];
  const skippedReasons: { row: number; game: string; map: string; record: string; sub_record: string; reason: string }[] = [];
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const gameCode = row.game.toLowerCase().trim();
    const mapSlug = row.map.toLowerCase().trim();

    if (SKIP_GAMES.has(gameCode)) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        reason: `Game "${gameCode}" is skipped (community/custom)`,
      });
      report.push({
        csvRowIndex: row._rowIndex,
        status: 'skipped',
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        message: 'Game is community/custom',
      });
      skipped++;
      continue;
    }

    const mapRecord = await resolveMap(gameCode, mapSlug);
    if (!mapRecord) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        reason: `Map not found: game=${gameCode}, map=${mapSlug}`,
      });
      report.push({
        csvRowIndex: row._rowIndex,
        status: 'skipped',
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        message: 'Map not found',
      });
      skipped++;
      continue;
    }

    const mapping = getRecordMapping(row.record, row.sub_record);
    if (!mapping) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        reason: `Unknown record type: record="${row.record}", sub_record="${row.sub_record}"`,
      });
      report.push({
        csvRowIndex: row._rowIndex,
        status: 'skipped',
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        message: `Unknown record: ${row.record} / ${row.sub_record}`,
      });
      skipped++;
      continue;
    }

    const challenge = await resolveChallenge(mapRecord.id, mapping.challengeType);
    if (!challenge) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        reason: `Challenge not found on map: type=${mapping.challengeType}`,
      });
      report.push({
        csvRowIndex: row._rowIndex,
        status: 'skipped',
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        message: `Challenge type ${mapping.challengeType} not on map`,
      });
      skipped++;
      continue;
    }

    const { round, completionTimeSeconds } = parseAchieved(row.achieved);
    const roundReached = round ?? 0;
    const proofUrls = parseProofUrls(row);
    const completedAt = parseAddedDate(row.added);
    const playerCount = parsePlayerCount(row.player_count);
    const { teammateUserIds, teammateNonUserNames } = getTeammateUserIdsAndNames(row, sourcePlayerId);

    const mods = mapping.modifiers as Record<string, unknown>;
    const difficulty = (mods.difficulty as string) ?? null;
    const bo3GobbleGumMode = (mods.bo3GobbleGumMode as string) ?? DEFAULTS.bo3GobbleGumMode;
    const bo4ElixirMode = (mods.bo4ElixirMode as string) ?? null;
    const bocwSupportMode = (mods.bocwSupportMode as string) ?? DEFAULTS.bocwSupportMode;
    const rampageInducerUsed = mods.rampageInducerUsed as boolean | undefined;
    const firstRoomVariant = (mods.firstRoomVariant as string) ?? null;
    const bo3AatUsed = mods.bo3AatUsed as boolean | undefined;
    const ww2ConsumablesUsed = mods.ww2ConsumablesUsed as boolean | undefined;
    const vanguardVoidUsed = mods.vanguardVoidUsed as boolean | undefined;
    const useFortuneCards = mods.useFortuneCards as boolean | undefined;
    const useDirectorsCut = mods.useDirectorsCut as boolean | undefined;
    const bo6GobbleGumMode = (mods.bo6GobbleGumMode as string) ?? null;
    const bo6SupportMode = (mods.bo6SupportMode as string) ?? null;
    const bo7SupportMode = (mods.bo7SupportMode as string) ?? null;

    if (skipExisting) {
      const exists = await findExistingChallengeLog(
        user.id,
        mapRecord.id,
        challenge.id,
        roundReached,
        completionTimeSeconds,
        proofUrls
      );
      if (exists) {
        report.push({
          csvRowIndex: row._rowIndex,
          status: 'skipped',
          game: row.game,
          map: row.map,
          record: row.record,
          sub_record: row.sub_record,
          message: 'Duplicate: identical log already exists',
        });
        skipped++;
        continue;
      }
    }

    if (dryRun) {
      report.push({
        csvRowIndex: row._rowIndex,
        status: 'imported',
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        message: '[DRY RUN] Would create ChallengeLog',
        logIds: ['dry-run'],
      });
      if (mapping.createEasterEggLog) {
        report.push({
          csvRowIndex: row._rowIndex,
          status: 'imported',
          game: row.game,
          map: row.map,
          record: row.record,
          sub_record: row.sub_record,
          message: '[DRY RUN] Would create EasterEggLog',
          logIds: ['dry-run-ee'],
        });
      }
      imported++;
      continue;
    }

    try {
      const logPayload = {
        userId: user.id,
        challengeId: challenge.id,
        mapId: mapRecord.id,
        roundReached,
        playerCount,
        completedAt,
        completionTimeSeconds,
        proofUrls,
        teammateUserIds,
        teammateNonUserNames,
        isVerified: true,
        difficulty: difficulty as 'CASUAL' | 'NORMAL' | 'HARDCORE' | 'REALISTIC' | null,
        bo3GobbleGumMode,
        bo4ElixirMode,
        bocwSupportMode,
        rampageInducerUsed: rampageInducerUsed ?? DEFAULTS.rampageInducerUsed,
        firstRoomVariant,
        bo3AatUsed,
        ww2ConsumablesUsed,
        vanguardVoidUsed,
        useFortuneCards,
        useDirectorsCut,
        bo6GobbleGumMode,
        bo6SupportMode,
        bo7SupportMode,
      };

      const challengeLog = await prisma.challengeLog.create({
        data: logPayload as never,
      });
      const logIds: string[] = [challengeLog.id];

      if (mapping.createEasterEggLog) {
        const mainEe = await resolveMainQuestEasterEgg(mapRecord.id);
        if (mainEe) {
          const eeExists = skipExisting && (await findExistingEasterEggLog(
            user.id,
            mapRecord.id,
            mainEe.id,
            completionTimeSeconds,
            proofUrls
          ));
          if (!eeExists) {
            const eeLog = await prisma.easterEggLog.create({
              data: {
                userId: user.id,
                easterEggId: mainEe.id,
                mapId: mapRecord.id,
                roundCompleted: roundReached > 0 ? roundReached : null,
                playerCount,
                completedAt,
                completionTimeSeconds,
                proofUrls,
                teammateUserIds,
                teammateNonUserNames,
                isVerified: true,
                isSolo: playerCount === 'SOLO',
                difficulty: difficulty as 'CASUAL' | 'NORMAL' | 'HARDCORE' | 'REALISTIC' | null,
                rampageInducerUsed: rampageInducerUsed ?? false,
                ww2ConsumablesUsed,
                vanguardVoidUsed,
              } as never,
            });
            logIds.push(eeLog.id);
          }
        }
      }

      report.push({
        csvRowIndex: row._rowIndex,
        status: 'imported',
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        message: 'Created ChallengeLog' + (mapping.createEasterEggLog ? ' + EasterEggLog' : ''),
        logIds,
      });
      imported++;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      console.error(`Row ${row._rowIndex} error:`, err);
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        reason: `Error: ${err}`,
      });
      report.push({
        csvRowIndex: row._rowIndex,
        status: 'error',
        game: row.game,
        map: row.map,
        record: row.record,
        sub_record: row.sub_record,
        message: err,
      });
      errors++;
    }
  }

  console.log('\n--- Summary ---');
  console.log('Imported:', imported);
  console.log('Skipped:', skipped);
  console.log('Errors:', errors);

  if (skippedReasons.length > 0) {
    console.log('\n--- Skipped / failed list ---');
    for (const s of skippedReasons) {
      console.log(`  Row ${s.row} [${s.game}/${s.map}] ${s.record}${s.sub_record ? ` / ${s.sub_record}` : ''}: ${s.reason}`);
    }
  }

  if (reportPath) {
    const out = path.isAbsolute(reportPath) ? reportPath : path.resolve(process.cwd(), reportPath);
    fs.writeFileSync(out, JSON.stringify({ report, skippedReasons, summary: { imported, skipped, errors } }, null, 2));
    console.log('Report written to:', out);
  }

  if (errors > 0) process.exit(1);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
