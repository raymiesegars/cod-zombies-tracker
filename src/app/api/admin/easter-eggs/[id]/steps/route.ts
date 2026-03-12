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

/** POST: Add a new step to an easter egg. Body: { order, label, imageUrl?, buildableReferenceSlug? } */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireEasterEggAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: easterEggId } = await params;
  const ee = await prisma.easterEgg.findUnique({
    where: { id: easterEggId },
    include: { map: { select: { slug: true } } },
  });
  if (!ee) return NextResponse.json({ error: 'Easter egg not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const order = typeof body.order === 'number' ? Math.max(1, Math.floor(body.order)) : undefined;
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  if (!label) return NextResponse.json({ error: 'label is required' }, { status: 400 });

  const maxOrder = await prisma.easterEggStep.aggregate({
    where: { easterEggId },
    _max: { order: true },
  });
  const newOrder = order ?? (maxOrder._max?.order ?? 0) + 1;

  const stepsToShift = await prisma.easterEggStep.findMany({
    where: { easterEggId, order: { gte: newOrder } },
    select: { id: true, order: true },
  });
  for (const s of stepsToShift) {
    await prisma.easterEggStep.update({
      where: { id: s.id },
      data: { order: s.order + 1 },
    });
  }

  const step = await prisma.easterEggStep.create({
    data: {
      easterEggId,
      order: newOrder,
      label,
      imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.trim() || null : null,
      buildableReferenceSlug: typeof body.buildableReferenceSlug === 'string' ? body.buildableReferenceSlug.trim() || null : null,
    },
  });

  revalidatePath(`/maps/${ee.map?.slug}`);
  return NextResponse.json(step);
}

/** PUT: Reorder steps. Body: { stepIds: string[] } - ids in desired order. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireEasterEggAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: easterEggId } = await params;
  const ee = await prisma.easterEgg.findUnique({
    where: { id: easterEggId },
    include: { map: { select: { slug: true } } },
  });
  if (!ee) return NextResponse.json({ error: 'Easter egg not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const stepIds = Array.isArray(body.stepIds) ? body.stepIds.filter((x: unknown) => typeof x === 'string') : [];
  if (stepIds.length === 0) return NextResponse.json({ error: 'stepIds array is required' }, { status: 400 });

  const steps = await prisma.easterEggStep.findMany({
    where: { easterEggId, id: { in: stepIds } },
    select: { id: true },
  });
  if (steps.length !== stepIds.length) {
    return NextResponse.json({ error: 'Some step IDs are invalid or belong to another easter egg' }, { status: 400 });
  }

  for (let i = 0; i < stepIds.length; i++) {
    await prisma.easterEggStep.update({
      where: { id: stepIds[i] },
      data: { order: i + 1 },
    });
  }

  revalidatePath(`/maps/${ee.map?.slug}`);
  const updated = await prisma.easterEggStep.findMany({
    where: { easterEggId },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json({ steps: updated });
}
