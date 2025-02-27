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
    'crowd', 'busy', 'rush', 'people', 'भीड़', 'गर्दी', 'overcrowded', 'safe', 'safety', 'tapovan', 'children', 'kids', 'बच्चे', 'child'
  ],
  child_safety: [
    'child', 'children', 'kid', 'kids', 'hold hand', 'lost child', 'बच्चे', 'बच्चा', 'हाथ पकड़े', 'safety'
  ],
  about: [
    'what', 'about', 'tell', 'explain', 'information', 'कुंभ', 'मेला', 'कुंभमेळा', 'meaning'
  ],
  missing_person: [
    'missing', 'lost', 'cant find', 'disappeared', 'looking for', 'हरवलेला', 'गायब', 'खो गया'
  ],
  medical: [
    'hospital', 'doctor', 'medical', 'emergency', 'ambulance', 'डॉक्टर', 'हॉस्पिटल', 'दवाखाना'
  ],
  police: [
    'police', 'security', 'theft', 'stolen', 'पोलीस', 'सुरक्षा', 'पोलिस'
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
    "⚠️ REAL-TIME UPDATE: Current crowd levels - Ramkund area shows moderate crowding. Tapovan is experiencing higher than usual crowds right now. Please hold children's hands at all times. Check our map for live crowd indicators.",
    "⚠️ REAL-TIME ALERT: Our crowd monitoring system shows: Ramkund (Level 3/5), Kalaram Temple (Level 2/5), Tapovan (Level 4/5 - CROWDED). If visiting Tapovan, keep children close and maintain tight grip on their hands. Early mornings recommended for smaller crowds.",
    "I'm monitoring crowd levels in real-time. Currently Tapovan area is showing high crowd density. If you're with children, please hold their hands firmly and consider using child identification wristbands available at information kiosks. Which area are you planning to visit?"
  ],
  child_safety: [
    "⚠️ IMPORTANT SAFETY ALERT: Please hold children's hands tightly in all crowded areas, especially in Tapovan which is currently experiencing high crowd density. Child identification wristbands are available at all information kiosks.",
    "For children's safety: 1) Always maintain hand contact with children 2) Consider using the special orange safety wristbands 3) Take a photo of your child each morning to record clothing 4) Teach children to approach police personnel if separated. Tapovan currently has HIGH crowd density.",
    "Real-time safety update: Tapovan crowds are currently at LEVEL 4 (HIGH). Hold children's hands firmly and avoid the central pathways. The northern entrance to Tapovan is less crowded. Would you like directions to the child safety station?"
  ],
  about: [
    "Kumbh Mela is one of the largest spiritual gatherings in the world. In Nashik, it's celebrated along the holy Godavari River. The 2025 mela is especially significant as it marks [specific significance].",
    "The Nashik Kumbh Mela happens every 12 years when specific celestial alignments occur. It's centered around the holy Godavari River, also known as the Ganga of the South.",
    "This sacred gathering commemorates the mythological event where drops of amrit (divine nectar) fell in Nashik during the great churning of the ocean. Would you like to know more about its history?"
  ],
  missing_person: [
    "For missing person reports:\n1. Call 1094 (24x7 Missing Person Help Desk)\n2. Visit the nearest police station\n3. Keep a recent photo ready\n4. Note down the person's last known location and clothing\nDo you need the contact details for the nearest police station?",
    "If someone is missing, immediately contact:\n- Missing Person Help Desk: 1094\n- Panchavati Police Station: 0253-2512833\n- Nashik Police Control: 0253-2305200\nWould you like me to show the nearest police station on the map?",
    "For a missing person case, our emergency response team is available 24/7. Please contact 1094 immediately. What was the last known location of the person?"
  ],
  medical: [
    "Nearby hospitals in Nashik:\n- Civil Hospital: 0253-2572038 (Mumbai Naka)\n- KTHM Hospital: 0253-2580701 (Gangapur Road)\nFor immediate medical help, call Ambulance: 108\nWhich hospital would you like directions to?",
    "Medical emergency? Call 108 for immediate ambulance service. Nearby hospitals:\n1. Civil Hospital (Mumbai Naka)\n2. KTHM Hospital (Gangapur Road)\nShould I show these hospitals on the map?",
    "For medical emergencies:\n- Ambulance: 108\n- Civil Hospital: 0253-2572038\n- KTHM Hospital: 0253-2580701\nAll facilities are available 24/7. Need directions?"
  ],
  police: [
    "Police emergency contacts:\n- Main Control Room: 0253-2305200\n- Panchavati Station: 0253-2512833\n- Emergency: 100\nAll stations are operating 24/7 during Kumbh Mela.",
    "Nearest police stations:\n1. Panchavati Police Station (Near Kalaram Temple)\n2. Police Control Room (Sharanpur Road)\nWould you like to see their locations on the map?",
    "For police assistance:\n- Dial 100 for emergencies\n- Control Room: 0253-2305200\n- Local Station: 0253-2512833\nAll police stations have special Kumbh Mela cells active 24/7."
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

  // Get a random response for the intent
  let response = intentResponses[Math.floor(Math.random() * intentResponses.length)];
  
  // Add real-time safety tip for certain intents
  if (intent === 'locations' || intent === 'about' || intent === 'facilities') {
    // Add a safety tip about Tapovan and children for certain intents
    if (Math.random() > 0.5) { // 50% chance to add the tip
      response += "\n\n⚠️ SAFETY ALERT: Tapovan is currently experiencing high crowd levels. If visiting with children, please hold their hands at all times.";
    }
  }
  
  return response;
}

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    // Check for current crowd conditions at Tapovan - this would normally come from an API
    // but we're hardcoding for demonstration
    const isTapovanCrowded = true; 
    const childSafetyTip = "⚠️ SAFETY ALERT: Tapovan is currently crowded. Please hold children's hands at all times.";
    
    const userMessage = messages[messages.length - 1].content;
    const intent = findIntent(userMessage);
    const response = getRandomResponse(intent);

    return response;
  } catch (error) {
    console.error("Chat error:", error);
    return "I apologize, but I'm having trouble understanding. Could you please rephrase your question about the Kumbh Mela?";
  }
}