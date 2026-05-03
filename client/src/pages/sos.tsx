import { motion } from "framer-motion";
import { ArrowRight, MapPinned, ShieldAlert, Siren, Phone, UserCheck, AlertTriangle, Activity } from "lucide-react";
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

const EMERGENCY_CONTACTS = [
  { icon: Phone, label: "Police", number: "100", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { icon: Activity, label: "Ambulance", number: "108", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
  { icon: Siren, label: "Fire", number: "101", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  { icon: AlertTriangle, label: "Disaster", number: "1078", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" },
];

export default function SOSPage({ emergency }: SOSPageProps) {
  const { trigger } = useHaptics();

  return (
    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">

      {/* ── Emergency hero ── */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(140deg,#C0292A_0%,#E84040_50%,#D14343_100%)] p-5 text-white shadow-[0_16px_48px_rgba(209,67,67,0.32)]"
      >
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_50%)]" />
        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200">Emergency</p>
              <h1 className="mt-1 text-[1.6rem] font-bold leading-tight">Fast help, fast action</h1>
              <p className="mt-0.5 text-sm text-red-100/90">Share location · Send SOS · Call for help</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Siren className="h-5 w-5" />
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => { trigger("warning"); emergency.shareLocation(); }}
              className="flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
              data-testid="button-share-location"
            >
              <MapPinned className="h-4 w-4" />
              Share location
            </button>
            <button
              type="button"
              onClick={() => { trigger("error"); emergency.openSOS(); }}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow-md hover:bg-red-50 transition-colors"
              data-testid="button-open-sos"
            >
              <ShieldAlert className="h-4 w-4" />
              Send SOS alert
            </button>
          </div>
        </div>
      </motion.section>

      {/* ── Emergency numbers ── */}
      <motion.div variants={item}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Emergency numbers</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {EMERGENCY_CONTACTS.map(({ icon: Icon, label, number, color, bg, border }) => (
            <a
              key={label}
              href={`tel:${number}`}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border p-3 shadow-sm transition-all active:scale-95",
                bg, border,
              )}
              data-testid={`link-emergency-${label.toLowerCase()}`}
            >
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm", color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-900">{number}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            </a>
          ))}
        </div>
      </motion.div>

      {/* ── Info tiles ── */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2.5">
        {[
          { icon: MapPinned, label: "GPS attached", sub: "Location auto-included", color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: UserCheck, label: "Alert contacts", sub: "Your trusted people", color: "text-blue-600", bg: "bg-blue-50" },
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
      <motion.div variants={item} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <RealTimeSafetySuggestion />
      </motion.div>

      {/* ── Transport ── */}
      <motion.div variants={item} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <EmergencyTransport />
      </motion.div>

      {/* ── Status widgets ── */}
      <motion.div variants={item} className="grid gap-3 sm:grid-cols-2">
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
        className="flex items-start gap-4 rounded-[2rem] border border-slate-200 bg-slate-900 p-5 text-slate-100"
      >
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <UserCheck className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Keep your profile ready</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Add trusted emergency contacts so SOS alerts stay actionable.
          </p>
          <Link
            href="/profile"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "mt-3 inline-flex rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs h-8",
            )}
          >
            Manage profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>

    </motion.div>
  );
}
