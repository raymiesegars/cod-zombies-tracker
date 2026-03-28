-- CreateTable
CREATE TABLE "VerifiedLevelMilestoneClaim" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "verifiedTotalXp" INTEGER NOT NULL,
    "reachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerifiedLevelMilestoneClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerifiedLevelMilestoneClaim_level_key" ON "VerifiedLevelMilestoneClaim"("level");

-- CreateIndex
CREATE INDEX "VerifiedLevelMilestoneClaim_userId_idx" ON "VerifiedLevelMilestoneClaim"("userId");

-- CreateIndex
CREATE INDEX "VerifiedLevelMilestoneClaim_reachedAt_idx" ON "VerifiedLevelMilestoneClaim"("reachedAt" DESC);

-- AddForeignKey
ALTER TABLE "VerifiedLevelMilestoneClaim" ADD CONSTRAINT "VerifiedLevelMilestoneClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
