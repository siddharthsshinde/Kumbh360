import type { ChatMessage, KumbhFAQItem, ChatResponse } from "@shared/types";
import kumbhData from "../../../attached_assets/kumbh_mela main .json";
import { TFIDF, tokenize, removeStopwords } from "./nlp";
import { embeddingsManager, ConversationState } from "./embeddings";

// Enhanced intents with description patterns for use with embeddings
const intents = {
  greetings: {
    patterns: [
      'hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'नमस्कार', 'welcome', 'greet'
    ],
    description: "Greeting messages and welcome phrases"
  },
  locations: {
    patterns: [
      'where', 'location', 'place', 'directions', 'कहाँ', 'स्थान', 'कुठे', 'ramkund', 'tapovan', 'temple', 'ghat'
    ],
    description: "Questions about locations, navigation, places and directions"
  },
  facilities: {
    patterns: [
      'facilities', 'services', 'accommodation', 'food', 'stay', 'hotel', 'restaurant', 'सुविधाएं', 'सेवाएं', 'सुविधा'
    ],
    description: "Questions about available facilities, services, places to stay or eat"
  },
  emergency: {
    patterns: [
      'emergency', 'help', 'medical', 'police', 'hospital', 'doctor', 'ambulance', 'आपातकालीन', 'मदद', 'तातडीची'
    ],
    description: "Emergency situations, medical help, safety concerns or urgent assistance"
  },
  schedule: {
    patterns: [
      'schedule', 'time', 'when', 'date', 'program', 'कार्यक्रम', 'समय', 'कधी', 'shahi snan', 'holy dip', 'bath'
    ],
    description: "Questions about event timing, schedules, dates and programs"
  },
  crowd: {
    patterns: [
      'crowd', 'busy', 'rush', 'people', 'भीड़', 'गर्दी', 'overcrowded', 'safe', 'safety', 'tapovan'
    ],
    description: "Questions about crowd levels, busy times, congestion and safety"
  },
  general: {
    patterns: [
      'what', 'how', 'why', 'explain', 'tell', 'information', 'details'
    ],
    description: "General information about Kumbh Mela, its significance and traditions"
  }
};

// Initialize FAQ data - convert from the available format
// The data structure comes from questions array rather than kumbh_mela.faq
const faqData: KumbhFAQItem[] = kumbhData.questions.map(item => ({
  question: item.question,
  answer: item.answer,
  category: 'general'
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

// Generate follow-up questions based on intent
const followUpQuestions: Record<string, string[]> = {
  greetings: [
    "Would you like to know about the main events of Kumbh Mela?",
    "Can I help you plan your visit to the Kumbh Mela?",
    "Do you need information about transportation options?"
  ],
  locations: [
    "Would you like directions to get there?",
    "Do you need information about the facilities available at this location?",
    "Shall I tell you about the current crowd levels at this spot?"
  ],
  facilities: [
    "Would you like to know about accommodation options?",
    "Do you need information about food services?",
    "Shall I tell you about the restroom facilities available?"
  ],
  emergency: [
    "Do you need the contact numbers for emergency services?",
    "Would you like to know the locations of medical camps?",
    "Shall I guide you to the nearest help desk?"
  ],
  schedule: [
    "Would you like to know about upcoming special events?",
    "Do you need the schedule for today's ceremonies?",
    "Shall I tell you about the best times to visit certain locations?"
  ],
  crowd: [
    "Would you like real-time updates on crowd density?",
    "Do you need advice on avoiding crowded areas?",
    "Shall I suggest the best times to visit popular spots?"
  ],
  general: [
    "Would you like to know more about the history of Kumbh Mela?",
    "Do you have questions about specific rituals?",
    "Shall I explain the religious significance of the event?"
  ]
};

// Unique ID to track the current conversation
const SESSION_ID = 'default-session';

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
    const similarDocs = tfidf.findSimilarDocuments(input, 3);
    suggestions.push(
      ...similarDocs.map(item => faqData[item.index].question)
    );
  }

  // Add context-based suggestions from conversation state
  const state = embeddingsManager.getConversationState(SESSION_ID);
  if (state.lastIntent && state.turnCount > 0) {
    const contextSuggestions = followUpQuestions[state.lastIntent] || [];
    suggestions.push(...contextSuggestions);
  }

  // Remove duplicates and limit to 5 suggestions
  return Array.from(new Set(suggestions))
    .slice(0, 5)
    .filter(suggestion => suggestion.toLowerCase() !== normalizedInput);
}

/**
 * Find intent using embeddings for semantic matching
 */
async function findIntentWithEmbeddings(message: string): Promise<string> {
  try {
    // First try with embeddings if model is loaded
    const intentDescriptions = Object.entries(intents).map(([name, data]) => ({
      name,
      description: data.description
    }));
    
    // Use embeddings manager to find semantic similarity
    const results = await embeddingsManager.findMostSimilar(
      message,
      intentDescriptions.map(item => item.description),
      0.4 // Threshold
    );
    
    if (results) {
      // Find index of matching description
      const index = intentDescriptions.findIndex(
        item => item.description === results.text
      );
      if (index >= 0) {
        return intentDescriptions[index].name;
      }
    }
    
    // Fallback to token-based matching if embeddings don't work
    return findIntentWithTokens(message);
  } catch (error) {
    console.error('Error using embeddings for intent recognition:', error);
    // Fallback to token-based approach
    return findIntentWithTokens(message);
  }
}

/**
 * Traditional token-based intent matching as fallback
 */
function findIntentWithTokens(message: string): string {
  const lowercaseMsg = message.toLowerCase();
  const messageTokens = new Set(removeStopwords(tokenize(message)));

  let bestIntent = 'general';
  let maxOverlap = 0;

  for (const [intent, data] of Object.entries(intents)) {
    const patternTokens = new Set(data.patterns.flatMap(p => removeStopwords(tokenize(p))));
    const overlap = Array.from(messageTokens).filter(token => patternTokens.has(token)).length;

    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

/**
 * Enhanced FAQ matching using embeddings when possible
 */
async function findRelevantFAQWithEmbeddings(query: string): Promise<KumbhFAQItem | null> {
  try {
    // Try using embeddings first
    const results = await embeddingsManager.findMostSimilar(
      query,
      faqData.map(item => item.question),
      0.5 // Higher threshold for more accurate FAQ matching
    );
    
    if (results) {
      // Find the FAQ that matches
      const faqIndex = faqData.findIndex(item => item.question === results.text);
      if (faqIndex >= 0) {
        return faqData[faqIndex];
      }
    }
    
    // Fall back to TFIDF if embeddings don't find a good match
    return findRelevantFAQWithTFIDF(query);
  } catch (error) {
    console.error('Error using embeddings for FAQ matching:', error);
    // Fallback to TFIDF
    return findRelevantFAQWithTFIDF(query);
  }
}

/**
 * Traditional TFIDF-based FAQ matching as fallback
 */
function findRelevantFAQWithTFIDF(query: string): KumbhFAQItem | null {
  // Use TFIDF to find the most relevant FAQ
  const similarDocs = tfidf.findSimilarDocuments(query, 1);
  if (similarDocs.length === 0) return null;

  const bestMatch = similarDocs[0];
  
  // Only return if similarity is above threshold
  return bestMatch.score > 0.2 ? faqData[bestMatch.index] : null;
}

/**
 * Get real-time updates with context awareness
 */
function getRealTimeUpdate(intent: string, state: ConversationState): string | null {
  // Use conversation context to provide more personalized updates
  const recentIntents = new Set(state.intentHistory);
  
  // Simulate real-time updates for certain intents
  switch (intent) {
    case 'crowd':
      // More specific if they previously asked about locations
      if (recentIntents.has('locations')) {
        return "⚠️ REAL-TIME UPDATE: For the locations you asked about earlier, Tapovan area is currently experiencing high crowd density (80% capacity), while Ramkund is at moderate levels (50%). Consider visiting Ramkund first.";
      }
      return "⚠️ REAL-TIME UPDATE: Tapovan area is currently experiencing high crowd density. Consider visiting during early morning hours. If visiting with children, please hold their hands firmly.";
    
    case 'emergency':
      // More specific if they previously asked about facilities
      if (recentIntents.has('facilities')) {
        return "🚨 EMERGENCY SERVICES: All medical camps near the facilities you asked about are currently operational. The nearest medical camp to Ramkund is at Civil Hospital (500m). For immediate help, call our 24x7 helpline at 108.";
      }
      return "🚨 EMERGENCY SERVICES: All medical camps and police stations are currently operational. Nearest medical camp to Ramkund is at Civil Hospital (500m).";
    
    case 'schedule':
      // Provide updates about schedule changes if they asked about schedule
      return "📅 SCHEDULE UPDATE: Today's evening Ganga Aarti has been rescheduled from 7:00 PM to 7:30 PM due to the special puja ceremony. All other events remain on schedule.";
      
    default:
      return null;
  }
}

/**
 * Generate context-aware follow-up suggestions
 */
function getFollowUpSuggestions(intent: string, state: ConversationState): string {
  // Choose a follow-up question based on conversation context
  const options = followUpQuestions[intent] || followUpQuestions.general;
  
  // Use turn count to select different suggestions as conversation progresses
  const index = Math.min(state.turnCount % options.length, options.length - 1);
  
  return options[index];
}

/**
 * Main chat response function with context awareness
 */
export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const userMessage = messages[messages.length - 1].content;
    
    // Get conversation state
    const state = embeddingsManager.getConversationState(SESSION_ID);
    
    // Find intent using enhanced recognition
    const intent = await findIntentWithEmbeddings(userMessage);
    
    // Update state with current message info
    embeddingsManager.updateConversationState(SESSION_ID, {
      lastIntent: intent,
      lastQuestion: userMessage
    });
    
    // Find FAQ match with enhanced recognition
    const faqMatch = await findRelevantFAQWithEmbeddings(userMessage);
    
    if (faqMatch) {
      let response = faqMatch.answer;

      // Add real-time update if available
      const realtimeUpdate = getRealTimeUpdate(intent, state);
      if (realtimeUpdate) {
        response += "\n\n" + realtimeUpdate;
      }
      
      // Only add follow-up if we're a few turns into the conversation
      if (state.turnCount > 1) {
        const followUp = getFollowUpSuggestions(intent, state);
        response += "\n\n" + followUp;
      }
      
      // Update state with the answer
      embeddingsManager.updateConversationState(SESSION_ID, {
        lastAnswer: response
      });

      return response;
    }

    // If no FAQ match, provide a helpful response based on intent and context
    const realtimeUpdate = getRealTimeUpdate(intent, state);
    const followUp = getFollowUpSuggestions(intent, state);
    
    let response = realtimeUpdate || 
      "I understand you're asking about " + intents[intent].description + ". " +
      "To help you better, you can ask about:\n" +
      "- Locations and directions\n" +
      "- Event schedules and timings\n" +
      "- Facilities and accommodations\n" +
      "- Emergency services\n" +
      "- Current crowd levels\n\n" +
      "Could you please be more specific about what you'd like to know?";
    
    // Add follow-up suggestion
    if (state.turnCount > 0) {
      response += "\n\n" + followUp;
    }
    
    // Update state with the answer
    embeddingsManager.updateConversationState(SESSION_ID, {
      lastAnswer: response
    });
    
    return response;
  } catch (error) {
    console.error("Chat error:", error);
    return "I apologize, but I'm having trouble understanding. Could you please rephrase your question about the Kumbh Mela?";
  }
}