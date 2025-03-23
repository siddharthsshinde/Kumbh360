/**
 * Advanced Vector Search with FAISS for Kumbh Mela Chatbot
 * 
 * This module implements vector search capabilities using FAISS for the Kumbh Mela chatbot,
 * enabling efficient similarity search for question answering and intent recognition.
 */

import faiss from 'faiss-node';
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { KnowledgeBase } from './storage';
import { log } from './vite';

// Define SearchResult type for FAISS
// Define SearchResult interface for FAISS results
interface SearchResult {
  distances: number[];
  labels: number[];
  neighbors?: number[]; // Added for compatibility with existing code
}

// The dimension of embeddings from Gemini API
const EMBEDDING_DIMENSION = 768;

class VectorSearchManager {
  private static instance: VectorSearchManager;
  private index: faiss.IndexFlatL2 | null = null;
  private initialized: boolean = false;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;
  private idToKnowledgeMap: Map<number, KnowledgeBase> = new Map();
  private genAI: GoogleGenerativeAI | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): VectorSearchManager {
    if (!VectorSearchManager.instance) {
      VectorSearchManager.instance = new VectorSearchManager();
    }
    return VectorSearchManager.instance;
  }

  /**
   * Initialize the FAISS index and Gemini API
   */
  public async initialize(knowledgeBase: KnowledgeBase[], apiKey?: string): Promise<void> {
    if (this.initialized || this.isInitializing) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = new Promise<void>(async (resolve, reject) => {
      try {
        log('Initializing FAISS vector index', 'vector-search');
        
        // Create a new FAISS index
        this.index = new faiss.IndexFlatL2(EMBEDDING_DIMENSION);
        
        // Initialize Gemini API if key is provided
        if (apiKey) {
          this.genAI = new GoogleGenerativeAI(apiKey, { apiVersion: "v1" });
          log('Gemini API initialized', 'vector-search');
        } else {
          log('Gemini API key not provided, using alternative embedding method', 'vector-search');
        }
        
        // Add existing knowledge base items to the index
        if (knowledgeBase && knowledgeBase.length > 0) {
          await this.addKnowledgeBaseToIndex(knowledgeBase);
        }
        
        this.initialized = true;
        this.isInitializing = false;
        log('FAISS vector index initialized successfully', 'vector-search');
        resolve();
      } catch (error) {
        this.isInitializing = false;
        log(`Failed to initialize FAISS vector index: ${error}`, 'vector-search');
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * Add knowledge base items to the FAISS index
   */
  private async addKnowledgeBaseToIndex(knowledgeBase: KnowledgeBase[]): Promise<void> {
    try {
      // Process knowledge base items with embeddings
      const itemsWithEmbeddings = await Promise.all(
        knowledgeBase.map(async (item, index) => {
          // Generate embedding if not already present
          const embedding = item.embedding || await this.getEmbedding(`${item.topic} ${item.content}`);
          return {
            ...item,
            embedding,
            indexId: index
          };
        })
      );

      // Extract embeddings and ids
      const embeddings = itemsWithEmbeddings.map(item => new Float32Array(item.embedding as number[]));
      
      // Add to index
      if (embeddings.length > 0) {
        this.index?.add(embeddings);
        
        // Map ids to knowledge base items for retrieval
        itemsWithEmbeddings.forEach(item => {
          this.idToKnowledgeMap.set(item.indexId, item);
        });
        
        log(`Added ${embeddings.length} vectors to FAISS index`, 'vector-search');
      }
    } catch (error) {
      log(`Error adding to FAISS index: ${error}`, 'vector-search');
      throw error;
    }
  }

  /**
   * Add a single knowledge base item to the index
   */
  public async addItem(item: KnowledgeBase): Promise<void> {
    if (!this.initialized) {
      await this.initialize([]);
    }

    try {
      // Generate embedding if not already present
      const embedding = item.embedding || await this.getEmbedding(`${item.topic} ${item.content}`);
      
      // Current size of the index
      const currentId = this.idToKnowledgeMap.size;
      
      // Add to index
      this.index?.add([new Float32Array(embedding)]);
      
      // Store in map
      this.idToKnowledgeMap.set(currentId, {
        ...item,
        embedding
      });
      
      log(`Added item to FAISS index: "${item.topic.substring(0, 30)}..."`, 'vector-search');
    } catch (error) {
      log(`Error adding item to FAISS index: ${error}`, 'vector-search');
    }
  }

  /**
   * Search for similar items in the index
   */
  public async search(query: string, k: number = 5, threshold: number = 0.6): Promise<KnowledgeBase[]> {
    if (!this.initialized) {
      await this.initialize([]);
    }

    if (!this.index || this.idToKnowledgeMap.size === 0) {
      log('FAISS index not initialized or empty', 'vector-search');
      return [];
    }

    try {
      // Generate query embedding
      const queryEmbedding = await this.getEmbedding(query);
      
      // Search the index
      const searchResults = this.index.search(new Float32Array(queryEmbedding), k);
      
      // Convert results to knowledge base items
      const results: KnowledgeBase[] = [];
      for (let i = 0; i < searchResults.neighbors.length; i++) {
        const id = searchResults.neighbors[i];
        const distance = searchResults.distances[i];
        
        // Convert L2 distance to similarity score (approximate, inverse relationship)
        // Lower distance means higher similarity
        const similarity = 1 / (1 + distance);
        
        if (similarity >= threshold && this.idToKnowledgeMap.has(id)) {
          results.push(this.idToKnowledgeMap.get(id) as KnowledgeBase);
        }
      }
      
      log(`Found ${results.length} matches for query: "${query.substring(0, 30)}..."`, 'vector-search');
      return results;
    } catch (error) {
      log(`Error searching FAISS index: ${error}`, 'vector-search');
      return [];
    }
  }

  /**
   * Generate embedding for text using Gemini API
   */
  public async getEmbedding(text: string): Promise<number[]> {
    try {
      if (this.genAI) {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        const embeddingResult = await model.embedContent({
          content: text,
          taskType: "RETRIEVAL_DOCUMENT",
        });
        return embeddingResult.embedding.values;
      } else {
        // Fallback to simple embedding if Gemini API is not available
        // This is a simplified version for demonstration
        return this.generateSimpleEmbedding(text, EMBEDDING_DIMENSION);
      }
    } catch (error) {
      log(`Error generating embedding: ${error}`, 'vector-search');
      // Return a fallback embedding
      return this.generateSimpleEmbedding(text, EMBEDDING_DIMENSION);
    }
  }

  /**
   * Generate a simple embedding for text (fallback method)
   * Note: This is a simplified version and not suitable for production
   */
  private generateSimpleEmbedding(text: string, dimension: number): number[] {
    // Simple deterministic hashing for text to create a vector
    const embedding = new Array(dimension).fill(0);
    
    // Simple hash function
    const hash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    };
    
    // Generate pseudo-random but deterministic values
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const h = hash(word);
      const idx = Math.abs(h) % dimension;
      embedding[idx] += 1 / Math.sqrt(words.length);
    }
    
    // Normalize the vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (norm || 1));
  }

  /**
   * Clear the index
   */
  public clear(): void {
    if (this.index) {
      this.index.reset();
      this.idToKnowledgeMap.clear();
      log('FAISS index cleared', 'vector-search');
    }
  }
}

export const vectorSearchManager = VectorSearchManager.getInstance();