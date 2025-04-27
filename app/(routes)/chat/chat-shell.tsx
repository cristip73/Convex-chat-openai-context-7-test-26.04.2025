"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatSidebar } from "@/components/chat-sidebar";
import { Chat } from "./chat";
import { Message } from "@/lib/types";

export default function ChatShell() {
  // currently chosen chat (null == new chat)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  // increments every time user presses "+" to start a brand-new chat
  const [newChatCounter, setNewChatCounter] = useState(0);

  // load history for the selected chat (skip when null)
  const chatData = useQuery(
    api.chats.get,
    selectedChatId ? { id: selectedChatId } : "skip"
  );
  const initialMessages: Message[] = chatData?.messages ?? [];
  const initialModel: string = chatData?.model ?? "gpt-4.1-mini";

  /** User picked a chat from the sidebar. */
  const handleSelectChat = (id: string | null) => {
    if (id) {
      // existing chat
      setSelectedChatId(id);
    } else {
      // brand-new chat
      setSelectedChatId(null);
      setNewChatCounter((c) => c + 1); // force fresh key
    }
  };

  return (
    <div className="h-[100dvh] flex overflow-hidden">
      <ChatSidebar
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
      />

      <div className="flex-1 flex flex-col">
        <Chat
          key={selectedChatId ? selectedChatId : `new-${newChatCounter}`}
          initialChatId={selectedChatId}
          initialMessages={initialMessages}
          initialModel={initialModel}
        />
      </div>
    </div>
  );
}