/**
 * Ingest Skrine's "Zombies Info" spreadsheet into ChatbotWikiImport for LeKronorium.
 *
 * Google Sheets exports only the current sheet as CSV. To get all sheets:
 * - Option A: Export each sheet as CSV (File > Download > CSV for each sheet)
 * - Option B: Put all CSV files in a directory and pass the dir path
 *
 * Chunking: Sections are split by headers (>>>>NAME<<<<), tables, and logical blocks.
 * Each chunk becomes one ChatbotWikiImport row with source='skrine'.
 *
 * Usage:
 *   pnpm db:ingest-skrine-zombies-info --csv=path/to/file.csv
 *   pnpm db:ingest-skrine-zombies-info --dir=path/to/csv-folder
 *   pnpm db:ingest-skrine-zombies-info --csv=... --dry-run  # preview only, no DB writes
 *   pnpm db:ingest-skrine-zombies-info --csv=... --output-dir=./chunks  # write organized files instead of DB
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, basename, join } from 'path';
import prisma from '../src/lib/prisma';
import OpenAI from 'openai';
import { embedSkrineChunk } from '../src/lib/chatbot/wiki-retrieval';

// Match ChatbotWikiImport content size expectations; wiki-fetcher uses 3500
const MAX_CHUNK_CHARS = 8_000;

function loadEnv() {
  for (const f of ['.env', '.env.local']) {
    const p = resolve(process.cwd(), f);
    if (existsSync(p)) {
      for (const line of readFileSync(p, 'utf-8').split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
      }
    }
  }
}

function parseCsvRow(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let cell = '';
      i++;
      while (i < line.length) {
        if (line[i] === '"') {
          i++;
          if (line[i] === '"') {
            cell += '"';
            i++;
          } else break;
        } else {
          cell += line[i];
          i++;
        }
      }
      out.push(cell.trim());
      if (line[i] === ',') i++;
    } else {
      const comma = line.indexOf(',', i);
      const end = comma === -1 ? line.length : comma;
      out.push(line.slice(i, end).trim());
      i = comma === -1 ? line.length : comma + 1;
    }
  }
  return out;
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  while (i < content.length) {
    let row = '';
    let inQuotes = false;
    while (i < content.length) {
      const c = content[i];
      if (c === '"') {
        inQuotes = !inQuotes;
        row += c;
        i++;
      } else if (inQuotes) {
        row += c;
        i++;
      } else if (c === '\n') {
        i++;
        break;
      } else {
        row += c;
        i++;
      }
    }
    if (row.trim()) rows.push(parseCsvRow(row));
  }
  return rows;
}

const SECTION_HEADER = /^>>>>([^<]+)<<<<$/;
const SHEET_NAME_FROM_FILE = /^(.+?)(?:\s*-\s*Sheet\d*)?$/i;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface Chunk {
  externalId: string;
  title: string;
  content: string;
  sheetName?: string;
}

interface ExtractResult {
  chunks: Chunk[];
  supersededExternalIds: string[];
}

function extractChunks(rows: string[][], sheetName?: string): ExtractResult {
  const chunks: Chunk[] = [];
  const supersededExternalIds: string[] = [];
  let i = 0;

  function collectTextBlock(start: number, end: number): string {
    const parts: string[] = [];
    for (let r = start; r < end && r < rows.length; r++) {
      const row = rows[r];
      const text = row.filter((c) => c.length > 0).join(' | ').trim();
      if (text) parts.push(text);
    }
    return parts.join('\n').trim();
  }

  function hasTableHeader(row: string[]): boolean {
    const filled = row.filter((c) => c.length > 0);
    if (filled.length < 2) return false;
    const first = filled[0].toLowerCase();
    if (/^(name|map|round|game|record|player|type|twitch|youtube|twitter)$/.test(first)) return true;
    if (filled.every((c) => c.length < 50 && !/\./.test(c))) return true;
    return false;
  }

  while (i < rows.length) {
    const row = rows[i];
    const firstCell = row[0]?.trim() ?? '';

    const sectionMatch = firstCell.match(SECTION_HEADER);
    if (sectionMatch) {
      const headerName = sectionMatch[1].trim();
      const blockStart = i;
      i++;
      while (i < rows.length) {
        const next = rows[i]?.[0]?.trim() ?? '';
        if (next.match(SECTION_HEADER)) break;
        i++;
      }
      let content = collectTextBlock(blockStart, i).replace(/^>>>>[^<]+<<<<\s*[|\s]*/, '');
      if (content.length > MAX_CHUNK_CHARS) {
        content = content.slice(0, MAX_CHUNK_CHARS) + '\n...[truncated]';
      }
      if (content.trim()) {
        chunks.push({
          externalId: `${sheetName ? slugify(sheetName) + '-' : ''}${slugify(headerName)}`,
          title: `${sheetName ? sheetName + ' – ' : ''}${headerName}`,
          content,
          sheetName,
        });
      }
      continue;
    }

    if (hasTableHeader(row)) {
      const rawRows: string[][] = [];
      let r = i;
      while (r < rows.length) {
        const tr = rows[r];
        if (tr.some((c) => c.length > 0)) rawRows.push([...tr]);
        r++;
        if (r < rows.length && rows[r]?.filter((c) => c.length > 0).length === 0) break;
      }
      if (rawRows.length >= 2) {
        const filled = rawRows[0].map((c) => c.trim()).filter((c) => c.length > 0);
        const roundIdx = filled.findIndex((c) => c.toLowerCase() === 'round');
        const secondRoundIdx =
          roundIdx >= 0 ? filled.slice(roundIdx + 1).findIndex((c) => c.toLowerCase() === 'round') : -1;
        const splitAt =
          secondRoundIdx >= 0 ? roundIdx + 1 + secondRoundIdx : -1;

        if (splitAt > 0 && filled.length >= splitAt + 2) {
          const toLine = (cells: string[]) =>
            cells.filter((c) => c.length > 0).join(' | ');
          const splitRow = (tr: string[]) => {
            const nonEmpty = tr
              .map((c) => c.trim())
              .map((c, idx) => ({ v: c, idx }))
              .filter((x) => x.v.length > 0);
            const left = nonEmpty.slice(0, splitAt).map((x) => x.v);
            const right = nonEmpty.slice(splitAt).map((x) => x.v);
            return { left: toLine(left), right: toLine(right) };
          };
          const leftRows = rawRows.map((tr) => splitRow(tr).left);
          const rightRows = rawRows.map((tr) => splitRow(tr).right);
          const leftContent = leftRows.join('\n');
          const rightContent = rightRows.join('\n');
          const tableTitle = filled[0] ?? 'Table';
          const baseId = `${sheetName ? slugify(sheetName) + '-' : ''}table-${slugify(tableTitle)}-${i}`;
          chunks.push({
            externalId: `${baseId}-per-round`,
            title: `${sheetName ? sheetName + ' – ' : ''}${tableTitle} – Per-round times`,
            content:
              (leftContent.length > MAX_CHUNK_CHARS
                ? leftContent.slice(0, MAX_CHUNK_CHARS) + '\n...[truncated]'
                : leftContent) +
              '\n\n(Time to complete THAT round. For "round X time" use this table.)',
            sheetName,
          });
          supersededExternalIds.push(baseId);
          chunks.push({
            externalId: `${baseId}-cumulative`,
            title: `${sheetName ? sheetName + ' – ' : ''}${tableTitle} – Cumulative total time`,
            content:
              (rightContent.length > MAX_CHUNK_CHARS
                ? rightContent.slice(0, MAX_CHUNK_CHARS) + '\n...[truncated]'
                : rightContent) +
              '\n\n(Total elapsed time to REACH that round. Use only when asked for "total time to round X" or "cumulative".)',
            sheetName,
          });
        } else {
          const tableRows = rawRows.map((tr) =>
            tr.filter((c) => c.length > 0).join(' | ')
          );
          const content = tableRows.join('\n');
          const tableTitle = row.filter((c) => c.length > 0)[0] ?? 'Table';
          chunks.push({
            externalId: `${sheetName ? slugify(sheetName) + '-' : ''}table-${slugify(tableTitle)}-${i}`,
            title: `${sheetName ? sheetName + ' – ' : ''}${tableTitle}`,
            content:
              content.length > MAX_CHUNK_CHARS
                ? content.slice(0, MAX_CHUNK_CHARS) + '\n...[truncated]'
                : content,
            sheetName,
          });
        }
        i = r;
      } else {
        i++;
      }
      continue;
    }

    const text = firstCell || row.filter((c) => c.length > 0).join(' ').trim();
    if (text && text.length > 80 && !text.match(SECTION_HEADER)) {
      const blockStart = i;
      while (i < rows.length) {
        const nextRow = rows[i];
        const nextText = nextRow?.filter((c) => c.length > 0).join(' ').trim() ?? '';
        if (!nextText) {
          i++;
          break;
        }
        if (nextText.match(SECTION_HEADER)) break;
        i++;
      }
      let content = collectTextBlock(blockStart, i);
      if (content.length > MAX_CHUNK_CHARS) {
        content = content.slice(0, MAX_CHUNK_CHARS) + '\n...[truncated]';
      }
      const preview = content.slice(0, 50).replace(/\n/g, ' ');
      chunks.push({
        externalId: `${sheetName ? slugify(sheetName) + '-' : ''}block-${i}-${slugify(preview).slice(0, 30)}`,
        title: `${sheetName ? sheetName + ' – ' : ''}${preview}${content.length > 50 ? '…' : ''}`,
        content,
        sheetName,
      });
      continue;
    }

    i++;
  }

  return { chunks, supersededExternalIds };
}

function processCsvFile(path: string): ExtractResult {
  const content = readFileSync(path, 'utf-8');
  const rows = parseCsv(content);
  const base = basename(path, '.csv');
  const sheetName = base.replace(/^Zombies Info by Skrine\s*/i, '').trim() || 'Intro';
  return extractChunks(rows, sheetName);
}

async function main() {
  loadEnv();

  const csvPaths = process.argv.filter((a) => a.startsWith('--csv=')).map((a) => a.slice(6));
  const dirPath = process.argv.find((a) => a.startsWith('--dir='))?.slice(6);
  const dryRun = process.argv.includes('--dry-run');
  const outputDir = process.argv.find((a) => a.startsWith('--output-dir='))?.slice(13);

  if (csvPaths.length === 0 && !dirPath) {
    console.error('Usage: pnpm db:ingest-skrine-zombies-info --csv=<path> [--csv=<path2> ...] [--dry-run]');
    console.error('   or: pnpm db:ingest-skrine-zombies-info --dir=<path-to-csv-folder> [--dry-run]');
    console.error('   or: pnpm db:ingest-skrine-zombies-info --csv=<path> --output-dir=./chunks');
    process.exit(1);
  }

  let allChunks: Chunk[] = [];
  const allSuperseded: string[] = [];

  if (csvPaths.length > 0) {
    for (const csvPath of csvPaths) {
      const abs = resolve(csvPath.startsWith('/') ? '' : process.cwd(), csvPath);
      if (!existsSync(abs)) {
        console.error('File not found:', abs);
        continue;
      }
      const { chunks, supersededExternalIds } = processCsvFile(abs);
      allChunks.push(...chunks);
      allSuperseded.push(...supersededExternalIds);
      console.log(`  ${csvPath}: ${chunks.length} chunks`);
    }
    console.log(`Total: ${allChunks.length} chunks from ${csvPaths.length} files`);
  } else if (dirPath) {
    const abs = resolve(process.cwd(), dirPath);
    if (!existsSync(abs)) {
      console.error('Directory not found:', abs);
      process.exit(1);
    }
    const files = readdirSync(abs).filter((f) => f.endsWith('.csv'));
    for (const f of files) {
      const { chunks, supersededExternalIds } = processCsvFile(join(abs, f));
      allChunks.push(...chunks);
      allSuperseded.push(...supersededExternalIds);
      console.log(`  ${f}: ${chunks.length} chunks`);
    }
    console.log(`Total: ${allChunks.length} chunks from ${files.length} files`);
  }

  if (allChunks.length === 0) {
    console.log('No chunks extracted. The CSV may only have empty rows or an unexpected format.');
    console.log('Tip: Google Sheets exports one sheet per CSV. Export each sheet separately if you have multiple.');
    process.exit(0);
  }

  if (outputDir) {
    const out = resolve(process.cwd(), outputDir);
    if (!existsSync(out)) mkdirSync(out, { recursive: true });
    for (const c of allChunks) {
      const safe = c.externalId.replace(/[/\\?*]/g, '_');
      writeFileSync(join(out, `${safe}.md`), `# ${c.title}\n\n${c.content}`, 'utf-8');
    }
    console.log(`Wrote ${allChunks.length} files to ${outputDir}`);
    process.exit(0);
  }

  if (dryRun) {
    console.log('\n--- Dry run: would upsert the following ---\n');
    for (const c of allChunks) {
      console.log(`[${c.externalId}] ${c.title}`);
      console.log(`  ${c.content.slice(0, 100)}...`);
      console.log('');
    }
    if (allSuperseded.length > 0) {
      console.log('Would delete superseded:', allSuperseded.join(', '));
    }
    process.exit(0);
  }

  if (allSuperseded.length > 0) {
    const del = await prisma.chatbotWikiImport.deleteMany({
      where: { source: 'skrine', externalId: { in: allSuperseded } },
    });
    if (del.count > 0) console.log(`Deleted ${del.count} superseded chunk(s)`);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const openai = apiKey ? new OpenAI({ apiKey }) : null;

  let upserted = 0;
  for (const chunk of allChunks) {
    try {
      let embedding: number[] | undefined;
      if (openai) {
        try {
          embedding = await embedSkrineChunk(chunk.title, chunk.content, openai);
        } catch {
          /* skip embedding on rate limit etc */
        }
      }

      await prisma.chatbotWikiImport.upsert({
        where: { source_externalId: { source: 'skrine', externalId: chunk.externalId } },
        create: {
          source: 'skrine',
          externalId: chunk.externalId,
          title: chunk.title,
          content: chunk.content,
          embedding: embedding ?? undefined,
        },
        update: {
          title: chunk.title,
          content: chunk.content,
          embedding: embedding ?? undefined,
          fetchedAt: new Date(),
        },
      });
      upserted++;
      console.log(`  ✓ ${chunk.title}${embedding ? ' (embedded)' : ''}`);
    } catch (e) {
      console.error(`  ✗ ${chunk.externalId}:`, e);
    }
  }

  console.log(`\nDone. Upserted ${upserted}/${allChunks.length} chunks.`);
  if (!openai) {
    console.log('Run pnpm db:backfill-skrine-embeddings to add embeddings for semantic retrieval.');
  } else {
    console.log('LeKronorium will use semantic retrieval to find relevant Skrine chunks per question.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
