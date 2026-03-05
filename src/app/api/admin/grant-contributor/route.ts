import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { grantContributorTokens } from '@/lib/chatbot/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    if (!username) return NextResponse.json({ error: 'username is required' }, { status: 400 });

    const target = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, isContributor: true },
    });
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.user.update({
      where: { id: target.id },
      data: { isContributor: true },
    });
    await grantContributorTokens(target.id);
    return NextResponse.json({ ok: true, username: target.username });
  } catch (error) {
    console.error('Grant contributor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
