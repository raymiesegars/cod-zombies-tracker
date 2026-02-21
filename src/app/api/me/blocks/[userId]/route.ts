import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type Params = { params: Promise<{ userId: string }> };

// DELETE /api/me/blocks/[userId] – unblock a user
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { userId: blockedId } = await params;

    await db.userBlock.deleteMany({
      where: { blockerId: me.id, blockedId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
