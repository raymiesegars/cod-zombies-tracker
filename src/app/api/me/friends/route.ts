import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { getDisplayAvatarUrl } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 min

/** List current user's friends with online status. */
export async function GET() {
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

    const accepted = await prisma.friendRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ fromUserId: me.id }, { toUserId: me.id }],
      },
      include: {
        fromUser: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true, lastSeenAt: true },
        },
        toUser: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true, lastSeenAt: true },
        },
      },
    });

    const now = Date.now();
    const friends = accepted.map((fr) => {
      const friend = fr.fromUserId === me.id ? fr.toUser : fr.fromUser;
      const lastSeen = friend.lastSeenAt ? friend.lastSeenAt.getTime() : null;
      const isOnline = lastSeen != null && now - lastSeen < ONLINE_THRESHOLD_MS;
      return {
        id: friend.id,
        username: friend.username,
        displayName: friend.displayName ?? friend.username,
        avatarUrl: getDisplayAvatarUrl(friend),
        isOnline,
        lastSeenAt: friend.lastSeenAt?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
