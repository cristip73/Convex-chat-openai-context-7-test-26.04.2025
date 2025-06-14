"use client";

import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { BotIcon, UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  return (
    <div
      className={cn(
        "flex p-3 md:p-4 gap-0 md:gap-3",
        isUser ? "bg-accent/50" : "bg-background"
      )}
    >
      <div
        className={cn(
          "hidden md:flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
          isUser ? "bg-primary text-primary-foreground" : "bg-background"
        )}
      >
        {isUser ? <UserIcon className="h-4 w-4" /> : <BotIcon className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex flex-col">
          <span className="font-semibold">
            {isUser ? "You" : "Mooji"}
          </span>
          {message.createdAt ? (
            <span className="text-xs text-muted-foreground">
              {formatDate(message.createdAt)}
            </span>
          ) : null}
        </div>
        {isUser ? (
          <div className="prose prose-neutral dark:prose-invert prose-pre:bg-zinc-700 prose-pre:text-zinc-100 max-w-none markdown-content break-words overflow-wrap-anywhere">
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="prose prose-neutral dark:prose-invert prose-pre:bg-zinc-700 prose-pre:text-zinc-100 max-w-none markdown-content break-words overflow-wrap-anywhere">
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
} 