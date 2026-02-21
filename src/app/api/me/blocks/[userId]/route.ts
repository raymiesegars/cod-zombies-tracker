import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

// Temporary until `prisma migrate deploy && prisma generate` adds UserBlock to the client
const ub = (prisma as unknown as Record<string, unknown>).userBlock as {
  deleteMany: (a: object) => Promise<void>;
};

type Params = { params: Promise<{ userId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { userId: blockedId } = await params;
    await ub.deleteMany({ where: { blockerId: me.id, blockedId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
