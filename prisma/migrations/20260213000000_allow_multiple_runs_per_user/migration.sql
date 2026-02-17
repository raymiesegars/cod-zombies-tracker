-- Drop unique index: allow multiple challenge logs per user+challenge+map+playerCount (keep all runs)
-- Original migration created these with CREATE UNIQUE INDEX, so we must DROP INDEX not DROP CONSTRAINT
DROP INDEX IF EXISTS "ChallengeLog_userId_challengeId_mapId_playerCount_key";

-- Drop unique index: allow multiple easter egg logs per user+easterEgg+playerCount (keep all runs)
DROP INDEX IF EXISTS "EasterEggLog_userId_easterEggId_playerCount_key";
