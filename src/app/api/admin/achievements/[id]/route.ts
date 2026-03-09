import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { reapplyAchievement } from '@/lib/achievements/reapply';
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

/** GET: Single achievement with map/easterEgg/challenge. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const achievement = await prisma.achievement.findUnique({
    where: { id },
    include: {
      map: { select: { id: true, slug: true, name: true, game: { select: { shortName: true } } } },
      easterEgg: { select: { id: true, name: true, slug: true, mapId: true } },
      challenge: { select: { id: true, type: true } },
    },
  });
  if (!achievement) return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
  return NextResponse.json(achievement);
}

/** PATCH: Update achievement. Optional body.reapply=true runs reapply after update. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const existing = await prisma.achievement.findUnique({
    where: { id },
    include: { map: { select: { slug: true } }, easterEgg: { include: { map: { select: { slug: true } } } } },
  });
  if (!existing) return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (typeof body.name === 'string') updates.name = body.name.trim();
  if (typeof body.slug === 'string') {
    const slug = slugify(body.slug.trim());
    if (slug && slug !== existing.slug) {
      const mapId = existing.mapId ?? existing.easterEgg?.mapId ?? null;
      if (mapId) {
        const conflict = await prisma.achievement.findFirst({
          where: { mapId, slug, ...(existing.difficulty != null ? { difficulty: existing.difficulty } : { difficulty: null }) },
        });
        if (conflict && conflict.id !== id) {
          return NextResponse.json({ error: `Slug "${slug}" already in use on this map` }, { status: 400 });
        }
      }
      updates.slug = slug;
    }
  }
  if (typeof body.description === 'string') updates.description = body.description.trim() || null;
  if (body.criteria != null && typeof body.criteria === 'object') updates.criteria = body.criteria;
  if (typeof body.xpReward === 'number') updates.xpReward = Math.max(0, Math.floor(body.xpReward));
  if (RARITIES.includes(body.rarity)) updates.rarity = body.rarity;
  if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;
  if (body.difficulty !== undefined && (body.difficulty === null || BO4_DIFFICULTIES.includes(body.difficulty))) {
    updates.difficulty = body.difficulty;
  }
  if (typeof body.easterEggId === 'string') updates.easterEggId = body.easterEggId || null;
  if (typeof body.challengeId === 'string') updates.challengeId = body.challengeId || null;

  if (Object.keys(updates).length === 0) {
    const out = await prisma.achievement.findUnique({
      where: { id },
      include: {
        map: { select: { id: true, slug: true, name: true } },
        easterEgg: { select: { id: true, name: true, slug: true } },
        challenge: { select: { id: true, type: true } },
      },
    });
    return NextResponse.json(out);
  }

  const achievement = await prisma.achievement.update({
    where: { id },
    data: updates,
    include: {
      map: { select: { id: true, slug: true, name: true } },
      easterEgg: { select: { id: true, name: true, slug: true } },
      challenge: { select: { id: true, type: true } },
    },
  });

  const mapSlug = existing.map?.slug ?? existing.easterEgg?.map?.slug;
  if (mapSlug) revalidatePath(`/maps/${mapSlug}`);

  const shouldReapply = body.reapply === true;
  if (shouldReapply) {
    try {
      const reapplyResult = await reapplyAchievement(id);
      return NextResponse.json({ achievement, reapply: reapplyResult });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reapply failed';
      return NextResponse.json({ achievement, reapplyError: message }, { status: 200 });
    }
  }

  return NextResponse.json(achievement);
}
