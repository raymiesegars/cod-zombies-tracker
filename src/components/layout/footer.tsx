'use client';

import Link from 'next/link';
import { ExternalLink, Coffee } from 'lucide-react';

const DISCORD_URL = 'https://discord.gg/Gc6Cnt7XxT';
// const X_URL = 'https://x.com/yourhandle'; // TODO: replace and uncomment when ready
const PORTFOLIO_URL = 'https://raymiesegars.com';
const KOFI_URL = process.env.NEXT_PUBLIC_KOFI_URL || 'https://ko-fi.com/raymiesegars';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bunker-950 border-t border-bunker-800/50" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Ko-fi CTA */}
        <div className="flex flex-col items-center mb-6">
          <a
            href={KOFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#ff5e5b] hover:bg-[#ff7875] text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all border border-[#e54d4a]/50 hover:scale-[1.02]"
            aria-label="Tip on Ko-fi — help keep the website running"
          >
            <Coffee className="w-5 h-5 flex-shrink-0" />
            Help keep the website running
          </a>
          <p className="text-xs text-bunker-500 mt-2 text-center max-w-md">
            Free, open source, no ads—tips help pay for server and database costs.
          </p>
        </div>

        <p className="text-xs sm:text-sm text-bunker-400 text-center max-w-2xl mx-auto mb-4 break-words">
          Call of Duty Zombies Easter egg guides & buildables—every step, side egg, and part. Log runs, challenges, and speedruns; track progress with XP and ranks. Free fan project, no monetization, no advertisements. Secure databases; built to stay around.
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-bunker-400 mb-4" aria-label="Footer navigation">
          <Link href="/maps" className="hover:text-blood-400 transition-colors">Maps</Link>
          <Link href="/leaderboards" className="hover:text-blood-400 transition-colors">Leaderboards</Link>
          <Link href="/about" className="hover:text-blood-400 transition-colors">About</Link>
          <span className="text-bunker-600">·</span>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-bunker-400 hover:text-[#5865F2] transition-colors group" aria-label="Join our Discord">
            <span className="inline-flex text-[#5865F2] group-hover:brightness-125 transition-[filter]" aria-hidden>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </span>
            Discord
          </a>
          {/* X (Twitter) commented out until set up
          <a href={X_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blood-400 transition-colors" aria-label="X (Twitter)">
            <Twitter className="w-3.5 h-3.5" /> X
          </a>
          */}
          <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blood-400 transition-colors" aria-label="Creator portfolio and contact">
            <ExternalLink className="w-3.5 h-3.5" /> Contact / Portfolio
          </a>
          <a href={KOFI_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blood-400 transition-colors" aria-label="Tip on Ko-fi">
            <Coffee className="w-3.5 h-3.5" /> Tip
          </a>
        </nav>

        <p className="text-xs text-bunker-500 text-center mb-1">
          <Link href="/about" className="hover:text-bunker-400 underline underline-offset-2">Rank icons</Link> are AI-generated; this site does not condone AI art. See About for details.
        </p>
        <div className="text-center text-xs text-bunker-500">
          <p>© {year} CoD Zombies Tracker. Not affiliated with Activision or Treyarch.</p>
        </div>
      </div>
    </footer>
  );
}
