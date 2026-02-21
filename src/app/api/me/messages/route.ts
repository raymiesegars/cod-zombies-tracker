import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const dynamic = 'force-dynamic';

// GET /api/me/messages – list all conversations + total unread count
export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userId = user.id;

    // Grab recent messages to derive distinct conversation partners
    const allMessages: Array<{ id: string; fromUserId: string; toUserId: string; content: string; readAt: string | null; createdAt: Date }> =
      await db.directMessage.findMany({
        where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
        orderBy: { createdAt: 'desc' },
        select: { id: true, fromUserId: true, toUserId: true, content: true, readAt: true, createdAt: true },
        take: 1000,
      });

    // Derive unique conversation partners (preserving recency order)
    const seenPartners = new Set<string>();
    const partnerIds: string[] = [];
    for (const msg of allMessages) {
      const partnerId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      if (!seenPartners.has(partnerId)) {
        seenPartners.add(partnerId);
        partnerIds.push(partnerId);
      }
    }

    // Total unread (messages sent TO me that I haven't read)
    const totalUnread: number = await db.directMessage.count({
      where: { toUserId: userId, readAt: null },
    });

    if (partnerIds.length === 0) {
      return NextResponse.json({ conversations: [], totalUnread: 0 });
    }

    // Fetch user info for all partners
    const partnerUsers = await prisma.user.findMany({
      where: { id: { in: partnerIds } },
      select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true, lastSeenAt: true },
    });
    const partnerMap = Object.fromEntries(partnerUsers.map((u) => [u.id, u]));

    // Build conversations
    const conversations = partnerIds.map((partnerId) => {
      const messagesWithPartner = allMessages.filter(
        (m) => (m.fromUserId === partnerId && m.toUserId === userId) || (m.fromUserId === userId && m.toUserId === partnerId)
      );
      const lastMessage = messagesWithPartner[0] ?? null;
      const unreadCount = messagesWithPartner.filter((m) => m.fromUserId === partnerId && m.readAt == null).length;
      const partnerUser = partnerMap[partnerId];
      if (!partnerUser) return null;
      const isOnline = partnerUser.lastSeenAt != null && Date.now() - new Date(partnerUser.lastSeenAt).getTime() < 5 * 60 * 1000;
      return {
        user: { ...partnerUser, isOnline },
        lastMessage: lastMessage ? { content: lastMessage.content, createdAt: lastMessage.createdAt, isFromMe: lastMessage.fromUserId === userId } : null,
        unreadCount,
      };
    }).filter(Boolean);

    return NextResponse.json({ conversations, totalUnread });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
