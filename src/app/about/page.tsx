import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Logo } from '@/components/ui';
import { Heart, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <Logo size="md" />
        <h1 className="text-2xl sm:text-3xl font-zombies text-white tracking-wide">About</h1>
      </div>

      <div className="space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blood-400" />
              About this project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm sm:text-base text-bunker-300">
            <p>
              CoD Zombies Tracker is <strong className="text-bunker-200">free and open source</strong>. 
              It will never be monetized or show advertisements. The goal is to keep it around for the long term 
              with a focus on reliability and secure handling of your data.
            </p>
            <p>
              Server and database costs are paid out of pocket. I&apos;m not rich, so any support via a 
              tip on Ko-fi in the footer is appreciated and goes directly toward keeping the site running. 
              No pressure—use the site either way.
            </p>
          </CardContent>
        </Card>

        <div className="pt-4 border-t border-bunker-800">
          <p className="text-sm text-bunker-400 mb-2">Made and maintained by Raymie Segars.</p>
          <a
            href="https://raymiesegars.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blood-400 hover:text-blood-300 transition-colors font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            raymiesegars.com — Portfolio & contact
          </a>
        </div>
      </div>
    </div>
  );
}
