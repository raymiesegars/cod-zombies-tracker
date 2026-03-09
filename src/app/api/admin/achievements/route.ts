import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { reapplyMapAchievements } from '@/lib/achievements/reapply';
import type { AchievementType, AchievementRarity, Bo4Difficulty } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function requireSuperAdmin() {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized' as const, status: 401 as const, user: null };
  const me = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true },
  });
  if (!me || !isSuperAdmin(me.id)) return { error: 'Forbidden: super admin only' as const, status: 403 as const, user: null };
  return { user: me, error: null, status: null };
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const ACHIEVEMENT_TYPES: AchievementType[] = [
  'ROUND_MILESTONE',
  'CHALLENGE_COMPLETE',
  'EASTER_EGG_COMPLETE',
  'MAPS_PLAYED',
  'TOTAL_ROUNDS',
  'STREAK',
  'COLLECTOR',
];
const RARITIES: AchievementRarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
const BO4_DIFFICULTIES: (Bo4Difficulty | null)[] = [null, 'NORMAL', 'HARDCORE', 'REALISTIC', 'CASUAL'];

/** GET: List achievements for a map. Query: mapId (required). */
export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const mapId = searchParams.get('mapId');
  if (!mapId) return NextResponse.json({ error: 'mapId is required' }, { status: 400 });

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    include: { game: { select: { shortName: true, name: true } } },
  });
  if (!map) return NextResponse.json({ error: 'Map not found' }, { status: 404 });

  const achievements = await prisma.achievement.findMany({
    where: {
      OR: [{ mapId }, { easterEgg: { mapId } }],
    },
    include: {
      map: { select: { id: true, slug: true, name: true } },
      easterEgg: { select: { id: true, name: true, slug: true } },
      challenge: { select: { id: true, type: true } },
    },
    orderBy: [{ type: 'asc' }, { slug: 'asc' }, { difficulty: 'asc' }],
  });

  return NextResponse.json({ map, achievements });
}

/** POST: Create achievement. Body: mapId, name, type, slug?, xpReward?, criteria?, rarity?, easterEggId?, challengeId?, difficulty?. */
export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const mapId = typeof body.mapId === 'string' ? body.mapId.trim() : null;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const type = ACHIEVEMENT_TYPES.includes(body.type) ? body.type : 'ROUND_MILESTONE';
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const slug =
    typeof body.slug === 'string' && body.slug.trim()
      ? slugify(body.slug.trim())
      : slugify(name);
  if (!slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const difficulty = body.difficulty != null && BO4_DIFFICULTIES.includes(body.difficulty) ? body.difficulty : null;
  const effectiveMapId =
    mapId ?? (typeof body.easterEggId === 'string' ? (await prisma.easterEgg.findUnique({ where: { id: body.easterEggId }, select: { mapId: true } }).then((e) => e?.mapId ?? null)) : null) ?? null;

  if (effectiveMapId) {
    const conflict = await prisma.achievement.findFirst({
      where: { mapId: effectiveMapId, slug, ...(difficulty != null ? { difficulty } : { difficulty: null }) },
    });
    if (conflict) return NextResponse.json({ error: `Slug "${slug}" already in use on this map` }, { status: 400 });
  }

  const criteria = body.criteria != null && typeof body.criteria === 'object' ? body.criteria : {};
  const xpReward = typeof body.xpReward === 'number' ? Math.max(0, Math.floor(body.xpReward)) : 50;
  const rarity = RARITIES.includes(body.rarity) ? body.rarity : 'COMMON';
  const easterEggId = typeof body.easterEggId === 'string' ? body.easterEggId : null;
  const challengeId = typeof body.challengeId === 'string' ? body.challengeId : null;

  const achievement = await prisma.achievement.create({
    data: {
      name,
      slug,
      type,
      criteria,
      xpReward,
      rarity,
      mapId: effectiveMapId,
      easterEggId,
      challengeId,
      difficulty,
      description: typeof body.description === 'string' ? body.description.trim() || null : null,
    },
    include: {
      map: { select: { id: true, slug: true, name: true } },
      easterEgg: { select: { id: true, name: true, slug: true } },
      challenge: { select: { id: true, type: true } },
    },
  });

  if (achievement.map?.slug) revalidatePath(`/maps/${achievement.map.slug}`);

  if (effectiveMapId) {
    try {
      await reapplyMapAchievements(effectiveMapId);
    } catch {
      // Non-fatal: achievement created, reapply can be run manually
    }
  }

  return NextResponse.json(achievement);
}
