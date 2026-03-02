-- CreateEnum
CREATE TYPE "TournamentPollStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('UPCOMING', 'OPEN', 'LOCKED');

-- CreateTable
CREATE TABLE "TournamentPoll" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "TournamentPollStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "TournamentPoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentPollOption" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TournamentPollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentPollVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentPollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pollId" TEXT,
    "gameId" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "challengeId" TEXT,
    "easterEggId" TEXT,
    "config" JSONB,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentLog" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeLogId" TEXT,
    "easterEggLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTrophy" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "place" INTEGER NOT NULL,
    "xpAwarded" INTEGER NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedById" TEXT NOT NULL,

    CONSTRAINT "TournamentTrophy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TournamentPoll_status_idx" ON "TournamentPoll"("status");

-- CreateIndex
CREATE INDEX "TournamentPoll_endsAt_idx" ON "TournamentPoll"("endsAt");

-- CreateIndex
CREATE INDEX "TournamentPollOption_pollId_idx" ON "TournamentPollOption"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentPollVote_pollId_userId_key" ON "TournamentPollVote"("pollId", "userId");

-- CreateIndex
CREATE INDEX "TournamentPollVote_pollId_idx" ON "TournamentPollVote"("pollId");

-- CreateIndex
CREATE INDEX "TournamentPollVote_userId_idx" ON "TournamentPollVote"("userId");

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");

-- CreateIndex
CREATE INDEX "Tournament_endsAt_idx" ON "Tournament"("endsAt");

-- CreateIndex
CREATE INDEX "Tournament_createdAt_idx" ON "Tournament"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "TournamentLog_tournamentId_idx" ON "TournamentLog"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentLog_userId_idx" ON "TournamentLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentLog_tournamentId_challengeLogId_key" ON "TournamentLog"("tournamentId", "challengeLogId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentLog_tournamentId_easterEggLogId_key" ON "TournamentLog"("tournamentId", "easterEggLogId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTrophy_tournamentId_place_key" ON "TournamentTrophy"("tournamentId", "place");

-- CreateIndex
CREATE INDEX "TournamentTrophy_userId_idx" ON "TournamentTrophy"("userId");

-- CreateIndex
CREATE INDEX "TournamentTrophy_tournamentId_idx" ON "TournamentTrophy"("tournamentId");

-- AddForeignKey
ALTER TABLE "TournamentPoll" ADD CONSTRAINT "TournamentPoll_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPollOption" ADD CONSTRAINT "TournamentPollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "TournamentPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPollVote" ADD CONSTRAINT "TournamentPollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "TournamentPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPollVote" ADD CONSTRAINT "TournamentPollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPollVote" ADD CONSTRAINT "TournamentPollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "TournamentPollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "TournamentPoll"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_easterEggId_fkey" FOREIGN KEY ("easterEggId") REFERENCES "EasterEgg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentLog" ADD CONSTRAINT "TournamentLog_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentLog" ADD CONSTRAINT "TournamentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentLog" ADD CONSTRAINT "TournamentLog_challengeLogId_fkey" FOREIGN KEY ("challengeLogId") REFERENCES "ChallengeLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentLog" ADD CONSTRAINT "TournamentLog_easterEggLogId_fkey" FOREIGN KEY ("easterEggLogId") REFERENCES "EasterEggLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTrophy" ADD CONSTRAINT "TournamentTrophy_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTrophy" ADD CONSTRAINT "TournamentTrophy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTrophy" ADD CONSTRAINT "TournamentTrophy_awardedById_fkey" FOREIGN KEY ("awardedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
