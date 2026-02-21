import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** Send a friend request to another user. */
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
    const toUserId = typeof body.toUserId === 'string' ? body.toUserId.trim() : '';
    if (!toUserId) {
      return NextResponse.json({ error: 'toUserId is required' }, { status: 400 });
    }

    if (toUserId === me.id) {
      return NextResponse.json({ error: 'Cannot send a friend request to yourself' }, { status: 400 });
    }

    const toUser = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true },
    });
    if (!toUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { fromUserId: me.id, toUserId },
          { fromUserId: toUserId, toUserId: me.id },
        ],
      },
      select: { status: true, fromUserId: true },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'Already friends with this user' }, { status: 400 });
      }
      if (existing.status === 'PENDING') {
        if (existing.fromUserId === me.id) {
          return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
        }
        return NextResponse.json({ error: 'They already sent you a request — accept it from your notifications' }, { status: 400 });
      }
    }

    const req = await prisma.friendRequest.upsert({
      where: {
        fromUserId_toUserId: { fromUserId: me.id, toUserId },
      },
      create: {
        fromUserId: me.id,
        toUserId,
        status: 'PENDING',
      },
      update: { status: 'PENDING' },
      select: { id: true },
    });

    const fr = await prisma.friendRequest.findUnique({
      where: { id: req.id },
      select: { id: true },
    });
    if (fr) {
      const requesterLabel = (me.displayName && me.displayName.trim()) || me.username || 'Someone';
      await prisma.notification.create({
        data: {
          userId: toUserId,
          type: NotificationType.FRIEND_REQUEST_RECEIVED,
          friendRequestId: fr.id,
          message: `${requesterLabel} sent you a friend request`,
          read: false,
        },
      });
    }

    return NextResponse.json({ ok: true, friendRequestId: req.id });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
