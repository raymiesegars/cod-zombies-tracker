const XP_MULTIPLIER = 1.25;
const ROUND_BRACKETS = [
  { min: 1, max: 10, baseXp: 5, multiplier: 1.0 },
  { min: 11, max: 20, baseXp: 10, multiplier: 1.2 },
  { min: 21, max: 30, baseXp: 15, multiplier: 1.5 },
  { min: 31, max: 50, baseXp: 25, multiplier: 2.0 },
  { min: 51, max: 75, baseXp: 40, multiplier: 2.5 },
  { min: 76, max: 100, baseXp: 60, multiplier: 3.0 },
  { min: 101, max: 150, baseXp: 100, multiplier: 4.0 },
  { min: 151, max: 200, baseXp: 150, multiplier: 5.0 },
  { min: 201, max: Infinity, baseXp: 200, multiplier: 6.0 },
];

export function calculateRoundXp(round: number, roundCap?: number): number {
  const effectiveRound = roundCap ? Math.min(round, roundCap) : round;
  let totalXp = 0;

  for (const bracket of ROUND_BRACKETS) {
    if (effectiveRound < bracket.min) break;
    const roundsInBracket = Math.min(effectiveRound, bracket.max) - bracket.min + 1;
    if (roundsInBracket <= 0) continue;
    for (let i = 0; i < roundsInBracket; i++) {
      const exponentialFactor = 1 + (i / (bracket.max - bracket.min + 1)) * 0.5;
      totalXp += Math.floor(bracket.baseXp * bracket.multiplier * exponentialFactor);
    }
  }

  totalXp = Math.floor(totalXp * XP_MULTIPLIER);
  return totalXp;
}

export function calculateXpGain(
  previousRound: number,
  newRound: number,
  roundCap?: number
): number {
  if (newRound <= previousRound) return 0;
  const previousXp = calculateRoundXp(previousRound, roundCap);
  const newXp = calculateRoundXp(newRound, roundCap);
  return newXp - previousXp;
}

export function calculateEasterEggXp(
  isMainQuest: boolean,
  isSolo: boolean = false,
  isNoGuide: boolean = false
): number {
  const baseXp = isMainQuest ? 500 : 150;
  let multiplier = XP_MULTIPLIER;
  if (isSolo) multiplier *= 1.5;
  if (isNoGuide) multiplier *= 1.25;
  return Math.floor(baseXp * multiplier);
}

export function calculateChallengeXp(challengeType: string, round: number): number {
  const challengeBaseXp: Record<string, number> = {
    HIGHEST_ROUND: 0,
    NO_DOWNS: 50,
    NO_PERKS: 75,
    NO_PACK: 60,
    STARTING_ROOM: 100,
    ONE_BOX: 40,
    PISTOL_ONLY: 150,
    NO_POWER: 80,
  };

  const baseXp = challengeBaseXp[challengeType] || 50;
  
  if (challengeType !== 'HIGHEST_ROUND') {
    const roundMultiplier = Math.min(round / 20, 3);
    return Math.floor(baseXp * XP_MULTIPLIER * roundMultiplier);
  }
  return calculateRoundXp(round);
}

export function calculateLevel(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 100;

  while (totalXp >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
  }

  const progress = ((totalXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return {
    level,
    currentLevelXp: xpForCurrentLevel,
    nextLevelXp: xpForNextLevel,
    progress: Math.min(progress, 100),
  };
}
