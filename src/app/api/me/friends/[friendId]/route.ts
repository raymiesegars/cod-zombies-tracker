import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** Remove a friend. Both users are no longer friends. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ friendId: string }> }
) {
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

    const { friendId } = await params;
    if (!friendId) {
      return NextResponse.json({ error: 'friendId is required' }, { status: 400 });
    }

    if (friendId === me.id) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    }

    const fr = await prisma.friendRequest.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { fromUserId: me.id, toUserId: friendId },
          { fromUserId: friendId, toUserId: me.id },
        ],
      },
      select: { id: true, fromUserId: true, toUserId: true },
    });
    if (!fr) {
      return NextResponse.json({ error: 'Not friends with this user' }, { status: 404 });
    }

    const otherUserId = fr.fromUserId === me.id ? fr.toUserId : fr.fromUserId;

    await prisma.friendRequest.delete({
      where: { id: fr.id },
    });

    const myLabel = (me.displayName && me.displayName.trim()) || me.username || 'Someone';
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: NotificationType.FRIEND_REMOVED,
        message: `${myLabel} removed you from their friends list`,
        read: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
