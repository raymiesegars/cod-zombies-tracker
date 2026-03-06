'use client';

import dynamic from 'next/dynamic';
import React, { createContext, useContext, useState, useCallback } from 'react';

type ChatbotContextValue = {
  isOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
};

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

const ChatbotPanel = dynamic(
  () => import('@/components/chatbot/chatbot-panel').then((m) => m.ChatbotPanel),
  { ssr: false, loading: () => null }
);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openChatbot = useCallback(() => setIsOpen(true), []);
  const closeChatbot = useCallback(() => setIsOpen(false), []);

  return (
    <ChatbotContext.Provider value={{ isOpen, openChatbot, closeChatbot }}>
      {children}
      {isOpen && <ChatbotPanel onClose={closeChatbot} />}
    </ChatbotContext.Provider>
  );
}

export function useChatbot(): ChatbotContextValue | null {
  return useContext(ChatbotContext);
}
