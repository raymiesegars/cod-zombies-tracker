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

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** GET: Single easter egg with steps. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireEasterEggAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const easterEgg = await prisma.easterEgg.findUnique({
    where: { id },
    include: {
      map: { select: { id: true, slug: true, name: true, game: { select: { shortName: true } } } },
      steps: { orderBy: { order: 'asc' } },
    },
  });
  if (!easterEgg) return NextResponse.json({ error: 'Easter egg not found' }, { status: 404 });
  return NextResponse.json(easterEgg);
}

/** PATCH: Update easter egg metadata. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireEasterEggAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const existing = await prisma.easterEgg.findUnique({
    where: { id },
    include: { map: { select: { slug: true } } },
  });
  if (!existing) return NextResponse.json({ error: 'Easter egg not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (typeof body.name === 'string') updates.name = body.name.trim();
  if (typeof body.slug === 'string') {
    const slug = slugify(body.slug.trim());
    if (slug && slug !== existing.slug) {
      const conflict = await prisma.easterEgg.findUnique({
        where: { mapId_slug: { mapId: existing.mapId, slug } },
      });
      if (conflict) {
        return NextResponse.json({ error: `Slug "${slug}" already in use on this map` }, { status: 400 });
      }
      updates.slug = slug;
    }
  }
  if (['MAIN_QUEST', 'SIDE_QUEST', 'MUSICAL', 'BUILDABLE'].includes(body.type)) updates.type = body.type;
  if (typeof body.description === 'string') updates.description = body.description.trim() || null;
  if (typeof body.xpReward === 'number') updates.xpReward = Math.max(0, Math.floor(body.xpReward));
  if (body.playerCountRequirement === null || ['SOLO', 'DUO', 'TRIO', 'SQUAD'].includes(body.playerCountRequirement)) {
    updates.playerCountRequirement = body.playerCountRequirement ?? null;
  }
  if (typeof body.rewardsDescription === 'string') updates.rewardsDescription = body.rewardsDescription.trim() || null;
  if (typeof body.videoEmbedUrl === 'string') updates.videoEmbedUrl = body.videoEmbedUrl.trim() || null;
  if (typeof body.variantTag === 'string') updates.variantTag = body.variantTag.trim() || null;
  if (typeof body.categoryTag === 'string') updates.categoryTag = body.categoryTag.trim() || null;
  if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(existing);
  }

  const easterEgg = await prisma.easterEgg.update({
    where: { id },
    data: updates,
    include: { steps: { orderBy: { order: 'asc' } } },
  });

  revalidatePath(`/maps/${existing.map?.slug}`);
  return NextResponse.json(easterEgg);
}

/** DELETE: Remove easter egg (cascades to steps, user progress). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireEasterEggAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const existing = await prisma.easterEgg.findUnique({
    where: { id },
    include: { map: { select: { slug: true } } },
  });
  if (!existing) return NextResponse.json({ error: 'Easter egg not found' }, { status: 404 });

  await prisma.easterEgg.delete({ where: { id } });
  revalidatePath(`/maps/${existing.map?.slug}`);
  return NextResponse.json({ ok: true });
}
