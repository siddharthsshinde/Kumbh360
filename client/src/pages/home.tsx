import { motion } from "framer-motion";
import { ArrowRight, Compass, MessageSquareMore, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { AccommodationFinder } from "@/components/AccommodationFinder";
import { ChatInterface } from "@/components/ChatInterface";
import { CommunityFeatures } from "@/components/CommunityFeatures";
import { CrowdLevelIndicator } from "@/components/CrowdLevel";
import { FoodWaterSafety } from "@/components/FoodWaterSafety";
import { NewsWidget } from "@/components/NewsWidget";
import { RealTimeSafetySuggestion } from "@/components/RealTimeSafetySuggestion";
import { SmartTransportationHub } from "@/components/SmartTransportationHub";
import { WeatherWidget } from "@/components/WeatherWidget";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <motion.div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-[linear-gradient(135deg,#FFF6EA,#FFFFFF_55%,#FFF0D8)] p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C45D00]">
              Live companion
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              One responsive shell, the same trusted features
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Use the assistant, watch live conditions, and jump into maps or
              emergency support from a mobile-first layout that expands cleanly
              on desktop.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/map"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "rounded-2xl bg-[#FF7F00] text-white hover:bg-[#E36A00]",
                )}
              >
                Explore map
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sos"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                )}
              >
                Safety center
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MessageSquareMore className="h-4 w-4 text-[#FF7F00]" />
                Guided assistance
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Keep the chat assistant close for contextual answers and travel
                planning.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Compass className="h-4 w-4 text-[#FF7F00]" />
                Route awareness
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Move into dedicated map and transport routes without losing the
                current feature set.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-[#FF7F00]" />
                Ready for safety
              </div>
              <p className="mt-1 text-sm text-slate-600">
                SOS actions now have a dedicated route while staying reachable
                from the app header.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <RealTimeSafetySuggestion />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.8fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <ChatInterface />
        </div>
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <WeatherWidget />
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <CrowdLevelIndicator />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <NewsWidget />
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <AccommodationFinder />
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <FoodWaterSafety />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <CommunityFeatures />
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <SmartTransportationHub />
        </div>
      </div>
    </motion.div>
  );
}
