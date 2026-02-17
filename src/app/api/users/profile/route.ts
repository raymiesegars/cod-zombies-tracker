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
    const level = getLevelFromXp(totalXp).level;
    return NextResponse.json({ ...user, level, totalXp });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create or update profile after sign-in. Username from email, uniquified if taken.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supabaseId, email, displayName, avatarUrl } = body;

    if (!supabaseId || !email) {
      return NextResponse.json(
        { error: 'supabaseId and email are required' },
        { status: 400 }
      );
    }

    const emailUsername = email.split('@')[0];
    let username = slugify(emailUsername);

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.supabaseId !== supabaseId) {
      username = `${username}-${Date.now().toString(36)}`;
    }

    const user = await prisma.user.upsert({
      where: { supabaseId },
      update: {
        displayName,
        avatarUrl,
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
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
