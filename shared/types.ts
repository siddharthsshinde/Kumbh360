export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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