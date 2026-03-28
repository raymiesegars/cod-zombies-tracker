import prisma from '@/lib/prisma';
import { MAX_LEVEL, getLevelFromXp } from '@/lib/ranks';

export const VERIFIED_MILESTONE_MIN_LEVEL = 70;

function getCrossedMilestoneLevels(previousXp: number, nextXp: number): number[] {
  if (nextXp <= previousXp) return [];
  const prevLevel = getLevelFromXp(previousXp).level;
  const nextLevel = getLevelFromXp(nextXp).level;
  if (nextLevel <= prevLevel) return [];

  const levels: number[] = [];
  for (let level = Math.max(VERIFIED_MILESTONE_MIN_LEVEL, prevLevel + 1); level <= Math.min(MAX_LEVEL, nextLevel); level++) {
    levels.push(level);
  }
  return levels;
}

export async function claimVerifiedLevelMilestones(
  userId: string,
  previousVerifiedXp: number,
  nextVerifiedXp: number
): Promise<void> {
  const levels = getCrossedMilestoneLevels(previousVerifiedXp, nextVerifiedXp);
  if (levels.length === 0) return;

  for (const level of levels) {
    try {
      await prisma.verifiedLevelMilestoneClaim.create({
        data: {
          level,
          userId,
          verifiedTotalXp: nextVerifiedXp,
        },
      });
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? (error as { code?: string }).code : undefined;
      // P2002: unique conflict (already claimed), P2021/P2022: table/column missing before migration deploy.
      if (code === 'P2002' || code === 'P2021' || code === 'P2022') continue;
      throw error;
    }
  }
}
