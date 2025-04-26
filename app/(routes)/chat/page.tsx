import { Chat } from "./chat";

export const metadata = {
  title: "Chat",
  description: "Chat with GPT-4",
};

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <Chat />
    </div>
  );
} 