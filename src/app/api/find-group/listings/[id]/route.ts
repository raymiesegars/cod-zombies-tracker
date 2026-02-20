import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// One listing + its chat for the detail page.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.groupListing.findUnique({
      where: { id, expiresAt: { gt: new Date() } },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
            level: true,
            totalXp: true,
          },
        },
        map: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            game: { select: { id: true, name: true, shortName: true } },
          },
        },
        easterEgg: {
          select: { id: true, name: true, slug: true, type: true },
        },
        messages: {
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
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found or expired' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('GET /api/find-group/listings/[id]', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

// Creator can bump slots or edit notes.
export async function PATCH(
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
    const existing = await prisma.groupListing.findUnique({
      where: { id },
    });

    if (!existing || existing.expiresAt <= new Date()) {
      return NextResponse.json({ error: 'Listing not found or expired' }, { status: 404 });
    }

    if (existing.creatorId !== user.id) {
      return NextResponse.json({ error: 'Only the creator can update this listing' }, { status: 403 });
    }

    const body = await request.json();
    const currentPlayerCount =
      typeof body.currentPlayerCount === 'number'
        ? Math.min(existing.desiredPlayerCount, Math.max(1, body.currentPlayerCount))
        : undefined;
    const notes = body.notes !== undefined ? (body.notes?.trim() || null) : undefined;
    const platform = body.platform !== undefined ? String(body.platform || '').trim() : undefined;
    const contactInfo = body.contactInfo !== undefined ? (body.contactInfo && typeof body.contactInfo === 'object' ? body.contactInfo : null) : undefined;

    const listing = await prisma.groupListing.update({
      where: { id },
      data: {
        ...(currentPlayerCount !== undefined && { currentPlayerCount }),
        ...(notes !== undefined && { notes }),
        ...(platform !== undefined && { platform }),
        ...(contactInfo !== undefined && { contactInfo }),
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
            level: true,
            totalXp: true,
          },
        },
        map: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            game: { select: { id: true, name: true, shortName: true } },
          },
        },
        easterEgg: {
          select: { id: true, name: true, slug: true, type: true },
        },
        messages: {
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
        },
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error('PATCH /api/find-group/listings/[id]', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

// Creator only.
export async function DELETE(
  _request: NextRequest,
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
    const existing = await prisma.groupListing.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existing.creatorId !== user.id) {
      return NextResponse.json({ error: 'Only the creator can delete this listing' }, { status: 403 });
    }

    await prisma.groupListing.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/find-group/listings/[id]', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
