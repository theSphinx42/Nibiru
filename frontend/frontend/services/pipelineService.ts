import { useState, useEffect } from 'react';
import { useDebug, DebugLog } from '../contexts/DebugContext';

export interface PipelineMessage {
  id: string;
  from: 'claude' | 'saphira';
  to: 'claude' | 'saphira';
  status: 'sent' | 'received' | 'processing' | 'error';
  content: string;
  timestamp: Date;
  tags?: string[];
}

interface DebugLogger {
  addLog: (log: Omit<DebugLog, "timestamp">) => void;
}

class PipelineService {
  private queue: PipelineMessage[] = [];
  private subscribers: ((message: PipelineMessage) => void)[] = [];
  
  // Add a message to the pipeline
  async send(message: Omit<PipelineMessage, 'timestamp'>, logger?: DebugLogger) {
    const fullMessage = {
      ...message,
      timestamp: new Date()
    };

    this.queue.push(fullMessage);
    
    if (logger) {
      logger.addLog({
        type: 'api',
        message: `Pipeline message sent from ${message.from} to ${message.to}`,
        data: message
      });
    }

    // Notify subscribers
    this.subscribers.forEach(callback => callback(fullMessage));

    return fullMessage;
  }

  // Subscribe to pipeline updates
  subscribe(callback: (message: PipelineMessage) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Get all messages in the pipeline
  getMessages() {
    return [...this.queue];
  }

  // Get the latest message
  getLatestMessage() {
    return this.queue[this.queue.length - 1] || null;
  }

  // Update message status
  async updateStatus(id: string, status: PipelineMessage['status'], logger?: DebugLogger) {
    const message = this.queue.find(m => m.id === id);
    if (message) {
      message.status = status;
      if (logger) {
        logger.addLog({
          type: 'api',
          message: `Pipeline message ${id} status updated to ${status}`,
          data: { id, status }
        });
      }
      this.subscribers.forEach(callback => callback(message));
    }
  }

  // Clear the pipeline
  clear(logger?: DebugLogger) {
    this.queue = [];
    if (logger) {
      logger.addLog({
        type: 'api',
        message: 'Pipeline cleared'
      });
    }
  }

  // Get messages by tag
  getMessagesByTag(tag: string) {
    return this.queue.filter(message => message.tags?.includes(tag));
  }

  // Get messages between two timestamps
  getMessagesByTimeRange(start: Date, end: Date) {
    return this.queue.filter(
      message => message.timestamp >= start && message.timestamp <= end
    );
  }

  // Export pipeline history
  exportHistory() {
    return JSON.stringify(this.queue, null, 2);
  }

  // Import pipeline history
  importHistory(history: string, logger?: DebugLogger) {
    try {
      const parsed = JSON.parse(history);
      if (Array.isArray(parsed)) {
        this.queue = parsed.map(message => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }));
        if (logger) {
          logger.addLog({
            type: 'api',
            message: 'Pipeline history imported',
            data: { messageCount: this.queue.length }
          });
        }
      }
    } catch (error) {
      if (logger) {
        logger.addLog({
          type: 'error',
          message: 'Failed to import pipeline history',
          data: { error }
        });
      }
    }
  }
}

// Create a singleton instance
export const pipelineService = new PipelineService();

// Export hooks for React components
export function usePipeline() {
  const [messages, setMessages] = useState<PipelineMessage[]>([]);
  const debug = useDebug();

  useEffect(() => {
    // Subscribe to pipeline updates
    const unsubscribe = pipelineService.subscribe(message => {
      setMessages((prev: PipelineMessage[]) => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) {
          return prev.map(m => m.id === message.id ? message : m);
        }
        return [...prev, message];
      });
    });

    // Initialize with existing messages
    setMessages(pipelineService.getMessages());

    return unsubscribe;
  }, []);

  return {
    messages,
    send: (message: Omit<PipelineMessage, 'timestamp'>) => 
      pipelineService.send(message, debug),
    updateStatus: (id: string, status: PipelineMessage['status']) => 
      pipelineService.updateStatus(id, status, debug),
    clear: () => pipelineService.clear(debug),
    getMessagesByTag: pipelineService.getMessagesByTag.bind(pipelineService),
    getMessagesByTimeRange: pipelineService.getMessagesByTimeRange.bind(pipelineService),
    exportHistory: pipelineService.exportHistory.bind(pipelineService),
    importHistory: (history: string) => pipelineService.importHistory(history, debug)
  };
} 