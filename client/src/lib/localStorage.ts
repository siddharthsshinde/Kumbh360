
import type { ChatMessage, ChatHistory } from "@shared/types";

const CHAT_HISTORY_KEY = 'chatHistory';
const MAX_HISTORY_ITEMS = 50;

/**
 * Saves chat history to localStorage
 */
export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    const historyData: ChatHistory = {
      messages: messages.slice(-MAX_HISTORY_ITEMS), // Limit size
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(historyData));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

/**
 * Loads chat history from localStorage
 */
export function loadChatHistory(): ChatMessage[] | null {
  try {
    const savedData = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData) as ChatHistory;
      return parsed.messages;
    }
    return null;
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return null;
  }
}

/**
 * Clears chat history from localStorage
 */
export function clearChatHistory(): void {
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

/**
 * Gets most frequent user queries
 */
export function getFrequentQueries(): string[] {
  try {
    const history = loadChatHistory();
    if (!history) return [];
    
    // Extract user messages only
    const userMessages = history
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);
    
    // Count occurrences
    const counts: Record<string, number> = {};
    userMessages.forEach(msg => {
      counts[msg] = (counts[msg] || 0) + 1;
    });
    
    // Sort by frequency and take top 5
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query]) => query);
  } catch (error) {
    console.error('Failed to analyze frequent queries:', error);
    return [];
  }
}
