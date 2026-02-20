import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { getLevelFromXp } from '@/lib/ranks';

export const dynamic = 'force-dynamic';

/**
 * Search users by username or displayName for teammate picker.
 * GET /api/users/search?q=...&limit=20
 * Returns: { users: { id, username, displayName, avatarUrl, avatarPreset, level }[] }
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10) || 20));

    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const search = `%${q.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
    const raw = await prisma.user.findMany({
      where: {
        id: { not: me.id },
        isPublic: true,
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        avatarPreset: true,
        totalXp: true,
      },
      take: limit,
      orderBy: [{ username: 'asc' }],
    });

    const users = raw.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      avatarPreset: u.avatarPreset,
      level: getLevelFromXp(u.totalXp ?? 0).level,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
