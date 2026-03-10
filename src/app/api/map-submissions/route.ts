import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

const STEAM_WORKSHOP_REGEX = /^https?:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id=\d+$/;

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (!user.isAdmin) {
      const submissionCount = await prisma.mapSubmission.count({
        where: {
          submittedById: user.id,
          status: { in: ['PENDING', 'APPROVED'] },
        },
      });
      if (submissionCount >= 10) {
        return NextResponse.json(
          { error: 'Maximum 10 map submissions per user. Admins may approve some before you can submit more.' },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const mapName = typeof body.mapName === 'string' ? body.mapName.trim().slice(0, 100) : '';
    const steamWorkshopUrl = typeof body.steamWorkshopUrl === 'string' ? body.steamWorkshopUrl.trim() : '';
    let thumbnailImageUrl = typeof body.thumbnailImageUrl === 'string' ? body.thumbnailImageUrl.trim() || null : null;
    let mapPageImageUrl = typeof body.mapPageImageUrl === 'string' ? body.mapPageImageUrl.trim() || null : null;
    if (thumbnailImageUrl && !mapPageImageUrl) mapPageImageUrl = thumbnailImageUrl;
    if (!thumbnailImageUrl && mapPageImageUrl) thumbnailImageUrl = mapPageImageUrl;
    const suggestedAchievements = body.suggestedAchievements != null && typeof body.suggestedAchievements === 'object' ? body.suggestedAchievements : null;
    const suggestedEasterEgg = body.suggestedEasterEgg != null && typeof body.suggestedEasterEgg === 'object' ? body.suggestedEasterEgg : null;

    if (!mapName || mapName.length < 2) {
      return NextResponse.json({ error: 'Map name is required (2–100 characters)' }, { status: 400 });
    }

    if (!steamWorkshopUrl || !STEAM_WORKSHOP_REGEX.test(steamWorkshopUrl)) {
      return NextResponse.json(
        { error: 'Valid Steam Workshop URL required (e.g. https://steamcommunity.com/sharedfiles/filedetails/?id=123456789)' },
        { status: 400 }
      );
    }

    if (!thumbnailImageUrl && !mapPageImageUrl) {
      return NextResponse.json(
        { error: 'At least one image is required (thumbnail or banner)' },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: { shortName: 'BO3_CUSTOM' },
      select: { id: true },
    });
    if (!game) {
      return NextResponse.json({ error: 'BO3 Custom Zombies game not found' }, { status: 500 });
    }

    const submission = await prisma.mapSubmission.create({
      data: {
        gameId: game.id,
        submittedById: user.id,
        mapName,
        steamWorkshopUrl,
        thumbnailImageUrl,
        mapPageImageUrl,
        suggestedAchievements: suggestedAchievements ?? undefined,
        suggestedEasterEgg: suggestedEasterEgg ?? undefined,
      },
    });

    return NextResponse.json({ id: submission.id });
  } catch (err) {
    console.error('[map-submissions POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
