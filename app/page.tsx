import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "CristiGPT",
  description: "Chat with All AI Models",
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold">CristiGPT Clone</h1>
        <p className="text-muted-foreground">
          Welcome to the CristiGPT Clone, a showcase project built with Next.js,
          Convex, and Vercel AI SDK.
        </p>
        <Link href="/chat">
          <Button size="lg">Start Chatting</Button>
        </Link>
      </div>
    </div>
  );
}
