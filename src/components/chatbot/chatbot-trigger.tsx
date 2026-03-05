'use client';

import Image from 'next/image';
import { useChatbot } from '@/context/chatbot-context';
import { getAssetUrl } from '@/lib/assets';

const CHATBOT_IMAGE = getAssetUrl('/images/ranks/chatbot.png');

type ChatbotTriggerProps = {
  className?: string;
  size?: number;
  /** Shown on hover (tooltip) and used for aria-label; e.g. "Ask LeKronorium — site & zombies Q&A" */
  label?: string;
  showLabel?: boolean;
};

const DEFAULT_LABEL = 'Ask LeKronorium — get answers about the site, maps, rules & zombies';

export function ChatbotTrigger({
  className = '',
  size = 40,
  label = DEFAULT_LABEL,
  showLabel = false,
}: ChatbotTriggerProps) {
  const chatbot = useChatbot();
  if (!chatbot) return null;

  return (
    <button
      type="button"
      onClick={chatbot.openChatbot}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-transparent text-bunker-200 hover:text-white hover:bg-white/5 hover:border-bunker-600/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blood-500 touch-manipulation ${className}`}
      aria-label={label}
      title={label}
    >
      <span
        className="relative flex shrink-0 overflow-hidden rounded-md bg-bunker-800 border border-bunker-600"
        style={{ width: size, height: size }}
      >
        {CHATBOT_IMAGE ? (
          <Image src={CHATBOT_IMAGE} alt="" fill className="object-cover" sizes={`${size}px`} unoptimized />
        ) : (
          <span className="block w-full h-full bg-blood-900/50" />
        )}
      </span>
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}
