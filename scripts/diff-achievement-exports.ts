/**
 * Compare two achievement CSV exports (backup vs production) from sql-export-achievements-for-diff.sql.
 * Reports: missing in prod, extra in prod, same id but different criteria (or bo3_gum, slug, name).
 *
 * Usage:
 *   pnpm exec tsx scripts/diff-achievement-exports.ts backup.csv production.csv
 *   pnpm exec tsx scripts/diff-achievement-exports.ts backup.csv production.csv --bo3   # BO3 only
 */

import * as fs from 'fs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const bo3Only = process.argv.includes('--bo3');
const backupPath = args[0];
const prodPath = args[1];

if (!backupPath || !prodPath || !fs.existsSync(backupPath) || !fs.existsSync(prodPath)) {
  console.error('Usage: tsx scripts/diff-achievement-exports.ts <backup.csv> <production.csv> [--bo3]');
  process.exit(1);
}

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

function parseCsv(path: string): Record<string, string>[] {
  const raw = fs.readFileSync(path, 'utf-8');
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

function normalizeCriteria(c: string): string {
  if (!c) return '';
  try {
    const o = JSON.parse(c);
    const keys = Object.keys(o).sort();
    return JSON.stringify(keys.map((k) => ({ k, v: o[k] })));
  } catch {
    return c;
  }
}

const backup = parseCsv(backupPath);
const prod = parseCsv(prodPath);

const backupById = new Map(backup.map((r) => [r.id, r]));
const prodById = new Map(prod.map((r) => [r.id, r]));

const filterBo3 = (r: Record<string, string>) => !bo3Only || r.game === 'BO3';

const inBackupNotProd = backup.filter((r) => filterBo3(r) && !prodById.has(r.id));
const inProdNotBackup = prod.filter((r) => filterBo3(r) && !backupById.has(r.id));

const idsInBoth = backup.filter((r) => prodById.has(r.id) && filterBo3(r));
const criteriaDiff: { id: string; slug: string; name: string; field: string; backup: string; prod: string }[] = [];
const criteriaFullDiff: { id: string; slug: string; backup: string; prod: string }[] = [];

for (const b of idsInBoth) {
  const p = prodById.get(b.id)!;
  if (normalizeCriteria(b.criteria ?? '') !== normalizeCriteria(p.criteria ?? '')) {
    criteriaFullDiff.push({
      id: b.id,
      slug: b.slug ?? '',
      backup: (b.criteria ?? '').slice(0, 120),
      prod: (p.criteria ?? '').slice(0, 120),
    });
  }
  const fields = [
    'first_room_variant', 'bo3_gum', 'bo4_elixir', 'bocw_support', 'bo6_gum', 'bo6_support',
    'bo7_gum', 'bo7_support', 'use_fortune_cards', 'use_directors_cut', 'rampage_inducer_used', 'vanguard_void_used',
    'challenge_type', 'slug', 'name', 'difficulty',
  ] as const;
  for (const f of fields) {
    const bv = (b[f] ?? '').trim();
    const pv = (p[f] ?? '').trim();
    if (bv !== pv) {
      criteriaDiff.push({
        id: b.id,
        slug: b.slug ?? '',
        name: b.name ?? '',
        field: f,
        backup: bv || '(empty)',
        prod: pv || '(empty)',
      });
    }
  }
}

console.log('=== Summary ===');
console.log(`Backup rows: ${backup.length}${bo3Only ? ' (BO3 filtered)' : ''}`);
console.log(`Production rows: ${prod.length}${bo3Only ? ' (BO3 filtered)' : ''}`);
console.log(`In backup but not production: ${inBackupNotProd.length}`);
console.log(`In production but not backup: ${inProdNotBackup.length}`);
console.log(`Same id, criteria JSON different: ${criteriaFullDiff.length}`);
console.log(`Same id, extracted field different (bo3_gum, slug, name, etc.): ${criteriaDiff.length}`);

if (inBackupNotProd.length > 0) {
  console.log('\n--- In backup, missing in production (first 30) ---');
  inBackupNotProd.slice(0, 30).forEach((r) => {
    console.log(`  ${r.id} | ${r.game}/${r.map_slug} | ${r.slug} | bo3_gum=${r.bo3_gum ?? ''}`);
  });
  if (inBackupNotProd.length > 30) console.log(`  ... and ${inBackupNotProd.length - 30} more`);
}

if (inProdNotBackup.length > 0) {
  console.log('\n--- In production, not in backup (first 30) ---');
  inProdNotBackup.slice(0, 30).forEach((r) => {
    console.log(`  ${r.id} | ${r.game}/${r.map_slug} | ${r.slug} | bo3_gum=${r.bo3_gum ?? ''}`);
  });
  if (inProdNotBackup.length > 30) console.log(`  ... and ${inProdNotBackup.length - 30} more`);
}

if (criteriaDiff.length > 0) {
  console.log('\n--- Same id, different field (bo3_gum / slug / name / etc.) - likely tagging issue ---');
  criteriaDiff.slice(0, 50).forEach((d) => {
    console.log(`  ${d.slug} (${d.id})`);
    console.log(`    ${d.field}: backup="${d.backup}" vs prod="${d.prod}"`);
  });
  if (criteriaDiff.length > 50) console.log(`  ... and ${criteriaDiff.length - 50} more`);
}

if (criteriaFullDiff.length > 0 && criteriaFullDiff.length <= 100) {
  console.log('\n--- Same id, criteria JSON different (first 20) ---');
  criteriaFullDiff.slice(0, 20).forEach((d) => {
    console.log(`  ${d.slug}`);
    console.log(`    backup: ${d.backup}`);
    console.log(`    prod:   ${d.prod}`);
  });
}
