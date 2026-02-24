-- Fix: Add NO_JUG_NO_ARMOR if missing (DO block in prior migration may not have applied on some PG versions)
ALTER TYPE "ChallengeType" ADD VALUE IF NOT EXISTS 'NO_JUG_NO_ARMOR';
ALTER TYPE "ChallengeType" ADD VALUE IF NOT EXISTS 'EXFIL_R5_SPEEDRUN';
ALTER TYPE "ChallengeType" ADD VALUE IF NOT EXISTS 'EXFIL_R10_SPEEDRUN';
ALTER TYPE "ChallengeType" ADD VALUE IF NOT EXISTS 'EXFIL_R20_SPEEDRUN';
