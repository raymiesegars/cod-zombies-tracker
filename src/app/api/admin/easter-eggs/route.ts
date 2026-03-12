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
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** GET: List easter eggs for a map. Query: mapId (required). */
export async function GET(request: NextRequest) {
  const auth = await requireEasterEggAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const mapId = searchParams.get('mapId');
  if (!mapId) {
    return NextResponse.json({ error: 'mapId is required' }, { status: 400 });
  }

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    include: { game: { select: { shortName: true, name: true } } },
  });
  if (!map) {
    return NextResponse.json({ error: 'Map not found' }, { status: 404 });
  }

  const easterEggs = await prisma.easterEgg.findMany({
    where: { mapId },
    include: {
      steps: { orderBy: { order: 'asc' } },
    },
    orderBy: [{ type: 'asc' }, { slug: 'asc' }],
  });

  return NextResponse.json({ map, easterEggs });
}

/** POST: Create new easter egg. Body: mapId, name, slug?, type, description?, xpReward?, etc. */
export async function POST(request: NextRequest) {
  const auth = await requireEasterEggAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const mapId = typeof body.mapId === 'string' ? body.mapId.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const type = ['MAIN_QUEST', 'SIDE_QUEST', 'MUSICAL', 'BUILDABLE'].includes(body.type) ? body.type : 'SIDE_QUEST';
  if (!mapId || !name) {
    return NextResponse.json({ error: 'mapId and name are required' }, { status: 400 });
  }

  const map = await prisma.map.findUnique({ where: { id: mapId } });
  if (!map) return NextResponse.json({ error: 'Map not found' }, { status: 404 });

  const slug = typeof body.slug === 'string' && body.slug.trim()
    ? slugify(body.slug.trim())
    : slugify(name);
  if (!slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const existing = await prisma.easterEgg.findUnique({
    where: { mapId_slug: { mapId, slug } },
  });
  if (existing) {
    return NextResponse.json({ error: `Easter egg with slug "${slug}" already exists on this map` }, { status: 400 });
  }

  const xpReward = typeof body.xpReward === 'number' ? Math.max(0, Math.floor(body.xpReward)) : type === 'MAIN_QUEST' ? 250 : 0;
  const playerCountRequirement = ['SOLO', 'DUO', 'TRIO', 'SQUAD'].includes(body.playerCountRequirement) ? body.playerCountRequirement : null;

  const easterEgg = await prisma.easterEgg.create({
    data: {
      mapId,
      name,
      slug,
      type,
      description: typeof body.description === 'string' ? body.description.trim() || null : null,
      xpReward,
      playerCountRequirement,
      rewardsDescription: typeof body.rewardsDescription === 'string' ? body.rewardsDescription.trim() || null : null,
      videoEmbedUrl: typeof body.videoEmbedUrl === 'string' ? body.videoEmbedUrl.trim() || null : null,
      variantTag: typeof body.variantTag === 'string' ? body.variantTag.trim() || null : null,
      categoryTag: typeof body.categoryTag === 'string' ? body.categoryTag.trim() || null : null,
    },
    include: { steps: { orderBy: { order: 'asc' } } },
  });

  revalidatePath(`/maps/${map.slug}`);
  return NextResponse.json(easterEgg);
}
