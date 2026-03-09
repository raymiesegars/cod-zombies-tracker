import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { reapplyAchievement } from '@/lib/achievements/reapply';

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

/** POST: Reapply achievement after definition changes. Removes existing unlocks, re-evaluates all users with logs on the map. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const achievement = await prisma.achievement.findUnique({
    where: { id },
    include: { map: { select: { slug: true } }, easterEgg: { include: { map: { select: { slug: true } } } } },
  });
  if (!achievement) return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });

  try {
    const result = await reapplyAchievement(id);
    const mapSlug = achievement.map?.slug ?? achievement.easterEgg?.map?.slug;
    if (mapSlug) revalidatePath(`/maps/${mapSlug}`);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reapply failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
