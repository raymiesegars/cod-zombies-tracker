import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { hasEasterEggAdminAccess } from '@/lib/admin';

export const dynamic = 'force-dynamic';

async function requireEasterEggAdmin() {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized' as const, status: 401 as const, user: null };
  const me = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true, isEasterEggAdmin: true },
  });
  if (!me || !hasEasterEggAdminAccess(me)) return { error: 'Forbidden' as const, status: 403 as const, user: null };
  return { user: me, error: null, status: null };
}

/** PATCH: Update a step. Body: { order?, label?, imageUrl?, buildableReferenceSlug? } */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const auth = await requireEasterEggAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { stepId } = await params;
  const existing = await prisma.easterEggStep.findUnique({
    where: { id: stepId },
    include: {
      easterEgg: { include: { map: { select: { slug: true } } } },
    },
  });
  if (!existing) return NextResponse.json({ error: 'Step not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const updates: { order?: number; label?: string; imageUrl?: string | null; buildableReferenceSlug?: string | null } = {};

  if (typeof body.order === 'number') {
    const newOrder = Math.max(1, Math.floor(body.order));
    if (newOrder !== existing.order) {
      const { easterEggId } = existing;
      if (newOrder > existing.order) {
        const stepsToShift = await prisma.easterEggStep.findMany({
          where: { easterEggId, order: { gt: existing.order, lte: newOrder } },
        });
        for (const s of stepsToShift) {
          await prisma.easterEggStep.update({ where: { id: s.id }, data: { order: s.order - 1 } });
        }
      } else {
        const stepsToShift = await prisma.easterEggStep.findMany({
          where: { easterEggId, order: { gte: newOrder, lt: existing.order } },
        });
        for (const s of stepsToShift) {
          await prisma.easterEggStep.update({ where: { id: s.id }, data: { order: s.order + 1 } });
        }
      }
      updates.order = newOrder;
    }
  }
  if (typeof body.label === 'string') updates.label = body.label.trim();
  if (typeof body.imageUrl === 'string') updates.imageUrl = body.imageUrl.trim() || null;
  if (typeof body.buildableReferenceSlug === 'string') updates.buildableReferenceSlug = body.buildableReferenceSlug.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(existing);
  }

  const step = await prisma.easterEggStep.update({
    where: { id: stepId },
    data: updates,
  });

  const mapSlug = existing.easterEgg?.map?.slug;
  if (mapSlug) revalidatePath(`/maps/${mapSlug}`);
  return NextResponse.json(step);
}

/** DELETE: Remove a step. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const auth = await requireEasterEggAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { stepId } = await params;
  const existing = await prisma.easterEggStep.findUnique({
    where: { id: stepId },
    include: {
      easterEgg: { include: { map: { select: { slug: true } } } },
    },
  });
  if (!existing) return NextResponse.json({ error: 'Step not found' }, { status: 404 });

  const easterEggId = existing.easterEggId;
  await prisma.easterEggStep.delete({ where: { id: stepId } });

  const stepsAbove = await prisma.easterEggStep.findMany({
    where: { easterEggId, order: { gt: existing.order } },
    orderBy: { order: 'asc' },
  });
  for (const s of stepsAbove) {
    await prisma.easterEggStep.update({ where: { id: s.id }, data: { order: s.order - 1 } });
  }

  const mapSlug = existing.easterEgg?.map?.slug;
  if (mapSlug) revalidatePath(`/maps/${mapSlug}`);
  return NextResponse.json({ ok: true });
}
