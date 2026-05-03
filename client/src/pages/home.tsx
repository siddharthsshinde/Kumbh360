import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Map, MessageSquare, ShieldAlert, Bus, Sun, CloudRain, Cloud,
  ChevronRight, Download, Bell, Navigation2,
  QrCode, Users, Sparkles, Calendar, Heart, Wallet, Ticket, ShoppingBag,
  LayoutDashboard, Droplets, Wind, Flame, Star, X, Mic,
  MapPin, Clock,
} from "lucide-react";
import { Link } from "wouter";
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
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

function getHour() {
  const h = new Date().getHours();
  if (h < 6) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 20) return "evening";
  return "night";
}

const greetings: Record<string, { text: string; emoji: string }> = {
  morning: { text: "Good morning", emoji: "🌅" },
  afternoon: { text: "Good afternoon", emoji: "☀️" },
  evening: { text: "Good evening", emoji: "🌆" },
  night: { text: "Good night", emoji: "🌙" },
};

const SNAN_DATES = [
  { date: "14 Jan", tithi: "Makar Sankranti", type: "Shahi Snan", location: "Ramkund", crowd: "Very High", crowdColor: "bg-red-500" },
  { date: "29 Jan", tithi: "Mauni Amavasya", type: "Shahi Snan", location: "Tapovan", crowd: "Extreme", crowdColor: "bg-red-600" },
  { date: "3 Feb", tithi: "Basant Panchami", type: "Shahi Snan", location: "Ramkund", crowd: "High", crowdColor: "bg-orange-500" },
  { date: "12 Feb", tithi: "Maghi Purnima", type: "Major Snan", location: "Trimbakeshwar", crowd: "Moderate", crowdColor: "bg-yellow-500" },
  { date: "26 Feb", tithi: "Maha Shivratri", type: "Shahi Snan", location: "Ramkund", crowd: "Very High", crowdColor: "bg-red-500" },
];

const QUICK_ACTIONS = [
  { label: "Map", icon: Map, href: "/map", gradient: "from-sky-500 to-blue-600", shadow: "shadow-blue-200" },
  { label: "Chat", icon: MessageSquare, href: "/#chat", gradient: "from-[#FF7F00] to-[#E36A00]", shadow: "shadow-orange-200" },
  { label: "SOS", icon: ShieldAlert, href: "/sos", gradient: "from-red-500 to-red-600", shadow: "shadow-red-200" },
  { label: "Transport", icon: Bus, href: "/#transport", gradient: "from-emerald-500 to-green-600", shadow: "shadow-emerald-200" },
];

const FEATURES = [
  { icon: QrCode, label: "Pass", href: "/explore", color: "bg-orange-100 text-orange-600" },
  { icon: Users, label: "Group", href: "/explore", color: "bg-blue-100 text-blue-600" },
  { icon: Sparkles, label: "Spiritual", href: "/explore", color: "bg-purple-100 text-purple-600" },
  { icon: Calendar, label: "Events", href: "/explore", color: "bg-pink-100 text-pink-600" },
  { icon: Heart, label: "Health", href: "/explore", color: "bg-red-100 text-red-600" },
  { icon: Wallet, label: "Wallet", href: "/explore", color: "bg-emerald-100 text-emerald-600" },
  { icon: Ticket, label: "Queues", href: "/explore", color: "bg-amber-100 text-amber-600" },
  { icon: ShoppingBag, label: "Market", href: "/explore", color: "bg-indigo-100 text-indigo-600" },
];

function WeatherBadge() {
  const { data } = useQuery<WeatherData>({ queryKey: ["/api/weather"] });
  const cond = data?.condition?.toLowerCase() ?? "";
  const Icon = cond.includes("rain") ? CloudRain : cond.includes("cloud") ? Cloud : Sun;
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5" />
      <span>{data ? `${data.temperature}°C` : "—"}</span>
    </div>
  );
}

function CrowdBadge() {
  const { data } = useQuery<CrowdLevel[]>({ queryKey: ["/api/crowd-levels"] });
  const worst = data?.reduce((a, b) => (b.level > a.level ? b : a));
  if (!worst) return null;
  const label = worst.level >= 8 ? "Very Crowded" : worst.level >= 6 ? "Crowded" : "Manageable";
  const dot = worst.level >= 8 ? "bg-red-400" : worst.level >= 6 ? "bg-orange-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
      <span className={cn("h-2 w-2 rounded-full animate-pulse", dot)} />
      <span>{label}</span>
    </div>
  );
}

function LiveStatusBar() {
  const { data: weather } = useQuery<WeatherData>({ queryKey: ["/api/weather"] });
  const { data: crowd } = useQuery<CrowdLevel[]>({ queryKey: ["/api/crowd-levels"] });
  const worst = crowd?.reduce((a, b) => (b.level > a.level ? b : a));

  const tiles = [
    {
      icon: Sun,
      label: "Weather",
      value: weather ? `${weather.temperature}°C` : "—",
      sub: weather?.condition ?? "Loading",
      bg: "bg-sky-50",
      iconColor: "text-sky-500",
    },
    {
      icon: Users,
      label: "Crowd",
      value: worst ? `${worst.level}/10` : "—",
      sub: worst?.status ?? "Loading",
      bg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: weather ? `${weather.humidity}%` : "—",
      sub: "Relative",
      bg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {tiles.map(({ icon: Icon, label, value, sub, bg, iconColor }) => (
        <div key={label} className={cn("rounded-2xl p-3 shadow-sm", bg)}>
          <Icon className={cn("h-4 w-4 mb-1.5", iconColor)} />
          <p className="text-[11px] font-medium text-slate-500">{label}</p>
          <p className="text-base font-bold text-slate-900 leading-tight">{value}</p>
          <p className="text-[10px] text-slate-400 truncate">{sub}</p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const qc = useQueryClient();
  const { trigger } = useHaptics();
  const { canInstall, promptToInstall } = useInstallPrompt();
  const [chatOpen, setChatOpen] = useState(false);

  const handleRefresh = async () => {
    trigger("medium");
    await qc.invalidateQueries();
  };

  const { pullDistance, isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });
  const { text: greeting } = greetings[getHour()];

  return (
    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">

      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />

      {/* ── Hero ── */}
      <motion.section variants={item} className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(140deg,#FF7F00_0%,#FF9A3C_45%,#FF6B00_100%)] p-5 text-white shadow-[0_16px_48px_rgba(255,127,0,0.32)]">
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.22),transparent_50%),radial-gradient(circle_at_15%_80%,rgba(255,100,0,0.3),transparent_45%)]" />

        <div className="relative">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-100">Nashik Kumbh Mela</p>
              <h1 className="mt-1 text-[1.6rem] font-bold leading-tight">{greeting}, Pilgrim</h1>
              <p className="mt-0.5 text-sm text-orange-100/90">Your sacred journey companion</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 shadow-sm backdrop-blur-sm">
                <Navigation2 className="h-5 w-5" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Bell className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Status pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <WeatherBadge />
            <CrowdBadge />
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Flame className="h-3.5 w-3.5 text-yellow-300" />
              <span>Live</span>
            </div>
          </div>

          {/* Next Snan banner */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-white/20">
              <Star className="h-5 w-5 text-yellow-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-100">Next Shahi Snan</p>
              <p className="text-sm font-bold">Makar Sankranti — 14 Jan</p>
              <p className="text-xs text-orange-100/80">Ramkund · Plan your visit</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-orange-100" />
          </div>
        </div>
      </motion.section>

      {/* ── Install banner ── */}
      {canInstall && (
        <motion.button
          variants={item}
          onClick={() => { trigger("light"); void promptToInstall(); }}
          className="flex w-full items-center gap-3 overflow-hidden rounded-[1.5rem] border border-orange-100 bg-[linear-gradient(135deg,#FFF8EC,#FFFFFF)] p-4 shadow-sm text-left"
          data-testid="button-install-pwa"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7F00] shadow-sm">
            <Download className="h-5 w-5 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Add to home screen</p>
            <p className="text-xs text-slate-500">Offline ready · Fast launch · Full-screen</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </motion.button>
      )}

      {/* ── Quick actions ── */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Quick actions</h2>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ label, icon: Icon, href, gradient, shadow }) => (
            <Link
              key={href}
              href={href}
              onClick={() => trigger("light")}
              className="flex flex-col items-center gap-2"
              data-testid={`link-quick-${label.toLowerCase()}`}
            >
              <span className={cn(
                "flex h-[3.5rem] w-full items-center justify-center rounded-2xl bg-gradient-to-br shadow-md",
                gradient, shadow,
              )}>
                <Icon className="h-6 w-6 text-white" />
              </span>
              <span className="text-xs font-semibold text-slate-600">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Live status ── */}
      <motion.div variants={item}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Live status</h2>
        <LiveStatusBar />
      </motion.div>

      {/* ── Snan schedule ── */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Snan schedule 2025</h2>
          <Link href="/explore" onClick={() => trigger("light")}
            className="flex items-center gap-1 text-xs font-semibold text-[#FF7F00]">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-0.5 px-0.5">
          {SNAN_DATES.map((snan) => (
            <div
              key={snan.date}
              className="flex-shrink-0 w-[10rem] rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
              data-testid={`card-snan-${snan.date.replace(" ", "-")}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{snan.type}</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">{snan.date}</p>
                  <p className="text-xs text-[#FF7F00] font-medium">{snan.tithi}</p>
                </div>
                <span className={cn("mt-0.5 h-2.5 w-2.5 rounded-full shrink-0", snan.crowdColor)} />
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                <p className="text-[11px] text-slate-500 truncate">{snan.location}</p>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Users className="h-3 w-3 text-slate-400 shrink-0" />
                <p className="text-[11px] text-slate-500">{snan.crowd}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── KumbhDoot AI assistant ── */}
      <motion.div variants={item}>
        <button
          onClick={() => { trigger("light"); setChatOpen(true); }}
          className="flex w-full items-center gap-3.5 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#1a1a2e,#16213e)] p-4 text-left shadow-lg"
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
              <p className="text-sm font-bold text-white">KumbhDoot</p>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">ONLINE</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">Ask about ghats, timings, safety, transport…</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <Mic className="h-4 w-4 text-slate-300" />
            </div>
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
            variants={item}
            className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF7F00]/10">
                  <MessageSquare className="h-4 w-4 text-[#FF7F00]" />
                </div>
                <span className="text-sm font-semibold text-slate-900">KumbhDoot Assistant</span>
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
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Latest updates</h2>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <NewsWidget />
        </div>
      </motion.div>

      {/* ── Transport ── */}
      <motion.div id="transport" variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Transportation</h2>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <SmartTransportationHub />
        </div>
      </motion.div>

      {/* ── Weather + Crowd detail ── */}
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
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Stay & accommodation</h2>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <AccommodationFinder />
        </div>
      </motion.div>

      {/* ── Food & Water ── */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Food & water safety</h2>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <FoodWaterSafety />
        </div>
      </motion.div>

      {/* ── Community ── */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Community</h2>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <CommunityFeatures />
        </div>
      </motion.div>

      {/* ── Explore features ── */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Explore all features</h2>
          <Link href="/explore" onClick={() => trigger("light")}
            className="flex items-center gap-1 text-xs font-semibold text-[#FF7F00]">
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {FEATURES.map(({ icon: Icon, label, href, color }) => (
            <Link key={label} href={href} onClick={() => trigger("light")}
              className="flex flex-col items-center gap-1.5"
              data-testid={`link-feature-${label.toLowerCase()}`}
            >
              <span className={cn("flex h-12 w-full items-center justify-center rounded-2xl shadow-sm", color)}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-semibold text-slate-600">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Bottom padding ── */}
      <div className="h-2" />
    </motion.div>
  );
}
