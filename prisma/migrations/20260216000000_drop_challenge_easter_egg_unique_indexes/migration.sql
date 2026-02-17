-- Allow multiple runs per user+challenge+map+playerCount (and easter egg equivalent).
-- Original schema used CREATE UNIQUE INDEX; must drop the index, not a constraint.
DROP INDEX IF EXISTS "ChallengeLog_userId_challengeId_mapId_playerCount_key";
DROP INDEX IF EXISTS "EasterEggLog_userId_easterEggId_playerCount_key";
