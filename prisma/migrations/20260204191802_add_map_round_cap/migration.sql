/*
  Warnings:

  - A unique constraint covering the columns `[mapId,slug]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Achievement_name_key";

-- DropIndex
DROP INDEX "Achievement_slug_key";

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "mapId" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Map" ADD COLUMN     "roundCap" INTEGER;

-- CreateIndex
CREATE INDEX "Achievement_mapId_idx" ON "Achievement"("mapId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_mapId_slug_key" ON "Achievement"("mapId", "slug");

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;
