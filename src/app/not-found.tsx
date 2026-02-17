import Link from 'next/link';
import { Button } from '@/components/ui';
import { Home } from 'lucide-react';
import { MapIcon } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Display */}
        <div className="relative mb-8">
          <span className="text-[150px] sm:text-[200px] font-display font-bold text-void-900">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl sm:text-8xl font-display font-bold text-gradient">
              404
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-void-400 mb-8 max-w-md mx-auto">
          This page doesn&apos;t exist or has been moved. Head back to CoD Zombies Tracker to find your next Easter egg.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button leftIcon={<Home className="w-4 h-4" />}>
              Go Home
            </Button>
          </Link>
          <Link href="/maps">
            <Button variant="secondary" leftIcon={<MapIcon className="w-4 h-4" />} className="[text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
              Browse Maps
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
