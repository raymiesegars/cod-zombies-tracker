import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// CHATBOT DISABLED: Returns empty to avoid DB calls. Restore full handler to re-enable.
export async function GET() {
  return NextResponse.json({ remaining: 0, isAdmin: false, signedIn: false, nextRefillAt: null });
}
