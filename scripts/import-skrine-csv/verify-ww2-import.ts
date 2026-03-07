#!/usr/bin/env npx tsx
/**
 * Verify WW2 import mapping: lists DB maps, then checks each CSV row.
 * Run against .env.local (dev) or .env.production to verify your target DB.
 *
 * Usage: npx tsx scripts/import-skrine-csv/verify-ww2-import.ts [--csv=path/to/file.csv]
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '../..');
for (const file of ['.env', '.env.local', '.env.production']) {
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
import { parseCsv } from './run';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

async function resolveMap(gameCode: string, mapSlug: string): Promise<{ id: string; slug: string } | null> {
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
    select: { id: true, slug: true },
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

async function main() {
  const csvPath = process.argv.find((a) => a.startsWith('--csv='))?.slice(6)?.trim()
    || path.join(root, 'top-178-csv/DaQuickHayden.csv');

  console.log('=== WW2 Import Verification ===\n');
  console.log('DB:', (process.env.DIRECT_URL || process.env.DATABASE_URL)?.replace(/:[^:@]+@/, ':****@') || 'not set');
  console.log('CSV:', csvPath);
  console.log('');

  const ww2Maps = await prisma.map.findMany({
    where: { game: { shortName: 'WW2' } },
    select: { id: true, slug: true, name: true },
    orderBy: { order: 'asc' },
  });
  console.log('--- WW2 maps in database ---');
  for (const m of ww2Maps) {
    console.log(`  ${m.slug} (${m.name})`);
  }
  const hasGroesten = ww2Maps.some((m) => m.slug === 'groesten-haus');
  console.log(hasGroesten ? '\n  ✓ groesten-haus exists' : '\n  ✗ groesten-haus MISSING');
  console.log('');

  if (!fs.existsSync(csvPath)) {
    console.log('CSV not found. Exiting.');
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(content).filter((r) => r.game.toLowerCase() === 'wwii');
  console.log(`--- Checking ${rows.length} WW2 rows from CSV ---\n`);

  for (const row of rows) {
    const mapSlug = row.map.toLowerCase().trim();
    const mapRecord = await resolveMap(row.game.toLowerCase(), mapSlug);
    const mapping = getRecordMapping(row.record, row.sub_record);
    const challenge = mapRecord ? await resolveChallenge(mapRecord.id, mapping?.challengeType ?? '') : null;

    const status =
      !mapRecord ? 'MAP NOT FOUND'
      : !mapping ? 'RECORD NOT MAPPED'
      : !challenge ? 'CHALLENGE NOT FOUND'
      : 'OK';

    const resolvedSlug = mapRecord?.slug ?? '—';
    console.log(`Row ${row._rowIndex} [${row.map}] ${row.record}${row.sub_record ? `/${row.sub_record}` : ''}`);
    console.log(`  → slug: ${mapSlug} → ${resolvedSlug} | mapping: ${mapping?.challengeType ?? '—'} | ${status}`);
    if (status !== 'OK') console.log(`  ✗ Would be SKIPPED`);
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
