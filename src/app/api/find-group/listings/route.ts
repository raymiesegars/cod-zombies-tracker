import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

const LISTING_EXPIRY_DAYS = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') ?? undefined;
    const mapId = searchParams.get('mapId') ?? undefined;
    const search = searchParams.get('search')?.trim() ?? undefined;
    const sort = searchParams.get('sort') ?? 'recent';

    const now = new Date();
    // Prune expired listings so the table doesn't blow up
    try {
      await prisma.groupListing.deleteMany({
        where: { expiresAt: { lte: now } },
      });
    } catch (e) {
      console.warn('Find group cleanup deleteMany:', e);
    }

    const where: Prisma.GroupListingWhereInput = {
      expiresAt: { gt: now },
    };
    if (mapId) where.mapId = mapId;
    if (gameId) where.map = { gameId };
    if (search) {
      where.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
        { map: { name: { contains: search, mode: 'insensitive' } } },
        { map: { game: { name: { contains: search, mode: 'insensitive' } } } },
        { easterEgg: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy = sort === 'recent' ? { createdAt: 'desc' as const } : { createdAt: 'asc' as const };

    const listings = await prisma.groupListing.findMany({
      where,
      orderBy,
      take: 200, // cap for safety
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
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
            gameId: true,
            game: { select: { id: true, name: true, shortName: true } },
          },
        },
        easterEgg: {
          select: { id: true, name: true, slug: true, type: true },
        },
      },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error('GET /api/find-group/listings', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const mapId = body.mapId;
    const easterEggId = body.easterEggId ?? null;
    const desiredPlayerCount = Math.min(4, Math.max(1, Number(body.desiredPlayerCount) || 1));
    const notes = body.notes?.trim() || null;
    const platform = String(body.platform || '').trim() || 'PC';
    const contactInfo = body.contactInfo && typeof body.contactInfo === 'object' ? body.contactInfo : null;

    if (!mapId) {
      return NextResponse.json({ error: 'mapId is required' }, { status: 400 });
    }

    const map = await prisma.map.findUnique({
      where: { id: mapId },
      include: { game: true },
    });
    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    if (easterEggId) {
      const ee = await prisma.easterEgg.findFirst({
        where: { id: easterEggId, mapId },
      });
      if (!ee) {
        return NextResponse.json({ error: 'Easter egg not found for this map' }, { status: 400 });
      }
    }

    const expiresAt = new Date(Date.now() + LISTING_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const listing = await prisma.groupListing.create({
      data: {
        creatorId: user.id,
        mapId,
        easterEggId,
        desiredPlayerCount,
        currentPlayerCount: 1,
        notes,
        platform,
        contactInfo,
        expiresAt,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
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
            gameId: true,
            game: { select: { id: true, name: true, shortName: true } },
          },
        },
        easterEgg: {
          select: { id: true, name: true, slug: true, type: true },
        },
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error('POST /api/find-group/listings', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
