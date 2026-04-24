import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Layers3, SearchCheck } from "lucide-react";
import { FacilityMap } from "@/components/FacilityMap";
import { KumbhLocationsInfo } from "@/components/KumbhLocationsInfo";
import { LostAndFound } from "@/components/LostAndFound";
import { SmartTransportationHub } from "@/components/SmartTransportationHub";
import { StreetView } from "@/components/StreetView";
import { TransportationGuide } from "@/components/TransportationGuide";
import { Button } from "@/components/ui/button";

export default function MapPage() {
  const [showStreetView, setShowStreetView] = useState(false);
  const [showLostAndFound, setShowLostAndFound] = useState(false);

  return (
    <motion.div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#F0F9FF,#FFFFFF_55%,#FFF6EC)] p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
              Navigation hub
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Explore the mela with map-first tools
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Switch between facilities, crowd overlays, directions, and visual
              references without leaving the route.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStreetView((current) => !current)}
              className="rounded-2xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Camera className="h-4 w-4" />
              {showStreetView ? "Hide street view" : "Show street view"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLostAndFound((current) => !current)}
              className="rounded-2xl border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
            >
              <SearchCheck className="h-4 w-4" />
              {showLostAndFound ? "Hide lost and found" : "Open lost and found"}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/80 p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Live crowd overlays
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Heatmaps and safety zones stay available inside the existing map
              experience.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/80 p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Landmark search
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Find transport stops, facilities, temples, and restrooms quickly.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/80 p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Visual orientation
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Use street-level previews when you need more confidence on the
              ground.
            </p>
          </div>
        </div>
      </section>

      {showStreetView && (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <StreetView />
        </div>
      )}

      {showLostAndFound && (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <LostAndFound />
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <FacilityMap />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <KumbhLocationsInfo />
        </div>
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <SmartTransportationHub />
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <TransportationGuide />
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-5 text-slate-100">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-white/10 p-2">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Desktop and mobile parity</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This route uses the same map and transit modules in both layouts;
              only the surrounding navigation adapts by device size.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
