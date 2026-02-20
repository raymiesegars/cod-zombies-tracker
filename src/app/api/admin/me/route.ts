import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** Returns whether the current user is an admin and whether they are a super admin. */
export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ isAdmin: false, isSuperAdmin: false });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!user) {
      return NextResponse.json({ isAdmin: false, isSuperAdmin: false });
    }

    return NextResponse.json({
      isAdmin: user.isAdmin ?? false,
      isSuperAdmin: isSuperAdmin(user.id),
    });
  } catch (error) {
    console.error('Error fetching admin me:', error);
    return NextResponse.json({ isAdmin: false, isSuperAdmin: false });
  }
}
