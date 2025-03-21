
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage } from "@shared/types";

// Initialize Gemini API with the key from environment variables
// We use a function to get API key at runtime to handle late-loading of environment variables
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key not found in environment variables");
    throw new Error("Gemini API key is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function getGeminiResponse(messages: ChatMessage[]): Promise<string> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Convert ChatMessage[] to format expected by Gemini
    const geminiMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Start a chat session
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1) // All but last message
    });

    // Send the last message to the chat
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    
    return response.text() || "I apologize, but I'm having trouble processing your request right now.";
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return "I apologize, but I'm having trouble processing your request right now.";
  }
}
