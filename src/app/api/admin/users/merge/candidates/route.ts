import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

async function requireSuperAdmin() {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized', status: 401 as const, me: null };
  const me = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true },
  });
  if (!me || !isSuperAdmin(me.id)) {
    return { error: 'Forbidden: super admin only', status: 403 as const, me: null };
  }
  return { error: null, status: 200 as const, me };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
    const includeArchived = request.nextUrl.searchParams.get('includeArchived') === '1';
    if (q.length < 2) return NextResponse.json({ users: [] });

    const users = await prisma.user.findMany({
      where: {
        ...(includeArchived ? {} : { isArchived: false }),
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
          { externalDisplayName: { contains: q, mode: 'insensitive' } },
          {
            externalIdentities: {
              some: {
                OR: [
                  { externalName: { contains: q, mode: 'insensitive' } },
                  { externalKey: { contains: q, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        isArchived: true,
        isExternalPlaceholder: true,
        externalAvatarSource: true,
        externalDisplayName: true,
        _count: {
          select: {
            challengeLogs: true,
            easterEggLogs: true,
            externalIdentities: true,
          },
        },
      },
      take: 30,
      orderBy: [{ isArchived: 'asc' }, { username: 'asc' }],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error listing merge candidates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

