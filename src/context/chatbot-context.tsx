'use client';

// CHATBOT DISABLED: Commented out for speed testing. Restore ChatbotProvider/useChatbot to re-enable.
import React, { createContext, useContext } from 'react';

// const ChatbotPanel = dynamic(() => import('@/components/chatbot/chatbot-panel').then((m) => m.ChatbotPanel), {
//   ssr: false,
//   loading: () => (
//     <div className="flex items-center justify-center min-h-[200px] p-4" aria-hidden>
//       <div className="w-6 h-6 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
//     </div>
//   ),
// });

type ChatbotContextValue = {
  isOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
};

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChatbotContext.Provider value={null}>
      {children}
      {/* {isOpen && <ChatbotPanel onClose={closeChatbot} />} */}
    </ChatbotContext.Provider>
  );
}

export function useChatbot(): ChatbotContextValue | null {
  return useContext(ChatbotContext);
}
