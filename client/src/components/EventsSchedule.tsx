import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Bell, ChevronRight, Music, BookOpen, Flag, Flame } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type EventType = "pravachan" | "cultural" | "akhada" | "aarti";

interface Event {
  id: string;
  title: string;
  speaker?: string;
  venue: string;
  date: string;
  time: string;
  type: EventType;
  language?: string;
  seats?: string;
  featured?: boolean;
}

const EVENTS: Event[] = [
  { id: "1", title: "Bhagwat Katha", speaker: "Pt. Shri Ram Sharma", venue: "Main Stage, Ramkund", date: "Today", time: "6:00 AM – 8:00 AM", type: "pravachan", language: "Hindi", seats: "Open", featured: true },
  { id: "2", title: "Shivir Pravachan", speaker: "Swami Ramdev", venue: "Tapovan Ashram", date: "Today", time: "10:00 AM – 12:00 PM", type: "pravachan", language: "Hindi/English", seats: "500 left" },
  { id: "3", title: "Ganga Aarti", venue: "Ramkund Ghat", date: "Today", time: "7:00 PM – 8:00 PM", type: "aarti", featured: true },
  { id: "4", title: "Classical Dance — Bharatanatyam", speaker: "Smt. Leela Samson", venue: "Cultural Pavilion", date: "Tomorrow", time: "5:00 PM – 7:00 PM", type: "cultural", seats: "200 left" },
  { id: "5", title: "Peshwai Procession — Niranjani Akhada", venue: "Main Road, Nashik", date: "Tomorrow", time: "8:00 AM – 11:00 AM", type: "akhada", featured: true },
  { id: "6", title: "Sanskrit Shloka Recitation", speaker: "Vedic Scholars", venue: "Vedic Shibir, Panchavati", date: "Jul 30", time: "9:00 AM – 11:00 AM", type: "pravachan", language: "Sanskrit", seats: "100 left" },
  { id: "7", title: "Folk Music Night", venue: "Cultural Stage, Tapovan", date: "Jul 31", time: "7:00 PM – 10:00 PM", type: "cultural" },
];

const typeConfig: Record<EventType, { icon: typeof Calendar; color: string; bg: string; label: string }> = {
  pravachan: { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50", label: "Pravachan" },
  cultural: { icon: Music, color: "text-pink-600", bg: "bg-pink-50", label: "Cultural" },
  akhada: { icon: Flag, color: "text-orange-600", bg: "bg-orange-50", label: "Akhada" },
  aarti: { icon: Flame, color: "text-amber-600", bg: "bg-amber-50", label: "Aarti" },
};

export function EventsSchedule() {
  const { trigger } = useHaptics();
  const { toast } = useToast();
  const [filter, setFilter] = useState<EventType | "all">("all");
  const [reminded, setReminded] = useState<string[]>([]);

  const filtered = filter === "all" ? EVENTS : EVENTS.filter(e => e.type === filter);
  const featured = EVENTS.filter(e => e.featured);

  const toggleReminder = (id: string, title: string) => {
    trigger("success");
    setReminded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    toast({ description: reminded.includes(id) ? "Reminder removed" : `Reminder set for "${title}"` });
  };

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Events & Programs</h2>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{filtered.length} events</span>
      </div>

      {/* Featured */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Featured Today</p>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {featured.map(event => {
            const cfg = typeConfig[event.type];
            const Icon = cfg.icon;
            return (
              <div key={event.id} className="w-52 shrink-0 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#FF7F00,#FF6000)] p-4 text-white shadow-md">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-orange-200" />
                  <span className="text-xs text-orange-200">{cfg.label}</span>
                </div>
                <p className="mt-2 text-sm font-bold leading-tight">{event.title}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-200">
                  <Clock className="h-3 w-3" />{event.time}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-orange-200">
                  <MapPin className="h-3 w-3" />{event.venue.split(",")[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["all", "pravachan", "aarti", "cultural", "akhada"] as const).map(f => (
          <button
            key={f}
            onClick={() => { trigger("light"); setFilter(f); }}
            className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
              filter === f ? "bg-[#FF7F00] text-white" : "bg-slate-100 text-slate-600")}
          >
            {f === "all" ? "All Events" : typeConfig[f].label}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="space-y-2">
        {filtered.map((event, i) => {
          const cfg = typeConfig[event.type];
          const Icon = cfg.icon;
          const isReminded = reminded.includes(event.id);
          return (
            <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
                <Icon className={cn("h-5 w-5", cfg.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">{event.title}</p>
                  <button
                    onClick={() => toggleReminder(event.id, event.title)}
                    className={cn("shrink-0 flex h-7 w-7 items-center justify-center rounded-xl transition-colors",
                      isReminded ? "bg-[#FF7F00] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                  >
                    <Bell className="h-3.5 w-3.5" />
                  </button>
                </div>
                {event.speaker && <p className="text-xs text-slate-500">{event.speaker}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.venue.split(",")[0]}</span>
                  {event.seats && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">{event.seats}</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
