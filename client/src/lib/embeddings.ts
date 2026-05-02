// Embeddings: uses server-side Gemini API with a deterministic hash fallback.
// @xenova/transformers removed — 500 MB WASM bundle that duplicated Gemini embeddings.

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

// Singleton class to manage embeddings (server-side Gemini API + hash fallback)
export class EmbeddingsManager {
  private static instance: EmbeddingsManager;
  private conversations: Map<string, ConversationState> = new Map();

  private constructor() {}

  public static getInstance(): EmbeddingsManager {
    if (!EmbeddingsManager.instance) {
      EmbeddingsManager.instance = new EmbeddingsManager();
    }
    return EmbeddingsManager.instance;
  }

  /**
   * Get embeddings for a text input.
   * Tries server-side Gemini embedding first; falls back to deterministic hash.
   */
  public async getEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await fetch('/api/nlp/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.embedding && Array.isArray(data.embedding)) {
          return data.embedding;
        }
      }
    } catch {
      // Server not available — fall through to hash
    }
    return this.generateSimpleEmbedding(text, 384);
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