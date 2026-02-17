-- CreateTable
CREATE TABLE "GroupListing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "easterEggId" TEXT,
    "desiredPlayerCount" INTEGER NOT NULL,
    "currentPlayerCount" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "platform" TEXT NOT NULL,
    "contactInfo" JSONB,

    CONSTRAINT "GroupListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupListingMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "GroupListingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupListing_createdAt_idx" ON "GroupListing"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "GroupListing_mapId_idx" ON "GroupListing"("mapId");

-- CreateIndex
CREATE INDEX "GroupListing_creatorId_idx" ON "GroupListing"("creatorId");

-- CreateIndex
CREATE INDEX "GroupListing_expiresAt_idx" ON "GroupListing"("expiresAt");

-- CreateIndex
CREATE INDEX "GroupListingMessage_listingId_idx" ON "GroupListingMessage"("listingId");

-- CreateIndex
CREATE INDEX "GroupListingMessage_createdAt_idx" ON "GroupListingMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "GroupListing" ADD CONSTRAINT "GroupListing_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupListing" ADD CONSTRAINT "GroupListing_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupListing" ADD CONSTRAINT "GroupListing_easterEggId_fkey" FOREIGN KEY ("easterEggId") REFERENCES "EasterEgg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupListingMessage" ADD CONSTRAINT "GroupListingMessage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "GroupListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupListingMessage" ADD CONSTRAINT "GroupListingMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
