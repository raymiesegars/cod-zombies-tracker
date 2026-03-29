import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { listUserMergeHistory } from '@/lib/user-merge';

export const dynamic = 'force-dynamic';

async function requireSuperAdmin() {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized', status: 401 as const };
  const me = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true },
  });
  if (!me || !isSuperAdmin(me.id)) {
    return { error: 'Forbidden: super admin only', status: 403 as const };
  }
  return { error: null, status: 200 as const };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const limitRaw = parseInt(request.nextUrl.searchParams.get('limit') ?? '100', 10);
    const limit = Number.isFinite(limitRaw) ? limitRaw : 100;
    const rows = await listUserMergeHistory(limit);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Error listing merge history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

