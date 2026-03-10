'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useShowLoadingAfter } from '@/hooks/use-show-loading-after';
import { Logo, PageLoader } from '@/components/ui';

function DashboardLoadingScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-bunker-950/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 p-8">
        <Logo size="xl" animated={false} className="opacity-90" />
        <PageLoader message={message} className="gap-6" />
        <p className="text-xs text-bunker-500 max-w-sm text-center">
          {message.includes('Setting up')
            ? 'Creating your CoD Zombies Tracker account. This only takes a moment.'
            : message.includes('trouble')
              ? 'The server may be busy. Click below to try again.'
              : 'Redirecting you to your dashboard.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-element-600 hover:bg-element-500 text-white font-semibold text-sm transition-colors"
          >
            Refresh page
          </button>
        )}
      </div>
    </div>
  );
}

const LOADING_DELAY_MS = 250;
const PROFILE_LOAD_TIMEOUT_MS = 12_000;

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading, isProfileSettingUp } = useAuth();
  const showLoadingUI = useShowLoadingAfter(isLoading || !user, LOADING_DELAY_MS);
  const [profileLoadTimedOut, setProfileLoadTimedOut] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (profile?.username) {
      if (typeof window !== 'undefined' && sessionStorage.getItem('czt_first_login')) {
        sessionStorage.removeItem('czt_first_login');
        router.replace('/settings');
        return;
      }
      router.replace(`/users/${profile.username}`);
    }
  }, [user, profile, isLoading, router]);

  useEffect(() => {
    if (!user || profile?.username || isProfileSettingUp) {
      setProfileLoadTimedOut(false);
      return;
    }
    const t = setTimeout(() => setProfileLoadTimedOut(true), PROFILE_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [user, profile?.username, isProfileSettingUp]);

  const handleRetry = () => {
    setProfileLoadTimedOut(false);
    window.location.reload();
  };

  if (isLoading || !user) {
    if (!showLoadingUI) {
      return <div className="fixed inset-0 z-30 bg-bunker-950" aria-hidden />;
    }
    return <DashboardLoadingScreen message="Loading…" />;
  }
  if (profileLoadTimedOut) {
    return (
      <DashboardLoadingScreen
        message="Having trouble loading your profile."
        onRetry={handleRetry}
      />
    );
  }
  if (isProfileSettingUp || !profile?.username) {
    return (
      <DashboardLoadingScreen
        message={isProfileSettingUp ? 'Setting up your profile…' : 'Taking you to your dashboard…'}
      />
    );
  }

  return <DashboardLoadingScreen message="Taking you to your dashboard…" />;
}
