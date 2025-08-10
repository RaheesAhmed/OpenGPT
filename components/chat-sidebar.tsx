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
  chats: Chat[];
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  className?: string;
  onSettingsClick?: () => void;
}

export function ChatSidebar({ 
  chats, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat, 
  onRenameChat, 
  className = "", 
  onSettingsClick 
}: ChatSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Sort chats by timestamp (most recent first)
  const sortedChats = [...chats].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (isExpanded) {
    return (
      <div className={`w-72 ${className}`}>
        <Sidebar
          isOpen={isExpanded}
          onToggle={handleToggleSidebar}
          chats={sortedChats}
          onNewChat={onNewChat}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
          onRenameChat={onRenameChat}
          onSettingsClick={onSettingsClick}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <MiniSidebar
        chats={sortedChats}
        onNewChat={onNewChat}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat}
        onRenameChat={onRenameChat}
        onToggle={handleToggleSidebar}
        onSettingsClick={onSettingsClick}
      />
    </div>
  );
}

// Export types for other components to use
export type { Chat };
