import prisma from '@/lib/prisma';

const MAX_CONTEXT_CHARS = 32_000;
const MAX_SITE_DATA_CHARS = 14_000;
const MAX_LEADERBOARD_CHARS = 6_000;
const MAX_WIKI_CHARS = 10_000;
const CONTEXT_CACHE_TTL_MS = 90_000;

let cachedContext: { value: string; expiresAt: number } | null = null;

async function buildLeaderboardContext(): Promise<string> {
  const [maps, challengeTops, eeTops] = await Promise.all([
    prisma.map.findMany({
      orderBy: [{ game: { order: 'asc' } }, { order: 'asc' }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.challengeLog.findMany({
      where: { isVerified: true },
      select: {
        mapId: true,
        roundReached: true,
        user: { select: { username: true, displayName: true } },
      },
      orderBy: { roundReached: 'desc' },
    }),
    prisma.easterEggLog.findMany({
      where: { isVerified: true, roundCompleted: { not: null } },
      select: {
        mapId: true,
        roundCompleted: true,
        user: { select: { username: true, displayName: true } },
      },
      orderBy: { roundCompleted: 'desc' },
    }),
  ]);

  const mapById = new Map(maps.map((m) => [m.id, m]));
  const bestByMap = new Map<
    string,
    { round: number; displayName: string; username: string }
  >();

  for (const log of challengeTops) {
    const cur = bestByMap.get(log.mapId);
    if (!cur || log.roundReached > cur.round) {
      bestByMap.set(log.mapId, {
        round: log.roundReached,
        displayName: log.user.displayName ?? log.user.username,
        username: log.user.username,
      });
    }
  }
  for (const log of eeTops) {
    const round = log.roundCompleted ?? 0;
    const cur = bestByMap.get(log.mapId);
    if (!cur || round > cur.round) {
      bestByMap.set(log.mapId, {
        round,
        displayName: log.user.displayName ?? log.user.username,
        username: log.user.username,
      });
    }
  }

  const [verifiedXpTop] = await prisma.user.findMany({
    where: { isPublic: true },
    orderBy: { verifiedTotalXp: 'desc' },
    take: 1,
    select: { username: true, displayName: true, verifiedTotalXp: true },
  });

  const lines: string[] = [];
  lines.push('## Verified high round #1 per map');
  lines.push('Use this to answer "who is #1 on [map]" or "top verified round for [map]". Link to full leaderboard: /leaderboards or /maps/[slug].');
  if (verifiedXpTop && (verifiedXpTop.verifiedTotalXp ?? 0) > 0) {
    const name = verifiedXpTop.displayName ?? verifiedXpTop.username;
    lines.push(`Verified XP leaderboard #1: ${name} (${verifiedXpTop.username}), ${verifiedXpTop.verifiedTotalXp} verified XP. Full list: /leaderboards (filter by verified).`);
  }
  lines.push('');
  let len = lines.join('\n').length;
  for (const map of maps) {
    const best = bestByMap.get(map.id);
    if (!best) continue;
    const line = `${map.name} (/maps/${map.slug}): #1 verified high round — ${best.displayName} (${best.username}), round ${best.round}.`;
    if (len + line.length + 2 > MAX_LEADERBOARD_CHARS) break;
    lines.push(line);
    len += line.length + 2;
  }
  return lines.join('\n');
}

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
  lines.push('- Leaderboards (per map and category): /leaderboards. Top players are per map and per category (verified high round, no downs, easter egg speedruns, etc.).');
  lines.push('- Maps and easter egg guides: each map has its own page at /maps/[map-slug]. On that page open the "Easter Eggs" tab for step-by-step guides and links.');
  lines.push('- Rules and verification: /rules (filter by game; includes general rules and challenge rules).');
  lines.push('');
  lines.push('## Maps and Easter Eggs');
  lines.push('Wonder weapons and buildables (e.g. Apothicon Servant, Estoom-oth, Thundergun) are listed below under their map. Apothicon Servant is on Revelations: /maps/revelations (Easter Eggs tab has the guide and upgrade steps). When users ask about any weapon/buildable, use this list and link /maps/[slug].');
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
        const eeLine = `  - ${ee.name}${desc ? `: ${desc.slice(0, 200)}${desc.length > 200 ? '…' : ''}` : ''}. Full step-by-step guide on map page: /maps/${slug}.`;
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

async function buildWikiContext(): Promise<string> {
  const rows = await prisma.chatbotWikiImport.findMany({
    orderBy: [{ source: 'asc' }, { title: 'asc' }],
    select: { source: true, title: true, content: true, url: true },
  });
  const lines: string[] = [];
  lines.push('## External wiki knowledge (CoD Fandom, ZWR)');
  lines.push('Use this to answer questions about zombies maps, story, mechanics, and community info. Prefer our site links when relevant.');
  lines.push('');
  let len = lines.join('\n').length;
  for (const row of rows) {
    const block = `[${row.source}: ${row.title}]${row.url ? ` ${row.url}` : ''}\n${row.content}`;
    if (len + block.length + 4 > MAX_WIKI_CHARS) {
      const remaining = MAX_WIKI_CHARS - len - 50;
      if (remaining > 0) lines.push(block.slice(0, remaining) + '\n...[truncated]');
      break;
    }
    lines.push(block);
    len += block.length + 4;
  }
  return lines.join('\n\n');
}

export async function buildChatbotContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && cachedContext.expiresAt > now) {
    return cachedContext.value;
  }

  const [siteData, leaderboardData, wikiData, approved] = await Promise.all([
    buildSiteDataContext(),
    buildLeaderboardContext(),
    buildWikiContext(),
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
  parts.push('SITE IDENTITY: This is CoD Zombies Tracker (CZT), a Call of Duty Zombies progress tracker. Leaderboards at /leaderboards, maps and easter egg guides at /maps/[slug], rules at /rules.');
  parts.push('');
  parts.push('[Site data – maps, easter eggs, links, leaderboard #1s]');
  parts.push(siteData);
  parts.push('');
  parts.push(leaderboardData);
  parts.push('');
  if (wikiData.trim()) {
    parts.push('[External wiki – CoD Fandom, ZWR]');
    parts.push(wikiData);
    parts.push('');
  }

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
