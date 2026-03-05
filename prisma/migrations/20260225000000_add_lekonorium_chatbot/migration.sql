-- CreateTable
CREATE TABLE "ChatbotKnowledge" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "category" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokensRemaining" INTEGER NOT NULL DEFAULT 0,
    "lastRefillAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatbotKnowledge_status_idx" ON "ChatbotKnowledge"("status");

-- CreateIndex
CREATE INDEX "ChatbotKnowledge_submittedById_idx" ON "ChatbotKnowledge"("submittedById");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotToken_userId_key" ON "ChatbotToken"("userId");

-- CreateIndex
CREATE INDEX "ChatbotToken_userId_idx" ON "ChatbotToken"("userId");

-- AddForeignKey
ALTER TABLE "ChatbotKnowledge" ADD CONSTRAINT "ChatbotKnowledge_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotKnowledge" ADD CONSTRAINT "ChatbotKnowledge_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotToken" ADD CONSTRAINT "ChatbotToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
