#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { parseCsv, CSV_HEADERS } from '../import-skrine-csv/run';
import { ZWR_TO_CZT_USERS } from '../import-skrine-csv/zwr-to-czt-users';

const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIRS = [
  path.join(ROOT, 'top-178-csv'),
  path.join(ROOT, 'saved player csv'),
];

type Args = {
  dryRun: boolean;
  stopOnError: boolean;
  limit: number | null;
  onlyPlayer: string | null;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let dryRun = false;
  let stopOnError = false;
  let limit: number | null = null;
  let onlyPlayer: string | null = null;
  for (const a of args) {
    if (a === '--dry-run') dryRun = true;
    else if (a === '--stop-on-error') stopOnError = true;
    else if (a.startsWith('--limit=')) {
      const n = parseInt(a.slice(8).trim(), 10);
      if (!Number.isNaN(n) && n > 0) limit = n;
    } else if (a.startsWith('--only-player=')) {
      onlyPlayer = a.slice(14).trim() || null;
    }
  }
  return { dryRun, stopOnError, limit, onlyPlayer };
}

function normalizeName(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, ' ');
}

function csvToLines(rows: Array<Record<string, string>>): string {
  const esc = (v: string) => {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = [CSV_HEADERS.join(',')];
  for (const row of rows) {
    lines.push(CSV_HEADERS.map((h) => esc(String(row[h] ?? ''))).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function shouldKeepRow(row: Record<string, string>): boolean {
  const game = String(row.game ?? '').trim().toLowerCase();
  const record = String(row.record ?? '').trim().toLowerCase();
  return game === 'waw' || record === 'no-aat' || record === 'build-speedrun' || record === 'build-ee-speedrun';
}

function runAndEcho(args: string[], env?: NodeJS.ProcessEnv): { status: number; output: string } {
  const res = spawnSync('pnpm', args, {
    cwd: ROOT,
    env: env ? { ...process.env, ...env } : process.env,
    encoding: 'utf-8',
  });
  const output = `${res.stdout ?? ''}${res.stderr ?? ''}`;
  if (output.trim()) process.stdout.write(output);
  return { status: res.status ?? 1, output };
}

function parseCount(output: string, key: string): number {
  const re = new RegExp(`${key}:\\s*(\\d+)`);
  const m = output.match(re);
  return m ? parseInt(m[1]!, 10) : 0;
}

function findCsvForPlayer(player: string): string | null {
  const target = normalizeName(player);
  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.csv'));
    for (const file of files) {
      const name = file.replace(/\.csv$/i, '');
      if (normalizeName(name) === target) return path.join(dir, file);
    }
  }
  return null;
}

async function main() {
  const args = parseArgs();
  const mapped = Object.entries(ZWR_TO_CZT_USERS).map(([sourcePlayer, entry]) => ({
    sourcePlayer,
    cztUserId: entry.cztUserId,
  }));
  const onlyNorm = args.onlyPlayer ? normalizeName(args.onlyPlayer) : null;
  const queue = mapped
    .filter((m) => (onlyNorm ? normalizeName(m.sourcePlayer) === onlyNorm : true))
    .slice(0, args.limit ?? mapped.length);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zwr-affected-remediate-'));
  const impactedUserIds = new Set<string>();
  let processed = 0;
  let noCsv = 0;
  let noAffectedRows = 0;
  let failed = 0;

  try {
    console.log(`Mapped users considered: ${queue.length}`);
    console.log(`Mode: ${args.dryRun ? 'DRY RUN' : 'LIVE'}\n`);

    for (const item of queue) {
      processed++;
      const csvPath = findCsvForPlayer(item.sourcePlayer);
      if (!csvPath) {
        noCsv++;
        continue;
      }
      const raw = fs.readFileSync(csvPath, 'utf-8');
      const rows = parseCsv(raw);
      const filtered = rows.filter((r) => shouldKeepRow(r as unknown as Record<string, string>));
      if (filtered.length === 0) {
        noAffectedRows++;
        continue;
      }

      const tempCsvPath = path.join(tmpDir, `${item.sourcePlayer.replace(/[^a-zA-Z0-9._-]/g, '_')}.csv`);
      fs.writeFileSync(tempCsvPath, csvToLines(filtered as unknown as Array<Record<string, string>>), 'utf-8');

      console.log(`\n[${processed}/${queue.length}] ${item.sourcePlayer} -> ${filtered.length} affected row(s)`);
      const runArgs = [
        'exec',
        'tsx',
        'scripts/import-skrine-csv/run.ts',
        `--csv=${tempCsvPath}`,
        `--source-player-id=${item.sourcePlayer}`,
        `--czt-user=${item.cztUserId}`,
        '--skip-revalidate',
      ];
      if (args.dryRun) runArgs.push('--dry-run');
      const res = runAndEcho(runArgs);
      if (res.status !== 0) {
        failed++;
        if (args.stopOnError) break;
        continue;
      }
      const imported = parseCount(res.output, 'Imported');
      const updated = parseCount(res.output, 'Updated \\(existing → with rampage\\)');
      if (!args.dryRun && (imported > 0 || updated > 0)) impactedUserIds.add(item.cztUserId);
    }

    if (!args.dryRun && impactedUserIds.size > 0) {
      console.log(`\nRevalidating ${impactedUserIds.size} impacted user(s)...`);
      for (const userId of impactedUserIds) {
        console.log(`\nRevalidating user ${userId}`);
        const env = { BACKFILL_USER_ID: userId };
        const a = runAndEcho(['db:reunlock-achievements'], env);
        if (a.status !== 0 && args.stopOnError) break;
        const b = runAndEcho(['db:recompute-verified-xp'], env);
        if (b.status !== 0 && args.stopOnError) break;
      }
    }

    console.log('\n--- Affected ZWR Remediation Summary ---');
    console.log(`Processed: ${processed}`);
    console.log(`Missing CSV for mapped player: ${noCsv}`);
    console.log(`Mapped players with no affected rows: ${noAffectedRows}`);
    console.log(`Impacted users revalidated: ${impactedUserIds.size}`);
    console.log(`Failures: ${failed}`);
    if (failed > 0) process.exit(1);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup failures
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
