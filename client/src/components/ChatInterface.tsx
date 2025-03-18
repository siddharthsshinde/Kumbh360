import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send, Lightbulb, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/types";
import { getChatResponse, getSuggestions } from "@/lib/chatbot";
import { TFIDF, extractEntities, computeJaccardSimilarity } from "@/lib/nlp";

// Knowledge base data with Kumbh Mela related information
const kumbhMelaKnowledgeBase = [
  "Kumbh Mela is one of the largest peaceful gatherings in the world, where Hindus gather to bathe in a sacred river.",
  "Nashik Kumbh Mela is held along the banks of the Godavari River in Maharashtra, India.",
  "The main bathing spots in Nashik Kumbh Mela include Ramkund, Tapovan, and Trimbakeshwar.",
  "Ramkund is considered one of the holiest spots in Nashik where pilgrims take a dip in the sacred waters of the Godavari.",
  "Tapovan is located on the banks of the Godavari and is associated with Lord Rama during his exile.",
  "Trimbakeshwar is famous for its ancient Shiva temple and is one of the twelve Jyotirlingas.",
  "The best time to visit Kumbh Mela is during the Shahi Snan (Royal Bath) when thousands of sadhus and pilgrims gather to bathe.",
  "Safety tips for Kumbh Mela include staying hydrated, keeping your belongings secure, and following the crowd management instructions.",
  "Accommodation options during Kumbh Mela include tent cities, guesthouses, hotels, and ashrams.",
  "Transportation during Kumbh Mela includes special shuttle services, auto-rickshaws, and designated walking paths.",
  "Emergency services are available throughout the Kumbh Mela area, with medical camps, police assistance, and lost-and-found centers.",
  "Important rituals during Kumbh Mela include Ganga Aarti, Rudrabhishek, and Snan (holy bath).",
  "Kumbh Mela is celebrated four times over the course of 12 years at four different locations in India: Haridwar, Prayagraj, Nashik and Ujjain.",
  "The Nashik Kumbh Mela 2025 is expected to host millions of pilgrims from around the world.",
  "During Kumbh Mela, various cultural programs, spiritual discourses, and religious ceremonies are organized.",
  "The word 'Kumbh' means pot or pitcher, referring to the pot of nectar that emerged during the churning of the cosmic ocean.",
  "According to Hindu mythology, drops of the nectar of immortality fell at four places where Kumbh Mela is celebrated.",
  "Sadhus (holy men) belonging to various akharas (religious orders) come to participate in the Kumbh Mela.",
  "The Godavari River is considered sacred in Hinduism and is often called the Ganges of South India.",
  "The Kalaram Temple in Nashik is an important religious site dedicated to Lord Rama.",
  "Pilgrims should bring essentials like comfortable clothing, water bottle, identification documents, and basic medicines.",
  "The crowd density varies throughout the day, with early mornings and evenings being relatively less crowded.",
  "Photography is allowed in most areas, but some sacred ceremonies and rituals may restrict it."
];

// Initialize TFIDF with our knowledge base for semantic search
const nlpEngine = new TFIDF(kumbhMelaKnowledgeBase);

export function ChatInterface() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Namaste! 🙏 I'm your Kumbh Mela guide powered by advanced NLP. How can I assist you with your pilgrimage today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<{text: string, score: number}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Enhanced suggestion generation using NLP techniques
    if (input.trim().length > 2) {
      // Get standard suggestions
      const standardSuggestions = getSuggestions(input);
      
      // Use Jaccard similarity for better matching
      const enhancedSuggestions = standardSuggestions
        .map(suggestion => ({
          text: suggestion,
          score: computeJaccardSimilarity(input.toLowerCase(), suggestion.toLowerCase())
        }))
        .filter(match => match.score > 0.1)
        .sort((a, b) => b.score - a.score)
        .map(match => match.text);
      
      // Extract entities and generate entity-specific suggestions
      const entities = extractEntities(input);
      const entitySuggestions: string[] = [];
      
      if (entities.locations.length > 0) {
        const location = entities.locations[0];
        entitySuggestions.push(`How crowded is ${location} now?`);
        entitySuggestions.push(`Best time to visit ${location}?`);
      }
      
      if (entities.events.length > 0) {
        const event = entities.events[0];
        entitySuggestions.push(`When is the next ${event}?`);
        entitySuggestions.push(`What should I bring to ${event}?`);
      }
      
      // Combine and de-duplicate
      const uniqueSuggestions = Array.from(new Set([...enhancedSuggestions, ...entitySuggestions]));
      setSuggestions(uniqueSuggestions.slice(0, 5));
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSuggestions([]);
    setFollowUpSuggestions([]);
    setIsLoading(true);

    try {
      // First try to find an answer from our knowledge base using NLP
      const nlpResults = nlpEngine.findSimilarDocuments(messageText, 3);
      setSearchResults(nlpResults);
      
      // Extract entities from the query
      const entities = extractEntities(messageText);
      
      let response = "";
      
      // If we have good matches from our knowledge base (confidence > 25%), use them
      if (nlpResults.length > 0 && nlpResults[0].score > 0.25) {
        // Use the best match as our base response
        response = nlpResults[0].text;
        
        // If there are multiple good matches, combine insights
        if (nlpResults.length > 1 && nlpResults[1].score > 0.2) {
          response += " " + nlpResults[1].text;
        }
        
        // If the query is about a specific location, prioritize location-specific info
        if (entities.locations.length > 0) {
          const locationMatches = nlpResults.filter(r => 
            r.text.toLowerCase().includes(entities.locations[0].toLowerCase())
          );
          if (locationMatches.length > 0) {
            response = locationMatches[0].text;
          }
        }
        
        // Generate follow-up questions based on the results
        const followUps = nlpEngine.generateFollowUpQuestions(messageText, nlpResults);
        setFollowUpSuggestions(followUps);
      } else {
        // If no good match in our knowledge base, use the server-side API
        response = await getChatResponse([...messages, userMessage]);
      }
      
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
      handleSend(input);
    }
  };

  // Enhanced quick prompts the user can click on
  const quickPrompts = [
    "What is Kumbh Mela?",
    "Best time to visit?",
    "Holy bathing spots",
    "Important rituals",
    "Safety tips during rush hours",
    "Emergency services nearby",
    "Transportation options",
    "Crowd levels today"
  ];

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto">
      <Card className="flex flex-col w-full bg-white shadow-xl rounded-xl overflow-hidden border-t-4 border-[#FF7F00]">
        <div className="bg-gradient-to-r from-[#FF7F00] to-[#E3A018] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center">
                <span className="hidden xs:inline">Kumbh Mela</span> AI Assistant
                <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">NLP Enhanced</span>
              </h2>
              <p className="text-sm mt-1 opacity-90">Ask any question about your pilgrimage journey</p>
              <p className="text-xs mt-1 opacity-75">Using advanced NLP and semantic search technology</p>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center text-xs bg-white/10 px-2 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                <span>Knowledge Base: 23 Entries</span>
              </div>
              <div className="text-xs mt-1 opacity-75">Supports Hindi & English</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="bg-white/10 px-2 py-0.5 rounded-full">Semantic Search</span>
            <span className="bg-white/10 px-2 py-0.5 rounded-full">TF-IDF Analysis</span>
            <span className="bg-white/10 px-2 py-0.5 rounded-full">Entity Recognition</span>
            <span className="bg-white/10 px-2 py-0.5 rounded-full">Contextual Suggestions</span>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4" style={{ height: 'calc(100vh - 300px)' }}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                }`}
              >
                {msg.content}
                {msg.role === "assistant" && i > 0 && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    {searchResults.length > 0 && searchResults[0].score > 0.25 ? (
                      <span>
                        NLP match found (confidence: {Math.round(searchResults[0].score * 100)}%)
                        {searchResults.length > 1 && <span className="ml-1 text-amber-600">· {searchResults.length} matches</span>}
                      </span>
                    ) : (
                      <span>AI-generated response using semantic search</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble chat-bubble-assistant">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF7F00] animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-[#FF7F00] animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-[#FF7F00] animate-pulse delay-300"></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Search className="h-3 w-3 mr-1" />
                    <span>Analyzing using advanced NLP...</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-gray-400">
                    <span className="text-amber-500">●</span> Tokenizing input
                    <span className="ml-2 text-amber-600">●</span> Removing stopwords
                    <span className="ml-2 text-amber-700">●</span> Computing semantic similarity
                  </div>
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
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
        
        {/* Follow-up suggestions based on NLP analysis */}
        {followUpSuggestions.length > 0 && messages.length > 1 && !isLoading && (
          <div className="px-4 py-3 border-t border-gray-100 bg-white/50">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
              <span>You might also be interested in:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {followUpSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs hover:bg-amber-100 transition-colors"
                  onClick={() => handleSend(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col gap-2 relative">
            <div className="flex gap-3 w-full relative">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about Kumbh Mela..."
                  className="flex-1 pl-9 bg-white border-[#FF7F00]/30 focus-visible:ring-[#FF7F00] pr-36"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-400">
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-pulse mr-1">●</span> Processing
                    </span>
                  ) : (
                    <span>Press Enter to send</span>
                  )}
                </div>
              </div>
              <Button 
                onClick={() => handleSend(input)}
                disabled={isLoading}
                className="bg-[#FF7F00] hover:bg-[#E3A018] text-white"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              {suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        index === selectedSuggestionIndex ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleSend(suggestion)}
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