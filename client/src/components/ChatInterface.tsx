import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/types";
import { getChatResponse, getSuggestions } from "@/lib/chatbot";

export function ChatInterface() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Namaste! I'm your Kumbh Mela guide. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const suggestions = getSuggestions(input);
    setSuggestions(suggestions);
    setSelectedSuggestionIndex(-1);
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSuggestions([]);
    setIsLoading(true);

    try {
      const response = await getChatResponse([...messages, userMessage]);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        setInput(suggestions[selectedSuggestionIndex]);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      } else if (e.key === "Escape") {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    } else if (e.key === "Enter") {
      handleSend();
    }
  };

  // Quick prompts the user can click on
  const quickPrompts = [
    "Safety tips during rush hours",
    "Best time to visit Ramkund",
    "Emergency services nearby",
    "Transportation options"
  ];

  return (
    <div className="flex flex-col">
      <Card className="flex flex-col w-full bg-white shadow-lg rounded-xl overflow-hidden border-t-4 border-[#FF7F00]">
        <div className="bg-gradient-to-r from-[#FF7F00] to-[#E3A018] p-3 text-white">
          <h2 className="text-xl font-bold">
            <span className="hidden xs:inline">Kumbh Mela</span> AI Assistant
          </h2>
          <p className="text-xs opacity-90">Ask any question about your pilgrimage</p>
        </div>
        
        <ScrollArea className="flex-1 p-4" style={{ height: 'min(400px, 50vh)' }}>
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
              <div className="chat-bubble chat-bubble-assistant">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF7F00] animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-[#FF7F00] animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-[#FF7F00] animate-pulse delay-300"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Quick prompts */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 flex-nowrap">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                className="px-3 py-1 bg-white text-[#FF7F00] border border-[#FF7F00] rounded-full text-xs whitespace-nowrap hover:bg-[#FF7F00] hover:text-white transition-colors"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col gap-2 relative">
            <div className="flex gap-2 w-full relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about Kumbh Mela..."
                className="flex-1 bg-white border-[#FF7F00]/30 focus-visible:ring-[#FF7F00]"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-[#FF7F00] hover:bg-[#E3A018] text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
              {suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        index === selectedSuggestionIndex ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        setInput(suggestion);
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}