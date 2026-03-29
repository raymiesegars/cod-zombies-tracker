import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { rollbackUserMerge } from '@/lib/user-merge';

export const dynamic = 'force-dynamic';

async function requireSuperAdmin() {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized', status: 401 as const, userId: null };
  const me = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true },
  });
  if (!me || !isSuperAdmin(me.id)) {
    return { error: 'Forbidden: super admin only', status: 403 as const, userId: null };
  }
  return { error: null, status: 200 as const, userId: me.id };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error || !auth.userId) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const auditId = typeof body.auditId === 'string' ? body.auditId.trim() : '';
    if (!auditId) return NextResponse.json({ error: 'auditId is required' }, { status: 400 });

    await rollbackUserMerge(auditId, auth.userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = /required|not found|cannot|archived|rollback/i.test(message) ? 400 : 500;
    if (status === 500) console.error('Error rolling back merge:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

