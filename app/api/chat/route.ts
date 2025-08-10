import { NextRequest, NextResponse } from "next/server";
import { Agent, run, setDefaultOpenAIKey,webSearchTool } from '@openai/agents';

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

interface UserContext {
  apiKey: string;
  systemPrompt?: string;
  memoryContext?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, files, memoryContext, apiKey, model = "gpt-4o-mini", stream = true, systemPrompt } = await request.json();

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

    // Set OpenAI API key for the SDK
    setDefaultOpenAIKey(apiKey);

    // Build instructions dynamically
    let instructions = systemPrompt;
    
    if (memoryContext) {
      instructions += `\n\nConversation context: ${memoryContext}`;
    }

    // Handle files in the message
    let messageContent = message;
    if (files && files.length > 0) {
      const fileContents = files.map((file: any) => {
        if (file.type?.startsWith('image/')) {
          return `[Image: ${file.name}]`;
        } else {
          return `File: ${file.name}\n\n${file.content}`;
        }
      }).join('\n\n');
      
      messageContent = fileContents + '\n\n' + message;
    }

    // Create agent with dynamic instructions
    const agent = new Agent<UserContext>({
      name: 'OpenGPT',
      instructions,
      model: model,
      tools: [webSearchTool()]
    });

    // Prepare context
    const context: UserContext = {
      apiKey,
      systemPrompt,
      memoryContext,
    };

    if (stream) {
      // Stream the agent response
      const streamResult = await run(agent, messageContent, { 
        context,
        stream: true 
      });

      // Create a ReadableStream to handle the streaming response
      const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          try {
            // Stream text output
            const textStream = streamResult.toTextStream({ 
              compatibleWithNodeStreams: false 
            });
            
            for await (const chunk of textStream) {
              const data = JSON.stringify({
                type: 'content',
                content: chunk
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            
            // Wait for completion
            await streamResult.completed;
            
            // Send completion signal
            const finishData = JSON.stringify({
              type: 'done',
              finish_reason: 'stop'
            });
            controller.enqueue(encoder.encode(`data: ${finishData}\n\n`));
            
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
      // Non-streaming response
      const result = await run(agent, messageContent, { context });

      return NextResponse.json({
        success: true,
        message: result.finalOutput,
      });
    }

  } catch (error: any) {
    console.error("Agents API Error:", error);
    
    // Handle specific errors
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
