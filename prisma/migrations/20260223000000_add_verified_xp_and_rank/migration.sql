-- AlterTable
ALTER TABLE "User" ADD COLUMN "verifiedTotalXp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "showBothXpRanks" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "preferredRankView" TEXT;
ALTER TABLE "UserAchievement" ADD COLUMN "verifiedAt" TIMESTAMP(3);

-- Backfill: Mark achievements as verified for users with verified runs on that map
-- Challenge logs
UPDATE "UserAchievement" ua
SET "verifiedAt" = NOW()
WHERE ua."verifiedAt" IS NULL
  AND EXISTS (
    SELECT 1 FROM "ChallengeLog" cl
    JOIN "Achievement" a ON a."mapId" = cl."mapId" AND ua."achievementId" = a.id
    WHERE cl."userId" = ua."userId"
      AND cl."isVerified" = true
      AND a."mapId" IS NOT NULL
  );

-- Easter egg logs
UPDATE "UserAchievement" ua
SET "verifiedAt" = NOW()
WHERE ua."verifiedAt" IS NULL
  AND EXISTS (
    SELECT 1 FROM "EasterEggLog" eel
    JOIN "Achievement" a ON a."mapId" = eel."mapId" AND ua."achievementId" = a.id
    WHERE eel."userId" = ua."userId"
      AND eel."isVerified" = true
      AND a."mapId" IS NOT NULL
  );

-- Recalculate verifiedTotalXp for all users
UPDATE "User" u
SET "verifiedTotalXp" = COALESCE((
  SELECT SUM(a."xpReward")::integer
  FROM "UserAchievement" ua
  JOIN "Achievement" a ON a.id = ua."achievementId"
  WHERE ua."userId" = u.id
    AND ua."verifiedAt" IS NOT NULL
), 0);
