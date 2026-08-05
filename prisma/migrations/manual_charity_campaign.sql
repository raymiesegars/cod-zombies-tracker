-- CharityCampaign for ZCS-3 (and future events)
-- Apply via: pnpm db:push   (or run this SQL on your DB if preferred)

CREATE TABLE IF NOT EXISTS "CharityCampaign" (
  "id" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL DEFAULT 0,
  "goalCents" INTEGER NOT NULL DEFAULT 50000,
  "merchUrl" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CharityCampaign_pkey" PRIMARY KEY ("id")
);
