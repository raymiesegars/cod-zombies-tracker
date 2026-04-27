-- CreateTable
CREATE TABLE "TournamentVerificationMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentVerificationMessage_pkey" PRIMARY KEY ("id")
);

INSERT INTO "TournamentVerificationMessage" ("id", "content", "updatedAt") VALUES ('singleton', '', NOW());
