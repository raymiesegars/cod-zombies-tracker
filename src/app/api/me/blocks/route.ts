import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const dynamic = 'force-dynamic';

// GET /api/me/blocks – list users I've blocked
export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const blocks = await db.userBlock.findMany({
      where: { blockerId: me.id },
      include: {
        blocked: { select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ blocked: blocks.map((b: { blocked: unknown }) => b.blocked) });
  } catch (error) {
    console.error('Error fetching block list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/me/blocks – block a user { blockedUserId }
export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { blockedUserId } = await req.json();
    if (!blockedUserId || blockedUserId === me.id) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: blockedUserId }, select: { id: true } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await db.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId: me.id, blockedId: blockedUserId } },
      create: { blockerId: me.id, blockedId: blockedUserId },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
