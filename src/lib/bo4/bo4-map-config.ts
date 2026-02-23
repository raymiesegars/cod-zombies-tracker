/**
 * BO4 map configuration: challenge types, WRs per difficulty, speedruns, rush.
 * Used for leaderboard filters, achievement seed, and map-specific rules.
 */

import type { ChallengeType } from '@prisma/client';
import type { Bo4DifficultyType } from '../bo4';

export type Bo4MapSlug =
  | 'ix'
  | 'voyage-of-despair'
  | 'blood-of-the-dead'
  | 'classified'
  | 'dead-of-the-night'
  | 'ancient-evil'
  | 'alpha-omega'
  | 'tag-der-toten';

export type Bo4MapConfig = {
  challengeTypes: ChallengeType[];
  /** High round WR per difficulty (Purist is a challenge mode, not difficulty) */
  highRoundWR: Record<Bo4DifficultyType, number>;
  /** No downs WR per difficulty (0 = not tracked) */
  noDownsWR: Record<Bo4DifficultyType, number>;
  /** Speedrun WRs in seconds */
  speedrunWRs: {
    r30?: number;
    r50?: number;
    r70?: number;
    r100?: number;
    r200?: number;
    eeSpeedrunWR?: number;
    instakillRoundSpeedrunWR?: number;
  } | null;
  firstRoomWR?: number;
  noPowerWR?: number;
  noPerksWR?: number;
  /** Rush WR (score) */
  rushWR?: number;
  /** Purist challenge WR (round-based, map-specific stricter rules) */
  puristWR?: number;
};

function min(s: number) { return s * 60; }
function hms(h: number, m: number, s: number) { return h * 3600 + m * 60 + s; }
function h(hours: number) { return hours * 3600; }

export const BO4_MAP_CONFIG: Record<Bo4MapSlug, Bo4MapConfig> = {
  ix: {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'RUSH', 'PURIST', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: { CASUAL: 0, NORMAL: 304, HARDCORE: 142, REALISTIC: 52 },
    noDownsWR: { CASUAL: 0, NORMAL: 299, HARDCORE: 142, REALISTIC: 0 },
    speedrunWRs: { r30: min(23), r50: min(47), r70: hms(1, 13, 30), r100: hms(2, 20, 40), r200: h(20), eeSpeedrunWR: min(34) },
    firstRoomWR: 65, noPowerWR: 190, noPerksWR: 101, rushWR: 1782651900, puristWR: 125,
  },
  'voyage-of-despair': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'RUSH', 'PURIST', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: { CASUAL: 0, NORMAL: 283, HARDCORE: 227, REALISTIC: 36 },
    noDownsWR: { CASUAL: 0, NORMAL: 212, HARDCORE: 221, REALISTIC: 0 },
    speedrunWRs: { r30: min(30), r50: min(58), r70: hms(1, 42, 0), r100: hms(3, 40, 40), r200: h(30), eeSpeedrunWR: min(38) },
    firstRoomWR: 61, noPowerWR: 80, noPerksWR: 128, rushWR: 686257410, puristWR: 96,
  },
  'blood-of-the-dead': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'RUSH', 'PURIST', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'INSTAKILL_ROUND_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: { CASUAL: 0, NORMAL: 451, HARDCORE: 274, REALISTIC: 167 },
    noDownsWR: { CASUAL: 0, NORMAL: 430, HARDCORE: 361, REALISTIC: 0 },
    speedrunWRs: { r30: hms(0, 26, 30), r50: min(52), r70: hms(1, 21, 40), r100: hms(2, 32, 40), r200: h(21), instakillRoundSpeedrunWR: h(24), eeSpeedrunWR: hms(0, 43, 40) },
    firstRoomWR: 57, noPowerWR: 67, noPerksWR: 170, rushWR: 6502834992, puristWR: 169,
  },
  classified: {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'RUSH', 'PURIST', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: { CASUAL: 0, NORMAL: 274, HARDCORE: 226, REALISTIC: 51 },
    noDownsWR: { CASUAL: 0, NORMAL: 255, HARDCORE: 226, REALISTIC: 0 },
    speedrunWRs: { r30: min(26), r50: min(50), r70: hms(1, 23, 40), r100: hms(2, 51, 0), r200: h(41), eeSpeedrunWR: hms(0, 7, 30) },
    firstRoomWR: 53, noPowerWR: 87, noPerksWR: 132, rushWR: 757561410, puristWR: 144,
  },
  'dead-of-the-night': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'RUSH', 'PURIST', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'INSTAKILL_ROUND_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: { CASUAL: 0, NORMAL: 420, HARDCORE: 262, REALISTIC: 72 },
    noDownsWR: { CASUAL: 0, NORMAL: 345, HARDCORE: 220, REALISTIC: 0 },
    speedrunWRs: { r30: min(27), r50: min(55), r70: hms(1, 27, 40), r100: hms(2, 50, 40), r200: hms(18, 25, 40), instakillRoundSpeedrunWR: h(17), eeSpeedrunWR: min(26) },
    firstRoomWR: 38, noPowerWR: 51, noPerksWR: 160, rushWR: 1171180000, puristWR: 140,
  },
  'ancient-evil': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'RUSH', 'PURIST', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'INSTAKILL_ROUND_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: { CASUAL: 0, NORMAL: 410, HARDCORE: 257, REALISTIC: 147 },
    noDownsWR: { CASUAL: 0, NORMAL: 311, HARDCORE: 245, REALISTIC: 0 },
    speedrunWRs: { r30: min(28), r50: min(54), r70: hms(1, 30, 40), r100: hms(2, 55, 40), r200: h(20), instakillRoundSpeedrunWR: hms(10, 17, 2), eeSpeedrunWR: min(25) },
    firstRoomWR: 60, noPowerWR: 120, noPerksWR: 150, rushWR: 2805996696, puristWR: 163,
  },
  'alpha-omega': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'RUSH', 'PURIST', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: { CASUAL: 0, NORMAL: 304, HARDCORE: 175, REALISTIC: 59 },
    noDownsWR: { CASUAL: 0, NORMAL: 304, HARDCORE: 175, REALISTIC: 0 },
    speedrunWRs: { r30: min(24), r50: min(52), r70: hms(1, 30, 40), r100: hms(3, 25, 0), r200: h(25), eeSpeedrunWR: min(33) },
    firstRoomWR: 59, noPowerWR: 74, noPerksWR: 145, rushWR: 240586340, puristWR: 163,
  },
  'tag-der-toten': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'RUSH', 'PURIST', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'INSTAKILL_ROUND_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: { CASUAL: 0, NORMAL: 449, HARDCORE: 628, REALISTIC: 119 },
    noDownsWR: { CASUAL: 0, NORMAL: 406, HARDCORE: 628, REALISTIC: 0 },
    speedrunWRs: { r30: 19 * 60 + 33, r50: min(39), r70: h(1), r100: hms(1, 45, 0), r200: hms(9, 25, 40), instakillRoundSpeedrunWR: hms(7, 30, 0), eeSpeedrunWR: min(42) },
    firstRoomWR: 171, noPowerWR: 257, noPerksWR: 292, rushWR: 34458528, puristWR: 182,
  },
};

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

export function getBo4RoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}

export const BO4_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  STARTING_ROOM: 'First Room',
  NO_PERKS: 'No Perks',
  NO_POWER: 'No Power',
  RUSH: 'Rush',
  PURIST: 'Purist',
  INSTAKILL_ROUND_SPEEDRUN: 'Instakill Round Speedrun',
};

export function getBo4ChallengeTypeLabel(type: string): string {
  return BO4_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function getBo4MapConfig(slug: string): Bo4MapConfig | null {
  return (BO4_MAP_CONFIG as Record<string, Bo4MapConfig | undefined>)[slug] ?? null;
}

export function isBo4Map(slug: string): slug is Bo4MapSlug {
  return slug in BO4_MAP_CONFIG;
}
