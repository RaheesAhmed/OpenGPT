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

class MCPServerManager {
  private servers: Map<string, MCPServerStdio | MCPServerStreamableHttp> = new Map();
  private isInitialized: boolean = false;

  async initializeServers(configs: MCPServerConfig[]) {
    // Only initialize if not already done or if configs changed
    const configKey = JSON.stringify(configs);
    const currentConfigKey = this.getCurrentConfigKey();

    if (this.isInitialized && configKey === currentConfigKey) {
      console.log('MCP servers already initialized with same config');
      return Array.from(this.servers.values());
    }

    // Close existing servers if config changed
    if (this.isInitialized) {
      await this.closeAllServers();
    }

    // Initialize new servers
    for (const config of configs) {
      try {
        let server: MCPServerStdio | MCPServerStreamableHttp;

        if (config.type === 'stdio') {
          server = new MCPServerStdio({
            name: config.name,
            command: config.command || 'npx',
            args: config.args || [],
            env: config.env,
          });
        } else {
          server = new MCPServerStreamableHttp({
            name: config.name,
            url: config.url || '',
          });
        }

        await server.connect();
        this.servers.set(config.id, server);
        console.log(`✓ Connected to MCP server: ${config.name}`);
      } catch (error) {
        console.error(`Failed to connect MCP server ${config.name}:`, error);
      }
    }

    this.isInitialized = true;
    this.saveCurrentConfigKey(configKey);
    return Array.from(this.servers.values());
  }

  getServers() {
    return Array.from(this.servers.values());
  }

  async closeAllServers() {
    console.log('Closing all MCP servers...');
    for (const [id, server] of this.servers.entries()) {
      try {
        await server.close();
        console.log(`✓ Closed MCP server: ${id}`);
      } catch (error) {
        console.error(`Error closing MCP server ${id}:`, error);
      }
    }
    this.servers.clear();
    this.isInitialized = false;
  }

  private getCurrentConfigKey(): string {
    if (typeof globalThis !== 'undefined') {
      return (globalThis as any).__mcpConfigKey || '';
    }
    return '';
  }

  private saveCurrentConfigKey(key: string) {
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__mcpConfigKey = key;
    }
  }

  async updateServers(configs: MCPServerConfig[]) {
    await this.initializeServers(configs);
  }
}

// Create singleton instance
const mcpManager = new MCPServerManager();

export { mcpManager };
export type { MCPServerConfig };
