import { NextRequest, NextResponse } from "next/server";
import { MCPServerStdio, MCPServerStreamableHttp } from '@openai/agents';

interface MCPServerConfig {
  id: string;
  name: string;
  type: 'stdio' | 'http';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
}

export async function POST(request: NextRequest) {
  let mcpServer: MCPServerStdio | MCPServerStreamableHttp | null = null;
  
  try {
    const { server } = await request.json() as { server: MCPServerConfig };

    if (!server) {
      return NextResponse.json(
        { error: "Server configuration is required" },
        { status: 400 }
      );
    }

    // Initialize and connect to the MCP server
    if (server.type === 'stdio') {
      mcpServer = new MCPServerStdio({
        name: server.name,
        command: server.command || 'npx',
        args: server.args || [],
        env: server.env,
      });
    } else if (server.type === 'http') {
      mcpServer = new MCPServerStreamableHttp({
        name: server.name,
        url: server.url || '',
      });
    } else {
      return NextResponse.json(
        { error: "Invalid server type" },
        { status: 400 }
      );
    }

    // Connect to the server
    await mcpServer.connect();

    // List available tools
    const toolsList = await mcpServer.listTools();
    
    const tools = toolsList.map((tool: any) => ({
      name: tool.name || 'Unknown Tool',
      description: tool.description || 'No description available'
    }));

    return NextResponse.json({
      success: true,
      tools
    });

  } catch (error: any) {
    console.error("MCP Discovery Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to discover tools: " + (error.message || "Unknown error"),
        tools: []
      },
      { status: 500 }
    );
  } finally {
    // Always close the server connection
    if (mcpServer) {
      try {
        await mcpServer.close();
      } catch (error) {
        console.error('Error closing MCP server:', error);
      }
    }
  }
}
