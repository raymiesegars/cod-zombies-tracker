#!/usr/bin/env npx tsx
/**
 * Wipe challenge logs for a user by matching rows from an exported CSV.
 * CSV must have: map_slug, challenge_type, completion_time_seconds, round_reached, completed_at
 * (e.g. export from the SQL we use to compare SRC imports).
 * After each delete, revokes achievements and recomputes verified XP for affected maps.
 *
 * Usage:
 *   pnpm db:wipe-logs-from-csv -- --csv="/path/to/Production App Data Wipe Script.csv" --user=cmlzic2am0000jax7hqhmsck8 [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
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
import { revokeAchievementsForMapAfterDelete } from '../src/lib/achievements';
import { revokeVerifiedAchievementsForMapIfNeeded } from '../src/lib/verified-xp';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

interface CsvRow {
  map_slug: string;
  challenge_type: string;
  completion_time_seconds: string | null;
  round_reached: string;
  completed_at: string;
}

function parseCsvLine(line: string): string[] {
  const row: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === '"') inQuotes = !inQuotes;
    else if ((c === ',' && !inQuotes) || c === undefined) {
      row.push(cur.replace(/^"|"$/g, '').trim());
      cur = '';
    } else cur += c;
  }
  row.push(cur.replace(/^"|"$/g, '').trim());
  return row;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const get = (row: string[], key: string) => {
    const i = headers.indexOf(key.toLowerCase());
    return i >= 0 ? (row[i] ?? '').trim() : '';
  };
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!);
    const completionTime = get(cells, 'completion_time_seconds');
    rows.push({
      map_slug: get(cells, 'map_slug'),
      challenge_type: get(cells, 'challenge_type'),
      completion_time_seconds: completionTime === '' || completionTime === 'null' ? null : completionTime,
      round_reached: get(cells, 'round_reached'),
      completed_at: get(cells, 'completed_at'),
    });
  }
  return rows;
}

function parseCompletedAt(s: string): Date | null {
  const raw = (s || '').trim();
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseOptionalInt(s: string | null): number | null {
  if (s == null || s === '' || s === 'null') return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

async function resolveUser(userArg: string): Promise<{ id: string }> {
  const byId = await prisma.user.findUnique({ where: { id: userArg }, select: { id: true } });
  if (byId) return byId;
  const byUsername = await prisma.user.findUnique({ where: { username: userArg }, select: { id: true } });
  if (byUsername) return byUsername;
  const byDisplay = await prisma.user.findFirst({ where: { displayName: userArg }, select: { id: true } });
  if (byDisplay) return byDisplay;
  throw new Error(`User not found: ${userArg}`);
}

async function findLogToDelete(
  userId: string,
  row: CsvRow
): Promise<{ id: string; mapId: string } | null> {
  const map = await prisma.map.findUnique({ where: { slug: row.map_slug }, select: { id: true } });
  if (!map) return null;
  const challenge = await prisma.challenge.findFirst({
    where: { mapId: map.id, type: row.challenge_type as never },
    select: { id: true },
  });
  if (!challenge) return null;
  const roundReached = parseOptionalInt(row.round_reached) ?? 0;
  const completionTimeSeconds = row.completion_time_seconds != null ? parseOptionalInt(row.completion_time_seconds) : null;
  const completedAt = parseCompletedAt(row.completed_at);
  const logs = await prisma.challengeLog.findMany({
    where: {
      userId,
      mapId: map.id,
      challengeId: challenge.id,
      roundReached,
      ...(completionTimeSeconds != null ? { completionTimeSeconds } : { completionTimeSeconds: null }),
    },
    select: { id: true, mapId: true, completedAt: true },
  });
  if (logs.length === 0) return null;
  if (logs.length === 1) return { id: logs[0]!.id, mapId: logs[0]!.mapId };
  if (completedAt) {
    const target = completedAt.getTime();
    const best = logs.reduce((a, b) =>
      Math.abs((a.completedAt?.getTime() ?? 0) - target) <= Math.abs((b.completedAt?.getTime() ?? 0) - target) ? a : b
    );
    return { id: best.id, mapId: best.mapId };
  }
  return { id: logs[0]!.id, mapId: logs[0]!.mapId };
}

function parseArgs(): { csvPath: string; user: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  let csvPath = '';
  let user = '';
  let dryRun = false;
  for (const a of args) {
    if (a.startsWith('--csv=')) csvPath = a.slice(6).trim().replace(/^=+/, '');
    else if (a.startsWith('--user=')) user = a.slice(7).trim().replace(/^=+/, '');
    else if (a === '--dry-run') dryRun = true;
  }
  if (!csvPath || !user) {
    console.error('Usage: pnpm db:wipe-logs-from-csv -- --csv=<path> --user=<userId|username> [--dry-run]');
    process.exit(1);
  }
  return { csvPath, user, dryRun };
}

async function main() {
  const { csvPath, user, dryRun } = parseArgs();
  const csvAbs = path.isAbsolute(csvPath) ? csvPath : path.resolve(process.cwd(), csvPath);
  if (!fs.existsSync(csvAbs)) {
    console.error('CSV not found:', csvAbs);
    process.exit(1);
  }

  const userRecord = await resolveUser(user);
  const userId = userRecord.id;
  console.log('User id:', userId);

  const content = fs.readFileSync(csvAbs, 'utf-8');
  const rows = parseCsv(content);
  console.log('CSV rows:', rows.length);

  const affectedMapIds = new Set<string>();
  let deleted = 0;
  let notFound = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const match = await findLogToDelete(userId, row);
    if (!match) {
      notFound++;
      console.log(`[${i + 2}] No log: ${row.map_slug} ${row.challenge_type} round=${row.round_reached} time=${row.completion_time_seconds ?? 'null'} ${row.completed_at}`);
      continue;
    }
    if (dryRun) {
      console.log(`[DRY RUN] Would delete ${row.map_slug} ${row.challenge_type} (log id ${match.id})`);
      affectedMapIds.add(match.mapId);
      deleted++;
      continue;
    }
    await prisma.challengeLog.delete({ where: { id: match.id } });
    affectedMapIds.add(match.mapId);
    deleted++;
  }

  console.log('\n--- Summary ---');
  console.log('Deleted (or would delete):', deleted);
  console.log('Not found:', notFound);

  if (deleted > 0 && !dryRun) {
    console.log('\n--- Revoking achievements & recomputing verified XP per affected map ---');
    for (const mapId of affectedMapIds) {
      const { xpSubtracted } = await revokeAchievementsForMapAfterDelete(userId, mapId);
      await revokeVerifiedAchievementsForMapIfNeeded(userId, mapId);
      if (xpSubtracted > 0) console.log(`  mapId ${mapId}: xp subtracted ${xpSubtracted}`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
