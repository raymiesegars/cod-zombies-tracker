import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** DELETE: Kick a member from the lobby. Host only. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

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

    const lobby = await prisma.mysteryBoxLobby.findFirst({
      where: { hostId: me.id },
    });
    if (!lobby) {
      return NextResponse.json({ error: 'You must host the lobby to kick members' }, { status: 400 });
    }

    if (targetUserId === me.id) {
      return NextResponse.json({ error: 'You cannot kick yourself. Use Leave Group to leave.' }, { status: 400 });
    }

    const membership = await prisma.mysteryBoxLobbyMember.findFirst({
      where: { lobbyId: lobby.id, userId: targetUserId },
    });
    if (!membership) {
      return NextResponse.json({ error: 'User is not a member of this lobby' }, { status: 400 });
    }

    await prisma.mysteryBoxLobbyMember.delete({ where: { id: membership.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error kicking member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
