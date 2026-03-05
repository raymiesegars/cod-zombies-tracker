'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { ProfileSetupScreen } from '@/components/ui';

const SETUP_OVERLAY_MAX_MS = 22_000; // If still "setting up" after this, treat as stuck and sign out so user can try again

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isProfileSettingUp, profile, signOut } = useAuth();
  const [forceHideSetup, setForceHideSetup] = useState(false);

  useEffect(() => {
    if (!isProfileSettingUp) {
      setForceHideSetup(false);
      return;
    }
    const t = setTimeout(() => {
      setForceHideSetup(true);
      // Stuck on "setting up" (e.g. API 500 / connection issues) — sign out so they get a clean state and can try again
      signOut();
    }, SETUP_OVERLAY_MAX_MS);
    return () => clearTimeout(t);
  }, [isProfileSettingUp, signOut]);

  // Only show overlay when we're actually setting up and don't have a profile yet (avoids flash on every navigation)
  const showProfileSetupOverlay =
    isProfileSettingUp && !profile && pathname !== '/dashboard' && !forceHideSetup;

  return (
    <>
      {children}
      {showProfileSetupOverlay && <ProfileSetupScreen />}
    </>
  );
}
