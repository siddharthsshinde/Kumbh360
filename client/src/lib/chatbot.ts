import type { ChatMessage, KumbhFAQItem, ChatResponse } from "@shared/types";
import rawKumbhData from "../../../attached_assets/kumbh_mela_real_human_dataset (1).json";
import { TFIDF, tokenize, removeStopwords } from "./nlp";

// Enhanced intents and patterns
const intents = {
  greetings: [
    'hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'नमस्कार', 'welcome', 'greet'
  ],
  locations: [
    'where', 'location', 'place', 'directions', 'कहाँ', 'स्थान', 'कुठे', 'ramkund', 'tapovan', 'temple', 'ghat'
  ],
  facilities: [
    'facilities', 'services', 'accommodation', 'food', 'stay', 'hotel', 'restaurant', 'सुविधाएं', 'सेवाएं', 'सुविधा'
  ],
  emergency: [
    'emergency', 'help', 'medical', 'police', 'hospital', 'doctor', 'ambulance', 'आपातकालीन', 'मदद', 'तातडीची'
  ],
  schedule: [
    'schedule', 'time', 'when', 'date', 'program', 'कार्यक्रम', 'समय', 'कधी', 'shahi snan', 'holy dip', 'bath'
  ],
  crowd: [
    'crowd', 'busy', 'rush', 'people', 'भीड़', 'गर्दी', 'overcrowded', 'safe', 'safety', 'tapovan'
  ]
};

// Transform the raw data into the expected format
const faqData: KumbhFAQItem[] = (rawKumbhData.questions || []).map(item => ({
  question: item.question || "",
  answer: item.answer || "",
  category: "general"
}));

// Initialize TFIDF with FAQ questions
const tfidf = new TFIDF(faqData.map(item => item.question));

// Common questions for suggestions
const commonQuestions = [
  "What are the main bathing dates?",
  "Where is Ramkund located?",
  "How to reach Tapovan?",
  "What are the emergency numbers?",
  "What facilities are available?",
  "Current crowd status at Ramkund?",
  "Nearest medical facilities?",
  "Where to stay during Kumbh Mela?",
  "What are the important temples to visit?",
  "How to get emergency help?"
];

export function getSuggestions(input: string): string[] {
  if (!input.trim()) return [];

  const normalizedInput = input.toLowerCase();
  const suggestions: string[] = [];

  // Add matching common questions
  suggestions.push(
    ...commonQuestions.filter(q => 
      q.toLowerCase().includes(normalizedInput)
    )
  );

  // Use TFIDF to find similar questions from FAQ
  if (input.length > 2) {
    const similarIndices = tfidf.findSimilarDocuments(input, 3);
    suggestions.push(
      ...similarIndices.map(idx => faqData[idx].question)
    );
  }

  // Remove duplicates and limit to 5 suggestions
  return Array.from(new Set(suggestions))
    .slice(0, 5)
    .filter(suggestion => suggestion.toLowerCase() !== normalizedInput);
}

function findIntent(message: string): string {
  const lowercaseMsg = message.toLowerCase();
  const messageTokens = new Set(removeStopwords(tokenize(message)));

  let bestIntent = 'general';
  let maxOverlap = 0;

  for (const [intent, patterns] of Object.entries(intents)) {
    const patternTokens = new Set(patterns.flatMap(p => removeStopwords(tokenize(p))));
    const overlap = [...messageTokens].filter(token => patternTokens.has(token)).length;

    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

function findRelevantFAQ(query: string): KumbhFAQItem | null {
  // Use TFIDF to find the most relevant FAQ
  const similarIndices = tfidf.findSimilarDocuments(query, 1);
  if (similarIndices.length === 0) return null;

  const bestMatchIndex = similarIndices[0];
  const similarity = tfidf.cosineSimilarity(
    tfidf.queryVector(query),
    tfidf.documentVectors[bestMatchIndex]
  );

  // Only return if similarity is above threshold
  return similarity > 0.2 ? faqData[bestMatchIndex] : null;
}

function getRealTimeUpdate(intent: string): string | null {
  // Simulate real-time updates for certain intents
  switch (intent) {
    case 'crowd':
      return "⚠️ REAL-TIME UPDATE: Tapovan area is currently experiencing high crowd density. Consider visiting during early morning hours. If visiting with children, please hold their hands firmly.";
    case 'emergency':
      return "🚨 EMERGENCY SERVICES: All medical camps and police stations are currently operational. Nearest medical camp to Ramkund is at Civil Hospital (500m).";
    default:
      return null;
  }
}

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const userMessage = messages[messages.length - 1].content;
    const intent = findIntent(userMessage);

    // First, try to find a relevant FAQ using vector search
    const faqMatch = findRelevantFAQ(userMessage);
    if (faqMatch) {
      let response = faqMatch.answer;

      // Add real-time update if available
      const realtimeUpdate = getRealTimeUpdate(intent);
      if (realtimeUpdate) {
        response += "\n\n" + realtimeUpdate;
      }

      return response;
    }

    // If no FAQ match, provide a more helpful default response based on intent
    const realtimeUpdate = getRealTimeUpdate(intent);
    return realtimeUpdate || 
      "I understand you're asking about the Kumbh Mela. To help you better, you can ask about:\n" +
      "- Locations and directions\n" +
      "- Event schedules and timings\n" +
      "- Facilities and accommodations\n" +
      "- Emergency services\n" +
      "- Current crowd levels\n\n" +
      "Could you please be more specific about what you'd like to know?";
  } catch (error) {
    console.error("Chat error:", error);
    return "I apologize, but I'm having trouble understanding. Could you please rephrase your question about the Kumbh Mela?";
  }
}