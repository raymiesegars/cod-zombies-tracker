/*
  Warnings:

  - You are about to drop the column `avatarPreset` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable (IF EXISTS so production runs that never had the column do not fail)
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarPreset";
