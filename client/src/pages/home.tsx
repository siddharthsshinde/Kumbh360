import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Map, MessageSquare, ShieldAlert, Bus, Sun, CloudRain, Cloud,
  ChevronRight, Download, Bell, Mic, X, Users, Zap, Waves,
  MapPin, Bot, UserRound, LayoutGrid, Droplets, Star, Sparkles,
  Navigation, UtensilsCrossed, HeartPulse, Clock,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { ChatInterface } from "@/components/ChatInterface";
import { CrowdLevelIndicator } from "@/components/CrowdLevel";
import { FoodWaterSafety } from "@/components/FoodWaterSafety";
import { NewsWidget } from "@/components/NewsWidget";
import { SmartTransportationHub } from "@/components/SmartTransportationHub";
import { WeatherWidget } from "@/components/WeatherWidget";
import { AccommodationFinder } from "@/components/AccommodationFinder";
import { CommunityFeatures } from "@/components/CommunityFeatures";
import { PullToRefreshIndicator } from "@/components/pwa/PullToRefreshIndicator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useHaptics } from "@/hooks/useHaptics";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import type { WeatherData } from "@shared/types";
import type { CrowdLevel } from "@shared/schema";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: "easeOut" } },
};

const NEARBY_SERVICES = [
  {
    id: "food",
    name: "Annapurna Kitchen",
    badge: { text: "4.8 ★", className: "bg-white/90 text-orange-600" },
    distance: "200m away",
    btnLabel: "Get Directions",
    btnClass: "bg-orange-50 text-orange-700",
    gradient: "from-amber-400 to-orange-500",
    Icon: UtensilsCrossed,
  },
  {
    id: "medical",
    name: "Mela Medical Camp B",
    badge: { text: "24/7 EMERGENCY", className: "bg-red-600 text-white" },
    distance: "450m away",
    btnLabel: "Call Clinic",
    btnClass: "bg-red-50 text-red-700",
    gradient: "from-sky-400 to-blue-500",
    Icon: HeartPulse,
  },
];

export default function Home() {
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const { trigger } = useHaptics();
  const { canInstall, promptToInstall } = useInstallPrompt();
  const [chatOpen, setChatOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const { data: weather } = useQuery<WeatherData>({ queryKey: ["/api/weather"] });
  const { data: crowd } = useQuery<CrowdLevel[]>({ queryKey: ["/api/crowd-levels"] });

  const handleRefresh = async () => {
    trigger("medium");
    await qc.invalidateQueries();
  };
  const { pullDistance, isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const worst = crowd?.reduce((a, b) => (b.level > a.level ? b : a));
  const crowdLabel = !worst ? "Checking…" : worst.level >= 8 ? "Very Crowded" : worst.level >= 6 ? "Crowded" : "Manageable";
  const highCrowd = (worst?.level ?? 0) >= 6;

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuery.trim()) {
      trigger("light");
      setChatOpen(true);
    }
  };

  return (
    <>
      {/* ── Fixed TopAppBar ── */}
      <div className="fixed left-0 right-0 top-0 z-[55] border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-16 max-w-screen-sm items-center justify-between px-4">
          {/* Left: avatar + location */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#FF7F00] bg-orange-100">
              <UserRound className="h-5 w-5 text-[#FF7F00]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Current Location
              </span>
              <span className="text-[15px] font-bold text-orange-700">Nashik, Trimbakeshwar</span>
            </div>
          </div>
          {/* Right: bell */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100 active:scale-95"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* ── Spacer for fixed top bar ── */}
      <div className="h-16" />

      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />

      <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">

        {/* ── AI Search Bar ── */}
        <motion.form variants={item} onSubmit={handleAiSearch} className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <Sparkles className="h-5 w-5 text-violet-600" />
          </div>
          <input
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-[15px] shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder="Ask AI: 'Where is the nearest medical camp?'"
            data-testid="input-ai-search"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-4 flex items-center"
            onClick={() => { trigger("light"); setChatOpen(true); }}
            data-testid="button-ai-mic"
          >
            <Mic className="h-5 w-5 text-slate-400" />
          </button>
        </motion.form>

        {/* ── Live Insights ── */}
        <motion.section variants={item} className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 fill-[#FF7F00] text-[#FF7F00]" />
            <h2 className="text-[17px] font-semibold text-slate-900">Live Insights</h2>
          </div>
          <div className="space-y-3">
            {/* High crowd card */}
            <div className="flex items-start gap-4 overflow-hidden rounded-xl border-l-4 border-red-600 bg-red-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-red-700">
                  {highCrowd ? "High crowd nearby" : "Crowd levels normal"}
                </h3>
                <p className="mt-0.5 text-[13px] leading-snug text-slate-500">
                  {highCrowd
                    ? `${worst?.location ?? "Ramkund"} reaching high capacity. Consider alternate ghats for ease.`
                    : "All ghat areas are operating at comfortable capacity right now."}
                </p>
              </div>
            </div>
            {/* Best snan time card */}
            <div className="flex items-start gap-4 overflow-hidden rounded-xl border-l-4 border-emerald-600 bg-emerald-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <Waves className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-emerald-700">Best time for Snan: 4 AM</h3>
                <p className="mt-0.5 text-[13px] leading-snug text-slate-500">
                  Early morning slots show 40% less queue time today at Trimbakeshwar.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Quick Access bento grid ── */}
        <motion.section variants={item}>
          <h2 className="mb-4 text-[17px] font-semibold text-slate-900">Quick Access</h2>
          <div className="grid grid-cols-4 grid-rows-2 gap-3">
            {/* Large 2×2 — Interactive Map */}
            <Link
              href="/map"
              onClick={() => trigger("light")}
              className="col-span-2 row-span-2 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF7F00] to-[#c43c00] p-4 text-white active:scale-95 transition-transform"
              data-testid="link-quick-map"
            >
              <Map className="h-8 w-8" style={{ fill: "rgba(255,255,255,0.9)", stroke: "none" }} />
              <div>
                <p className="text-[18px] font-bold leading-tight">Interactive Map</p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-white/70">
                  Navigate the Mela
                </p>
              </div>
              {/* Decorative ghost icon */}
              <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-10">
                <Navigation className="h-28 w-28" />
              </div>
            </Link>

            {/* Services — spans 2 cols */}
            <Link
              href="/explore"
              onClick={() => trigger("light")}
              className="col-span-2 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 active:scale-95 transition-transform"
              data-testid="link-quick-services"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <span className="text-[14px] font-semibold text-blue-700">Services</span>
            </Link>

            {/* Group */}
            <Link
              href="/explore"
              onClick={() => trigger("light")}
              className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-2xl bg-orange-50 p-4 active:scale-95 transition-transform"
              data-testid="link-quick-group"
            >
              <Users className="h-5 w-5 text-[#FF7F00]" />
              <span className="text-[11px] font-semibold text-slate-600">Group</span>
            </Link>

            {/* Assistant */}
            <button
              onClick={() => { trigger("light"); setChatOpen(true); }}
              className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-2xl bg-violet-50 p-4 active:scale-95 transition-transform"
              data-testid="button-quick-assistant"
            >
              <Bot className="h-5 w-5 text-violet-600" />
              <span className="text-[11px] font-semibold text-slate-600">Assistant</span>
            </button>
          </div>
        </motion.section>

        {/* ── Live Ghat Status ── */}
        <motion.section variants={item} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-slate-900">Live Ghat Status</h2>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
              LIVE
            </span>
          </div>
          {/* Ghat photo card */}
          <div className="relative h-48 overflow-hidden rounded-2xl shadow-lg">
            {/* Gradient standing in for ghat photo */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-orange-700 to-amber-600">
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: "radial-gradient(circle at 30% 60%, rgba(255,200,50,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,140,0,0.4) 0%, transparent 45%)" }} />
            </div>
            {/* SVG ghat silhouette suggestion */}
            <svg viewBox="0 0 400 200" className="absolute inset-x-0 bottom-0 h-full w-full" preserveAspectRatio="xMidYMax meet">
              <path d="M0 160 Q50 120 80 130 Q100 90 120 100 Q160 60 180 70 Q200 50 220 65 Q250 45 270 80 Q300 95 320 85 Q360 70 400 110 L400 200 L0 200 Z" fill="rgba(0,0,0,0.2)" />
              <path d="M0 180 Q80 160 140 170 Q200 155 260 165 Q320 150 400 170 L400 200 L0 200 Z" fill="rgba(0,0,0,0.25)" />
              {/* Temple spire */}
              <path d="M185 45 L195 20 L205 45 Z" fill="rgba(255,220,100,0.7)" />
              <rect x="183" y="45" width="24" height="8" rx="2" fill="rgba(255,200,80,0.6)" />
              <rect x="180" y="53" width="30" height="6" rx="2" fill="rgba(255,200,80,0.55)" />
              <rect x="176" y="59" width="38" height="5" rx="2" fill="rgba(255,200,80,0.5)" />
            </svg>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-[13px] font-semibold">Ramkund Ghat · Nashik</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-full border border-green-400/40 bg-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-300">
                  {crowdLabel.toUpperCase()} CROWD
                </span>
                <span className="flex items-center gap-1 text-[11px] text-white/70">
                  <Clock className="h-3 w-3" /> Updated just now
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Nearby Services horizontal scroll ── */}
        <motion.section variants={item}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-slate-900">Nearby Services</h2>
            <Link href="/map" onClick={() => trigger("light")}
              className="text-[13px] font-semibold text-[#FF7F00]">
              View All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-0.5 px-0.5">
            {NEARBY_SERVICES.map((svc) => (
              <div key={svc.id}
                className="flex-shrink-0 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                data-testid={`card-service-${svc.id}`}
              >
                {/* Image area */}
                <div className={cn("relative h-32 bg-gradient-to-br", svc.gradient)}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svc.Icon className="h-14 w-14 text-white/30" />
                  </div>
                  <span className={cn("absolute right-2 top-2 rounded-lg px-2 py-1 text-[10px] font-bold", svc.badge.className)}>
                    {svc.badge.text}
                  </span>
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-slate-900">{svc.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {svc.distance}
                  </p>
                  <button className={cn("mt-3 w-full rounded-xl py-2 text-[13px] font-semibold", svc.btnClass)}
                    data-testid={`button-service-${svc.id}`}>
                    {svc.btnLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Install banner ── */}
        {canInstall && (
          <motion.button
            variants={item}
            onClick={() => { trigger("light"); void promptToInstall(); }}
            className="flex w-full items-center gap-3 overflow-hidden rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-[#FFF8EC] to-white p-4 text-left shadow-sm"
            data-testid="button-install-pwa"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7F00] shadow-sm">
              <Download className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-slate-900">Add to home screen</p>
              <p className="text-[11px] text-slate-500">Offline ready · Fast launch · Full-screen</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          </motion.button>
        )}

        {/* ── KumbhDoot AI assistant ── */}
        <motion.div variants={item}>
          <button
            onClick={() => { trigger("light"); setChatOpen(true); }}
            className="flex w-full items-center gap-3.5 overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-4 text-left shadow-lg"
            data-testid="button-open-kumbhdoot"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7F00] to-[#E36A00] shadow-md">
              <MessageSquare className="h-6 w-6 text-white" />
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-[#1a1a2e]">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-white">KumbhDoot</p>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">ONLINE</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">Ask about ghats, timings, safety, transport…</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <Mic className="h-4 w-4 text-slate-300" />
            </div>
          </button>
        </motion.div>

        {/* ── Chat panel ── */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              key="chat-panel"
              id="chat"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF7F00]/10">
                    <MessageSquare className="h-4 w-4 text-[#FF7F00]" />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-900">KumbhDoot Assistant</span>
                </div>
                <button
                  onClick={() => { trigger("light"); setChatOpen(false); }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                  data-testid="button-close-chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ChatInterface />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── News ── */}
        <motion.div variants={item}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold uppercase tracking-wide text-slate-400">Latest Updates</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <NewsWidget />
          </div>
        </motion.div>

        {/* ── Transport ── */}
        <motion.div id="transport" variants={item}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold uppercase tracking-wide text-slate-400">Transportation</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <SmartTransportationHub />
          </div>
        </motion.div>

        {/* ── Weather + Crowd ── */}
        <motion.div variants={item} className="grid gap-3 sm:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <WeatherWidget />
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <CrowdLevelIndicator />
          </div>
        </motion.div>

        {/* ── Accommodation ── */}
        <motion.div variants={item}>
          <div className="mb-3">
            <h2 className="text-[15px] font-semibold uppercase tracking-wide text-slate-400">Stay & Accommodation</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <AccommodationFinder />
          </div>
        </motion.div>

        {/* ── Food & Water ── */}
        <motion.div variants={item}>
          <div className="mb-3">
            <h2 className="text-[15px] font-semibold uppercase tracking-wide text-slate-400">Food & Water Safety</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <FoodWaterSafety />
          </div>
        </motion.div>

        {/* ── Community ── */}
        <motion.div variants={item}>
          <div className="mb-3">
            <h2 className="text-[15px] font-semibold uppercase tracking-wide text-slate-400">Community</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <CommunityFeatures />
          </div>
        </motion.div>

        <div className="h-4" />
      </motion.div>

      {/* ── Pulsing SOS FAB ── */}
      <Link
        href="/sos"
        onClick={() => trigger("error")}
        className="fixed left-4 z-[54] flex h-14 w-14 flex-col items-center justify-center rounded-full bg-red-600 text-white shadow-xl active:scale-90 transition-transform"
        style={{
          bottom: "calc(5rem + env(safe-area-inset-bottom))",
          animation: "sos-pulse 2s infinite",
        }}
        data-testid="button-sos-fab"
      >
        <ShieldAlert className="h-6 w-6" />
        <span className="mt-[-2px] text-[9px] font-black tracking-widest">SOS</span>
      </Link>

      {/* Inject SOS pulse keyframes */}
      <style>{`
        @keyframes sos-pulse {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(211,47,47,0.7); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 14px rgba(211,47,47,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(211,47,47,0); }
        }
      `}</style>
    </>
  );
}
