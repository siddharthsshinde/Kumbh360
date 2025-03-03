// Basic NLP utilities for the chatbot
export function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

// Common English stopwords
const stopwords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
]);

export function removeStopwords(tokens: string[]): string[] {
  return tokens.filter(token => !stopwords.has(token));
}

// TF-IDF implementation
export class TFIDF {
  private documents: string[][];
  private idfScores: Map<string, number>;
  private documentVectors: number[][];

  constructor(texts: string[]) {
    this.documents = texts.map(text => removeStopwords(tokenize(text)));
    this.idfScores = new Map();
    this.documentVectors = [];
    this.computeIDFScores();
    this.computeDocumentVectors();
  }

  private computeIDFScores(): void {
    const wordCounts = new Map<string, number>();
    
    // Count documents containing each word
    this.documents.forEach(doc => {
      const uniqueWords = new Set(doc);
      uniqueWords.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
    });

    // Compute IDF scores
    const totalDocs = this.documents.length;
    wordCounts.forEach((count, word) => {
      this.idfScores.set(word, Math.log(totalDocs / count));
    });
  }

  private computeDocumentVectors(): void {
    const allWords = Array.from(this.idfScores.keys());
    
    this.documentVectors = this.documents.map(doc => {
      const wordFreq = new Map<string, number>();
      doc.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });

      return allWords.map(word => {
        const tf = (wordFreq.get(word) || 0) / doc.length;
        const idf = this.idfScores.get(word) || 0;
        return tf * idf;
      });
    });
  }

  public queryVector(query: string): number[] {
    const queryTokens = removeStopwords(tokenize(query));
    const allWords = Array.from(this.idfScores.keys());
    const wordFreq = new Map<string, number>();
    
    queryTokens.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    return allWords.map(word => {
      const tf = (wordFreq.get(word) || 0) / queryTokens.length;
      const idf = this.idfScores.get(word) || 0;
      return tf * idf;
    });
  }

  public cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    return norm1 && norm2 ? dotProduct / (norm1 * norm2) : 0;
  }

  public findSimilarDocuments(query: string, topK: number = 5): number[] {
    const queryVec = this.queryVector(query);
    const similarities = this.documentVectors.map((docVec, idx) => ({
      index: idx,
      score: this.cosineSimilarity(queryVec, docVec)
    }));

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.index);
  }
}
