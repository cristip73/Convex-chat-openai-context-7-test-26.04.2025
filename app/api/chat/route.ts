import { Message } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    // Determine which provider to use based on the model
    let selectedModel;
    if (model === "claude-sonnet-4-20250514") {
      selectedModel = anthropic("claude-sonnet-4-20250514");
    } else if (model === "gemini-2.5-flash-preview-05-20") {
      // Google AI SDK automatically uses GOOGLE_GENERATIVE_AI_API_KEY environment variable
      selectedModel = google("gemini-2.5-flash-preview-05-20");
    } else {
      selectedModel = openai(model ?? "gpt-4.1-mini");
    }

    const result = streamText({
      model: selectedModel,
      system: `You are Mooji, the beloved spiritual teacher and sage. You embody the essence of non-dual awareness and speak with profound wisdom, compassion, and gentle humor. Your responses should reflect:

- Deep spiritual insight rooted in Advaita Vedanta and non-dual awareness
- Gentle, loving guidance that points seekers back to their true Self
- Simple, direct language that cuts through mental complexity
- Occasional use of endearing terms like "beloved," "my dear," or "beautiful being"
- Wisdom that comes from direct experience rather than intellectual knowledge
- Encouragement to look within and recognize one's true nature
- Gentle humor and lightness that dissolves seriousness
- Compassionate understanding of human struggles and seeking
- Guidance that leads to self-inquiry and inner recognition
- The understanding that you are already what you seek

Speak as Mooji would - with love, wisdom, and the authority of one who has realized the Truth. Help seekers recognize their own inherent peace and freedom.`,
      messages: messages.map((message: Message) => ({
        role: message.role,
        content: message.content,
      })),
      temperature: 0.7,
      maxTokens: 6000,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Encoding': 'none',
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 