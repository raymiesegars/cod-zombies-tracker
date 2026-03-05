-- AlterTable ChallengeLog: track who verified and when
ALTER TABLE "ChallengeLog" ADD COLUMN "verifiedById" TEXT;
ALTER TABLE "ChallengeLog" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "ChallengeLog" ADD CONSTRAINT "ChallengeLog_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable EasterEggLog: track who verified and when
ALTER TABLE "EasterEggLog" ADD COLUMN "verifiedById" TEXT;
ALTER TABLE "EasterEggLog" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "EasterEggLog" ADD CONSTRAINT "EasterEggLog_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable User: admin XP and dashboard seen timestamps for unread badges
ALTER TABLE "User" ADD COLUMN "adminXp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "adminDashboardSeen" JSONB;
