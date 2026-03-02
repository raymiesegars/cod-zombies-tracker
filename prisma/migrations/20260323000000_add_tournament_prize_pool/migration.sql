-- CreateTable
CREATE TABLE "TournamentPrizePool" (
    "id" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentPrizePool_pkey" PRIMARY KEY ("id")
);

-- Seed single row for singleton (id is arbitrary; we use findFirst)
INSERT INTO "TournamentPrizePool" ("id", "amountCents", "updatedAt") VALUES ('default-prize-pool', 0, NOW());
