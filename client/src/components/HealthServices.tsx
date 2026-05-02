import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Phone, MapPin, Clock, Stethoscope, Ambulance, Pill, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const HOSPITALS = [
  { name: "Civil Hospital Nashik", type: "Government Hospital", distance: "1.2 km", phone: "0253-2577500", beds: "12 free", emergency: true, timing: "24/7" },
  { name: "Kumbh Medical Camp — Ramkund", type: "Mela Medical Camp", distance: "0.3 km", phone: "1800-111-000", beds: "8 free", emergency: true, timing: "24/7" },
  { name: "Wockhardt Hospital", type: "Private Hospital", distance: "2.8 km", phone: "0253-6657000", beds: "Available", emergency: true, timing: "24/7" },
  { name: "Tapovan Medical Camp", type: "Mela Medical Camp", distance: "0.8 km", phone: "1800-111-001", beds: "15 free", emergency: false, timing: "6 AM – 10 PM" },
  { name: "PHC Panchavati", type: "Primary Health Centre", distance: "0.5 km", phone: "0253-2592111", beds: "4 free", emergency: false, timing: "8 AM – 8 PM" },
];

const DOCTORS = [
  { name: "Dr. Priya Sharma", specialty: "General Medicine", available: true, lang: ["Hindi", "English", "Marathi"], queue: 3 },
  { name: "Dr. Ramesh Kulkarni", specialty: "Orthopaedics", available: true, lang: ["Marathi", "Hindi"], queue: 1 },
  { name: "Dr. Anita Mehta", specialty: "Paediatrics", available: false, lang: ["Hindi", "Gujarati"], queue: 0 },
  { name: "Dr. Sanjay Patil", specialty: "Cardiology", available: true, lang: ["Marathi", "Hindi"], queue: 5 },
];

const MEDICINES = [
  { name: "ORS / Electrolytes", available: true, location: "All Camps" },
  { name: "Paracetamol", available: true, location: "All Camps" },
  { name: "Bandages / First Aid", available: true, location: "All Camps" },
  { name: "Insulin (Cold Storage)", available: true, location: "Civil Hospital" },
  { name: "Blood Pressure Drugs", available: true, location: "Civil Hospital, Wockhardt" },
];

export function HealthServices() {
  const { trigger } = useHaptics();
  const { toast } = useToast();
  const [tab, setTab] = useState<"hospitals" | "doctors" | "medicines">("hospitals");

  const callAmbulance = () => {
    trigger("error");
    toast({ title: "Calling Ambulance", description: "Kumbh Emergency: 1800-111-000 · Connecting..." });
    setTimeout(() => window.open("tel:18001110000"), 500);
  };

  return (
    <div className="space-y-4 p-5">
      {/* Emergency CTA */}
      <motion.button
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={callAmbulance}
        className="flex w-full items-center gap-4 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#C0292A,#E84040)] p-5 text-left text-white shadow-[0_8px_30px_rgba(209,67,67,0.35)]"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Ambulance className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">Call Ambulance</p>
          <p className="text-sm text-red-200">Kumbh Emergency: 1800-111-000</p>
        </div>
        <Phone className="h-5 w-5 text-red-200" />
      </motion.button>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Medical Camps", value: "47", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Doctors On Duty", value: "120+", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Ambulances", value: "35", color: "text-red-600", bg: "bg-red-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={cn("rounded-2xl p-3 text-center", bg)}>
            <p className={cn("text-xl font-bold", color)}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
        {(["hospitals", "doctors", "medicines"] as const).map(t => (
          <button key={t} onClick={() => { trigger("light"); setTab(t); }}
            className={cn("flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all",
              tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}>
            {t === "hospitals" ? "Hospitals" : t === "doctors" ? "Doctors" : "Medicines"}
          </button>
        ))}
      </div>

      {tab === "hospitals" && (
        <div className="space-y-2">
          {HOSPITALS.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{h.name}</p>
                    {h.emergency && <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">24/7 ER</span>}
                  </div>
                  <p className="text-xs text-slate-500">{h.type}</p>
                </div>
                <span className="rounded-xl bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 shrink-0">{h.beds}</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{h.distance}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{h.timing}</span>
              </div>
              <button
                onClick={() => { trigger("light"); window.open(`tel:${h.phone.replace(/[-\s]/g, "")}`); }}
                className="mt-2 flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" />{h.phone}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "doctors" && (
        <div className="space-y-2">
          {DOCTORS.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                  <span className={cn("h-2 w-2 rounded-full shrink-0", d.available ? "bg-emerald-500" : "bg-slate-300")} />
                </div>
                <p className="text-xs text-slate-500">{d.specialty}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <span>{d.lang.join(", ")}</span>
                  {d.available && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">{d.queue} in queue</span>}
                </div>
              </div>
              <Button size="sm"
                disabled={!d.available}
                onClick={() => { trigger("medium"); toast({ description: `Booking with ${d.name}` }); }}
                className="shrink-0 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 text-xs px-3"
              >
                {d.available ? "Book" : "Busy"}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "medicines" && (
        <div className="space-y-2">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">All essential medicines are available free at Kumbh medical camps. Show your Kumbh Pass to receive them.</p>
          </div>
          {MEDICINES.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <Pill className={cn("h-5 w-5 shrink-0", m.available ? "text-emerald-600" : "text-slate-400")} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">{m.location}</p>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", m.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                {m.available ? "Available" : "Out of stock"}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
