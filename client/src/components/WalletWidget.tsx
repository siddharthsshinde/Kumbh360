import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, QrCode, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TRANSACTIONS = [
  { id: "1", label: "Prasad at Kalaram Temple", amount: -50, type: "expense", category: "Spiritual", time: "10:30 AM" },
  { id: "2", label: "Shuttle Ticket — Ramkund", amount: -20, type: "expense", category: "Transport", time: "9:15 AM" },
  { id: "3", label: "Breakfast — Mela Stall", amount: -80, type: "expense", category: "Food", time: "8:00 AM" },
  { id: "4", label: "Top-up via UPI", amount: 500, type: "credit", category: "Wallet", time: "Yesterday" },
  { id: "5", label: "Donation — Shri Kalaram Trust", amount: -101, type: "expense", category: "Donation", time: "Yesterday" },
  { id: "6", label: "Tent Booking — Night 2", amount: -350, type: "expense", category: "Stay", time: "Jul 28" },
];

const CATEGORIES = [
  { label: "Food", spent: 380, budget: 500, color: "bg-orange-400" },
  { label: "Transport", spent: 120, budget: 200, color: "bg-blue-400" },
  { label: "Stay", spent: 700, budget: 1500, color: "bg-violet-400" },
  { label: "Spiritual", spent: 250, budget: 300, color: "bg-amber-400" },
  { label: "Donations", spent: 201, budget: 500, color: "bg-pink-400" },
];

const DONATIONS = [
  { name: "Kumbh Sewa Trust", desc: "Pilgrim welfare & free meals", upi: "kumbhsewa@upi" },
  { name: "Blind Relief Fund", desc: "Healthcare for visually impaired pilgrims", upi: "blind@kumbh" },
  { name: "Gau Seva Samiti", desc: "Cow shelter during Kumbh", upi: "gauseva@kumbh" },
];

export function WalletWidget() {
  const { trigger } = useHaptics();
  const { toast } = useToast();
  const [tab, setTab] = useState<"wallet" | "expenses" | "donate">("wallet");
  const balance = 1249;
  const totalSpent = TRANSACTIONS.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-4 p-5">
      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0F172A,#1E293B)] p-5 text-white shadow-xl"
      >
        <div className="pointer-events-none absolute inset-0 opacity-5 [background-image:repeating-linear-gradient(60deg,white_0px,white_1px,transparent_0,transparent_40%)] [background-size:30px_30px]" />
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Kumbh Wallet</p>
              <p className="mt-1 text-3xl font-bold">₹{balance.toLocaleString("en-IN")}</p>
              <p className="text-xs text-slate-400">Spent ₹{totalSpent} today</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm" onClick={() => { trigger("light"); toast({ description: "Opening UPI top-up" }); }}
              className="flex-1 rounded-2xl bg-[#FF7F00] text-white hover:bg-[#E36A00]">
              <Plus className="h-3.5 w-3.5" /> Add Money
            </Button>
            <Button size="sm" onClick={() => { trigger("light"); toast({ description: "Opening Scan & Pay" }); }}
              variant="outline" className="flex-1 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20">
              <QrCode className="h-3.5 w-3.5" /> Scan & Pay
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
        {(["wallet", "expenses", "donate"] as const).map(t => (
          <button key={t} onClick={() => { trigger("light"); setTab(t); }}
            className={cn("flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all",
              tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}>
            {t === "wallet" ? "Transactions" : t === "expenses" ? "Budget" : "Donate"}
          </button>
        ))}
      </div>

      {tab === "wallet" && (
        <div className="space-y-2">
          {TRANSACTIONS.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tx.amount > 0 ? "bg-emerald-50" : "bg-slate-50")}>
                {tx.amount > 0 ? <ArrowDownLeft className="h-4 w-4 text-emerald-600" /> : <ArrowUpRight className="h-4 w-4 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{tx.label}</p>
                <p className="text-xs text-slate-400">{tx.category} · {tx.time}</p>
              </div>
              <p className={cn("shrink-0 text-sm font-bold", tx.amount > 0 ? "text-emerald-600" : "text-slate-800")}>
                {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount)}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "expenses" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-500">Total spent</p>
              <p className="text-2xl font-bold text-slate-900">₹{totalSpent}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Remaining budget</p>
              <p className="text-2xl font-bold text-emerald-600">₹{(3000 - totalSpent).toLocaleString()}</p>
            </div>
          </div>
          {CATEGORIES.map((cat, i) => {
            const pct = Math.min((cat.spent / cat.budget) * 100, 100);
            return (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{cat.label}</span>
                  <span className="text-slate-500">₹{cat.spent} / ₹{cat.budget}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                    className={cn("h-full rounded-full", cat.color)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "donate" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Support pilgrims and causes during Kumbh Mela</p>
          {DONATIONS.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                <p className="truncate text-xs text-slate-500">{d.desc}</p>
              </div>
              <Button size="sm" onClick={() => { trigger("medium"); toast({ description: `Donating to ${d.name}` }); }}
                className="shrink-0 rounded-xl bg-pink-600 text-white hover:bg-pink-700 text-xs px-3">
                Donate
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
