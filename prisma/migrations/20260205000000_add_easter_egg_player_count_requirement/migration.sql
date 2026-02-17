-- CreateEnum
CREATE TYPE "PlayerCountRequirement" AS ENUM ('SOLO', 'DUO', 'TRIO', 'SQUAD');

-- AlterTable
ALTER TABLE "EasterEgg" ADD COLUMN "playerCountRequirement" "PlayerCountRequirement";
