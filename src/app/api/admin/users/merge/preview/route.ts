import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { previewUserMerge } from '@/lib/user-merge';

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
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const sourceUserId = typeof body.sourceUserId === 'string' ? body.sourceUserId.trim() : '';
    const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId.trim() : '';
    if (!sourceUserId || !targetUserId) {
      return NextResponse.json({ error: 'sourceUserId and targetUserId are required' }, { status: 400 });
    }

    const preview = await previewUserMerge(sourceUserId, targetUserId);
    return NextResponse.json({ preview });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = /not found|archived|Cannot merge|required/i.test(message) ? 400 : 500;
    if (status === 500) console.error('Error previewing user merge:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

