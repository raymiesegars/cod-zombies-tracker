'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const ChatbotPanel = dynamic(() => import('@/components/chatbot/chatbot-panel').then((m) => m.ChatbotPanel), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[200px] p-4" aria-hidden>
      <div className="w-6 h-6 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type ChatbotContextValue = {
  isOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
};

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openChatbot = useCallback(() => setIsOpen(true), []);
  const closeChatbot = useCallback(() => setIsOpen(false), []);

  return (
    <ChatbotContext.Provider value={{ isOpen, openChatbot, closeChatbot }}>
      {children}
      <AnimatePresence>
        {isOpen && <ChatbotPanel onClose={closeChatbot} />}
      </AnimatePresence>
    </ChatbotContext.Provider>
  );
}

export function useChatbot(): ChatbotContextValue | null {
  return useContext(ChatbotContext);
}
