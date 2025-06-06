import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Chat with Mooji",
  description: "Spiritual guidance and wisdom from Mooji",
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold">Chat with Mooji</h1>
        <p className="text-muted-foreground">
          Welcome, beloved seeker. Connect with the wisdom and guidance of Mooji, 
          the renowned spiritual teacher. Ask about self-inquiry, non-dual awareness, 
          and your journey to recognizing your true Self.
        </p>
        <Link href="/chat">
          <Button size="lg">Begin Your Inquiry</Button>
        </Link>
      </div>
    </div>
  );
}
