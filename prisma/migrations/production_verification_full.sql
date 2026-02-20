-- =============================================================================
-- PRODUCTION: Full verification feature (idempotent — safe to run multiple times)
-- =============================================================================
-- Creates: NotificationType enum (all 3 values), Notification table,
--          verificationRequestedAt on ChallengeLog and EasterEggLog.
-- Does NOT touch: isVerified (already on logs from earlier migration).
-- =============================================================================

-- 1. Create enum with all 3 values if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
    CREATE TYPE "NotificationType" AS ENUM (
      'VERIFICATION_APPROVED',
      'VERIFICATION_DENIED',
      'VERIFICATION_REMOVED'
    );
  END IF;
END $$;

-- 2. If enum exists but is missing VERIFICATION_REMOVED, add it
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'VERIFICATION_REMOVED';

-- 3. Add columns to logs if missing (safe if already exist)
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "verificationRequestedAt" TIMESTAMP(3);
ALTER TABLE "EasterEggLog" ADD COLUMN IF NOT EXISTS "verificationRequestedAt" TIMESTAMP(3);

-- 4. Create Notification table if missing
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "challengeLogId" TEXT,
    "easterEggLogId" TEXT,
    "message" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- 5. Create indexes if missing
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt" DESC);

-- 6. Add foreign keys if missing (ignore if already exist)
DO $$
BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_challengeLogId_fkey"
    FOREIGN KEY ("challengeLogId") REFERENCES "ChallengeLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_easterEggLogId_fkey"
    FOREIGN KEY ("easterEggLogId") REFERENCES "EasterEggLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
