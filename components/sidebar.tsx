"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteChatModal } from "@/components/delete-chat-modal";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Edit3,
  ChevronLeft,
  Settings,
  User,
  Sparkles
} from "lucide-react";

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function Sidebar({ 
  isOpen, 
  onToggle, 
  chats, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat, 
  onRenameChat,
  onSettingsClick,
  className = "" 
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameChat(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

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
    } else if (diffInHours < 168) {
      return timestamp.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return timestamp.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#1a1a1a] border-r border-[#2a2a2a] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-white font-semibold text-lg">OpenGPT</h2>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-[#6b7280] text-sm focus:outline-none focus:ring-1 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-hidden px-2">
        <div className="h-full overflow-y-auto hide-scrollbar">
          <div className="space-y-1 py-2 pr-2">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="w-12 h-12 text-[#6b7280] mb-3" />
                <p className="text-[#a1a1aa] text-sm">No chats yet</p>
                <Button 
                  onClick={onNewChat}
                  variant="ghost" 
                  className="text-[#6b7280] hover:text-[#a1a1aa] text-xs mt-2"
                >
                  Start your first conversation
                </Button>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 overflow-visible ${
                    chat.isActive 
                      ? 'bg-[#2a2a2a] border border-[#3a3a3a]' 
                      : 'hover:bg-[#2a2a2a]'
                  }`}
                  onClick={() => !editingId && onSelectChat(chat.id)}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 min-w-0 pr-2">
                      {editingId === chat.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full bg-[#3a3a3a] text-white text-sm font-medium rounded px-2 py-1 border border-[#4a4a4a] focus:outline-none focus:ring-1 focus:ring-[#4a4a4a]"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-white text-sm font-medium truncate">
                          {chat.title.split(' ').slice(0, 4).join(' ')}
                          {chat.title.split(' ').length > 4 ? '...' : ''}
                        </h3>
                      )}
                      <p className="text-[#a1a1aa] text-xs truncate mt-1">
                        {chat.lastMessage.split(' ').slice(0, 5).join(' ')}
                        {chat.lastMessage.split(' ').length > 5 ? '...' : ''}
                      </p>
                      <div className="mt-2">
                        <span className="text-[#6b7280] text-xs">
                          {formatTimestamp(chat.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action buttons - show on hover */}
                    <div className="flex items-center gap-0.5 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(chat);
                        }}
                        className="h-6 w-6 text-[#a1a1aa] hover:text-white hover:bg-[#3a3a3a] transition-all duration-200"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(chat);
                        }}
                        className="h-6 w-6 text-[#a1a1aa] hover:text-red-400 hover:bg-[#3a3a3a] transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2a2a2a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2a2a2a] rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-[#a1a1aa]" />
            </div>
            <span className="text-[#a1a1aa] text-xs">User</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="h-6 w-6 text-[#a1a1aa] hover:text-white"
          >
            <Settings className="w-3 h-3" />
          </Button>
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
  );
}
