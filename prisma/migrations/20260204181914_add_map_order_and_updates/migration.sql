-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER');

-- CreateEnum
CREATE TYPE "EasterEggType" AS ENUM ('MAIN_QUEST', 'SIDE_QUEST');

-- CreateEnum
CREATE TYPE "PlayerCount" AS ENUM ('SOLO', 'DUO', 'TRIO', 'SQUAD');

-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('YOUTUBE', 'TWITCH', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('ROUND_MILESTONE', 'CHALLENGE_COMPLETE', 'EASTER_EGG_COMPLETE', 'MAPS_PLAYED', 'TOTAL_ROUNDS', 'STREAK', 'COLLECTOR');

-- CreateEnum
CREATE TYPE "AchievementRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "releaseYear" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Map" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "gameId" TEXT NOT NULL,
    "isDlc" BOOLEAN NOT NULL DEFAULT false,
    "releaseDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "ChallengeType" NOT NULL,
    "roundTarget" INTEGER,
    "mapId" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EasterEgg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "EasterEggType" NOT NULL,
    "mapId" TEXT NOT NULL,
    "optimalRound" INTEGER,
    "xpReward" INTEGER NOT NULL DEFAULT 250,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EasterEgg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "roundReached" INTEGER NOT NULL,
    "playerCount" "PlayerCount" NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proofUrl" TEXT,
    "proofType" "ProofType",
    "screenshotUrl" TEXT,
    "notes" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EasterEggLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "easterEggId" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roundCompleted" INTEGER,
    "playerCount" "PlayerCount" NOT NULL,
    "isSolo" BOOLEAN NOT NULL DEFAULT false,
    "isNoGuide" BOOLEAN NOT NULL DEFAULT false,
    "proofUrl" TEXT,
    "proofType" "ProofType",
    "screenshotUrl" TEXT,
    "notes" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EasterEggLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "type" "AchievementType" NOT NULL,
    "criteria" JSONB NOT NULL,
    "challengeId" TEXT,
    "easterEggId" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "rarity" "AchievementRarity" NOT NULL DEFAULT 'COMMON',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelThreshold" (
    "level" INTEGER NOT NULL,
    "xpRequired" INTEGER NOT NULL,
    "rankName" TEXT NOT NULL,
    "rankBadgeUrl" TEXT,

    CONSTRAINT "LevelThreshold_pkey" PRIMARY KEY ("level")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_supabaseId_idx" ON "User"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Game_shortName_key" ON "Game"("shortName");

-- CreateIndex
CREATE INDEX "Game_order_idx" ON "Game"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Map_slug_key" ON "Map"("slug");

-- CreateIndex
CREATE INDEX "Map_slug_idx" ON "Map"("slug");

-- CreateIndex
CREATE INDEX "Map_gameId_idx" ON "Map"("gameId");

-- CreateIndex
CREATE INDEX "Map_gameId_order_idx" ON "Map"("gameId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Map_gameId_name_key" ON "Map"("gameId", "name");

-- CreateIndex
CREATE INDEX "Challenge_type_idx" ON "Challenge"("type");

-- CreateIndex
CREATE INDEX "Challenge_mapId_idx" ON "Challenge"("mapId");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_mapId_slug_key" ON "Challenge"("mapId", "slug");

-- CreateIndex
CREATE INDEX "EasterEgg_mapId_idx" ON "EasterEgg"("mapId");

-- CreateIndex
CREATE INDEX "EasterEgg_type_idx" ON "EasterEgg"("type");

-- CreateIndex
CREATE UNIQUE INDEX "EasterEgg_mapId_slug_key" ON "EasterEgg"("mapId", "slug");

-- CreateIndex
CREATE INDEX "ChallengeLog_userId_idx" ON "ChallengeLog"("userId");

-- CreateIndex
CREATE INDEX "ChallengeLog_challengeId_idx" ON "ChallengeLog"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengeLog_mapId_idx" ON "ChallengeLog"("mapId");

-- CreateIndex
CREATE INDEX "ChallengeLog_roundReached_idx" ON "ChallengeLog"("roundReached" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeLog_userId_challengeId_mapId_playerCount_key" ON "ChallengeLog"("userId", "challengeId", "mapId", "playerCount");

-- CreateIndex
CREATE INDEX "EasterEggLog_userId_idx" ON "EasterEggLog"("userId");

-- CreateIndex
CREATE INDEX "EasterEggLog_easterEggId_idx" ON "EasterEggLog"("easterEggId");

-- CreateIndex
CREATE INDEX "EasterEggLog_mapId_idx" ON "EasterEggLog"("mapId");

-- CreateIndex
CREATE INDEX "EasterEggLog_roundCompleted_idx" ON "EasterEggLog"("roundCompleted" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "EasterEggLog_userId_easterEggId_playerCount_key" ON "EasterEggLog"("userId", "easterEggId", "playerCount");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_slug_key" ON "Achievement"("slug");

-- CreateIndex
CREATE INDEX "Achievement_type_idx" ON "Achievement"("type");

-- CreateIndex
CREATE INDEX "Achievement_rarity_idx" ON "Achievement"("rarity");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_idx" ON "UserAchievement"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "LevelThreshold_xpRequired_idx" ON "LevelThreshold"("xpRequired");

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EasterEgg" ADD CONSTRAINT "EasterEgg_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeLog" ADD CONSTRAINT "ChallengeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeLog" ADD CONSTRAINT "ChallengeLog_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeLog" ADD CONSTRAINT "ChallengeLog_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EasterEggLog" ADD CONSTRAINT "EasterEggLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EasterEggLog" ADD CONSTRAINT "EasterEggLog_easterEggId_fkey" FOREIGN KEY ("easterEggId") REFERENCES "EasterEgg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EasterEggLog" ADD CONSTRAINT "EasterEggLog_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_easterEggId_fkey" FOREIGN KEY ("easterEggId") REFERENCES "EasterEgg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
