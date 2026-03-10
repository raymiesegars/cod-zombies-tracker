import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized' as const, status: 401 as const, user: null };
  const me = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true, isAdmin: true },
  });
  if (!me || !me.isAdmin) return { error: 'Forbidden' as const, status: 403 as const, user: null };
  return { user: me, error: null, status: null };
}

/** GET: List map submissions. Query: status (PENDING | APPROVED | REJECTED), default PENDING. */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status')?.toUpperCase() || 'PENDING';
  const validStatus = ['PENDING', 'APPROVED', 'REJECTED'].includes(status) ? status : 'PENDING';

  const submissions = await prisma.mapSubmission.findMany({
    where: { status: validStatus },
    include: {
      submittedBy: { select: { id: true, username: true, displayName: true } },
      game: { select: { shortName: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ submissions });
}
