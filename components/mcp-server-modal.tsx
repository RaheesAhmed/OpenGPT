"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Server,
  Plus,
  Trash2,
  Info,
  Link as LinkIcon,
  Terminal,
  Wrench,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MCPServer {
  id: string;
  name: string;
  type: 'stdio' | 'http';
  command?: string;      // For stdio (e.g., "npx")
  args?: string[];       // For stdio (e.g., ["-y", "canvas-mcp"])
  env?: Record<string, string>;  // Environment variables
  url?: string;          // For http
  tools?: Array<{
    name: string;
    description: string;
  }>;
}

interface MCPServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MCPServerModal({ isOpen, onClose }: MCPServerModalProps) {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [serverType, setServerType] = useState<'stdio' | 'http'>('stdio');
  const [serverName, setServerName] = useState("");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([]);
  const [serverUrl, setServerUrl] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Load servers from localStorage on mount
  useEffect(() => {
    const savedServers = localStorage.getItem('mcp_servers');
    if (savedServers) {
      try {
        const parsedServers = JSON.parse(savedServers);
        setServers(parsedServers);
      } catch (error) {
        console.error('Error parsing saved servers:', error);
      }
    }
  }, []);

  // Save servers to localStorage whenever they change
  useEffect(() => {
    if (servers.length >= 0) {
      localStorage.setItem('mcp_servers', JSON.stringify(servers));
    }
  }, [servers]);

  const handleAddServer = async () => {
    if (!serverName.trim()) {
      alert("Please enter a server name");
      return;
    }

    if (serverType === 'stdio' && !command.trim()) {
      alert("Please enter a command for stdio server");
      return;
    }

    if (serverType === 'http' && !serverUrl.trim()) {
      alert("Please enter a URL for HTTP server");
      return;
    }

    setIsDiscovering(true);

    const envObject: Record<string, string> = {};
    envVars.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        envObject[key.trim()] = value.trim();
      }
    });

    const newServer: MCPServer = {
      id: Date.now().toString(),
      name: serverName.trim(),
      type: serverType,
      ...(serverType === 'stdio' 
        ? { 
            command: command.trim(),
            args: args.trim() ? args.trim().split(',').map(arg => arg.trim()) : [],
            env: Object.keys(envObject).length > 0 ? envObject : undefined
          } 
        : { url: serverUrl.trim() }),
      tools: []
    };

    // Discover tools by connecting to the server
    try {
      const response = await fetch('/api/mcp/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ server: newServer }),
      });

      if (response.ok) {
        const data = await response.json();
        newServer.tools = data.tools || [];
      } else {
        console.error('Failed to discover tools');
        alert('Warning: Could not discover tools from server. Server added but tools will be discovered at runtime.');
      }
    } catch (error) {
      console.error('Failed to discover tools:', error);
      alert('Warning: Could not connect to server. Server added but tools will be discovered at runtime.');
    } finally {
      setIsDiscovering(false);
    }

    setServers(prev => [...prev, newServer]);
    
    // Reset form
    setServerName("");
    setCommand("");
    setArgs("");
    setEnvVars([]);
    setServerUrl("");
    setServerType('stdio');
  };

  const handleAddEnvVar = () => {
    setEnvVars(prev => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveEnvVar = (index: number) => {
    setEnvVars(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnvVarChange = (index: number, field: 'key' | 'value', value: string) => {
    setEnvVars(prev => prev.map((env, i) => 
      i === index ? { ...env, [field]: value } : env
    ));
  };

  const handleRemoveServer = async (serverId: string) => {
    setServers(prev => prev.filter(server => server.id !== serverId));
    
    // Update the server manager to close connections
    try {
      const updatedServers = servers.filter(s => s.id !== serverId);
      await fetch('/api/mcp/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'update',
          servers: updatedServers 
        }),
      });
    } catch (error) {
      console.error('Failed to update MCP manager:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border border-[#2a2a2a] max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5" />
            MCP Server Configuration
          </DialogTitle>
          <DialogDescription className="text-[#a1a1aa]">
            Add and manage Model Context Protocol (MCP) servers to extend your agent's capabilities with external tools and resources.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Add Server Form */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Server
            </h3>

            {/* Server Type Selection */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Server Type</Label>
              <Select value={serverType} onValueChange={(value: 'stdio' | 'http') => setServerType(value)}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#3a3a3a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#3a3a3a]">
                  <SelectItem value="stdio" className="text-white hover:bg-[#2a2a2a]">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      <span>Stdio Server</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="http" className="text-white hover:bg-[#2a2a2a]">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      <span>Streamable HTTP Server</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6b7280]">
                {serverType === 'stdio' 
                  ? "Use for local servers accessed via standard input/output (simplest option)"
                  : "Use for local or remote servers that implement Streamable HTTP transport"}
              </p>
            </div>

            {/* Server Name */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Server Name</Label>
              <Input
                type="text"
                placeholder="e.g., canvas-mcp"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#6b7280]"
              />
            </div>

            {/* Conditional Fields Based on Type */}
            {serverType === 'stdio' ? (
              <>
                <div className="space-y-2">
                  <Label className="text-white text-xs">Command</Label>
                  <Input
                    type="text"
                    placeholder="npx"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    className="bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#6b7280] font-mono text-xs"
                  />
                  <p className="text-xs text-[#6b7280]">
                    The command to execute (e.g., npx, node, python)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs">Arguments</Label>
                  <Input
                    type="text"
                    placeholder="-y, canvas-mcp"
                    value={args}
                    onChange={(e) => setArgs(e.target.value)}
                    className="bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#6b7280] font-mono text-xs"
                  />
                  <p className="text-xs text-[#6b7280]">
                    Comma-separated arguments (e.g., -y, canvas-mcp)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-xs">Environment Variables</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleAddEnvVar}
                      className="h-7 text-xs text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a]"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Variable
                    </Button>
                  </div>
                  {envVars.length > 0 && (
                    <div className="space-y-2">
                      {envVars.map((env, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <Input
                            type="text"
                            placeholder="KEY"
                            value={env.key}
                            onChange={(e) => handleEnvVarChange(index, 'key', e.target.value)}
                            className="bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#6b7280] font-mono text-xs flex-1"
                          />
                          <Input
                            type="text"
                            placeholder="value"
                            value={env.value}
                            onChange={(e) => handleEnvVarChange(index, 'value', e.target.value)}
                            className="bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#6b7280] font-mono text-xs flex-1"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveEnvVar(index)}
                            className="h-9 w-9 text-[#a1a1aa] hover:text-red-400 hover:bg-red-400/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-[#6b7280]">
                    Add environment variables (e.g., CANVAS_API_TOKEN, CANVAS_API_URL)
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label className="text-white text-xs">Server URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com or http://localhost:3000"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#6b7280]"
                />
                <p className="text-xs text-[#6b7280]">
                  The URL where your MCP server is accessible
                </p>
              </div>
            )}

            <Button 
              onClick={handleAddServer}
              disabled={isDiscovering}
              className="w-full bg-white hover:bg-gray-200 text-black disabled:opacity-50"
            >
              {isDiscovering ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Discovering Tools...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Server
                </>
              )}
            </Button>
          </div>

          {/* Added Servers List */}
          {servers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Server className="w-4 h-4" />
                Configured Servers ({servers.length})
              </h4>
              <Accordion type="single" collapsible className="space-y-2">
                {servers.map((server) => (
                  <AccordionItem 
                    key={server.id} 
                    value={server.id}
                    className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 data-[state=open]:pb-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2 flex-1 text-left">
                          {server.type === 'stdio' ? (
                            <Terminal className="w-4 h-4 text-[#a1a1aa]" />
                          ) : (
                            <LinkIcon className="w-4 h-4 text-[#a1a1aa]" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{server.name}</p>
                            <p className="text-xs text-[#6b7280] truncate">
                              {server.type === 'stdio' 
                                ? `${server.command} ${server.args?.join(' ')}` 
                                : server.url}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs border-[#3a3a3a] text-[#a1a1aa]">
                          {server.type}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-3 space-y-3">
                      {/* Server Details */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="text-[#6b7280] min-w-16">Type:</span>
                          <span className="text-white">{server.type === 'stdio' ? 'Standard I/O' : 'Streamable HTTP'}</span>
                        </div>
                        {server.type === 'stdio' && server.command && (
                          <>
                            <div className="flex items-start gap-2">
                              <span className="text-[#6b7280] min-w-16">Command:</span>
                              <code className="text-white bg-[#1a1a1a] px-2 py-1 rounded font-mono text-xs flex-1">
                                {server.command}
                              </code>
                            </div>
                            {server.args && server.args.length > 0 && (
                              <div className="flex items-start gap-2">
                                <span className="text-[#6b7280] min-w-16">Args:</span>
                                <code className="text-white bg-[#1a1a1a] px-2 py-1 rounded font-mono text-xs flex-1">
                                  {server.args.join(', ')}
                                </code>
                              </div>
                            )}
                            {server.env && Object.keys(server.env).length > 0 && (
                              <div className="flex items-start gap-2">
                                <span className="text-[#6b7280] min-w-16">Env:</span>
                                <div className="flex-1 space-y-1">
                                  {Object.entries(server.env).map(([key, value]) => (
                                    <div key={key} className="bg-[#1a1a1a] px-2 py-1 rounded">
                                      <span className="text-green-400 font-mono text-xs">{key}</span>
                                      <span className="text-[#6b7280] mx-1">=</span>
                                      <span className="text-white font-mono text-xs">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        {server.type === 'http' && server.url && (
                          <div className="flex items-start gap-2">
                            <span className="text-[#6b7280] min-w-16">URL:</span>
                            <span className="text-white">{server.url}</span>
                          </div>
                        )}
                      </div>

                      {/* Tools Section */}
                      <div className="pt-2 border-t border-[#3a3a3a]">
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="w-3 h-3 text-[#a1a1aa]" />
                          <span className="text-xs font-medium text-white">Available Tools</span>
                        </div>
                        {server.tools && server.tools.length > 0 ? (
                          <div className="space-y-1.5">
                            {server.tools.map((tool, idx) => (
                              <div key={idx} className="bg-[#1a1a1a] rounded p-2">
                                <p className="text-xs font-medium text-white">{tool.name}</p>
                                <p className="text-xs text-[#6b7280] mt-0.5">{tool.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2">
                            <p className="text-xs text-amber-200">
                              Tools will be discovered when the server connects during agent runtime
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-[#3a3a3a]">
                        <Button
                          onClick={() => handleRemoveServer(server.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 w-full justify-start"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Remove Server
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              About MCP Servers
            </h4>
            <ul className="text-xs text-blue-200/80 space-y-1">
              <li>• <strong>Stdio Servers:</strong> Local servers accessed via command line (simplest option)</li>
              <li>• <strong>HTTP Servers:</strong> Local or remote servers with HTTP transport</li>
              <li>• Tools are discovered automatically when the agent runs</li>
              <li>• Servers extend your agent with specialized capabilities</li>
              <li>• Examples: filesystem access, API integrations, databases, etc.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 flex-shrink-0 pt-4 border-t border-[#2a2a2a]">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-[#2a2a2a] text-[#a1a1aa] hover:bg-[#2a2a2a] hover:text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
