"use client";

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useQuery, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon, MenuIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Doc } from "@/convex/_generated/dataModel";

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat?: (id: string | null) => void;
}

interface ChatItemProps {
  chat: Doc<"chats">;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// Memoized chat item component to prevent unnecessary re-renders
const ChatItem = memo(({ chat, isSelected, onSelect }: ChatItemProps) => (
  <button
    onClick={() => onSelect(chat._id)}
    className={cn(
      "w-full text-left px-4 py-2 hover:bg-accent/50 border-b",
      isSelected && "bg-accent/70"
    )}
  >
    <div className="font-medium truncate">{chat.title}</div>
    <div className="text-xs text-muted-foreground">
      {formatDate(chat.updatedAt ?? chat.createdAt)}
    </div>
  </button>
));

ChatItem.displayName = "ChatItem";

interface ChatsPaginationState {
  chats: Doc<"chats">[];
  isLoading: boolean;
  hasMore: boolean;
  cursor: string | null;
  error: string | null;
}

export function ChatSidebar({
  selectedChatId,
}: ChatSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const convex = useConvex();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [paginationState, setPaginationState] = useState<ChatsPaginationState>({
    chats: [],
    isLoading: false,
    hasMore: true,
    cursor: null,
    error: null
  });

  // Initial load
  const initialChats = useQuery(api.chats.listPaginated, {
    paginationOpts: { numItems: 15, cursor: null }
  });

  // Initialize pagination state with first load
  useEffect(() => {
    if (initialChats && paginationState.chats.length === 0) {
      setPaginationState({
        chats: initialChats.page,
        isLoading: false,
        hasMore: !initialChats.isDone,
        cursor: initialChats.continueCursor,
        error: null
      });
    }
  }, [initialChats, paginationState.chats.length]);

  // Load more chats function
  const loadMoreChats = useCallback(async () => {
    if (paginationState.isLoading || !paginationState.hasMore) return;
    
    setPaginationState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await convex.query(api.chats.listPaginated, {
        paginationOpts: { 
          numItems: 15,
          cursor: paginationState.cursor 
        }
      });
      
      setPaginationState(prev => ({
        ...prev,
        chats: [...prev.chats, ...result.page],
        cursor: result.continueCursor,
        hasMore: !result.isDone,
        isLoading: false,
        error: null
      }));
    } catch {
      setPaginationState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load chats'
      }));
    }
  }, [convex, paginationState.cursor, paginationState.isLoading, paginationState.hasMore]);

  // Debounced scroll detection to prevent excessive calls
  const handleScroll = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (e: React.UIEvent<HTMLDivElement>) => {
      clearTimeout(timeoutId);
      // Capture the current target immediately before the timeout
      const currentTarget = e.currentTarget;
      timeoutId = setTimeout(() => {
        // Check if the element still exists
        if (!currentTarget) return;
        
        const { scrollTop, scrollHeight, clientHeight } = currentTarget;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        
        // Trigger load when 90% scrolled
        if (scrollPercentage > 0.9 && !paginationState.isLoading && paginationState.hasMore) {
          loadMoreChats();
        }
      }, 150); // 150ms debounce
    };
  }, [loadMoreChats, paginationState.isLoading, paginationState.hasMore]);

  // Detectează dispozitivul mobil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Memoized handler pentru selecția chat-ului, care colabrează automat bidebaul pe mobil
  const handleChatSelect = useCallback((id: string | null) => {
    if (id) {
      // Navigate to specific chat
      router.push(`/chat/${id}`);
    } else {
      // Navigate to new chat
      router.push('/chat');
    }
    
    if (isMobile) {
      setCollapsed(true);
    }
  }, [router, isMobile]);

  return (
    <div
      className={cn(
        "transition-all border-r bg-sidebar flex flex-col fixed md:relative z-30 h-full",
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
              onClick={() => handleChatSelect(null)}
            >
              <PlusIcon className="size-4" />
              <span className="sr-only">New chat</span>
            </Button>
          </>
        )}
      </div>

      {!collapsed && (
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          {paginationState.chats.map((chat) => (
            <ChatItem
              key={chat._id}
              chat={chat}
              isSelected={selectedChatId === chat._id}
              onSelect={handleChatSelect}
            />
          ))}
          
          {/* Loading indicator */}
          {paginationState.isLoading && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {/* Error state */}
          {paginationState.error && (
            <div className="p-4 text-center">
              <p className="text-xs text-red-500 mb-2">{paginationState.error}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => loadMoreChats()}
                className="h-8 text-xs"
              >
                Încearcă din nou
              </Button>
            </div>
          )}
          
          {/* End of list indicator */}
          {!paginationState.hasMore && paginationState.chats.length > 0 && (
            <div className="text-center p-4 text-xs text-muted-foreground">
              Toate conversațiile au fost încărcate
            </div>
          )}
          
          {/* Empty state */}
          {!paginationState.chats.length && !paginationState.isLoading && (
            <p className="text-xs text-muted-foreground p-4">
              Nu există conversații salvate.
            </p>
          )}
        </div>
      )}
    </div>
  );
}