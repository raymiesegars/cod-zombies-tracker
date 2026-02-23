-- BOCW / BO6 / BO7: Rampage Inducer filter. Default false = No Rampage Inducer.
-- Leaderboards default to "No Rampage Inducer"; user can switch to "Rampage Inducer".
ALTER TABLE "ChallengeLog"
  ADD COLUMN IF NOT EXISTS "rampageInducerUsed" BOOLEAN DEFAULT false;

ALTER TABLE "EasterEggLog"
  ADD COLUMN IF NOT EXISTS "rampageInducerUsed" BOOLEAN DEFAULT false;
