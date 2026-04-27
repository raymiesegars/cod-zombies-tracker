import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

const SINGLETON_ID = 'singleton';

/** GET: Public text for tournament verification (may be empty). */
export async function GET() {
  try {
    const row = await prisma.tournamentVerificationMessage.findUnique({
      where: { id: SINGLETON_ID },
      select: { content: true },
    });
    return NextResponse.json(
      { content: row?.content ?? '' },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch (error) {
    console.error('Error fetching tournament verification message:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

/** PATCH: Replace message (super admin). Body: { content: string }. */
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
    const content = typeof body.content === 'string' ? body.content : '';

    await prisma.tournamentVerificationMessage.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, content },
      update: { content },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error updating tournament verification message:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
