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

// New function to get suggestions based on user input
export function getSuggestions(input: string): string[] {
  if (!input.trim()) return [];

  const lowercaseInput = input.toLowerCase();
  const suggestions: string[] = [];

  // Check for matches in FAQ questions
  faqData.forEach(item => {
    if (item.question.toLowerCase().includes(lowercaseInput) && 
        !suggestions.includes(item.question)) {
      suggestions.push(item.question);
    }
  });

  // Add intent-based suggestions
  Object.entries(intents).forEach(([intent, patterns]) => {
    if (patterns.some(pattern => lowercaseInput.includes(pattern))) {
      switch (intent) {
        case 'locations':
          suggestions.push("Where is Ramkund located?", "How to reach Tapovan?");
          break;
        case 'facilities':
          suggestions.push("What facilities are available for elderly pilgrims?");
          break;
        case 'emergency':
          suggestions.push("Where is the nearest medical facility?");
          break;
        case 'schedule':
          suggestions.push("When is the next Shahi Snan?");
          break;
        case 'crowd':
          suggestions.push("What is the current crowd status at Ramkund?");
          break;
      }
    }
  });

  // Return top 5 unique suggestions
  return [...new Set(suggestions)].slice(0, 5);
}

// Existing functions remain unchanged
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

  return faqData.find(item => 
    item.question.toLowerCase().includes(lowercaseQuery) ||
    item.tags?.some(tag => lowercaseQuery.includes(tag.toLowerCase()))
  ) || null;
}

function getRealTimeUpdate(intent: string): string | null {
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

    const faqMatch = findRelevantFAQ(userMessage);
    if (faqMatch) {
      let response = faqMatch.answer;

      const realtimeUpdate = getRealTimeUpdate(intent);
      if (realtimeUpdate) {
        response += "\n\n" + realtimeUpdate;
      }

      return response;
    }

    const realtimeUpdate = getRealTimeUpdate(intent);
    return realtimeUpdate || "I understand you're asking about the Kumbh Mela. Could you please be more specific about what you'd like to know? I can help you with information about locations, schedules, facilities, or emergency services.";
  } catch (error) {
    console.error("Chat error:", error);
    return "I apologize, but I'm having trouble understanding. Could you please rephrase your question about the Kumbh Mela?";
  }
}