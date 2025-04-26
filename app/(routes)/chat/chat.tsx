"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "@/lib/types";
import { ChatList } from "@/components/chat-list";
import { ChatInput } from "@/components/chat-input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { nanoid } from "nanoid";

interface ChatProps {
  initialChatId?: string | null;
  initialMessages?: Message[];
}

export function Chat({
  initialChatId = null,
  initialMessages = [],
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refresh state when a different chat is mounted (component remounted via key)
  useEffect(() => {
    setChatId(initialChatId);
    setMessages(initialMessages);
    // Focus the chat input on mount or when chat changes
    inputRef.current?.focus();
  }, [initialChatId, initialMessages]);

  const createChat = useMutation(api.chats.create);
  const sendMessage = useMutation(api.messages.send);

  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        let currentChatId = chatId;

        // ─── Create chat if needed ────────────────────────────────────────────────
        if (!currentChatId) {
          currentChatId = await createChat({
            title: content.slice(0, 30) + "...",
          });
          setChatId(currentChatId);
        }

        // ─── USER MESSAGE ─────────────────────────────────────────────────────────
        const userMessage: Message = {
          id: nanoid(),
          content,
          role: "user",
          createdAt: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);

        await sendMessage({
          chatId: currentChatId,
          content,
          role: "user",
        });

        // ─── CALL LLM ENDPOINT (stream) ──────────────────────────────────────────
        setIsLoading(true);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        });

        if (!response.ok) throw new Error("Failed to send message");
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";
        const assistantMessageId = "assistant-" + nanoid();

        // Placeholder assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            content: "",
            role: "assistant",
            createdAt: Date.now(),
          },
        ]);

        // Stream chunks
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: assistantText }
                : m
            )
          );
        }

        // Persist assistant message (including first one!)
        await sendMessage({
          chatId: currentChatId,
          content: assistantText,
          role: "assistant",
        });
      } catch (err) {
        console.error("Error sending message:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, createChat, messages, sendMessage]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h1 className="text-xl font-bold">Chat</h1>
      </div>
      <ChatList messages={messages} />
      <ChatInput
        onSend={handleSendMessage}
        isLoading={isLoading}
        inputRef={inputRef}
      />
    </div>
  );
} 