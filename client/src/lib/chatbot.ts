import type { ChatMessage, KumbhFAQItem, ChatResponse } from "@shared/types";
import kumbhData from "../../../attached_assets/kumbh_mela_advanced_dataset.json";

// Define intents and their patterns
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

  // Simple keyword matching for now
  return faqData.find(item => 
    item.question.toLowerCase().includes(lowercaseQuery) ||
    item.tags?.some(tag => lowercaseQuery.includes(tag.toLowerCase()))
  ) || null;
}

// New function to generate contextual suggestions
export async function getSuggestions(messages: ChatMessage[]): Promise<string[]> {
  const lastMessage = messages[messages.length - 1];
  const currentIntent = findIntent(lastMessage.content);

  // Common suggestions for each intent
  const suggestionMap: { [key: string]: string[] } = {
    greetings: [
      "When is the next Shahi Snan?",
      "Show me nearby facilities",
      "What are the main locations?",
      "Current crowd levels"
    ],
    locations: [
      "Where is Ramkund located?",
      "How to reach Tapovan?",
      "Nearest medical facilities",
      "Show me important temples"
    ],
    facilities: [
      "Where can I find accommodation?",
      "Nearest restrooms",
      "Food facilities nearby",
      "Emergency services location"
    ],
    emergency: [
      "Contact nearest medical help",
      "Police station locations",
      "Emergency helpline numbers",
      "First aid centers"
    ],
    schedule: [
      "Next important event",
      "Shahi Snan schedule",
      "Today's programs",
      "Aarti timings"
    ],
    crowd: [
      "Current crowd at Ramkund",
      "Safe routes to take",
      "Less crowded areas",
      "Best time to visit"
    ],
    general: [
      "Tell me about Kumbh Mela",
      "Important locations",
      "Emergency contacts",
      "Today's events"
    ]
  };

  return suggestionMap[currentIntent] || suggestionMap.general;
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

    // If no FAQ match, use intent-based responses
    const realtimeUpdate = getRealTimeUpdate(intent);
    return realtimeUpdate || "I understand you're asking about the Kumbh Mela. Could you please be more specific about what you'd like to know? I can help you with information about locations, schedules, facilities, or emergency services.";
  } catch (error) {
    console.error("Chat error:", error);
    return "I apologize, but I'm having trouble understanding. Could you please rephrase your question about the Kumbh Mela?";
  }
}