import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** POST: Invite a friend to the lobby. Body: { friendUserId: string } */
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

    const body = await request.json().catch(() => ({}));
    const friendUserId = body.friendUserId;
    if (typeof friendUserId !== 'string') {
      return NextResponse.json({ error: 'friendUserId required' }, { status: 400 });
    }

    // Must be host of a lobby
    const lobby = await prisma.mysteryBoxLobby.findFirst({
      where: { hostId: me.id },
      include: { members: true, currentRoll: true },
    });
    if (!lobby) {
      return NextResponse.json({ error: 'You must host a lobby to invite' }, { status: 400 });
    }

    // Can't invite when there's an active roll (not completed/discarded)
    if (lobby.currentRoll && !lobby.currentRoll.completedByHost) {
      return NextResponse.json(
        { error: 'Invites are locked while a challenge is active. Log it or discard it first.' },
        { status: 400 }
      );
    }

    if (lobby.members.length >= 3) {
      return NextResponse.json({ error: 'Lobby is full (max 4 players)' }, { status: 400 });
    }

    const alreadyIn = lobby.members.some((m) => m.userId === friendUserId);
    if (alreadyIn) {
      return NextResponse.json({ error: 'Friend is already in the lobby' }, { status: 400 });
    }

    // Verify friend relationship
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { fromUserId: me.id, toUserId: friendUserId },
          { fromUserId: friendUserId, toUserId: me.id },
        ],
      },
    });
    if (!friendRequest) {
      return NextResponse.json({ error: 'User is not on your friends list' }, { status: 400 });
    }

    const friend = await prisma.user.findUnique({
      where: { id: friendUserId },
      select: { username: true },
    });
    if (!friend) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const myProfile = await prisma.user.findUnique({
      where: { id: me.id },
      select: { username: true, displayName: true },
    });

    await prisma.notification.create({
      data: {
        userId: friendUserId,
        type: 'MYSTERY_BOX_INVITE',
        mysteryBoxLobbyId: lobby.id,
        message: `${myProfile?.displayName ?? myProfile?.username ?? 'Someone'} invited you to their Mystery Box lobby!`,
        read: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error inviting to mystery box lobby:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
