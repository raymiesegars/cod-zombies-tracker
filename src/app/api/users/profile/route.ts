import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getLevelFromXp } from '@/lib/ranks';

// Get profile by Supabase id (e.g. right after auth).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const supabaseId = searchParams.get('supabaseId');

  if (!supabaseId) {
    return NextResponse.json({ error: 'supabaseId is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      include: {
        _count: {
          select: {
            challengeLogs: true,
            easterEggLogs: true,
            userAchievements: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalXp = user.totalXp ?? 0;
    const verifiedTotalXp = user.verifiedTotalXp ?? 0;
    const level = getLevelFromXp(totalXp).level;
    const verifiedLevel = getLevelFromXp(verifiedTotalXp).level;
    return NextResponse.json({ ...user, level, totalXp, verifiedLevel, verifiedTotalXp });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create or update profile after sign-in. Username from email, uniquified if taken.
export async function POST(request: NextRequest) {
  let supabaseId = '';
  let email = '';
  let displayName: string | null = null;
  let avatarUrl: string | null = null;

  try {
    const body = await request.json();
    supabaseId = typeof body.supabaseId === 'string' ? body.supabaseId.trim() : '';
    email = typeof body.email === 'string' ? body.email.trim() : '';
    displayName = body.displayName != null ? String(body.displayName).trim() || null : null;
    avatarUrl = body.avatarUrl != null ? String(body.avatarUrl).trim() || null : null;

    if (!supabaseId || !email) {
      return NextResponse.json(
        { error: 'supabaseId and email are required' },
        { status: 400 }
      );
    }

    const emailUsername = email.split('@')[0] ?? '';
    let username = slugify(emailUsername);
    if (!username) {
      username = `user-${Date.now().toString(36)}`;
    }

    const existingByUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingByUsername && existingByUsername.supabaseId !== supabaseId) {
      username = `${username}-${Date.now().toString(36)}`;
    }

    // Only set displayName/avatarUrl on create.
    const user = await prisma.user.upsert({
      where: { supabaseId },
      update: {
        updatedAt: new Date(),
      },
      create: {
        supabaseId,
        email,
        username,
        displayName,
        avatarUrl,
      },
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('Error creating/updating user profile:', error);

    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError?.code === 'P2002') {
      const target = prismaError.meta?.target as string[] | undefined;
      if (target?.includes('email') && email) {
        const existingByEmail = await prisma.user.findUnique({
          where: { email },
        });
        if (existingByEmail) {
          await prisma.user.update({
            where: { id: existingByEmail.id },
            data: { supabaseId, updatedAt: new Date() },
          });
          const updated = await prisma.user.findUnique({
            where: { id: existingByEmail.id },
            include: {
              _count: {
                select: { challengeLogs: true, easterEggLogs: true, userAchievements: true },
              },
            },
          });
          if (updated) {
            const level = getLevelFromXp(updated.totalXp ?? 0).level;
            return NextResponse.json({ ...updated, level, totalXp: updated.totalXp ?? 0 });
          }
        }
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      if (target?.includes('username')) {
        return NextResponse.json(
          { error: 'Username conflict; please try again' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
