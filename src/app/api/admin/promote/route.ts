import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** Promote a user to admin. Only super admins (SUPER_ADMIN_USER_IDS) can promote. */
export async function POST(request: NextRequest) {
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
    if (!isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden: super admin only' }, { status: 403 });
    }

    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isAdmin: true },
    });
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (target.isAdmin) {
      return NextResponse.json({ error: 'User is already an admin' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
