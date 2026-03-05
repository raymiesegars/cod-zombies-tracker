/**
 * Fetches zombies-related content from Call of Duty Fandom wiki and ZWR wiki,
 * stores it in ChatbotWikiImport for use in LeKronorium context.
 *
 * Run after migration: pnpm db:fetch-wiki-for-chatbot
 * Run CoD only: pnpm db:fetch-wiki-for-chatbot --cod
 * Run ZWR only: pnpm db:fetch-wiki-for-chatbot --zwr
 */

import { fetchAndStoreCodFandom, fetchAndStoreZwrWiki } from '../src/lib/chatbot/wiki-fetcher';

async function main() {
  const codOnly = process.argv.includes('--cod');
  const zwrOnly = process.argv.includes('--zwr');

  if (!zwrOnly) {
    console.log('Fetching Call of Duty Fandom wiki (zombies maps & content)...');
    const cod = await fetchAndStoreCodFandom();
    console.log(`CoD Fandom: fetched ${cod.fetched}, errors ${cod.errors}`);
  }

  if (!codOnly) {
    console.log('Fetching ZWR wiki (The Rift)...');
    const zwr = await fetchAndStoreZwrWiki();
    console.log(`ZWR: fetched ${zwr.fetched}, errors ${zwr.errors}`);
  }

  console.log('Done. LeKronorium context will include this content (cache clears in ~90s or on restart).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
