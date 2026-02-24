import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** POST: Accept mystery box invite. Body: { notificationId: string } */
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
    const notificationId = body.notificationId;
    if (typeof notificationId !== 'string') {
      return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
    }

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId: me.id, type: 'MYSTERY_BOX_INVITE' },
      include: {
        mysteryBoxLobby: { include: { currentRoll: true } },
      },
    });
    if (!notification?.mysteryBoxLobbyId || !notification.mysteryBoxLobby) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
    }

    const lobby = notification.mysteryBoxLobby;

    // Host's lobby has active roll? Cannot join until they log or discard.
    const hasActiveRoll = lobby.currentRoll && !lobby.currentRoll.completedByHost;
    if (hasActiveRoll) {
      await prisma.notification.delete({ where: { id: notificationId } });
      return NextResponse.json(
        {
          error: 'LOBBY_ALREADY_ROLLED',
          message:
            "The host has already spun. Invites are locked until the challenge is logged or discarded. Ask them to discard the roll if you'd like to join and spin together.",
        },
        { status: 400 }
      );
    }

    // Do I have an active challenge? (hosting solo with uncompleted roll) - must reset first
    const myHostedLobby = await prisma.mysteryBoxLobby.findFirst({
      where: { hostId: me.id },
      include: { currentRoll: true, members: true },
    });
    if (myHostedLobby?.currentRoll && !myHostedLobby.currentRoll.completedByHost && myHostedLobby.members.length === 0) {
      return NextResponse.json(
        {
          error: 'YOU_HAVE_ACTIVE_CHALLENGE',
          message: 'Reset your current challenge first to join a group. Use the Reset Challenge button when playing solo.',
        },
        { status: 400 }
      );
    }

    // Already in this lobby?
    const existingMember = await prisma.mysteryBoxLobbyMember.findFirst({
      where: { userId: me.id, lobbyId: lobby.id },
    });
    if (existingMember) {
      await prisma.notification.delete({ where: { id: notificationId } });
      return NextResponse.json({ ok: true, lobbyId: lobby.id, message: 'Already in this lobby' });
    }

    // Remove me from any other lobby (host or member)
    const inOtherLobby = await prisma.mysteryBoxLobbyMember.findFirst({
      where: { userId: me.id },
    });
    if (inOtherLobby) {
      await prisma.mysteryBoxLobbyMember.delete({ where: { id: inOtherLobby.id } });
    } else if (myHostedLobby && myHostedLobby.id !== lobby.id) {
      await prisma.mysteryBoxLobby.delete({ where: { id: myHostedLobby.id } });
    }

    // Lobby full?
    const memberCount = await prisma.mysteryBoxLobbyMember.count({
      where: { lobbyId: lobby.id },
    });
    if (memberCount >= 3) {
      return NextResponse.json({ error: 'Lobby is full' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.mysteryBoxLobbyMember.create({
        data: { lobbyId: lobby.id, userId: me.id },
      }),
      prisma.notification.delete({ where: { id: notificationId } }),
    ]);

    return NextResponse.json({ ok: true, lobbyId: lobby.id });
  } catch (error) {
    console.error('Error accepting mystery box invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
