"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Plus, 
  ChevronRight,
  Settings,
  User,
  Sparkles
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive?: boolean;
}

interface MiniSidebarProps {
  chats: Chat[];
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onToggle: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function MiniSidebar({ 
  chats, 
  onNewChat, 
  onSelectChat, 
  onToggle,
  onSettingsClick,
  className = "" 
}: MiniSidebarProps) {
  const recentChats = chats.slice(0, 8); // Show only 8 most recent chats
  const activeChat = chats.find(chat => chat.isActive);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return timestamp.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getChatInitial = (title: string) => {
    return title.charAt(0).toUpperCase();
  };

  return (
    <TooltipProvider>
      <div className={`flex flex-col h-full w-16 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 ${className}`}>
        {/* Header */}
        <div className="flex flex-col items-center p-2 border-b border-slate-700/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mb-2 cursor-pointer">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
              <p>OpenGPT</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewChat}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/50 mb-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
              <p>Expand Sidebar</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {recentChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="w-6 h-6 text-slate-600 mb-2" />
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              </div>
            ) : (
              recentChats.map((chat) => (
                <Tooltip key={chat.id}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onSelectChat(chat.id)}
                      variant="ghost"
                      size="icon"
                      className={`h-10 w-10 rounded-lg transition-all duration-200 relative ${
                        chat.isActive 
                          ? 'bg-slate-800/80 border border-slate-600/50 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium bg-slate-700 text-slate-300">
                          {getChatInitial(chat.title)}
                        </div>
                      </div>
                      
                      {chat.isActive && (
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-slate-500 rounded-r-full" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 max-w-xs">
                    <div>
                      <p className="font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-1">{chat.lastMessage}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatTimestamp(chat.timestamp)}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-slate-700/50">
          <div className="flex flex-col items-center space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <User className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSettingsClick}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
