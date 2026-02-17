'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ProfileSetupScreen } from '@/components/ui';

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isProfileSettingUp } = useAuth();
  // Dashboard has its own loading state; avoid double overlay and flicker
  const showProfileSetupOverlay = isProfileSettingUp && pathname !== '/dashboard';

  return (
    <>
      {children}
      {showProfileSetupOverlay && <ProfileSetupScreen />}
    </>
  );
}
