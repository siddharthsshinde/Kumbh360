import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Circle, MapPin, Clock, TrendingUp, Footprints, Star, Package, ChevronRight } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  label: string;
  time?: string;
  done: boolean;
  type: "spiritual" | "practical" | "health";
}

const INITIAL_TASKS: Task[] = [
  { id: "t1", label: "Morning snan at Ramkund", time: "6:00 AM", done: true, type: "spiritual" },
  { id: "t2", label: "Visit Kalaram Temple", time: "9:00 AM", done: true, type: "spiritual" },
  { id: "t3", label: "Collect prasad from Seva Camp", time: "11:00 AM", done: false, type: "practical" },
  { id: "t4", label: "Darshan at Trimbakeshwar", time: "2:00 PM", done: false, type: "spiritual" },
  { id: "t5", label: "Attend evening aarti", time: "7:00 PM", done: false, type: "spiritual" },
  { id: "t6", label: "Take evening medicines", time: "8:00 PM", done: false, type: "health" },
];

const BOOKINGS = [
  { id: "b1", title: "Tent City — Night 3", type: "stay", date: "Tonight", status: "confirmed", icon: "🏕️" },
  { id: "b2", title: "Shuttle — Ramkund to Station", type: "transport", date: "Tomorrow 8 AM", status: "confirmed", icon: "🚌" },
  { id: "b3", title: "Bhagwat Katha — Main Stage", type: "event", date: "Tomorrow 6 AM", status: "reminded", icon: "📿" },
];

const STATS = [
  { label: "Days at Kumbh", value: "3", icon: CalendarDays, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Temples visited", value: "4", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "KM walked", value: "12.4", icon: Footprints, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Snans done", value: "2", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const typeColors: Record<Task["type"], string> = {
  spiritual: "text-purple-500",
  practical: "text-blue-500",
  health: "text-emerald-500",
};

export function PersonalDashboard() {
  const { trigger } = useHaptics();
  const { toast } = useToast();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [tab, setTab] = useState<"plan" | "bookings" | "journey">("plan");

  const toggleTask = (id: string) => {
    trigger("light");
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const doneCount = tasks.filter(t => t.done).length;
  const progress = Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="space-y-4 p-5">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Dashboard</h2>
          <p className="text-xs text-slate-500">{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#FF7F00]/20 bg-orange-50">
          <span className="text-sm font-bold text-[#FF7F00]">{progress}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn("flex flex-col items-center gap-1 rounded-2xl p-3", bg)}>
            <Icon className={cn("h-4 w-4", color)} />
            <p className={cn("text-lg font-bold leading-none", color)}>{value}</p>
            <p className="text-[9px] text-center text-slate-500 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
        {(["plan", "bookings", "journey"] as const).map(t => (
          <button key={t} onClick={() => { trigger("light"); setTab(t); }}
            className={cn("flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all",
              tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}>
            {t === "plan" ? "Today's Plan" : t === "bookings" ? "Bookings" : "Journey"}
          </button>
        ))}
      </div>

      {tab === "plan" && (
        <div className="space-y-2">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{doneCount} of {tasks.length} done</span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-[#FF7F00]"
              />
            </div>
          </div>

          {tasks.map((task, i) => (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => toggleTask(task.id)}
              className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors shadow-sm",
                task.done ? "border-emerald-100 bg-emerald-50" : "border-slate-100 bg-white")}
            >
              {task.done
                ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                : <Circle className={cn("h-5 w-5 shrink-0", typeColors[task.type])} />
              }
              <div className="flex-1">
                <p className={cn("text-sm font-medium", task.done ? "line-through text-slate-400" : "text-slate-900")}>{task.label}</p>
                {task.time && <p className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3 w-3" />{task.time}</p>}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {tab === "bookings" && (
        <div className="space-y-2">
          {BOOKINGS.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className="text-2xl">{b.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{b.title}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />{b.date}
                </div>
              </div>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                b.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700")}>
                {b.status}
              </span>
            </motion.div>
          ))}
          <button
            onClick={() => { trigger("light"); toast({ description: "Opening all bookings" }); }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-3 text-sm text-slate-500 hover:bg-slate-50"
          >
            <Package className="h-4 w-4" /> View all bookings
          </button>
        </div>
      )}

      {tab === "journey" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Spiritual Journey Log</h3>
            {[
              { time: "Day 3 · Today", event: "Morning snan at Ramkund", icon: "🌊" },
              { time: "Day 3 · 9 AM", event: "Darshan at Kalaram Temple", icon: "🛕" },
              { time: "Day 2 · Evening", event: "Attended Ganga Aarti", icon: "🪔" },
              { time: "Day 2 · Morning", event: "Snan at Tapovan Ghat", icon: "🌅" },
              { time: "Day 1 · Arrival", event: "Arrived at Nashik Kumbh", icon: "🚂" },
            ].map((entry, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-xl">{entry.icon}</span>
                  {i < 4 && <div className="mt-1 w-0.5 flex-1 bg-slate-100" />}
                </div>
                <div className="pb-3">
                  <p className="text-xs text-slate-400">{entry.time}</p>
                  <p className="text-sm font-medium text-slate-900">{entry.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
