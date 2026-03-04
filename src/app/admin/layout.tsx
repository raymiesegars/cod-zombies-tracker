'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/admin/verification', label: 'Verification', icon: ShieldCheck },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bunker-950">
      <nav className="border-b border-bunker-800 bg-bunker-900/80 sticky top-0 z-10" aria-label="Admin sections">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-blood-500 text-blood-400'
                      : 'border-transparent text-bunker-400 hover:text-bunker-200 hover:border-bunker-600'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
