
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage } from "@shared/types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Intent patterns for NLP-based understanding
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

// Function to detect intents from user message
function detectIntent(message: string): string[] {
  const lowercaseMsg = message.toLowerCase();
  const detectedIntents: string[] = [];
  
  for (const [intent, patterns] of Object.entries(intents)) {
    if (patterns.some(pattern => lowercaseMsg.includes(pattern))) {
      detectedIntents.push(intent);
    }
  }
  
  return detectedIntents.length > 0 ? detectedIntents : ['general'];
}

// Function to enhance prompt with intent context
function enhancePromptWithContext(message: string, detectedIntents: string[]): string {
  let enhancedPrompt = message;
  
  if (detectedIntents.includes('locations')) {
    enhancedPrompt += "\n\nContext: User is asking about locations at the Kumbh Mela. Include information about Ramkund, Tapovan, and other sacred sites.";
  }
  
  if (detectedIntents.includes('emergency') || detectedIntents.includes('medical') || detectedIntents.includes('police')) {
    enhancedPrompt += "\n\nContext: User is asking about emergency services. Include information about medical facilities, police stations, and emergency contact numbers.";
  }
  
  if (detectedIntents.includes('facilities')) {
    enhancedPrompt += "\n\nContext: User is asking about facilities at the Kumbh Mela. Include information about accommodations, food services, and other amenities.";
  }
  
  if (detectedIntents.includes('schedule')) {
    enhancedPrompt += "\n\nContext: User is asking about the Kumbh Mela schedule. Include information about important dates, rituals, and events.";
  }

  if (detectedIntents.includes('crowd') || detectedIntents.includes('child_safety')) {
    enhancedPrompt += "\n\nContext: User is concerned about crowd safety. Include current crowd levels and safety tips, especially for children.";
  }
  
  return enhancedPrompt;
}

export async function getGeminiResponse(messages: ChatMessage[]): Promise<string> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    // Apply NLP to understand the user's intent
    const detectedIntents = detectIntent(lastMessage.content);
    
    // Enhance the prompt with context based on detected intents
    const enhancedPrompt = enhancePromptWithContext(lastMessage.content, detectedIntents);
    
    // System instructions for the AI
    const systemPrompt = `You are a helpful assistant for the Nashik Kumbh Mela 2025. 
    Provide accurate, concise information about this sacred Hindu pilgrimage.
    The detected intent of the user's query appears to be related to: ${detectedIntents.join(', ')}.
    Always prioritize safety information, especially regarding crowd management and children's safety.
    Keep responses focused and relevant to the Kumbh Mela context.`;
    
    // Format history messages for Gemini
    const historyMessages = messages.slice(0, -1).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    
    // Start chat with history
    const chat = model.startChat({
      history: historyMessages,
      generationConfig: {
        maxOutputTokens: 800,
      },
    });
    
    // Send enhanced message with system prompt
    const result = await chat.sendMessage(`${systemPrompt}\n\nUser query: ${enhancedPrompt}`);
    const response = result.response;
    
    return response.text() || "I apologize, but I'm having trouble processing your request right now.";
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return "I apologize, but I'm having trouble processing your request right now. Please make sure the Gemini API key is properly configured.";
  }
}
