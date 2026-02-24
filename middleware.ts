import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Canonicalize: http→https, www→non-www (only in production)
  if (process.env.NODE_ENV === 'production') {
    const host = request.headers.get('host') || '';
    const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
    const isHttp = proto === 'http';
    const isWww = host.startsWith('www.');

    if (isHttp || isWww) {
      const target = new URL(request.url);
      target.protocol = 'https:';
      target.host = 'codzombiestracker.com';
      return NextResponse.redirect(target.toString(), 301);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
