import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { computeWorldRecordsDetailed } from '@/lib/world-records';

/** GET /api/users/[username]/world-records-details
 * Returns the list of leaderboard combinations where the user is ranked #1.
 * Used by the World Records modal on the profile page.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPublic: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabaseUser = await getUser();
    const currentUser = supabaseUser
      ? await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } })
      : null;
    const isOwnProfile = currentUser && currentUser.id === user.id;
    if (!user.isPublic && !isOwnProfile) {
      return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
    }

    const result = await computeWorldRecordsDetailed(user.id);
    return NextResponse.json({
      worldRecords: result.worldRecords,
      verifiedWorldRecords: result.verifiedWorldRecords,
      details: result.details,
    });
  } catch (error) {
    console.error('Error fetching world records details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
