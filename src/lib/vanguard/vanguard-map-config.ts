/**
 * Vanguard Zombies map configuration: challenge types, WRs.
 * Void filter applies to der-anfang and terra-maledicta only.
 * Rampage Inducer applies to shi-no-numa-reborn and the-archon only.
 */

import type { ChallengeType } from '@prisma/client';

function min(s: number) { return s * 60; }
function hms(h: number, m: number, s: number) { return h * 3600 + m * 60 + s; }
function h(hours: number) { return hours * 3600; }

export type VanguardMapSlug =
  | 'der-anfang'
  | 'terra-maledicta'
  | 'shi-no-numa-reborn'
  | 'the-archon';

export type VanguardMapConfig = {
  challengeTypes: ChallengeType[];
  hasNoPower?: boolean;
  hasFirstRoom: boolean;
  speedrunWRs: {
    r10?: number;
    r20?: number;
    r30?: number;
    r50?: number;
    r70?: number;
    r100?: number;
    r200?: number;
  } | null;
  /** No-rampage WR times (seconds) for speedrun split when number_ones has no variant-specific board. Slower than megas/ALL. */
  speedrunWRsNoRampage?: {
    r5?: number;
    r15?: number;
    r30?: number;
    r50?: number;
    r70?: number;
    r100?: number;
    r200?: number;
    exfilR10WR?: number;
    exfilR20WR?: number;
    eeSpeedrunWR?: number;
    buildEeSpeedrunWR?: number;
  } | null;
  exfilR5WR?: number;
  exfilR10WR?: number;
  exfilR20WR?: number;
  eeSpeedrunWR?: number;
  buildEeSpeedrunWR?: number;
  highRoundWR: number;
  noDownsWR: number;
  firstRoomWR?: number;
  noPerksWR?: number;
  noArmorWR?: number;
  noJugWR?: number;
};

export const VANGUARD_MAP_CONFIG: Record<VanguardMapSlug, VanguardMapConfig> = {
  'der-anfang': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_JUG', 'NO_DOWNS', 'NO_PERKS', 'NO_ARMOR',
      'ROUND_10_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'EXFIL_R5_SPEEDRUN', 'EXFIL_R10_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasFirstRoom: false,
    speedrunWRs: {
      r10: min(21) + 30,
      r30: min(50),
    },
    exfilR5WR: min(8) + 40,
    exfilR10WR: min(12) + 40,
    eeSpeedrunWR: min(9),
    highRoundWR: 222,
    noDownsWR: 186,
    noPerksWR: 54,
    noArmorWR: undefined, // Not in original WR list
    noJugWR: 81,
  },
  'terra-maledicta': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_JUG', 'NO_DOWNS', 'NO_PERKS', 'NO_ARMOR',
      'ROUND_10_SPEEDRUN', 'ROUND_20_SPEEDRUN', 'EXFIL_R5_SPEEDRUN', 'EXFIL_R10_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasFirstRoom: false,
    speedrunWRs: {
      r10: min(21),
      r20: min(50),
    },
    exfilR5WR: min(9),
    exfilR10WR: min(20),
    eeSpeedrunWR: min(21),
    highRoundWR: 186,
    noDownsWR: 181,
    noPerksWR: 92,
    noArmorWR: 160,
    noJugWR: 146,
  },
  'shi-no-numa-reborn': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_JUG', 'NO_DOWNS', 'NO_PERKS', 'NO_ARMOR',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN',
      'EXFIL_R10_SPEEDRUN', 'EXFIL_R20_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN', 'BUILD_EE_SPEEDRUN',
      'STARTING_ROOM',
    ],
    hasFirstRoom: true,
    speedrunWRs: {
      r30: min(16) + 30,
      r50: min(38),
      r70: hms(1, 2, 48),
      r100: h(2),
      r200: h(6),
    },
    speedrunWRsNoRampage: {
      r30: min(19) + 2,
      r50: min(43) + 42,
      r70: hms(1, 12, 12),
      r100: h(2) + min(18),
      r200: h(6) + min(54),
      exfilR10WR: min(5) + 17,
      exfilR20WR: min(10) + 50,
      eeSpeedrunWR: min(19) + 2,
      buildEeSpeedrunWR: min(28) + 20,
    },
    exfilR10WR: min(4) + 30,
    exfilR20WR: min(9) + 30,
    eeSpeedrunWR: min(16) + 30,
    buildEeSpeedrunWR: min(24) + 30,
    highRoundWR: 960,
    noDownsWR: 400,
    firstRoomWR: 35,
    noPerksWR: 303,
    noArmorWR: 174,
    noJugWR: 365,
  },
  'the-archon': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_JUG', 'NO_DOWNS', 'NO_PERKS', 'NO_ARMOR',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN',
      'EXFIL_R10_SPEEDRUN', 'EXFIL_R20_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
      'STARTING_ROOM',
    ],
    hasFirstRoom: true,
    speedrunWRs: {
      r30: min(15) + 42,
      r50: min(34),
      r70: min(49),
      r100: hms(1, 35, 40),
      r200: hms(3, 20, 40),
    },
    speedrunWRsNoRampage: {
      r15: Math.round(353 * 1.15),
      r30: min(18) + 3,
      r50: min(39) + 6,
      r70: min(56) + 24,
      r100: hms(1, 50, 30),
      r200: hms(3, 51, 0),
      exfilR10WR: min(4) + 53,
      exfilR20WR: min(11) + 20,
      eeSpeedrunWR: min(27) + 36,
    },
    exfilR10WR: min(4) + 20,
    exfilR20WR: min(9) + 40,
    eeSpeedrunWR: min(24),
    highRoundWR: 994,
    noDownsWR: 675,
    firstRoomWR: 40,
    noPerksWR: 900,
    noArmorWR: 330,
    noJugWR: 900,
  },
};

export const VANGUARD_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  EXFIL_R5_SPEEDRUN: 'Exfil Round 5 Speedrun',
  EXFIL_R10_SPEEDRUN: 'Exfil Round 10 Speedrun',
  EXFIL_R20_SPEEDRUN: 'Exfil Round 20 Speedrun',
};

export function getVanguardChallengeTypeLabel(type: string): string {
  return VANGUARD_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getVanguardMapConfig(slug: string): VanguardMapConfig | null {
  return (VANGUARD_MAP_CONFIG as Record<string, VanguardMapConfig>)[slug] ?? null;
}

export function isVanguardMap(slug: string): slug is VanguardMapSlug {
  return slug in VANGUARD_MAP_CONFIG;
}

const BASE_REQUIRED_ROUNDS = [10, 20, 30, 50, 70, 100] as const;
const BASE_XP_BY_ROUND: Record<number, number> = {
  10: 50, 20: 90, 30: 150, 50: 320, 70: 580, 100: 1000,
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

export function getVanguardRoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}
