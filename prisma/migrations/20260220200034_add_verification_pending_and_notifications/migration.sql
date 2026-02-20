-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('VERIFICATION_APPROVED', 'VERIFICATION_DENIED');

-- AlterTable
ALTER TABLE "ChallengeLog" ADD COLUMN     "verificationRequestedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "EasterEggLog" ADD COLUMN     "verificationRequestedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "challengeLogId" TEXT,
    "easterEggLogId" TEXT,
    "message" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_challengeLogId_fkey" FOREIGN KEY ("challengeLogId") REFERENCES "ChallengeLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_easterEggLogId_fkey" FOREIGN KEY ("easterEggLogId") REFERENCES "EasterEggLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
