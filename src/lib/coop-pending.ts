import prisma from '@/lib/prisma';

/** One pending per teammate (skip creator). Call on initial log create only, not when confirming. */
export async function createCoOpRunPendingsForChallengeLog(
  challengeLogId: string,
  creatorId: string,
  teammateUserIds: string[]
): Promise<void> {
  const toCreate = teammateUserIds.filter((id) => id !== creatorId && id.trim() !== '');
  if (toCreate.length === 0) return;

  await prisma.coOpRunPending.createMany({
    data: toCreate.map((teammateUserId) => ({
      creatorId,
      teammateUserId,
      challengeLogId,
      status: 'PENDING',
    })),
    skipDuplicates: true,
  });
}

export async function createCoOpRunPendingsForEasterEggLog(
  easterEggLogId: string,
  creatorId: string,
  teammateUserIds: string[]
): Promise<void> {
  const toCreate = teammateUserIds.filter((id) => id !== creatorId && id.trim() !== '');
  if (toCreate.length === 0) return;

  await prisma.coOpRunPending.createMany({
    data: toCreate.map((teammateUserId) => ({
      creatorId,
      teammateUserId,
      easterEggLogId,
      status: 'PENDING',
    })),
    skipDuplicates: true,
  });
}
