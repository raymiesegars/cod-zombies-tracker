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

/** POST: Reject a map submission. Body: { rejectionReason?: string } */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const submission = await prisma.mapSubmission.findUnique({ where: { id } });

  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  if (submission.status !== 'PENDING') {
    return NextResponse.json({ error: `Submission already ${submission.status}` }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const rejectionReason = typeof body.rejectionReason === 'string' ? body.rejectionReason.trim().slice(0, 500) || null : null;

  await prisma.mapSubmission.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reviewedById: auth.user!.id,
      reviewedAt: new Date(),
      rejectionReason,
    },
  });

  return NextResponse.json({ ok: true });
}
