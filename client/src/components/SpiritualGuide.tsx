import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, Star, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SNAN_DATES = [
  { date: "Jul 28, 2025", name: "Shravani Amavasya", type: "Shahi", importance: "high" },
  { date: "Aug 7, 2025", name: "Nag Panchami", type: "Purnima", importance: "medium" },
  { date: "Aug 9, 2025", name: "Shahi Snan", type: "Shahi", importance: "high" },
  { date: "Sep 13, 2025", name: "Simhastha", type: "Main Snan", importance: "high" },
  { date: "Sep 14, 2025", name: "Anant Chaturdashi", type: "Last Snan", importance: "medium" },
];

const TEMPLES = [
  { name: "Trimbakeshwar Temple", deity: "Lord Shiva (Jyotirlinga)", distance: "28 km", timing: "5:30 AM – 9:00 PM", crowdLevel: "moderate" },
  { name: "Kalaram Temple", deity: "Lord Rama", distance: "0.4 km", timing: "6:00 AM – 8:30 PM", crowdLevel: "crowded" },
  { name: "Sita Gufha", deity: "Goddess Sita", distance: "1.2 km", timing: "7:00 AM – 7:00 PM", crowdLevel: "safe" },
  { name: "Muktidham Temple", deity: "Multiple Deities", distance: "3 km", timing: "7:00 AM – 8:00 PM", crowdLevel: "safe" },
  { name: "Sundar Narayan", deity: "Lord Vishnu", distance: "0.8 km", timing: "6:00 AM – 8:00 PM", crowdLevel: "moderate" },
];

const DAILY_MANTRAS = [
  { mantra: "ॐ नमः शिवाय", meaning: "Om, salutations to Lord Shiva", deity: "Shiva" },
  { mantra: "श्री राम जय राम", meaning: "Glories to Lord Rama", deity: "Rama" },
  { mantra: "ॐ गं गणपतये नमः", meaning: "Om, salutations to Lord Ganesha", deity: "Ganesha" },
  { mantra: "हरे कृष्ण हरे कृष्ण", meaning: "Glory to Krishna", deity: "Krishna" },
];

const crowdColors: Record<string, string> = {
  safe: "text-emerald-600 bg-emerald-50",
  moderate: "text-amber-600 bg-amber-50",
  crowded: "text-red-600 bg-red-50",
};

function Countdown({ targetDate }: { targetDate: string }) {
  const [diff, setDiff] = useState({ days: 0, hours: 0, mins: 0 });
  useEffect(() => {
    const compute = () => {
      const ms = new Date(targetDate).getTime() - Date.now();
      if (ms <= 0) { setDiff({ days: 0, hours: 0, mins: 0 }); return; }
      setDiff({
        days: Math.floor(ms / 86400000),
        hours: Math.floor((ms % 86400000) / 3600000),
        mins: Math.floor((ms % 3600000) / 60000),
      });
    };
    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return (
    <div className="flex gap-2">
      {[["days", diff.days], ["hrs", diff.hours], ["min", diff.mins]].map(([label, val]) => (
        <div key={label as string} className="flex flex-col items-center rounded-xl bg-white/20 px-2.5 py-1.5">
          <span className="text-lg font-bold leading-none text-white">{String(val).padStart(2, "0")}</span>
          <span className="text-[10px] text-orange-200">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function SpiritualGuide() {
  const { trigger } = useHaptics();
  const { toast } = useToast();
  const [tab, setTab] = useState<"snan" | "temples" | "mantra">("snan");
  const nextSnan = SNAN_DATES.find(d => new Date(d.date) > new Date()) || SNAN_DATES[0];
  const todayMantra = DAILY_MANTRAS[new Date().getDay() % DAILY_MANTRAS.length];

  return (
    <div className="space-y-4 p-5">
      {/* Next Snan hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#7C3AED,#A855F7_60%,#7C3AED)] p-5 text-white"
      >
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_70%_30%,white,transparent_55%)]" />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-200" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-200">Next Shahi Snan</span>
          </div>
          <div>
            <h3 className="text-xl font-bold">{nextSnan.name}</h3>
            <p className="text-sm text-purple-200">{nextSnan.date} · {nextSnan.type}</p>
          </div>
          <Countdown targetDate={nextSnan.date} />
          <button
            onClick={() => { trigger("light"); toast({ description: "Snan reminder set!" }); }}
            className="flex items-center gap-2 rounded-2xl bg-white/20 px-3 py-2 text-sm font-medium backdrop-blur-sm hover:bg-white/30"
          >
            <Bell className="h-4 w-4" /> Set reminder
          </button>
        </div>
      </motion.div>

      {/* Today's mantra */}
      <div className="rounded-[1.5rem] border border-purple-100 bg-purple-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-600">Today's Mantra</p>
        <p className="mt-1 text-2xl font-bold text-purple-900">{todayMantra.mantra}</p>
        <p className="mt-0.5 text-xs text-purple-600">{todayMantra.meaning} · {todayMantra.deity}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
        {(["snan", "temples", "mantra"] as const).map(t => (
          <button
            key={t}
            onClick={() => { trigger("light"); setTab(t); }}
            className={cn("flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all", tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
          >
            {t === "snan" ? "Snan Dates" : t === "temples" ? "Temples" : "Mantras"}
          </button>
        ))}
      </div>

      {tab === "snan" && (
        <div className="space-y-2">
          {SNAN_DATES.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold", s.importance === "high" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600")}>
                {s.importance === "high" ? <Star className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-500">{s.date} · {s.type}</p>
              </div>
              <button onClick={() => { trigger("light"); toast({ description: `Reminder set for ${s.name}` }); }}
                className="rounded-xl bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-100">
                Remind
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "temples" && (
        <div className="space-y-2">
          {TEMPLES.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.deity}</p>
                </div>
                <span className={cn("rounded-lg px-2 py-0.5 text-[11px] font-semibold", crowdColors[t.crowdLevel])}>
                  {t.crowdLevel}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{t.distance}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.timing}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "mantra" && (
        <div className="space-y-2">
          {DAILY_MANTRAS.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-white p-4"
            >
              <p className="text-xl font-bold text-purple-900">{m.mantra}</p>
              <p className="mt-1 text-xs text-purple-600">{m.meaning}</p>
              <p className="mt-0.5 text-[11px] font-medium text-purple-400">{m.deity}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
