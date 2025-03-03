import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/types";
import { getChatResponse } from "@/lib/chatbot";
import { getSuggestions } from "@/lib/chatbot";
import { Badge } from "@/components/ui/badge";

export function ChatInterface() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Namaste! I'm your Kumbh Mela guide. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "When is the next Shahi Snan?",
    "Show me nearby facilities",
    "Emergency contacts",
    "Current crowd levels"
  ]);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getChatResponse([...messages, userMessage]);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);

      // Get new suggestions based on the context
      const newSuggestions = await getSuggestions([...messages, userMessage]);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#FF7F00]">Kumbh Mela Guide</h2>
      <Card className="flex flex-col h-[600px] w-full max-w-2xl bg-white shadow-lg">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble chat-bubble-assistant animate-pulse">
                <span className="text-gray-500">Typing...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 mb-2">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-orange-50 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about Kumbh Mela..."
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-gray-50 border-gray-200"
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSend()}
              disabled={isLoading}
              className="bg-[#FF7F00] hover:bg-[#E67300] text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}