/**
 * Apply Achievement.isActive from a CSV exported from the backup.
 * ONLY updates achievements that exist in the live DB and appear in the CSV.
 * All other data is untouched.
 *
 * CSV format (header required):
 *   id,isActive
 *   <cuid>,true
 *   <cuid>,false
 *
 * Usage:
 *   pnpm exec tsx scripts/apply-achievement-activation-csv.ts "/path/to/Supabase Snippet Status List.csv" --dry-run
 *   pnpm exec tsx scripts/apply-achievement-activation-csv.ts "/path/to/Supabase Snippet Status List.csv"
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

import prisma from '../src/lib/prisma';

const DRY_RUN = process.argv.includes('--dry-run');

function parseCsv(filePath: string): { id: string; isActive: boolean }[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  const rows: { id: string; isActive: boolean }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (i === 0 && line.toLowerCase().startsWith('id,')) continue;
    const [id, isActiveStr] = line.split(',');
    if (!id?.trim()) continue;
    const isActive = isActiveStr?.toLowerCase().trim() === 'true';
    rows.push({ id: id.trim(), isActive });
  }
  return rows;
}

async function main() {
  const csvPath = process.argv.find((a) => !a.startsWith('--') && a.endsWith('.csv'));
  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error('Usage: tsx scripts/apply-achievement-activation-csv.ts "/path/to/file.csv" [--dry-run]');
    process.exit(1);
  }

  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL or DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  const rows = parseCsv(csvPath);
  console.log(`Loaded ${rows.length} rows from CSV.`);

  const csvById = new Map(rows.map((r) => [r.id, r.isActive]));

  const toUpdate = await prisma.achievement.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    select: { id: true, isActive: true },
  });

  const changes: { id: string; from: boolean; to: boolean }[] = [];
  for (const a of toUpdate) {
    const want = csvById.get(a.id);
    if (want !== undefined && want !== a.isActive) {
      changes.push({ id: a.id, from: a.isActive, to: want });
    }
  }

  const toActivate = changes.filter((c) => !c.from && c.to).length;
  const toDeactivate = changes.filter((c) => c.from && !c.to).length;
  console.log(`Matched ${toUpdate.length} achievements in DB. ${changes.length} need update: ${toActivate} → active, ${toDeactivate} → inactive.`);

  if (changes.length > 0 && !DRY_RUN) {
    for (const { id, to } of changes) {
      await prisma.achievement.update({
        where: { id },
        data: { isActive: to },
      });
    }
    console.log(`Updated ${changes.length} achievements.`);
  } else if (changes.length === 0) {
    console.log('No changes needed – DB already matches CSV.');
  }

  if (rows.length > toUpdate.length) {
    console.log(`Note: ${rows.length - toUpdate.length} CSV ids were not found in the live DB (e.g. from another project).`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
