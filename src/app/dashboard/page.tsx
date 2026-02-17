'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Logo, PageLoader } from '@/components/ui';

function DashboardLoadingScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-bunker-950/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 p-8">
        <Logo size="xl" animated={false} className="opacity-90" />
        <PageLoader message={message} className="gap-6" />
        <p className="text-xs text-bunker-500 max-w-sm text-center">
          {message.includes('Setting up')
            ? 'Creating your CoD Zombies Tracker account. This only takes a moment.'
            : 'Redirecting you to your dashboard.'}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading, isProfileSettingUp } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (profile?.username) {
      router.replace(`/users/${profile.username}`);
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || !user) {
    return <DashboardLoadingScreen message="Loading…" />;
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
