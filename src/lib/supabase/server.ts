import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Can't set cookies in this context
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same – read-only here
          }
        },
      },
    }
  );
}

function isExpectedAuthRefreshError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: unknown }).code;
  return code === 'refresh_token_not_found' || code === 'invalid_refresh_token';
}

export async function getSession() {
  const supabase = createServerSupabaseClient();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    if (!isExpectedAuthRefreshError(error)) {
      console.error('Error getting session:', error);
    }
    return null;
  }
}

/** Server-verified user (network call to Supabase Auth). Use for writes or when revocation must be checked. */
export async function getUser() {
  const supabase = createServerSupabaseClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    if (!isExpectedAuthRefreshError(error)) {
      console.error('Error getting user:', error);
    }
    return null;
  }
}

/** Session-based user (no network). Faster for read-only routes. Does not detect server-side logout. */
export async function getOptionalUserFromSession() {
  const session = await getSession();
  return session?.user ?? null;
}
