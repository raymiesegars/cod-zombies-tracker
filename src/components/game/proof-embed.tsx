'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getProofEmbedUrl } from '@/lib/utils';
import { ExternalLink, Play, ImageIcon } from 'lucide-react';

interface ProofEmbedProps {
  url: string;
  className?: string;
}

export function ProofEmbed({ url, className }: ProofEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { type, embedUrl } = getProofEmbedUrl(url);

  if (type === 'youtube' && embedUrl) {
    return (
      <div className={className}>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-bunker-800">
          {!isLoaded && (
            <button
              onClick={() => setIsLoaded(true)}
              className="absolute inset-0 flex items-center justify-center bg-bunker-800 hover:bg-bunker-700 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-blood-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </button>
          )}
          {isLoaded && (
            <iframe
              src={`${embedUrl}?autoplay=1`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          )}
        </div>
      </div>
    );
  }

  if (type === 'twitch' && embedUrl) {
    return (
      <div className={className}>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-bunker-800">
          {!isLoaded && (
            <button
              onClick={() => setIsLoaded(true)}
              className="absolute inset-0 flex items-center justify-center bg-bunker-800 hover:bg-bunker-700 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-element-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </button>
          )}
          {isLoaded && (
            <iframe
              src={embedUrl}
              title="Twitch video"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          )}
        </div>
      </div>
    );
  }

  if (type === 'image' && embedUrl) {
    return (
      <div className={className}>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-bunker-800">
          <Image
            src={embedUrl}
            alt="Proof screenshot"
            fill
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  // Can’t embed – show link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-bunker-800 hover:bg-bunker-700 rounded-lg text-blood-400 hover:text-blood-300 transition-colors"
    >
      <ImageIcon className="w-4 h-4" />
      <span>View Proof</span>
      <ExternalLink className="w-4 h-4" />
    </a>
  );
}
