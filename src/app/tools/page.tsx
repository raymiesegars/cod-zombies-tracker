'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';
import { Wrench, ExternalLink, Calculator, Trophy } from 'lucide-react';

const tools = [
  {
    name: 'Zombacus',
    url: 'https://www.zombacus.com/',
    description:
      'Your useful Call of Duty Zombies tool. Zombacus hosts calculators, strategies & guides, drop cycle trackers, ammo and boss trackers, gumball cycle tracker, camo tracker, and more—for players new and old.',
    icon: Calculator,
    accent: 'element',
    tagline: 'Calculators, guides & trackers',
  },
  {
    name: 'ZWR',
    url: 'https://zwr.gg/',
    description:
      'The official Zombies World Records site. Verified high scores and leaderboards for CoD Zombies. Submit and watch records for the community-recognized standards.',
    icon: Trophy,
    accent: 'blood',
    tagline: 'Official verified leaderboards',
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-bunker-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="w-8 h-8 text-blood-500" />
          <h1 className="text-2xl sm:text-3xl font-zombies text-white tracking-wide">
            More Zombies Tools
          </h1>
        </div>
        <p className="text-bunker-400 text-sm sm:text-base mb-10">
          Other sites we recommend for calculators, strategies, and verified records. Use these alongside CoD Zombies Tracker for guides, progress, and LFG.
        </p>

        <div className="grid gap-6 sm:gap-8">
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card
                variant="bordered"
                interactive
                className={`
                  overflow-hidden border-2 transition-all duration-200
                  ${tool.accent === 'element'
                    ? 'border-element-900/60 hover:border-element-600/80 hover:shadow-lg hover:shadow-element-950/20'
                    : 'border-blood-900/60 hover:border-blood-600/80 hover:shadow-lg hover:shadow-blood-950/20'
                  }
                `}
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div
                      className={`
                        flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center
                        ${tool.accent === 'element'
                          ? 'bg-element-950/70 border border-element-800/50 text-element-400'
                          : 'bg-blood-950/70 border border-blood-800/50 text-white'
                        }
                      `}
                    >
                      <tool.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-xl sm:text-2xl font-zombies text-white tracking-wide group-hover:text-blood-400 transition-colors">
                          {tool.name}
                        </h2>
                        <span
                          className={`
                            text-xs font-medium px-2 py-0.5 rounded
                            ${tool.accent === 'element'
                              ? 'bg-element-900/50 text-element-300'
                              : 'bg-blood-900/50 text-white'
                            }
                          `}
                        >
                          {tool.tagline}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-bunker-400 leading-relaxed">
                        {tool.description}
                      </p>
                      <span
                        className={`
                          inline-flex items-center gap-1.5 mt-3 text-sm font-medium
                          ${tool.accent === 'element' ? 'text-element-400' : 'text-white'}
                          group-hover:underline
                        `}
                      >
                        Visit site
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-bunker-500">
          These are third-party sites. We’re not affiliated with Zombacus or ZWR—just fans sharing useful links.
        </p>
      </div>
    </div>
  );
}
