import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getUser } from '@/lib/supabase/server';

// Update display name, username, bio, or privacy. Session identifies the user.
export async function PATCH(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, username: rawUsername, bio, isPublic } = body;

    const data: {
      displayName?: string | null;
      username?: string;
      bio?: string | null;
      isPublic?: boolean;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (displayName !== undefined) data.displayName = displayName === '' ? null : String(displayName).trim();
    if (bio !== undefined) data.bio = bio === '' ? null : String(bio).trim();
    if (isPublic !== undefined) data.isPublic = Boolean(isPublic);

    if (rawUsername !== undefined) {
      const username = slugify(String(rawUsername).trim());
      if (!username) {
        return NextResponse.json({ error: 'Username is required and must contain at least one letter or number' }, { status: 400 });
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
