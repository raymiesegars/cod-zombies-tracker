'use client';

import { useAuth } from '@/context/auth-context';
import { ProfileSetupScreen } from '@/components/ui';

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isProfileSettingUp } = useAuth();

  return (
    <>
      {children}
      {isProfileSettingUp && <ProfileSetupScreen />}
    </>
  );
}
