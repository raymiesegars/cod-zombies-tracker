'use client';

import { MessageSquare } from 'lucide-react';
import { useChatbot } from '@/context/chatbot-context';

type ChatbotTriggerProps = {
  className?: string;
  size?: number;
  label?: string;
  showLabel?: boolean;
};

const DEFAULT_LABEL = 'Ask LeKronorium — site & zombies Q&A';

export function ChatbotTrigger({
  className = '',
  size = 40,
  label = DEFAULT_LABEL,
  showLabel = false,
}: ChatbotTriggerProps) {
  const chatbot = useChatbot();
  if (!chatbot) return null;

  const iconSize = Math.round(size * 0.55);
  return (
    <button
      type="button"
      onClick={chatbot.openChatbot}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-transparent text-bunker-200 hover:text-white hover:bg-white/5 hover:border-bunker-600/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blood-500 touch-manipulation ${className}`}
      aria-label={label}
      title={label}
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-md bg-bunker-800 border border-bunker-600 text-element-400"
        style={{ width: size, height: size }}
      >
        <MessageSquare className="text-element-400" style={{ width: iconSize, height: iconSize }} strokeWidth={2} />
      </span>
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}
