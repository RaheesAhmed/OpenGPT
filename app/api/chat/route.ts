import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Helper function to create a streaming response
function createStreamingResponse(stream: ReadableStream) {
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { message, files, memoryContext, apiKey, model = "gpt-4o-mini", stream = true } = await request.json();

    // Validate required fields
    if (!message && (!files || files.length === 0)) {
      return NextResponse.json(
        { error: "Message or files are required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Initialize OpenAI with user's API key
    const openai = new OpenAI({ apiKey });

    // Build messages array for chat completions API (more standard approach)
    const messages: any[] = [];

    // Add memory context as system message if available
    if (memoryContext && memoryContext.trim()) {
      messages.push({
        role: "system",
        content: `${memoryContext.trim()}`
      });
    }

    // Build content array for the current message
    const content: any[] = [];

    // Add text message if provided
    if (message && message.trim()) {
      content.push({
        type: "text",
        text: message.trim()
      });
    }

    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file: any) => {
        if (file.type?.startsWith('image/')) {
          // Handle image files
          content.push({
            type: "image_url",
            image_url: {
              url: file.content, // Base64 data URL
              detail: "auto"
            }
          });
        } else {
          // Handle text files by adding their content as text
          content.push({
            type: "text",
            text: `File: ${file.name}\n\n${file.content}`
          });
        }
      });
    }

    messages.push({
      role: "user",
      content: content.length === 1 && content[0].type === "text" ? content[0].text : content
    });

    if (stream) {
      // Create streaming response
      const streamResponse = await openai.chat.completions.create({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
      });

      // Create a ReadableStream to handle the streaming response
      const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          try {
            for await (const chunk of streamResponse) {
              const delta = chunk.choices[0]?.delta?.content || '';
              
              if (delta) {
                // Send the text chunk as server-sent event
                const data = JSON.stringify({
                  type: 'content',
                  content: delta
                });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
              
              // Check if streaming is finished
              if (chunk.choices[0]?.finish_reason) {
                const finishData = JSON.stringify({
                  type: 'done',
                  finish_reason: chunk.choices[0].finish_reason
                });
                controller.enqueue(encoder.encode(`data: ${finishData}\n\n`));
                break;
              }
            }
          } catch (error) {
            console.error('Streaming error:', error);
            const errorData = JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          } finally {
            controller.close();
          }
        },
      });

      return createStreamingResponse(readableStream);
    } else {
      // Non-streaming response (fallback)
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      });

      const messageText = response.choices[0]?.message?.content || "No response received";

      return NextResponse.json({
        success: true,
        message: messageText,
        usage: response.usage
      });
    }

  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    } else if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    } else if (error?.status === 400) {
      return NextResponse.json(
        { error: "Bad request: " + (error.message || "Invalid request format") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
