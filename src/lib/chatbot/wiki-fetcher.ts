import { chromium } from 'playwright';
import prisma from '@/lib/prisma';

const COD_FANDOM_API = 'https://callofduty.fandom.com/api.php';
const MAX_CONTENT_CHARS = 3500;
const DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function wikitextToPlainText(wikitext: string): string {
  let s = wikitext;
  s = s.replace(/\{\{[^}]*\}\}/g, ' ');
  s = s.replace(/\{\{[^}]*\|[^}]*\}\}/g, ' ');
  s = s.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2');
  s = s.replace(/\[\[([^\]]+)\]\]/g, '$1');
  s = s.replace(/'''([^']*)'''/g, '$1');
  s = s.replace(/''([^']*)''/g, '$1');
  s = s.replace(/\s*=\s*\{[^}]*\}\s*/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, '$1');
  s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

async function fetchCodFandomPageIds(categories: string[], searchTerms: string[]): Promise<Set<number>> {
  const pageIds = new Set<number>();
  for (const cat of categories) {
    try {
      let continueKey: string | undefined;
      do {
        const params = new URLSearchParams({
          action: 'query',
          list: 'categorymembers',
          cmtitle: cat,
          cmlimit: '100',
          format: 'json',
        });
        if (continueKey) params.set('cmcontinue', continueKey);
        const res = await fetch(`${COD_FANDOM_API}?${params}`, {
          headers: { 'User-Agent': 'CZT-LeKronorium/1.0 (wiki context)' },
        });
        const data = (await res.json()) as {
          query?: { categorymembers?: { pageid: number }[] };
          continue?: { cmcontinue?: string };
        };
        for (const m of data.query?.categorymembers ?? []) {
          pageIds.add(m.pageid);
        }
        continueKey = data.continue?.cmcontinue;
        if (continueKey) await delay(DELAY_MS);
      } while (continueKey);
    } catch {
      // skip missing or invalid categories
    }
  }
  for (const term of searchTerms) {
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: term,
        srnamespace: '0',
        srlimit: '50',
        sroffset: String(offset),
        format: 'json',
      });
      const res = await fetch(`${COD_FANDOM_API}?${params}`, {
        headers: { 'User-Agent': 'CZT-LeKronorium/1.0 (wiki context)' },
      });
      const data = (await res.json()) as {
        query?: { search?: { pageid: number }[] };
        continue?: { sroffset?: number };
      };
      for (const hit of data.query?.search ?? []) {
        pageIds.add(hit.pageid);
      }
      offset += 50;
      hasMore = !!data.continue?.sroffset;
      if (hasMore) await delay(DELAY_MS);
    }
  }
  return pageIds;
}

async function fetchCodFandomPageContent(pageId: number): Promise<{ title: string; content: string } | null> {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'revisions',
    pageids: String(pageId),
    rvprop: 'content',
    rvslots: 'main',
    format: 'json',
  });
  const res = await fetch(`${COD_FANDOM_API}?${params}`, {
    headers: { 'User-Agent': 'CZT-LeKronorium/1.0 (wiki context)' },
  });
  const data = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        { title?: string; revisions?: { slots?: { main?: { '*'?: string } } }[] }
      >;
    };
  };
  const page = data.query?.pages?.[String(pageId)];
  if (!page?.title || !page.revisions?.[0]?.slots?.main?.['*']) return null;
  const raw = page.revisions[0].slots.main['*'];
  const plain = wikitextToPlainText(raw);
  const content = plain.length > MAX_CONTENT_CHARS ? plain.slice(0, MAX_CONTENT_CHARS) + '…' : plain;
  return { title: page.title, content };
}

export async function fetchAndStoreCodFandom(): Promise<{ fetched: number; errors: number }> {
  const categories = [
    'Category:Zombies_(mode)',
    'Category:Zombies_(Treyarch)',
    'Category:Black_Ops_Zombies',
    'Category:Call_of_Duty_Black_Ops_III_Zombies_Maps',
    'Category:Call_of_Duty_Black_Ops_4_Zombies_Maps',
    'Category:Call_of_Duty_Black_Ops_Cold_War_Zombies_Maps',
    'Category:Call_of_Duty_Black_Ops_6_Zombies_Maps',
  ];
  const searchTerms = ['zombies map', 'zombies easter egg', 'main quest zombies', 'Apothicon Servant', 'Revelations zombies', 'wonder weapon zombies'];
  const pageIds = await fetchCodFandomPageIds(categories, searchTerms);
  let fetched = 0;
  let errors = 0;
  for (const pageId of Array.from(pageIds)) {
    await delay(DELAY_MS);
    try {
      const result = await fetchCodFandomPageContent(pageId);
      if (!result || !result.content.trim()) continue;
      await prisma.chatbotWikiImport.upsert({
        where: {
          source_externalId: { source: 'cod_fandom', externalId: String(pageId) },
        },
        create: {
          source: 'cod_fandom',
          externalId: String(pageId),
          title: result.title,
          url: `https://callofduty.fandom.com/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`,
          content: result.content,
        },
        update: {
          title: result.title,
          url: `https://callofduty.fandom.com/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`,
          content: result.content,
          fetchedAt: new Date(),
        },
      });
      fetched++;
    } catch {
      errors++;
    }
  }
  return { fetched, errors };
}

const ZWR_WIKI_URLS = [
  'https://zwr.gg/wiki/bo2-origins-high-round-strategy-guide-100-rounds',
  'https://zwr.gg/wiki/der-eisendrache-no-power-strategy-guide-using-mega-gobblegums',
  'https://zwr.gg/wiki/terminus-inside-boat-high-round-strategy',
  'https://zwr.gg/wiki/waterfront-5and5-high-round-strategy',
  'https://zwr.gg/wiki/beginners-guide-on-how-to-speedrun-the-shadows-of-evil-easter-egg',
  "https://zwr.gg/wiki/speedrunning-with-director's-cut-solo",
  'https://zwr.gg/wiki/terminus-build-no-gums-easter-egg-speedrun-guide',
  "https://zwr.gg/wiki/speedrunning-rave-with-director's-cut-solo",
  'https://zwr.gg/wiki/world-at-war-verruckt-30-speedrun-guide',
  'https://zwr.gg/wiki/how-to-setup-the-boiii-client',
  'https://zwr.gg/wiki/plutonium-anticheat-setup-and-breakdown',
  'https://zwr.gg/wiki/how-to-bypass-the-25-day-freeze-black-screen',
  'https://zwr.gg/wiki/how-to-open-the-console-on-plutonium-boiii-etc',
  'https://zwr.gg/wiki/zombies-terminology-glossary',
  'https://zwr.gg/wiki/bo2-movement-resources-and-information-',
  'https://zwr.gg/wiki/world-war-ii-specialists-and-mods',
  'https://zwr.gg/wiki/combating-descent-zombie-types',
  'https://zwr.gg/wiki/combating-carrier-zombie-types',
  'https://zwr.gg/wiki/combating-infection-zombie-types',
  'https://zwr.gg/wiki/combating-outbreak-zombie-types',
  'https://zwr.gg/wiki/terminus-first-room',
  'https://zwr.gg/wiki/ix-first-room-solo-guide',
];

export async function fetchAndStoreZwrWiki(verbose = false): Promise<{ fetched: number; errors: number }> {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  let fetched = 0;
  let errors = 0;
  const storedIds: string[] = [];

  try {
    for (const url of ZWR_WIKI_URLS) {
      await delay(DELAY_MS);
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForFunction(() => (document.body?.innerText?.length ?? 0) > 200, { timeout: 10000 }).catch(() => {});
        const bodyText = await page.evaluate(() => document.body?.innerText ?? '');
        await page.close();

        const content = bodyText.slice(0, MAX_CONTENT_CHARS);
        if (!content.trim() || content.length < 100) {
          if (verbose) console.log(`  SKIP (too short): ${url}`);
          continue;
        }
        if (/page\s+not\s+found|does\s+not\s+exist/i.test(content)) {
          if (verbose) console.log(`  SKIP (not found): ${url}`);
          continue;
        }

        const pathMatch = url.match(/\/wiki\/(.+)$/);
        const externalId = pathMatch ? decodeURIComponent(pathMatch[1]) : url;
        const title = externalId.replace(/-/g, ' ');
        storedIds.push(externalId);

        await prisma.chatbotWikiImport.upsert({
          where: { source_externalId: { source: 'zwr', externalId } },
          create: { source: 'zwr', externalId, title, url, content },
          update: { title, url, content, fetchedAt: new Date() },
        });
        fetched++;
        if (verbose) console.log(`  OK: ${externalId} (${content.length} chars)`);
      } catch (e) {
        errors++;
        if (verbose) console.log(`  ERROR: ${url}`, e);
      }
    }

    if (storedIds.length > 0) {
      const deleted = await prisma.chatbotWikiImport.deleteMany({
        where: { source: 'zwr', externalId: { notIn: storedIds } },
      });
      if (deleted.count > 0 && verbose) console.log(`  Removed ${deleted.count} stale ZWR entries`);
    }
  } finally {
    await browser.close();
  }
  return { fetched, errors };
}
