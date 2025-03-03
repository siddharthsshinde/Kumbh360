import type { ChatMessage, KumbhFAQItem, ChatResponse } from "@shared/types";
import kumbhData from "../../../attached_assets/kumbh_mela_advanced_dataset.json";

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

// Initialize FAQ data
const faqData: KumbhFAQItem[] = kumbhData.kumbh_mela.faq;

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

  // Add matching FAQ questions
  suggestions.push(
    ...faqData
      .filter(item => 
        item.question.toLowerCase().includes(normalizedInput) ||
        item.tags?.some(tag => tag.toLowerCase().includes(normalizedInput))
      )
      .map(item => item.question)
  );

  // Remove duplicates and limit to 5 suggestions
  return Array.from(new Set(suggestions))
    .slice(0, 5)
    .filter(suggestion => suggestion.toLowerCase() !== normalizedInput);
}

function findIntent(message: string): string {
  const lowercaseMsg = message.toLowerCase();

  for (const [intent, patterns] of Object.entries(intents)) {
    if (patterns.some(pattern => lowercaseMsg.includes(pattern))) {
      return intent;
    }
  }

  return 'general';
}

function findRelevantFAQ(query: string): KumbhFAQItem | null {
  const lowercaseQuery = query.toLowerCase();
  const words = lowercaseQuery.split(/\s+/);

  // Score-based matching
  const matchingFAQs = faqData.map(item => {
    let score = 0;

    // Check question match
    const questionWords = item.question.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (questionWords.includes(word)) score += 2;
    });

    // Check tag match
    if (item.tags) {
      words.forEach(word => {
        if (item.tags!.some(tag => tag.toLowerCase().includes(word))) score += 1;
      });
    }

    return { item, score };
  });

  // Sort by score and get the best match
  const bestMatch = matchingFAQs.sort((a, b) => b.score - a.score)[0];
  return bestMatch.score > 0 ? bestMatch.item : null;
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

    // First, try to find a relevant FAQ
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