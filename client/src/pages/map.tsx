import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, SearchCheck, Layers3, MapPin, Navigation } from "lucide-react";
import { FacilityMap } from "@/components/FacilityMap";
import { KumbhLocationsInfo } from "@/components/KumbhLocationsInfo";
import { LostAndFound } from "@/components/LostAndFound";
import { SmartTransportationHub } from "@/components/SmartTransportationHub";
import { StreetView } from "@/components/StreetView";
import { TransportationGuide } from "@/components/TransportationGuide";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

const MAP_TOOLS = [
  {
    key: "street",
    icon: Camera,
    label: "Street View",
    desc: "Visual orientation",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    activeBg: "bg-blue-600",
  },
  {
    key: "lost",
    icon: SearchCheck,
    label: "Lost & Found",
    desc: "Report missing items",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    activeBg: "bg-[#FF7F00]",
  },
];

export default function MapPage() {
  const [showStreetView, setShowStreetView] = useState(false);
  const [showLostAndFound, setShowLostAndFound] = useState(false);

  const toggleStreet = () => setShowStreetView((v) => !v);
  const toggleLost = () => setShowLostAndFound((v) => !v);

  return (
    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">

      {/* ── Hero ── */}
      <motion.section variants={item} className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(140deg,#0EA5E9_0%,#0284C7_50%,#075985_100%)] p-5 text-white shadow-[0_16px_48px_rgba(14,165,233,0.28)]">
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Navigation hub</p>
              <h1 className="mt-1 text-[1.6rem] font-bold leading-tight">Kumbh Map</h1>
              <p className="mt-0.5 text-sm text-sky-100/90">Facilities, crowd zones & directions</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Navigation className="h-5 w-5" />
            </div>
          </div>

          {/* Tool quick toggles */}
          <div className="mt-4 flex gap-2.5">
            {MAP_TOOLS.map(({ key, icon: Icon, label, activeBg }) => {
              const isOn = key === "street" ? showStreetView : showLostAndFound;
              const toggle = key === "street" ? toggleStreet : toggleLost;
              return (
                <button
                  key={key}
                  onClick={toggle}
                  data-testid={`button-toggle-${key}`}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-semibold transition-all",
                    isOn
                      ? cn("text-white shadow-md", activeBg)
                      : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── Optional panels ── */}
      {showStreetView && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
        >
          <StreetView />
        </motion.div>
      )}

      {showLostAndFound && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
        >
          <LostAndFound />
        </motion.div>
      )}

      {/* ── Main map ── */}
      <motion.div variants={item} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <FacilityMap />
      </motion.div>

      {/* ── Info + transport ── */}
      <motion.div variants={item} className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <KumbhLocationsInfo />
        </div>
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <SmartTransportationHub />
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <TransportationGuide />
          </div>
        </div>
      </motion.div>

      {/* ── Info tip ── */}
      <motion.div
        variants={item}
        className="flex items-start gap-3 rounded-[2rem] border border-slate-200 bg-slate-900 p-5 text-slate-100"
      >
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Layers3 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Offline-ready maps</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Map tiles and facility data are cached locally so navigation stays available even with poor connectivity.
          </p>
        </div>
      </motion.div>

    </motion.div>
  );
}
