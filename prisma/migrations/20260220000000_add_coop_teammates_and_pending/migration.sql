-- Add teammate fields to ChallengeLog and EasterEggLog
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "teammateUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "teammateNonUserNames" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "EasterEggLog" ADD COLUMN IF NOT EXISTS "teammateUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "EasterEggLog" ADD COLUMN IF NOT EXISTS "teammateNonUserNames" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CoOpRunPending: one row per (log, teammate) for pending confirm/deny
CREATE TABLE "CoOpRunPending" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "teammateUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "challengeLogId" TEXT,
    "easterEggLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoOpRunPending_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CoOpRunPending_challengeLogId_teammateUserId_key" ON "CoOpRunPending"("challengeLogId", "teammateUserId");
CREATE UNIQUE INDEX "CoOpRunPending_easterEggLogId_teammateUserId_key" ON "CoOpRunPending"("easterEggLogId", "teammateUserId");
CREATE INDEX "CoOpRunPending_teammateUserId_status_idx" ON "CoOpRunPending"("teammateUserId", "status");

ALTER TABLE "CoOpRunPending" ADD CONSTRAINT "CoOpRunPending_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoOpRunPending" ADD CONSTRAINT "CoOpRunPending_teammateUserId_fkey" FOREIGN KEY ("teammateUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoOpRunPending" ADD CONSTRAINT "CoOpRunPending_challengeLogId_fkey" FOREIGN KEY ("challengeLogId") REFERENCES "ChallengeLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoOpRunPending" ADD CONSTRAINT "CoOpRunPending_easterEggLogId_fkey" FOREIGN KEY ("easterEggLogId") REFERENCES "EasterEggLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
