"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export function ChatInput({ onSend, onStop, isLoading, isStreaming, inputRef }: ChatInputProps) {
  const [input, setInput] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) {
      onStop();
    } else if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // On mobile, Enter should only create new line, not send
      if (isMobile) {
        const textarea = e.target as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = input.substring(0, start) + '\n' + input.substring(end);
        setInput(newValue);
        // Move cursor after the newline
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      } else {
        // Desktop behavior: Enter sends message
        if (isStreaming) {
          onStop();
        } else if (input.trim() && !isLoading) {
          onSend(input);
          setInput("");
        }
      }
    }
  };

  const handleButtonClick = () => {
    if (isStreaming) {
      onStop();
    } else if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <Textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isMobile ? "Type a message..." : "Type a message... (Enter to send, Shift+Enter for new line)"}
        disabled={isLoading && !isStreaming}
        className={`flex-1 min-h-[40px] max-h-[200px] resize-none ${isMobile ? 'text-base' : ''}`}
        rows={1}
      />
      <Button 
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading && !isStreaming && !input.trim()}
        variant={isStreaming ? "destructive" : "default"}
      >
        {isStreaming ? (
          <Square className="h-4 w-4" />
        ) : (
          <SendIcon className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isStreaming ? "Stop streaming" : "Send"}
        </span>
      </Button>
    </form>
  );
} 