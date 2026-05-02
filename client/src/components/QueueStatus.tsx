import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Users, CheckCircle2, Ticket, MapPin, Bell, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const QUEUES = [
  { id: "q1", location: "Trimbakeshwar Temple", type: "Darshan", wait: 85, people: 1240, capacity: 2000, status: "high", slot: "2:15 PM – 2:30 PM", virtual: true },
  { id: "q2", location: "Ramkund Ghat", type: "Holy Dip", wait: 35, people: 420, capacity: 800, status: "moderate", slot: "1:00 PM – 1:15 PM", virtual: true },
  { id: "q3", location: "Kalaram Temple", type: "Darshan", wait: 25, people: 310, capacity: 600, status: "moderate", slot: "12:45 PM – 1:00 PM", virtual: true },
  { id: "q4", location: "Panchavati Camp", type: "Food Distribution", wait: 10, people: 90, capacity: 500, status: "safe", slot: "12:30 PM – 12:45 PM", virtual: false },
  { id: "q5", location: "Tent City Check-in", type: "Accommodation", wait: 15, people: 45, capacity: 200, status: "safe", slot: "Now", virtual: false },
];

const statusConfig: Record<string, { color: string; bg: string; text: string }> = {
  high: { color: "text-red-600", bg: "bg-red-50", text: "Long wait" },
  moderate: { color: "text-amber-600", bg: "bg-amber-50", text: "Moderate" },
  safe: { color: "text-emerald-600", bg: "bg-emerald-50", text: "Short wait" },
};

export function QueueStatus() {
  const { trigger } = useHaptics();
  const { toast } = useToast();
  const [joined, setJoined] = useState<string[]>([]);

  const joinQueue = (id: string, location: string, slot: string) => {
    trigger("success");
    setJoined(prev => [...prev, id]);
    toast({
      title: "Queue joined!",
      description: `Your slot at ${location}: ${slot}. You'll be notified when it's your turn.`,
    });
  };

  const leaveQueue = (id: string) => {
    trigger("medium");
    setJoined(prev => prev.filter(q => q !== id));
    toast({ description: "Left the queue" });
  };

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Queue Management</h2>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Live</span>
      </div>

      {/* Active bookings */}
      {joined.length > 0 && (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Your Active Queues</p>
          {joined.map(id => {
            const q = QUEUES.find(x => x.id === id)!;
            return (
              <div key={id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">{q.location}</p>
                    <p className="text-xs text-emerald-700">Slot: {q.slot}</p>
                  </div>
                </div>
                <button onClick={() => leaveQueue(id)} className="text-xs text-emerald-600 underline">Leave</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Queue list */}
      <div className="space-y-3">
        {QUEUES.map((q, i) => {
          const isJoined = joined.includes(q.id);
          const pct = (q.people / q.capacity) * 100;
          const cfg = statusConfig[q.status];
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{q.location}</p>
                      {q.virtual && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">Virtual</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{q.type}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-xl px-2 py-1 text-xs font-semibold", cfg.bg, cfg.color)}>
                    {cfg.text}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: Clock, label: "Wait", value: `~${q.wait} min` },
                    { icon: Users, label: "In queue", value: q.people.toLocaleString() },
                    { icon: Ticket, label: "Your slot", value: q.slot },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl bg-slate-50 px-2 py-2">
                      <Icon className="h-3.5 w-3.5 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-900 leading-tight">{value}</p>
                      <p className="text-[10px] text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Capacity bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{q.people} / {q.capacity} capacity</span>
                    <span>{Math.round(pct)}% full</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className={cn("h-full rounded-full", q.status === "high" ? "bg-red-500" : q.status === "moderate" ? "bg-amber-500" : "bg-emerald-500")}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-3">
                {isJoined ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <p className="flex-1 text-sm font-medium text-emerald-700">You're in queue · {q.slot}</p>
                    <Button size="sm" variant="outline" onClick={() => leaveQueue(q.id)}
                      className="rounded-xl border-slate-200 text-xs px-2">
                      Leave
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full rounded-xl bg-[#FF7F00] text-white hover:bg-[#E36A00] text-sm"
                    onClick={() => joinQueue(q.id, q.location, q.slot)}>
                    <Ticket className="h-4 w-4" />
                    {q.virtual ? "Join Virtual Queue" : "Join Queue"}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
