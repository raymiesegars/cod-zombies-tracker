-- CreateTable
CREATE TABLE "MysteryBoxDiscardVote" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "rollId" TEXT NOT NULL,
    "votes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MysteryBoxDiscardVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxDiscardVote_lobbyId_key" ON "MysteryBoxDiscardVote"("lobbyId");

-- CreateIndex
CREATE INDEX "MysteryBoxDiscardVote_lobbyId_idx" ON "MysteryBoxDiscardVote"("lobbyId");

-- AddForeignKey
ALTER TABLE "MysteryBoxDiscardVote" ADD CONSTRAINT "MysteryBoxDiscardVote_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "MysteryBoxLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxDiscardVote" ADD CONSTRAINT "MysteryBoxDiscardVote_rollId_fkey" FOREIGN KEY ("rollId") REFERENCES "MysteryBoxRoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
