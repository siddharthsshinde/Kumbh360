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
// Maximum number of context items to include
const MAX_CONTEXT_ITEMS = 3;
// Minimum similarity threshold for including context
const MIN_SIMILARITY_THRESHOLD = 0.65;

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
   * Format chat history for Gemini
   */
  private formatChatHistory(chatHistory: ChatMessage[]): Content[] {
    return chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  /**
   * Retrieve relevant context for the query
   */
  private async retrieveContext(query: string): Promise<string> {
    try {
      // Check cache first
      const cachedContext = await cacheManager.get<string>(CacheType.QUERY_RESULTS, query);
      if (cachedContext) {
        log('Context retrieved from cache', 'rag-gemini');
        return cachedContext;
      }

      // Retrieve relevant information from the knowledge base
      const results = await vectorSearchManager.search(query, MAX_CONTEXT_ITEMS, MIN_SIMILARITY_THRESHOLD);
      
      if (results.length === 0) {
        log('No relevant context found in knowledge base', 'rag-gemini');
        return '';
      }
      
      // Format the context from retrieved results
      const context = results.map(item => {
        return `INFORMATION ABOUT: "${item.topic}"\n${item.content}`;
      }).join('\n\n');
      
      // Cache the context
      await cacheManager.set(CacheType.QUERY_RESULTS, query, context);
      
      log(`Retrieved ${results.length} context items from knowledge base`, 'rag-gemini');
      return context;
    } catch (error) {
      log(`Error retrieving context: ${error}`, 'rag-gemini');
      return '';
    }
  }

  /**
   * Generate response with Retrieval-Augmented Generation
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
      // Check cache first for exact query
      const cacheKey = `${query}-${JSON.stringify(options)}`;
      const cachedResponse = await cacheManager.get<string>(CacheType.GEMINI_RESPONSES, cacheKey);
      
      if (cachedResponse) {
        log('Response retrieved from cache', 'rag-gemini');
        return cachedResponse;
      }

      // Retrieve relevant context
      const context = await this.retrieveContext(query);
      
      // Format history for Gemini
      const formattedHistory = this.formatChatHistory(
        chatHistory.slice(0, -1) // Exclude the last message (current query)
      );
      
      // Create the model with API version set to v1
      const model = this.genAI.getGenerativeModel({
        model: "gemini-pro",
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      }, { apiVersion: "v1" });
      
      // Build the prompt with context
      const systemPrompt = `You are a helpful assistant for the Nashik Kumbh Mela 2025. Your role is to assist visitors with information about locations, crowd management, facilities, and religious aspects of the event.

Use the following context information to provide accurate, helpful responses:
${context}

Provide specific, accurate information while being respectful of religious and cultural aspects. Include:
1. Relevant details about locations, timings, or facilities
2. Safety recommendations if applicable
3. Real-time crowd management advice when needed
4. Emergency contact information for relevant queries`;
      
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
   * Store new knowledge in the vector index
   */
  public async storeKnowledge(knowledge: KnowledgeBase): Promise<void> {
    await vectorSearchManager.addItem(knowledge);
    // Clear relevant caches
    await cacheManager.clearType(CacheType.QUERY_RESULTS);
  }

  /**
   * Process image input with Gemini
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
      // Create a model that can handle images
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      // Prepare the image data
      const imagePart: Part = {
        inlineData: {
          data: imageBase64,
          mimeType
        }
      };
      
      // Create prompt
      const prompt = `This is an image related to Kumbh Mela. ${query || 'What can you tell me about what is shown in this image?'}`;
      
      // Generate content with the image and prompt
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
      });
      
      const response = result.response;
      return response.text();
    } catch (error) {
      log(`Error processing image input: ${error}`, 'rag-gemini');
      return "I apologize, but I'm having trouble analyzing this image at the moment. Please try again later.";
    }
  }
}

export const ragGeminiService = RAGGeminiService.getInstance();