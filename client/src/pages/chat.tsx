import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Diamond, Send, Mic, MicOff, Asterisk,
  Waves, Users, UtensilsCrossed, MapPin, Phone, Navigation,
  TriangleAlert, Star, Loader2, Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";
import { getChatResponse, getSuggestions } from "@/lib/chatbot";
import type { ChatMessage } from "@shared/types";

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
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function now() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/** Detect rich cards to inject after an AI response */
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
      data: {
        name: "Annapurna Prasad Stall",
        rating: 4.8,
        distance: "450m away",
        location: "Sector 4 Main Entry",
        open: true,
      },
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
        message:
          "The main entry at Sector 4 is currently experiencing high density. Estimated wait time: 25 minutes. I suggest using the North Gate instead.",
        waitMin: 25,
        alternate: "North Gate",
      },
    });
  }

  return cards;
}

const QUICK_CHIPS = [
  { label: "Find nearest Ghat", icon: Waves },
  { label: "Crowd status?", icon: Users },
  { label: "Medical camp nearby", icon: UtensilsCrossed },
  { label: "Snan timings today", icon: Sparkles },
  { label: "Lost & found help", icon: MapPin },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function AiBubble({ msg }: { msg: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col items-start max-w-[85%]"
    >
      <div
        className="rounded-2xl rounded-bl-[4px] bg-[#fff1ec] px-4 py-3 shadow-sm"
        style={{ wordBreak: "break-word" }}
      >
        <p className="text-[16px] leading-[24px] text-[#261813]">{msg.content}</p>
      </div>
      <span className="ml-1 mt-1 text-[11px] font-medium text-[#8e7066]">{msg.ts}</span>

      {/* Rich cards below the bubble */}
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
      <div className="max-w-[85%] rounded-2xl rounded-br-[4px] bg-[#a43800] px-4 py-3 shadow-md">
        <p className="text-[16px] leading-[24px] text-white">{msg.content}</p>
      </div>
      <span className="mr-1 mt-1 text-[11px] font-medium text-[#8e7066]">{msg.ts}</span>
    </motion.div>
  );
}

function VenueCard({ data }: { data: VenueData }) {
  return (
    <div className="overflow-hidden rounded-xl border-t-4 border-[#FF7F00] bg-white shadow-lg">
      {/* Image placeholder */}
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
            <h3 className="text-[20px] font-semibold leading-[28px] text-[#261813]">{data.name}</h3>
            <p className="text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#5a4138]">
              {data.distance} · {data.location}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-[#FF7F00] text-[#FF7F00]" />
            <span className="text-[12px] font-semibold text-[#FF7F00]">{data.rating}</span>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#FF7F00] py-3 text-[14px] font-semibold text-white active:scale-95 transition-transform"
            data-testid="button-navigate-venue">
            <Navigation className="h-4 w-4" />
            Navigate
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#8e7066] py-3 text-[14px] font-semibold text-[#FF7F00] active:scale-95 transition-transform"
            data-testid="button-call-venue">
            <Phone className="h-4 w-4" />
            Call
          </button>
        </div>
      </div>
    </div>
  );
}

function CrowdAlertCard({ data }: { data: CrowdAlertData }) {
  return (
    <div className="flex gap-4 rounded-xl border-t-4 border-[#D32F2F] bg-[#f8ddd4] p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffdad6]">
        <TriangleAlert className="h-6 w-6 text-[#D32F2F]" />
      </div>
      <div className="min-w-0">
        <h4 className="text-[20px] font-semibold leading-[28px] text-[#261813]">
          Crowd Alert: {data.zone}
        </h4>
        <p className="mt-1 text-[16px] leading-[24px] text-[#5a4138]">{data.message}</p>
        <button className="mt-2 flex items-center gap-1 text-[14px] font-semibold text-[#FF7F00]"
          data-testid="button-alternate-route">
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
      className="flex max-w-[85%] flex-col items-start"
    >
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-[4px] bg-[#fff1ec] px-4 py-3.5 shadow-sm">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="h-2 w-2 rounded-full bg-[#FF7F00] opacity-60"
            style={{ animation: `pulse 1.2s ${d}ms infinite` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const { i18n } = useTranslation();
  const { trigger } = useHaptics();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste! I am your KumbhDoot AI assistant. How can I help you navigate the Mela today? You can ask about locations, crowd levels, or nearby amenities.",
      ts: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [chips] = useState(QUICK_CHIPS);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(scrollToBottom, [messages, loading, scrollToBottom]);

  const send = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || loading) return;
      trigger("light");

      const userMsg: Message = { id: uid(), role: "user", content: t, ts: now() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history: ChatMessage[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const responseText = await getChatResponse([...history, { role: "user", content: t }]);
        const cards = detectCards(responseText);

        const aiMsg: Message = {
          id: uid(),
          role: "assistant",
          content: responseText,
          ts: now(),
          cards: cards.length > 0 ? cards : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
            ts: now(),
          },
        ]);
      } finally {
        setLoading(false);
        trigger("light");
      }
    },
    [loading, messages, trigger],
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#fff8f6]">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header
        className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#e2bfb3] bg-[#fee2d9]">
            <span className="text-[20px]">🙏</span>
          </div>
          <h1 className="text-[18px] font-bold tracking-tight text-orange-600">KumbhDoot AI</h1>
        </div>
        <button
          onClick={() => { trigger("light"); setLocation("/"); }}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 active:scale-95"
          data-testid="button-close-chat"
        >
          <Diamond className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
        </button>
      </header>

      {/* ── Messages ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          {messages.map((msg) =>
            msg.role === "assistant"
              ? <AiBubble key={msg.id} msg={msg} />
              : <UserBubble key={msg.id} msg={msg} />,
          )}
          <AnimatePresence>{loading && <TypingBubble />}</AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Bottom area ───────────────────────────────────────────────── */}
      <div
        className="shrink-0 bg-gradient-to-t from-[#fff8f6] via-[#fff8f6] to-transparent"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        {/* Quick chips */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 no-scrollbar">
          {chips.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => send(label)}
              disabled={loading}
              className="flex shrink-0 items-center gap-2 rounded-full border border-[#e2bfb3] bg-white px-4 py-2 text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#5a4138] shadow-sm transition-colors hover:bg-[#fff1ec] active:scale-95 disabled:opacity-40"
              data-testid={`chip-${label.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <Icon className="h-4 w-4 text-[#FF7F00] shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-3 px-4">
          {/* SOS button */}
          <button
            onClick={() => { trigger("medium"); setLocation("/sos"); }}
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-[#D32F2F] text-white shadow-[0_4px_20px_rgba(211,47,47,0.35)] active:scale-90 transition-transform"
            data-testid="button-sos-chat"
          >
            <Asterisk className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-[9px] font-black leading-none tracking-wider">SOS</span>
          </button>

          {/* Text input pill */}
          <div className="relative flex flex-1 items-center overflow-hidden rounded-full border border-[#e2bfb3] bg-white shadow-md focus-within:border-[#FF7F00] transition-colors">
            <Sparkles className="absolute left-4 h-5 w-5 shrink-0 text-[#8e7066]" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask KumbhDoot..."
              disabled={loading}
              className="h-14 w-full bg-transparent pl-11 pr-12 text-[16px] text-[#261813] placeholder:text-[#8e7066] outline-none"
              data-testid="input-chat"
            />
            <button
              onClick={() => setListening((v) => !v)}
              className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-[#5a4138] hover:bg-slate-100 active:scale-90 transition-colors"
              data-testid="button-mic"
            >
              {listening
                ? <MicOff className="h-5 w-5 text-[#D32F2F]" />
                : <Mic className="h-5 w-5" />}
            </button>
          </div>

          {/* Send button */}
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

      {/* Pulse animation for typing dots */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
