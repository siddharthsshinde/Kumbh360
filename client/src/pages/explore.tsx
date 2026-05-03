import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Users, Sparkles, Calendar, Heart, Wallet, Ticket, ShoppingBag,
  LayoutDashboard, ChevronRight, ArrowLeft, Compass,
} from "lucide-react";
import { DigitalKumbhPass } from "@/components/DigitalKumbhPass";
import { GroupModule } from "@/components/GroupModule";
import { SpiritualGuide } from "@/components/SpiritualGuide";
import { EventsSchedule } from "@/components/EventsSchedule";
import { HealthServices } from "@/components/HealthServices";
import { WalletWidget } from "@/components/WalletWidget";
import { QueueStatus } from "@/components/QueueStatus";
import { MarketplaceWidget } from "@/components/MarketplaceWidget";
import { PersonalDashboard } from "@/components/PersonalDashboard";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

type FeatureKey = "pass" | "group" | "spiritual" | "events" | "health" | "wallet" | "queue" | "market" | "dashboard";

const FEATURES: {
  key: FeatureKey;
  icon: typeof QrCode;
  label: string;
  desc: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
}[] = [
  { key: "pass",      icon: QrCode,          label: "Kumbh Pass",   desc: "Digital QR pass & identity",       gradient: "from-orange-50 to-amber-50",    iconBg: "bg-orange-100",   iconColor: "text-orange-600",  badge: "Tap to flip" },
  { key: "group",     icon: Users,           label: "My Group",     desc: "Family tracking & group SOS",      gradient: "from-blue-50 to-indigo-50",     iconBg: "bg-blue-100",     iconColor: "text-blue-600",    badge: "1 alert" },
  { key: "spiritual", icon: Sparkles,        label: "Spiritual",    desc: "Snan dates, temples & mantras",    gradient: "from-purple-50 to-violet-50",   iconBg: "bg-purple-100",   iconColor: "text-purple-600" },
  { key: "events",    icon: Calendar,        label: "Events",       desc: "Pravachan, aarti & processions",   gradient: "from-pink-50 to-rose-50",       iconBg: "bg-pink-100",     iconColor: "text-pink-600",    badge: "Today" },
  { key: "health",    icon: Heart,           label: "Health",       desc: "Hospitals, doctors & ambulance",   gradient: "from-red-50 to-rose-50",        iconBg: "bg-red-100",      iconColor: "text-red-600",     badge: "Emergency" },
  { key: "wallet",    icon: Wallet,          label: "Wallet",       desc: "Payments, expenses & donations",   gradient: "from-emerald-50 to-teal-50",    iconBg: "bg-emerald-100",  iconColor: "text-emerald-600" },
  { key: "queue",     icon: Ticket,          label: "Queues",       desc: "Virtual queues & wait times",      gradient: "from-amber-50 to-yellow-50",    iconBg: "bg-amber-100",    iconColor: "text-amber-600",   badge: "Live" },
  { key: "market",    icon: ShoppingBag,     label: "Marketplace",  desc: "Vendors, puja items & food",       gradient: "from-indigo-50 to-blue-50",     iconBg: "bg-indigo-100",   iconColor: "text-indigo-600" },
  { key: "dashboard", icon: LayoutDashboard, label: "My Journey",   desc: "Daily plan, bookings & stats",     gradient: "from-teal-50 to-cyan-50",       iconBg: "bg-teal-100",     iconColor: "text-teal-600" },
];

const COMPONENTS: Record<FeatureKey, React.ComponentType> = {
  pass:      DigitalKumbhPass,
  group:     GroupModule,
  spiritual: SpiritualGuide,
  events:    EventsSchedule,
  health:    HealthServices,
  wallet:    WalletWidget,
  queue:     QueueStatus,
  market:    MarketplaceWidget,
  dashboard: PersonalDashboard,
};

export default function ExplorePage() {
  const { trigger } = useHaptics();
  const [active, setActive] = useState<FeatureKey | null>(null);

  const open = (key: FeatureKey) => { trigger("light"); setActive(key); };
  const close = () => { trigger("light"); setActive(null); };

  const feature = active ? FEATURES.find(f => f.key === active) : null;
  const ActiveComponent = active ? COMPONENTS[active] : null;

  return (
    <div className="relative">
      {/* ── Grid view ── */}
      <AnimatePresence>
        {!active && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Hero */}
            <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(140deg,#7C3AED_0%,#9F67F7_45%,#6D28D9_100%)] p-5 text-white shadow-[0_16px_48px_rgba(124,58,237,0.28)]">
              <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_50%)]" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-200">All features</p>
                  <h1 className="mt-1 text-[1.6rem] font-bold leading-tight">Explore</h1>
                  <p className="mt-0.5 text-sm text-violet-100/90">Your complete Kumbh toolkit</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Compass className="h-5 w-5" />
                </div>
              </div>
            </section>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.button
                    key={f.key}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.22 }}
                    onClick={() => open(f.key)}
                    className={cn(
                      "relative flex flex-col gap-3 overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-4 text-left shadow-sm border border-white/80 hover:shadow-md active:scale-[0.98] transition-all",
                      f.gradient,
                    )}
                    data-testid={`button-feature-${f.key}`}
                  >
                    {f.badge && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm">
                        {f.badge}
                      </span>
                    )}
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm", f.iconBg, f.iconColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{f.label}</p>
                      <p className="mt-0.5 text-xs leading-tight text-slate-500">{f.desc}</p>
                    </div>
                    <ChevronRight className="absolute bottom-3 right-3 h-4 w-4 text-slate-300" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Feature detail panel ── */}
      <AnimatePresence>
        {active && feature && ActiveComponent && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm"
          >
            {/* Back header */}
            <div className={cn("flex items-center gap-3 bg-gradient-to-r p-4", feature.gradient)}>
              <button
                onClick={close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
                data-testid="button-feature-back"
              >
                <ArrowLeft className="h-4 w-4 text-slate-700" />
              </button>
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-sm", feature.iconBg, feature.iconColor)}>
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{feature.label}</p>
                <p className="text-xs text-slate-500">{feature.desc}</p>
              </div>
            </div>

            <ActiveComponent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
