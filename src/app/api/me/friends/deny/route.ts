import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Deny a friend request. */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const friendRequestId = typeof body.friendRequestId === 'string' ? body.friendRequestId.trim() : '';
    if (!friendRequestId) {
      return NextResponse.json({ error: 'friendRequestId is required' }, { status: 400 });
    }

    const fr = await prisma.friendRequest.findUnique({
      where: { id: friendRequestId },
      select: { id: true, toUserId: true, status: true },
    });
    if (!fr) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }
    if (fr.toUserId !== me.id) {
      return NextResponse.json({ error: 'You can only deny requests sent to you' }, { status: 403 });
    }
    if (fr.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already accepted or denied' }, { status: 400 });
    }

    await prisma.friendRequest.update({
      where: { id: friendRequestId },
      data: { status: 'DENIED' },
    });

    await prisma.notification.deleteMany({
      where: { userId: me.id, type: 'FRIEND_REQUEST_RECEIVED', friendRequestId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error denying friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
