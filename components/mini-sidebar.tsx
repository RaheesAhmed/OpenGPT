"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteChatModal } from "@/components/delete-chat-modal";
import { 
  MessageSquare, 
  Plus, 
  ChevronRight,
  Settings,
  User,
  Sparkles,
  Edit3,
  Trash2,
  MoreHorizontal
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
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onToggle: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function MiniSidebar({ 
  chats, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  onRenameChat,
  onToggle,
  onSettingsClick,
  className = "" 
}: MiniSidebarProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  const recentChats = chats.slice(0, 8); // Show only 8 most recent chats
  const activeChat = chats.find(chat => chat.isActive);

  const handleDeleteClick = (chat: Chat) => {
    setChatToDelete(chat);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete.id);
      setChatToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

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
      <div className={`flex flex-col h-full w-16 bg-[#1a1a1a] border-r border-[#2a2a2a] ${className}`}>
        {/* Header */}
        <div className="flex flex-col items-center p-2 border-b border-slate-700/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-8 h-8 bg-[#2a2a2a] rounded-lg flex items-center justify-center mb-2 cursor-pointer">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1a] text-white border-[#2a2a2a]">
              <p>OpenGPT</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewChat}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a] mb-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1a] text-white border-[#2a2a2a]">
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1a] text-white border-[#2a2a2a]">
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
                          ? 'bg-[#2a2a2a] border border-[#3a3a3a] text-white' 
                          : 'text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium bg-[#2a2a2a] text-[#a1a1aa]">
                          {getChatInitial(chat.title)}
                        </div>
                      </div>
                      
                      {chat.isActive && (
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-slate-500 rounded-r-full" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#1a1a1a] text-white border-[#2a2a2a] max-w-xs">
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium truncate">{chat.title}</p>
                        <p className="text-xs text-[#a1a1aa] truncate mt-1">{chat.lastMessage}</p>
                        <p className="text-xs text-[#6b7280] mt-1">{formatTimestamp(chat.timestamp)}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-[#2a2a2a]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTitle = prompt("Rename chat:", chat.title);
                            if (newTitle && newTitle.trim()) {
                              onRenameChat(chat.id, newTitle.trim());
                            }
                          }}
                          className="h-6 w-6 p-0 text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(chat);
                          }}
                          className="h-6 w-6 p-0 text-[#a1a1aa] hover:text-red-400 hover:bg-[#2a2a2a]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
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
                  className="h-8 w-8 text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]"
                >
                  <User className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1a1a1a] text-white border-[#2a2a2a]">
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSettingsClick}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1a1a1a] text-white border-[#2a2a2a]">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && chatToDelete && (
          <DeleteChatModal
            isOpen={showDeleteModal}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            chatTitle={chatToDelete.title}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
