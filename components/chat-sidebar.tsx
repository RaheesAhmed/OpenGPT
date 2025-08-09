"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MiniSidebar } from "./mini-sidebar";

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive?: boolean;
}

interface ChatSidebarProps {
  initialChats?: Chat[];
  className?: string;
  onSettingsClick?: () => void;
}

export function ChatSidebar({ initialChats = [], className = "", onSettingsClick }: ChatSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chats, setChats] = useState<Chat[]>(initialChats);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      lastMessage: "Start a conversation...",
      timestamp: new Date(),
      isActive: true
    };

    // Mark all other chats as inactive
    setChats(prev => [
      newChat,
      ...prev.map(chat => ({ ...chat, isActive: false }))
    ]);
  };

  const handleSelectChat = (chatId: string) => {
    setChats(prev => prev.map(chat => ({
      ...chat,
      isActive: chat.id === chatId
    })));
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      
      // If we deleted the active chat and there are remaining chats, make the first one active
      if (prev.find(chat => chat.id === chatId)?.isActive && filtered.length > 0) {
        filtered[0].isActive = true;
      }
      
      return filtered;
    });
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const handleToggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Sort chats by timestamp (most recent first)
  const sortedChats = [...chats].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (isExpanded) {
    return (
      <div className={`w-80 ${className}`}>
        <Sidebar
          isOpen={isExpanded}
          onToggle={handleToggleSidebar}
          chats={sortedChats}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          onSettingsClick={onSettingsClick}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <MiniSidebar
        chats={sortedChats}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onToggle={handleToggleSidebar}
        onSettingsClick={onSettingsClick}
      />
    </div>
  );
}

// Export types for other components to use
export type { Chat };
