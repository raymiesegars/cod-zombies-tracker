import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

// Temporary until `prisma migrate deploy && prisma generate` adds models to the client
type RawMsg = { id: string; fromUserId: string; toUserId: string; content: string; readAt: string | null; createdAt: Date };
type BlockRow = { id: string } | null;
const dm = (prisma as unknown as Record<string, unknown>).directMessage as {
  findMany: (a: object) => Promise<RawMsg[]>;
  create: (a: object) => Promise<RawMsg>;
  updateMany: (a: object) => Promise<void>;
};
const ub = (prisma as unknown as Record<string, unknown>).userBlock as {
  findUnique: (a: object) => Promise<BlockRow>;
};

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ userId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { userId: otherId } = await params;
    const otherUser = await prisma.user.findUnique({
      where: { id: otherId },
      select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true, lastSeenAt: true },
    });
    if (!otherUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [iBlockedThem, theyBlockedMe] = await Promise.all([
      ub.findUnique({ where: { blockerId_blockedId: { blockerId: me.id, blockedId: otherId } } }),
      ub.findUnique({ where: { blockerId_blockedId: { blockerId: otherId, blockedId: me.id } } }),
    ]);

    const messages = await dm.findMany({
      where: { OR: [{ fromUserId: me.id, toUserId: otherId }, { fromUserId: otherId, toUserId: me.id }] },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    await dm.updateMany({ where: { fromUserId: otherId, toUserId: me.id, readAt: null }, data: { readAt: new Date() } });

    const isOnline = otherUser.lastSeenAt != null && Date.now() - new Date(otherUser.lastSeenAt).getTime() < 5 * 60 * 1000;
    return NextResponse.json({ messages, otherUser: { ...otherUser, isOnline }, iBlockedThem: !!iBlockedThem, theyBlockedMe: !!theyBlockedMe });
  } catch (error) {
    console.error('Error fetching message thread:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { userId: toId } = await params;
    if (toId === me.id) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });

    const toUser = await prisma.user.findUnique({ where: { id: toId }, select: { id: true } });
    if (!toUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [iBlockedThem, theyBlockedMe] = await Promise.all([
      ub.findUnique({ where: { blockerId_blockedId: { blockerId: me.id, blockedId: toId } } }),
      ub.findUnique({ where: { blockerId_blockedId: { blockerId: toId, blockedId: me.id } } }),
    ]);

    if (iBlockedThem) return NextResponse.json({ error: 'Unblock this user before sending a message.' }, { status: 403 });
    if (theyBlockedMe) return NextResponse.json({ error: 'blocked', code: 'BLOCKED_BY_RECIPIENT' }, { status: 403 });

    const body = await req.json();
    const content = typeof body.content === 'string' ? body.content.trim().slice(0, 2000) : '';
    if (!content) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });

    const message = await dm.create({ data: { fromUserId: me.id, toUserId: toId, content } });
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
