-- Grant all users 3 mystery box tokens on feature launch
-- Run as part of deployment: prisma migrate deploy
UPDATE "User"
SET "mysteryBoxTokens" = 3
WHERE "mysteryBoxTokens" < 3;
