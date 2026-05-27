import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Diamond, Send, Mic, MicOff, Asterisk,
  Waves, Users, UtensilsCrossed, MapPin, Phone, Navigation,
  TriangleAlert, Star, Loader2, Sparkles, ThumbsUp, ThumbsDown,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";
import { getChatResponse, getSuggestions } from "@/lib/chatbot";
import { TFIDF, extractEntities, computeJaccardSimilarity } from "@/lib/nlp";
import { apiRequest } from "@/lib/queryClient";
import {
  expandKnowledgeBase,
  isGeminiAvailable,
  detectLanguage,
  translateText,
} from "@/lib/gemini";
import type { ChatMessage } from "@shared/types";

// ─── Knowledge base ───────────────────────────────────────────────────────────

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
  "Photography is allowed in most areas, but some sacred ceremonies and rituals may restrict it.",
];

const nlpEngine = new TFIDF(kumbhMelaKnowledgeBase);

// ─── Types ───────────────────────────────────────────────────────────────────

interface VenueData {
  name: string;
  rating: number;
  distance: string;
  location: string;
  open: boolean;
}

interface CrowdAlertData {
  zone: string;
  message: string;
  waitMin: number;
  alternate: string;
}

type CardPayload =
  | { kind: "venue"; data: VenueData }
  | { kind: "crowd-alert"; data: CrowdAlertData };

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
  cards?: CardPayload[];
  confidence?: number;
}

interface Feedback {
  messageIndex: number;
  queryId?: number;
  value: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nowStr() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function detectCards(text: string): CardPayload[] {
  const t = text.toLowerCase();
  const cards: CardPayload[] = [];
  if (
    t.includes("food") || t.includes("stall") || t.includes("annapurna") ||
    t.includes("snack") || t.includes("prasad") || t.includes("restaurant") ||
    t.includes("vendor")
  ) {
    cards.push({
      kind: "venue",
      data: { name: "Annapurna Prasad Stall", rating: 4.8, distance: "450m away", location: "Sector 4 Main Entry", open: true },
    });
  }
  if (
    t.includes("crowd alert") || t.includes("high density") || t.includes("congested") ||
    t.includes("avoid") || t.includes("alternate route") || t.includes("north gate") ||
    t.includes("wait time")
  ) {
    cards.push({
      kind: "crowd-alert",
      data: {
        zone: "Sector 4",
        message: "The main entry at Sector 4 is currently experiencing high density. Estimated wait time: 25 minutes. I suggest using the North Gate instead.",
        waitMin: 25,
        alternate: "North Gate",
      },
    });
  }
  return cards;
}

const DEFAULT_CHIPS = [
  { label: "Find nearest Ghat", icon: Waves },
  { label: "Crowd status?", icon: Users },
  { label: "Medical camp nearby", icon: UtensilsCrossed },
  { label: "Snan timings today", icon: Sparkles },
  { label: "Lost & found help", icon: MapPin },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function AiBubble({
  msg, msgIdx, feedbacks, onFeedback, isSendingFeedback,
}: {
  msg: Message;
  msgIdx: number;
  feedbacks: Feedback[];
  onFeedback: (idx: number, val: number) => void;
  isSendingFeedback: boolean;
}) {
  const fb = feedbacks.find((f) => f.messageIndex === msgIdx);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col items-start max-w-[88%]"
    >
      <div className="rounded-2xl rounded-bl-[4px] bg-[#fff1ec] px-4 py-3 shadow-sm" style={{ wordBreak: "break-word" }}>
        <p className="text-[15px] leading-[24px] text-[#261813]">{msg.content}</p>

        {/* Feedback row (only on non-first AI messages) */}
        {msgIdx > 0 && (
          <div className="mt-2 flex items-center gap-2 border-t border-[#f0d9d0] pt-2">
            <span className="text-[10px] font-medium text-[#8e7066]">Helpful?</span>
            <button
              onClick={() => onFeedback(msgIdx, 1)}
              disabled={isSendingFeedback}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                fb?.value === 1
                  ? "bg-emerald-100 text-emerald-600"
                  : "text-[#8e7066] hover:bg-[#f0d9d0]",
              )}
              data-testid={`button-feedback-up-${msgIdx}`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onFeedback(msgIdx, -1)}
              disabled={isSendingFeedback}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                fb?.value === -1
                  ? "bg-red-100 text-red-500"
                  : "text-[#8e7066] hover:bg-[#f0d9d0]",
              )}
              data-testid={`button-feedback-down-${msgIdx}`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
            {msg.confidence !== undefined && (
              <span className="ml-auto text-[10px] text-[#8e7066]">
                {msg.confidence > 0 ? `NLP ${Math.round(msg.confidence * 100)}%` : "AI"}
              </span>
            )}
          </div>
        )}
      </div>
      <span className="ml-1 mt-1 text-[11px] font-medium text-[#8e7066]">{msg.ts}</span>

      {msg.cards?.map((card, i) => (
        <div key={i} className="mt-3 w-full max-w-sm">
          {card.kind === "venue" && <VenueCard data={card.data} />}
          {card.kind === "crowd-alert" && <CrowdAlertCard data={card.data} />}
        </div>
      ))}
    </motion.div>
  );
}

function UserBubble({ msg }: { msg: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex w-full flex-col items-end"
    >
      <div className="max-w-[88%] rounded-2xl rounded-br-[4px] bg-[#a43800] px-4 py-3 shadow-md">
        <p className="text-[15px] leading-[24px] text-white">{msg.content}</p>
      </div>
      <span className="mr-1 mt-1 text-[11px] font-medium text-[#8e7066]">{msg.ts}</span>
    </motion.div>
  );
}

function VenueCard({ data }: { data: VenueData }) {
  return (
    <div className="overflow-hidden rounded-xl border-t-4 border-[#FF7F00] bg-white shadow-lg">
      <div className="relative h-28 w-full bg-gradient-to-br from-amber-600 to-orange-700">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <UtensilsCrossed className="h-16 w-16 text-white" />
        </div>
        {data.open && (
          <span className="absolute right-2 top-2 rounded-full bg-[#2E7D32] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Open Now
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[16px] font-semibold text-[#261813]">{data.name}</h3>
            <p className="text-[12px] font-medium text-[#5a4138]">{data.distance} · {data.location}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-[#FF7F00] text-[#FF7F00]" />
            <span className="text-[12px] font-semibold text-[#FF7F00]">{data.rating}</span>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#FF7F00] py-2.5 text-[14px] font-semibold text-white active:scale-95 transition-transform" data-testid="button-navigate-venue">
            <Navigation className="h-4 w-4" /> Navigate
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#8e7066] py-2.5 text-[14px] font-semibold text-[#FF7F00] active:scale-95 transition-transform" data-testid="button-call-venue">
            <Phone className="h-4 w-4" /> Call
          </button>
        </div>
      </div>
    </div>
  );
}

function CrowdAlertCard({ data }: { data: CrowdAlertData }) {
  return (
    <div className="flex gap-4 rounded-xl border-t-4 border-[#D32F2F] bg-[#f8ddd4] p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ffdad6]">
        <TriangleAlert className="h-5 w-5 text-[#D32F2F]" />
      </div>
      <div className="min-w-0">
        <h4 className="text-[15px] font-semibold text-[#261813]">Crowd Alert: {data.zone}</h4>
        <p className="mt-0.5 text-[13px] leading-[20px] text-[#5a4138]">{data.message}</p>
        <button className="mt-1.5 flex items-center gap-1 text-[13px] font-semibold text-[#FF7F00]" data-testid="button-alternate-route">
          Show alternate route <ChevronLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex max-w-[88%] flex-col items-start"
    >
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-[4px] bg-[#fff1ec] px-4 py-3.5 shadow-sm">
        {[0, 150, 300].map((d) => (
          <span key={d} className="h-2 w-2 rounded-full bg-[#FF7F00] opacity-60"
            style={{ animation: `kdot 1.2s ${d}ms infinite` }} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const { trigger } = useHaptics();

  const selectedLanguage = i18n.language;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Namaste! I am your KumbhDoot AI assistant. How can I help you navigate the Mela today? You can ask about locations, crowd levels, or nearby amenities.",
      ts: nowStr(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // Autocomplete suggestions while typing
  const [autocomplete, setAutocomplete] = useState<string[]>([]);
  const [acIdx, setAcIdx] = useState(-1);

  // Follow-up chips after last AI response
  const [followUpChips, setFollowUpChips] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }, []);

  useEffect(scrollToBottom, [messages, loading, scrollToBottom]);

  // Autocomplete as user types
  useEffect(() => {
    if (input.trim().length > 2) {
      const std = getSuggestions(input);
      const enhanced = std
        .map((s) => ({ text: s, score: computeJaccardSimilarity(input.toLowerCase(), s.toLowerCase()) }))
        .filter((m) => m.score > 0.1)
        .sort((a, b) => b.score - a.score)
        .map((m) => m.text);
      const entities = extractEntities(input);
      const entitySuggs: string[] = [];
      if (entities.locations.length > 0) {
        entitySuggs.push(`How crowded is ${entities.locations[0]} now?`);
        entitySuggs.push(`Best time to visit ${entities.locations[0]}?`);
      }
      if (entities.events.length > 0) {
        entitySuggs.push(`When is the next ${entities.events[0]}?`);
      }
      setAutocomplete(Array.from(new Set([...enhanced, ...entitySuggs])).slice(0, 5));
      setAcIdx(-1);
    } else {
      setAutocomplete([]);
    }
  }, [input]);

  // ── Language helpers ──────────────────────────────────────────────────────

  const detectLang = async (text: string): Promise<{ detectedLanguage: string; translatedText?: string }> => {
    try {
      setIsTranslating(true);
      const info = await detectLanguage(text);
      const detected = info.detectedLanguage || "en";
      if (detected !== selectedLanguage && text.length > 3) {
        const translated = await translateText(text, detected, selectedLanguage);
        return { detectedLanguage: detected, translatedText: translated };
      }
      return { detectedLanguage: detected };
    } catch {
      return { detectedLanguage: selectedLanguage };
    } finally {
      setIsTranslating(false);
    }
  };

  const translateResponse = async (text: string): Promise<string> => {
    if (selectedLanguage === "en") return text;
    try {
      setIsTranslating(true);
      return await translateText(text, "en", selectedLanguage);
    } catch {
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  // ── Feedback ─────────────────────────────────────────────────────────────

  const handleFeedback = useCallback(async (messageIndex: number, value: number) => {
    const existing = feedbacks.find((f) => f.messageIndex === messageIndex);
    if (existing?.value === value) return;

    setIsSendingFeedback(true);
    setFeedbacks((prev) => {
      const filtered = prev.filter((f) => f.messageIndex !== messageIndex);
      return [...filtered, { messageIndex, value }];
    });

    try {
      const question = messages[messageIndex - 1]?.content ?? "";
      const answer = messages[messageIndex]?.content ?? "";
      const res = await apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ query: question, response: answer, feedback: value, sources: ["NLP Engine", "Semantic Search"] }),
      });
      if (value < 0) {
        toast({ title: "Feedback received", description: "Flagged for improvement. Thanks!", duration: 3000 });
        isGeminiAvailable().then(async (ok) => {
          if (ok) await expandKnowledgeBase(question, value);
        }).catch(() => {});
      } else {
        toast({ title: "Feedback received", description: "Thanks for the feedback!", duration: 3000 });
      }
      if (res?.queryId) {
        setFeedbacks((prev) => prev.map((f) => f.messageIndex === messageIndex ? { ...f, queryId: res.queryId } : f));
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to send feedback." });
    } finally {
      setIsSendingFeedback(false);
    }
  }, [feedbacks, messages, toast]);

  // ── Main send logic (mirrors ChatInterface.handleSend) ────────────────────

  const send = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    trigger("light");

    // Language detection + optional translation
    let processedText = t;
    let detectedLang = selectedLanguage;
    try {
      const langResult = await detectLang(t);
      detectedLang = langResult.detectedLanguage;
      if (langResult.translatedText) processedText = langResult.translatedText;
    } catch { /* keep original */ }

    const userMsg: Message = { id: uid(), role: "user", content: t, ts: nowStr() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAutocomplete([]);
    setFollowUpChips([]);
    setLoading(true);

    const history: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const lowerQuery = processedText.toLowerCase().trim();
      let response = "";
      let confidence = 0;

      // ── Direct-match shortcuts ──────────────────────────────────────────
      if (lowerQuery.includes("how crowded") && (lowerQuery.includes("nashik") || lowerQuery.includes("kumbh"))) {
        response = "Currently, the crowd level at Ramkund is moderate (50% capacity), while Tapovan is experiencing high crowd density (80% capacity). Trimbakeshwar is relatively less crowded (30% capacity). Early morning is recommended for a more peaceful experience.";
      } else if ((lowerQuery.includes("where") || lowerQuery.includes("location")) && (lowerQuery.includes("cbs") || lowerQuery.includes("central bus"))) {
        response = "The Central Bus Stand (CBS) in Nashik is located about 5 km from Ramkund. Address: Central Bus Stand, CBS Road, Old Nashik, Maharashtra 422001. Special shuttle services run to all major Kumbh locations during the festival.";
      } else if ((lowerQuery.includes("where") || lowerQuery.includes("location")) && lowerQuery.includes("nashik road")) {
        response = "Nashik Road Railway Station is about 10 km from the main Kumbh Mela sites. Address: Station Road, Nashik Road, Nashik, Maharashtra 422101. Special shuttles and auto-rickshaws connect the station to all festival locations.";
      } else {
        // ── NLP semantic search ─────────────────────────────────────────
        const nlpResults = nlpEngine.findSimilarDocuments(t, 3);
        const entities = extractEntities(t);

        if (nlpResults.length > 0 && nlpResults[0].score > 0.25) {
          confidence = nlpResults[0].score;
          response = nlpResults[0].text;
          if (nlpResults.length > 1 && nlpResults[1].score > 0.2) {
            response += " " + nlpResults[1].text;
          }
          if (entities.locations.length > 0) {
            const locMatches = nlpResults.filter((r) =>
              r.text.toLowerCase().includes(entities.locations[0].toLowerCase()),
            );
            if (locMatches.length > 0) response = locMatches[0].text;
          }
          if ((lowerQuery.includes("crowd") || lowerQuery.includes("busy") || lowerQuery.includes("crowded")) && response.includes("Nashik")) {
            response = "Currently, the crowd level at Ramkund is moderate (50% capacity), while Tapovan is experiencing high crowd density (80% capacity). Trimbakeshwar is relatively less crowded (30% capacity).";
          }
          const followUps = nlpEngine.generateFollowUpQuestions(t, nlpResults);
          setFollowUpChips(followUps.slice(0, 4));
        } else {
          // ── Gemini / server fallback ──────────────────────────────────
          response = await getChatResponse([...history, { role: "user", content: t }]);
          setFollowUpChips([]);
        }
      }

      // Translate response if needed
      if (selectedLanguage !== "en") {
        response = await translateResponse(response);
      }

      const cards = detectCards(response);
      const aiMsg: Message = {
        id: uid(),
        role: "assistant",
        content: response,
        ts: nowStr(),
        confidence,
        cards: cards.length > 0 ? cards : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to get a response. Please try again." });
    } finally {
      setLoading(false);
      trigger("light");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, messages, selectedLanguage, trigger, toast]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (autocomplete.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setAcIdx((i) => (i < autocomplete.length - 1 ? i + 1 : 0)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setAcIdx((i) => (i > 0 ? i - 1 : autocomplete.length - 1)); return; }
      if (e.key === "Enter" && acIdx >= 0) { e.preventDefault(); setInput(autocomplete[acIdx]); setAutocomplete([]); setAcIdx(-1); return; }
      if (e.key === "Escape") { setAutocomplete([]); setAcIdx(-1); return; }
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const activeChips = followUpChips.length > 0
    ? followUpChips.map((label) => ({ label, icon: Sparkles }))
    : DEFAULT_CHIPS;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#fff8f6]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#e2bfb3] bg-[#fee2d9]">
            <span className="text-[20px]">🙏</span>
          </div>
          <div>
            <h1 className="text-[16px] font-bold leading-tight tracking-tight text-orange-600">KumbhDoot AI</h1>
            {isTranslating && (
              <p className="flex items-center gap-1 text-[11px] text-slate-400">
                <Globe className="h-3 w-3" /> Translating…
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => { trigger("light"); setLocation("/"); }}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 active:scale-95"
          data-testid="button-close-chat"
        >
          <Diamond className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
        </button>
      </header>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          {messages.map((msg, idx) =>
            msg.role === "assistant"
              ? <AiBubble key={msg.id} msg={msg} msgIdx={idx} feedbacks={feedbacks} onFeedback={handleFeedback} isSendingFeedback={isSendingFeedback} />
              : <UserBubble key={msg.id} msg={msg} />,
          )}
          <AnimatePresence>{loading && <TypingBubble />}</AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Bottom area ─────────────────────────────────────────────────── */}
      <div
        className="shrink-0 bg-gradient-to-t from-[#fff8f6] via-[#fff8f6] to-transparent"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        {/* Chips — follow-up suggestions OR default quick actions */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 no-scrollbar">
          {activeChips.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => send(label)}
              disabled={loading}
              className="flex shrink-0 items-center gap-2 rounded-full border border-[#e2bfb3] bg-white px-4 py-2 text-[12px] font-medium tracking-wide text-[#5a4138] shadow-sm transition-colors hover:bg-[#fff1ec] active:scale-95 disabled:opacity-40"
              data-testid={`chip-${label.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`}
            >
              <Icon className="h-4 w-4 shrink-0 text-[#FF7F00]" />
              {label}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-3 px-4">
          {/* SOS */}
          <button
            onClick={() => { trigger("medium"); setLocation("/sos"); }}
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-[#D32F2F] text-white shadow-[0_4px_20px_rgba(211,47,47,0.35)] active:scale-90 transition-transform"
            data-testid="button-sos-chat"
          >
            <Asterisk className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-[9px] font-black leading-none tracking-wider">SOS</span>
          </button>

          {/* Text input pill with autocomplete */}
          <div className="relative flex flex-1 flex-col">
            {/* Autocomplete dropdown */}
            <AnimatePresence>
              {autocomplete.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full mb-1 left-0 right-0 z-10 overflow-hidden rounded-xl border border-[#e2bfb3] bg-white shadow-xl"
                >
                  {autocomplete.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); setAutocomplete([]); inputRef.current?.focus(); }}
                      className={cn(
                        "flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] text-[#261813] hover:bg-[#fff1ec]",
                        i === acIdx && "bg-[#fff1ec]",
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#FF7F00]" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center overflow-hidden rounded-full border border-[#e2bfb3] bg-white shadow-md focus-within:border-[#FF7F00] transition-colors">
              <Sparkles className="absolute ml-4 h-5 w-5 shrink-0 text-[#8e7066] pointer-events-none" />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask KumbhDoot..."
                disabled={loading}
                className="h-14 w-full bg-transparent pl-11 pr-12 text-[15px] text-[#261813] placeholder:text-[#8e7066] outline-none"
                data-testid="input-chat"
              />
              <button
                onClick={() => setListening((v) => !v)}
                className="absolute right-3 mr-[3.75rem] flex h-8 w-8 items-center justify-center rounded-full text-[#5a4138] hover:bg-slate-100 active:scale-90 transition-colors"
                data-testid="button-mic"
              >
                {listening
                  ? <MicOff className="h-5 w-5 text-[#D32F2F]" />
                  : <Mic className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Send */}
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FF7F00] text-white shadow-lg active:scale-90 transition-all disabled:opacity-50 disabled:scale-100"
            data-testid="button-send-chat"
          >
            {loading
              ? <Loader2 className="h-6 w-6 animate-spin" />
              : <Send className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes kdot { 0%,100%{opacity:.3;transform:scale(.85)} 50%{opacity:1;transform:scale(1.1)} }
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  );
}
