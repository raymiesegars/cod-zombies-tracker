import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getUser } from '@/lib/supabase/server';
import { isAvatarPreset } from '@/lib/avatar';

// Update display name, username, bio, or privacy. Session identifies the user.
export async function PATCH(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, username: rawUsername, bio, isPublic, showBothXpRanks, preferredRankView } = body;

    const data: {
      displayName?: string | null;
      username?: string;
      bio?: string | null;
      isPublic?: boolean;
      avatarPreset?: string | null;
      showBothXpRanks?: boolean;
      preferredRankView?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (displayName !== undefined) {
      const trimmed = String(displayName).trim();
      if (trimmed.length > 20) {
        return NextResponse.json({ error: 'Display name must be 20 characters or less' }, { status: 400 });
      }
      data.displayName = trimmed === '' ? null : trimmed;
    }
    if (bio !== undefined) data.bio = bio === '' ? null : String(bio).trim().slice(0, 150);
    if (isPublic !== undefined) data.isPublic = Boolean(isPublic);
    if (body.avatarPreset !== undefined) {
      const v = body.avatarPreset === '' || body.avatarPreset == null ? null : String(body.avatarPreset).trim();
      data.avatarPreset = v === '' ? null : isAvatarPreset(v) ? v : null;
    }
    if (showBothXpRanks !== undefined) data.showBothXpRanks = Boolean(showBothXpRanks);
    if (preferredRankView !== undefined) {
      const v = preferredRankView === '' || preferredRankView == null ? null : String(preferredRankView).trim();
      data.preferredRankView = v === 'total' || v === 'verified' ? v : null;
    }

    if (rawUsername !== undefined) {
      const username = slugify(String(rawUsername).trim());
      if (!username) {
        return NextResponse.json({ error: 'Username is required and must contain at least one letter or number' }, { status: 400 });
      }
      if (username.length > 20) {
        return NextResponse.json({ error: 'Username must be 20 characters or less' }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({
        where: { username },
      });
      if (existing && existing.supabaseId !== supabaseUser.id) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }
      data.username = username;
    }

    const user = await prisma.user.update({
      where: { supabaseId: supabaseUser.id },
      data,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
