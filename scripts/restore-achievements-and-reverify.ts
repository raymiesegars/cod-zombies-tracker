/**
 * One-shot restore: get all the right achievements active, re-unlock from logs, recalc verified XP.
 *
 * 1. Sync achievements (with --prune) – creates/updates from seed and deactivates achievements
 *    no longer in seed so you get a clean 4 base + 4 restricted per speedrun type (no duplicates).
 * 2. Apply backup modifier CSV – optional; for achievements that exist in both backup and production,
 *    set criteria, name, isActive, difficulty from backup so modifier tagging matches.
 * 3. Reverify unlocks and XP – remove invalid unlocks, add missing from logs, clear verifiedAt
 *    and re-grant only for achievements satisfied by verified runs, then recalc all user XP.
 *
 * Prune only deactivates rows not in the current seed; it does not delete. Backup CSV optional.
 *
 * Usage:
 *   pnpm exec tsx scripts/restore-achievements-and-reverify.ts "/path/to/backup-modifier-export.csv" --dry-run
 *   pnpm exec tsx scripts/restore-achievements-and-reverify.ts "/path/to/backup-modifier-export.csv"
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

const DRY_RUN = process.argv.includes('--dry-run');
const backupCsvPath = process.argv.find((a) => !a.startsWith('--') && a.endsWith('.csv'));

function parseLine(line: string): string[] {
  const values: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      values.push(cur.replace(/^"|"$/g, ''));
      cur = '';
    } else {
      cur += c;
    }
  }
  values.push(cur.replace(/^"|"$/g, ''));
  return values;
}

function parseBackupCsv(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const header = parseLine(lines[0]!).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]!);
    const row: Record<string, string> = {};
    header.forEach((h, idx) => {
      row[h] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

async function runSync() {
  console.log('\n========== Step 1: Sync achievements (create/update from seed, prune obsolete) ==========\n');
  const args = ['exec', 'tsx', 'scripts/sync-achievements.ts', '--prune'];
  if (DRY_RUN) args.push('--dry-run');
  execSync(`pnpm ${args.join(' ')}`, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env },
  });
}

async function applyBackupCsv() {
  if (!backupCsvPath || !fs.existsSync(backupCsvPath)) {
    console.warn('No backup CSV path provided or file missing. Skipping step 2 (apply backup modifier CSV).');
    return;
  }
  console.log('\n========== Step 2: Apply backup modifier CSV (criteria, name, isActive, difficulty) ==========\n');

  const prisma = (await import('../src/lib/prisma')).default;
  const rows = parseBackupCsv(backupCsvPath);
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    let existing: { id: string; criteria: unknown; name: string; isActive: boolean; difficulty: string | null } | null = null;

    if (row.map_slug && row.slug) {
      const difficulty =
        row.difficulty && row.difficulty !== 'null' && row.difficulty !== ''
          ? (row.difficulty as 'NORMAL' | 'HARDCORE' | 'REALISTIC')
          : null;
      const map = await prisma.map.findUnique({
        where: { slug: row.map_slug },
        select: { id: true },
      });
      if (map) {
        existing = await prisma.achievement.findFirst({
          where: { mapId: map.id, slug: row.slug, difficulty },
          select: { id: true, criteria: true, name: true, isActive: true, difficulty: true },
        });
      }
    }
    if (!existing && row.id) {
      existing = await prisma.achievement.findUnique({
        where: { id: row.id },
        select: { id: true, criteria: true, name: true, isActive: true, difficulty: true },
      });
    }

    if (!existing) {
      skipped++;
      continue;
    }

    let criteria: object | null = null;
    if (row.criteria) {
      try {
        criteria = JSON.parse(row.criteria) as object;
      } catch {
        continue;
      }
    }
    const isActive = row.isActive?.toLowerCase() === 'true';
    const difficulty = row.difficulty && row.difficulty !== 'null' && row.difficulty !== '' ? row.difficulty : null;
    const name = row.name ?? existing.name;

    const same =
      JSON.stringify(existing.criteria) === JSON.stringify(criteria ?? existing.criteria) &&
      existing.name === name &&
      existing.isActive === isActive &&
      (existing.difficulty ?? null) === difficulty;
    if (same) continue;

    if (!DRY_RUN) {
      await prisma.achievement.update({
        where: { id: existing.id },
        data: {
          ...(criteria != null && { criteria }),
          name,
          isActive,
          ...(difficulty != null ? { difficulty: difficulty as 'NORMAL' | 'HARDCORE' | 'REALISTIC' } : { difficulty: null }),
        },
      });
    }
    updated++;
  }
  console.log(`   ${DRY_RUN ? 'Would update' : 'Updated'} ${updated} achievements from backup CSV${skipped > 0 ? ` (${skipped} rows had no match in production)` : ''}.`);
  if (updated === 0 && rows.length > 0) {
    console.log('   (Backup CSV slugs/tiers may differ from production after sync; step 1 seed is the source of criteria/names.)');
  }
  await prisma.$disconnect();
}

async function runReverify() {
  console.log('\n========== Step 3: Reverify unlocks and XP (from logs, verified-only XP) ==========\n');
  const args = ['exec', 'tsx', 'scripts/reverify-unlocks-and-xp.ts'];
  if (DRY_RUN) args.push('--dry-run');
  try {
    execSync(`pnpm ${args.join(' ')}`, {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (err: unknown) {
    const execErr = err as { signal?: string; status?: number };
    if (execErr?.signal === 'SIGINT') {
      console.log('\nReverify stopped (SIGINT). Re-run only: pnpm db:reverify-unlocks-and-xp');
      process.exit(0);
    }
    throw err;
  }
}

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL or DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***');
  }
  if (backupCsvPath) {
    console.log(`Backup modifier CSV: ${backupCsvPath}`);
  } else {
    console.log('No backup CSV provided – step 2 will be skipped.');
  }

  await runSync();
  await applyBackupCsv();
  await runReverify();

  console.log('\n========== Done ==========\n');
  if (DRY_RUN) {
    console.log('Dry run complete. Run without --dry-run to apply.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
