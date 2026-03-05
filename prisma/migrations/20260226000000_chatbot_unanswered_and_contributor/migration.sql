-- AlterTable User: contributor status
ALTER TABLE "User" ADD COLUMN "isContributor" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable ChatbotUnansweredQuestion
CREATE TABLE "ChatbotUnansweredQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotUnansweredQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatbotUnansweredQuestion_userId_idx" ON "ChatbotUnansweredQuestion"("userId");

-- CreateIndex
CREATE INDEX "ChatbotUnansweredQuestion_createdAt_idx" ON "ChatbotUnansweredQuestion"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ChatbotUnansweredQuestion" ADD CONSTRAINT "ChatbotUnansweredQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
