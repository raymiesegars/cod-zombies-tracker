import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true, adminDashboardSeen: true },
    });
    if (!me || !me.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const tab = typeof body.tab === 'string' ? body.tab : '';
    const seen = (me.adminDashboardSeen as { feedbackAt?: string; verifiedHistoryAt?: string } | null) ?? {};
    const now = new Date().toISOString();

    if (tab === 'feedback') seen.feedbackAt = now;
    else if (tab === 'verifiedHistory') seen.verifiedHistoryAt = now;

    await prisma.user.update({
      where: { id: me.id },
      data: { adminDashboardSeen: seen },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating dashboard seen:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
