import { NextResponse } from 'next/server';
import { getRulesPageSections } from '@/lib/rules/loader';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sections = await getRulesPageSections();
  return NextResponse.json({ sections });
}
