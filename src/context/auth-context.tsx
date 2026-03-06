'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User } from '@/types';

type AuthContextType = {
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  isLoading: boolean;
  isProfileSettingUp: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileSettingUp, setIsProfileSettingUp] = useState(false);
  const supabase = createClient();
  const profileFetchedRef = useRef(false);
  const fetchingRef = useRef(false);

  const PROFILE_FETCH_TIMEOUT_MS = 15000; // 15s so we don't hang when DB is unreachable

  const fetchProfile = useCallback(async (supabaseId: string, retryCount = 0): Promise<User | null> => {
    if (fetchingRef.current) return null;
    fetchingRef.current = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PROFILE_FETCH_TIMEOUT_MS);
      const response = await fetch(`/api/users/profile?supabaseId=${supabaseId}`, {
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        profileFetchedRef.current = true;
        return data;
      }
      // 500: retry once after delay (e.g. pool timeout on first attempt)
      if (response.status >= 500 && retryCount < 1) {
        await new Promise((r) => setTimeout(r, 4000));
        fetchingRef.current = false;
        return fetchProfile(supabaseId, retryCount + 1);
      }
      if (response.status >= 500) return null;
      if (response.status === 404 && retryCount < 4) {
        // New OAuth user – profile might not exist yet, retry with backoff
        const delay = 200 * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        fetchingRef.current = false;
        return fetchProfile(supabaseId, retryCount + 1);
      }
      return null;
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') console.error('Error fetching profile:', error);
      return null;
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const createProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          supabaseId: supabaseUser.id,
          email: supabaseUser.email,
          displayName: supabaseUser.user_metadata?.full_name,
          avatarUrl: supabaseUser.user_metadata?.avatar_url,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        profileFetchedRef.current = true;
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      profileFetchedRef.current = false;
      fetchingRef.current = false;
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const alreadyFetched = profileFetchedRef.current;
          if (!alreadyFetched) setIsProfileSettingUp(true);
          try {
            const existingProfile = await fetchProfile(session.user.id);
            if (!existingProfile && mounted) {
              await createProfile(session.user);
            }
          } finally {
            if (mounted) setIsProfileSettingUp(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) setIsProfileSettingUp(false);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        profileFetchedRef.current = false;
        fetchingRef.current = false;
        setIsProfileSettingUp(true);
        try {
          const existingProfile = await fetchProfile(session.user.id);
          if (!existingProfile && mounted) {
            await createProfile(session.user);
          }
        } finally {
          if (mounted) setIsProfileSettingUp(false);
        }
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null);
        profileFetchedRef.current = false;
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, fetchProfile, createProfile]);

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    profileFetchedRef.current = false;
  };

  // Heartbeat for online presence (lastSeenAt) — only when tab is visible. Brief defer to avoid connection spike on sign-in.
  useEffect(() => {
    if (!profile?.id) return;
    const beat = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetch('/api/me/heartbeat', { method: 'PATCH', credentials: 'same-origin' }).catch(() => {});
    };
    const onVisible = () => beat();
    const t = setTimeout(beat, 3000);
    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(beat, 2 * 60 * 1000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [profile?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isProfileSettingUp,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
