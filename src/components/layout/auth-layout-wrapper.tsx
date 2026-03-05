'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { ProfileSetupScreen } from '@/components/ui';

const SETUP_OVERLAY_MAX_MS = 22_000; // Hide overlay after 22s so user never sticks forever (e.g. when API is 500)

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isProfileSettingUp } = useAuth();
  const [forceHideSetup, setForceHideSetup] = useState(false);

  useEffect(() => {
    if (!isProfileSettingUp) {
      setForceHideSetup(false);
      return;
    }
    const t = setTimeout(() => setForceHideSetup(true), SETUP_OVERLAY_MAX_MS);
    return () => clearTimeout(t);
  }, [isProfileSettingUp]);

  // Dashboard has its own loading state; avoid double overlay and flicker
  const showProfileSetupOverlay =
    isProfileSettingUp && pathname !== '/dashboard' && !forceHideSetup;

  return (
    <>
      {children}
      {showProfileSetupOverlay && <ProfileSetupScreen />}
    </>
  );
}
