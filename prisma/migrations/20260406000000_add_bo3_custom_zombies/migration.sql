-- AlterTable
ALTER TABLE "User" ADD COLUMN "customZombiesTotalXp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "verifiedCustomZombiesTotalXp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "hideCustomZombiesEverywhere" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "profileRankDisplay" JSONB;

-- AlterTable
ALTER TABLE "Map" ADD COLUMN "isCustom" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Map" ADD COLUMN "steamWorkshopUrl" TEXT;

-- CreateTable
CREATE TABLE "MapSubmission" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "gameId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "mapName" TEXT NOT NULL,
    "steamWorkshopUrl" TEXT NOT NULL,
    "thumbnailImageUrl" TEXT,
    "mapPageImageUrl" TEXT,
    "suggestedAchievements" JSONB,
    "suggestedEasterEgg" JSONB,
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedMapId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MapSubmission_status_idx" ON "MapSubmission"("status");
CREATE INDEX "MapSubmission_gameId_idx" ON "MapSubmission"("gameId");
CREATE INDEX "MapSubmission_submittedById_idx" ON "MapSubmission"("submittedById");
CREATE INDEX "Map_isCustom_idx" ON "Map"("isCustom");

-- AddForeignKey
ALTER TABLE "MapSubmission" ADD CONSTRAINT "MapSubmission_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MapSubmission" ADD CONSTRAINT "MapSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MapSubmission" ADD CONSTRAINT "MapSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert BO3 Custom Zombies game (at end of list)
INSERT INTO "Game" (id, name, "shortName", "releaseYear", "order")
SELECT 
  'cbo3custom000000000000000000001',
  'BO3 Custom Zombies',
  'BO3_CUSTOM',
  2015,
  (SELECT COALESCE(MAX("order"), 0) + 1 FROM "Game")
WHERE NOT EXISTS (SELECT 1 FROM "Game" WHERE "shortName" = 'BO3_CUSTOM');
