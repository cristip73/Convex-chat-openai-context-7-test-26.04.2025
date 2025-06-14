import { Metadata } from "next";
import ChatShell from "../chat-shell";

export const metadata: Metadata = {
  title: "Chat with Mooji",
  description: "Spiritual guidance and wisdom from Mooji",
};

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;
  return <ChatShell chatId={chatId} />;
} 