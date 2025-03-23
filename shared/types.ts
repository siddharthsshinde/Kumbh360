export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  metadata?: {
    location?: string;
    context?: string;
    intent?: string;
    hasImage?: boolean;
    source?: string;
    [key: string]: any; // Allow additional metadata properties
  };
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  language: string;
  timestamp: string;
  category?: string;
  imageUrl?: string;
}

export interface KumbhFAQItem {
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export interface ChatResponse {
  content: string;
  source?: {
    type: 'faq' | 'realtime' | 'generated';
    category?: string;
  };
}

/**
 * Gemini API request format - specifically designed for our RAG implementation
 */
export interface GeminiRequest {
  messages: ChatMessage[];
  sessionId: string;
  options?: {
    temperature?: number;
    useRag?: boolean;
    useCache?: boolean;
    maxContextItems?: number;
    includeSources?: boolean;
    maxOutputTokens?: number;
    topK?: number;
    topP?: number;
  };
}

/**
 * Gemini API message format - based on our ChatMessage type
 */
export type GeminiMessage = ChatMessage;