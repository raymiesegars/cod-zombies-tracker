#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { ZWR_TO_CZT_USERS } from '../import-skrine-csv/zwr-to-czt-users';

const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIRS = [
  path.join(ROOT, 'top-178-csv'),
  path.join(ROOT, 'saved player csv'),
];

type Args = {
  dryRun: boolean;
  includeMapped: boolean;
  revalidateEnd: boolean;
  revalidatePerUser: boolean;
  onlyPlayer: string | null;
  limit: number | null;
  stopOnError: boolean;
};

type Candidate = {
  player: string;
  csvPath: string;
  sourceDir: string;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let dryRun = false;
  let includeMapped = false;
  let revalidateEnd = false;
  let revalidatePerUser = true;
  let onlyPlayer: string | null = null;
  let limit: number | null = null;
  let stopOnError = false;

  for (const a of args) {
    if (a === '--dry-run') dryRun = true;
    else if (a === '--include-mapped') includeMapped = true;
    else if (a === '--revalidate-end') revalidateEnd = true;
    else if (a === '--revalidate-per-user') revalidatePerUser = true;
    else if (a === '--no-revalidate') revalidatePerUser = false;
    else if (a === '--stop-on-error') stopOnError = true;
    else if (a.startsWith('--only-player=')) onlyPlayer = a.slice(14).trim() || null;
    else if (a.startsWith('--limit=')) {
      const n = parseInt(a.slice(8).trim(), 10);
      if (!Number.isNaN(n) && n > 0) limit = n;
    }
  }

  return { dryRun, includeMapped, revalidateEnd, revalidatePerUser, onlyPlayer, limit, stopOnError };
}

function getCsvFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.csv'))
    .map((f) => path.join(dir, f));
}

function playerFromCsvPath(csvPath: string): string {
  return path.basename(csvPath).replace(/\.csv$/i, '').trim();
}

function normalizeName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function runAndEcho(command: string, args: string[], env?: NodeJS.ProcessEnv): { status: number; output: string } {
  const res = spawnSync(command, args, {
    cwd: ROOT,
    env: env ? { ...process.env, ...env } : process.env,
    encoding: 'utf-8',
  });
  const output = `${res.stdout ?? ''}${res.stderr ?? ''}`;
  if (output.trim()) process.stdout.write(output);
  return { status: res.status ?? 1, output };
}

function parseTargetUserId(output: string): string | null {
  const m = output.match(/CZT user id:\s*([a-zA-Z0-9:_-]+)/);
  return m?.[1] ?? null;
}

function parseImportedLike(output: string): number {
  const m = output.match(/Imported:\s*(\d+)/);
  return m ? parseInt(m[1]!, 10) : 0;
}

function parseUpdatedLike(output: string): number {
  const m = output.match(/Updated \(existing → with rampage\):\s*(\d+)/);
  return m ? parseInt(m[1]!, 10) : 0;
}

async function main() {
  const opts = parseArgs();
  const mappedInsensitive = new Map(
    Object.entries(ZWR_TO_CZT_USERS).map(([k, v]) => [normalizeName(k), v.cztUserId])
  );

  const dedup = new Map<string, Candidate>();
  let duplicateFiles = 0;
  for (const dir of SOURCE_DIRS) {
    for (const csvPath of getCsvFiles(dir)) {
      const player = playerFromCsvPath(csvPath);
      const key = normalizeName(player);
      if (dedup.has(key)) {
        duplicateFiles++;
        continue;
      }
      dedup.set(key, { player, csvPath, sourceDir: path.basename(dir) });
    }
  }

  let candidates = Array.from(dedup.values());
  candidates.sort((a, b) => a.player.localeCompare(b.player));
  if (opts.onlyPlayer) {
    const only = normalizeName(opts.onlyPlayer);
    candidates = candidates.filter((c) => normalizeName(c.player) === only);
  }
  if (opts.limit != null) candidates = candidates.slice(0, opts.limit);

  console.log(`ZWR candidates: ${candidates.length} (deduped, duplicate files skipped: ${duplicateFiles})`);
  if (!opts.includeMapped) console.log('Mode: skipping players already in zwr-to-czt mapping.');
  if (opts.revalidatePerUser) console.log('Mode: revalidate per-user during import.');
  if (opts.revalidateEnd) console.log('Mode: revalidate impacted users at end.');
  if (opts.dryRun) console.log('Mode: DRY RUN.');
  console.log('');

  let processed = 0;
  let skippedMapped = 0;
  let failed = 0;
  const impactedUserIds = new Set<string>();

  for (const c of candidates) {
    const key = normalizeName(c.player);
    const mappedUserId = mappedInsensitive.get(key) ?? null;
    if (mappedUserId && !opts.includeMapped) {
      skippedMapped++;
      continue;
    }

    processed++;
    console.log(`\n[${processed}/${candidates.length}] ${c.player} (${c.sourceDir})`);
    const cmdArgs = [
      'exec',
      'tsx',
      'scripts/import-skrine-csv/run.ts',
      `--csv=${c.csvPath}`,
      `--source-player-id=${c.player}`,
    ];
    if (!opts.revalidatePerUser) cmdArgs.push('--skip-revalidate');
    if (mappedUserId) cmdArgs.push(`--czt-user=${mappedUserId}`);
    else cmdArgs.push('--auto-user');
    if (opts.dryRun) cmdArgs.push('--dry-run');

    const res = runAndEcho('pnpm', cmdArgs);
    if (res.status !== 0) {
      failed++;
      console.error(`Failed import for ${c.player}`);
      if (opts.stopOnError) break;
      continue;
    }

    const imported = parseImportedLike(res.output);
    const updated = parseUpdatedLike(res.output);
    const targetUserId = parseTargetUserId(res.output);
    if (!opts.dryRun && targetUserId && (imported > 0 || updated > 0) && !opts.revalidatePerUser) {
      impactedUserIds.add(targetUserId);
    }
  }

  if (!opts.dryRun && opts.revalidateEnd && !opts.revalidatePerUser && impactedUserIds.size > 0) {
    console.log(`\nRevalidating ${impactedUserIds.size} impacted user(s)...`);
    for (const userId of impactedUserIds) {
      console.log(`\nRevalidating user ${userId}`);
      const revalEnv = { BACKFILL_USER_ID: userId };
      const a = runAndEcho('pnpm', ['db:reunlock-achievements'], revalEnv);
      if (a.status !== 0 && opts.stopOnError) break;
      const b = runAndEcho('pnpm', ['db:recompute-verified-xp'], revalEnv);
      if (b.status !== 0 && opts.stopOnError) break;
    }
  }

  console.log('\n--- ZWR Bulk Summary ---');
  console.log(`Candidates: ${candidates.length}`);
  console.log(`Processed: ${processed}`);
  console.log(`Skipped mapped: ${skippedMapped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Impacted users: ${impactedUserIds.size}`);
  if (!opts.revalidatePerUser && !opts.revalidateEnd) {
    console.log('Revalidation: skipped (use --revalidate-per-user or --revalidate-end).');
  }

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
