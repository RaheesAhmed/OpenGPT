import { NextRequest, NextResponse } from "next/server";
import { mcpManager } from '@/lib/mcp-manager';

export async function POST(request: NextRequest) {
  try {
    const { action, servers } = await request.json();

    if (action === 'close_all') {
      await mcpManager.closeAllServers();
      return NextResponse.json({
        success: true,
        message: 'All MCP servers closed'
      });
    }

    if (action === 'update') {
      await mcpManager.updateServers(servers || []);
      return NextResponse.json({
        success: true,
        message: 'MCP servers updated'
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("MCP Management Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to manage MCP servers: " + (error.message || "Unknown error")
      },
      { status: 500 }
    );
  }
}
