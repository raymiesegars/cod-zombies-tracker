import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedRulesForGameFromDb } from '@/lib/rules/loader';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ game: string }> }
) {
  const { game } = await params;
  const shortName = decodeURIComponent(game).toUpperCase();
  if (!shortName) {
    return NextResponse.json({ error: 'Game required' }, { status: 400 });
  }
  const rules = await getUnifiedRulesForGameFromDb(shortName);
  if (!rules) {
    return NextResponse.json({ error: 'Rules not found for this game' }, { status: 404 });
  }
  return NextResponse.json(rules);
}
