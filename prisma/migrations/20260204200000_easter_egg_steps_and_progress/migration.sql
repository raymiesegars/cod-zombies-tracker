-- AlterEnum
ALTER TYPE "EasterEggType" ADD VALUE 'MUSICAL';

-- CreateTable
CREATE TABLE "EasterEggStep" (
    "id" TEXT NOT NULL,
    "easterEggId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "EasterEggStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEasterEggStepProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "easterEggStepId" TEXT NOT NULL,

    CONSTRAINT "UserEasterEggStepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainEasterEggXpAwarded" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "easterEggId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MainEasterEggXpAwarded_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EasterEggStep_easterEggId_order_key" ON "EasterEggStep"("easterEggId", "order");

-- CreateIndex
CREATE INDEX "EasterEggStep_easterEggId_idx" ON "EasterEggStep"("easterEggId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEasterEggStepProgress_userId_easterEggStepId_key" ON "UserEasterEggStepProgress"("userId", "easterEggStepId");

-- CreateIndex
CREATE INDEX "UserEasterEggStepProgress_userId_idx" ON "UserEasterEggStepProgress"("userId");

-- CreateIndex
CREATE INDEX "UserEasterEggStepProgress_easterEggStepId_idx" ON "UserEasterEggStepProgress"("easterEggStepId");

-- CreateIndex
CREATE UNIQUE INDEX "MainEasterEggXpAwarded_userId_easterEggId_key" ON "MainEasterEggXpAwarded"("userId", "easterEggId");

-- CreateIndex
CREATE INDEX "MainEasterEggXpAwarded_userId_idx" ON "MainEasterEggXpAwarded"("userId");

-- CreateIndex
CREATE INDEX "MainEasterEggXpAwarded_easterEggId_idx" ON "MainEasterEggXpAwarded"("easterEggId");

-- AddForeignKey
ALTER TABLE "EasterEggStep" ADD CONSTRAINT "EasterEggStep_easterEggId_fkey" FOREIGN KEY ("easterEggId") REFERENCES "EasterEgg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEasterEggStepProgress" ADD CONSTRAINT "UserEasterEggStepProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEasterEggStepProgress" ADD CONSTRAINT "UserEasterEggStepProgress_easterEggStepId_fkey" FOREIGN KEY ("easterEggStepId") REFERENCES "EasterEggStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainEasterEggXpAwarded" ADD CONSTRAINT "MainEasterEggXpAwarded_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainEasterEggXpAwarded" ADD CONSTRAINT "MainEasterEggXpAwarded_easterEggId_fkey" FOREIGN KEY ("easterEggId") REFERENCES "EasterEgg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
