"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "@/lib/types";
import { ChatList } from "@/components/chat-list";
import { ChatInput } from "@/components/chat-input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { nanoid } from "nanoid";
import { ModelSelector } from "@/components/model-selector";

interface ChatProps {
  initialChatId?: string | null;
  initialMessages?: Message[];
  initialModel?: string;
}

export function Chat({
  initialChatId = null,
  initialMessages = [],
  initialModel = "claude-3-5-sonnet",
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [model, setModel] = useState<string>(initialModel);

  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  // Refresh state when a different chat mounts
  useEffect(() => {
    setChatId(initialChatId);
    setMessages(initialMessages);
    setModel(initialModel);
    inputRef.current?.focus();
  }, [initialChatId, initialMessages, initialModel]);

  const createChat = useMutation(api.chats.create);
  const sendMessage = useMutation(api.messages.send);
  const setChatModel = useMutation(api.chats.setModel);

  const handleModelChange = async (newModel: string) => {
    setModel(newModel);
    if (chatId) {
      try {
        await setChatModel({ id: chatId, model: newModel });
      } catch (err) {
        console.error("Failed to update model", err);
      }
    }
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        let currentChatId = chatId;

        // Create chat if it doesn't exist yet
        if (!currentChatId) {
          currentChatId = await createChat({
            title: content.slice(0, 30) + "...",
            model,
          });
          setChatId(currentChatId);
        }

        // USER MESSAGE
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

        // CALL LLM ENDPOINT (stream)
        setIsLoading(true);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            model,
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

        // Persist assistant message
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
    [chatId, createChat, messages, sendMessage, model]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Chat</h1>
        <ModelSelector value={model} onChange={handleModelChange} />
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