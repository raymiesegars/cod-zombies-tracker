import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** Accept a friend request. */
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, username: true, displayName: true },
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
      select: { id: true, fromUserId: true, toUserId: true, status: true },
    });
    if (!fr) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }
    if (fr.toUserId !== me.id) {
      return NextResponse.json({ error: 'You can only accept requests sent to you' }, { status: 403 });
    }
    if (fr.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already accepted or denied' }, { status: 400 });
    }

    await prisma.friendRequest.update({
      where: { id: friendRequestId },
      data: { status: 'ACCEPTED' },
    });

    await prisma.notification.deleteMany({
      where: { userId: me.id, type: 'FRIEND_REQUEST_RECEIVED', friendRequestId },
    });

    const myLabel = (me.displayName && me.displayName.trim()) || me.username || 'Someone';
    await prisma.notification.create({
      data: {
        userId: fr.fromUserId,
        type: NotificationType.FRIEND_REQUEST_ACCEPTED,
        friendRequestId: fr.id,
        message: `${myLabel} is now your friend`,
        read: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
