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

const ZWR_WIKI_BASE = 'https://zwr.gg/wiki';

async function discoverZwrWikiPaths(): Promise<string[]> {
  const paths: string[] = [];
  const res = await fetch(ZWR_WIKI_BASE, {
    headers: { 'User-Agent': 'CZT-LeKronorium/1.0 (wiki context)' },
  });
  const html = await res.text();
  const hrefRegex = /href="(\/wiki\/[^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = hrefRegex.exec(html)) !== null) {
    const path = m[1].replace(/#.*$/, '').replace(/\/$/, '') || '/wiki';
    if (path.startsWith('/wiki') && path.length > 5 && !paths.includes(path)) {
      paths.push(path);
    }
  }
  return paths.length > 0 ? paths : ['/wiki'];
}

function extractTextFromHtml(html: string): string {
  const stripTags = (s: string) => s.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ?? html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ?? html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const raw = mainMatch ? mainMatch[1] : html;
  return stripTags(raw).slice(0, MAX_CONTENT_CHARS);
}

export async function fetchAndStoreZwrWiki(): Promise<{ fetched: number; errors: number }> {
  const paths = await discoverZwrWikiPaths();
  let fetched = 0;
  let errors = 0;
  for (const path of paths) {
    await delay(DELAY_MS);
    try {
      const url = path.startsWith('http') ? path : `https://zwr.gg${path}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'CZT-LeKronorium/1.0 (wiki context)' },
      });
      const html = await res.text();
      const content = extractTextFromHtml(html);
      const title = path === '/wiki' ? 'The Rift' : path.replace(/^\/wiki\/?/, '').replace(/-/g, ' ') || 'Wiki';
      if (!content.trim() || content.length < 100) continue;
      const externalId = path.replace(/^\/wiki\/?/, '') || 'index';
      await prisma.chatbotWikiImport.upsert({
        where: {
          source_externalId: { source: 'zwr', externalId },
        },
        create: {
          source: 'zwr',
          externalId,
          title,
          url: `https://zwr.gg${path}`,
          content,
        },
        update: {
          title,
          url: `https://zwr.gg${path}`,
          content,
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
