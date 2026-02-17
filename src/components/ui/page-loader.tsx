'use client';

import { motion } from 'framer-motion';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  inline?: boolean;
  className?: string;
}

export function PageLoader({ message, fullScreen = false, inline = false, className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6',
        fullScreen && 'min-h-[70vh] py-16',
        inline && 'py-12 gap-4',
        className
      )}
    >
      {/* CoD Zombies themed loader: blood red ring + 115 element glow */}
      <div className="relative">
        {/* Outer blood ring */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-bunker-700 rounded-full" />
        {/* Spinning blood ring */}
        <motion.div
          className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-2 border-transparent border-t-blood-500 border-r-blood-700/50 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner 115 glow */}
        <motion.div
          className="absolute inset-2 sm:inset-2.5 w-12 h-12 sm:w-14 sm:h-14 bg-element-500/20 rounded-full blur-md"
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-blood-500" />
        </div>
      </div>
      {message && (
        <p className="text-sm text-bunker-400 text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
}

// Full-screen "setting up profile" for new OAuth signups
export function ProfileSetupScreen() {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-bunker-950/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 p-8">
        <Logo size="xl" animated={true} />
        <PageLoader
          message="Setting up your profile..."
          className="gap-6"
        />
        <p className="text-xs text-bunker-500 max-w-sm text-center">
          Creating your CoD Zombies Tracker account. This only takes a moment.
        </p>
      </div>
    </div>
  );
}
