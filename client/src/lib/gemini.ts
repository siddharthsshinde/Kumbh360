
import type { ChatMessage, GeminiRequest, GeminiMessage } from "@shared/types";
import { apiRequest } from './queryClient';

const SESSION_ID = 'default-session';

/**
 * Get chat response using backend RAG service with Gemini
 * This uses our server's Retrieval-Augmented Generation capabilities
 * rather than directly accessing the Gemini API
 */
export async function getGeminiResponse(
  messages: ChatMessage[],
  options?: {
    targetLanguage?: string;
    sourceLanguage?: string;
    imageData?: string;
  }
): Promise<{
  answer: string;
  source?: string;
  isLearned?: boolean;
  confidence?: number;
  queryId?: number;
} | string> {
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

    // Extract intent and location from message metadata if available
    const lastMessage = messages[messages.length - 1];
    const intent = lastMessage.metadata?.intent || 'general';
    const location = lastMessage.metadata?.location;
    
    // Call backend API with translation parameters if specified
    const response = await apiRequest<{
      answer: string; 
      originalAnswer?: string;
      source?: string; 
      queryId?: number;
      isLearned?: boolean;    // Flag indicating if this answer was learned
      confidence?: number;    // Confidence score of the answer
      context?: {
        originalLanguage?: string;
        targetLanguage?: string;
      };
    }>('/api/nlp/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: lastMessage.content,
        sessionId: SESSION_ID,
        targetLanguage: options?.targetLanguage,
        sourceLanguage: options?.sourceLanguage,
        imageData: options?.imageData,
        intent: intent,
        location: location
      })
    });

    if (!response || !response.answer) {
      throw new Error('Invalid response from NLP query API');
    }
    
    // Check if smart recommendations are already included in the response
    if (!response.answer.includes("Smart Recommendations")) {
      try {
        // Get personalized recommendations based on user context and other factors
        const recommendationsResponse = await apiRequest<{ 
          formattedText: string 
        }>(
          '/api/recommendations',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: SESSION_ID,
              intent: intent,
              location: location,
              chatHistory: messages
            }),
          }
        );
        
        // Only append recommendations if they're available and not empty
        if (recommendationsResponse.formattedText && 
            recommendationsResponse.formattedText.trim().length > 0) {
          // Add recommendations to the answer
          response.answer = `${response.answer}\n\n${recommendationsResponse.formattedText}`;
        }
      } catch (recError) {
        console.error('Error getting recommendations:', recError);
        // Continue with just the answer if recommendations fail
      }
    }

    // Return the enhanced response content
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

/**
 * Detect language of a text using Gemini
 */
export async function detectLanguage(text: string): Promise<{ 
  detectedLanguage: string;
  languageName: string;
}> {
  try {
    const response = await apiRequest<{
      detectedLanguage: string;
      languageName: string;
    }>('/api/translate/detect-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    if (!response || !response.detectedLanguage) {
      throw new Error("Failed to detect language");
    }
    
    return {
      detectedLanguage: response.detectedLanguage,
      languageName: response.languageName
    };
  } catch (error) {
    console.error("Error detecting language:", error);
    // Default to English on error
    return {
      detectedLanguage: 'en',
      languageName: 'English'
    };
  }
}

/**
 * Translate text using Gemini
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  try {
    const response = await apiRequest<{
      translatedText: string;
      sourceLanguage: string;
    }>('/api/translate/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        targetLanguage,
        sourceLanguage
      })
    });
    
    if (!response?.translatedText) {
      throw new Error("Failed to translate text");
    }
    
    return response.translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    // Return original text on error
    return text;
  }
}
