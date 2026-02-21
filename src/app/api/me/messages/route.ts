import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

// Temporary until `prisma migrate deploy && prisma generate` adds DirectMessage to the client
type RawMsg = { id: string; fromUserId: string; toUserId: string; content: string; readAt: string | null; createdAt: Date };
const dm = (prisma as unknown as Record<string, unknown>).directMessage as {
  findMany: (a: object) => Promise<RawMsg[]>;
  count: (a: object) => Promise<number>;
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userId = user.id;

    const allMessages = await dm.findMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
      orderBy: { createdAt: 'desc' },
      select: { id: true, fromUserId: true, toUserId: true, content: true, readAt: true, createdAt: true },
      take: 1000,
    });

    const seenPartners = new Set<string>();
    const partnerIds: string[] = [];
    for (const msg of allMessages) {
      const partnerId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      if (!seenPartners.has(partnerId)) { seenPartners.add(partnerId); partnerIds.push(partnerId); }
    }

    const totalUnread = await dm.count({ where: { toUserId: userId, readAt: null } });

    if (partnerIds.length === 0) return NextResponse.json({ conversations: [], totalUnread: 0 });

    const partnerUsers = await prisma.user.findMany({
      where: { id: { in: partnerIds } },
      select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true, lastSeenAt: true },
    });
    const partnerMap = Object.fromEntries(partnerUsers.map((u) => [u.id, u]));

    const conversations = partnerIds.map((partnerId) => {
      const msgs = allMessages.filter(
        (m) => (m.fromUserId === partnerId && m.toUserId === userId) || (m.fromUserId === userId && m.toUserId === partnerId)
      );
      const lastMessage = msgs[0] ?? null;
      const unreadCount = msgs.filter((m) => m.fromUserId === partnerId && m.readAt == null).length;
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
