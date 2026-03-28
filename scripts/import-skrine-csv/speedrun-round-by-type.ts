/**
 * Maps speedrun challenge types to the round that should be stored in roundReached.
 * Used so high-round achievements unlock (e.g. ROUND_30_SPEEDRUN run counts as round 30).
 * Returns null for types that have no single round (EE speedrun, build%, etc.).
 */
const SPEEDRUN_ROUND_BY_TYPE: Record<string, number> = {
  ROUND_5_SPEEDRUN: 5,
  ROUND_10_SPEEDRUN: 10,
  ROUND_15_SPEEDRUN: 15,
  ROUND_20_SPEEDRUN: 20,
  ROUND_30_SPEEDRUN: 30,
  ROUND_50_SPEEDRUN: 50,
  ROUND_70_SPEEDRUN: 70,
  ROUND_100_SPEEDRUN: 100,
  ROUND_200_SPEEDRUN: 200,
  ROUND_255_SPEEDRUN: 255,
  ROUND_935_SPEEDRUN: 935,
  ROUND_999_SPEEDRUN: 999,
  EXFIL_SPEEDRUN: 11,
  EXFIL_R21_SPEEDRUN: 21,
  EXFIL_R5_SPEEDRUN: 5,
  EXFIL_R10_SPEEDRUN: 10,
  EXFIL_R20_SPEEDRUN: 20,
  PACK_A_PUNCH_SPEEDRUN: 1,
  SUPER_30_SPEEDRUN: 30,
  INSTAKILL_ROUND_SPEEDRUN: 30,
};

export function getRoundForSpeedrunChallengeType(challengeType: string): number | null {
  return SPEEDRUN_ROUND_BY_TYPE[challengeType] ?? null;
}

export function isSpeedrunTypeWithRound(challengeType: string): boolean {
  return challengeType in SPEEDRUN_ROUND_BY_TYPE;
}
