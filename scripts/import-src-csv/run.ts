#!/usr/bin/env npx tsx
/**
 * Speedruns.com (SRC) CSV → CZT import script.
 *
 * Imports verified runs from an SRC-format CSV into a single CZT user.
 * Only rows where the source player (by name) appears in player_1..player_4 are imported.
 * Game/map from (game, category); challenge type from SRC sub_category via id key only (no time inference).
 * After import: reunlock achievements and recompute verified XP for that user.
 *
 * Usage:
 *   pnpm db:import-src-csv -- --csv=src-csvs/FallnightYT.csv --source-player=FallnightYT --czt-user=cmlzic2am0000jax7hqhmsck8 [--dry-run]
 *   To remove previously imported runs and revalidate the user: add [--remove-imported]. Use --dry-run first to see what would be removed.
 *
 * CSV columns: game, map, category, sub_category, time_primary, date, main_video, other_links, player_count, player_1..4, status
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
import {
  getGameShortNameFromSrc,
  getMapSlugFromSrc,
  inferSpeedrunChallengeType,
  isUnsupportedSuperCategory,
  DEFAULTS,
} from './config';
import { loadSrcIdKey, resolveModifiersWithIdKey, resolveSpeedrunTypeFromSubCategory } from './src-id-key';
import { getRoundForSpeedrunChallengeType } from '../import-skrine-csv/speedrun-round-by-type';
import { normalizeProofUrls } from '../../src/lib/utils';
import { resolveImportTargetUser } from '../external-users/import-user-resolution';
import { getSpeedrunAchievementDefinitions } from '../../src/lib/achievements/seed-achievements';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

export interface SrcCsvRow {
  game: string;
  map: string;
  category: string;
  sub_category: string;
  platform: string;
  time_primary: string;
  main_video: string;
  other_links: string;
  game_type: string;
  date: string;
  player_count: string;
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  run_url: string;
  status: string;
  _rowIndex: number;
}

function parseCsv(content: string): SrcCsvRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headerLine = lines[0]!;
  const headerCells = parseCsvLine(headerLine);
  const getIdx = (name: string) => {
    const i = headerCells.findIndex((c) => c.trim().toLowerCase() === name.toLowerCase());
    return i >= 0 ? i : -1;
  };
  const get = (row: string[], key: string) => {
    const i = getIdx(key);
    if (i < 0) return '';
    return (row[i] ?? '').trim().replace(/^"|"$/g, '');
  };

  const rows: SrcCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!);
    rows.push({
      game: get(cells, 'game'),
      map: get(cells, 'map'),
      category: get(cells, 'category'),
      sub_category: get(cells, 'sub_category'),
      platform: get(cells, 'platform'),
      time_primary: get(cells, 'time_primary'),
      main_video: get(cells, 'main_video'),
      other_links: get(cells, 'other_links'),
      game_type: get(cells, 'game_type'),
      date: get(cells, 'date'),
      player_count: get(cells, 'player_count'),
      player_1: get(cells, 'player_1'),
      player_2: get(cells, 'player_2'),
      player_3: get(cells, 'player_3'),
      player_4: get(cells, 'player_4'),
      run_url: get(cells, 'run_url'),
      status: get(cells, 'status'),
      _rowIndex: i + 1,
    });
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const row: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || c === undefined) {
      row.push(cur.replace(/^"|"$/g, ''));
      cur = '';
    } else {
      cur += c;
    }
  }
  row.push(cur.replace(/^"|"$/g, ''));
  return row;
}

/**
 * Parse SRC time_primary: "2m 53.000s", "21m 29.530s", "22.850s", "1h 56m 19.230s"
 */
function parseTimePrimary(s: string): number | null {
  const raw = (s || '').trim();
  if (!raw) return null;
  let totalSeconds = 0;
  const hourMatch = raw.match(/(\d+)\s*h(?:our)?s?/i);
  const minMatch = raw.match(/(\d+)\s*m(?:in)?(?:ute)?s?/i);
  const secMatch = raw.match(/(\d+(?:\.\d+)?)\s*s(?:ec)?/i);
  if (hourMatch) totalSeconds += parseInt(hourMatch[1]!, 10) * 3600;
  if (minMatch) totalSeconds += parseInt(minMatch[1]!, 10) * 60;
  if (secMatch) totalSeconds += parseFloat(secMatch[1]!);
  if (totalSeconds <= 0 && raw.match(/\d/)) {
    const onlyNum = raw.match(/^(\d+(?:\.\d+)?)\s*$/);
    if (onlyNum) totalSeconds = parseFloat(onlyNum[1]!);
  }
  if (totalSeconds > 0) return Math.round(totalSeconds);
  return null;
}

function parseDate(s: string): Date {
  const raw = (s || '').trim();
  if (!raw) return new Date();
  const [y, m, d] = raw.split(/[-/]/).map((x) => parseInt(x, 10));
  if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
    const year = y! < 100 ? 2000 + y! : y!;
    return new Date(year, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
  }
  return new Date();
}

function parseProofUrls(row: SrcCsvRow): string[] {
  const urls: string[] = [];
  if (row.main_video?.trim()) urls.push(row.main_video.trim());
  if (row.other_links?.trim()) {
    const split = row.other_links.split(/[;\s]+/).map((u) => u.trim()).filter(Boolean);
    urls.push(...split);
  }
  if (urls.length === 0) urls.push(DEFAULTS.placeholderProofUrl);
  return normalizeProofUrls(urls);
}

function parsePlayerCount(n: string): 'SOLO' | 'DUO' | 'TRIO' | 'SQUAD' {
  const num = parseInt(String(n).trim(), 10);
  if (num === 1) return 'SOLO';
  if (num === 2) return 'DUO';
  if (num === 3) return 'TRIO';
  if (num === 4) return 'SQUAD';
  return 'SOLO';
}

function getTeammateNames(row: SrcCsvRow, sourcePlayer: string): { teammateUserIds: string[]; teammateNonUserNames: string[] } {
  const names = [row.player_1, row.player_2, row.player_3, row.player_4]
    .map((p) => (p || '').trim())
    .filter((p) => p && p !== sourcePlayer);
  const unique = [...new Set(names)];
  return { teammateUserIds: [], teammateNonUserNames: unique };
}

async function resolveCztUser(cztUser: string): Promise<{ id: string }> {
  const byId = await prisma.user.findUnique({ where: { id: cztUser }, select: { id: true } });
  if (byId) return byId;
  const byUsername = await prisma.user.findUnique({ where: { username: cztUser }, select: { id: true } });
  if (byUsername) return byUsername;
  const byDisplay = await prisma.user.findFirst({ where: { displayName: cztUser }, select: { id: true } });
  if (byDisplay) return byDisplay;
  throw new Error(`CZT user not found: ${cztUser}`);
}

async function resolveMap(gameShortName: string, mapSlug: string): Promise<{ id: string; gameShortName: string } | null> {
  const map = await prisma.map.findFirst({
    where: { slug: mapSlug, game: { shortName: gameShortName } },
    select: { id: true, game: { select: { shortName: true } } },
  });
  if (!map) return null;
  return { id: map.id, gameShortName: map.game.shortName };
}

async function getMapSpeedrunChallengeTypes(mapId: string): Promise<string[]> {
  const SPEEDRUN_TYPES = new Set([
    'ROUND_5_SPEEDRUN',
    'ROUND_10_SPEEDRUN',
    'ROUND_15_SPEEDRUN',
    'ROUND_20_SPEEDRUN',
    'ROUND_30_SPEEDRUN',
    'ROUND_50_SPEEDRUN',
    'ROUND_70_SPEEDRUN',
    'ROUND_100_SPEEDRUN',
    'ROUND_200_SPEEDRUN',
    'ROUND_255_SPEEDRUN',
    'SUPER_30_SPEEDRUN',
    'EXFIL_SPEEDRUN',
    'EXFIL_R5_SPEEDRUN',
    'EXFIL_R10_SPEEDRUN',
    'EXFIL_R20_SPEEDRUN',
    'EXFIL_R21_SPEEDRUN',
    'PACK_A_PUNCH_SPEEDRUN',
  ]);
  const challenges = await prisma.challenge.findMany({
    where: { mapId },
    select: { type: true },
  });
  return challenges.map((c) => c.type).filter((t) => SPEEDRUN_TYPES.has(t));
}

async function resolveChallenge(mapId: string, challengeType: string): Promise<{ id: string } | null> {
  const c = await prisma.challenge.findFirst({
    where: { mapId, type: challengeType as never },
    select: { id: true },
  });
  return c;
}

async function ensureChallenge(mapId: string, challengeType: string): Promise<{ id: string } | null> {
  const existing = await resolveChallenge(mapId, challengeType);
  if (existing) return existing;
  if (challengeType !== 'PACK_A_PUNCH_SPEEDRUN') return null;
  try {
    const created = await prisma.challenge.create({
      data: {
        mapId,
        type: challengeType as never,
        name: 'Pack-a-Punch Speedrun',
        slug: 'pack-a-punch-speedrun',
        description: 'Reach Pack-a-Punch / weapon upgrade as fast as possible',
        xpReward: 0,
        isActive: true,
      },
      select: { id: true },
    });
    return created;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('PACK_A_PUNCH_SPEEDRUN') || message.includes('enum \"ChallengeType\"')) {
      throw new Error(
        'PACK_A_PUNCH_SPEEDRUN enum is not in the database yet. Run `pnpm db:migrate:deploy` before importing this SRC category.'
      );
    }
    throw error;
  }
}

const ensuredPackAchievements = new Set<string>();

async function ensurePackSpeedrunAchievementsForMap(
  mapId: string,
  mapSlug: string,
  gameShortName: string,
  challengeId: string,
  dryRun: boolean
): Promise<void> {
  const key = `${mapId}:${challengeId}`;
  if (ensuredPackAchievements.has(key)) return;
  ensuredPackAchievements.add(key);
  if (dryRun) return;

  const defs = getSpeedrunAchievementDefinitions(mapSlug, gameShortName).filter(
    (d) => d.criteria?.challengeType === 'PACK_A_PUNCH_SPEEDRUN'
  );
  for (const def of defs) {
    const existing = await prisma.achievement.findFirst({
      where: { mapId, slug: def.slug },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.achievement.create({
      data: {
        name: def.name,
        slug: def.slug,
        type: def.type,
        criteria: def.criteria as object,
        xpReward: def.xpReward,
        rarity: def.rarity as never,
        mapId,
        challengeId,
        isActive: true,
      } as never,
    });
  }
}

async function findExistingChallengeLog(
  userId: string,
  mapId: string,
  challengeId: string,
  roundReached: number,
  completionTimeSeconds: number | null,
  proofUrls: string[]
): Promise<{ id: string } | null> {
  const existing = await prisma.challengeLog.findFirst({
    where: {
      userId,
      mapId,
      challengeId,
      roundReached,
      ...(completionTimeSeconds != null ? { completionTimeSeconds } : {}),
    },
    select: { id: true, proofUrls: true },
  });
  if (!existing) return null;
  const sameProof =
    existing.proofUrls.length === proofUrls.length &&
    proofUrls.every((u, i) => existing.proofUrls[i] === u);
  return sameProof ? { id: existing.id } : null;
}

async function findImportedLogToRemove(
  userId: string,
  mapId: string,
  challengeId: string,
  roundReached: number,
  completionTimeSeconds: number,
  completedAtDay: Date
): Promise<{ id: string } | null> {
  const dayEnd = new Date(completedAtDay);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const logs = await prisma.challengeLog.findMany({
    where: {
      userId,
      mapId,
      challengeId,
      roundReached,
      completionTimeSeconds,
      completedAt: { gte: completedAtDay, lt: dayEnd },
    },
    select: { id: true },
    orderBy: { completedAt: 'asc' },
  });
  return logs.length > 0 ? { id: logs[0]!.id } : null;
}

function parseArgs(): {
  csvPath: string;
  sourcePlayer: string;
  cztUser: string | null;
  autoUser: boolean;
  dryRun: boolean;
  skipExisting: boolean;
  removeImported: boolean;
  skipRevalidate: boolean;
  forceRevalidate: boolean;
} {
  const args = process.argv.slice(2);
  let csvPath = '';
  let sourcePlayer = '';
  let cztUser: string | null = null;
  let autoUser = false;
  let dryRun = false;
  let skipExisting = true;
  let removeImported = false;
  let skipRevalidate = false;
  let forceRevalidate = false;

  for (const a of args) {
    if (a.startsWith('--csv=')) csvPath = a.slice(6).trim().replace(/^=+/, '');
    else if (a.startsWith('--source-player=')) sourcePlayer = a.slice(16).trim().replace(/^=+/, '');
    else if (a.startsWith('--czt-user=')) cztUser = a.slice(11).trim().replace(/^=+/, '') || null;
    else if (a === '--auto-user') autoUser = true;
    else if (a === '--dry-run') dryRun = true;
    else if (a === '--no-skip-existing') skipExisting = false;
    else if (a === '--remove-imported') removeImported = true;
    else if (a === '--skip-revalidate') skipRevalidate = true;
    else if (a === '--force-revalidate') forceRevalidate = true;
  }

  if (!csvPath || !sourcePlayer || (!cztUser && !autoUser)) {
    console.error(
      'Usage: pnpm db:import-src-csv -- --csv=<path> --source-player=<SRC name> [--czt-user=<CZT id|username> | --auto-user] [--dry-run] [--no-skip-existing] [--remove-imported] [--skip-revalidate] [--force-revalidate]'
    );
    process.exit(1);
  }
  return { csvPath, sourcePlayer, cztUser, autoUser, dryRun, skipExisting, removeImported, skipRevalidate, forceRevalidate };
}

async function main() {
  const { csvPath, sourcePlayer, cztUser, autoUser, dryRun, skipExisting, removeImported, skipRevalidate, forceRevalidate } = parseArgs();
  const csvAbs = path.isAbsolute(csvPath) ? csvPath : path.resolve(process.cwd(), csvPath);
  if (!fs.existsSync(csvAbs)) {
    console.error('CSV file not found:', csvAbs);
    process.exit(1);
  }

  console.log('Resolving CZT user...');
  const user = await resolveImportTargetUser({
    prisma,
    source: 'SRC',
    sourcePlayerName: sourcePlayer,
    explicitCztUser: cztUser,
    allowAutoUser: autoUser,
    dryRun,
    resolveExplicitUser: resolveCztUser,
  });
  console.log('CZT user id:', user.id);
  if (autoUser || !cztUser) {
    console.log(`User resolution mode: ${user.resolution}`);
  }

  if (removeImported) {
    console.log('Mode: --remove-imported (delete logs that match this CSV, then revalidate user)');
  }

  const idKey = removeImported ? null : loadSrcIdKey(root);
  if (idKey?.variables) {
    console.log('Loaded SRC id key: variables available for modifier resolution');
  } else if (!removeImported) {
    console.log('SRC id key not found or empty; using default modifiers');
  }

  const content = fs.readFileSync(csvAbs, 'utf-8');
  const allRows = parseCsv(content);
  const rows = allRows.filter((r) => {
    const players = [r.player_1, r.player_2, r.player_3, r.player_4].map((p) => (p || '').trim());
    return players.includes(sourcePlayer);
  });
  console.log(`CSV rows: ${allRows.length} total, ${rows.length} where source player "${sourcePlayer}"`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  let removed = 0;
  const skippedReasons: { row: number; game: string; category: string; reason: string }[] = [];

  for (const row of rows) {
    if (isUnsupportedSuperCategory(row.category)) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        category: row.category,
        reason: 'Unsupported SRC category: Super speedruns not tracked on site',
      });
      skipped++;
      continue;
    }

    const gameShortName = getGameShortNameFromSrc(row.game);
    if (!gameShortName) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        category: row.category,
        reason: `Unknown game: ${row.game}`,
      });
      skipped++;
      continue;
    }

    const mapSlug = getMapSlugFromSrc(row.game, row.category);
    if (!mapSlug) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        category: row.category,
        reason: `No map mapping for game="${row.game}", category="${row.category}"`,
      });
      skipped++;
      continue;
    }

    const mapRecord = await resolveMap(gameShortName, mapSlug);
    if (!mapRecord) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        category: row.category,
        reason: `Map not found: ${gameShortName}/${mapSlug}`,
      });
      skipped++;
      continue;
    }

    const timeSeconds = parseTimePrimary(row.time_primary);
    if (timeSeconds == null || timeSeconds <= 0) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        category: row.category,
        reason: `Could not parse time_primary: "${row.time_primary}"`,
      });
      skipped++;
      continue;
    }

    const speedrunTypes = await getMapSpeedrunChallengeTypes(mapRecord.id);
    const speedrunTypeSet = new Set(speedrunTypes);
    let challengeType: string | null =
      idKey && row.sub_category
        ? resolveSpeedrunTypeFromSubCategory(row.sub_category, idKey)
        : null;
    if (challengeType && !speedrunTypeSet.has(challengeType)) challengeType = null;
    if (!challengeType && removeImported) {
      challengeType = inferSpeedrunChallengeType(timeSeconds, speedrunTypes);
    }
    if (!challengeType) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        category: row.category,
        reason: removeImported
          ? `No matching speedrun type (SRC sub_category had no round; time ${timeSeconds}s not in buckets for map)`
          : `No round in SRC sub_category (id key); import requires explicit round, time inference disabled`,
      });
      skipped++;
      continue;
    }
    const usedSrcRound = !removeImported;

    const challenge = await ensureChallenge(mapRecord.id, challengeType);
    if (!challenge) {
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        category: row.category,
        reason: `Challenge not found: ${challengeType}`,
      });
      skipped++;
      continue;
    }
    if (challengeType === 'PACK_A_PUNCH_SPEEDRUN') {
      await ensurePackSpeedrunAchievementsForMap(
        mapRecord.id,
        mapSlug,
        mapRecord.gameShortName,
        challenge.id,
        dryRun
      );
    }

    const roundReached = getRoundForSpeedrunChallengeType(challengeType) ?? 0;
    const proofUrls = parseProofUrls(row);
    const completedAt = parseDate(row.date);

    if (removeImported) {
      const toRemove = await findImportedLogToRemove(
        user.id,
        mapRecord.id,
        challenge.id,
        roundReached,
        timeSeconds,
        completedAt
      );
      if (dryRun) {
        if (toRemove) console.log(`[DRY RUN] Would remove log ${toRemove.id}: ${mapSlug} ${challengeType} ${timeSeconds}s`);
        else console.log(`[DRY RUN] No log found to remove: ${mapSlug} ${challengeType} ${timeSeconds}s`);
        if (toRemove) removed++;
      } else {
        if (toRemove) {
          await prisma.challengeLog.delete({ where: { id: toRemove.id } });
          removed++;
        }
      }
      continue;
    }

    const playerCount = parsePlayerCount(row.player_count);
    const { teammateUserIds, teammateNonUserNames } = getTeammateNames(row, sourcePlayer);
    const isVerified = (row.status || '').toLowerCase() === 'verified';
    const { mods: resolvedMods, summary: modifierSummary } = resolveModifiersWithIdKey(
      mapRecord.gameShortName,
      row.sub_category,
      idKey!
    );

    if (skipExisting) {
      const existing = await findExistingChallengeLog(
        user.id,
        mapRecord.id,
        challenge.id,
        roundReached,
        timeSeconds,
        proofUrls
      );
      if (existing) {
        skipped++;
        continue;
      }
    }

    if (dryRun) {
      const fromSrc = usedSrcRound ? ' (round from SRC)' : '';
      console.log(
        `[DRY RUN] Row ${row._rowIndex}: ${row.game} / ${row.category} → ${mapSlug} ${challengeType} ${timeSeconds}s${fromSrc}  |  ${modifierSummary}`
      );
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
        completionTimeSeconds: timeSeconds,
        proofUrls,
        teammateUserIds,
        teammateNonUserNames,
        isVerified,
        difficulty: null as 'CASUAL' | 'NORMAL' | 'HARDCORE' | 'REALISTIC' | null,
        bo3GobbleGumMode: resolvedMods.bo3GobbleGumMode,
        bo4ElixirMode: resolvedMods.bo4ElixirMode,
        bocwSupportMode: resolvedMods.bocwSupportMode,
        rampageInducerUsed: resolvedMods.rampageInducerUsed,
        firstRoomVariant: null as string | null,
        bo3AatUsed: undefined as boolean | undefined,
        ww2ConsumablesUsed: resolvedMods.ww2ConsumablesUsed ?? true,
        vanguardVoidUsed: resolvedMods.vanguardVoidUsed,
        bo2BankUsed: resolvedMods.bo2BankUsed,
        useFortuneCards: resolvedMods.useFortuneCards ?? true,
        useDirectorsCut: resolvedMods.useDirectorsCut ?? false,
        bo6GobbleGumMode: resolvedMods.bo6GobbleGumMode ?? DEFAULTS.bo6GobbleGumMode,
        bo6SupportMode: resolvedMods.bo6SupportMode ?? DEFAULTS.bo6SupportMode,
        bo7SupportMode: resolvedMods.bo7SupportMode ?? DEFAULTS.bo7SupportMode,
        bo7GobbleGumMode: resolvedMods.bo7GobbleGumMode ?? DEFAULTS.bo7GobbleGumMode,
      };

      await prisma.challengeLog.create({ data: logPayload as never });
      imported++;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      console.error(`Row ${row._rowIndex} error:`, err);
      skippedReasons.push({
        row: row._rowIndex,
        game: row.game,
        category: row.category,
        reason: `Error: ${err}`,
      });
      errors++;
    }
  }

  console.log('\n--- Summary ---');
  if (removeImported) {
    console.log('Removed:', removed);
    console.log('Skipped (no map/challenge/etc):', skipped);
  } else {
    console.log('Imported:', imported);
    console.log('Skipped:', skipped);
  }
  console.log('Errors:', errors);

  if (skippedReasons.length > 0) {
    console.log('\n--- Skipped / failed ---');
    for (const s of skippedReasons) {
      console.log(`  Row ${s.row} [${s.game} / ${s.category}]: ${s.reason}`);
    }
  }

  const shouldRevalidate = !dryRun && !skipRevalidate && (imported > 0 || (removeImported && removed > 0) || forceRevalidate);
  if (shouldRevalidate) {
    console.log('\n--- Revalidating (reunlock + recompute verified XP) ---');
    execSync('pnpm db:reunlock-achievements', {
      stdio: 'inherit',
      cwd: root,
      env: { ...process.env, BACKFILL_USER_ID: user.id },
    });
    execSync('pnpm db:recompute-verified-xp', {
      stdio: 'inherit',
      cwd: root,
      env: { ...process.env, BACKFILL_USER_ID: user.id },
    });
  }

  if (errors > 0) process.exit(1);
}

if (
  process.argv[1]?.includes('import-src-csv/run') ||
  process.argv[1]?.includes('import-src-csv\\run')
) {
  main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}
