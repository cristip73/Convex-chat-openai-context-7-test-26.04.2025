import { Metadata } from "next";
import ChatShell from "./chat-shell";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with GPT-4",
};

export default function ChatPage() {
  return <ChatShell />;
} 