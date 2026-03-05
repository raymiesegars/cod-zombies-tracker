-- CreateTable
CREATE TABLE "ChatbotWikiImport" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotWikiImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatbotWikiImport_source_idx" ON "ChatbotWikiImport"("source");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotWikiImport_source_externalId_key" ON "ChatbotWikiImport"("source", "externalId");
