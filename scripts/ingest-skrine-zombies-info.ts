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

function extractChunks(rows: string[][], sheetName?: string): Chunk[] {
  const chunks: Chunk[] = [];
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
      const tableRows: string[] = [];
      let r = i;
      while (r < rows.length) {
        const tr = rows[r];
        const line = tr.filter((c) => c.length > 0).join(' | ');
        if (line) tableRows.push(line);
        r++;
        if (r < rows.length && rows[r]?.filter((c) => c.length > 0).length === 0) break;
      }
      if (tableRows.length >= 2) {
        const content = tableRows.join('\n');
        const tableTitle = row.filter((c) => c.length > 0)[0] ?? 'Table';
        chunks.push({
          externalId: `${sheetName ? slugify(sheetName) + '-' : ''}table-${slugify(tableTitle)}-${i}`,
          title: `${sheetName ? sheetName + ' – ' : ''}${tableTitle}`,
          content: content.length > MAX_CHUNK_CHARS ? content.slice(0, MAX_CHUNK_CHARS) + '\n...[truncated]' : content,
          sheetName,
        });
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

  return chunks;
}

function processCsvFile(path: string): Chunk[] {
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

  if (csvPaths.length > 0) {
    for (const csvPath of csvPaths) {
      const abs = resolve(csvPath.startsWith('/') ? '' : process.cwd(), csvPath);
      if (!existsSync(abs)) {
        console.error('File not found:', abs);
        continue;
      }
      const chunks = processCsvFile(abs);
      allChunks.push(...chunks);
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
      const chunks = processCsvFile(join(abs, f));
      allChunks.push(...chunks);
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
    process.exit(0);
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
