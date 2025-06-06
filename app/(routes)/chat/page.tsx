import { Metadata } from "next";
import ChatShell from "./chat-shell";

export const metadata: Metadata = {
  title: "Chat with Mooji",
  description: "Spiritual guidance and wisdom from Mooji",
};

export default function ChatPage() {
  return <ChatShell />;
} 