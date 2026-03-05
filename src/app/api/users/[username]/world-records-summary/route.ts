import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { computeWorldRecords } from '@/lib/world-records';

/** GET /api/users/[username]/world-records-summary
 * Returns only { worldRecords, verifiedWorldRecords } so the profile page can load fast and fetch this in the background.
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

    const result = await computeWorldRecords(user.id);
    return NextResponse.json({
      worldRecords: result.worldRecords,
      verifiedWorldRecords: result.verifiedWorldRecords,
    });
  } catch (error) {
    console.error('Error fetching world records summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
