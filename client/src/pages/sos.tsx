import { motion } from "framer-motion";
import { ArrowRight, MapPinned, ShieldAlert, Siren, Phone, UserCheck } from "lucide-react";
import { Link } from "wouter";
import { CrowdLevelIndicator } from "@/components/CrowdLevel";
import { EmergencyTransport } from "@/components/EmergencyTransport";
import { RealTimeSafetySuggestion } from "@/components/RealTimeSafetySuggestion";
import { WeatherWidget } from "@/components/WeatherWidget";
import type { EmergencyActionsController } from "@/hooks/useEmergencyActions";
import { useHaptics } from "@/hooks/useHaptics";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SOSPageProps {
  emergency: EmergencyActionsController;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

export default function SOSPage({ emergency }: SOSPageProps) {
  const { trigger } = useHaptics();

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">

      {/* ── Emergency hero ── */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#C0292A,#E84040_60%,#D14343)] p-5 text-white shadow-[0_12px_40px_rgba(209,67,67,0.35)]"
      >
        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_80%_20%,white,transparent_55%)]" />
        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200">Emergency</p>
              <h1 className="mt-1 text-2xl font-bold">Fast help, fast action</h1>
              <p className="mt-0.5 text-sm text-red-100">Share location · Send SOS · Call for help</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Siren className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => { trigger("warning"); emergency.shareLocation(); }}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-2xl border-white/30 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25",
              )}
            >
              <MapPinned className="h-4 w-4" />
              Share location
            </button>
            <button
              type="button"
              onClick={() => { trigger("error"); emergency.openSOS(); }}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50"
            >
              <ShieldAlert className="h-4 w-4" />
              Open SOS composer
            </button>
          </div>
        </div>
      </motion.section>

      {/* ── Info tiles ── */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {[
          { icon: MapPinned, label: "GPS attached", sub: "Auto location included", color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: UserCheck, label: "Your contacts", sub: "Alert trusted people", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Phone, label: "Control room", sub: "Officials notified", color: "text-orange-600", bg: "bg-orange-50" },
        ].map(({ icon: Icon, label, sub, color, bg }) => (
          <div key={label} className="flex flex-col gap-2 rounded-[1.5rem] border border-slate-100 bg-white p-3 shadow-sm">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-900">{label}</p>
              <p className="text-[11px] leading-4 text-slate-500">{sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Safety suggestion ── */}
      <motion.div
        variants={item}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      >
        <RealTimeSafetySuggestion />
      </motion.div>

      {/* ── Transport ── */}
      <motion.div
        variants={item}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      >
        <EmergencyTransport />
      </motion.div>

      {/* ── Status widgets ── */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <WeatherWidget />
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <CrowdLevelIndicator />
        </div>
      </motion.div>

      {/* ── Profile CTA ── */}
      <motion.div
        variants={item}
        className="rounded-[2rem] border border-slate-200 bg-slate-900 p-5 text-slate-100"
      >
        <h3 className="text-lg font-semibold">Keep your profile ready</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Add trusted emergency contacts so SOS alerts stay actionable.
        </p>
        <Link
          href="/profile"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "mt-4 inline-flex rounded-2xl bg-white text-slate-900 hover:bg-slate-100",
          )}
        >
          Manage profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
