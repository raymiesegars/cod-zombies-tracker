import { getBo4DifficultiesBelow } from './bo4';

// Map edit page: shows XP you'll get for a challenge/EE before you save.
export type AchievementForPreview = {
  id: string;
  type: string;
  criteria: { round?: number; challengeType?: string; isCap?: boolean; maxTimeSeconds?: number };
  xpReward: number;
  easterEggId?: string | null;
  difficulty?: string | null;
};

function matchesDifficultyForPreview(achievementDifficulty: string | null | undefined, selectedDifficulty: string | null | undefined): boolean {
  if (!selectedDifficulty) return true; // non-BO4 or no selection: count all
  if (!achievementDifficulty) return false; // BO4 selected but achievement has no difficulty (legacy)
  if (achievementDifficulty === selectedDifficulty) return true;
  return getBo4DifficultiesBelow(selectedDifficulty).includes(achievementDifficulty as any);
}

export function getXpForChallengeLog(
  achievements: AchievementForPreview[],
  unlockedIds: string[],
  challengeType: string,
  round: number,
  roundCap: number | null,
  /** BO4 only: selected difficulty so preview includes cascade (this + all lower) */
  difficulty?: string | null,
  /** IW speedruns: completion time in seconds so preview includes speedrun tier XP */
  completionTimeSeconds?: number | null
): number {
  const set = new Set(unlockedIds);
  let total = 0;
  for (const a of achievements) {
    if (set.has(a.id)) continue;
    if (!matchesDifficultyForPreview(a.difficulty, difficulty)) continue;
    const c = a.criteria as { round?: number; challengeType?: string; isCap?: boolean; maxTimeSeconds?: number };
    // Speedrun tier: qualify if completionTimeSeconds <= maxTimeSeconds
    if (c.maxTimeSeconds != null && c.challengeType === challengeType) {
      if (completionTimeSeconds != null && completionTimeSeconds >= 0 && completionTimeSeconds <= c.maxTimeSeconds) {
        total += a.xpReward;
      }
      continue;
    }
    const matchesRound =
      c.isCap && roundCap != null
        ? round >= roundCap
        : c.round != null && round >= c.round;
    if (!matchesRound) continue;
    if (a.type === 'ROUND_MILESTONE' && challengeType === 'HIGHEST_ROUND') {
      total += a.xpReward;
      continue;
    }
    if (a.type === 'CHALLENGE_COMPLETE' && c.challengeType === challengeType) {
      total += a.xpReward;
    }
  }
  return total;
}

export function getXpForEasterEggLog(
  achievements: AchievementForPreview[],
  unlockedIds: string[],
  easterEggId: string,
  /** BO4 only: selected difficulty so preview includes cascade (this + all lower combined) */
  difficulty?: string | null
): number {
  const set = new Set(unlockedIds);
  const candidates = achievements.filter(
    (a) => a.type === 'EASTER_EGG_COMPLETE' && a.easterEggId === easterEggId && matchesDifficultyForPreview(a.difficulty, difficulty)
  );
  let total = 0;
  for (const ee of candidates) {
    if (set.has(ee.id)) continue;
    total += ee.xpReward;
  }
  return total;
}
