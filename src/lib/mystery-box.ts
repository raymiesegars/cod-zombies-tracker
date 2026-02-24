/**
 * Mystery Box: token accrual, roll logic, XP scaling.
 * Token: 1 per 24h, cap 3.
 * XP: 5–100 based on filters + round accomplished.
 */

import prisma from '@/lib/prisma';
import { isSpeedrunCategory } from '@/lib/achievements/categories';
import { getMilestonesForChallengeType } from '@/lib/achievements/milestones';
import { hasNoJugSupport } from '@/lib/no-jug-support';
import { hasFirstRoomVariantFilter, getFirstRoomVariantsForMap } from '@/lib/first-room-variants';
import { getBo2MapConfig } from '@/lib/bo2/bo2-map-config';
import { BO3_GOBBLEGUM_MODES } from '@/lib/bo3';
import { BOCW_SUPPORT_MODES } from '@/lib/bocw';
import { BO6_GOBBLEGUM_MODES, BO6_SUPPORT_MODES } from '@/lib/bo6';
import { BO7_SUPPORT_MODES, BO7_RELICS } from '@/lib/bo7';
import { hasVanguardVoidFilter, hasVanguardRampageFilter } from '@/lib/vanguard';

const TOKEN_CAP = 3;
const TOKEN_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h
const XP_MIN = 5;
const XP_MAX = 100;
const XP_BASE_NO_FILTERS = 50;

export type MysteryBoxFilterSettings = {
  excludedGameIds?: string[];
  excludeSpeedruns?: boolean;
  maxRound?: number; // e.g. 50 = no challenges over round 50
};

export type MysteryBoxTags = {
  wawNoJug?: boolean;
  wawFixedWunderwaffe?: boolean;
  firstRoomVariant?: string;
  [key: string]: unknown;
};

/** Accrue tokens if 24h passed and under cap. Returns updated tokens + next token timestamp. */
export async function accrueAndGetTokens(userId: string): Promise<{
  tokens: number;
  nextTokenAt: Date | null;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mysteryBoxTokens: true, mysteryBoxLastTokenAt: true },
  });
  if (!user) return { tokens: 0, nextTokenAt: null };

  let tokens = user.mysteryBoxTokens ?? 0;
  const lastAt = user.mysteryBoxLastTokenAt;
  const now = new Date();

  // Accrue up to cap
  while (tokens < TOKEN_CAP) {
    const ref = lastAt ? new Date(lastAt.getTime() + (tokens * TOKEN_INTERVAL_MS)) : now;
    const nextEligible = new Date(ref.getTime() + TOKEN_INTERVAL_MS);
    if (now.getTime() < nextEligible.getTime()) break;
    tokens += 1;
    await prisma.user.update({
      where: { id: userId },
      data: {
        mysteryBoxTokens: tokens,
        mysteryBoxLastTokenAt: lastAt ? new Date(lastAt.getTime() + TOKEN_INTERVAL_MS) : now,
      },
    });
  }

  // Clamp (in case of inconsistency)
  tokens = Math.min(tokens, TOKEN_CAP);

  // Re-fetch to get accurate lastTokenAt (updated by accrual loop)
  let updated = await prisma.user.findUnique({
    where: { id: userId },
    select: { mysteryBoxLastTokenAt: true },
  });

  // Backfill: if we have tokens but no lastTokenAt (e.g. admin grant), set it so we can show a countdown
  if (tokens > 0 && tokens < TOKEN_CAP && !updated?.mysteryBoxLastTokenAt) {
    await prisma.user.update({
      where: { id: userId },
      data: { mysteryBoxLastTokenAt: now },
    });
    updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { mysteryBoxLastTokenAt: true },
    });
  }

  const effectiveLastAt = updated?.mysteryBoxLastTokenAt ?? null;
  const nextTokenAt =
    tokens < TOKEN_CAP && effectiveLastAt
      ? new Date(effectiveLastAt.getTime() + TOKEN_INTERVAL_MS)
      : null;

  return { tokens, nextTokenAt };
}

/** Spend 1 token. Returns false if no tokens. */
export async function spendToken(userId: string): Promise<boolean> {
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { mysteryBoxTokens: true },
    });
    if (!user || (user.mysteryBoxTokens ?? 0) < 1) return false;
    await tx.user.update({
      where: { id: userId },
      data: { mysteryBoxTokens: { decrement: 1 } },
    });
    return true;
  });
  return result;
}

/**
 * Base XP from filter restrictiveness.
 * No filters ≈ 50 XP. More restrictive = less XP (min 5).
 */
export function getBaseXpFromFilters(settings: MysteryBoxFilterSettings | null): number {
  if (!settings || Object.keys(settings).length === 0) return XP_BASE_NO_FILTERS;
  const excludedGames = (settings.excludedGameIds ?? []).length;
  const excludeSpeedruns = settings.excludeSpeedruns === true ? 1 : 0;
  const hasMaxRound = typeof settings.maxRound === 'number' && settings.maxRound > 0 ? 1 : 0;
  const filterCount = excludedGames + excludeSpeedruns + hasMaxRound;
  if (filterCount === 0) return XP_BASE_NO_FILTERS;
  // More filters = lower base (5–50)
  const base = Math.max(XP_MIN, XP_BASE_NO_FILTERS - filterCount * 12);
  return base;
}

/**
 * Round bonus: 0–50 extra XP based on round accomplished.
 * roundReached 1–100 maps to 0–50 extra.
 */
function getRoundBonus(roundReached: number): number {
  const clamped = Math.min(100, Math.max(1, roundReached));
  return Math.round((clamped / 100) * (XP_MAX - XP_BASE_NO_FILTERS));
}

/**
 * Total XP: base (from filters) + round bonus, capped at 100.
 */
export function computeMysteryBoxXp(
  filterSettings: MysteryBoxFilterSettings | null,
  roundReached: number
): number {
  const base = getBaseXpFromFilters(filterSettings);
  const bonus = getRoundBonus(roundReached);
  return Math.min(XP_MAX, Math.max(XP_MIN, base + bonus));
}

/**
 * XP multiplier as percentage (10-100). No filters = 100%, more restrictive = lower.
 */
export function getMysteryBoxXpMultiplierPercent(settings: MysteryBoxFilterSettings | null): number {
  const base = getBaseXpFromFilters(settings);
  return Math.round((base / XP_BASE_NO_FILTERS) * 100);
}

/**
 * XP range for display: min at round 1, max at round 100.
 */
export function getMysteryBoxXpRange(filterSettings: MysteryBoxFilterSettings | null): { min: number; max: number } {
  const base = getBaseXpFromFilters(filterSettings);
  const min = Math.min(XP_MAX, Math.max(XP_MIN, base));
  const maxBonus = getRoundBonus(100);
  const max = Math.min(XP_MAX, Math.max(XP_MIN, base + maxBonus));
  return { min, max };
}

/** Check if challenge type is a speedrun (for filter excludeSpeedruns). */
export function isSpeedrunType(type: string): boolean {
  return isSpeedrunCategory(type);
}

/** Get min round for a challenge type (for maxRound filter). */
export function getMinRoundForChallengeType(type: string): number {
  const speedrunRounds: Record<string, number> = {
    ROUND_5_SPEEDRUN: 5, ROUND_10_SPEEDRUN: 10, ROUND_15_SPEEDRUN: 15, ROUND_20_SPEEDRUN: 20,
    ROUND_30_SPEEDRUN: 30, ROUND_50_SPEEDRUN: 50, ROUND_70_SPEEDRUN: 70, ROUND_100_SPEEDRUN: 100,
    ROUND_200_SPEEDRUN: 200, ROUND_255_SPEEDRUN: 255, ROUND_935_SPEEDRUN: 935, ROUND_999_SPEEDRUN: 999,
    EXFIL_SPEEDRUN: 11, EXFIL_R21_SPEEDRUN: 21, EXFIL_R5_SPEEDRUN: 5, EXFIL_R10_SPEEDRUN: 10, EXFIL_R20_SPEEDRUN: 20,
    SUPER_30_SPEEDRUN: 30, BUILD_EE_SPEEDRUN: 1, EASTER_EGG_SPEEDRUN: 1, INSTAKILL_ROUND_SPEEDRUN: 1,
  };
  return speedrunRounds[type] ?? 1;
}

/** @internal Used by pickRandomRoll */
function getMinRoundForType(type: string): number {
  return getMinRoundForChallengeType(type);
}

/** Human-readable round range for a challenge type (lowest-highest, for mystery box roll display). */
export function getChallengeRangeDisplay(type: string): string {
  if (isSpeedrunType(type)) {
    const round = getMinRoundForChallengeType(type);
    return `Round ${round}`;
  }
  const config = getMilestonesForChallengeType(type as import('@prisma/client').ChallengeType);
  if (config?.rounds?.length) {
    const rounds = config.rounds as readonly number[];
    const lo = rounds[0]!;
    const hi = rounds[rounds.length - 1]!;
    return lo === hi ? `Round ${lo}` : `Round ${lo}-${hi}`;
  }
  return 'Round 1+';
}

export type MysteryBoxRollResult = {
  gameId: string;
  mapId: string;
  challengeId: string;
  tags?: MysteryBoxTags;
};

/**
 * Pick a random game/map/challenge that matches the filter settings.
 * Excludes NO_JUG (display-only challenge).
 */
export async function pickRandomRoll(
  settings: MysteryBoxFilterSettings | null
): Promise<MysteryBoxRollResult | null> {
  const excludedIds = new Set(settings?.excludedGameIds ?? []);
  const excludeSpeedruns = settings?.excludeSpeedruns === true;
  const maxRound = typeof settings?.maxRound === 'number' && settings.maxRound > 0 ? settings.maxRound : null;

  const challenges = await prisma.challenge.findMany({
    where: {
      isActive: true,
      type: { not: 'NO_JUG' },
      mapId: { not: null },
      ...(excludedIds.size > 0 && {
        map: { gameId: { notIn: Array.from(excludedIds) } },
      }),
    },
    include: {
      map: { include: { game: true } },
    },
  });

  let filtered = challenges;
  if (excludeSpeedruns) {
    filtered = filtered.filter((c) => !isSpeedrunType(c.type));
  }
  if (maxRound != null) {
    filtered = filtered.filter((c) => getMinRoundForType(c.type) <= maxRound);
  }

  if (filtered.length === 0) return null;
  const chosen = filtered[Math.floor(Math.random() * filtered.length)]!;
  const map = chosen.map!;
  const game = map.game!;
  const gs = game.shortName ?? '';
  const slug = map.slug ?? '';

  const tags: MysteryBoxTags = {};
  const r = () => Math.random();

  // WaW
  if (gs === 'WAW') {
    if (hasNoJugSupport(slug, gs) && r() < 0.35) tags.wawNoJug = true;
    if (slug === 'der-riese' && r() < 0.25) tags.wawFixedWunderwaffe = true;
  }

  // BO2 Bank (Tranzit, Die Rise, Buried)
  if (gs === 'BO2' && getBo2MapConfig(slug)?.hasBank && r() < 0.3) tags.bo2BankUsed = false;

  // First room variant (STARTING_ROOM only on verruckt, buried, aw-carrier)
  if (chosen.type === 'STARTING_ROOM' && hasFirstRoomVariantFilter(slug) && r() < 0.35) {
    const opts = getFirstRoomVariantsForMap(slug);
    if (opts?.length) tags.firstRoomVariant = opts[Math.floor(r() * opts.length)]!.value;
  }

  // IW: Fate only vs Fate+Fortune
  if (gs === 'IW' && r() < 0.35) tags.useFortuneCards = false;
  if (gs === 'IW' && r() < 0.15) tags.useDirectorsCut = true;

  // BO3: GobbleGums
  if (gs === 'BO3') {
    if (r() < 0.4) tags.bo3GobbleGumMode = (BO3_GOBBLEGUM_MODES as readonly string[])[Math.floor(r() * BO3_GOBBLEGUM_MODES.length)];
    if (r() < 0.2) tags.bo3AatUsed = false;
  }

  // BO4: Elixir mode (CLASSIC_ONLY vs ALL_ELIXIRS_TALISMANS)
  if (gs === 'BO4' && r() < 0.3) tags.bo4ElixirMode = r() < 0.5 ? 'CLASSIC_ONLY' : 'ALL_ELIXIRS_TALISMANS';

  // BOCW Support
  if (gs === 'BOCW' && r() < 0.35) tags.bocwSupportMode = (BOCW_SUPPORT_MODES as readonly string[])[Math.floor(r() * BOCW_SUPPORT_MODES.length)];

  // BO6
  if (gs === 'BO6') {
    if (r() < 0.3) tags.bo6GobbleGumMode = (BO6_GOBBLEGUM_MODES as readonly string[])[Math.floor(r() * BO6_GOBBLEGUM_MODES.length)];
    if (r() < 0.3) tags.bo6SupportMode = (BO6_SUPPORT_MODES as readonly string[])[Math.floor(r() * BO6_SUPPORT_MODES.length)];
  }

  // BO7
  if (gs === 'BO7') {
    if (r() < 0.35) tags.bo7SupportMode = (BO7_SUPPORT_MODES as readonly string[])[Math.floor(r() * BO7_SUPPORT_MODES.length)];
    if (r() < 0.2) {
      tags.bo7IsCursedRun = true;
      const n = 1 + Math.floor(r() * 3);
      const shuffled = [...BO7_RELICS].sort(() => r() - 0.5);
      tags.bo7RelicsUsed = shuffled.slice(0, n);
    }
  }

  // WW2 Consumables
  if (gs === 'WW2' && r() < 0.3) tags.ww2ConsumablesUsed = false;

  // Vanguard Void / Rampage
  if (gs === 'VANGUARD' && hasVanguardVoidFilter(slug) && r() < 0.3) tags.vanguardVoidUsed = false;
  if ((gs === 'BOCW' || gs === 'BO6' || gs === 'BO7') || (gs === 'VANGUARD' && hasVanguardRampageFilter(slug))) {
    if (r() < 0.25) tags.rampageInducerUsed = false;
  }

  return {
    gameId: game.id,
    mapId: map.id,
    challengeId: chosen.id,
    tags: Object.keys(tags).length > 0 ? tags : undefined,
  };
}
