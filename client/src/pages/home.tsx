import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Map, MessageSquare, AlertTriangle, Bus, Utensils, Users,
  Hotel, Sun, CloudRain, Cloud, Droplets, Wind, ChevronRight,
  Download, Bell, Navigation2, ShieldAlert,
  QrCode, Sparkles, Calendar, Heart, Wallet, Ticket, ShoppingBag, LayoutDashboard, Compass,
} from "lucide-react";
import { Link } from "wouter";
import { ChatInterface } from "@/components/ChatInterface";
import { CrowdLevelIndicator } from "@/components/CrowdLevel";
import { FoodWaterSafety } from "@/components/FoodWaterSafety";
import { NewsWidget } from "@/components/NewsWidget";
import { RealTimeSafetySuggestion } from "@/components/RealTimeSafetySuggestion";
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
  show: { transition: { staggerChildren: 0.055 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

function getHour() {
  const h = new Date().getHours();
  if (h < 6) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 20) return "evening";
  return "night";
}
const greetings: Record<string, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Good night",
};

const QUICK_ACTIONS = [
  { label: "Map", icon: Map, href: "/map", color: "bg-blue-500", light: "bg-blue-50 text-blue-700" },
  { label: "Chat", icon: MessageSquare, href: "/#chat", color: "bg-[#FF7F00]", light: "bg-orange-50 text-orange-700" },
  { label: "SOS", icon: ShieldAlert, href: "/sos", color: "bg-red-500", light: "bg-red-50 text-red-700" },
  { label: "Transport", icon: Bus, href: "/#transport", color: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700" },
];

function WeatherPill() {
  const { data } = useQuery<WeatherData>({ queryKey: ["/api/weather"] });
  const cond = data?.condition?.toLowerCase() ?? "";
  const icon = cond.includes("rain") ? CloudRain : cond.includes("cloud") ? Cloud : Sun;
  const Icon = icon;
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-[#FF7F00]" />
      <span className="text-slate-700">{data ? `${data.temperature}°C` : "—"}</span>
      {data && <span className="hidden text-slate-400 xs:inline">· {data.humidity}% RH</span>}
    </div>
  );
}

function CrowdPill() {
  const { data } = useQuery<CrowdLevel[]>({ queryKey: ["/api/crowd-levels"] });
  const worst = data?.reduce((a, b) => (b.level > a.level ? b : a));
  if (!worst) return null;
  const color =
    worst.level >= 8 ? "bg-red-50 text-red-700" :
    worst.level >= 6 ? "bg-orange-50 text-orange-700" :
    "bg-emerald-50 text-emerald-700";
  const dot =
    worst.level >= 8 ? "bg-red-500" :
    worst.level >= 6 ? "bg-orange-500" : "bg-emerald-500";
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm", color)}>
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      {worst.status ?? worst.location}
    </div>
  );
}

export default function Home() {
  const qc = useQueryClient();
  const { trigger } = useHaptics();
  const { canInstall, promptToInstall } = useInstallPrompt();

  const handleRefresh = async () => {
    trigger("medium");
    await qc.invalidateQueries();
  };

  const { pullDistance, isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const greeting = greetings[getHour()];

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">

      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />

      {/* ── App hero header ── */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#FF7F00,#FFa040_60%,#FF6B00)] p-5 text-white shadow-[0_12px_40px_rgba(255,127,0,0.35)]"
      >
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_80%_20%,white,transparent_55%)]" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-100">Kumbh360</p>
              <h1 className="mt-1 text-2xl font-bold">{greeting}, Pilgrim</h1>
              <p className="mt-0.5 text-sm text-orange-100">Stay safe · Stay informed</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Navigation2 className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <WeatherPill />
            <CrowdPill />
          </div>
        </div>
      </motion.section>

      {/* ── Install banner ── */}
      {canInstall && (
        <motion.button
          variants={item}
          onClick={() => { trigger("light"); void promptToInstall(); }}
          className="flex w-full items-center gap-3 overflow-hidden rounded-[1.5rem] border border-orange-100 bg-[linear-gradient(135deg,#FFF8EC,#FFFFFF)] p-4 shadow-sm text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7F00] shadow-sm">
            <Download className="h-5 w-5 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Add to home screen</p>
            <p className="text-xs text-slate-500">Full-screen · Offline shell · Fast launch</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </motion.button>
      )}

      {/* ── Quick actions ── */}
      <motion.div variants={item}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Quick actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, icon: Icon, href, color }) => (
            <Link
              key={href}
              href={href}
              onClick={() => trigger("light")}
              className="flex flex-col items-center gap-2"
            >
              <span className={cn("flex h-14 w-full items-center justify-center rounded-2xl shadow-sm", color)}>
                <Icon className="h-6 w-6 text-white" />
              </span>
              <span className="text-xs font-medium text-slate-600">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Safety suggestion ── */}
      <motion.div
        variants={item}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      >
        <RealTimeSafetySuggestion />
      </motion.div>

      {/* ── Chat assistant ── */}
      <motion.div
        id="chat"
        variants={item}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      >
        <ChatInterface />
      </motion.div>

      {/* ── Weather + crowd side by side on wider screens ── */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <WeatherWidget />
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <CrowdLevelIndicator />
        </div>
      </motion.div>

      {/* ── News ── */}
      <motion.div
        variants={item}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      >
        <NewsWidget />
      </motion.div>

      {/* ── Transport ── */}
      <motion.div
        id="transport"
        variants={item}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      >
        <SmartTransportationHub />
      </motion.div>

      {/* ── Accommodation ── */}
      <motion.div
        variants={item}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      >
        <AccommodationFinder />
      </motion.div>

      {/* ── Food & Water ── */}
      <motion.div
        variants={item}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      >
        <FoodWaterSafety />
      </motion.div>

      {/* ── Community ── */}
      <motion.div
        variants={item}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      >
        <CommunityFeatures />
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
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: QrCode, label: "Pass", href: "/explore", color: "bg-orange-100 text-orange-600" },
            { icon: Users, label: "Group", href: "/explore", color: "bg-blue-100 text-blue-600" },
            { icon: Sparkles, label: "Spiritual", href: "/explore", color: "bg-purple-100 text-purple-600" },
            { icon: Calendar, label: "Events", href: "/explore", color: "bg-pink-100 text-pink-600" },
            { icon: Heart, label: "Health", href: "/explore", color: "bg-red-100 text-red-600" },
            { icon: Wallet, label: "Wallet", href: "/explore", color: "bg-emerald-100 text-emerald-600" },
            { icon: Ticket, label: "Queues", href: "/explore", color: "bg-amber-100 text-amber-600" },
            { icon: ShoppingBag, label: "Market", href: "/explore", color: "bg-indigo-100 text-indigo-600" },
          ].map(({ icon: Icon, label, href, color }) => (
            <Link key={label} href={href} onClick={() => trigger("light")}
              className="flex flex-col items-center gap-1.5">
              <span className={cn("flex h-12 w-full items-center justify-center rounded-2xl", color)}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-medium text-slate-600">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
