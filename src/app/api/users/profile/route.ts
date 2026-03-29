import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getLevelFromXp } from '@/lib/ranks';

const NAME_PREFIXES = [
  'Perka',
  'Round',
  'Mystic',
  'Aether',
  'Zombie',
  'Void',
  'Omega',
  'Arcane',
  'Relic',
  'Ghoul',
];
const NAME_SUFFIXES = [
  'Slayer',
  'Walker',
  'Hunter',
  'Runner',
  'Player',
  'Knight',
  'Warden',
  'Sprinter',
  'Survivor',
  'Striker',
];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function buildRandomBaseName(): string {
  return `${NAME_PREFIXES[randomInt(NAME_PREFIXES.length)]}${NAME_SUFFIXES[randomInt(NAME_SUFFIXES.length)]}`;
}

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

// Create or update profile after sign-in.
export async function POST(request: NextRequest) {
  let supabaseId = '';
  let email = '';
  let displayName: string | null = null;

  try {
    const body = await request.json();
    supabaseId = typeof body.supabaseId === 'string' ? body.supabaseId.trim() : '';
    email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!supabaseId || !email) {
      return NextResponse.json(
        { error: 'supabaseId and email are required' },
        { status: 400 }
      );
    }

    let baseName = buildRandomBaseName();
    let username = slugify(baseName);
    let displayCandidate = baseName;

    for (let i = 0; i < 8; i++) {
      const exists = await prisma.user.findUnique({ where: { username } });
      if (!exists || exists.supabaseId === supabaseId) break;
      const suffix = Math.random().toString(36).slice(2, 6);
      displayCandidate = `${baseName}${suffix.toUpperCase()}`;
      username = slugify(`${baseName}-${suffix}`);
    }
    if (!username) {
      const fallback = Math.random().toString(36).slice(2, 9);
      username = `player-${fallback}`;
      displayCandidate = `Player${fallback.toUpperCase()}`;
    }
    displayName = displayCandidate;

    // On first login, force game-themed defaults instead of provider names/avatars.
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
        avatarUrl: null,
        avatarPreset: 'perkaholic',
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
