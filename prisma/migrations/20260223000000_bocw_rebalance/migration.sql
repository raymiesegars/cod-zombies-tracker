-- BOCW rebalance: new challenge types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'NO_ARMOR') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'NO_ARMOR';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'ROUND_935_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'ROUND_935_SPEEDRUN';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'ROUND_10_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'ROUND_10_SPEEDRUN';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'ROUND_20_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'ROUND_20_SPEEDRUN';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'EXFIL_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'EXFIL_SPEEDRUN';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'BUILD_EE_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'BUILD_EE_SPEEDRUN';
  END IF;
END $$;
