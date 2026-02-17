'use client';

import Link from 'next/link';
import { ExternalLink, Coffee } from 'lucide-react';

// const DISCORD_URL = 'https://discord.gg/your-invite'; // TODO: replace and uncomment when ready
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
            aria-label="Support on Ko-fi — help keep the website running"
          >
            <Coffee className="w-5 h-5 flex-shrink-0" />
            Help keep the website running
          </a>
          <p className="text-xs text-bunker-500 mt-2 text-center max-w-md">
            Free, open source, no ads—donations help pay for server and database costs.
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
          {/* Discord and X commented out until set up
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blood-400 transition-colors" aria-label="Discord">
            <MessageCircle className="w-3.5 h-3.5" /> Discord
          </a>
          <a href={X_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blood-400 transition-colors" aria-label="X (Twitter)">
            <Twitter className="w-3.5 h-3.5" /> X
          </a>
          */}
          <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blood-400 transition-colors" aria-label="Creator portfolio and contact">
            <ExternalLink className="w-3.5 h-3.5" /> Contact / Portfolio
          </a>
          <a href={KOFI_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blood-400 transition-colors" aria-label="Support on Ko-fi">
            <Coffee className="w-3.5 h-3.5" /> Donate
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
