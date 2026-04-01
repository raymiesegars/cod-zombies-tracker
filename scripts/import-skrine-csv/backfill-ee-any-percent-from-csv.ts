#!/usr/bin/env npx tsx
/**
 * Backfill EE Any% gum/elixir modes from CSV imports.
 *
 * Problem:
 * Some imported EE speedrun rows used Any% on ZWR, but existing logs were
 * saved as classic modes.
 *
 * This script:
 * - Reads a CSV export
 * - Finds rows with EE speedrun + Any% sub_record
 * - Matches existing ChallengeLog rows by map/challenge/playerCount/time/proof
 * - Updates the correct mode field to ANY_PERCENT:
 *   - BO3 -> bo3GobbleGumMode
 *   - BO4 -> bo4ElixirMode
 *   - BO6 -> bo6GobbleGumMode
 *   - BO7 -> bo7GobbleGumMode
 *
 * Optional:
 * - Re-runs achievement + verified XP recompute scoped to impacted user+map pairs.
 *
 * Usage:
 *   npx tsx scripts/import-skrine-csv/backfill-ee-any-percent-from-csv.ts --csv=path/to/file.csv --dry-run
 *   npx tsx scripts/import-skrine-csv/backfill-ee-any-percent-from-csv.ts --csv-dir=top-178-csv --dry-run
 *   npx tsx scripts/import-skrine-csv/backfill-ee-any-percent-from-csv.ts --csv-dir=top-178-csv --apply --skip-revalidate
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
import { parseAchieved, parseCsv, parseProofUrls } from './run';
import { normalizeProofUrls } from '../../src/lib/utils';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

type ParsedArgs = {
  csvPath: string | null;
  csvDir: string | null;
  apply: boolean;
  dryRun: boolean;
  skipRevalidate: boolean;
  maxFiles: number | null;
};

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  let csvPath: string | null = null;
  let csvDir: string | null = null;
  let apply = false;
  let dryRun = false;
  let skipRevalidate = false;
  let maxFiles: number | null = null;

  for (const a of args) {
    if (a.startsWith('--csv=')) csvPath = a.slice(6).trim();
    else if (a.startsWith('--csv-dir=')) csvDir = a.slice(10).trim();
    else if (a === '--apply') apply = true;
    else if (a === '--dry-run') dryRun = true;
    else if (a === '--skip-revalidate') skipRevalidate = true;
    else if (a.startsWith('--max-files=')) {
      const n = parseInt(a.slice(12).trim(), 10);
      maxFiles = Number.isFinite(n) && n > 0 ? n : null;
    }
  }

  if (!csvPath && !csvDir) {
    console.error('Usage: --csv=<path> OR --csv-dir=<dir> [--apply|--dry-run] [--skip-revalidate] [--max-files=N]');
    process.exit(1);
  }
  if (csvPath && csvDir) {
    console.error('Use either --csv or --csv-dir, not both.');
    process.exit(1);
  }
  if (apply && dryRun) {
    console.error('Choose only one: --apply or --dry-run');
    process.exit(1);
  }
  if (!apply && !dryRun) dryRun = true;
  return { csvPath, csvDir, apply, dryRun, skipRevalidate, maxFiles };
}

function parsePlayerCount(n: string): 'SOLO' | 'DUO' | 'TRIO' | 'SQUAD' {
  const num = parseInt(String(n).trim(), 10);
  if (num === 2) return 'DUO';
  if (num === 3) return 'TRIO';
  if (num === 4) return 'SQUAD';
  return 'SOLO';
}

function isAnyPercentSubRecord(subRecord: string): boolean {
  const compact = subRecord.replace(/\s+/g, '').toLowerCase();
  if (compact.includes('any%') || compact.includes('anypercent')) return true;
  // ZWR EE exports often use plain "any" as the sub_record.
  return compact === 'any' || compact.startsWith('any-');
}

async function resolveMap(gameCode: string, mapSlug: string): Promise<{ id: string; slug: string; gameShortName: string } | null> {
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
    select: { id: true, slug: true, game: { select: { shortName: true } } },
  });
  if (!map) return null;
  return { id: map.id, slug: map.slug, gameShortName: map.game.shortName };
}

async function resolveChallenge(mapId: string, challengeType: string): Promise<{ id: string } | null> {
  return prisma.challenge.findFirst({
    where: { mapId, type: challengeType as never },
    select: { id: true },
  });
}

function resolveCsvPaths(args: ParsedArgs): string[] {
  if (args.csvPath) {
    const csvAbs = path.isAbsolute(args.csvPath) ? args.csvPath : path.resolve(process.cwd(), args.csvPath);
    if (!fs.existsSync(csvAbs)) {
      console.error('CSV file not found:', csvAbs);
      process.exit(1);
    }
    return [csvAbs];
  }
  const dirAbs = path.isAbsolute(args.csvDir!) ? args.csvDir! : path.resolve(process.cwd(), args.csvDir!);
  if (!fs.existsSync(dirAbs) || !fs.statSync(dirAbs).isDirectory()) {
    console.error('CSV directory not found:', dirAbs);
    process.exit(1);
  }
  const files = fs
    .readdirSync(dirAbs, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.csv'))
    .map((d) => path.join(dirAbs, d.name))
    .sort((a, b) => a.localeCompare(b));
  if (files.length === 0) {
    console.error('No CSV files found in directory:', dirAbs);
    process.exit(1);
  }
  if (args.maxFiles && args.maxFiles > 0) return files.slice(0, args.maxFiles);
  return files;
}

async function main() {
  const parsedArgs = parseArgs();
  const { apply, dryRun, skipRevalidate } = parsedArgs;
  const csvPaths = resolveCsvPaths(parsedArgs);

  console.log(dryRun ? '*** DRY RUN – no updates ***' : '*** APPLY MODE – updates enabled ***');
  console.log('CSV files to process:', csvPaths.length);

  let scanned = 0;
  let candidateRows = 0;
  let updatedLogs = 0;
  let ambiguousSkipped = 0;
  const touchedLogIds = new Set<string>();
  const impactedMapSlugs = new Set<string>();
  const impactedPairs = new Map<string, Set<string>>();

  const mapCache = new Map<string, { id: string; slug: string; gameShortName: string } | null>();
  const challengeCache = new Map<string, { id: string } | null>();
  const candidateCache = new Map<
    string,
    Array<{
      id: string;
      userId: string;
      proofUrls: string[];
      bo3GobbleGumMode: string | null;
      bo4ElixirMode: string | null;
      bo6GobbleGumMode: string | null;
      bo7GobbleGumMode: string | null;
    }>
  >();

  for (let fileIdx = 0; fileIdx < csvPaths.length; fileIdx++) {
    const csvAbs = csvPaths[fileIdx]!;
    const content = fs.readFileSync(csvAbs, 'utf-8');
    const rows = parseCsv(content);

    console.log(`\n[${fileIdx + 1}/${csvPaths.length}] ${path.basename(csvAbs)} (${rows.length} rows)`);

    for (const row of rows) {
      scanned++;
      if ((row.record || '').toLowerCase().trim() !== 'ee-speedrun') continue;
      if (!isAnyPercentSubRecord(row.sub_record || '')) continue;

      const mapping = getRecordMapping(row.record, row.sub_record);
      if (!mapping || mapping.challengeType !== 'EASTER_EGG_SPEEDRUN') continue;
      candidateRows++;

      const mapKey = `${row.game.toLowerCase().trim()}|${row.map.toLowerCase().trim()}`;
      if (!mapCache.has(mapKey)) {
        mapCache.set(mapKey, await resolveMap(row.game.toLowerCase().trim(), row.map.toLowerCase().trim()));
      }
      const mapRecord = mapCache.get(mapKey);
      if (!mapRecord) continue;

      const challengeKey = `${mapRecord.id}|${mapping.challengeType}`;
      if (!challengeCache.has(challengeKey)) {
        challengeCache.set(challengeKey, await resolveChallenge(mapRecord.id, mapping.challengeType));
      }
      const challenge = challengeCache.get(challengeKey);
      if (!challenge) continue;

      const { round, completionTimeSeconds } = parseAchieved(row.achieved);
      const roundReached = round ?? 0;
      const playerCount = parsePlayerCount(row.player_count);
      const proofUrls = normalizeProofUrls(parseProofUrls(row));
      const hasPlaceholderOnly = proofUrls.length === 1 && proofUrls[0] === 'https://zwr.gg/';
      const proofAnchor = proofUrls[0] ?? null;
      const candidateKey = `${mapRecord.id}|${challenge.id}|${playerCount}|${roundReached}|${completionTimeSeconds ?? 'null'}|${proofAnchor ?? 'none'}`;

      if (!candidateCache.has(candidateKey)) {
        const fetched = await prisma.challengeLog.findMany({
          where: {
            mapId: mapRecord.id,
            challengeId: challenge.id,
            playerCount,
            roundReached,
            ...(completionTimeSeconds != null ? { completionTimeSeconds } : {}),
            ...(proofAnchor ? { proofUrls: { has: proofAnchor } } : {}),
          },
          select: {
            id: true,
            userId: true,
            proofUrls: true,
            bo3GobbleGumMode: true,
            bo4ElixirMode: true,
            bo6GobbleGumMode: true,
            bo7GobbleGumMode: true,
          },
        });
        candidateCache.set(candidateKey, fetched);
      }
      const candidates = candidateCache.get(candidateKey)!;

      if (candidates.length === 0) continue;
      if (hasPlaceholderOnly && candidates.length > 1) {
        ambiguousSkipped++;
        continue;
      }

      for (const log of candidates) {
        if (!hasPlaceholderOnly) {
          const exactProofMatch =
            log.proofUrls.length === proofUrls.length &&
            proofUrls.every((u, i) => log.proofUrls[i] === u);
          if (!exactProofMatch && proofUrls.length > 0) continue;
        }

        const data: Record<string, string> = {};
        if (mapRecord.gameShortName === 'BO3' && log.bo3GobbleGumMode !== 'ANY_PERCENT') data.bo3GobbleGumMode = 'ANY_PERCENT';
        if (mapRecord.gameShortName === 'BO4' && log.bo4ElixirMode !== 'ANY_PERCENT') data.bo4ElixirMode = 'ANY_PERCENT';
        if (mapRecord.gameShortName === 'BO6' && log.bo6GobbleGumMode !== 'ANY_PERCENT') data.bo6GobbleGumMode = 'ANY_PERCENT';
        if (mapRecord.gameShortName === 'BO7' && log.bo7GobbleGumMode !== 'ANY_PERCENT') data.bo7GobbleGumMode = 'ANY_PERCENT';
        if (Object.keys(data).length === 0) continue;

        if (dryRun) {
          console.log(`[DRY] Row ${row._rowIndex} -> log ${log.id} (${mapRecord.slug})`, data);
        } else if (apply) {
          await prisma.challengeLog.update({ where: { id: log.id }, data });
        }

        touchedLogIds.add(log.id);
        impactedMapSlugs.add(mapRecord.slug);
        if (!impactedPairs.has(log.userId)) impactedPairs.set(log.userId, new Set<string>());
        impactedPairs.get(log.userId)!.add(mapRecord.slug);
        updatedLogs++;
      }
    }
  }

  console.log('\n--- Summary ---');
  console.log('CSV files processed:', csvPaths.length);
  console.log('Rows scanned:', scanned);
  console.log('Any% EE candidate rows:', candidateRows);
  console.log('Matched updates:', updatedLogs);
  console.log('Ambiguous rows skipped:', ambiguousSkipped);
  console.log('Unique logs touched:', touchedLogIds.size);
  console.log('Impacted users:', impactedPairs.size);
  console.log('Impacted maps:', Array.from(impactedMapSlugs).join(', ') || '(none)');

  if (!dryRun && apply && touchedLogIds.size > 0 && !skipRevalidate) {
    console.log('\nRevalidating achievements/XP for impacted user+map pairs...');
    let i = 0;
    for (const [userId, mapSlugSet] of impactedPairs.entries()) {
      i++;
      const env = {
        ...process.env,
        BACKFILL_USER_ID: userId,
        BACKFILL_MAP_SLUGS: Array.from(mapSlugSet).join(','),
      };
      console.log(`[${i}/${impactedPairs.size}] user=${userId.slice(0, 10)}... maps=${mapSlugSet.size}`);
      execSync('pnpm db:reunlock-achievements', { stdio: 'inherit', cwd: root, env });
      execSync('pnpm db:recompute-verified-xp', { stdio: 'inherit', cwd: root, env });
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
