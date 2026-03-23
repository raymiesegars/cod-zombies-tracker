DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExternalSource') THEN
    CREATE TYPE "ExternalSource" AS ENUM ('ZWR', 'SRC');
  END IF;
END
$$;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "archivedReason" TEXT,
ADD COLUMN IF NOT EXISTS "isExternalPlaceholder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "externalAvatarSource" "ExternalSource",
ADD COLUMN IF NOT EXISTS "externalDisplayName" TEXT,
ADD COLUMN IF NOT EXISTS "mergedIntoUserId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'User_mergedIntoUserId_fkey'
      AND table_name = 'User'
  ) THEN
    ALTER TABLE "User"
    ADD CONSTRAINT "User_mergedIntoUserId_fkey"
    FOREIGN KEY ("mergedIntoUserId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "ExternalAccountIdentity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "source" "ExternalSource" NOT NULL,
  "externalName" TEXT NOT NULL,
  "externalKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExternalAccountIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserMergeAudit" (
  "id" TEXT NOT NULL,
  "sourceUserId" TEXT NOT NULL,
  "targetUserId" TEXT NOT NULL,
  "mergedByUserId" TEXT NOT NULL,
  "movedChallengeLogCount" INTEGER NOT NULL DEFAULT 0,
  "movedEasterEggLogCount" INTEGER NOT NULL DEFAULT 0,
  "skippedChallengeDuplicateCount" INTEGER NOT NULL DEFAULT 0,
  "skippedEasterEggDuplicateCount" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserMergeAudit_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ExternalAccountIdentity_userId_fkey'
      AND table_name = 'ExternalAccountIdentity'
  ) THEN
    ALTER TABLE "ExternalAccountIdentity"
    ADD CONSTRAINT "ExternalAccountIdentity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'UserMergeAudit_sourceUserId_fkey'
      AND table_name = 'UserMergeAudit'
  ) THEN
    ALTER TABLE "UserMergeAudit"
    ADD CONSTRAINT "UserMergeAudit_sourceUserId_fkey"
    FOREIGN KEY ("sourceUserId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'UserMergeAudit_targetUserId_fkey'
      AND table_name = 'UserMergeAudit'
  ) THEN
    ALTER TABLE "UserMergeAudit"
    ADD CONSTRAINT "UserMergeAudit_targetUserId_fkey"
    FOREIGN KEY ("targetUserId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'UserMergeAudit_mergedByUserId_fkey'
      AND table_name = 'UserMergeAudit'
  ) THEN
    ALTER TABLE "UserMergeAudit"
    ADD CONSTRAINT "UserMergeAudit_mergedByUserId_fkey"
    FOREIGN KEY ("mergedByUserId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "ExternalAccountIdentity_source_externalKey_key"
ON "ExternalAccountIdentity"("source", "externalKey");

CREATE INDEX IF NOT EXISTS "ExternalAccountIdentity_userId_idx"
ON "ExternalAccountIdentity"("userId");

CREATE INDEX IF NOT EXISTS "ExternalAccountIdentity_source_externalName_idx"
ON "ExternalAccountIdentity"("source", "externalName");

CREATE INDEX IF NOT EXISTS "UserMergeAudit_sourceUserId_idx"
ON "UserMergeAudit"("sourceUserId");

CREATE INDEX IF NOT EXISTS "UserMergeAudit_targetUserId_idx"
ON "UserMergeAudit"("targetUserId");

CREATE INDEX IF NOT EXISTS "UserMergeAudit_mergedByUserId_idx"
ON "UserMergeAudit"("mergedByUserId");

CREATE INDEX IF NOT EXISTS "UserMergeAudit_createdAt_idx"
ON "UserMergeAudit"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "User_isPublic_isArchived_idx"
ON "User"("isPublic", "isArchived");

CREATE INDEX IF NOT EXISTS "User_isExternalPlaceholder_idx"
ON "User"("isExternalPlaceholder");

CREATE INDEX IF NOT EXISTS "User_mergedIntoUserId_idx"
ON "User"("mergedIntoUserId");
