"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Wrench, CheckCircle, Loader2, Search } from "lucide-react";

interface ToolCall {
  id: string;
  name: string;
  arguments?: string;
  result?: string;
  status: 'in_progress' | 'completed';
}

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
}

export function ToolCallDisplay({ toolCalls }: ToolCallDisplayProps) {
  const [expandedCalls, setExpandedCalls] = useState<Set<string>>(new Set());

  if (toolCalls.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedCalls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatToolName = (name: string): string => {
    // Remove "_call" suffix and clean up
    let formatted = name.replace(/_call$/, '');
    // Replace underscores with spaces
    formatted = formatted.replace(/_/g, ' ');
    // Capitalize first letter of each word
    return formatted.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getToolIcon = (name: string) => {
    if (name.includes('search') || name.includes('web')) {
      return <Search className="w-3 h-3 text-blue-400 flex-shrink-0" />;
    }
    return <Wrench className="w-3 h-3 text-blue-400 flex-shrink-0" />;
  };

  return (
    <div className="my-2 space-y-1">
      {toolCalls.map((call) => {
        const isExpanded = expandedCalls.has(call.id);
        
        return (
          <div 
            key={call.id}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(call.id)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2a2a] transition-colors text-left"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-[#a1a1aa] flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#a1a1aa] flex-shrink-0" />
              )}
              
              {getToolIcon(call.name)}
              
              <span className="text-xs font-medium text-white flex-1">
                {formatToolName(call.name)}
              </span>
              
              {call.status === 'in_progress' ? (
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin flex-shrink-0" />
              ) : (
                <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
              )}
            </button>
            
            {isExpanded && call.status === 'completed' && (
              <div className="px-3 pb-3 space-y-2 text-xs">
                {call.arguments && (
                  <div>
                    <p className="text-[#6b7280] mb-1">Arguments:</p>
                    <pre className="bg-[#0a0a0a] p-2 rounded text-[#a1a1aa] overflow-x-auto">
                      {JSON.stringify(JSON.parse(call.arguments), null, 2)}
                    </pre>
                  </div>
                )}
                
                {call.result && (
                  <div>
                    <p className="text-[#6b7280] mb-1">Result:</p>
                    <div className="bg-[#0a0a0a] p-2 rounded text-[#a1a1aa] max-h-40 overflow-y-auto">
                      {call.result.length > 500 
                        ? call.result.substring(0, 500) + '...' 
                        : call.result}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
