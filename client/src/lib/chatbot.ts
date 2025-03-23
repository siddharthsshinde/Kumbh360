import type { ChatMessage, KumbhFAQItem, ChatResponse } from "@shared/types";
// Import the JSON data with type assertion
import kumbhDataRaw from "../../../attached_assets/kumbh_mela_main.json";

// Define type for the imported JSON data
interface KumbhData {
  questions: Array<{
    question: string;
    answer: string;
  }>;
  crowdUpdates?: any[];
  // Add other properties as needed
}

// Assert the correct type
const kumbhData = kumbhDataRaw as KumbhData;
import { TFIDF, tokenize, removeStopwords } from "./nlp";
import { embeddingsManager, ConversationState } from "./embeddings";
import { getGeminiResponse } from "./gemini";

// Define type for intent data
interface IntentData {
  patterns: string[];
  description: string;
}

// Define type for intents object
interface Intents {
  [key: string]: IntentData;
}

// Enhanced intents with description patterns for use with embeddings
const intents: Intents = {
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
  transportation: {
    patterns: [
      'reach', 'travel', 'transport', 'how to get', 'how to reach', 'bus', 'train', 'flight', 'car', 'taxi', 'shuttle', 
      'airport', 'station', 'road', 'drive', 'parking', 'vehicle', 'route', 'navigate', 'directions to', 'travel to', 
      'get to', 'reach nashik', 'travel nashik', 'कैसे पहुंचें', 'यात्रा', 'परिवहन'
    ],
    description: "Questions about transportation, how to reach Kumbh Mela, travel options to and from Nashik"
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

// Add canonical question mappings for common variations
// This helps direct question variations to their official versions
const questionVariations: Record<string, string[]> = {
  "Where is CBS (Central Bus Stand) in Nashik?": [
    "where is cbs",
    "cbs location",
    "central bus stand location",
    "where can i find cbs",
    "how to reach cbs",
    "where is the central bus stand",
    "cbs nashik",
    "central bus stand nashik",
    "bus stand location"
  ],
  "How crowded does it get during Kumbh Mela?": [
    "how crowded is nashik currently",
    "how crowded is nashik",
    "current crowd level",
    "crowd status",
    "is it crowded now",
    "crowd situation nashik",
    "is nashik crowded",
    "crowding in nashik",
    "crowd density"
  ],
  "How can I reach Nashik for Kumbh Mela?": [
    "where is nashik road",
    "nashik road location",
    "how to get to nashik road",
    "directions to nashik road",
    "nashik road railway station",
    "where is the railway station",
    "train station location",
    "nashik road station"
  ]
};

// Create a quick lookup map for variations
let variationMap = new Map<string, string>();
Object.entries(questionVariations).forEach(([canonicalQuestion, variations]) => {
  variations.forEach(variation => {
    variationMap.set(variation.toLowerCase().trim(), canonicalQuestion);
  });
});

// Debug log the data length
console.log(`Loaded ${faqData.length} FAQ items from kumbh_mela_main.json`);
console.log(`Added ${Object.values(questionVariations).flat().length} question variations for better matching`);

// Log the first few items to verify content
console.log("First 3 FAQ items:", faqData.slice(0, 3));

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
  "How to get emergency help?",
  "How can I reach Nashik Kumbh for Kumbh Mela?",
  "How to reach Nashik for Kumbh Mela?",
  "What transportation options are available to Nashik?"
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
  transportation: [
    "Would you like to know about bus services to Nashik?",
    "Do you need information about train schedules to Nashik?",
    "Would you like to know about parking facilities at Kumbh Mela?",
    "Shall I tell you about the shuttle services available within Nashik during Kumbh Mela?"
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
 * Find intent using a hybrid approach - first direct pattern matching, then embeddings, then tokens
 */
async function findIntentWithEmbeddings(message: string): Promise<string> {
  try {
    // First try exact pattern matching for common questions (fastest)
    const lowerMessage = message.toLowerCase().trim();
    
    // Direct pattern matching for common queries about Kumbh Mela
    if (lowerMessage.includes("what is kumbh") || 
        lowerMessage.includes("what is the kumbh") || 
        lowerMessage.includes("kumbh mela is") || 
        lowerMessage.includes("about kumbh mela")) {
      return "general";
    }
    
    // Check other direct matches for known intents
    for (const [intentName, data] of Object.entries(intents)) {
      for (const pattern of data.patterns) {
        if (lowerMessage.includes(pattern.toLowerCase())) {
          return intentName;
        }
      }
    }
    
    // Second, try with less processing-heavy token matching
    const tokenBasedIntent = findIntentWithTokens(message);
    if (tokenBasedIntent !== "general") {
      return tokenBasedIntent;
    }
    
    // Only use embeddings for more complex queries that weren't matched above
    const intentDescriptions = Object.entries(intents).map(([name, data]) => ({
      name,
      description: data.description
    }));
    
    try {
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
    } catch (embeddingError) {
      console.log('Skipping embeddings due to error:', embeddingError);
      // Continue with token-based approach
    }
    
    // Fallback to token-based result
    return tokenBasedIntent;
  } catch (error) {
    console.error('Error in intent recognition:', error);
    // Ultimate fallback to token-based approach
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
 * Enhanced FAQ matching using a faster, optimized approach
 */
async function findRelevantFAQWithEmbeddings(query: string): Promise<KumbhFAQItem | null> {
  try {
    // First try direct matching for common questions (fastest)
    const lowerQuery = query.toLowerCase().trim();
    
    // Check if this is a known variation of a canonical question
    // This is the fastest way to match common alternative phrasings
    if (variationMap.has(lowerQuery)) {
      const canonicalQuestion = variationMap.get(lowerQuery);
      console.log(`Found direct variation match: "${lowerQuery}" maps to "${canonicalQuestion}"`);
      
      // Find the canonical question in the FAQ data
      const faqMatch = faqData.find(item => item.question === canonicalQuestion);
      if (faqMatch) {
        return faqMatch;
      }
    }
    
    // For partial matches, check if the query is a substring of any variation
    for (const [variation, canonicalQuestion] of variationMap.entries()) {
      if (lowerQuery.includes(variation) || variation.includes(lowerQuery)) {
        console.log(`Found partial variation match: "${lowerQuery}" matches pattern "${variation}" for "${canonicalQuestion}"`);
        
        // Find the canonical question in the FAQ data
        const faqMatch = faqData.find(item => item.question === canonicalQuestion);
        if (faqMatch) {
          return faqMatch;
        }
      }
    }
    
    // Direct lookup for "What is Kumbh Mela?" type questions
    if (lowerQuery.includes("what is kumbh") || 
        lowerQuery.includes("what is the kumbh") ||
        lowerQuery.includes("about kumbh mela") ||
        lowerQuery.includes("kumbh festival") ||
        lowerQuery.includes("kumbh pilgrimage")) {
      
      // Find the exact match or similar in the FAQ data
      for (let i = 0; i < faqData.length; i++) {
        const question = faqData[i].question.toLowerCase();
        if (question.includes("what is kumbh")) {
          return faqData[i];
        }
      }
    }
    
    // Special handling for transportation questions
    if (lowerQuery.includes("how can i reach") || 
        lowerQuery.includes("how to reach") || 
        lowerQuery.includes("reach nashik") ||
        lowerQuery.includes("get to nashik") ||
        lowerQuery.includes("travel to nashik") ||
        lowerQuery.includes("transportation") ||
        lowerQuery.includes("reaching kumbh")) {
      
      // Look for transportation-specific FAQs
      for (let i = 0; i < faqData.length; i++) {
        const question = faqData[i].question.toLowerCase();
        if (question.includes("reach nashik") || 
            question.includes("how can i reach") || 
            question.includes("how to reach")) {
          console.log("Found transportation FAQ match:", faqData[i].question);
          return faqData[i];
        }
      }
    }
    
    // For other common questions, try semantic matching by tokenizing
    // This is faster than full embeddings
    const queryTokens = new Set(tokenize(lowerQuery).map(t => t.toLowerCase()));
    
    // Add additional tokens from query - synonyms and related terms
    // This helps match questions with different phrasing
    const synonymMap: Record<string, string[]> = {
      'what': ['tell', 'explain', 'describe', 'information', 'info', 'details', 'know'],
      'when': ['time', 'date', 'schedule', 'during', 'timing', 'hour'],
      'where': ['location', 'place', 'spot', 'site', 'venue', 'area', 'located'],
      'how': ['way', 'method', 'process', 'procedure', 'manner', 'means'],
      'reach': ['get to', 'travel to', 'arrive at', 'go to', 'visit', 'commute', 'access'],
      'nashik': ['nasik', 'nashikm', 'nasika', 'nasick'],
      'kumbh': ['kumb', 'kumbha', 'kumbhamela', 'kumba', 'festival', 'mela', 'event'],
      'find': ['locate', 'discover', 'search', 'spot', 'identify', 'see'],
      'temple': ['mandir', 'shrine', 'place of worship', 'sacred place', 'holy site'],
      'stay': ['accommodation', 'hotel', 'lodging', 'place to stay', 'residence', 'living'],
      'food': ['eat', 'meal', 'restaurant', 'cuisine', 'dining', 'eatery', 'catering'],
    };
    
    // Expand the query tokens with synonyms
    const expandedQueryTokens = new Set(queryTokens);
    queryTokens.forEach(token => {
      const synonyms = synonymMap[token] || [];
      synonyms.forEach(synonym => expandedQueryTokens.add(synonym));
    });
    
    const matches: {index: number, score: number}[] = [];
    
    for (let i = 0; i < faqData.length; i++) {
      const faqTokens = new Set(tokenize(faqData[i].question.toLowerCase()).map(t => t.toLowerCase()));
      
      // Expand FAQ tokens with synonyms as well
      const expandedFaqTokens = new Set(faqTokens);
      faqTokens.forEach(token => {
        const synonyms = synonymMap[token] || [];
        synonyms.forEach(synonym => expandedFaqTokens.add(synonym));
      });
      
      // Calculate overlap score considering both original and expanded tokens
      const directOverlap = Array.from(queryTokens).filter(token => faqTokens.has(token)).length;
      const expandedOverlap = Array.from(expandedQueryTokens).filter(token => expandedFaqTokens.has(token)).length;
      
      // Combined score - weigh direct matches more heavily
      const overlapScore = (directOverlap * 1.5 + expandedOverlap) / (queryTokens.size + expandedQueryTokens.size);
      
      if (overlapScore > 0.3) { // Lower threshold for better matching
        matches.push({index: i, score: overlapScore});
      }
    }
    
    // Sort matches by score (highest first)
    matches.sort((a, b) => b.score - a.score);
    
    // If we have a good match, return it
    if (matches.length > 0 && matches[0].score > 0.4) {
      console.log("Found token match with score:", matches[0].score, "for question:", faqData[matches[0].index].question);
      return faqData[matches[0].index];
    }
    
    // If still no match, try with TFIDF (faster than embeddings)
    const tfidfMatch = findRelevantFAQWithTFIDF(query);
    if (tfidfMatch) {
      return tfidfMatch;
    }
    
    // Reduce the threshold to find more potential matches for transportation questions
    if (lowerQuery.includes("reach") || 
        lowerQuery.includes("travel") || 
        lowerQuery.includes("get to") ||
        lowerQuery.includes("transport")) {
      // Use TFIDF with lower threshold for transportation questions
      const similarDocs = tfidf.findSimilarDocuments(query, 5);
      
      for (const doc of similarDocs) {
        if (doc.score > 0.1) {  // Lower threshold
          const faqText = faqData[doc.index].question.toLowerCase();
          if (faqText.includes("reach") || faqText.includes("nashik") || faqText.includes("how can")) {
            console.log("Found transportation match via lower threshold TFIDF:", faqData[doc.index].question);
            return faqData[doc.index];
          }
        }
      }
    }
    
    // As a last resort, use embeddings for complex queries
    try {
      // Try using embeddings with a lower threshold to catch more similar questions
      const results = await embeddingsManager.findMostSimilar(
        query,
        faqData.map(item => item.question),
        0.3 // Lower threshold to catch more semantic variations
      );
      
      if (results) {
        // Find the FAQ that matches
        const faqIndex = faqData.findIndex(item => item.question === results.text);
        if (faqIndex >= 0) {
          console.log("Found match via embeddings with score:", results.score, "for question:", faqData[faqIndex].question);
          return faqData[faqIndex];
        }
      }
      
      // If still no match at 0.3 threshold, try with an even lower threshold as a fallback
      if (!results) {
        const fallbackResults = await embeddingsManager.findMostSimilar(
          query,
          faqData.map(item => item.question),
          0.2 // Very low threshold as last resort
        );
        
        if (fallbackResults) {
          const faqIndex = faqData.findIndex(item => item.question === fallbackResults.text);
          if (faqIndex >= 0) {
            console.log("Found match via embeddings last resort with score:", fallbackResults.score, "for question:", faqData[faqIndex].question);
            return faqData[faqIndex];
          }
        }
      }
    } catch (embeddingError) {
      console.log('Skipping embeddings for FAQ matching due to error:', embeddingError);
      // Continue with TFIDF approach (already tried above)
    }
    
    // No match found
    return null;
  } catch (error) {
    console.error('Error in FAQ matching:', error);
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
  // Lower threshold to 0.15 to catch more variations
  const matchThreshold = 0.15;
  if (bestMatch.score > matchThreshold) {
    console.log("Found TFIDF match with score:", bestMatch.score, "for question:", faqData[bestMatch.index].question);
    return faqData[bestMatch.index];
  }
  return null;
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
    
    // Special handling for transportation questions
    if (intent === 'transportation') {
      console.log("Detected transportation intent, looking for direct matches in FAQ data");
      
      // First try a direct lookup of the exact question "How can I reach Nashik Kumbh for Kumbh Mela?"
      const exactQuestion = "How can I reach Nashik Kumbh for Kumbh Mela?";
      const directMatch = faqData.find(item => item.question.toLowerCase() === exactQuestion.toLowerCase());
      
      if (directMatch) {
        console.log("Found exact match for transportation question:", directMatch.question);
        let response = directMatch.answer;
        
        // Add follow-up specific to transportation
        const followUp = getFollowUpSuggestions('transportation', state);
        response += "\n\n" + followUp;
        
        // Update state with the answer
        embeddingsManager.updateConversationState(SESSION_ID, {
          lastAnswer: response
        });
  
        return response;
      }
      
      // If no direct match, try semantic search
      const faqMatch = await findRelevantFAQWithEmbeddings(userMessage);
      if (faqMatch && faqMatch.answer) {
        console.log("Found transportation FAQ match, using that instead of RAG");
        let response = faqMatch.answer;
        
        // Add follow-up specific to transportation
        const followUp = getFollowUpSuggestions('transportation', state);
        response += "\n\n" + followUp;
        
        // Update state with the answer
        embeddingsManager.updateConversationState(SESSION_ID, {
          lastAnswer: response
        });
  
        return response;
      }
      
      // If we still don't have a match, hardcode the response for this specific query
      if (userMessage.toLowerCase().includes("how can i reach") && 
          userMessage.toLowerCase().includes("nashik") && 
          userMessage.toLowerCase().includes("kumbh")) {
        
        console.log("Using hardcoded response for transportation question");
        const hardcodedResponse = "You can reach Nashik by air, rail, or road. The nearest airport is Nashik Airport, and trains connect from major cities.";
        
        // Add follow-up specific to transportation
        const followUp = getFollowUpSuggestions('transportation', state);
        const response = hardcodedResponse + "\n\n" + followUp;
        
        // Update state with the answer
        embeddingsManager.updateConversationState(SESSION_ID, {
          lastAnswer: response
        });
  
        return response;
      }
    }
    
    // For simple factual questions, try a quick local FAQ match first
    if (intent === 'faqs' || intent === 'general' || intent === 'events' || intent === 'religious') {
      const faqMatch = await findRelevantFAQWithEmbeddings(userMessage);
      
      if (faqMatch && faqMatch.answer) {
        console.log("Found direct FAQ match, using that instead of RAG");
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
    }
    
    // For real-time information, prioritize local data over RAG
    if (intent === 'crowd_levels' || intent === 'weather' || intent === 'emergency') {
      const realtimeUpdate = getRealTimeUpdate(intent, state);
      
      if (realtimeUpdate) {
        console.log("Using real-time data for response");
        const followUp = getFollowUpSuggestions(intent, state);
        const response = realtimeUpdate + (state.turnCount > 0 ? "\n\n" + followUp : "");
        
        // Update state with the answer
        embeddingsManager.updateConversationState(SESSION_ID, {
          lastAnswer: response
        });
        
        return response;
      }
    }

    // For more complex or contextual questions, use our RAG backend
    console.log("Using backend RAG service for response");
    
    // Add metadata about the detected intent and conversation state
    const messagesWithMetadata = messages.map((msg, index) => {
      if (index === messages.length - 1) {
        // Add metadata to the last message (user query)
        return {
          ...msg,
          metadata: {
            intent: intent,
            context: state.recentTopics.size > 0 ? Array.from(state.recentTopics).join(', ') : undefined,
            turnCount: state.turnCount
          }
        };
      }
      return msg;
    });
    
    // Use the Gemini API through our RAG backend
    const response = await getGeminiResponse(messagesWithMetadata);
    
    // Update conversation state with the response
    embeddingsManager.updateConversationState(SESSION_ID, {
      lastAnswer: response
    });
    
    return response;
  } catch (error: any) {
    console.error("Chat error:", error);
    
    // Provide a fallback response based on intent if available
    if (error.message && error.message.includes("API key")) {
      return "I apologize, but the Gemini API is not configured properly. Please contact the system administrator.";
    }
    
    return "I apologize, but I'm having trouble understanding. Could you please rephrase your question about the Kumbh Mela?";
  }
}