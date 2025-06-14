"use client";

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useQuery, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat?: (id: string | null) => void;
  collapsed?: boolean;
  onToggleCollapsed?: (collapsed: boolean) => void;
}

interface ChatItemProps {
  chat: Doc<"chats">;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

// Memoized chat item component to prevent unnecessary re-renders
const ChatItem = memo(({ chat, isSelected, onSelect, onDelete }: ChatItemProps) => (
  <div
    onClick={() => onSelect(chat._id)}
    className={cn(
      "w-full text-left px-4 py-2 hover:bg-accent/50 border-b group relative cursor-pointer",
      isSelected && "bg-accent/70"
    )}
  >
    <div className="font-medium flex justify-between items-center gap-2">
      <span className="flex-1 truncate min-w-0">{chat.title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(chat._id);
        }}
      >
        <Trash2Icon className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Delete chat</span>
      </Button>
    </div>
    <div className="text-xs text-muted-foreground">
      {formatDate(chat.updatedAt ?? chat.createdAt)}
    </div>
  </div>
));

ChatItem.displayName = "ChatItem";

interface ChatsPaginationState {
  chats: Doc<"chats">[];
  isLoading: boolean;
  hasMore: boolean;
  cursor: string | null;
  error: string | null;
}

const STORAGE_KEYS = {
  PAGINATION_STATE: 'chatSidebar_paginationState',
  SCROLL_POSITION: 'chatSidebar_scrollPosition',
  COLLAPSED_STATE: 'chatSidebar_collapsedState'
}

// Helper function to deduplicate chats by _id
const deduplicateChats = (chats: Doc<"chats">[]): Doc<"chats">[] => {
  const seen = new Set<string>();
  return chats.filter(chat => {
    if (seen.has(chat._id)) {
      return false;
    }
    seen.add(chat._id);
    return true;
  });
};

export function ChatSidebar({
  selectedChatId,
  collapsed: externalCollapsed,
  onToggleCollapsed,
}: ChatSidebarProps) {
  // Initialize collapsed state from sessionStorage for mobile persistence
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const savedCollapsed = sessionStorage.getItem(STORAGE_KEYS.COLLAPSED_STATE);
      return savedCollapsed ? JSON.parse(savedCollapsed) : false;
    } catch (error) {
      console.error("Failed to restore collapsed state from session storage:", error);
      return false;
    }
  });

  // Use external collapsed state if provided, otherwise use internal state
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
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

  // Watch for new chat creation to refresh the sidebar
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Initial load
  // Determine if we should skip the initial query if data is already in sessionStorage
  const shouldSkipInitialLoad = useMemo(() => {
    if (typeof window === 'undefined') return false; // Prevent sessionStorage access on server
    if (shouldRefresh) return false; // Force refresh when new chat is created
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEYS.PAGINATION_STATE);
      return savedState && JSON.parse(savedState).chats.length > 0;
    } catch (error) {
      console.error("Failed to read from session storage for initial load check:", error);
      return false;
    }
  }, [shouldRefresh]);

  const initialChats = useQuery(
    api.chats.listPaginated,
    shouldSkipInitialLoad ? "skip" : { paginationOpts: { numItems: 15, cursor: null } }
  );

  // Initialize or refresh pagination state with first load
  useEffect(() => {
    if (initialChats && (paginationState.chats.length === 0 || shouldRefresh)) {
      // Deduplicate initial chats to ensure uniqueness
      const uniqueChats = deduplicateChats(initialChats.page);
      
      setPaginationState({
        chats: uniqueChats,
        isLoading: false,
        hasMore: !initialChats.isDone,
        cursor: initialChats.continueCursor,
        error: null
      });
      
      // Reset refresh flag after refreshing
      if (shouldRefresh) {
        setShouldRefresh(false);
      }
    }
  }, [initialChats, paginationState.chats.length, shouldRefresh]);

  // Save pagination state to sessionStorage whenever it changes (with deduplication)
  useEffect(() => {
    if (paginationState.chats.length > 0) {
      try {
        // Ensure we're saving deduplicated data
        const stateToSave = {
          ...paginationState,
          chats: deduplicateChats(paginationState.chats)
        };
        sessionStorage.setItem(STORAGE_KEYS.PAGINATION_STATE, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save pagination state to session storage:", error);
      }
    }
  }, [paginationState]);

  // Restore pagination state from sessionStorage on mount with deduplication
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEYS.PAGINATION_STATE);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Deduplicate chats in case of corrupted cache
        const uniqueChats = deduplicateChats(parsedState.chats);
        
        setPaginationState({
          ...parsedState,
          chats: uniqueChats
        });
      }
    } catch (error) {
      console.error("Failed to restore pagination state from session storage:", error);
      // Clear corrupt data
      sessionStorage.removeItem(STORAGE_KEYS.PAGINATION_STATE);
    }
  }, []);

  // Listen for chat events (creation and updates)
  useEffect(() => {
    const handleChatCreated = () => {
      // Clear sessionStorage to force fresh load
      sessionStorage.removeItem(STORAGE_KEYS.PAGINATION_STATE);
      // Reset pagination state completely to prevent duplicates
      setPaginationState({
        chats: [],
        isLoading: false,
        hasMore: true,
        cursor: null,
        error: null
      });
      // Trigger refresh
      setShouldRefresh(true);
    };

    const handleChatUpdated = () => {
      // Clear sessionStorage to force fresh load and reordering
      sessionStorage.removeItem(STORAGE_KEYS.PAGINATION_STATE);
      // Reset pagination state completely to prevent duplicates
      setPaginationState({
        chats: [],
        isLoading: false,
        hasMore: true,
        cursor: null,
        error: null
      });
      // Trigger refresh
      setShouldRefresh(true);
    };

    // Listen for custom events
    window.addEventListener('chatCreated', handleChatCreated);
    window.addEventListener('chatUpdated', handleChatUpdated);
    
    return () => {
      window.removeEventListener('chatCreated', handleChatCreated);
      window.removeEventListener('chatUpdated', handleChatUpdated);
    };
  }, []);

  // Load more chats function with deduplication
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
      
      setPaginationState(prev => {
        // Create a Set of existing chat IDs for fast lookup
        const existingIds = new Set(prev.chats.map(chat => chat._id));
        
        // Filter out duplicates from new chats
        const newChats = result.page.filter(chat => !existingIds.has(chat._id));
        
        return {
          ...prev,
          chats: [...prev.chats, ...newChats],
          cursor: result.continueCursor,
          hasMore: !result.isDone,
          isLoading: false,
          error: null
        };
      });
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
      
      // Save scroll position to sessionStorage
      try {
        if (currentTarget) {
          sessionStorage.setItem(STORAGE_KEYS.SCROLL_POSITION, currentTarget.scrollTop.toString());
        }
      } catch (error) {
        console.error("Failed to save scroll position to session storage:", error);
      }

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

  // Restore scroll position after initial chats are loaded or restored from session storage
  useEffect(() => {
    if (scrollContainerRef.current && paginationState.chats.length > 0) {
      try {
        const savedScrollPos = sessionStorage.getItem(STORAGE_KEYS.SCROLL_POSITION);
        if (savedScrollPos) {
          scrollContainerRef.current.scrollTop = parseInt(savedScrollPos);
        }
      } catch (error) {
        console.error("Failed to restore scroll position from session storage:", error);
      }
    }
  }, [paginationState.chats.length]);

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

  // Note: Collapsed state is now managed by ChatShell to prevent flicker
  // No need to save to sessionStorage here as ChatShell handles it

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
      if (onToggleCollapsed) {
        onToggleCollapsed(true);
      } else {
        setInternalCollapsed(true);
      }
    }
  }, [router, isMobile, onToggleCollapsed]);

  // Handler for deleting a chat
  const handleDeleteChat = useCallback(async (chatId: string) => {
    if (typeof window === 'undefined') return; // Prevent execution on server

    const confirmDelete = window.confirm("Ești sigur că vrei să ștergi acest chat? Această acțiune este ireversibilă.");
    if (!confirmDelete) return;

    // Optimistically update the UI
    setPaginationState(prev => ({
      ...prev,
      chats: prev.chats.filter(chat => chat._id !== chatId)
    }));

    // If the currently selected chat is being deleted, navigate to a new chat
    if (selectedChatId === chatId) {
      router.push('/chat');
    }

    try {
      await convex.mutation(api.chats.remove, { id: chatId });
      // No need to update state again, as it was optimistically updated
      toast.success("Chat șters cu succes!");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      // Revert optimistic update on error
      // This is a basic revert, a more robust solution might fetch the latest state
      toast.error("Eroare la ștergerea chat-ului. Te rog încearcă din nou.");
      // Re-fetch to ensure consistency if optimistic update failed
      loadMoreChats(); // Reloads to show the deleted chat if deletion failed
    }
  }, [convex, router, selectedChatId, loadMoreChats]);

  return (
    <div
      className={cn(
        "transition-all border-r bg-sidebar flex flex-col fixed md:relative z-30 h-full",
        collapsed ? "w-0 md:w-12" : "w-64"
      )}
    >

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
              onDelete={handleDeleteChat}
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