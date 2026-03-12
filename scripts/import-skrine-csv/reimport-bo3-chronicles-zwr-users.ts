#!/usr/bin/env npx tsx

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { ZWR_TO_CZT_USERS } from './zwr-to-czt-users';
import { parseCsv, CSV_HEADERS } from './run';

const root = path.resolve(__dirname, '../..');
const TOP_178_DIR = path.join(root, 'top-178-csv');
const TEMP_DIR = path.join(root, 'scripts', 'import-skrine-csv', '.tmp-bo3-chronicles');
const dryRun = process.argv.includes('--dry-run');

const BO3_CHRONICLES_MAPS = new Set([
  'nacht',
  'nacht-der-untoten',
  'verruckt',
  'shi-no-numa',
  'kino',
  'kino-der-toten',
  'ascension',
  'shangri-la',
  'moon',
  'origins',
]);

function loadEnv() {
  for (const file of ['.env', '.env.local']) {
    const p = path.join(root, file);
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

function csvEscape(value: string): string {
  const v = value ?? '';
  if (v.includes(',') || v.includes('"') || v.includes('\n')) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function shellEscape(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function rowToCsvLine(row: ReturnType<typeof parseCsv>[number]): string {
  return CSV_HEADERS.map((key) => csvEscape(String((row as Record<string, unknown>)[key] ?? ''))).join(',');
}

function sourcePlayerInRow(row: ReturnType<typeof parseCsv>[number], sourcePlayerId: string): boolean {
  const players = [row.player_1, row.player_2, row.player_3, row.player_4].map((p) => (p || '').trim());
  return players.includes(sourcePlayerId);
}

function isBo3ChroniclesRow(row: ReturnType<typeof parseCsv>[number]): boolean {
  const game = row.game.toLowerCase().trim();
  const map = row.map.toLowerCase().trim();
  return game === 'bo3' && BO3_CHRONICLES_MAPS.has(map);
}

async function main() {
  loadEnv();
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL or DATABASE_URL in .env.local');
    process.exit(1);
  }

  fs.mkdirSync(TEMP_DIR, { recursive: true });

  const entries = Object.entries(ZWR_TO_CZT_USERS);
  const usersWithCsv: { sourcePlayerId: string; cztUserId: string; csvPath: string }[] = [];

  for (const [sourcePlayerId, entry] of entries) {
    let csvPath = path.join(TOP_178_DIR, `${sourcePlayerId}.csv`);
    if (!fs.existsSync(csvPath)) csvPath = path.join(TOP_178_DIR, `${entry.displayName}.csv`);
    if (fs.existsSync(csvPath)) usersWithCsv.push({ sourcePlayerId, cztUserId: entry.cztUserId, csvPath });
  }

  console.log(`\n--- BO3 Chronicles reimport for mapped ZWR users (${usersWithCsv.length}) ---`);
  if (dryRun) console.log('*** DRY RUN ***');

  let usersProcessed = 0;
  let usersWithRows = 0;
  let totalRows = 0;

  for (const { sourcePlayerId, cztUserId, csvPath } of usersWithCsv) {
    usersProcessed++;
    const content = fs.readFileSync(csvPath, 'utf-8');
    const parsed = parseCsv(content);
    const filtered = parsed.filter((r) => sourcePlayerInRow(r, sourcePlayerId) && isBo3ChroniclesRow(r));
    if (filtered.length === 0) {
      console.log(`\n[${usersProcessed}/${usersWithCsv.length}] ${sourcePlayerId}: no BO3 Chronicles rows`);
      continue;
    }

    usersWithRows++;
    totalRows += filtered.length;

    const tempCsvPath = path.join(TEMP_DIR, `${sourcePlayerId}.csv`);
    const outLines = [CSV_HEADERS.join(','), ...filtered.map((r) => rowToCsvLine(r))];
    fs.writeFileSync(tempCsvPath, `${outLines.join('\n')}\n`);

    console.log(`\n[${usersProcessed}/${usersWithCsv.length}] ${sourcePlayerId}: ${filtered.length} rows`);
    execSync(
      `pnpm exec tsx scripts/import-skrine-csv/run.ts --csv=${shellEscape(tempCsvPath)} --source-player-id=${shellEscape(sourcePlayerId)} --czt-user=${shellEscape(cztUserId)} --skip-existing${dryRun ? ' --dry-run' : ''}`,
      { stdio: 'inherit', cwd: root, env: process.env }
    );
  }

  console.log('\n--- Done ---');
  console.log(`Users scanned: ${usersProcessed}`);
  console.log(`Users with BO3 Chronicles rows: ${usersWithRows}`);
  console.log(`Total BO3 Chronicles rows processed: ${totalRows}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
