-- CreateTable
CREATE TABLE "GameRules" (
    "id" TEXT NOT NULL,
    "gameShortName" TEXT NOT NULL,
    "generalSections" JSONB NOT NULL,
    "challengeSections" JSONB NOT NULL,
    "challengeRulesByType" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RulesPageSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RulesPageSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameRules_gameShortName_key" ON "GameRules"("gameShortName");

-- CreateIndex
CREATE INDEX "GameRules_gameShortName_idx" ON "GameRules"("gameShortName");

-- CreateIndex
CREATE UNIQUE INDEX "RulesPageSection_key_key" ON "RulesPageSection"("key");

-- CreateIndex
CREATE INDEX "RulesPageSection_key_idx" ON "RulesPageSection"("key");
