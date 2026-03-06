import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

const SINGLETON_ID = 'default-prize-pool';

/** GET: Current prize pool amount in USD cents (public). */
export async function GET() {
  try {
    const row = await prisma.tournamentPrizePool.findUnique({
      where: { id: SINGLETON_ID },
      select: { amountCents: true },
    });
    const amountCents = row?.amountCents ?? 0;
    return NextResponse.json(
      { amountCents },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (error) {
    console.error('Error fetching prize pool:', error);
    return NextResponse.json({ error: 'Failed to fetch prize pool' }, { status: 500 });
  }
}

/** PATCH: Update prize pool (super admin only). Body: { amountCents: number } or { amountDollars: number }. */
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
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, amountCents, updatedAt: new Date() },
      update: { amountCents },
    });

    return NextResponse.json({ amountCents });
  } catch (error) {
    console.error('Error updating prize pool:', error);
    return NextResponse.json({ error: 'Failed to update prize pool' }, { status: 500 });
  }
}
