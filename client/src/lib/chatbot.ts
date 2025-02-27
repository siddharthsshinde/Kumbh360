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
    'hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'नमस्कार'
  ],
  locations: [
    'where', 'location', 'place', 'directions', 'कहाँ', 'स्थान', 'कुठे'
  ],
  facilities: [
    'facilities', 'services', 'accommodation', 'food', 'सुविधाएं', 'सेवाएं', 'सुविधा'
  ],
  emergency: [
    'emergency', 'help', 'medical', 'police', 'आपातकालीन', 'मदद', 'तातडीची'
  ],
  schedule: [
    'schedule', 'time', 'when', 'कार्यक्रम', 'समय', 'कधी'
  ],
  crowd: [
    'crowd', 'busy', 'rush', 'भीड़', 'गर्दी'
  ]
};

// Define responses for each intent
const responses: Record<string, string[]> = {
  greetings: [
    "Welcome to Nashik Kumbh Mela 2025! How can I assist you today?",
    "Namaste! I'm here to help you with information about Kumbh Mela.",
    "Welcome! What would you like to know about Kumbh Mela?"
  ],
  locations: [
    "The main locations for Kumbh Mela are Ramkund, Tapovan, and Kalaram Temple. Would you like directions to any of these places?",
    "Key sites include the holy Godavari River ghats, particularly Ramkund. I can show you these locations on the map.",
    "The main bathing ghats are located along the Godavari River in Panchavati area. Should I mark them on the map for you?"
  ],
  facilities: [
    "We have various facilities including accommodation, food services, and medical centers. What specific information do you need?",
    "There are multiple facilities available - hotels, restaurants, hospitals, and emergency services. Which would you like to know about?",
    "You can find information about all facilities on the map. Would you like me to show you specific types of facilities?"
  ],
  emergency: [
    "For emergencies, call 108 for ambulance, 100 for police. Medical facilities are available 24/7.",
    "Emergency services are on standby throughout the event. The nearest medical center is at Civil Hospital.",
    "All emergency contacts are available in the emergency section. Would you like me to show you the contact numbers?"
  ],
  schedule: [
    "The Kumbh Mela 2025 main events are scheduled from [dates]. Which day's schedule would you like to know about?",
    "There are several important bathing dates during the Kumbh Mela. The next major snaan (holy bath) is on [date].",
    "Daily rituals begin at sunrise. Special ceremonies are conducted at Ramkund throughout the day."
  ],
  crowd: [
    "You can check real-time crowd levels at different locations on our map. Currently, Ramkund area shows moderate crowding.",
    "I can show you the current crowd levels at all major locations. Which area are you interested in?",
    "The crowd monitoring system shows live updates. Would you like to see the crowd levels at specific locations?"
  ]
};

function findIntent(message: string): string {
  const lowercaseMsg = message.toLowerCase();
  
  for (const [intent, patterns] of Object.entries(intents)) {
    if (patterns.some(pattern => lowercaseMsg.includes(pattern))) {
      return intent;
    }
  }
  
  return 'unknown';
}

function getRandomResponse(intent: string): string {
  const intentResponses = responses[intent] || [
    "I understand you're asking about the Kumbh Mela. Could you please be more specific about what you'd like to know?",
    "I'm here to help with information about the Kumbh Mela. What specific details are you looking for?",
    "Could you rephrase your question? I'm here to assist you with all Kumbh Mela related information."
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
