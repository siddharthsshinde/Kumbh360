import { motion } from "framer-motion";
import { ArrowRight, MapPinned, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { CrowdLevelIndicator } from "@/components/CrowdLevel";
import { EmergencyTransport } from "@/components/EmergencyTransport";
import { RealTimeSafetySuggestion } from "@/components/RealTimeSafetySuggestion";
import { WeatherWidget } from "@/components/WeatherWidget";
import type { EmergencyActionsController } from "@/hooks/useEmergencyActions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SOSPageProps {
  emergency: EmergencyActionsController;
}

export default function SOSPage({ emergency }: SOSPageProps) {
  return (
    <motion.div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-red-100 bg-[linear-gradient(135deg,#FFF1F1,#FFFFFF_55%,#FFF7F0)] p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">
              Emergency mode
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Fast help when you need it most
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Share your live location, send a detailed SOS alert, and keep
              critical transport information close at hand.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={emergency.shareLocation}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                )}
              >
                <MapPinned className="h-4 w-4" />
                Share location
              </button>
              <button
                type="button"
                onClick={emergency.openSOS}
                className={cn(
                  buttonVariants({ variant: "destructive" }),
                  "rounded-2xl bg-[#D14343] hover:bg-[#B73434]",
                )}
              >
                <ShieldAlert className="h-4 w-4" />
                Open SOS composer
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Location attached automatically
              </div>
              <p className="mt-1 text-sm text-slate-600">
                The alert flow keeps the current geolocation request in place.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Control room and contacts
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Toggle whether the alert goes to officials, trusted contacts, or
                both.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Ready for mobile use
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Bottom navigation keeps emergency access thumb-friendly on small
                screens.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <RealTimeSafetySuggestion />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <EmergencyTransport />
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <WeatherWidget />
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <CrowdLevelIndicator />
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-5 text-slate-100">
            <h3 className="text-lg font-semibold">Keep your profile ready</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Add trusted emergency contacts and personalize the app from the
              profile route so SOS alerts stay actionable.
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}
