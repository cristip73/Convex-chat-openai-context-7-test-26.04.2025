"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatSidebar } from "@/components/chat-sidebar";
import { Chat } from "./chat";
import { Message } from "@/lib/types";

interface ChatShellProps {
  chatId?: string | null;
}

export default function ChatShell({ chatId: propChatId = null }: ChatShellProps) {
  // Use prop chatId or fall back to state for new chat navigation
  const [newChatCounter, setNewChatCounter] = useState(0);
  
  // Current chat ID is either from URL params or local state
  const currentChatId = propChatId;

  // load history for the selected chat (skip when null)
  const chatData = useQuery(
    api.chats.get,
    currentChatId ? { id: currentChatId } : "skip"
  );
  const initialMessages: Message[] = chatData?.messages ?? [];
  const initialModel: string = chatData?.model ?? "gemini-2.5-flash-preview-05-20";

  /** User picked a chat from the sidebar - now handled by router navigation */
  const handleSelectChat = (id: string | null) => {
    if (id) {
      // Navigation is handled by ChatSidebar using router.push
      // This callback is kept for compatibility but won't be used
    } else {
      // For new chat, increment counter to force remount
      setNewChatCounter((c) => c + 1);
    }
  };

  return (
    <div className="h-[100dvh] flex overflow-hidden">
      <ChatSidebar
        selectedChatId={currentChatId}
        onSelectChat={handleSelectChat}
      />

      <div className="flex-1 flex flex-col">
        <Chat
          key={currentChatId ? currentChatId : `new-${newChatCounter}`}
          initialChatId={currentChatId}
          initialMessages={initialMessages}
          initialModel={initialModel}
        />
      </div>
    </div>
  );
}