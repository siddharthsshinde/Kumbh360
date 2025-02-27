import type { ChatMessage } from "@shared/types";

interface ChatResponse {
  content: string;
  links?: {
    type: 'location' | 'emergency' | 'facility';
    id: number;
  }[];
}

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
    'crowd', 'busy', 'rush', 'people', 'भीड़', 'गर्दी', 'overcrowded', 'safe', 'safety'
  ],
  about: [
    'what', 'about', 'tell', 'explain', 'information', 'कुंभ', 'मेला', 'कुंभमेळा', 'meaning'
  ]
};

// Define responses for each intent
const responses: Record<string, string[]> = {
  greetings: [
    "Namaste! Welcome to Nashik Kumbh Mela 2025! I'm here to help you with information about the event, locations, facilities, and services.",
    "Welcome to the sacred Kumbh Mela! How may I assist you with your pilgrimage to Nashik?",
    "Greetings! I can help you with directions, schedules, and information about the Kumbh Mela. What would you like to know?"
  ],
  locations: [
    "The main sacred locations in Nashik Kumbh Mela are:\n- Ramkund: The most sacred bathing ghat on the Godavari River\n- Tapovan: Ancient meditation site of Lord Rama\n- Kalaram Temple: Historic temple in Panchavati\n- Godavari Ghat: Primary location for holy dips\nWhich place would you like to know more about?",
    "The Kumbh Mela is centered around Ramkund in the Panchavati area. Other key sites include Tapovan, Kalaram Temple, and various ghats along the Godavari River. I can show these locations on the map.",
    "You'll find most religious activities around Ramkund and Panchavati area. The main bathing ghats are along the Godavari River. Would you like directions to any specific location?"
  ],
  facilities: [
    "We have various facilities for pilgrims:\n- Hotels and dharamshalas near Panchavati\n- 24/7 medical centers\n- Food and water stations\n- Mobile toilets and restrooms\n- Information kiosks\nWhat specific facility do you need?",
    "Accommodation options range from luxury hotels to affordable dharamshalas. Food services are available throughout the mela area. Medical facilities are operational 24/7. Which facility would you like to know more about?",
    "There are numerous facilities including rest areas, medical centers, lost-and-found centers, and emergency services. The map shows all nearby facilities. What are you looking for?"
  ],
  emergency: [
    "For emergencies:\n- Medical: Call 108 (Ambulance)\n- Police: Call 100\n- Fire: Call 101\n- Disaster Management: 1078\nThe nearest medical center is at Civil Hospital, Nashik.",
    "Emergency services are available 24/7. Medical camps are located at key points throughout the mela area. Police assistance booths are stationed at every major intersection.",
    "Don't worry, help is always nearby. Emergency response teams are stationed throughout the mela area. Should I show you the nearest emergency facility on the map?"
  ],
  schedule: [
    "Key dates for Kumbh Mela 2025:\n- Main Shahi Snan (Royal Bath): [Date]\n- Panchami Snan: [Date]\n- Daily aarti at Ramkund: 6:00 AM and 7:00 PM\nWhich schedule would you like to know more about?",
    "The Kumbh Mela in Nashik spans from [start date] to [end date]. The most auspicious bath dates are [dates]. Regular ceremonies happen daily at Ramkund.",
    "There are three main Shahi Snans (Royal Baths) during the Kumbh Mela. The next major snan is scheduled for [date]. Daily rituals begin at sunrise."
  ],
  crowd: [
    "Current crowd levels are monitored in real-time. Ramkund area shows moderate crowding. You can check the crowd indicators on our map for different locations.",
    "The crowd monitoring system shows live updates. Currently: Ramkund (Level 3/5), Kalaram Temple (Level 2/5), Tapovan (Level 1/5). Best to visit early morning for smaller crowds.",
    "I can help you plan your visit based on crowd levels. Early mornings and late evenings typically have fewer people. Which area are you planning to visit?"
  ],
  about: [
    "Kumbh Mela is one of the largest spiritual gatherings in the world. In Nashik, it's celebrated along the holy Godavari River. The 2025 mela is especially significant as it marks [specific significance].",
    "The Nashik Kumbh Mela happens every 12 years when specific celestial alignments occur. It's centered around the holy Godavari River, also known as the Ganga of the South.",
    "This sacred gathering commemorates the mythological event where drops of amrit (divine nectar) fell in Nashik during the great churning of the ocean. Would you like to know more about its history?"
  ]
};

function findIntent(message: string): string {
  const lowercaseMsg = message.toLowerCase();

  for (const [intent, patterns] of Object.entries(intents)) {
    if (patterns.some(pattern => lowercaseMsg.includes(pattern))) {
      return intent;
    }
  }

  return 'about';
}

function getRandomResponse(intent: string): string {
  const intentResponses = responses[intent] || [
    "The Nashik Kumbh Mela is a sacred gathering. I can help you with information about locations, schedules, facilities, or emergency services. What would you like to know?",
    "I'm here to assist you with all information about the Kumbh Mela. Would you like to know about the holy sites, current events, or facilities?",
    "I can provide details about the Kumbh Mela's sacred sites, schedules, or facilities. What specific information are you looking for?"
  ];

  return intentResponses[Math.floor(Math.random() * intentResponses.length)];
}

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const userMessage = messages[messages.length - 1].content;
    const intent = findIntent(userMessage);
    const response = getRandomResponse(intent);

    return response;
  } catch (error) {
    console.error("Chat error:", error);
    return "I apologize, but I'm having trouble understanding. Could you please rephrase your question about the Kumbh Mela?";
  }
}