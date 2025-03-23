
import type { ChatMessage, GeminiRequest, GeminiMessage } from "@shared/types";
import { apiRequest } from './queryClient';

const SESSION_ID = 'default-session';

/**
 * Get chat response using backend RAG service with Gemini
 * This uses our server's Retrieval-Augmented Generation capabilities
 * rather than directly accessing the Gemini API
 */
export async function getGeminiResponse(messages: ChatMessage[]): Promise<string> {
  try {
    // Format messages for backend
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
      metadata: msg.metadata || {}
    }));

    // Create request payload for backend
    const payload: GeminiRequest = {
      messages: formattedMessages,
      sessionId: SESSION_ID,
      options: {
        temperature: 0.2,         // Lower temperature for more factual responses
        useRag: true,             // Enable Retrieval-Augmented Generation
        useCache: true,           // Use caching for faster repeat responses
        maxContextItems: 3,       // Number of knowledge base items to retrieve
        includeSources: false     // Don't include source citations in response
      }
    };

    // Call backend API
    const response = await apiRequest<{answer: string; source?: string; queryId?: number}>('/api/nlp/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: messages[messages.length - 1].content,
        sessionId: SESSION_ID
      })
    });

    if (!response || !response.answer) {
      throw new Error('Invalid response from NLP query API');
    }

    // Return the response content
    return response.answer;
  } catch (error: any) {
    console.error("Chat API error:", error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
  }
}

/**
 * Expand knowledge base using Gemini when a query doesn't have a good match
 * This is an automated process that uses feedback to improve the chatbot over time
 */
export async function expandKnowledgeBase(question: string, feedback: number): Promise<boolean> {
  try {
    // Only auto-expand for questions that received negative feedback
    if (feedback >= 0) {
      return false;
    }
    
    console.log("Expanding knowledge base for poorly answered question:", question);
    
    // Call the backend API to generate a better answer using Gemini
    const response = await apiRequest<{success: boolean; answer: string}>('/api/knowledge/expand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: question,
        autoLearn: true  // Flag to indicate this is an automated expansion
      })
    });
    
    if (!response || !response.success) {
      console.warn("Failed to expand knowledge base");
      return false;
    }
    
    console.log("Successfully expanded knowledge base with better answer");
    return true;
  } catch (error) {
    console.error("Knowledge base expansion error:", error);
    return false;
  }
}

/**
 * Check if Gemini API is available and configured
 */
export async function isGeminiAvailable(): Promise<boolean> {
  try {
    const response = await apiRequest<{available: boolean}>('/api/nlp/status', {
      method: 'GET'
    });
    
    return response?.available === true;
  } catch (error) {
    console.error("Gemini availability check error:", error);
    return false;
  }
}
