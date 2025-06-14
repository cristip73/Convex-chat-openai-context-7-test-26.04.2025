"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "@/components/model-selector";
import { ModeToggle } from "@/components/mode-toggle";
import { MenuIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  currentModel: string;
  onModelChange: (model: string) => void;
  showModelSelector?: boolean;
  title?: string;
  className?: string;
}

export function UnifiedHeader({
  sidebarCollapsed,
  onToggleSidebar,
  currentModel,
  onModelChange,
  showModelSelector = true,
  title,
  className,
}: UnifiedHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

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

  const handleNewChat = () => {
    router.push('/chat');
  };

  return (
    <header className={cn(
      "h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50",
      className
    )}>
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <MenuIcon className="h-4 w-4" />
            <span className="sr-only">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
          
          {!isMobile && (
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg">CristiGPT</h1>
              {title && <span className="text-muted-foreground">/ {title}</span>}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={handleNewChat}>
            <PlusIcon className="h-4 w-4" />
            <span className="sr-only">New chat</span>
          </Button>
          {showModelSelector && (
            <ModelSelector 
              value={currentModel} 
              onChange={onModelChange}
              className="max-w-[160px]"
            />
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
} 