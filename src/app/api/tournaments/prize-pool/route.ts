import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

const CURRENT_PRIZE_POOL_ID = 'current-prize-pool';
const NEXT_PRIZE_POOL_ID = 'next-prize-pool';
const LEGACY_DEFAULT_PRIZE_POOL_ID = 'default-prize-pool';

function resolveScope(raw: string | null | undefined): 'current' | 'next' {
  return raw === 'next' ? 'next' : 'current';
}

/** GET: Current prize pool amount in USD cents (public). */
export async function GET(request: NextRequest) {
  try {
    const scope = resolveScope(new URL(request.url).searchParams.get('scope'));
    const id = scope === 'next' ? NEXT_PRIZE_POOL_ID : CURRENT_PRIZE_POOL_ID;

    const row = await prisma.tournamentPrizePool.findUnique({ where: { id }, select: { amountCents: true } });
    let amountCents = row?.amountCents ?? 0;

    if (scope === 'current' && !row) {
      const legacy = await prisma.tournamentPrizePool.findUnique({
        where: { id: LEGACY_DEFAULT_PRIZE_POOL_ID },
        select: { amountCents: true },
      });
      amountCents = legacy?.amountCents ?? 0;
    }

    return NextResponse.json(
      { scope, amountCents },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (error) {
    console.error('Error fetching prize pool:', error);
    return NextResponse.json({ error: 'Failed to fetch prize pool' }, { status: 500 });
  }
}

/** PATCH: Update prize pool (super admin only). Body: { scope?: "current"|"next", amountCents: number } or { scope?: "current"|"next", amountDollars: number }. */
export async function PATCH(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const scope = resolveScope(typeof body.scope === 'string' ? body.scope : null);
    const id = scope === 'next' ? NEXT_PRIZE_POOL_ID : CURRENT_PRIZE_POOL_ID;
    let amountCents: number;
    if (typeof body.amountCents === 'number' && Number.isFinite(body.amountCents)) {
      amountCents = Math.round(body.amountCents);
    } else if (typeof body.amountDollars === 'number' && Number.isFinite(body.amountDollars)) {
      amountCents = Math.round(body.amountDollars * 100);
    } else {
      return NextResponse.json({ error: 'Provide amountCents or amountDollars' }, { status: 400 });
    }
    amountCents = Math.max(0, amountCents);

    await prisma.tournamentPrizePool.upsert({
      where: { id },
      create: { id, amountCents, updatedAt: new Date() },
      update: { amountCents },
    });

    return NextResponse.json({ scope, amountCents });
  } catch (error) {
    console.error('Error updating prize pool:', error);
    return NextResponse.json({ error: 'Failed to update prize pool' }, { status: 500 });
  }
}
