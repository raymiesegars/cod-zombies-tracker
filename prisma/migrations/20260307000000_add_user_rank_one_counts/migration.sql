CREATE TABLE IF NOT EXISTS "UserRankOneCount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "scopeKey" TEXT NOT NULL,
  "gameId" TEXT,
  "mapId" TEXT,
  "worldRecords" INTEGER NOT NULL DEFAULT 0,
  "verifiedWorldRecords" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRankOneCount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserRankOneCount_userId_scopeKey_key"
ON "UserRankOneCount"("userId", "scopeKey");

CREATE INDEX IF NOT EXISTS "UserRankOneCount_scopeKey_worldRecords_idx"
ON "UserRankOneCount"("scopeKey", "worldRecords" DESC);

CREATE INDEX IF NOT EXISTS "UserRankOneCount_scopeKey_verifiedWorldRecords_idx"
ON "UserRankOneCount"("scopeKey", "verifiedWorldRecords" DESC);

CREATE INDEX IF NOT EXISTS "UserRankOneCount_scopeKey_updatedAt_idx"
ON "UserRankOneCount"("scopeKey", "updatedAt");

CREATE INDEX IF NOT EXISTS "UserRankOneCount_userId_idx"
ON "UserRankOneCount"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'UserRankOneCount_userId_fkey'
      AND table_name = 'UserRankOneCount'
  ) THEN
    ALTER TABLE "UserRankOneCount"
    ADD CONSTRAINT "UserRankOneCount_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
