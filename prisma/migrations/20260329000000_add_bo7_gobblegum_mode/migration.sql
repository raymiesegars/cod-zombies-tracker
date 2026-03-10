-- BO7 only: GobbleGum mode — 'WITH_GOBBLEGUMS' | 'NO_GOBBLEGUMS' (required for BO7 challenge logs)
ALTER TABLE "ChallengeLog"
  ADD COLUMN IF NOT EXISTS "bo7GobbleGumMode" TEXT;
