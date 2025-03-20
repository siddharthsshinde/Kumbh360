// Enhanced embeddings using @xenova/transformers for better intent recognition
import { pipeline, Pipeline } from '@xenova/transformers';

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
  private embeddingModel: Pipeline | null = null;
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
  public async getEmbeddingModel(): Promise<Pipeline> {
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
      this.embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Embedding model loaded successfully');
    } catch (error) {
      console.error('Error loading embedding model:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get embeddings for a text input
   */
  public async getEmbeddings(text: string): Promise<number[]> {
    try {
      const model = await this.getEmbeddingModel();
      const result = await model(text, { pooling: 'mean', normalize: true });
      // Convert to standard array
      return Array.from(result.data);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      // Fallback to empty array in case of error
      return [];
    }
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