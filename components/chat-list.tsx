"use client";

import { Message } from "@/lib/types";
import { ChatMessage } from "@/components/chat-message";
import { useRef, useEffect } from "react";

interface ChatListProps {
  messages: Message[];
}

export function ChatList({ messages }: ChatListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Welcome, beloved seeker</h3>
          <p className="text-muted-foreground">
            Ask Mooji anything about your spiritual journey, self-inquiry, or the nature of your true Self.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 