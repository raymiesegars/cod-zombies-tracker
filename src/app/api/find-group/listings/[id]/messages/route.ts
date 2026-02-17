import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

// List messages for a listing. Anyone can read if the listing exists.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.groupListing.findUnique({
      where: { id, expiresAt: { gt: new Date() } },
    });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found or expired' }, { status: 404 });
    }

    const messages = await prisma.groupListingMessage.findMany({
      where: { listingId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            level: true,
            totalXp: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('GET /api/find-group/listings/[id]/messages', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Post a message to the listing chat.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const listing = await prisma.groupListing.findUnique({
      where: { id, expiresAt: { gt: new Date() } },
    });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found or expired' }, { status: 404 });
    }

    const body = await request.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!content || content.length > 2000) {
      return NextResponse.json(
        { error: 'Message must be 1–2000 characters' },
        { status: 400 }
      );
    }

    const message = await prisma.groupListingMessage.create({
      data: {
        listingId: id,
        userId: user.id,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            level: true,
            totalXp: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('POST /api/find-group/listings/[id]/messages', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
