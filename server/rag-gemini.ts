/**
 * Retrieval-Augmented Generation (RAG) with Gemini API for Kumbh Mela Chatbot
 * 
 * This module implements RAG to improve the quality of responses by retrieving relevant
 * information from the knowledge base before generating responses with Gemini.
 */

import { GoogleGenerativeAI, Content, Part } from "@google/generative-ai";
import { vectorSearchManager } from './vector-search';
import { cacheManager, CacheType } from './cache-manager';
import { log } from './vite';
import type { ChatMessage } from "@shared/types";
import type { KnowledgeBase } from './storage';

// Maximum number of tokens to generate
const MAX_OUTPUT_TOKENS = 1024;
// Maximum number of context items to include - increased for better coverage
const MAX_CONTEXT_ITEMS = 5;
// Minimum similarity threshold for including context - adjusted for better relevance
const MIN_SIMILARITY_THRESHOLD = 0.60;
// Enhanced context weighting by relevance
const CONTEXT_RELEVANCE_DECAY = 0.85; // Apply decay factor to rank results

class RAGGeminiService {
  private static instance: RAGGeminiService;
  private genAI: GoogleGenerativeAI | null = null;
  isInitialized: boolean = false; // Changed from private to public for access in routes.ts

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): RAGGeminiService {
    if (!RAGGeminiService.instance) {
      RAGGeminiService.instance = new RAGGeminiService();
    }
    return RAGGeminiService.instance;
  }

  /**
   * Initialize the Gemini API service
   */
  public initialize(apiKey: string): void {
    if (this.isInitialized) return;

    try {
      // Initialize the Gemini API client
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.isInitialized = true;
      log('Gemini RAG Service initialized successfully', 'rag-gemini');
    } catch (error) {
      log(`Failed to initialize Gemini RAG Service: ${error}`, 'rag-gemini');
      throw error;
    }
  }

  /**
   * Format chat history for Gemini with enhanced context awareness
   */
  private formatChatHistory(chatHistory: ChatMessage[]): Content[] {
    // If chat history is short, use it as is
    if (chatHistory.length <= 3) {
      return chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
    }
    
    // For longer histories, keep the first exchange (context setting),
    // last 2-3 exchanges (recent context), and summarize the middle
    const firstExchange = chatHistory.slice(0, 2); // First user-assistant pair
    const recentExchanges = chatHistory.slice(-4); // Last 2 user-assistant pairs
    
    // Extract key topics from the middle conversations
    const middleExchanges = chatHistory.slice(2, -4);
    
    // Create a summary of middle conversations
    let topicsSummary = '';
    if (middleExchanges.length > 0) {
      // Extract topics by pulling out key noun phrases from each message
      const topicExtractor = (msg: string): string[] => {
        // Simple extraction of likely topic phrases
        // In a real implementation, this could use NLP to extract key entities
        const lowerMsg = msg.toLowerCase();
        return [
          'ramkund', 'tapovan', 'trimbakeshwar', 'godavari', 'nashik', 
          'panchavati', 'kalaram temple', 'crowding', 'safety', 'transport',
          'ritual', 'ceremony', 'bathing', 'accommodation', 'route', 'schedule'
        ].filter(topic => lowerMsg.includes(topic));
      };
      
      // Extract topics from each message
      const allTopics: string[] = [];
      middleExchanges.forEach(msg => {
        const msgTopics = topicExtractor(msg.content);
        allTopics.push(...msgTopics);
      });
      
      // Count topic frequencies and take the top 5
      const topicCounts = new Map<string, number>();
      allTopics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
      
      // Get top topics
      const topTopicsArray = Array.from(topicCounts.entries());
      const topTopics = topTopicsArray
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
      
      if (topTopics.length > 0) {
        topicsSummary = `[Previous conversation covered these topics: ${topTopics.join(', ')}]`;
      }
    }
    
    // Create the condensed history
    const formattedFirst = firstExchange.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const formattedRecent = recentExchanges.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user', 
      parts: [{ text: msg.content }]
    }));
    
    // If we have topics to summarize, add them between first and recent exchanges
    if (topicsSummary) {
      return [
        ...formattedFirst,
        {
          role: 'model',
          parts: [{ text: topicsSummary }]
        },
        ...formattedRecent
      ];
    } else {
      return [...formattedFirst, ...formattedRecent];
    }
  }

  /**
   * Retrieve relevant context for the query with enhanced relevance weighting
   */
  private async retrieveContext(query: string): Promise<string> {
    try {
      // Check cache first
      const cachedContext = await cacheManager.get<string>(CacheType.QUERY_RESULTS, query);
      if (cachedContext) {
        log('Context retrieved from cache', 'rag-gemini');
        return cachedContext;
      }

      // Extract key terms from the query for better matching
      const queryTerms = query.toLowerCase().split(/\s+/);
      const keyTerms = queryTerms.filter(term => term.length > 3);
      
      // Retrieve relevant information from the knowledge base
      const results = await vectorSearchManager.search(query, MAX_CONTEXT_ITEMS, MIN_SIMILARITY_THRESHOLD);
      
      if (results.length === 0) {
        log('No relevant context found in knowledge base', 'rag-gemini');
        return '';
      }
      
      // Apply relevance decay to prioritize the most relevant results
      // and enhance with term matching for better context retrieval
      let contextSections: string[] = [];
      
      results.forEach((item, index) => {
        // Apply relevance decay based on position in results (higher ranked = more weight)
        const relevanceScore = Math.pow(CONTEXT_RELEVANCE_DECAY, index);
        
        // Check if the item contains any of the key terms to increase relevance
        const containsKeyTerms = keyTerms.some(term => 
          item.topic.toLowerCase().includes(term) || 
          item.content.toLowerCase().includes(term)
        );
        
        // Calculate final relevance weight
        const finalWeight = containsKeyTerms ? relevanceScore * 1.2 : relevanceScore;
        
        // Format context with relevance information
        let contextBlock = `INFORMATION ABOUT: "${item.topic}" (relevance: ${(finalWeight * 100).toFixed(0)}%)\n${item.content}`;
        
        // Add source information if available
        if (item.source) {
          contextBlock += `\nSource: ${item.source}`;
        }
        
        contextSections.push(contextBlock);
      });
      
      // Join all context sections
      const context = contextSections.join('\n\n');
      
      // Cache the enhanced context
      await cacheManager.set(CacheType.QUERY_RESULTS, query, context);
      
      log(`Retrieved ${results.length} context items from knowledge base with enhanced relevance`, 'rag-gemini');
      return context;
    } catch (error) {
      log(`Error retrieving context: ${error}`, 'rag-gemini');
      return '';
    }
  }

  /**
   * Generate response with enhanced Retrieval-Augmented Generation
   * Includes improved context awareness and conversation memory
   */
  public async generateRAGResponse(
    query: string, 
    chatHistory: ChatMessage[] = [], 
    options: {
      temperature?: number;
      topK?: number;
      topP?: number;
    } = {}
  ): Promise<string> {
    if (!this.isInitialized || !this.genAI) {
      throw new Error('Gemini RAG Service not initialized');
    }

    try {
      // Analyze query for potential follow-up patterns
      const isFollowUp = this.detectFollowUpQuery(query, chatHistory);
      const conversationContext = this.extractConversationContext(chatHistory);
      
      // If it's a follow-up and we have a significant conversation history,
      // modify the cache key to include conversation context for better response matching
      let contextualizedQuery = query;
      
      if (isFollowUp && conversationContext) {
        // Append the conversation context to the query for contextual retrieval
        contextualizedQuery = `${query} [in the context of: ${conversationContext}]`;
        log(`Detected follow-up question. Enhanced query: ${contextualizedQuery.substring(0, 100)}...`, 'rag-gemini');
      }
      
      // Check cache first for exact query (either standard or contextualized)
      const cacheKey = `${contextualizedQuery}-${JSON.stringify(options)}`;
      const cachedResponse = await cacheManager.get<string>(CacheType.GEMINI_RESPONSES, cacheKey);
      
      if (cachedResponse) {
        log('Response retrieved from cache', 'rag-gemini');
        return cachedResponse;
      }

      // For follow-up queries, enhance the context retrieval by combining
      // the current query with the previous conversation turns
      let contextQuery = query;
      if (isFollowUp && chatHistory.length >= 2) {
        // Include the most recent assistant response and user query for context
        const previousUserMessage = chatHistory[chatHistory.length - 2]?.content || '';
        const previousAssistantResponse = chatHistory[chatHistory.length - 1]?.content || '';
        
        // Create a more informed context query
        contextQuery = `${query} (Follow-up to: "${previousUserMessage}" and "${previousAssistantResponse.substring(0, 100)}...")`;
      }
      
      // Retrieve relevant context using either standard or enhanced query
      const context = await this.retrieveContext(contextQuery);
      
      // Format history for Gemini
      const formattedHistory = this.formatChatHistory(
        chatHistory.slice(0, -1) // Exclude the last message (current query)
      );
      
      // Create the model with API version set to v1
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro",  // Updated to use gemini-1.5-pro which is available in v1
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      }, { apiVersion: "v1" });
      
      // Extract user intent from query with enhanced patterns
      const isLocationQuery = /where|location|place|spot|site|venue|area|zone|around|nearby/i.test(query);
      const isSafetyQuery = /safety|secure|safe|emergency|crowd|danger|risk|accident|hazard|protect|security/i.test(query);
      const isTransportQuery = /transport|travel|bus|train|car|route|reach|arrival|commute|journey|drive|walk|transit/i.test(query);
      const isRitualQuery = /ritual|ceremony|prayer|worship|bath|dip|holy|sacred|religious|spiritual|offering|blessing|puja/i.test(query);
      const isTimeQuery = /when|time|timing|schedule|date|duration|hours|day|open|close|start|end/i.test(query);
      const isAccommodationQuery = /stay|hotel|accommodation|lodge|sleep|room|tent|booking|reserve|lodging/i.test(query);
      
      // Add conversation context for follow-up queries
      let followUpContext = '';
      if (isFollowUp && conversationContext) {
        followUpContext = `
⚠️ This appears to be a FOLLOW-UP QUESTION. The user previously asked about: ${conversationContext}.
Remember to maintain continuity with previous answers and avoid repeating information already provided.`;
      }
      
      // Build enhanced prompt with context and intent-specific guidance
      const systemPrompt = `You are a knowledgeable and helpful assistant for the Nashik Kumbh Mela 2025. Your role is to provide accurate, culturally respectful information about the Kumbh Mela pilgrimage in Nashik, Maharashtra.

USE THE FOLLOWING CONTEXT INFORMATION to inform your response:
${context}

CURRENT DATE: March 26, 2025
USER QUERY: "${query}"

${isLocationQuery ? '⚠️ This appears to be a LOCATION-RELATED query. Provide specific details about the exact location, landmarks, distances, and directions. Include timings, special features, and historical significance if relevant.' : ''}
${isSafetyQuery ? '⚠️ This appears to be a SAFETY-RELATED query. Prioritize safety information, emergency contacts, crowd management tips, and current conditions. Be precise about safety protocols.' : ''}
${isTransportQuery ? '⚠️ This appears to be a TRANSPORTATION-RELATED query. Provide specific transport options, routes, schedules, and approximate costs. Include information about accessibility and convenience.' : ''}
${isRitualQuery ? '⚠️ This appears to be about RELIGIOUS RITUALS or CEREMONIES. Provide culturally respectful and accurate information about the spiritual significance, procedures, and timing of relevant rituals.' : ''}
${isTimeQuery ? '⚠️ This appears to be a TIME or SCHEDULE-RELATED query. Provide precise timing information, opening/closing hours, duration of events, and best times to visit based on crowd conditions.' : ''}
${isAccommodationQuery ? '⚠️ This appears to be an ACCOMMODATION-RELATED query. Provide information about lodging options, availability, price ranges, booking procedures, and proximity to key Kumbh Mela sites.' : ''}
${followUpContext}

RESPONSE GUIDELINES:
1. Be concise and directly answer the question first, then provide additional context if helpful
2. Include specific details relevant to the 2025 Kumbh Mela in Nashik (dates, locations, features)
3. When discussing locations, mention nearby facilities and current crowd conditions
4. For questions about rituals or religious aspects, be respectful and focus on factual information
5. Provide emergency contact information (Police: 100, Ambulance: 108, Kumbh Helpline: 18004251530) for safety-related queries
6. If information in the context seems contradictory, prioritize sources with higher relevance percentages

FORMAT YOUR RESPONSE in easy-to-read language with short paragraphs. Use respectful, helpful language appropriate for pilgrims and visitors from diverse backgrounds.`;
      
      // Start chat session
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Who are you and what can you help me with?" }],
          },
          {
            role: "model",
            parts: [{ text: "I'm your Kumbh Mela 2025 assistant, ready to help with information about the event, including locations, schedules, facilities, crowd management, safety tips, transportation, and religious aspects. How can I assist you with your visit to Nashik Kumbh Mela today?" }],
          },
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "I understand my role. I'll use the provided context to give accurate information about Nashik Kumbh Mela 2025, covering locations, crowd management, facilities, and religious aspects. I'll be respectful of cultural sensitivities while providing helpful details, safety recommendations, crowd management advice, and emergency contacts when relevant. How may I assist you?" }],
          },
          ...formattedHistory
        ],
      });
      
      // Send the query
      const result = await chat.sendMessage(query);
      const response = result.response;
      const responseText = response.text();
      
      // Cache the response
      await cacheManager.set(CacheType.GEMINI_RESPONSES, cacheKey, responseText);
      
      log('Generated RAG response with Gemini API', 'rag-gemini');
      return responseText;
    } catch (error) {
      log(`Error generating RAG response: ${error}`, 'rag-gemini');
      return "I apologize, but I'm having trouble retrieving information at the moment. Please try again later.";
    }
  }
  
  /**
   * Detect if a query is a follow-up to previous conversation
   */
  private detectFollowUpQuery(query: string, chatHistory: ChatMessage[]): boolean {
    // If no history, it can't be a follow-up
    if (chatHistory.length < 2) return false;
    
    // Check for common follow-up indicators
    const followUpPatterns = [
      /^(and|also|what about|how about|tell me more|more about)/i, // Starts with follow-up phrase
      /^(where|when|how|why|who|what).*\?$/i, // Question without context
      /^(it|that|they|those|these|this|there)/i, // Starts with pronoun
      /^(yes|no|maybe|right|okay|sure|thanks)/i, // Affirmative/negative response
    ];
    
    // Check if the query matches follow-up patterns
    const isFollowUpPattern = followUpPatterns.some(pattern => pattern.test(query.trim()));
    
    // Check for pronouns that might refer to previous context
    const hasPronouns = /\b(it|that|they|those|these|this|there|them|him|her|its)\b/i.test(query);
    
    // Check if the query is very short (likely needs context)
    const isShortQuery = query.split(/\s+/).length <= 5;
    
    return isFollowUpPattern || (hasPronouns && isShortQuery);
  }
  
  /**
   * Extract context from conversation history
   */
  private extractConversationContext(chatHistory: ChatMessage[]): string | null {
    if (chatHistory.length < 2) return null;
    
    // Get the last two exchanges (4 messages if available, or fewer)
    const recentHistory = chatHistory.slice(-Math.min(4, chatHistory.length));
    
    // Look for user messages to extract context
    const userMessages = recentHistory.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) return null;
    
    // Extract important topics from user messages
    const topics = new Set<string>();
    const topicPatterns = [
      { pattern: /ramkund/i, topic: 'Ramkund' },
      { pattern: /tapovan/i, topic: 'Tapovan' },
      { pattern: /trimbakeshwar/i, topic: 'Trimbakeshwar' },
      { pattern: /godavari/i, topic: 'Godavari River' },
      { pattern: /nashik/i, topic: 'Nashik' },
      { pattern: /panchavati/i, topic: 'Panchavati' },
      { pattern: /kalaram/i, topic: 'Kalaram Temple' },
      { pattern: /crowd|crowded|busy/i, topic: 'crowd levels' },
      { pattern: /safety|safe|secure/i, topic: 'safety' },
      { pattern: /transport|travel|bus|train/i, topic: 'transportation' },
      { pattern: /ritual|ceremony|prayer|worship/i, topic: 'rituals' },
      { pattern: /accommodation|hotel|stay|tent/i, topic: 'accommodation' },
      { pattern: /bath|bathing|dip/i, topic: 'holy bathing' },
      { pattern: /timing|schedule|time|when/i, topic: 'schedule and timings' }
    ];
    
    // Extract topics from recent messages
    userMessages.forEach(msg => {
      topicPatterns.forEach(({ pattern, topic }) => {
        if (pattern.test(msg.content)) {
          topics.add(topic);
        }
      });
    });
    
    // Return formatted context if topics were found
    if (topics.size > 0) {
      return Array.from(topics).join(', ');
    }
    
    // If no specific topics found, return the most recent user message as context
    return userMessages[userMessages.length - 1].content.substring(0, 100);
  }

  /**
   * Store new knowledge in the vector index
   */
  public async storeKnowledge(knowledge: KnowledgeBase): Promise<void> {
    await vectorSearchManager.addItem(knowledge);
    // Clear relevant caches
    await cacheManager.clearType(CacheType.QUERY_RESULTS);
  }

  /**
   * Process image input with enhanced Gemini vision capabilities
   */
  public async processImageInput(
    imageBase64: string,
    query: string,
    mimeType: string = 'image/jpeg'
  ): Promise<string> {
    if (!this.isInitialized || !this.genAI) {
      throw new Error('Gemini RAG Service not initialized');
    }

    try {
      // Create a model that can handle images with API version set to v1
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.4,  // Lower temperature for more factual analysis
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      }, { apiVersion: "v1" });
      
      // Prepare the image data
      const imagePart: Part = {
        inlineData: {
          data: imageBase64,
          mimeType
        }
      };
      
      // Detect the image type first to provide more targeted analysis
      const isImageQuery = !!query && query.trim().length > 0;
      
      // First, get basic image recognition
      const recognitionPrompt = `This is an image from the Kumbh Mela festival in Nashik, India. First, determine what is shown in this image in detail. 
      Is it showing: 
      - A temple or religious site? If yes, which one?
      - A crowd or gathering? If yes, estimate the crowd density.
      - A ritual or ceremony? If yes, which one?
      - A map or location? If yes, identify key landmarks.
      - Something else? Please describe in detail.
      
      Respond with ONLY a brief description of what you see.`;
      
      const recognitionResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: recognitionPrompt }, imagePart] }],
      });
      
      const imageDescription = recognitionResult.response.text();
      log(`Image recognition: ${imageDescription}`, 'rag-gemini');
      
      // Now create a more detailed analysis prompt based on the image content and user query
      let analysisPrompt = '';
      
      if (isImageQuery) {
        // If user provided a specific question about the image
        analysisPrompt = `CONTEXT: This is an image from the Kumbh Mela festival in Nashik, India.
        
IMAGE DESCRIPTION: ${imageDescription}

USER QUERY: ${query}

INSTRUCTIONS:
1. Answer the user's specific question about this image
2. Provide relevant details about what's shown in the image
3. If the image shows a specific location at Kumbh Mela, mention its significance and any relevant information
4. If people are performing rituals, explain them respectfully
5. Include important safety information if the image shows crowded areas

Please be specific, accurate, and culturally sensitive in your response. If you can't determine something with certainty, acknowledge that.`;
      } else {
        // If user didn't provide a specific question, give a comprehensive analysis
        analysisPrompt = `CONTEXT: This is an image from the Kumbh Mela festival in Nashik, India.
        
IMAGE DESCRIPTION: ${imageDescription}

INSTRUCTIONS:
1. Provide a detailed analysis of what is shown in this image
2. If the image shows a specific location at Kumbh Mela, explain its significance, history, and spiritual importance
3. If the image shows people performing rituals, explain the meaning and significance of these practices
4. If crowds are visible, comment on the safety, crowd management, and best practices for visitors
5. Mention any relevant practical information that would be helpful for someone visiting this location

Please be specific, accurate, and culturally sensitive in your response.`;
      }
      
      // Generate the final analysis
      const analysisResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: analysisPrompt }, imagePart] }],
      });
      
      const response = analysisResult.response;
      return response.text();
    } catch (error) {
      log(`Error processing image input: ${error}`, 'rag-gemini');
      return "I apologize, but I'm having trouble analyzing this image at the moment. Please try again later.";
    }
  }
}

export const ragGeminiService = RAGGeminiService.getInstance();