-- AlterTable (EasterEggType enum: add BUILDABLE - run prisma migrate, it may generate the enum change)
-- Add variantTag column
ALTER TABLE "EasterEgg" ADD COLUMN IF NOT EXISTS "variantTag" TEXT;
