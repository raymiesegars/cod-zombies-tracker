import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOptionalUserFromSession } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { RULES_GAMES } from '@/lib/rules/index';
import type { RulesSection } from '@/lib/rules/index';

function isValidRuleItem(item: unknown): boolean {
  if (typeof item === 'string') return true;
  if (!item || typeof item !== 'object') return false;
  const o = item as Record<string, unknown>;
  if ('href' in o && typeof o.text === 'string') return true;
  if ('parts' in o && Array.isArray(o.parts)) {
    return o.parts.every(
      (p: unknown) =>
        typeof p === 'string' ||
        (p && typeof p === 'object' && typeof (p as { text?: string }).text === 'string' && typeof (p as { href?: string }).href === 'string')
    );
  }
  return false;
}

function isValidRulesSection(x: unknown): x is RulesSection {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (typeof o.title !== 'string' || !Array.isArray(o.items)) return false;
  return o.items.every(isValidRuleItem);
}

function isValidChallengeRulesByType(x: unknown): x is Record<string, string> {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return Object.entries(o).every(
    ([k, v]) => typeof k === 'string' && typeof v === 'string'
  );
}

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ game: string }> }
) {
  try {
    const supabaseUser = await getOptionalUserFromSession();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden: super admin only' }, { status: 403 });
    }

    const { game } = await params;
    const shortName = decodeURIComponent(game).toUpperCase();
    const allowed = RULES_GAMES.some((g) => g.shortName === shortName);
    if (!allowed) {
      return NextResponse.json({ error: 'Game not in allowed list' }, { status: 400 });
    }

    const body = await request.json();
    const generalSections = body.generalSections;
    const challengeSections = body.challengeSections;
    const challengeRulesByType = body.challengeRulesByType;

    if (
      generalSections === undefined &&
      challengeSections === undefined &&
      challengeRulesByType === undefined
    ) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const update: {
      generalSections?: unknown;
      challengeSections?: unknown;
      challengeRulesByType?: unknown;
    } = {};

    if (generalSections !== undefined) {
      if (!Array.isArray(generalSections) || !generalSections.every(isValidRulesSection)) {
        return NextResponse.json({ error: 'Invalid generalSections format' }, { status: 400 });
      }
      update.generalSections = generalSections;
    }
    if (challengeSections !== undefined) {
      if (!Array.isArray(challengeSections) || !challengeSections.every(isValidRulesSection)) {
        return NextResponse.json({ error: 'Invalid challengeSections format' }, { status: 400 });
      }
      update.challengeSections = challengeSections;
    }
    if (challengeRulesByType !== undefined) {
      if (!isValidChallengeRulesByType(challengeRulesByType)) {
        return NextResponse.json({ error: 'Invalid challengeRulesByType format' }, { status: 400 });
      }
      update.challengeRulesByType = challengeRulesByType;
    }

    const existing = await prisma.gameRules.findUnique({
      where: { gameShortName: shortName },
    });

    let result;
    const { getUnifiedRulesForGame } = await import('@/lib/rules/index');
    const staticRules = getUnifiedRulesForGame(shortName);
    if (!staticRules) {
      return NextResponse.json({ error: 'No static rules for this game' }, { status: 400 });
    }

    const payload = {
      generalSections:
        update.generalSections ?? (existing ? (existing.generalSections as object) : staticRules.generalSections),
      challengeSections:
        update.challengeSections ?? (existing ? (existing.challengeSections as object) : staticRules.challengeSections),
      challengeRulesByType:
        update.challengeRulesByType ?? (existing ? (existing.challengeRulesByType as object) : staticRules.challengeRulesByType),
    };

    if (existing) {
      result = await prisma.gameRules.update({
        where: { gameShortName: shortName },
        data: payload,
      });
    } else {
      result = await prisma.gameRules.create({
        data: {
          gameShortName: shortName,
          ...payload,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
