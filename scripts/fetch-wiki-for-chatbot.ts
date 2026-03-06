/**
 * Fetches zombies-related content from Call of Duty Fandom wiki and ZWR wiki,
 * stores it in ChatbotWikiImport for use in LeKronorium context.
 *
 * Run after migration: pnpm db:fetch-wiki-for-chatbot
 * Run CoD only: pnpm db:fetch-wiki-for-chatbot --cod
 * Run ZWR only: pnpm db:fetch-wiki-for-chatbot --zwr
 * Verbose: pnpm db:fetch-wiki-for-chatbot --zwr --verbose
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

for (const f of ['.env', '.env.local']) {
  const p = resolve(process.cwd(), f);
  if (existsSync(p)) {
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}

import { fetchAndStoreCodFandom, fetchAndStoreZwrWiki } from '../src/lib/chatbot/wiki-fetcher';

function logDbHost() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (url) {
    try {
      const u = new URL(url.replace(/^postgresql:/, 'postgres:'));
      console.log('Database:', u.hostname);
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  logDbHost();

  const codOnly = process.argv.includes('--cod');
  const zwrOnly = process.argv.includes('--zwr');
  const verbose = process.argv.includes('--verbose');

  if (!zwrOnly) {
    console.log('Fetching Call of Duty Fandom wiki (zombies maps & content)...');
    const cod = await fetchAndStoreCodFandom();
    console.log(`CoD Fandom: fetched ${cod.fetched}, errors ${cod.errors}`);
  }

  if (!codOnly) {
    console.log('Fetching ZWR wiki (The Rift)...');
    const zwr = await fetchAndStoreZwrWiki(verbose);
    console.log(`ZWR: fetched ${zwr.fetched}, errors ${zwr.errors}`);
  }

  console.log('Done. LeKronorium context will include this content (cache clears in ~90s or on restart).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
