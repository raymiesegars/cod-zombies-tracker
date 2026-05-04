import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import {
  buildMapClonePreview,
  sanitizeSlug,
  validateMapCloneCreatePayload,
} from '@/lib/admin/map-clone';
import type { MapCloneCreatePayload } from '@/lib/admin/map-clone-types';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function requireSuperAdmin() {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized' as const, status: 401 as const, user: null };
  const me = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true },
  });
  if (!me || !isSuperAdmin(me.id)) return { error: 'Forbidden: super admin only' as const, status: 403 as const, user: null };
  return { user: me, error: null, status: null };
}

function normalizeNullableString(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  return trimmed ? trimmed : null;
}

function parseIsoDate(input: string | null): Date | null {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

async function handlePreview(body: Record<string, unknown>) {
  const gameId = typeof body.gameId === 'string' ? body.gameId.trim() : '';
  const mapName = typeof body.mapName === 'string' ? body.mapName.trim() : '';
  const mapSlug = typeof body.mapSlug === 'string' ? body.mapSlug.trim() : undefined;
  if (!gameId || !mapName) {
    return NextResponse.json({ error: 'gameId and mapName are required' }, { status: 400 });
  }

  try {
    const preview = await buildMapClonePreview({ gameId, mapName, mapSlug });
    return NextResponse.json(preview);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to build clone preview' },
      { status: 400 }
    );
  }
}

async function handleCreate(body: Record<string, unknown>) {
  const payload = body as unknown as MapCloneCreatePayload;
  const validationError = validateMapCloneCreatePayload(payload);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const mapName = payload.map.name.trim();
  const mapSlug = sanitizeSlug(payload.map.slug, mapName);
  if (!mapSlug) return NextResponse.json({ error: 'Invalid map slug' }, { status: 400 });

  const existingMap = await prisma.map.findUnique({ where: { slug: mapSlug }, select: { id: true } });
  if (existingMap) return NextResponse.json({ error: `Map slug "${mapSlug}" already exists` }, { status: 400 });

  const game = await prisma.game.findUnique({
    where: { id: payload.gameId },
    select: { id: true, shortName: true, name: true },
  });
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

  const sourceMap = await prisma.map.findUnique({
    where: { id: payload.sourceMapId },
    select: { id: true, gameId: true, slug: true },
  });
  if (!sourceMap || sourceMap.gameId !== payload.gameId) {
    return NextResponse.json({ error: 'Invalid sourceMapId for selected game' }, { status: 400 });
  }

  const maxOrder = await prisma.map.aggregate({
    where: { gameId: payload.gameId },
    _max: { order: true },
  });
  const fallbackOrder = (maxOrder._max.order ?? 0) + 1;
  const mapOrder = Number.isInteger(payload.map.order) && payload.map.order > 0
    ? payload.map.order
    : fallbackOrder;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const map = await tx.map.create({
        data: {
          gameId: payload.gameId,
          name: mapName,
          slug: mapSlug,
          description: normalizeNullableString(payload.map.description),
          imageUrl: normalizeNullableString(payload.map.imageUrl),
          isDlc: Boolean(payload.map.isDlc),
          isCustom: Boolean(payload.map.isCustom),
          steamWorkshopUrl: normalizeNullableString(payload.map.steamWorkshopUrl),
          releaseDate: parseIsoDate(payload.map.releaseDate),
          roundCap: payload.map.roundCap ?? null,
          order: mapOrder,
        },
      });

      const challengeIdBySourceSlug = new Map<string, string>();
      for (const challenge of payload.challenges) {
        const challengeSlug = sanitizeSlug(challenge.slug, challenge.name);
        if (!challengeSlug) throw new Error(`Invalid challenge slug for "${challenge.name}"`);
        const created = await tx.challenge.create({
          data: {
            mapId: map.id,
            name: challenge.name.trim(),
            slug: challengeSlug,
            description: normalizeNullableString(challenge.description),
            type: challenge.type,
            roundTarget: challenge.roundTarget ?? null,
            xpReward: Number.isFinite(challenge.xpReward) ? Math.max(0, Math.floor(challenge.xpReward)) : 0,
            isActive: Boolean(challenge.isActive),
          },
        });
        challengeIdBySourceSlug.set(challenge.sourceSlug || challenge.slug, created.id);
        challengeIdBySourceSlug.set(challengeSlug, created.id);
      }

      const easterEggIdBySourceSlug = new Map<string, string>();
      for (const easterEgg of payload.easterEggs) {
        const eggSlug = sanitizeSlug(easterEgg.slug, easterEgg.name);
        if (!eggSlug) throw new Error(`Invalid easter egg slug for "${easterEgg.name}"`);
        const createdEgg = await tx.easterEgg.create({
          data: {
            mapId: map.id,
            name: easterEgg.name.trim(),
            slug: eggSlug,
            description: normalizeNullableString(easterEgg.description),
            type: easterEgg.type,
            optimalRound: easterEgg.optimalRound ?? null,
            xpReward: Number.isFinite(easterEgg.xpReward) ? Math.max(0, Math.floor(easterEgg.xpReward)) : 0,
            playerCountRequirement: easterEgg.playerCountRequirement ?? null,
            rewardsDescription: normalizeNullableString(easterEgg.rewardsDescription),
            videoEmbedUrl: normalizeNullableString(easterEgg.videoEmbedUrl),
            variantTag: normalizeNullableString(easterEgg.variantTag),
            categoryTag: normalizeNullableString(easterEgg.categoryTag),
            isActive: Boolean(easterEgg.isActive),
          },
        });
        easterEggIdBySourceSlug.set(easterEgg.sourceSlug || easterEgg.slug, createdEgg.id);
        easterEggIdBySourceSlug.set(eggSlug, createdEgg.id);

        if (easterEgg.steps.length > 0) {
          await tx.easterEggStep.createMany({
            data: easterEgg.steps.map((step, index) => ({
              easterEggId: createdEgg.id,
              order: Number.isInteger(step.order) && step.order > 0 ? step.order : index + 1,
              label: step.label.trim(),
              imageUrl: normalizeNullableString(step.imageUrl),
              buildableReferenceSlug: normalizeNullableString(step.buildableReferenceSlug),
            })),
          });
        }
      }

      for (const achievement of payload.achievements) {
        const achievementSlug = sanitizeSlug(achievement.slug, achievement.name);
        if (!achievementSlug) throw new Error(`Invalid achievement slug for "${achievement.name}"`);
        const challengeId = achievement.challengeSourceSlug
          ? challengeIdBySourceSlug.get(achievement.challengeSourceSlug) ?? null
          : null;
        const easterEggId = achievement.easterEggSourceSlug
          ? easterEggIdBySourceSlug.get(achievement.easterEggSourceSlug) ?? null
          : null;

        await tx.achievement.create({
          data: {
            name: achievement.name.trim(),
            slug: achievementSlug,
            description: normalizeNullableString(achievement.description),
            iconUrl: normalizeNullableString(achievement.iconUrl),
            type: achievement.type,
            criteria: (achievement.criteria ?? {}) as Prisma.InputJsonValue,
            xpReward: Number.isFinite(achievement.xpReward) ? Math.max(0, Math.floor(achievement.xpReward)) : 0,
            rarity: achievement.rarity,
            isActive: Boolean(achievement.isActive),
            difficulty: achievement.difficulty ?? null,
            mapId: achievement.mapScoped ? map.id : null,
            challengeId,
            easterEggId,
          },
        });
      }

      return {
        map,
        counts: {
          challenges: payload.challenges.length,
          easterEggs: payload.easterEggs.length,
          achievements: payload.achievements.length,
        },
      };
    });

    revalidatePath('/maps');
    revalidatePath('/admin/maps');
    revalidatePath(`/maps/${result.map.slug}`);

    return NextResponse.json({
      ok: true,
      map: { id: result.map.id, slug: result.map.slug, name: result.map.name },
      counts: result.counts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create map clone' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const action = typeof body.action === 'string' ? body.action : '';

  if (action === 'preview') return handlePreview(body);
  if (action === 'create') return handleCreate(body);
  return NextResponse.json({ error: 'Invalid action. Use "preview" or "create".' }, { status: 400 });
}
