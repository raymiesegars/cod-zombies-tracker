/**
 * Advanced Warfare Exo Zombies map configuration: challenge types, WRs.
 * Maps: Outbreak, Infection, Carrier, Descent.
 * DOUBLE_FEATURE is Descent-only.
 */

import type { ChallengeType } from '@prisma/client';

function min(s: number) { return s * 60; }
function hms(h: number, m: number, s: number) { return h * 3600 + m * 60 + s; }
function h(hours: number) { return hours * 3600; }

export type AwMapSlug = 'aw-outbreak' | 'aw-infection' | 'aw-carrier' | 'aw-descent';

export type AwMapConfig = {
  challengeTypes: ChallengeType[];
  hasNoPower: boolean;
  hasFirstRoom: boolean;
  speedrunWRs: {
    r30?: number;
    r50?: number;
    r70?: number;
    r100?: number;
  } | null;
  eeSpeedrunWR?: number;
  highRoundWR: number;
  noDownsWR: number;
  firstRoomWR?: number;
  noPowerWR?: number;
  noExoSuitWR?: number;
  noExoHealthWR?: number;
  doubleFeatureWR?: number; // Descent only
};

export const AW_MAP_CONFIG: Record<AwMapSlug, AwMapConfig> = {
  'aw-outbreak': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'NO_POWER',
      'NO_EXO_SUIT', 'NO_EXO_HEALTH',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    hasFirstRoom: true,
    speedrunWRs: {
      r30: min(27) + 48,
      r50: hms(1, 7, 33),
      r70: h(3),
      r100: h(9),
    },
    eeSpeedrunWR: min(9),
    highRoundWR: 174,
    noDownsWR: 153,
    firstRoomWR: 40,
    noPowerWR: 50,
    noExoSuitWR: 51,
    noExoHealthWR: 94,
  },
  'aw-infection': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'NO_POWER',
      'NO_EXO_SUIT', 'NO_EXO_HEALTH',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    hasFirstRoom: true,
    speedrunWRs: {
      r30: min(34),
      r50: hms(1, 41, 40),
      r70: hms(4, 24, 40),
      r100: hms(12, 30, 40),
    },
    eeSpeedrunWR: min(12) + 40,
    highRoundWR: 146,
    noDownsWR: 103,
    firstRoomWR: 40,
    noPowerWR: 48,
    noExoSuitWR: 41,
    noExoHealthWR: 66,
  },
  'aw-carrier': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'NO_POWER',
      'NO_EXO_SUIT', 'NO_EXO_HEALTH',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    hasFirstRoom: true,
    speedrunWRs: {
      r30: min(29),
      r50: hms(1, 23, 40),
      r70: h(5),
      r100: hms(14, 20, 20),
    },
    eeSpeedrunWR: min(26),
    highRoundWR: 131,
    noDownsWR: 87,
    firstRoomWR: 30,
    noPowerWR: 38,
    noExoSuitWR: 40,
    noExoHealthWR: 52,
  },
  'aw-descent': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'NO_POWER',
      'NO_EXO_SUIT', 'NO_EXO_HEALTH', 'DOUBLE_FEATURE',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    hasFirstRoom: true,
    speedrunWRs: {
      r30: min(35) + 40,
      r50: hms(1, 20, 40),
      r70: hms(4, 50, 40),
      r100: hms(25, 20, 40),
    },
    eeSpeedrunWR: min(43) + 21,
    highRoundWR: 106,
    noDownsWR: 68,
    firstRoomWR: 41,
    noPowerWR: 41,
    noExoSuitWR: 42,
    noExoHealthWR: 53,
    doubleFeatureWR: 64,
  },
};

export const AW_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  NO_EXO_SUIT: 'No Exo Suit',
  NO_EXO_HEALTH: 'No Exo Health',
  DOUBLE_FEATURE: 'Double Feature',
};

export function getAwChallengeTypeLabel(type: string): string {
  return AW_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getAwMapConfig(slug: string): AwMapConfig | null {
  return (AW_MAP_CONFIG as Record<string, AwMapConfig>)[slug] ?? null;
}

export function isAwMap(slug: string): slug is AwMapSlug {
  return slug in AW_MAP_CONFIG;
}

const BASE_REQUIRED_ROUNDS = [20, 30, 50, 70, 100] as const;
const BASE_XP_BY_ROUND: Record<number, number> = {
  20: 50, 30: 150, 50: 320, 70: 580, 100: 1000,
};

function buildWrBasedRounds(wr: number, tierCount = 6): { round: number; xp: number }[] {
  if (wr <= 0) return [];
  const baseEntries = (BASE_REQUIRED_ROUNDS as readonly number[]).filter((r) => r <= wr).map((r) => ({ round: r, xp: BASE_XP_BY_ROUND[r] ?? 50 }));
  const minRound = Math.min(20, Math.floor(wr * 0.02));
  const rounds: number[] = [];
  for (let i = 0; i < tierCount; i++) {
    const ratio = (i + 1) / (tierCount + 1);
    rounds.push(Math.min(Math.round(minRound + (wr - minRound) * Math.pow(ratio, 1.2)), wr));
  }
  const wrBased = Array.from(new Set(rounds)).sort((a, b) => a - b);
  const wrEntries = wrBased.filter((r) => r > 100).map((round) => {
    const ratio = round / wr;
    const xp = Math.round(50 + 2450 * Math.pow(ratio, 2));
    return { round, xp: Math.min(xp, 2500) };
  });
  const combined = [...baseEntries, ...wrEntries].sort((a, b) => a.round - b.round);
  return combined;
}

export function getAwRoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}
