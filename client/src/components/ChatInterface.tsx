import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/types";
import { getChatResponse } from "@/lib/chatbot";
import { getGeminiResponse } from "@/lib/gemini";

export function ChatInterface() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t("welcome") }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useGemini, setUseGemini] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response;
      if (useGemini) {
        response = await getGeminiResponse([...messages, userMessage]);
      } else {
        response = await getChatResponse([...messages, userMessage]);
      }
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to get response from ${useGemini ? "Gemini" : "OpenAI"}. Please try again.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("searchPlaceholder")}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-gray-50 border-gray-200"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-[#FF7F00] hover:bg-[#E67300] text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}