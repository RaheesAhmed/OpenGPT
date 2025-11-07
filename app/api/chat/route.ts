import { NextRequest, NextResponse } from "next/server";
import { Agent, run, setDefaultOpenAIKey, webSearchTool } from '@openai/agents';
import { mcpManager, type MCPServerConfig } from '@/lib/mcp-manager';

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
    const { message, files, memoryContext, apiKey, model = "gpt-4o-mini", stream = true, systemPrompt, mcpServersConfig } = await request.json();

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

    // Initialize or get existing MCP servers
    let mcpServers = [];
    if (mcpServersConfig && Array.isArray(mcpServersConfig) && mcpServersConfig.length > 0) {
      mcpServers = await mcpManager.initializeServers(mcpServersConfig as MCPServerConfig[]);
    } else {
      mcpServers = mcpManager.getServers();
    }

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
  
    // Create agent with dynamic instructions and MCP servers
    const agent = new Agent<UserContext>({
      name: 'OpenGPT',
      instructions,
      model: model,
      tools: [webSearchTool()],
      mcpServers: mcpServers.length > 0 ? mcpServers : undefined,
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
            let textContent = '';
            
            // Listen to all events for tool calls
            for await (const event of streamResult) {
              if (event.type === 'run_item_stream_event') {
                const eventName = (event as any).name;
                const item = (event as any).item;
                
                // Handle tool calls
                if (eventName === 'tool_called' && item?.type === 'tool_call_item') {
                  const rawItem = item.rawItem;
                  
                  // Extract query for web search or MCP tool args
                  let toolArgs = '{}';
                  let toolResult = 'Tool executed successfully';
                  
                  if (rawItem?.type === 'web_search_call' && rawItem?.action) {
                    toolArgs = JSON.stringify(rawItem.action);
                    toolResult = `Web search performed for: "${rawItem.action.query}"\n\nResults are integrated into the response below.`;
                  } else if (rawItem?.type === 'hosted_tool_call' && rawItem?.providerData?.action) {
                    toolArgs = JSON.stringify(rawItem.providerData.action);
                    toolResult = `Search query: "${rawItem.providerData.action.query}"\n\nResults integrated into response.`;
                  } else if (rawItem?.providerData) {
                    toolArgs = JSON.stringify(rawItem.providerData);
                  }
                  
                  // For MCP tools, try to get output
                  if (rawItem?.output) {
                    toolResult = rawItem.output;
                  }
                  
                  const toolData = JSON.stringify({
                    type: 'tool_call_done',
                    tool_name: rawItem?.name || rawItem?.type || 'unknown',
                    tool_call_id: rawItem?.id || Date.now().toString(),
                    arguments: toolArgs,
                    result: toolResult,
                    status: rawItem?.status || 'completed'
                  });
                  controller.enqueue(encoder.encode(`data: ${toolData}\n\n`));
                }
                
                // Handle message output - stream immediately
                if (eventName === 'message_output_created' && item?.type === 'message_output_item') {
                  const content = item.rawItem?.content;
                  if (content && Array.isArray(content)) {
                    for (const contentItem of content) {
                      if (contentItem.type === 'output_text' && contentItem.text) {
                        textContent = contentItem.text;
                        
                        // Extract URLs from annotations if available
                        if (contentItem.annotations && Array.isArray(contentItem.annotations)) {
                          const urls = contentItem.annotations
                            .filter((ann: any) => ann.type === 'url_citation')
                            .map((ann: any) => ({
                              url: ann.url,
                              title: ann.title
                            }));
                          
                          if (urls.length > 0) {
                            const urlsData = JSON.stringify({
                              type: 'tool_urls',
                              urls: urls
                            });
                            controller.enqueue(encoder.encode(`data: ${urlsData}\n\n`));
                          }
                        }
                        
                        // Send text content
                        const data = JSON.stringify({
                          type: 'content',
                          content: textContent
                        });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                      }
                    }
                  }
                }
              }
            }
            
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
            // Don't close MCP servers - they're managed by mcpManager
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
