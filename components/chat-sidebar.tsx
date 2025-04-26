"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon, MenuIcon } from "lucide-react";

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (id: string | null) => void;
}

export function ChatSidebar({
  selectedChatId,
  onSelectChat,
}: ChatSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const chats = useQuery(api.chats.list) ?? [];

  return (
    <div
      className={cn(
        "transition-all border-r bg-sidebar flex flex-col",
        collapsed ? "w-0 md:w-12" : "w-64"
      )}
    >
      <div className="flex items-center gap-2 p-2 border-b">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCollapsed((c) => !c)}
        >
          <MenuIcon className="size-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        {!collapsed && (
          <>
            <span className="font-semibold text-sm flex-1">Conversații</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onSelectChat(null)}
            >
              <PlusIcon className="size-4" />
              <span className="sr-only">New chat</span>
            </Button>
          </>
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => onSelectChat(chat._id)}
              className={cn(
                "w-full text-left px-4 py-2 hover:bg-accent/50 border-b",
                selectedChatId === chat._id && "bg-accent/70"
              )}
            >
              <div className="font-medium truncate">{chat.title}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(chat.updatedAt ?? chat.createdAt)}
              </div>
            </button>
          ))}
          {!chats.length && (
            <p className="text-xs text-muted-foreground p-4">
              Nu există conversații salvate.
            </p>
          )}
        </div>
      )}
    </div>
  );
}