import OpenAI from "openai";
import type { ChatMessage } from "@shared/types";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "default-key",
  dangerouslyAllowBrowser: true
});

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      response_format: { type: "json_object" }
    });

    return response.choices[0].message.content || "I apologize, but I'm having trouble processing your request right now.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I apologize, but I'm having trouble processing your request right now.";
  }
}