"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function ChatInput({ onSend, onStop, isLoading, isStreaming, inputRef }: ChatInputProps) {
  const [input, setInput] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) {
      onStop();
    } else if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
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
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        disabled={isLoading && !isStreaming}
        className="flex-1"
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