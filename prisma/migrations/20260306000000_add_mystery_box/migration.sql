-- Mystery Box feature: tokens, lobbies, rolls, completions
-- Safe for production and dev (additive only)

-- Add token columns to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mysteryBoxTokens" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mysteryBoxLastTokenAt" TIMESTAMP(3);

-- Add MYSTERY_BOX_INVITE to NotificationType enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'NotificationType' AND e.enumlabel = 'MYSTERY_BOX_INVITE') THEN
    ALTER TYPE "NotificationType" ADD VALUE 'MYSTERY_BOX_INVITE';
  END IF;
END $$;

-- Create MysteryBoxLobby table
CREATE TABLE IF NOT EXISTS "MysteryBoxLobby" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MysteryBoxLobby_pkey" PRIMARY KEY ("id")
);

-- Create MysteryBoxLobbyMember table
CREATE TABLE IF NOT EXISTS "MysteryBoxLobbyMember" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MysteryBoxLobbyMember_pkey" PRIMARY KEY ("id")
);

-- Create MysteryBoxRoll table
CREATE TABLE IF NOT EXISTS "MysteryBoxRoll" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "tags" JSONB,
    "filterSettings" JSONB,
    "completedByHost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MysteryBoxRoll_pkey" PRIMARY KEY ("id")
);

-- Create MysteryBoxCompletion table
CREATE TABLE IF NOT EXISTS "MysteryBoxCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rollId" TEXT NOT NULL,
    "challengeLogId" TEXT NOT NULL,
    "xpAwarded" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MysteryBoxCompletion_pkey" PRIMARY KEY ("id")
);

-- Add mysteryBoxLobbyId to Notification (after tables exist)
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "mysteryBoxLobbyId" TEXT;

-- Create unique constraint on MysteryBoxLobbyMember (lobbyId, userId)
CREATE UNIQUE INDEX IF NOT EXISTS "MysteryBoxLobbyMember_lobbyId_userId_key" ON "MysteryBoxLobbyMember"("lobbyId", "userId");

-- Create unique constraint on MysteryBoxRoll lobbyId
CREATE UNIQUE INDEX IF NOT EXISTS "MysteryBoxRoll_lobbyId_key" ON "MysteryBoxRoll"("lobbyId");

-- Create unique constraint on MysteryBoxCompletion (userId, rollId)
CREATE UNIQUE INDEX IF NOT EXISTS "MysteryBoxCompletion_userId_rollId_key" ON "MysteryBoxCompletion"("userId", "rollId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "MysteryBoxLobby_hostId_idx" ON "MysteryBoxLobby"("hostId");
CREATE INDEX IF NOT EXISTS "MysteryBoxLobbyMember_userId_idx" ON "MysteryBoxLobbyMember"("userId");
CREATE INDEX IF NOT EXISTS "MysteryBoxLobbyMember_lobbyId_idx" ON "MysteryBoxLobbyMember"("lobbyId");
CREATE INDEX IF NOT EXISTS "MysteryBoxRoll_lobbyId_idx" ON "MysteryBoxRoll"("lobbyId");
CREATE INDEX IF NOT EXISTS "MysteryBoxCompletion_userId_idx" ON "MysteryBoxCompletion"("userId");
CREATE INDEX IF NOT EXISTS "MysteryBoxCompletion_rollId_idx" ON "MysteryBoxCompletion"("rollId");

-- Add foreign keys (only if they don't exist - Prisma may have created some)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MysteryBoxLobby_hostId_fkey') THEN
    ALTER TABLE "MysteryBoxLobby" ADD CONSTRAINT "MysteryBoxLobby_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MysteryBoxLobbyMember_lobbyId_fkey') THEN
    ALTER TABLE "MysteryBoxLobbyMember" ADD CONSTRAINT "MysteryBoxLobbyMember_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "MysteryBoxLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MysteryBoxLobbyMember_userId_fkey') THEN
    ALTER TABLE "MysteryBoxLobbyMember" ADD CONSTRAINT "MysteryBoxLobbyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MysteryBoxRoll_lobbyId_fkey') THEN
    ALTER TABLE "MysteryBoxRoll" ADD CONSTRAINT "MysteryBoxRoll_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "MysteryBoxLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MysteryBoxCompletion_userId_fkey') THEN
    ALTER TABLE "MysteryBoxCompletion" ADD CONSTRAINT "MysteryBoxCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MysteryBoxCompletion_rollId_fkey') THEN
    ALTER TABLE "MysteryBoxCompletion" ADD CONSTRAINT "MysteryBoxCompletion_rollId_fkey" FOREIGN KEY ("rollId") REFERENCES "MysteryBoxRoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_mysteryBoxLobbyId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_mysteryBoxLobbyId_fkey" FOREIGN KEY ("mysteryBoxLobbyId") REFERENCES "MysteryBoxLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
