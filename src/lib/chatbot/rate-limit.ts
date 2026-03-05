import prisma from '@/lib/prisma';

const ADMIN_TOKENS_PER_HOUR = 2;
const ADMIN_CAP = 50;
const USER_REFILL_HOURS = 4;
const USER_TOKENS_PER_REFILL = 1;
const USER_CAP = 6;
export const CONTRIBUTOR_CAP = 31;
const CONTRIBUTOR_TOKENS_PER_HOUR = 1;

const REFILL_GRANT_CONTRIBUTOR = 25;

function getCapAndRefill(user: { isAdmin: boolean; isContributor: boolean } | null) {
  const admin = user?.isAdmin ?? false;
  const contributor = user?.isContributor ?? false;
  const cap = admin ? ADMIN_CAP : contributor ? CONTRIBUTOR_CAP : USER_CAP;
  const refillHours = admin ? 1 : contributor ? 1 : USER_REFILL_HOURS;
  const tokensPerRefill = admin ? ADMIN_TOKENS_PER_HOUR : contributor ? CONTRIBUTOR_TOKENS_PER_HOUR : USER_TOKENS_PER_REFILL;
  return { cap, refillHours, tokensPerRefill, isAdmin: admin };
}

export async function getChatbotTokens(userId: string): Promise<{
  remaining: number;
  isAdmin: boolean;
  nextRefillAt: string | null;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true, isContributor: true },
  });
  const { cap, refillHours, tokensPerRefill, isAdmin } = getCapAndRefill(user);

  let row = await prisma.chatbotToken.findUnique({ where: { userId } });
  const now = new Date();
  if (!row) {
    const initialTokens = user?.isContributor ? REFILL_GRANT_CONTRIBUTOR : user?.isAdmin ? ADMIN_TOKENS_PER_HOUR : USER_TOKENS_PER_REFILL;
    row = await prisma.chatbotToken.create({
      data: {
        userId,
        tokensRemaining: Math.min(initialTokens, cap),
        lastRefillAt: now,
      },
    });
  }

  const last = row.lastRefillAt.getTime();
  const elapsedMs = now.getTime() - last;
  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const refillCount = Math.floor(elapsedHours / refillHours);
  let refillBase = last;
  let currentRemaining = row.tokensRemaining;

  if (refillCount > 0) {
    const add = Math.min(refillCount * tokensPerRefill, Math.max(0, cap - row.tokensRemaining));
    currentRemaining = Math.min(row.tokensRemaining + add, cap);
    const advanceHours = refillCount * refillHours;
    refillBase = last + advanceHours * 60 * 60 * 1000;
    await prisma.chatbotToken.update({
      where: { userId },
      data: { tokensRemaining: currentRemaining, lastRefillAt: new Date(refillBase) },
    });
  }

  const nextRefillAt =
    currentRemaining >= cap
      ? null
      : new Date(refillBase + refillHours * 60 * 60 * 1000).toISOString();

  return {
    remaining: Math.min(currentRemaining, cap),
    isAdmin,
    nextRefillAt,
  };
}

export async function grantContributorTokens(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isContributor: true },
  });
  if (!user?.isContributor) return;

  const row = await prisma.chatbotToken.findUnique({ where: { userId } });
  const now = new Date();
  const current = row?.tokensRemaining ?? 0;
  const add = Math.min(REFILL_GRANT_CONTRIBUTOR, CONTRIBUTOR_CAP - current);

  if (add <= 0) return;

  if (row) {
    await prisma.chatbotToken.update({
      where: { userId },
      data: {
        tokensRemaining: Math.min(current + add, CONTRIBUTOR_CAP),
        lastRefillAt: now,
      },
    });
  } else {
    await prisma.chatbotToken.create({
      data: {
        userId,
        tokensRemaining: Math.min(REFILL_GRANT_CONTRIBUTOR, CONTRIBUTOR_CAP),
        lastRefillAt: now,
      },
    });
  }
}

export async function consumeChatbotToken(userId: string): Promise<{ consumed: boolean; remaining: number }> {
  const { remaining } = await getChatbotTokens(userId);
  if (remaining <= 0) return { consumed: false, remaining: 0 };

  const row = await prisma.chatbotToken.findUnique({ where: { userId } });
  if (!row || row.tokensRemaining <= 0) return { consumed: false, remaining };

  const newRemaining = row.tokensRemaining - 1;
  await prisma.chatbotToken.update({
    where: { userId },
    data: { tokensRemaining: newRemaining },
  });
  return { consumed: true, remaining: newRemaining };
}
