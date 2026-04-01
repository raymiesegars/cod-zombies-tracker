import prisma from '@/lib/prisma';
import { isSpeedrunCategory } from '@/lib/achievements/categories';
import { isBo3Game } from '@/lib/bo3';
import { isBo4Game } from '@/lib/bo4';
import { isBocwGame } from '@/lib/bocw';
import { isBo6Game } from '@/lib/bo6';
import { isBo7Game } from '@/lib/bo7';
import { isIwGame } from '@/lib/iw';
import { getBo2MapConfig } from '@/lib/bo2/bo2-map-config';
import { isWw2Game } from '@/lib/ww2';
import { isVanguardGame, hasVanguardVoidFilter, hasVanguardRampageFilter } from '@/lib/vanguard';
import type { PlayerCount } from '@prisma/client';

export type WorldRecordsResult = { worldRecords: number; verifiedWorldRecords: number };
export type RankOneScopeFilter = { gameId?: string | null; mapId?: string | null };
export type RankOneRunScope = 'all' | 'nonSpeedrun' | 'speedrun' | 'eeSpeedrun';

export type WorldRecordDetail = {
  mapSlug: string;
  mapName: string;
  challengeLabel: string;
  playerCount: PlayerCount;
  filters: string[];
  isVerified: boolean;
  isVerifiedLeaderboard: boolean;
};

export type WorldRecordsDetailedResult = WorldRecordsResult & {
  details: WorldRecordDetail[];
};

type LogWithMeta = {
  userId: string;
  mapId: string;
  challengeId: string | null;
  challengeType: string;
  easterEggId: string | null;
  roundReached: number;
  completionTimeSeconds: number | null;
  killsReached: number | null;
  scoreReached: number | null;
  isVerified: boolean;
  playerCount: PlayerCount;
  gameShortName: string;
  mapSlug: string;
  mapName: string;
  challengeName: string;
  easterEggName: string | null;
  // Game filters
  bo3GobbleGumMode?: string | null;
  bo3AatUsed?: boolean | null;
  bo4ElixirMode?: string | null;
  difficulty?: string | null;
  bocwSupportMode?: string | null;
  bo6GobbleGumMode?: string | null;
  bo6SupportMode?: string | null;
  bo7GobbleGumMode?: string | null;
  bo7SupportMode?: string | null;
  bo7IsCursedRun?: boolean | null;
  bo7RelicsUsed?: string[];
  useFortuneCards?: boolean | null;
  useDirectorsCut?: boolean | null;
  wawNoJug?: boolean | null;
  wawFixedWunderwaffe?: boolean | null;
  bo2BankUsed?: boolean | null;
  rampageInducerUsed?: boolean | null;
  vanguardVoidUsed?: boolean | null;
  ww2ConsumablesUsed?: boolean | null;
  firstRoomVariant?: string | null;
  teammateUserIds?: string[];
};

type WRBucketEntry = { userId: string; value: number; isVerified: boolean; log: LogWithMeta };

export type WorldRecordBucketState = {
  mapById: Map<string, { slug: string; name: string; gameId: string; gameShortName: string }>;
  challengeBuckets: Map<string, WRBucketEntry[]>;
  eeBuckets: Map<string, WRBucketEntry[]>;
  hrByKey: Map<string, { round: number; entries: WRBucketEntry[] }>;
};

function getFilterKeyVariants(log: LogWithMeta, gameShortName: string, mapSlug?: string): string[] {
  const variants: string[] = [];
  variants.push('');

  if (isBo3Game(gameShortName)) {
    const gg = log.bo3GobbleGumMode ?? '';
    const aat = log.bo3AatUsed;
    const withGg = gg ? [`gg:${gg}`] : [];
    const withAat = aat !== undefined && aat !== null ? [`aat:${aat}`] : [];
    if (withGg.length || withAat.length) {
      variants.push([...withGg, ...withAat].join('|'));
      if (withGg.length) variants.push(withGg.join('|'));
      if (withAat.length) variants.push(withAat.join('|'));
    }
  }
  if (isBo4Game(gameShortName)) {
    const elixir = log.bo4ElixirMode ?? '';
    const diff = log.difficulty ?? '';
    const parts: string[] = [];
    if (elixir) parts.push(`elixir:${elixir}`);
    if (diff) parts.push(`diff:${diff}`);
    if (parts.length) {
      variants.push(parts.join('|'));
      parts.forEach((p) => variants.push(p));
    }
  }
  if (isBocwGame(gameShortName) || isBo6Game(gameShortName) || isBo7Game(gameShortName)) {
    const support = log.bocwSupportMode ?? log.bo6SupportMode ?? log.bo7SupportMode ?? '';
    const ramp = log.rampageInducerUsed;
    const parts: string[] = [];
    if (support) parts.push(`support:${support}`);
    if (ramp !== undefined && ramp !== null) parts.push(`ramp:${ramp}`);
    if (parts.length) {
      variants.push(parts.join('|'));
      parts.forEach((p) => variants.push(p));
    }
  }
  if (isVanguardGame(gameShortName) && mapSlug) {
    if (hasVanguardVoidFilter(mapSlug)) {
      const vv = log.vanguardVoidUsed;
      if (vv !== undefined && vv !== null) variants.push(`vanguardVoid:${vv}`);
    }
    if (hasVanguardRampageFilter(mapSlug)) {
      const ramp = log.rampageInducerUsed;
      if (ramp !== undefined && ramp !== null) variants.push(`ramp:${ramp}`);
    }
  }
  if (isBo7Game(gameShortName)) {
    const gg = log.bo7GobbleGumMode ?? '';
    if (gg) {
      const support = log.bo7SupportMode ?? '';
      const ramp = log.rampageInducerUsed;
      const parts: string[] = [`gg:${gg}`];
      if (support) parts.push(`support:${support}`);
      if (ramp !== undefined && ramp !== null) parts.push(`ramp:${ramp}`);
      if (parts.length > 1) variants.push(parts.join('|'));
      variants.push(`gg:${gg}`);
    }
    const cursed = log.bo7IsCursedRun;
    const relics = log.bo7RelicsUsed ?? [];
    if (cursed !== undefined && cursed !== null) {
      const r = relics.length ? `relics:${relics.sort().join(',')}` : 'cursed:true';
      if (!variants.includes(r)) variants.push(r);
    }
  }
  if (isIwGame(gameShortName)) {
    const fc = log.useFortuneCards;
    const dc = log.useDirectorsCut;
    const parts: string[] = [];
    if (fc !== undefined && fc !== null) parts.push(`fc:${fc}`);
    if (dc) parts.push('dc:true');
    if (parts.length) variants.push(parts.join('|'));
  }
  if (gameShortName === 'WAW') {
    const noJug = log.wawNoJug;
    const fixed = log.wawFixedWunderwaffe;
    const parts: string[] = [];
    if (noJug !== undefined && noJug !== null) parts.push(`noJug:${noJug}`);
    if (fixed) parts.push('fixedWaffe:true');
    if (parts.length) variants.push(parts.join('|'));
  }
  if (gameShortName === 'BO2' && mapSlug && getBo2MapConfig(mapSlug)?.hasBank) {
    const bank = log.bo2BankUsed;
    if (bank !== undefined && bank !== null) variants.push(`bank:${bank}`);
  }
  if (isWw2Game(gameShortName)) {
    const consumables = log.ww2ConsumablesUsed;
    if (consumables !== undefined && consumables !== null) variants.push(`ww2consumables:${consumables}`);
  }
  if (log.firstRoomVariant) {
    variants.push(`frv:${log.firstRoomVariant}`);
  }

  return Array.from(new Set(variants));
}

/** Human-readable filter labels for display */
function getFilterLabels(filterKey: string): string[] {
  if (!filterKey) return [];
  const labels: string[] = [];
  for (const part of filterKey.split('|')) {
    const [k, v] = part.split(':');
    if (k === 'gg') {
      if (v === 'CLASSIC_ONLY') labels.push('Classic GobbleGums');
      else if (v === 'MEGA') labels.push('Mega GobbleGums');
      else if (v === 'NONE') labels.push('No GobbleGums');
      else if (v === 'WITH_GOBBLEGUMS') labels.push('With GobbleGums');
      else if (v === 'NO_GOBBLEGUMS') labels.push('No GobbleGums');
      else labels.push(`GobbleGum: ${v}`);
    } else if (k === 'aat') labels.push(v === 'true' ? 'With AATs' : 'No AATs');
    else if (k === 'elixir') labels.push(v === 'CLASSIC_ONLY' ? 'Classic Elixirs' : v === 'ALL_ELIXIRS_TALISMANS' ? 'All Elixirs' : `Elixir: ${v}`);
    else if (k === 'diff') labels.push(`Difficulty: ${v}`);
    else if (k === 'support') labels.push(v === 'WITH_SUPPORT' ? 'With Support' : 'No Support');
    else if (k === 'ramp') labels.push(v === 'true' ? 'Rampage Inducer' : 'No Rampage');
    else if (k === 'cursed' && v === 'true') labels.push('Cursed Run');
    else if (k === 'relics') labels.push(`Relics: ${v}`);
    else if (k === 'fc') labels.push(v === 'true' ? 'Fortune Cards' : 'Fate Only');
    else if (k === 'dc' && v === 'true') labels.push('Director\'s Cut');
    else if (k === 'noJug') labels.push(v === 'true' ? 'No Jug' : 'Jug Allowed');
    else if (k === 'fixedWaffe' && v === 'true') labels.push('Fixed Wunderwaffe');
    else if (k === 'bank') labels.push(v === 'true' ? 'Bank Used' : 'No Bank');
    else if (k === 'ww2consumables') labels.push(v === 'true' ? 'With Consumables' : 'No Consumables');
    else if (k === 'vanguardVoid') labels.push(v === 'true' ? 'With Void' : 'Without Void');
    else if (k === 'frv') labels.push(`First Room: ${v}`);
    else labels.push(`${k}: ${v}`);
  }
  return labels;
}

function isVerifiedOnlyLeaderboardKey(key: string): boolean {
  const prefix = key.includes('::') ? key.slice(0, key.indexOf('::')) : key;
  return prefix.endsWith(':true');
}

function aggregateRankOneCountsFromBuckets(
  state: WorldRecordBucketState,
  filter?: RankOneScopeFilter,
  options?: { runScope?: RankOneRunScope }
): Map<string, { worldRecords: number; verifiedWorldRecords: number }> {
  const runScope = options?.runScope ?? 'all';
  const counts = new Map<string, { worldRecords: number; verifiedWorldRecords: number }>();
  const awardedByUserAndBoard = new Set<string>();
  const mapMatchesScope = (mapId: string): boolean => {
    if (!filter?.gameId && !filter?.mapId) return true;
    if (filter.mapId) return mapId === filter.mapId;
    const meta = state.mapById.get(mapId);
    return !!meta && meta.gameId === filter.gameId;
  };
  const bump = (leaderboardKey: string, userId: string, verifiedOnlyBoard: boolean) => {
    const dedupeKey = `${leaderboardKey}::${userId}`;
    if (awardedByUserAndBoard.has(dedupeKey)) return;
    awardedByUserAndBoard.add(dedupeKey);
    const cur = counts.get(userId) ?? { worldRecords: 0, verifiedWorldRecords: 0 };
    if (verifiedOnlyBoard) cur.verifiedWorldRecords++;
    else cur.worldRecords++;
    counts.set(userId, cur);
  };
  const getWinnerUserIds = (ownerUserId: string, teammateUserIds?: string[]): string[] => {
    const out = new Set<string>([ownerUserId]);
    for (const id of teammateUserIds ?? []) {
      if (id) out.add(id);
    }
    return Array.from(out);
  };
  const pickBest = (key: string, entries: WRBucketEntry[], isSpeedrun: boolean, isEe: boolean) => {
    if (entries.length === 0) return;
    if (!mapMatchesScope(entries[0]!.log.mapId)) return;
    const challengeType = entries[0]!.log.challengeType;
    if (runScope === 'nonSpeedrun' && (isEe || isSpeedrun)) return;
    if (runScope === 'speedrun' && (isEe || !isSpeedrun || challengeType === 'EASTER_EGG_SPEEDRUN')) return;
    if (runScope === 'eeSpeedrun' && !(isEe || challengeType === 'EASTER_EGG_SPEEDRUN')) return;
    const bestValue = entries.reduce((best, entry) => {
      if (isSpeedrun || isEe) return entry.value < best ? entry.value : best;
      return entry.value > best ? entry.value : best;
    }, entries[0]!.value);
    const bestEntries = entries.filter((entry) => entry.value === bestValue);
    const verifiedOnlyBoard = isVerifiedOnlyLeaderboardKey(key);
    for (const bestEntry of bestEntries) {
      for (const winnerUserId of getWinnerUserIds(bestEntry.userId, bestEntry.log.teammateUserIds)) {
        bump(key, winnerUserId, verifiedOnlyBoard);
      }
    }
  };
  for (const [key, entries] of Array.from(state.challengeBuckets.entries())) {
    const ct = entries[0]?.log.challengeType ?? '';
    if (ct === 'HIGHEST_ROUND') continue;
    pickBest(key, entries, isSpeedrunCategory(ct), false);
  }
  for (const [key, entries] of Array.from(state.eeBuckets.entries())) {
    pickBest(key, entries, true, true);
  }
  for (const [key, data] of Array.from(state.hrByKey.entries())) {
    if (runScope === 'speedrun' || runScope === 'eeSpeedrun') continue;
    const scopedEntries = data.entries.filter((entry) => mapMatchesScope(entry.log.mapId));
    if (scopedEntries.length === 0) continue;
    const verifiedOnlyBoard = isVerifiedOnlyLeaderboardKey(key);
    for (const entry of scopedEntries) {
      for (const winnerUserId of getWinnerUserIds(entry.userId, entry.log.teammateUserIds)) {
        bump(key, winnerUserId, verifiedOnlyBoard);
      }
    }
  }
  return counts;
}

const WR_CACHE_TTL_MS = 60_000; // 1 minute
const wrCache = new Map<string, { result: WorldRecordsResult; expiresAt: number }>();
const STORED_RANK_ONE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type RankCountMap = Map<string, { worldRecords: number; verifiedWorldRecords: number }>;
const scopeCountsCache = new Map<string, { counts: RankCountMap; expiresAt: number }>();

function getScopeKey(filter?: RankOneScopeFilter): string {
  if (filter?.mapId) return `map:${filter.mapId}`;
  if (filter?.gameId) return `game:${filter.gameId}`;
  return 'global';
}

function isMissingStoredRankOneTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: unknown }).code;
  return code === 'P2021' || code === 'P2022';
}

async function readStoredRankOneCounts(
  filter?: RankOneScopeFilter
): Promise<{ counts: RankCountMap; updatedAtMs: number | null; hasRows: boolean } | null> {
  const scopeKey = getScopeKey(filter);
  try {
    const rows = await (prisma as any).userRankOneCount.findMany({
      where: { scopeKey },
      select: { userId: true, worldRecords: true, verifiedWorldRecords: true, updatedAt: true },
    });
    const counts: RankCountMap = new Map();
    let latest = 0;
    for (const r of rows) {
      counts.set(r.userId, { worldRecords: r.worldRecords, verifiedWorldRecords: r.verifiedWorldRecords });
      const t = r.updatedAt.getTime();
      if (t > latest) latest = t;
    }
    return {
      counts,
      updatedAtMs: latest > 0 ? latest : null,
      hasRows: rows.length > 0,
    };
  } catch (error) {
    if (isMissingStoredRankOneTableError(error)) return null;
    throw error;
  }
}

async function writeStoredRankOneCounts(
  counts: RankCountMap,
  filter?: RankOneScopeFilter
): Promise<void> {
  const scopeKey = getScopeKey(filter);
  const now = new Date();
  const entries = Array.from(counts.entries())
    .filter(([, c]) => c.worldRecords > 0 || c.verifiedWorldRecords > 0)
    .map(([userId, c]) => ({
      userId,
      scopeKey,
      gameId: filter?.mapId ? null : (filter?.gameId ?? null),
      mapId: filter?.mapId ?? null,
      worldRecords: c.worldRecords,
      verifiedWorldRecords: c.verifiedWorldRecords,
      createdAt: now,
      updatedAt: now,
    }));
  try {
    await prisma.$transaction(async (tx) => {
      await (tx as any).userRankOneCount.deleteMany({ where: { scopeKey } });
      if (entries.length > 0) {
        await (tx as any).userRankOneCount.createMany({ data: entries });
      }
    });
  } catch (error) {
    if (isMissingStoredRankOneTableError(error)) return;
    throw error;
  }
  scopeCountsCache.set(scopeKey, {
    counts,
    expiresAt: Date.now() + WR_CACHE_TTL_MS,
  });
}

export async function refreshStoredRankOneCountsForScope(filter?: RankOneScopeFilter): Promise<RankCountMap> {
  const counts = filter?.gameId || filter?.mapId
    ? await computeScopedRankOneCountsByUserId(filter)
    : await computeRankOneCountsByUserId();
  await writeStoredRankOneCounts(counts, filter);
  return counts;
}

export async function refreshStoredRankOneCountsForMap(mapId: string): Promise<void> {
  if (!mapId) return;
  // Safety guard: inline global/game/map refresh can be too heavy on serverless runtimes.
  // Keep it opt-in; use backfill script or explicit admin jobs for full recomputes.
  if (process.env.ENABLE_INLINE_WR_REFRESH !== '1') return;
  const map = await prisma.map.findUnique({
    where: { id: mapId },
    select: { gameId: true },
  });
  if (!map) return;
  await refreshStoredRankOneCountsForScope();
  await refreshStoredRankOneCountsForScope({ gameId: map.gameId });
  await refreshStoredRankOneCountsForScope({ mapId });
}

export async function refreshStoredRankOneCountsForMaps(mapIds: string[]): Promise<void> {
  if (process.env.ENABLE_INLINE_WR_REFRESH !== '1') return;
  const uniqueMapIds = Array.from(new Set(mapIds.filter(Boolean)));
  if (uniqueMapIds.length === 0) {
    await refreshStoredRankOneCountsForScope();
    return;
  }
  const maps = await prisma.map.findMany({
    where: { id: { in: uniqueMapIds } },
    select: { id: true, gameId: true },
  });
  const gameIds = Array.from(new Set(maps.map((m) => m.gameId)));
  await refreshStoredRankOneCountsForScope();
  for (const gameId of gameIds) {
    await refreshStoredRankOneCountsForScope({ gameId });
  }
  for (const map of maps) {
    await refreshStoredRankOneCountsForScope({ mapId: map.id });
  }
}

export async function invalidateStoredRankOneCountsForUsers(
  userIds: string[],
  options?: { mapIds?: string[] }
): Promise<void> {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueUserIds.length === 0) return;
  try {
    const scopeKeys = new Set<string>(['global']);
    const mapIds = Array.from(new Set((options?.mapIds ?? []).filter(Boolean)));
    if (mapIds.length > 0) {
      for (const mapId of mapIds) scopeKeys.add(`map:${mapId}`);
      const maps = await prisma.map.findMany({
        where: { id: { in: mapIds } },
        select: { gameId: true },
        distinct: ['gameId'],
      });
      for (const m of maps) scopeKeys.add(`game:${m.gameId}`);
    }
    await (prisma as any).userRankOneCount.deleteMany({
      where: {
        userId: { in: uniqueUserIds },
        scopeKey: { in: Array.from(scopeKeys) },
      },
    });
  } catch (error) {
    if (isMissingStoredRankOneTableError(error)) return;
    throw error;
  }
}

export async function getRankOneCountsByScope(
  filter?: RankOneScopeFilter,
  options?: { maxAgeMs?: number }
): Promise<RankCountMap> {
  const scopeKey = getScopeKey(filter);
  const now = Date.now();
  const cachedScopeCounts = scopeCountsCache.get(scopeKey);
  if (cachedScopeCounts && cachedScopeCounts.expiresAt > now) {
    return cachedScopeCounts.counts;
  }

  const maxAgeMs = options?.maxAgeMs ?? STORED_RANK_ONE_TTL_MS;
  const stored = await readStoredRankOneCounts(filter);
  if (stored && stored.hasRows) {
    const isFresh =
      stored.updatedAtMs != null &&
      now - stored.updatedAtMs <= maxAgeMs;
    if (!isFresh) {
      console.warn(
        `[world-records] serving stale stored rank-one counts for scope="${scopeKey}" (ageMs=${stored.updatedAtMs != null ? now - stored.updatedAtMs : 'unknown'})`
      );
    }
    scopeCountsCache.set(scopeKey, {
      counts: stored.counts,
      expiresAt: now + WR_CACHE_TTL_MS,
    });
    return stored.counts;
  }

  if (stored && !stored.hasRows) {
    scopeCountsCache.set(scopeKey, {
      counts: stored.counts,
      expiresAt: now + WR_CACHE_TTL_MS,
    });
    return stored.counts;
  }

  // Table missing (pre-migration): avoid heavy live recompute in request path.
  return new Map();
}

/** Compute world records across all leaderboard combinations (player count, game filters, verified) and optional details. Cached per user for 1 minute. */
export async function computeWorldRecords(userId: string): Promise<WorldRecordsResult> {
  const now = Date.now();
  const cached = wrCache.get(userId);
  if (cached && cached.expiresAt > now) return cached.result;
  const rankCounts = await getRankOneCountsByScope();
  const result: WorldRecordsResult = rankCounts.get(userId) ?? { worldRecords: 0, verifiedWorldRecords: 0 };
  wrCache.set(userId, { result, expiresAt: now + WR_CACHE_TTL_MS });
  return result;
}


const BUCKET_CACHE_TTL_MS = WR_CACHE_TTL_MS;
let wrBucketCache: {
  state: WorldRecordBucketState;
  rankCounts: Map<string, { worldRecords: number; verifiedWorldRecords: number }>;
  expiresAt: number;
} | null = null;

async function buildWorldRecordBucketState(): Promise<WorldRecordBucketState> {
  const maps = await prisma.map.findMany({
    select: { id: true, slug: true, name: true, gameId: true, game: { select: { shortName: true } } },
  });
  const mapById = new Map(maps.map((m) => [m.id, { slug: m.slug, name: m.name, gameId: m.gameId, gameShortName: m.game.shortName }]));

  const challengeLogs = await prisma.challengeLog.findMany({
    select: {
      id: true,
      userId: true,
      mapId: true,
      challengeId: true,
      roundReached: true,
      completionTimeSeconds: true,
      killsReached: true,
      scoreReached: true,
      firstRoomVariant: true,
      teammateUserIds: true,
      isVerified: true,
      playerCount: true,
      difficulty: true,
      rampageInducerUsed: true,
      vanguardVoidUsed: true,
      ww2ConsumablesUsed: true,
      bo3GobbleGumMode: true,
      bo3AatUsed: true,
      bo4ElixirMode: true,
      bocwSupportMode: true,
      bo6GobbleGumMode: true,
      bo6SupportMode: true,
      bo7GobbleGumMode: true,
      bo7SupportMode: true,
      bo7IsCursedRun: true,
      bo7RelicsUsed: true,
      useFortuneCards: true,
      useDirectorsCut: true,
      wawNoJug: true,
      wawFixedWunderwaffe: true,
      bo2BankUsed: true,
      challenge: { select: { type: true, name: true } },
      map: { select: { slug: true, name: true, game: { select: { shortName: true } } } },
    },
  });

  const eeLogs = await prisma.easterEggLog.findMany({
    where: { completionTimeSeconds: { not: null } },
    select: {
      id: true,
      userId: true,
      mapId: true,
      easterEggId: true,
      completionTimeSeconds: true,
      isVerified: true,
      playerCount: true,
      difficulty: true,
      rampageInducerUsed: true,
      vanguardVoidUsed: true,
      ww2ConsumablesUsed: true,
      teammateUserIds: true,
      easterEgg: { select: { name: true } },
      map: { select: { slug: true, name: true, game: { select: { shortName: true } } } },
    },
  });

  const clRaw = challengeLogs as unknown as Array<{
    bo3GobbleGumMode?: string | null;
    bo3AatUsed?: boolean | null;
    bo4ElixirMode?: string | null;
    bocwSupportMode?: string | null;
    bo6GobbleGumMode?: string | null;
    bo6SupportMode?: string | null;
    bo7GobbleGumMode?: string | null;
    bo7SupportMode?: string | null;
    bo7IsCursedRun?: boolean | null;
    bo7RelicsUsed?: string[];
    useFortuneCards?: boolean | null;
    useDirectorsCut?: boolean | null;
    wawNoJug?: boolean | null;
    wawFixedWunderwaffe?: boolean | null;
    bo2BankUsed?: boolean | null;
    rampageInducerUsed?: boolean | null;
    vanguardVoidUsed?: boolean | null;
    ww2ConsumablesUsed?: boolean | null;
    firstRoomVariant?: string | null;
    teammateUserIds?: string[];
  }>;

  const eeRaw = eeLogs as unknown as Array<{
    rampageInducerUsed?: boolean | null;
    vanguardVoidUsed?: boolean | null;
    ww2ConsumablesUsed?: boolean | null;
    teammateUserIds?: string[];
  }>;

  const toLog = (
    log: (typeof challengeLogs)[0] | (typeof eeLogs)[0],
    type: 'challenge' | 'ee',
    raw: { rampageInducerUsed?: boolean | null } & Record<string, unknown>
  ): LogWithMeta => {
    const mapMeta = mapById.get(log.mapId);
    if (!mapMeta) return null as unknown as LogWithMeta;
    if (type === 'challenge') {
      const c = log as (typeof challengeLogs)[0];
      if (!c.challenge) return null as unknown as LogWithMeta;
      const r = raw as (typeof clRaw)[0];
      return {
        userId: c.userId,
        mapId: c.mapId,
        challengeId: c.challengeId,
        challengeType: c.challenge.type,
        easterEggId: null,
        roundReached: c.roundReached,
        completionTimeSeconds: c.completionTimeSeconds,
        killsReached: (c as { killsReached?: number | null }).killsReached ?? null,
        scoreReached: (c as { scoreReached?: number | null }).scoreReached ?? null,
        isVerified: c.isVerified ?? false,
        playerCount: c.playerCount,
        gameShortName: mapMeta.gameShortName,
        mapSlug: mapMeta.slug,
        mapName: mapMeta.name,
        challengeName: c.challenge.name,
        easterEggName: null,
        bo3GobbleGumMode: r.bo3GobbleGumMode,
        bo3AatUsed: r.bo3AatUsed,
        bo4ElixirMode: r.bo4ElixirMode,
        difficulty: (c as { difficulty?: string | null }).difficulty ?? null,
        bocwSupportMode: r.bocwSupportMode,
        bo6GobbleGumMode: r.bo6GobbleGumMode,
        bo6SupportMode: r.bo6SupportMode,
        bo7GobbleGumMode: r.bo7GobbleGumMode,
        bo7SupportMode: r.bo7SupportMode,
        bo7IsCursedRun: r.bo7IsCursedRun,
        bo7RelicsUsed: r.bo7RelicsUsed,
        useFortuneCards: r.useFortuneCards,
        useDirectorsCut: r.useDirectorsCut,
        wawNoJug: r.wawNoJug,
        wawFixedWunderwaffe: r.wawFixedWunderwaffe,
        bo2BankUsed: r.bo2BankUsed,
        rampageInducerUsed: r.rampageInducerUsed,
        vanguardVoidUsed: r.vanguardVoidUsed,
        ww2ConsumablesUsed: r.ww2ConsumablesUsed,
        firstRoomVariant: r.firstRoomVariant,
        teammateUserIds: r.teammateUserIds ?? [],
      };
    } else {
      const e = log as (typeof eeLogs)[0];
      const r = raw as (typeof eeRaw)[0];
      return {
        userId: e.userId,
        mapId: e.mapId,
        challengeId: null,
        challengeType: 'EE_TIME',
        easterEggId: e.easterEggId,
        roundReached: 0,
        completionTimeSeconds: e.completionTimeSeconds!,
        killsReached: null,
        scoreReached: null,
        isVerified: e.isVerified ?? false,
        playerCount: e.playerCount,
        gameShortName: mapMeta.gameShortName,
        mapSlug: mapMeta.slug,
        mapName: mapMeta.name,
        challengeName: e.easterEgg.name,
        easterEggName: e.easterEgg.name,
        rampageInducerUsed: r.rampageInducerUsed,
        vanguardVoidUsed: r.vanguardVoidUsed,
        ww2ConsumablesUsed: r.ww2ConsumablesUsed,
        difficulty: (e as { difficulty?: string | null }).difficulty ?? null,
        teammateUserIds: r.teammateUserIds ?? [],
      };
    }
  };

  type BucketKey = string;
  type BucketEntry = WRBucketEntry;
  const challengeBuckets = new Map<BucketKey, BucketEntry[]>();
  const eeBuckets = new Map<BucketKey, BucketEntry[]>();

  const addChallenge = (log: LogWithMeta) => {
    const filterVariants = getFilterKeyVariants(log, log.gameShortName, log.mapSlug);
    for (const fv of filterVariants) {
      for (const verifiedView of [true, false]) {
        if (verifiedView && !log.isVerified) continue;
        const key: BucketKey = `c:${log.mapId}:${log.challengeId}:${log.playerCount}:${verifiedView}::${fv}`;
        if (!challengeBuckets.has(key)) challengeBuckets.set(key, []);
        const entries = challengeBuckets.get(key)!;
        const isSpeedrun = isSpeedrunCategory(log.challengeType);
        const isNoMansLand = log.challengeType === 'NO_MANS_LAND';
        const isRush = log.challengeType === 'RUSH';
        const value = isSpeedrun
          ? (log.completionTimeSeconds ?? Infinity)
          : isNoMansLand && log.killsReached != null
            ? log.killsReached
            : isRush && log.scoreReached != null
              ? log.scoreReached
              : log.roundReached;
        entries.push({ userId: log.userId, value: isSpeedrun ? value : -value, isVerified: log.isVerified, log });
      }
    }
  };

  const addEe = (log: LogWithMeta) => {
    const filterVariants = getFilterKeyVariants(log, log.gameShortName, log.mapSlug);
    for (const fv of filterVariants) {
      for (const verifiedView of [true, false]) {
        if (verifiedView && !log.isVerified) continue;
        const key: BucketKey = `e:${log.mapId}:${log.easterEggId}:${log.playerCount}:${verifiedView}::${fv}`;
        if (!eeBuckets.has(key)) eeBuckets.set(key, []);
        eeBuckets.get(key)!.push({
          userId: log.userId,
          value: log.completionTimeSeconds!,
          isVerified: log.isVerified,
          log,
        });
      }
    }
  };

  for (let i = 0; i < challengeLogs.length; i++) {
    const log = toLog(challengeLogs[i], 'challenge', clRaw[i] ?? {});
    if (log?.challengeId) addChallenge(log);
  }

  for (let i = 0; i < eeLogs.length; i++) {
    const log = toLog(eeLogs[i], 'ee', eeRaw[i] ?? {});
    if (log?.easterEggId) addEe(log);
  }

  const hrChallengeLogs = challengeLogs.filter((l) => (l.challenge?.type ?? '') === 'HIGHEST_ROUND');
  const hrEeLogs = eeLogs.filter((e) => (e as { roundCompleted?: number | null }).roundCompleted != null);
  const hrByKey = new Map<string, { round: number; entries: WRBucketEntry[] }>();
  const upsertHrEntry = (key: string, round: number, entry: WRBucketEntry) => {
    const existing = hrByKey.get(key);
    if (!existing || round > existing.round) {
      hrByKey.set(key, { round, entries: [entry] });
      return;
    }
    if (round === existing.round) {
      existing.entries.push(entry);
    }
  };
  for (const e of hrEeLogs) {
    const round = (e as { roundCompleted?: number | null }).roundCompleted;
    if (round == null) continue;
    const mapMeta = mapById.get(e.mapId);
    if (!mapMeta) continue;
    const log = toLog(e, 'ee', eeRaw[eeLogs.indexOf(e)] ?? {});
    if (!log) continue;
    (log as LogWithMeta & { roundReached: number }).roundReached = round;
    const filterVariants = getFilterKeyVariants(log, mapMeta.gameShortName, mapMeta.slug);
    for (const fv of filterVariants) {
      for (const verifiedView of [true, false]) {
        if (verifiedView && !e.isVerified) continue;
        const key = `hr:${e.mapId}:${e.playerCount}:${verifiedView}::${fv}`;
        upsertHrEntry(key, round, {
          userId: e.userId,
          value: -round,
          isVerified: e.isVerified ?? false,
          log: { ...log, roundReached: round },
        });
      }
    }
  }
  for (const c of hrChallengeLogs) {
    const mapMeta = mapById.get(c.mapId);
    if (!mapMeta) continue;
    const log = toLog(c, 'challenge', clRaw[challengeLogs.indexOf(c)] ?? {});
    if (!log) continue;
    const filterVariants = getFilterKeyVariants(log, mapMeta.gameShortName, mapMeta.slug);
    for (const fv of filterVariants) {
      for (const verifiedView of [true, false]) {
        if (verifiedView && !c.isVerified) continue;
        const key = `hr:${c.mapId}:${c.playerCount}:${verifiedView}::${fv}`;
        const round = log.roundReached;
        upsertHrEntry(key, round, {
          userId: c.userId,
          value: -round,
          isVerified: c.isVerified ?? false,
          log,
        });
      }
    }
  }

  return { mapById, challengeBuckets, eeBuckets, hrByKey };
}

async function getWRBucketCache(): Promise<{
  mapById: WorldRecordBucketState['mapById'];
  challengeBuckets: WorldRecordBucketState['challengeBuckets'];
  eeBuckets: WorldRecordBucketState['eeBuckets'];
  hrByKey: WorldRecordBucketState['hrByKey'];
  rankCounts: Map<string, { worldRecords: number; verifiedWorldRecords: number }>;
}> {
  const now = Date.now();
  if (wrBucketCache && wrBucketCache.expiresAt > now) {
    const { state, rankCounts } = wrBucketCache;
    return { ...state, rankCounts };
  }
  const state = await buildWorldRecordBucketState();
  const rankCounts = aggregateRankOneCountsFromBuckets(state);
  wrBucketCache = { state, rankCounts, expiresAt: now + BUCKET_CACHE_TTL_MS };
  return { ...state, rankCounts };
}

export async function computeRankOneCountsByUserId(): Promise<
  Map<string, { worldRecords: number; verifiedWorldRecords: number }>
> {
  const { rankCounts } = await getWRBucketCache();
  return rankCounts;
}

export async function computeScopedRankOneCountsByUserId(
  filter: RankOneScopeFilter,
  options?: { runScope?: RankOneRunScope }
): Promise<Map<string, { worldRecords: number; verifiedWorldRecords: number }>> {
  const runScope = options?.runScope ?? 'all';
  const hasScope = Boolean(filter.gameId || filter.mapId);
  if (!hasScope && runScope === 'all') return computeRankOneCountsByUserId();
  const { mapById, challengeBuckets, eeBuckets, hrByKey } = await getWRBucketCache();
  return aggregateRankOneCountsFromBuckets(
    { mapById, challengeBuckets, eeBuckets, hrByKey },
    filter,
    { runScope }
  );
}

export async function computeWorldRecordsDetailed(userId: string): Promise<WorldRecordsDetailedResult> {
  const { mapById, challengeBuckets, eeBuckets, hrByKey } = await getWRBucketCache();
  type BucketKey = string;
  type BucketEntry = WRBucketEntry;
  const challengeTypeLabels: Record<string, string> = {
    HIGHEST_ROUND: 'Highest Round',
    NO_DOWNS: 'No Downs',
    ONE_BOX: 'One Box',
    PISTOL_ONLY: 'Pistol Only',
    NO_POWER: 'No Power',
    NO_PACK: 'No Pack-a-Punch',
    STARTING_ROOM: 'Starting Room',
    ROUND_5_SPEEDRUN: 'Round 5 Speedrun',
    ROUND_15_SPEEDRUN: 'Round 15 Speedrun',
    ROUND_30_SPEEDRUN: 'Round 30 Speedrun',
    ROUND_50_SPEEDRUN: 'Round 50 Speedrun',
    ROUND_70_SPEEDRUN: 'Round 70 Speedrun',
    ROUND_100_SPEEDRUN: 'Round 100 Speedrun',
    ROUND_255_SPEEDRUN: 'Round 255 Speedrun',
    EASTER_EGG_SPEEDRUN: 'EE Speedrun',
    BUYABLE_ENDING_SPEEDRUN: 'Buyable Ending Speedrun',
    NO_MANS_LAND: "No Man's Land",
    RUSH: 'Rush',
    EE_TIME: 'EE Time',
  };

  let worldRecords = 0;
  let verifiedWorldRecords = 0;
  const details: WorldRecordDetail[] = [];

  const processBucket = (
    key: BucketKey,
    entries: BucketEntry[],
    isSpeedrun: boolean,
    isEe: boolean
  ) => {
    if (entries.length === 0) return;
    const bestValue = entries.reduce((best, entry) => {
      if (isSpeedrun || isEe) return entry.value < best ? entry.value : best;
      return entry.value > best ? entry.value : best;
    }, entries[0]!.value);
    const bestEntries = entries.filter((entry) => entry.value === bestValue);
    const winnerUserIds = new Set<string>();
    for (const bestEntry of bestEntries) {
      winnerUserIds.add(bestEntry.userId);
      for (const teammateUserId of bestEntry.log.teammateUserIds ?? []) {
        if (teammateUserId) winnerUserIds.add(teammateUserId);
      }
    }
    if (!winnerUserIds.has(userId)) return;
    const isVerifiedLeaderboard = isVerifiedOnlyLeaderboardKey(key);
    if (isVerifiedLeaderboard) verifiedWorldRecords++;
    else worldRecords++;
    const [prefix, filterKey] = key.includes('::') ? key.split('::') : [key, ''];
    const [, mapId, , playerCount] = prefix.split(':');
    const representativeLog = bestEntries[0]!.log;
    const mapMeta = mapById.get(mapId);
    if (!mapMeta) return;
    const challengeLabel = isEe
      ? representativeLog.easterEggName ?? 'EE Time'
      : representativeLog.challengeType === 'HIGHEST_ROUND'
        ? 'Highest Round'
        : challengeTypeLabels[representativeLog.challengeType] ?? representativeLog.challengeName;
    details.push({
      mapSlug: mapMeta.slug,
      mapName: mapMeta.name,
      challengeLabel,
      playerCount: playerCount as PlayerCount,
      filters: getFilterLabels(filterKey),
      isVerified: bestEntries.some((entry) => entry.isVerified),
      isVerifiedLeaderboard,
    });
  };

  for (const [key, entries] of Array.from(challengeBuckets.entries())) {
    const ct = entries[0]?.log.challengeType ?? '';
    const isSpeedrun = isSpeedrunCategory(ct);
    if (ct === 'HIGHEST_ROUND') continue;
    processBucket(key, entries, isSpeedrun, false);
  }

  for (const [key, entries] of Array.from(eeBuckets.entries())) {
    processBucket(key, entries, true, true);
  }

  for (const [key, data] of Array.from(hrByKey.entries())) {
    const winnerUserIds = new Set<string>();
    for (const entry of data.entries) {
      winnerUserIds.add(entry.userId);
      for (const teammateUserId of entry.log.teammateUserIds ?? []) {
        if (teammateUserId) winnerUserIds.add(teammateUserId);
      }
    }
    if (!winnerUserIds.has(userId)) continue;
    const isVerifiedLeaderboard = isVerifiedOnlyLeaderboardKey(key);
    if (isVerifiedLeaderboard) verifiedWorldRecords++;
    else worldRecords++;
    const [prefix, filterKey] = key.includes('::') ? key.split('::') : [key, ''];
    const [, mapId, , playerCount] = prefix.split(':');
    const mapMeta = mapById.get(mapId);
    const isVerified = data.entries.some((entry) => entry.isVerified);
    if (mapMeta) {
      details.push({
        mapSlug: mapMeta.slug,
        mapName: mapMeta.name,
        challengeLabel: 'Highest Round',
        playerCount: playerCount as PlayerCount,
        filters: getFilterLabels(filterKey),
        isVerified,
        isVerifiedLeaderboard,
      });
    }
  }

  return { worldRecords, verifiedWorldRecords, details };
}
