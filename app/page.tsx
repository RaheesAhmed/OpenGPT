"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModelSelector } from "@/components/model-selector";
import { ChatSidebar, type Chat } from "@/components/chat-sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Lightbulb, 
  Code, 
  BookOpen, 
  Zap, 
  Settings,
  ArrowUp,
  Plus,
  Sparkles,
  File,
  X,
  User,
  Bot,
  Loader2,
  Key,
  Save,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Check
} from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SystemPromptModal } from "@/components/system-prompt-modal";
import { ArtifactsPanel } from "@/components/artifacts-panel";
import { chatMemory } from "@/lib/chat-memory";
import { Brain, History } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: Array<{
    name: string;
    type: string;
    size: number;
    content: string;
    id: string;
  }>;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    type: string;
    size: number;
    content: string;
    id: string;
  }>>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentArtifact, setCurrentArtifact] = useState<{
    id: string;
    title: string;
    type: 'code' | 'markdown' | 'html' | 'text' | 'json';
    language?: string;
    content: string;
    filename?: string;
  } | null>(null);
  
  // State for button feedback
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [likedMessageId, setLikedMessageId] = useState<string | null>(null);
  const [dislikedMessageId, setDislikedMessageId] = useState<string | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedChats = localStorage.getItem('openai_chats');
    const savedCurrentChatId = localStorage.getItem('openai_current_chat_id');
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        // Convert timestamp strings back to Date objects
        const chatsWithDates = parsedChats.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        }));
        setChats(chatsWithDates);
      } catch (error) {
        console.error('Error parsing saved chats:', error);
      }
    }
    
    if (savedCurrentChatId) {
      setCurrentChatId(savedCurrentChatId);
      // Load messages for the current chat
      const savedMessages = localStorage.getItem(`openai_chat_messages_${savedCurrentChatId}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } catch (error) {
          console.error('Error parsing saved messages:', error);
        }
      }
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('openai_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Save current chat messages and update memory whenever messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      localStorage.setItem(`openai_chat_messages_${currentChatId}`, JSON.stringify(messages));
      
      // Update chat memory
      chatMemory.updateMemory(currentChatId, messages);
      
      // Update the chat's last message and timestamp
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const lastMessage = messages[messages.length - 1];
          return {
            ...chat,
            lastMessage: lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : ''),
            timestamp: new Date(),
            title: chat.title === 'New Chat' ? generateChatTitle(messages) : chat.title
          };
        }
        return chat;
      }));
    }
  }, [messages, currentChatId]);

  // Save current chat ID whenever it changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('openai_current_chat_id', currentChatId);
    }
  }, [currentChatId]);

  // Auto-scroll to bottom when messages change or when loading
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (messages.length > 0 || isLoading) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoading]);

  // Generate a chat title based on the first user message
  const generateChatTitle = (msgs: Message[]): string => {
    const firstUserMessage = msgs.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 30);
      return title.length < firstUserMessage.content.length ? title + '...' : title;
    }
    return 'New Chat';
  };

  // Save API key to localStorage
  const saveApiKey = (key: string) => {
    if (key.trim()) {
      localStorage.setItem('openai_api_key', key.trim());
      setApiKey(key.trim());
    } else {
      localStorage.removeItem('openai_api_key');
      setApiKey("");
    }
  };

  // Handle settings modal
  const handleOpenSettings = () => {
    setTempApiKey(apiKey);
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    saveApiKey(tempApiKey);
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setTempApiKey(apiKey);
    setShowSettings(false);
  };
  
  const quickActions = [
    
    {
      icon: Code,
      label: "Code",
      description: "Programming help"
    },
    {
      icon: Lightbulb,
      label: "Ideas",
      description: "Creative thinking"
    },
    {
      icon: BookOpen,
      label: "Learn",
      description: "Explain concepts"
    },
    {
      icon: Zap,
      label: "Quick Task",
      description: "Fast assistance"
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          content: content
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
      };
      
      // Handle different file types
      if (file.type.startsWith('text/') || 
          file.name.endsWith('.txt') || 
          file.name.endsWith('.md') || 
          file.name.endsWith('.csv') ||
          file.name.endsWith('.json') ||
          file.name.endsWith('.xml') ||
          file.name.endsWith('.html') ||
          file.name.endsWith('.css') ||
          file.name.endsWith('.js') ||
          file.name.endsWith('.ts') ||
          file.name.endsWith('.py') ||
          file.name.endsWith('.java') ||
          file.name.endsWith('.cpp') ||
          file.name.endsWith('.c') ||
          file.name.endsWith('.php') ||
          file.name.endsWith('.rb') ||
          file.name.endsWith('.go') ||
          file.name.endsWith('.rs')) {
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll read as data URL and handle on server
        reader.readAsDataURL(file);
      } else {
        // For other files, try to read as text first
        reader.readAsText(file);
      }
    });

    // Reset the input
    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Handle new chat creation
  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      title: "New Chat",
      lastMessage: "Start a conversation...",
      timestamp: new Date(),
      isActive: true
    };

    // Save current chat messages if there are any
    if (currentChatId && messages.length > 0) {
      localStorage.setItem(`openai_chat_messages_${currentChatId}`, JSON.stringify(messages));
    }

    // Clear current messages and set new chat
    setMessages([]);
    setCurrentChatId(newChatId);
    
    // Mark all other chats as inactive and add the new one
    setChats(prev => [
      newChat,
      ...prev.map(chat => ({ ...chat, isActive: false }))
    ]);
  };

  // Handle chat selection
  const handleSelectChat = (chatId: string) => {
    if (chatId === currentChatId) return;

    // Save current chat messages
    if (currentChatId && messages.length > 0) {
      localStorage.setItem(`openai_chat_messages_${currentChatId}`, JSON.stringify(messages));
    }

    // Load selected chat messages
    const savedMessages = localStorage.getItem(`openai_chat_messages_${chatId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading chat messages:', error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }

    setCurrentChatId(chatId);
    
    // Update active chat
    setChats(prev => prev.map(chat => ({
      ...chat,
      isActive: chat.id === chatId
    })));
  };

  // Handle chat deletion
  const handleDeleteChat = (chatId: string) => {
    // Remove chat from localStorage
    localStorage.removeItem(`openai_chat_messages_${chatId}`);
    
    const wasActive = chats.find(chat => chat.id === chatId)?.isActive;
    
    setChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      
      // If we deleted the active chat
      if (wasActive) {
        if (filtered.length > 0) {
          // Make the first remaining chat active and load its messages
          filtered[0].isActive = true;
          setCurrentChatId(filtered[0].id);
          
          const savedMessages = localStorage.getItem(`openai_chat_messages_${filtered[0].id}`);
          if (savedMessages) {
            try {
              const parsedMessages = JSON.parse(savedMessages);
              const messagesWithDates = parsedMessages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }));
              setMessages(messagesWithDates);
            } catch (error) {
              console.error('Error loading chat messages:', error);
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
        } else {
          // No chats left
          setCurrentChatId(null);
          setMessages([]);
          localStorage.removeItem('openai_current_chat_id');
        }
      }
      
      return filtered;
    });
  };

  // Handle chat rename
  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && uploadedFiles.length === 0) || isLoading) return;

    if (!apiKey.trim()) {
      alert("Please add your OpenAI API key first");
      return;
    }

    // If no current chat, create one
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        title: "New Chat",
        lastMessage: "Start a conversation...",
        timestamp: new Date(),
        isActive: true
      };

      setCurrentChatId(newChatId);
      setChats(prev => [
        newChat,
        ...prev.map(chat => ({ ...chat, isActive: false }))
      ]);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    // Create assistant message placeholder for streaming
    const assistantMessageId = Date.now().toString() + '_assistant';
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Load memory context and system prompt if available
      const memoryContext = currentChatId ? chatMemory.loadContext(currentChatId) : '';
      const systemPrompt = localStorage.getItem('openai_system_prompt') || '';
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
          memoryContext: memoryContext,
          systemPrompt: systemPrompt,
          apiKey: apiKey.trim(),
          model: selectedModel,
          stream: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '') continue;

                try {
                  const data = JSON.parse(jsonStr);
                  
                  if (data.type === 'content') {
                    accumulatedContent += data.content;
                    
                    // Update the assistant message with streaming content
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    ));
                  } else if (data.type === 'done') {
                    // Streaming finished
                    break;
                  } else if (data.type === 'error') {
                    throw new Error(data.error || 'Streaming error');
                  }
                } catch (parseError) {
                  console.error('Error parsing streaming data:', parseError);
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          throw streamError;
        } finally {
          reader.releaseLock();
        }

        // If no content was streamed, show an error
        if (!accumulatedContent) {
          throw new Error('No response received from the server');
        }
      } else {
        throw new Error('No response body received');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Remove the assistant message placeholder and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== assistantMessageId);
        const errorMessage: Message = {
          id: Date.now().toString() + '_error',
          role: 'assistant',
          content: `Error: ${error.message || 'Something went wrong. Please try again.'}`,
          timestamp: new Date()
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setIsLoading(false);
      setUploadedFiles([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-[#1e1e1e] text-white flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar 
        chats={chats}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        className="h-full flex-shrink-0"
        onSettingsClick={handleOpenSettings}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Main Content */}
        <main className="flex-1 flex flex-col px-6 py-4 max-w-4xl mx-auto w-full min-h-0">
          {/* Messages Area */}
          {messages.length > 0 ? (
            <div className="flex-1 overflow-y-auto mb-6 space-y-4 hide-scrollbar">
              {/* Memory Status Indicator */}
              {currentChatId && (() => {
                const memoryStatus = chatMemory.getMemoryStatus(currentChatId);
                return memoryStatus.hasMemory && (
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200 text-xs">
                      <Brain className="w-3 h-3" />
                      <span>Memory active • {memoryStatus.messageCount} messages remembered</span>
                    </div>
                  </div>
                );
              })()}
              {messages.map((msg) => (
                <div key={msg.id} className="group">
                  <div className="flex gap-4 max-w-none">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a]">
                      {msg.role === 'user' ? (
                        <User className="w-3.5 h-3.5 text-[#a1a1aa]" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#a1a1aa]" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm text-[#e5e7eb] leading-relaxed">
                        {msg.role === 'assistant' ? (
                          msg.content ? (
                            <MarkdownRenderer 
                              content={msg.content}
                              onOpenArtifact={setCurrentArtifact}
                            />
                          ) : (
                            <div className="flex items-center text-sm text-[#a1a1aa]">
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-[#a1a1aa] rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                <div className="w-1 h-1 bg-[#a1a1aa] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1 h-1 bg-[#a1a1aa] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        )}
                      </div>
                      {msg.files && msg.files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {msg.files.map((file) => (
                            <div key={file.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-xs text-[#a1a1aa]">
                              <File className="w-3 h-3" />
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Action buttons for assistant messages */}
                      {msg.role === 'assistant' && msg.content && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-lg transition-colors ${
                              copiedMessageId === msg.id 
                                ? 'text-green-400 bg-green-400/10' 
                                : 'text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]'
                            }`}
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(msg.content);
                                setCopiedMessageId(msg.id);
                                setTimeout(() => setCopiedMessageId(null), 2000);
                              } catch (error) {
                                console.error('Failed to copy message:', error);
                              }
                            }}
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-lg transition-colors ${
                              likedMessageId === msg.id 
                                ? 'text-green-400 bg-green-400/10' 
                                : 'text-[#a1a1aa] hover:text-green-400 hover:bg-[#2a2a2a]'
                            }`}
                            onClick={() => {
                              if (likedMessageId === msg.id) {
                                setLikedMessageId(null); // Unlike
                              } else {
                                setLikedMessageId(msg.id);
                                setDislikedMessageId(null); // Remove dislike if present
                              }
                            }}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-lg transition-colors ${
                              dislikedMessageId === msg.id 
                                ? 'text-red-400 bg-red-400/10' 
                                : 'text-[#a1a1aa] hover:text-red-400 hover:bg-[#2a2a2a]'
                            }`}
                            onClick={() => {
                              if (dislikedMessageId === msg.id) {
                                setDislikedMessageId(null); // Remove dislike
                              } else {
                                setDislikedMessageId(msg.id);
                                setLikedMessageId(null); // Remove like if present
                              }
                            }}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="text-xs text-[#6b7280] opacity-0 group-hover:opacity-100 transition-opacity">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Auto-scroll target */}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Welcome Section */
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center mb-16">
                <h1 className="text-3xl font-medium text-white mb-3">
                  OpenGPT
                </h1>
                <p className="text-[#a1a1aa] text-sm">
                  How can I help you today?
                </p>
              </div>

              {/* Chat Input Section - Centered on welcome */}
              <div className="w-full max-w-3xl mb-8">
                {/* Uploaded Files Display */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 text-sm"
                      >
                        <File className="w-3 h-3" />
                        <span className="truncate max-w-32">{file.name}</span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl">
                  <div className="flex items-center p-4 gap-3">
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a] rounded-lg h-9 w-9 flex-shrink-0"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".txt,.pdf,.csv,.md,.json,.xml,.html,.css,.js,.ts,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <textarea
                        placeholder="Message OpenGPT..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={1}
                        className="w-full bg-transparent text-white placeholder-[#6b7280] text-sm border-none outline-none resize-none focus:text-white min-h-[1.25rem] max-h-32 overflow-y-auto"
                        style={{ 
                          color: 'white',
                          height: 'auto',
                          minHeight: '1.25rem'
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ModelSelector 
                        apiKey={apiKey || undefined}
                        selectedModel={selectedModel}
                        onModelSelect={setSelectedModel}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() && uploadedFiles.length === 0}
                        size="icon"
                        className="bg-white hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg h-8 w-8 text-black"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] text-[#a1a1aa] hover:text-white transition-colors h-auto px-4 py-3 flex items-center gap-2 text-sm"
                    onClick={() => setMessage(`Help me with ${action.label.toLowerCase()}: `)}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* API Key Status */}
              <div className="text-center">
                {!apiKey ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-amber-200 text-sm">
                      No API key configured • 
                      <button 
                        className="text-amber-400 hover:underline ml-1"
                        onClick={() => {
                          const key = prompt("Enter your OpenAI API Key:");
                          if (key && key.trim()) {
                            setApiKey(key.trim());
                          }
                        }}
                      >
                        Add your OpenAI API key
                      </button>
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-200 text-sm">
                      API key configured • 
                      <button 
                        className="text-green-400 hover:underline ml-1"
                        onClick={() => setApiKey("")}
                      >
                        Remove
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Input Section - Only at bottom when there are messages */}
          {messages.length > 0 && (
            <div className="w-full max-w-3xl mx-auto">
              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 text-sm"
                    >
                      <File className="w-3 h-3" />
                      <span className="truncate max-w-32">{file.name}</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl">
                <div className="flex items-center p-4 gap-3">
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a] rounded-lg h-9 w-9 flex-shrink-0"
                      onClick={() => document.getElementById('file-upload-chat')?.click()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <input
                      id="file-upload-chat"
                      type="file"
                      multiple
                      accept=".txt,.pdf,.csv,.md,.json,.xml,.html,.css,.js,.ts,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <textarea
                      placeholder="Message OpenGPT..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows={1}
                      className="w-full bg-transparent text-white placeholder-[#6b7280] text-sm border-none outline-none resize-none focus:text-white min-h-[1.25rem] max-h-32 overflow-y-auto"
                      style={{ 
                        color: 'white',
                        height: 'auto',
                        minHeight: '1.25rem'
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ModelSelector 
                      apiKey={apiKey || undefined}
                      selectedModel={selectedModel}
                      onModelSelect={setSelectedModel}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() && uploadedFiles.length === 0}
                      size="icon"
                      className="bg-white hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg h-8 w-8 text-black"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="px-6 py-2 text-center">
          <p className="text-slate-600 text-xs">
            OpenGPT is an open-source project. Your API key stays secure on your device.
          </p>
        </footer>
      </div>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#1a1a1a] border border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              Settings
            </DialogTitle>
            <DialogDescription className="text-[#a1a1aa]">
              Configure your OpenAI API key. It will be stored securely in your browser's local storage.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">OpenAI API Key</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="bg-[#2a2a2a] border border-[#3a3a3a] text-white placeholder-[#6b7280] focus:ring-1 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
              />
              <p className="text-xs text-[#6b7280]"> 
                Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" className="text-[#a1a1aa] hover:underline">OpenAI Platform</a>.
              </p>
            </div>

            {/* System Prompt Section */}
            <div className="space-y-2 pt-4 border-t border-[#2a2a2a]">
              <label className="text-sm font-medium text-white">System Prompt</label>
              <p className="text-xs text-[#6b7280] mb-3">
                Customize how the AI assistant behaves by setting a system prompt.
              </p>
              <Button
                onClick={() => setShowSystemPrompt(true)}
                variant="outline"
                className="w-full border-[#2a2a2a] text-[#a1a1aa] hover:bg-[#2a2a2a] hover:text-white justify-start gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Configure System Prompt
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelSettings} className="border-[#2a2a2a] text-[#a1a1aa] hover:bg-[#2a2a2a] hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="bg-white hover:bg-gray-200 text-black">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* System Prompt Modal */}
      <SystemPromptModal
        isOpen={showSystemPrompt}
        onClose={() => setShowSystemPrompt(false)}
      />

      {/* Artifacts Panel */}
      {currentArtifact && (
        <ArtifactsPanel
          artifact={currentArtifact}
          onClose={() => setCurrentArtifact(null)}
        />
      )}
    </div>
  );
}
