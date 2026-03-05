import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const status = body.status === 'APPROVED' || body.status === 'REJECTED' ? body.status : null;
    if (!status) return NextResponse.json({ error: 'status must be APPROVED or REJECTED' }, { status: 400 });

    const row = await prisma.chatbotKnowledge.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (row.status !== 'PENDING') return NextResponse.json({ error: 'Already reviewed' }, { status: 400 });

    await prisma.chatbotKnowledge.update({
      where: { id },
      data: {
        status,
        reviewedById: me.id,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error('Chatbot knowledge review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
