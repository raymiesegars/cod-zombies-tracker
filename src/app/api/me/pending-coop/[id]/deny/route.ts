import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

/** Deny: mark pending DENIED and remove me from the creator's log teammates. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: pendingId } = await params;
    const pending = await prisma.coOpRunPending.findUnique({
      where: { id: pendingId },
    });

    if (!pending || pending.teammateUserId !== me.id || pending.status !== 'PENDING') {
      return NextResponse.json({ error: 'Not found or already handled' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.coOpRunPending.update({
        where: { id: pendingId },
        data: { status: 'DENIED' },
      });
      if (pending.challengeLogId) {
        const log = await tx.challengeLog.findUnique({
          where: { id: pending.challengeLogId },
          select: { teammateUserIds: true },
        });
        if (log) {
          const next = (log.teammateUserIds || []).filter((id) => id !== me.id);
          await tx.challengeLog.update({
            where: { id: pending.challengeLogId },
            data: { teammateUserIds: next },
          });
        }
      }
      if (pending.easterEggLogId) {
        const log = await tx.easterEggLog.findUnique({
          where: { id: pending.easterEggLogId },
          select: { teammateUserIds: true },
        });
        if (log) {
          const next = (log.teammateUserIds || []).filter((id) => id !== me.id);
          await tx.easterEggLog.update({
            where: { id: pending.easterEggLogId },
            data: { teammateUserIds: next },
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error denying pending co-op:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
