// Map edit page: shows XP you'll get for a challenge/EE before you save.
export type AchievementForPreview = {
  id: string;
  type: string;
  criteria: { round?: number; challengeType?: string; isCap?: boolean };
  xpReward: number;
  easterEggId?: string | null;
};

export function getXpForChallengeLog(
  achievements: AchievementForPreview[],
  unlockedIds: string[],
  challengeType: string,
  round: number,
  roundCap: number | null
): number {
  const set = new Set(unlockedIds);
  let total = 0;
  for (const a of achievements) {
    if (set.has(a.id)) continue;
    const c = a.criteria as { round?: number; challengeType?: string; isCap?: boolean };
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
  easterEggId: string
): number {
  const set = new Set(unlockedIds);
  const ee = achievements.find(
    (a) => a.type === 'EASTER_EGG_COMPLETE' && a.easterEggId === easterEggId
  );
  if (!ee || set.has(ee.id)) return 0;
  return ee.xpReward;
}
