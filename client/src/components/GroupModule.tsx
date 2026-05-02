import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, QrCode, MapPin, Phone, UserCheck, Shield, MessageSquare, Bell, Navigation2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  role: "admin" | "member" | "elder";
  status: "safe" | "lost" | "sos";
  location: string;
  lastSeen: string;
  avatar: string;
}

const DEMO_MEMBERS: Member[] = [
  { id: "1", name: "You", role: "admin", status: "safe", location: "Ramkund", lastSeen: "Now", avatar: "👤" },
  { id: "2", name: "Rajan Uncle", role: "elder", status: "safe", location: "Tapovan", lastSeen: "2 min ago", avatar: "👴" },
  { id: "3", name: "Priya", role: "member", status: "safe", location: "Kalaram Temple", lastSeen: "5 min ago", avatar: "👩" },
  { id: "4", name: "Arjun", role: "member", status: "lost", location: "Unknown", lastSeen: "18 min ago", avatar: "👦" },
];

const GROUP_CODE = "KMG-" + Math.random().toString(36).substring(2, 7).toUpperCase();

const statusColors: Record<Member["status"], string> = {
  safe: "bg-emerald-500",
  lost: "bg-amber-500",
  sos: "bg-red-500",
};

export function GroupModule() {
  const { trigger } = useHaptics();
  const { toast } = useToast();
  const [view, setView] = useState<"group" | "create" | "join">("group");
  const [joinCode, setJoinCode] = useState("");
  const [hasGroup] = useState(true);

  const copyCode = () => {
    void navigator.clipboard.writeText(GROUP_CODE);
    trigger("success");
    toast({ description: "Group code copied!" });
  };

  if (!hasGroup && view === "group") {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-50">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">No group yet</h3>
          <p className="mt-1 text-sm text-slate-500">Create or join a group to track family members</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setView("create")} className="rounded-2xl bg-[#FF7F00] text-white hover:bg-[#E36A00]">
            <Plus className="h-4 w-4" /> Create group
          </Button>
          <Button onClick={() => setView("join")} variant="outline" className="rounded-2xl">
            <QrCode className="h-4 w-4" /> Join group
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Family Group</h2>
          <p className="text-xs text-slate-500">{DEMO_MEMBERS.length} members · 1 alert</p>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-semibold text-slate-700"
        >
          {GROUP_CODE} <Copy className="h-3 w-3" />
        </button>
      </div>

      {/* Alert banner */}
      {DEMO_MEMBERS.some(m => m.status === "lost") && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-3"
        >
          <Bell className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Arjun hasn't updated location</p>
            <p className="text-xs text-amber-700">Last seen 18 minutes ago at Panchavati</p>
          </div>
          <Button size="sm" className="ml-auto shrink-0 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs px-2">
            <Phone className="h-3 w-3" />
          </Button>
        </motion.div>
      )}

      {/* Member list */}
      <div className="space-y-2">
        {DEMO_MEMBERS.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
          >
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                {member.avatar}
              </span>
              <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white", statusColors[member.status])} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                {member.role === "admin" && <Shield className="h-3 w-3 text-[#FF7F00]" />}
                {member.role === "elder" && <UserCheck className="h-3 w-3 text-blue-500" />}
              </div>
              <p className="truncate text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {member.location} · {member.lastSeen}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => { trigger("light"); toast({ description: `Navigating to ${member.name}` }); }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <Navigation2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => { trigger("light"); toast({ description: `Messaging ${member.name}` }); }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-2xl text-sm"
          onClick={() => { trigger("light"); toast({ description: "Opening group map" }); }}
        >
          <MapPin className="h-4 w-4" /> Group map
        </Button>
        <Button
          className="flex-1 rounded-2xl bg-[#FF7F00] text-white hover:bg-[#E36A00] text-sm"
          onClick={() => { trigger("error"); toast({ title: "Group SOS sent!", description: "All members have been alerted" }); }}
        >
          Group SOS
        </Button>
      </div>
    </div>
  );
}
