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
import type { PlayerCount } from '@prisma/client';

export type WorldRecordsResult = { worldRecords: number; verifiedWorldRecords: number };

export type WorldRecordDetail = {
  mapSlug: string;
  mapName: string;
  challengeLabel: string;
  playerCount: PlayerCount;
  filters: string[];
  isVerified: boolean;
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
  bo7SupportMode?: string | null;
  bo7IsCursedRun?: boolean | null;
  bo7RelicsUsed?: string[];
  useFortuneCards?: boolean | null;
  useDirectorsCut?: boolean | null;
  wawNoJug?: boolean | null;
  wawFixedWunderwaffe?: boolean | null;
  bo2BankUsed?: boolean | null;
  rampageInducerUsed?: boolean | null;
  ww2ConsumablesUsed?: boolean | null;
};

/** Serialize game filters for a run into a key fragment. Returns all key fragments this run belongs to (exact + no-filter). */
function getFilterKeyVariants(log: LogWithMeta, gameShortName: string, mapSlug?: string): string[] {
  const variants: string[] = [];
  // Always include "no filter" (empty) - run appears in the base leaderboard
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
  if (isBo7Game(gameShortName)) {
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
    else labels.push(`${k}: ${v}`);
  }
  return labels;
}

/** Compute world records across all leaderboard combinations (player count, game filters, verified) and optional details */
export async function computeWorldRecords(userId: string): Promise<WorldRecordsResult> {
  const r = await computeWorldRecordsDetailed(userId);
  return { worldRecords: r.worldRecords, verifiedWorldRecords: r.verifiedWorldRecords };
}

export async function computeWorldRecordsDetailed(userId: string): Promise<WorldRecordsDetailedResult> {
  const maps = await prisma.map.findMany({
    select: { id: true, slug: true, name: true, game: { select: { shortName: true } } },
  });
  const mapById = new Map(maps.map((m) => [m.id, { slug: m.slug, name: m.name, gameShortName: m.game.shortName }]));

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
      isVerified: true,
      playerCount: true,
      difficulty: true,
      ww2ConsumablesUsed: true,
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
      ww2ConsumablesUsed: true,
      easterEgg: { select: { name: true } },
      map: { select: { slug: true, name: true, game: { select: { shortName: true } } } },
    },
  });

  // Game filter columns from schema (ChallengeLog)
  const clRaw = challengeLogs as unknown as Array<{
    bo3GobbleGumMode?: string | null;
    bo3AatUsed?: boolean | null;
    bo4ElixirMode?: string | null;
    bocwSupportMode?: string | null;
    bo6GobbleGumMode?: string | null;
    bo6SupportMode?: string | null;
    bo7SupportMode?: string | null;
    bo7IsCursedRun?: boolean | null;
    bo7RelicsUsed?: string[];
    useFortuneCards?: boolean | null;
    useDirectorsCut?: boolean | null;
    wawNoJug?: boolean | null;
    wawFixedWunderwaffe?: boolean | null;
    bo2BankUsed?: boolean | null;
    rampageInducerUsed?: boolean | null;
    ww2ConsumablesUsed?: boolean | null;
  }>;

  const eeRaw = eeLogs as unknown as Array<{
    rampageInducerUsed?: boolean | null;
    ww2ConsumablesUsed?: boolean | null;
  }>;

  const toLog = (
    log: typeof challengeLogs[0] | typeof eeLogs[0],
    type: 'challenge' | 'ee',
    raw: { rampageInducerUsed?: boolean | null } & Record<string, unknown>
  ): LogWithMeta => {
    const mapMeta = mapById.get(log.mapId);
    if (!mapMeta) return null as unknown as LogWithMeta;
    if (type === 'challenge') {
      const c = log as typeof challengeLogs[0];
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
        bo7SupportMode: r.bo7SupportMode,
        bo7IsCursedRun: r.bo7IsCursedRun,
        bo7RelicsUsed: r.bo7RelicsUsed,
        useFortuneCards: r.useFortuneCards,
        useDirectorsCut: r.useDirectorsCut,
        wawNoJug: r.wawNoJug,
        wawFixedWunderwaffe: r.wawFixedWunderwaffe,
        bo2BankUsed: r.bo2BankUsed,
        rampageInducerUsed: r.rampageInducerUsed,
        ww2ConsumablesUsed: r.ww2ConsumablesUsed,
      };
    } else {
      const e = log as typeof eeLogs[0];
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
        ww2ConsumablesUsed: r.ww2ConsumablesUsed,
        difficulty: (e as { difficulty?: string | null }).difficulty ?? null,
      };
    }
  };

  type BucketKey = string;
  type BucketEntry = { userId: string; value: number; isVerified: boolean; log: LogWithMeta };
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

  // Highest Round: merge challenge + EE rounds (map-specific, only for HIGHEST_ROUND)
  const hrChallengeLogs = challengeLogs.filter((l) => (l.challenge?.type ?? '') === 'HIGHEST_ROUND');
  const hrEeLogs = eeLogs.filter((e) => (e as { roundCompleted?: number | null }).roundCompleted != null);
  const hrByKey = new Map<string, { userId: string; round: number; isVerified: boolean; log: LogWithMeta }>();
  for (const e of hrEeLogs) {
    const round = (e as { roundCompleted?: number | null }).roundCompleted;
    if (round == null) continue;
    const mapMeta = mapById.get(e.mapId);
    if (!mapMeta) continue;
    const log = toLog(e, 'ee', eeRaw[eeLogs.indexOf(e)] ?? {});
    if (!log) continue;
    (log as LogWithMeta & { roundReached: number }).roundReached = round;
    const raw = eeRaw[eeLogs.indexOf(e)] ?? {};
    const filterVariants = getFilterKeyVariants(log, mapMeta.gameShortName, mapMeta.slug);
    for (const fv of filterVariants) {
      for (const verifiedView of [true, false]) {
        if (verifiedView && !e.isVerified) continue;
        const key = `hr:${e.mapId}:${e.playerCount}:${verifiedView}::${fv}`;
        const existing = hrByKey.get(key);
        if (!existing || round > existing.round) {
          hrByKey.set(key, {
            userId: e.userId,
            round,
            isVerified: e.isVerified ?? false,
            log: { ...log, roundReached: round },
          });
        }
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
        const existing = hrByKey.get(key);
        const round = log.roundReached;
        if (!existing || round > existing.round) {
          hrByKey.set(key, {
            userId: c.userId,
            round,
            isVerified: c.isVerified ?? false,
            log,
          });
        }
      }
    }
  }

  const challengeTypeLabels: Record<string, string> = {
    HIGHEST_ROUND: 'Highest Round',
    NO_DOWNS: 'No Downs',
    ONE_BOX: 'One Box',
    PISTOL_ONLY: 'Pistol Only',
    NO_POWER: 'No Power',
    NO_PACK: 'No Pack-a-Punch',
    STARTING_ROOM: 'Starting Room',
    ROUND_30_SPEEDRUN: 'Round 30 Speedrun',
    ROUND_50_SPEEDRUN: 'Round 50 Speedrun',
    ROUND_70_SPEEDRUN: 'Round 70 Speedrun',
    ROUND_100_SPEEDRUN: 'Round 100 Speedrun',
    ROUND_255_SPEEDRUN: 'Round 255 Speedrun',
    EASTER_EGG_SPEEDRUN: 'EE Speedrun',
    NO_MANS_LAND: "No Man's Land",
    RUSH: 'Rush',
    EE_TIME: 'EE Time',
  };

  let worldRecords = 0;
  let verifiedWorldRecords = 0;
  const details: WorldRecordDetail[] = [];

  const playerCountLabel: Record<string, string> = {
    SOLO: 'Solo',
    DUO: 'Duo',
    TRIO: 'Trio',
    SQUAD: 'Squad',
  };

  const processBucket = (
    key: BucketKey,
    entries: BucketEntry[],
    isSpeedrun: boolean,
    isEe: boolean
  ) => {
    if (entries.length === 0) return;
    const best = isSpeedrun || isEe
      ? entries.reduce((a, b) => (a.value <= b.value ? a : b))
      : entries.reduce((a, b) => (a.value >= b.value ? a : b));
    if (best.userId !== userId) return;
    worldRecords++;
    if (best.isVerified) verifiedWorldRecords++;
    const [prefix, filterKey] = key.includes('::') ? key.split('::') : [key, ''];
    const [, mapId, , playerCount] = prefix.split(':');
    const log = best.log;
    const mapMeta = mapById.get(mapId);
    if (!mapMeta) return;
    const challengeLabel = isEe ? log.easterEggName ?? 'EE Time' : log.challengeType === 'HIGHEST_ROUND' ? 'Highest Round' : challengeTypeLabels[log.challengeType] ?? log.challengeName;
    details.push({
      mapSlug: mapMeta.slug,
      mapName: mapMeta.name,
      challengeLabel,
      playerCount: playerCount as PlayerCount,
      filters: getFilterLabels(filterKey),
      isVerified: best.isVerified,
    });
  };

  for (const [key, entries] of Array.from(challengeBuckets.entries())) {
    const isHr = key.includes(':HIGHEST_ROUND') || false;
    const ct = entries[0]?.log.challengeType ?? '';
    const isSpeedrun = isSpeedrunCategory(ct);
    const isNoMansLand = ct === 'NO_MANS_LAND';
    const isRush = ct === 'RUSH';
    if (ct === 'HIGHEST_ROUND') continue; // handled by hrByKey
    processBucket(key, entries, isSpeedrun, false);
  }

  for (const [key, entries] of Array.from(eeBuckets.entries())) {
    processBucket(key, entries, true, true);
  }

  for (const [key, data] of Array.from(hrByKey.entries())) {
    if (data.userId !== userId) continue;
    worldRecords++;
    if (data.isVerified) verifiedWorldRecords++;
    const [prefix, filterKey] = key.includes('::') ? key.split('::') : [key, ''];
    const [, mapId, , playerCount] = prefix.split(':');
    const mapMeta = mapById.get(mapId);
    if (mapMeta) {
      details.push({
        mapSlug: mapMeta.slug,
        mapName: mapMeta.name,
        challengeLabel: 'Highest Round',
        playerCount: playerCount as PlayerCount,
        filters: getFilterLabels(filterKey),
        isVerified: data.isVerified,
      });
    }
  }

  return { worldRecords, verifiedWorldRecords, details };
}
