'use client';

import dynamic from 'next/dynamic';
import React, { createContext, useContext, useState, useCallback } from 'react';

const MAX_CHAT_MESSAGES = 10;

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

type ChatbotContextValue = {
  isOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

const ChatbotPanel = dynamic(
  () => import('@/components/chatbot/chatbot-panel').then((m) => m.ChatbotPanel),
  { ssr: false, loading: () => null }
);

function trimMessages(msgs: ChatMessage[]): ChatMessage[] {
  return msgs.length > MAX_CHAT_MESSAGES ? msgs.slice(-MAX_CHAT_MESSAGES) : msgs;
}

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessagesRaw] = useState<ChatMessage[]>([]);
  const openChatbot = useCallback(() => setIsOpen(true), []);
  const closeChatbot = useCallback(() => setIsOpen(false), []);
  const setMessages = useCallback(
    (updater: React.SetStateAction<ChatMessage[]>) => {
      setMessagesRaw((prev) => trimMessages(typeof updater === 'function' ? updater(prev) : updater));
    },
    []
  );

  return (
    <ChatbotContext.Provider value={{ isOpen, openChatbot, closeChatbot, messages, setMessages }}>
      {children}
      {isOpen && <ChatbotPanel onClose={closeChatbot} />}
    </ChatbotContext.Provider>
  );
}

export function useChatbot(): ChatbotContextValue | null {
  return useContext(ChatbotContext);
}
