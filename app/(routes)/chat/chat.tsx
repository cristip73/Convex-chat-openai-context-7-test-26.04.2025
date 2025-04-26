"use client";

import { useCallback, useState } from "react";
import { Message } from "@/lib/types";
import { ChatList } from "@/components/chat-list";
import { ChatInput } from "@/components/chat-input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { nanoid } from "nanoid";

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const createChat = useMutation(api.chats.create);
  const sendMessage = useMutation(api.messages.send);

  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        // If this is a new conversation, create a chat first
        if (!chatId) {
          const newChatId = await createChat({ title: content.slice(0, 30) + "..." });
          setChatId(newChatId);
        }
        
        // Add user message to UI
        const userMessage: Message = {
          id: nanoid(),
          content,
          role: "user",
          createdAt: Date.now(),
        };
        
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        
        // Save user message to database
        if (chatId) {
          await sendMessage({
            chatId,
            content,
            role: "user",
          });
        }
        
        // Call the API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        });
        
        // Error handling
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
        
        // Verificăm dacă există un ReadableStream
        if (!response.body) {
          throw new Error("No response body");
        }
        
        // Creăm un reader pentru a citi stream-ul
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = "";
        
        // Id unic pentru răspunsul asistent care se construiește
        const assistantMessageId = "assistant-" + nanoid();
        
        // Adăugăm un mesaj gol pentru asistent
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            content: "",
            role: "assistant",
            createdAt: Date.now(),
          },
        ]);
        
        // Procesăm stream-ul - acum citim direct text raw
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decodăm chunk-ul curent ca text simplu
          const chunk = decoder.decode(value, { stream: true });
          responseText += chunk;
          
          // Actualizăm mesajul asistentului cu textul colectat până acum
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: responseText }
                : m
            )
          );
        }
        
        // Save the complete assistant response to database
        if (chatId) {
          await sendMessage({
            chatId,
            content: responseText,
            role: "assistant",
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
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
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
} 