-- CreateTable (idempotent: table may exist from old migration name)
CREATE TABLE IF NOT EXISTS "MysteryBoxDiscardVote" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "rollId" TEXT NOT NULL,
    "votes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MysteryBoxDiscardVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MysteryBoxDiscardVote_lobbyId_key" ON "MysteryBoxDiscardVote"("lobbyId");
CREATE INDEX IF NOT EXISTS "MysteryBoxDiscardVote_lobbyId_idx" ON "MysteryBoxDiscardVote"("lobbyId");

-- AddForeignKey (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MysteryBoxDiscardVote_lobbyId_fkey') THEN
    ALTER TABLE "MysteryBoxDiscardVote" ADD CONSTRAINT "MysteryBoxDiscardVote_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "MysteryBoxLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MysteryBoxDiscardVote_rollId_fkey') THEN
    ALTER TABLE "MysteryBoxDiscardVote" ADD CONSTRAINT "MysteryBoxDiscardVote_rollId_fkey" FOREIGN KEY ("rollId") REFERENCES "MysteryBoxRoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
