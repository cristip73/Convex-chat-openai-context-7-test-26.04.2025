"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "@/lib/types";
import { ChatList } from "@/components/chat-list";
import { ChatInput } from "@/components/chat-input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { nanoid } from "nanoid";
import { ModelSelector } from "@/components/model-selector";
import { useRouter } from "next/navigation";

interface ChatProps {
  initialChatId?: string | null;
  initialMessages?: Message[];
  initialModel?: string;
  hideHeader?: boolean;
}

export function Chat({
  initialChatId = null,
  initialMessages = [],
  initialModel = "gemini-2.5-flash-preview-05-20",
  hideHeader = false,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [model, setModel] = useState<string>(initialModel);
  
  const inputRef = useRef<HTMLTextAreaElement>(null) as React.RefObject<HTMLTextAreaElement>;
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

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

  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        let currentChatId = chatId;

        // Create chat if it doesn't exist yet and redirect immediately
        if (!currentChatId) {
          currentChatId = await createChat({
            title: content.slice(0, 30) + "...",
            model,
          });
          
          // Emit event to notify sidebar about new chat creation
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('chatCreated', { 
              detail: { chatId: currentChatId } 
            }));
          }
          
          // Redirect immediately and let the new component handle the message
          router.replace(`/chat/${currentChatId}`);
          
          // Store the pending message to be sent after redirect
          localStorage.setItem('pendingMessage', content);
          return;
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

        // Emit event to notify sidebar about chat activity (for reordering)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('chatUpdated', { 
            detail: { chatId: currentChatId } 
          }));
        }

        // CALL LLM ENDPOINT (stream)
        setIsLoading(true);
        setIsStreaming(true);

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const currentAbortController = abortControllerRef.current;

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            model,
          }),
          signal: currentAbortController.signal,
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
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Check if we were aborted
            if (currentAbortController.signal.aborted) {
              break;
            }
            
            assistantText += decoder.decode(value, { stream: true });

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: assistantText }
                  : m
              )
            );
          }
        } catch (error) {
          // If it's an abort error, we don't need to throw
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Stream was aborted by user');
          } else {
            throw error;
          }
        }

        // Save assistant message if there's any content, even if aborted
        if (assistantText.trim()) {
          try {
            await sendMessage({
              chatId: currentChatId,
              content: assistantText,
              role: "assistant",
            });

            // Emit event to notify sidebar about chat activity (for reordering)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('chatUpdated', { 
                detail: { chatId: currentChatId } 
              }));
            }
          } catch (error) {
            console.error('Failed to save partial message:', error);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Request was aborted');
        } else {
          console.error("Error sending message:", err);
        }
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [chatId, createChat, messages, sendMessage, model, router]
  );

  // Handle pending message after redirect from new chat creation
  useEffect(() => {
    const pendingMessage = localStorage.getItem('pendingMessage');
    if (pendingMessage && initialChatId) {
      localStorage.removeItem('pendingMessage');
      // Process the pending message after component has mounted
      setTimeout(() => {
        handleSendMessage(pendingMessage);
      }, 100);
    }
  }, [initialChatId, handleSendMessage]);

  return (
    <div className="flex flex-col h-full max-h-[100dvh]">
      {!hideHeader && (
        <div className="border-b py-2 px-4 flex items-center justify-between gap-2 sticky top-0 bg-background z-20">
          <div className="flex items-center">
            <h1 className="text-xl font-bold truncate hidden md:block">Chat</h1>
            {/* Spacer for mobile to account for hamburger menu */}
            <div className="w-10 md:hidden"></div>
          </div>
          <ModelSelector value={model} onChange={handleModelChange} className="max-w-[180px]" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        <ChatList messages={messages} />
      </div>

      <div className="sticky bottom-0 w-full bg-background z-20">
        <ChatInput
          onSend={handleSendMessage}
          onStop={handleStopStreaming}
          isLoading={isLoading}
          isStreaming={isStreaming}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
} 