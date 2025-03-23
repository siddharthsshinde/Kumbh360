// Advanced NLP utilities for Kumbh Mela Chatbot

// Stopwords for Hindi and English
const STOPWORDS = {
  english: [
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him',
    'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its',
    'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
    'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as',
    'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
    'against', 'between', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
    'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
    'now', 'kumbh', 'mela', 'please', 'tell', 'know', 'want', 'need'
  ],
  hindi: [
    'मैं', 'मुझे', 'मेरा', 'हम', 'हमारा', 'आप', 'तुम', 'तुम्हारा', 'वह',
    'उसका', 'यह', 'वो', 'ये', 'जो', 'कौन', 'क्या', 'कैसे', 'कब',
    'कहाँ', 'है', 'हैं', 'था', 'थे', 'थी', 'होगा', 'हूँ', 'और', 'या',
    'पर', 'में', 'से', 'के', 'को', 'एक', 'का', 'की', 'कि', 'तो',
    'ही', 'भी', 'न', 'जा', 'कर', 'हो', 'अब', 'इस', 'उस', 'पे', 'कुंभ', 'मेला'
  ]
};

// Domain-specific keywords for Kumbh Mela
const DOMAIN_KEYWORDS = [
  'kumbh', 'mela', 'nashik', 'godavari', 'temple', 'holy', 'dip', 'bath', 'ghat',
  'ritual', 'prayer', 'puja', 'aarti', 'sadhu', 'saint', 'pilgrim', 'accommodation',
  'transport', 'crowd', 'schedule', 'date', 'festival', 'sacred', 'river', 'ramkund',
  'tapovan', 'trimbakeshwar', 'शिव', 'नासिक', 'कुंभ', 'मेला', 'गोदावरी', 'मंदिर', 'स्नान',
  'पूजा', 'आरती', 'साधु', 'यात्री', 'भीड़', 'नदी', 'पवित्र', 'रामकुंड', 'त्रिंबकेश्वर'
];

/**
 * Enhanced tokenization with language detection and special character handling
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  
  // Convert to lowercase and normalize spaces
  const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Handle both English and Devanagari scripts
  const hasDevanagari = /[\u0900-\u097F]/.test(normalized);
  
  if (hasDevanagari) {
    // For Hindi text, use space and punctuation as separators but keep Devanagari characters
    return normalized
      .replace(/[^\u0900-\u097F\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  } else {
    // For English text, remove punctuation and split on whitespace
    return normalized
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }
}

/**
 * Remove stopwords with language detection
 */
export function removeStopwords(tokens: string[]): string[] {
  if (!tokens || tokens.length === 0) return [];
  
  // Detect if tokens contain Devanagari script
  const hasDevanagari = tokens.some(token => /[\u0900-\u097F]/.test(token));
  
  // Create combined stopword set for efficient lookup
  const stopwordSet = new Set([
    ...STOPWORDS.english,
    ...(hasDevanagari ? STOPWORDS.hindi : [])
  ]);
  
  return tokens.filter(token => !stopwordSet.has(token));
}

/**
 * Stemmer for English words (simplified Porter stemming)
 */
export function stemWord(word: string): string {
  if (!word || word.length < 3) return word;
  
  // Check if the word contains Devanagari characters
  if (/[\u0900-\u097F]/.test(word)) {
    return word; // Don't stem Hindi words
  }
  
  // Simple stemming rules for English
  let stemmed = word;
  
  // Remove 'ing'
  if (stemmed.endsWith('ing')) {
    stemmed = stemmed.slice(0, -3);
    if (stemmed.length > 0 && stemmed.endsWith('e')) {
      stemmed = stemmed.slice(0, -1);
    }
  }
  
  // Remove 'ed'
  else if (stemmed.endsWith('ed')) {
    stemmed = stemmed.slice(0, -2);
    if (stemmed.length > 0 && stemmed.endsWith('e')) {
      stemmed = stemmed.slice(0, -1);
    }
  }
  
  // Remove 's'
  else if (stemmed.endsWith('s') && !stemmed.endsWith('ss')) {
    stemmed = stemmed.slice(0, -1);
  }
  
  // Remove 'es'
  else if (stemmed.endsWith('es')) {
    stemmed = stemmed.slice(0, -2);
  }
  
  return stemmed.length > 0 ? stemmed : word;
}

/**
 * Extract key entities and phrases from text
 */
export function extractEntities(text: string): Record<string, string[]> {
  const entities: Record<string, string[]> = {
    locations: [],
    dates: [],
    events: [],
    rituals: [],
    questions: []
  };
  
  // Skip if text is empty
  if (!text) return entities;
  
  const loweredText = text.toLowerCase();
  
  // Location detection
  const locationKeywords = ['ramkund', 'tapovan', 'nashik', 'godavari', 'trimbakeshwar', 'kalaram'];
  locationKeywords.forEach(loc => {
    if (loweredText.includes(loc)) {
      entities.locations.push(loc);
    }
  });
  
  // Date/time detection
  const dateKeywords = ['morning', 'evening', 'night', 'today', 'tomorrow', 'next', 'day', 'month'];
  const dateMatches = dateKeywords.filter(date => loweredText.includes(date));
  if (dateMatches.length > 0) {
    entities.dates = dateMatches;
  }
  
  // Event detection
  const eventKeywords = ['aarti', 'snan', 'puja', 'bath', 'ceremony', 'procession', 'celebration'];
  eventKeywords.forEach(event => {
    if (loweredText.includes(event)) {
      entities.events.push(event);
    }
  });
  
  // Question detection
  if (loweredText.match(/\b(what|when|where|how|why|who|which)\b/)) {
    const questionMatch = text.match(/\b(what|when|where|how|why|who|which)\s+.+?[?]?/i);
    if (questionMatch) {
      entities.questions.push(questionMatch[0]);
    }
  }
  
  return entities;
}

/**
 * Check for semantic similarity between two texts using Jaccard similarity
 */
export function computeJaccardSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(removeStopwords(tokenize(text1)).map(stemWord));
  const tokens2 = new Set(removeStopwords(tokenize(text2)).map(stemWord));
  
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  
  // Calculate intersection
  const intersection = new Set<string>();
  tokens1.forEach(token => {
    if (tokens2.has(token)) {
      intersection.add(token);
    }
  });
  
  // Calculate union
  const union = new Set<string>(Array.from(tokens1).concat(Array.from(tokens2)));
  
  // Jaccard similarity = size of intersection / size of union
  return intersection.size / union.size;
}

/**
 * Enhanced TF-IDF implementation with domain-specific optimizations
 * for semantic search across knowledge base
 */
export class TFIDF {
  private documents: string[][];
  private terms: string[];
  private idfScores: Map<string, number>;
  private documentVectors: number[][];
  private rawTexts: string[];

  constructor(texts: string[]) {
    this.rawTexts = texts;
    
    // Preprocess texts with more advanced techniques
    this.documents = texts.map(text => {
      // Tokenize, remove stopwords, and stem
      return removeStopwords(tokenize(text)).map(stemWord);
    });
    
    this.terms = this.extractUniqueTerms();
    this.idfScores = new Map();
    this.documentVectors = [];
    
    this.computeIDFScores();
    this.computeDocumentVectors();
  }

  private extractUniqueTerms(): string[] {
    const uniqueTermsSet = new Set<string>();
    
    // Add all terms from documents
    this.documents.forEach(doc => {
      doc.forEach(term => uniqueTermsSet.add(term));
    });
    
    // Add domain-specific keywords
    DOMAIN_KEYWORDS.forEach(keyword => uniqueTermsSet.add(keyword));
    
    return Array.from(uniqueTermsSet);
  }

  private computeIDFScores(): void {
    // Count document frequency for each term
    const documentFrequency = new Map<string, number>();
    
    for (const doc of this.documents) {
      const uniqueTerms = new Set(doc);
      Array.from(uniqueTerms).forEach(term => {
        documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
      });
    }
    
    // Compute IDF scores with smoothing
    const N = this.documents.length || 1; // Prevent division by zero
    for (const term of this.terms) {
      const df = documentFrequency.get(term) || 0.5; // Smoothing for terms not in any document
      const idf = Math.log(N / (df + 0.5)) + 1.0; // Add 1 to make all scores positive
      this.idfScores.set(term, idf);
    }
    
    // Boost domain-specific keywords
    DOMAIN_KEYWORDS.forEach(keyword => {
      if (this.idfScores.has(keyword)) {
        const currentScore = this.idfScores.get(keyword) || 0;
        this.idfScores.set(keyword, currentScore * 1.5); // 50% boost
      }
    });
  }

  private computeDocumentVectors(): void {
    // For each document, compute its TF-IDF vector
    for (const doc of this.documents) {
      const termFrequency = new Map<string, number>();
      
      // Count term frequency
      for (const term of doc) {
        termFrequency.set(term, (termFrequency.get(term) || 0) + 1);
      }
      
      // Compute TF-IDF vector aligned with the terms array
      const vector: number[] = [];
      for (const term of this.terms) {
        const tf = termFrequency.get(term) || 0;
        const idf = this.idfScores.get(term) || 0;
        vector.push(tf * idf);
      }
      
      this.documentVectors.push(vector);
    }
  }

  /**
   * Convert query to TF-IDF vector
   */
  public queryVector(query: string): number[] {
    // Process query with the same steps as documents
    const queryTerms = removeStopwords(tokenize(query)).map(stemWord);
    const termFrequency = new Map<string, number>();
    
    // Count term frequency in query
    for (const term of queryTerms) {
      termFrequency.set(term, (termFrequency.get(term) || 0) + 1);
    }
    
    // Extract entities for additional context
    const entities = extractEntities(query);
    
    // Add entity terms to query with boosted frequency
    Object.values(entities).flat().forEach(entity => {
      const entityTerms = removeStopwords(tokenize(entity)).map(stemWord);
      entityTerms.forEach(term => {
        termFrequency.set(term, (termFrequency.get(term) || 0) + 0.5); // Add half weight
      });
    });
    
    // Compute TF-IDF vector aligned with the terms array
    const vector: number[] = [];
    for (const term of this.terms) {
      const tf = termFrequency.get(term) || 0;
      const idf = this.idfScores.get(term) || 0;
      
      // Boost score for domain keywords in query
      const boost = DOMAIN_KEYWORDS.includes(term) ? 1.5 : 1.0;
      vector.push(tf * idf * boost);
    }
    
    return vector;
  }

  /**
   * Compute cosine similarity between two vectors
   */
  public cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length === 0 || vec2.length === 0) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    // Use equal length to avoid dimension mismatch
    const minLength = Math.min(vec1.length, vec2.length);
    
    for (let i = 0; i < minLength; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    // Prevent division by zero
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    return norm1 && norm2 ? dotProduct / (norm1 * norm2) : 0;
  }

  /**
   * Find documents similar to the query with enhanced matching
   */
  public findSimilarDocuments(query: string, topK: number = 5): {index: number, text: string, score: number}[] {
    const queryVec = this.queryVector(query);
    const similarities: {index: number, text: string, score: number}[] = [];
    
    // Preprocess query for additional matching methods
    const normalizedQuery = query.toLowerCase().trim();
    const queryTokens = new Set(removeStopwords(tokenize(normalizedQuery)).map(stemWord));
    
    // Calculate similarity with each document
    for (let i = 0; i < this.documentVectors.length; i++) {
      // Primary cosine similarity score
      const cosineSim = this.cosineSimilarity(queryVec, this.documentVectors[i]);
      
      // Get document tokens for additional matching methods
      const docText = this.rawTexts[i];
      const normalizedDocText = docText.toLowerCase().trim();
      const docTokens = new Set(removeStopwords(tokenize(normalizedDocText)).map(stemWord));
      
      // Jaccard similarity (token overlap)
      const intersection = new Set<string>();
      queryTokens.forEach(token => {
        if (docTokens.has(token)) {
          intersection.add(token);
        }
      });
      const union = new Set<string>([...Array.from(queryTokens), ...Array.from(docTokens)]);
      const jaccardSim = intersection.size / union.size;
      
      // Word order similarity (simpler version of edit distance)
      const queryTokenArr = Array.from(queryTokens);
      const docTokenArr = Array.from(docTokens);
      
      // Count of matching tokens in the same relative position
      let orderMatches = 0;
      for (let j = 0; j < Math.min(queryTokenArr.length, docTokenArr.length); j++) {
        if (queryTokenArr[j] === docTokenArr[j]) {
          orderMatches++;
        }
      }
      const orderSim = orderMatches / Math.max(queryTokenArr.length, docTokenArr.length);
      
      // Combined similarity score - weighted average of different metrics
      // Cosine similarity is given the highest weight
      const combinedScore = (cosineSim * 0.6) + (jaccardSim * 0.3) + (orderSim * 0.1);
      
      similarities.push({
        index: i,
        text: this.rawTexts[i],
        score: combinedScore
      });
    }
    
    // Apply additional techniques for better matching
    for (let i = 0; i < similarities.length; i++) {
      const docText = this.rawTexts[i];
      
      // Check for exact phrase matches and boost score
      if (docText.toLowerCase().includes(query.toLowerCase())) {
        similarities[i].score *= 1.8; // 80% boost for exact phrase match
      }
      
      // Check for partial phrase matches
      const queryWords = query.toLowerCase().split(/\s+/);
      if (queryWords.length > 1) {
        for (let j = 0; j < queryWords.length - 1; j++) {
          const phrase = queryWords[j] + ' ' + queryWords[j+1];
          if (docText.toLowerCase().includes(phrase)) {
            similarities[i].score *= 1.2; // 20% boost for partial phrase match
          }
        }
      }
      
      // Check for entity matches
      const queryEntities = extractEntities(query);
      const docEntities = extractEntities(docText);
      
      // Boost score based on location matches
      const locationMatches = queryEntities.locations.filter(loc => 
        docEntities.locations.includes(loc)
      ).length;
      if (locationMatches > 0) {
        similarities[i].score *= (1 + 0.25 * locationMatches);
      }
      
      // Boost score based on event matches
      const eventMatches = queryEntities.events.filter(event => 
        docEntities.events.includes(event)
      ).length;
      if (eventMatches > 0) {
        similarities[i].score *= (1 + 0.25 * eventMatches);
      }
      
      // Boost score based on question type match (what, when, where, etc.)
      if (queryEntities.questions.length > 0 && docEntities.questions.length > 0) {
        // Check if the question types match
        const queryQuestionType = queryEntities.questions[0].split(' ')[0].toLowerCase();
        const docQuestionType = docEntities.questions[0].split(' ')[0].toLowerCase();
        
        if (queryQuestionType === docQuestionType) {
          similarities[i].score *= 1.3; // 30% boost for matching question type
        }
      }
    }
    
    // Sort by similarity (descending)
    similarities.sort((a, b) => b.score - a.score);
    
    // Filter out low-scoring results with lower threshold
    const threshold = 0.08; // Lower threshold to catch more results
    const filteredResults = similarities.filter(item => item.score > threshold);
    
    // Return top K results
    return filteredResults.slice(0, topK);
  }
  
  /**
   * Generate follow-up questions based on query and results
   */
  public generateFollowUpQuestions(query: string, topResults: {text: string}[]): string[] {
    // Extract entities from query and results
    const queryEntities = extractEntities(query);
    const resultsEntities = topResults.map(r => extractEntities(r.text));
    
    const followUpQuestions: string[] = [];
    
    // Generate location-based follow-up
    if (queryEntities.locations.length > 0) {
      const location = queryEntities.locations[0];
      followUpQuestions.push(`What are the best times to visit ${location}?`);
      followUpQuestions.push(`How crowded is ${location} currently?`);
    }
    
    // Generate event-based follow-up
    if (queryEntities.events.length > 0) {
      const event = queryEntities.events[0];
      followUpQuestions.push(`When is the next ${event} scheduled?`);
    }
    
    // Generate general follow-ups based on Kumbh Mela context
    followUpQuestions.push("Do you need transportation information?");
    followUpQuestions.push("Would you like to know about accommodation options?");
    followUpQuestions.push("Are you looking for information about rituals and ceremonies?");
    
    // Return unique questions, prioritizing those related to the query
    const uniqueQuestions = Array.from(new Set(followUpQuestions));
    return uniqueQuestions.slice(0, 3);
  }
}
