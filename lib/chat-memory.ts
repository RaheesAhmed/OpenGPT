interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationChunk {
  id: string;
  startMessageId: string;
  endMessageId: string;
  summary: string;
  topics: string[];
  tokenCount: number;
  timestamp: Date;
}

interface ImportantMessage {
  messageId: string;
  content: string;
  reason: 'user_info' | 'decision' | 'important_fact' | 'instruction';
  timestamp: Date;
}

interface ChatMemoryData {
  chatId: string;
  historicalSummary: string;
  recentChunks: ConversationChunk[];
  immediateMessages: Message[];
  importantMessages: ImportantMessage[];
  totalMessages: number;
  lastUpdated: Date;
}

export class ChatMemory {
  private readonly CHUNK_SIZE = 15;
  private readonly MAX_RECENT_CHUNKS = 3;
  private readonly MAX_IMMEDIATE_MESSAGES = 8;
  private readonly TOKEN_BUDGET = {
    immediate: 1200,
    chunks: 900,
    historical: 600,
    important: 400
  };

  constructor() {
    // Initialize if needed
  }

  /**
   * Save or update memory for a chat
   */
  updateMemory(chatId: string, messages: Message[]): void {
    try {
      const memory = this.processMessages(chatId, messages);
      this.saveToStorage(chatId, memory);
    } catch (error) {
      console.error('Error updating chat memory:', error);
    }
  }

  /**
   * Load memory context for a chat
   */
  loadContext(chatId: string): string {
    try {
      const memory = this.loadFromStorage(chatId);
      if (!memory) return '';

      return this.buildContextString(memory);
    } catch (error) {
      console.error('Error loading chat context:', error);
      return '';
    }
  }

  /**
   * Get memory status for UI
   */
  getMemoryStatus(chatId: string): { hasMemory: boolean; messageCount: number; lastUpdated?: Date } {
    const memory = this.loadFromStorage(chatId);
    return {
      hasMemory: !!memory,
      messageCount: memory?.totalMessages || 0,
      lastUpdated: memory?.lastUpdated
    };
  }

  /**
   * Clear memory for a specific chat
   */
  clearMemory(chatId: string): void {
    try {
      localStorage.removeItem(`chat_memory_${chatId}`);
    } catch (error) {
      console.error('Error clearing chat memory:', error);
    }
  }

  /**
   * Process messages and create layered memory structure
   */
  private processMessages(chatId: string, messages: Message[]): ChatMemoryData {
    const existingMemory = this.loadFromStorage(chatId);
    
    // If less than CHUNK_SIZE messages, just store as immediate context
    if (messages.length <= this.CHUNK_SIZE) {
      return {
        chatId,
        historicalSummary: '',
        recentChunks: [],
        immediateMessages: messages,
        importantMessages: this.extractImportantMessages(messages),
        totalMessages: messages.length,
        lastUpdated: new Date()
      };
    }

    // For longer conversations, implement layered system
    const importantMessages = this.extractImportantMessages(messages);
    const immediateMessages = messages.slice(-this.MAX_IMMEDIATE_MESSAGES);
    
    // Calculate how many messages need to be processed into chunks/summaries
    const messagesToProcess = messages.slice(0, -this.MAX_IMMEDIATE_MESSAGES);
    
    let recentChunks: ConversationChunk[] = [];
    let historicalSummary = '';

    if (messagesToProcess.length > 0) {
      // Create chunks from recent messages
      recentChunks = this.createRecentChunks(messagesToProcess);
      
      // If we have too many chunks, compress the oldest into historical summary
      if (recentChunks.length > this.MAX_RECENT_CHUNKS) {
        const chunksToHistorical = recentChunks.slice(0, -this.MAX_RECENT_CHUNKS);
        historicalSummary = this.createHistoricalSummary(chunksToHistorical, existingMemory?.historicalSummary);
        recentChunks = recentChunks.slice(-this.MAX_RECENT_CHUNKS);
      }
    }

    return {
      chatId,
      historicalSummary,
      recentChunks,
      immediateMessages,
      importantMessages,
      totalMessages: messages.length,
      lastUpdated: new Date()
    };
  }

  /**
   * Create chunks from conversation segments
   */
  private createRecentChunks(messages: Message[]): ConversationChunk[] {
    const chunks: ConversationChunk[] = [];
    
    for (let i = 0; i < messages.length; i += this.CHUNK_SIZE) {
      const chunkMessages = messages.slice(i, i + this.CHUNK_SIZE);
      if (chunkMessages.length === 0) break;

      const chunk: ConversationChunk = {
        id: `chunk_${i}_${i + chunkMessages.length - 1}`,
        startMessageId: chunkMessages[0].id,
        endMessageId: chunkMessages[chunkMessages.length - 1].id,
        summary: this.generateChunkSummary(chunkMessages),
        topics: this.extractTopics(chunkMessages),
        tokenCount: this.estimateTokens(this.generateChunkSummary(chunkMessages)),
        timestamp: chunkMessages[chunkMessages.length - 1].timestamp
      };

      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Generate summary for a chunk of messages
   */
  private generateChunkSummary(messages: Message[]): string {
    // Simple summarization - in production, this could use AI summarization
    const topics = this.extractTopics(messages);
    const keyPoints: string[] = [];

    // Extract key information patterns
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Look for decisions, solutions, important facts
      if (content.includes('decided') || content.includes('solution') || content.includes('fixed')) {
        keyPoints.push(msg.content.substring(0, 100) + '...');
      }
      
      // Look for questions and answers
      if (msg.role === 'user' && content.includes('?')) {
        keyPoints.push(`User asked: ${msg.content.substring(0, 80)}...`);
      }
    });

    const summary = [
      `Topics: ${topics.join(', ')}`,
      ...keyPoints.slice(0, 3) // Limit to top 3 key points
    ].join('. ');

    return summary.length > 300 ? summary.substring(0, 300) + '...' : summary;
  }

  /**
   * Create historical summary from multiple chunks
   */
  private createHistoricalSummary(chunks: ConversationChunk[], existingSummary?: string): string {
    const topics = [...new Set(chunks.flatMap(c => c.topics))];
    const summaries = chunks.map(c => c.summary);

    let historical = `Overall conversation covered: ${topics.join(', ')}. `;
    historical += `Key developments: ${summaries.join(' → ')}`;

    if (existingSummary) {
      historical = `${existingSummary} → ${historical}`;
    }

    // Ensure it fits within token budget
    return historical.length > 800 ? historical.substring(0, 800) + '...' : historical;
  }

  /**
   * Extract important messages that should always be preserved
   */
  private extractImportantMessages(messages: Message[]): ImportantMessage[] {
    const important: ImportantMessage[] = [];

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // User information
      if (msg.role === 'user' && (
        content.includes('i am') || 
        content.includes('my name is') || 
        content.includes('i work') ||
        content.includes('i need') ||
        content.includes('my goal')
      )) {
        important.push({
          messageId: msg.id,
          content: msg.content,
          reason: 'user_info',
          timestamp: msg.timestamp
        });
      }

      // Important decisions
      if (content.includes('decide') || content.includes('choose') || content.includes('go with')) {
        important.push({
          messageId: msg.id,
          content: msg.content,
          reason: 'decision',
          timestamp: msg.timestamp
        });
      }

      // Instructions or requirements
      if (msg.role === 'user' && (
        content.includes('requirements:') ||
        content.includes('must have') ||
        content.includes('important:')
      )) {
        important.push({
          messageId: msg.id,
          content: msg.content,
          reason: 'instruction',
          timestamp: msg.timestamp
        });
      }
    });

    // Keep only the most recent important messages to fit token budget
    return important.slice(-5);
  }

  /**
   * Extract topics from messages
   */
  private extractTopics(messages: Message[]): string[] {
    const topics = new Set<string>();
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'when', 'where', 'why', 'can', 'could', 'would', 'should', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'shall', 'may', 'might', 'must']);

    messages.forEach(msg => {
      // Simple topic extraction - look for capitalized words, technical terms
      const words = msg.content.split(/\s+/);
      words.forEach(word => {
        word = word.replace(/[^\w]/g, '').toLowerCase();
        
        // Add words that might be topics (length > 4, not common words)
        if (word.length > 4 && !commonWords.has(word)) {
          topics.add(word);
        }
      });
    });

    return Array.from(topics).slice(0, 5); // Limit to top 5 topics
  }

  /**
   * Build context string for AI
   */
  private buildContextString(memory: ChatMemoryData): string {
    const parts: string[] = [];

    // Historical summary
    if (memory.historicalSummary) {
      parts.push(`📚 Historical Context:\n${memory.historicalSummary}\n`);
    }

    // Recent chunks
    if (memory.recentChunks.length > 0) {
      parts.push(`🔄 Recent Discussion:`);
      memory.recentChunks.forEach((chunk, index) => {
        parts.push(`${index + 1}. ${chunk.summary}`);
      });
      parts.push('');
    }

    // Important messages
    if (memory.importantMessages.length > 0) {
      parts.push(`⭐ Important Information:`);
      memory.importantMessages.forEach(msg => {
        parts.push(`- ${msg.content.substring(0, 100)}...`);
      });
      parts.push('');
    }

    // Immediate context
    if (memory.immediateMessages.length > 0) {
      parts.push(`💬 Recent Messages:`);
      memory.immediateMessages.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        parts.push(`${role}: ${msg.content}`);
      });
    }

    const context = parts.join('\n');
    
    // Ensure we stay within token budget
    if (this.estimateTokens(context) > 3000) {
      return context.substring(0, 12000) + '\n[Context truncated to fit token limit]';
    }

    return context;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Save memory to localStorage
   */
  private saveToStorage(chatId: string, memory: ChatMemoryData): void {
    try {
      localStorage.setItem(`chat_memory_${chatId}`, JSON.stringify(memory));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Load memory from localStorage
   */
  private loadFromStorage(chatId: string): ChatMemoryData | null {
    try {
      const stored = localStorage.getItem(`chat_memory_${chatId}`);
      if (!stored) return null;

      const memory = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      memory.lastUpdated = new Date(memory.lastUpdated);
      memory.immediateMessages.forEach((msg: any) => {
        msg.timestamp = new Date(msg.timestamp);
      });
      memory.recentChunks.forEach((chunk: any) => {
        chunk.timestamp = new Date(chunk.timestamp);
      });
      memory.importantMessages.forEach((msg: any) => {
        msg.timestamp = new Date(msg.timestamp);
      });

      return memory;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  }

  /**
   * Clean up old memories (call periodically)
   */
  cleanupOldMemories(daysOld = 30): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('chat_memory_')) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const memory = JSON.parse(stored);
              const lastUpdated = new Date(memory.lastUpdated);
              
              if (lastUpdated < cutoffDate) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up old memories:', error);
    }
  }
}

// Export singleton instance
export const chatMemory = new ChatMemory();
