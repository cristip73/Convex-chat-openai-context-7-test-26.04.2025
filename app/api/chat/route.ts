import { Message } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    const result = streamText({
      model: openai("gpt-4.1-mini"),
      messages: messages.map((message: Message) => ({
        role: message.role,
        content: message.content,
      })),
      temperature: 0.7,
      maxTokens: 1000,
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