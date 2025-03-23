// Enhanced embeddings using @xenova/transformers for better intent recognition
import { pipeline } from '@xenova/transformers';

// Define a custom interface for our embedding model that's compatible with what we need
interface EmbeddingModel {
  (text: string, options?: any): Promise<{ data: Float32Array | number[] }>;
}

// Conversation context state management
export interface ConversationState {
  lastIntent: string;
  intentHistory: string[];
  turnCount: number; 
  recentTopics: Set<string>;
  lastQuestion: string;
  lastAnswer: string;
  contextualMemory: Record<string, any>;
}

// Singleton class to manage embeddings and model loading
export class EmbeddingsManager {
  private static instance: EmbeddingsManager;
  private embeddingModel: EmbeddingModel | null = null;
  private isLoading: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private conversations: Map<string, ConversationState> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): EmbeddingsManager {
    if (!EmbeddingsManager.instance) {
      EmbeddingsManager.instance = new EmbeddingsManager();
    }
    return EmbeddingsManager.instance;
  }

  /**
   * Get the embedding model, loading it if necessary
   */
  public async getEmbeddingModel(): Promise<EmbeddingModel> {
    if (this.embeddingModel) {
      return this.embeddingModel;
    }
    
    if (this.isLoading) {
      // If already loading, wait for it to complete
      await this.loadPromise;
      return this.embeddingModel!;
    }
    
    // Start loading
    this.isLoading = true;
    this.loadPromise = this.loadModel();
    await this.loadPromise;
    return this.embeddingModel!;
  }

  /**
   * Load the embedding model
   */
  private async loadModel(): Promise<void> {
    try {
      // Using a smaller model suitable for edge deployments
      // Wrap the pipeline call in a timeout to prevent blocking the main thread
      const model = await Promise.race([
        pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'),
        new Promise<any>((_, reject) => {
          setTimeout(() => {
            console.warn('Embedding model loading timed out, using server-side fallback');
            reject(new Error('Model loading timeout'));
          }, 10000); // 10 seconds timeout
        })
      ]);
      
      this.embeddingModel = model as EmbeddingModel;
      console.log('Embedding model loaded successfully');
    } catch (error) {
      console.error('Error loading embedding model:', error);
      // Instead of throwing, provide a fallback proxy pipeline
      // This will return empty embeddings but allow the app to continue functioning
      this.embeddingModel = (text: string) => {
        return Promise.resolve({ data: new Array(384).fill(0) }); // Empty embeddings array
      };
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get embeddings for a text input
   */
  public async getEmbeddings(text: string): Promise<number[]> {
    try {
      // Try to use the local model first
      const model = await this.getEmbeddingModel();
      const result = await model(text, { pooling: 'mean', normalize: true });
      
      // Check if we got empty results (which indicates a fallback was used)
      const embedArray = Array.from(result.data).map(val => Number(val));
      const isEmptyEmbedding = embedArray.every(val => val === 0);
      
      // If we got a proper embedding, return it
      if (!isEmptyEmbedding) {
        return embedArray;
      }
      
      // If we have zero embeddings, try to use the server API instead
      console.log('Using server-side embeddings for:', text.substring(0, 30) + '...');
      
      try {
        // Call the server API for embeddings
        const response = await fetch('/api/nlp/embed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.embedding && Array.isArray(data.embedding)) {
            return data.embedding;
          }
        }
      } catch (serverError) {
        console.error('Error getting server-side embeddings:', serverError);
      }
      
      // If all else fails, use a simple hash-based fallback
      return this.generateSimpleEmbedding(text, 384); // Match dimension with the model
    } catch (error) {
      console.error('Error generating embeddings:', error);
      
      // Use a deterministic hash-based fallback
      return this.generateSimpleEmbedding(text, 384);
    }
  }
  
  /**
   * Generate a simple embedding using a deterministic hash function
   * This is a fallback when model loading or server API fails
   */
  private generateSimpleEmbedding(text: string, dimension: number): number[] {
    // Create a deterministic but simple embedding based on the text
    const embedding = new Array(dimension).fill(0);
    
    // Hash function for strings
    const hash = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    };
    
    // Process the text to generate embedding
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const h = Math.abs(hash(word)) % dimension;
      embedding[h] += 1;
    }
    
    // Normalize the vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < dimension; i++) {
        embedding[i] = embedding[i] / norm;
      }
    }
    
    return embedding;
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   */
  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    // Return 0 if either vector is empty (error case)
    if (vecA.length === 0 || vecB.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    // Avoid division by zero
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Initialize or get conversation state for a session
   */
  public getConversationState(sessionId: string): ConversationState {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        lastIntent: 'greeting',
        intentHistory: [],
        turnCount: 0,
        recentTopics: new Set(),
        lastQuestion: '',
        lastAnswer: '',
        contextualMemory: {}
      });
    }
    return this.conversations.get(sessionId)!;
  }

  /**
   * Update conversation state after a turn
   */
  public updateConversationState(
    sessionId: string,
    update: Partial<ConversationState>
  ): ConversationState {
    const state = this.getConversationState(sessionId);
    
    // Update with new values
    Object.assign(state, update);
    
    // Increment turn count
    state.turnCount++;
    
    // Maintain history of last 5 intents
    if (update.lastIntent) {
      state.intentHistory.push(update.lastIntent);
      if (state.intentHistory.length > 5) {
        state.intentHistory.shift();
      }
    }
    
    return state;
  }

  /**
   * Find semantic similarity between query and a set of target strings
   */
  public async findMostSimilar(
    query: string,
    targets: string[],
    threshold: number = 0.5
  ): Promise<{ text: string; score: number } | null> {
    try {
      const queryEmbedding = await this.getEmbeddings(query);
      
      // Get embeddings for all targets
      const embeddingsPromises = targets.map(target => this.getEmbeddings(target));
      const targetEmbeddings = await Promise.all(embeddingsPromises);
      
      let bestMatch = null;
      let highestSimilarity = threshold;
      
      // Find the most similar target
      for (let i = 0; i < targets.length; i++) {
        const similarity = this.cosineSimilarity(queryEmbedding, targetEmbeddings[i]);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatch = { text: targets[i], score: similarity };
        }
      }
      
      return bestMatch;
    } catch (error) {
      console.error('Error finding similar texts:', error);
      return null;
    }
  }
}

// Export singleton instance
export const embeddingsManager = EmbeddingsManager.getInstance();