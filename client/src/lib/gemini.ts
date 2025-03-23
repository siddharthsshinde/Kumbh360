
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
    const response = await apiRequest<{content: string; sources?: string[]}>('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response || !response.content) {
      throw new Error('Invalid response from chat API');
    }

    // Return the response content
    return response.content;
  } catch (error: any) {
    console.error("Chat API error:", error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
  }
}
