import prisma from '@/lib/prisma';

const MAX_CONTEXT_CHARS = 32_000;
const MAX_SITE_DATA_CHARS = 14_000;
const CONTEXT_CACHE_TTL_MS = 90_000;

let cachedContext: { value: string; expiresAt: number } | null = null;

async function buildSiteDataContext(): Promise<string> {
  const maps = await prisma.map.findMany({
    orderBy: [{ game: { order: 'asc' } }, { order: 'asc' }],
    select: {
      name: true,
      slug: true,
      game: { select: { name: true } },
      easterEggs: {
        where: { isActive: true },
        orderBy: [{ type: 'asc' }, { id: 'asc' }],
        select: { name: true, description: true },
      },
    },
  });

  const lines: string[] = [];
  lines.push('## Site overview');
  lines.push('This site is a Call of Duty Zombies progress tracker. Key pages:');
  lines.push('- Leaderboards (per map and category): /leaderboards. We do not have a single "best player in the world" ranking—top players are shown per map and per category (e.g. high rounds, no downs, easter egg speedruns).');
  lines.push('- Maps and easter egg guides: each map has its own page at /maps/[map-slug]. On that page you can see easter eggs for that map, step-by-step guides, and links to any video guides.');
  lines.push('- Rules and verification: /rules (filter by game; includes general rules and challenge rules).');
  lines.push('');
  lines.push('## Maps and Easter Eggs');
  lines.push('Each map page at /maps/[slug] has full easter egg guides and steps. Below is the list of maps with their easter eggs so you can direct users to the right page.');
  lines.push('');

  let len = lines.join('\n').length;
  for (const map of maps) {
    const gameName = map.game.name;
    const mapName = map.name;
    const slug = map.slug;
    const mapLine = `${gameName} – ${mapName}: /maps/${slug}`;
    if (len + mapLine.length + 2 > MAX_SITE_DATA_CHARS) break;

    lines.push(mapLine);
    if (map.easterEggs.length > 0) {
      for (const ee of map.easterEggs) {
        const desc = ee.description?.trim();
        const eeLine = `  - ${ee.name}${desc ? `: ${desc.slice(0, 120)}${desc.length > 120 ? '…' : ''}` : ''}. Full step-by-step guide on map page: /maps/${slug}.`;
        if (len + eeLine.length + 2 > MAX_SITE_DATA_CHARS) {
          lines.push(`  - ${ee.name}. Full guide: /maps/${slug}.`);
        } else {
          lines.push(eeLine);
        }
        len = lines.join('\n').length;
      }
    }
    lines.push('');
    len = lines.join('\n').length;
  }

  return lines.join('\n');
}

export async function buildChatbotContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && cachedContext.expiresAt > now) {
    return cachedContext.value;
  }

  const [siteData, approved] = await Promise.all([
    buildSiteDataContext(),
    prisma.chatbotKnowledge.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
      select: { title: true, category: true, content: true },
    }),
  ]);

  const parts: string[] = [];
  parts.push(
    'You only answer from the CONTEXT below. If the answer is not in the context, say you do not have that information.'
  );
  parts.push('');
  parts.push('[Site data – maps, easter eggs, leaderboards, rules]');
  parts.push(siteData);
  parts.push('');

  let total = parts.join('\n\n---\n\n').length;
  for (const row of approved) {
    const label = [row.title, row.category].filter(Boolean).join(' · ') || 'Knowledge';
    const block = `[${label}]\n${row.content}`;
    if (total + block.length + 10 > MAX_CONTEXT_CHARS) {
      const remaining = MAX_CONTEXT_CHARS - total - 100;
      if (remaining > 0) parts.push(block.slice(0, remaining) + '\n...[truncated]');
      break;
    }
    parts.push(block);
    total += block.length + 10;
  }

  const value = parts.join('\n\n---\n\n');
  cachedContext = { value, expiresAt: now + CONTEXT_CACHE_TTL_MS };
  return value;
}
