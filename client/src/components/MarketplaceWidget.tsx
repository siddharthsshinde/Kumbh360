import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Star, MapPin, Tag, Search, Filter, ChevronRight } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Category = "all" | "religious" | "clothing" | "food" | "handicraft" | "medicine";

const VENDORS = [
  { id: "v1", name: "Shri Ganesh Puja Samagri", category: "religious" as Category, rating: 4.8, reviews: 234, distance: "50m", price: "₹20–₹500", tag: "Popular", items: ["Gangajal", "Puja Thali", "Rudraksha", "Incense"], verified: true },
  { id: "v2", name: "Nashik Silk & Saree Bhandar", category: "clothing" as Category, rating: 4.5, reviews: 118, distance: "120m", price: "₹299–₹3999", tag: "Offer", items: ["Silk Sarees", "Kurtas", "Dhotis"], verified: true },
  { id: "v3", name: "Prasad Bhandar — Free Meals", category: "food" as Category, rating: 5.0, reviews: 890, distance: "80m", price: "Free", tag: "Free Seva", items: ["Khichdi", "Dal Rice", "Sabzi"], verified: true },
  { id: "v4", name: "Madhuri Handicrafts", category: "handicraft" as Category, rating: 4.3, reviews: 67, distance: "200m", price: "₹50–₹2000", tag: "Local Artist", items: ["Clay idols", "Brass items", "Wooden crafts"], verified: false },
  { id: "v5", name: "Ayurvedic Medicine Stall", category: "medicine" as Category, rating: 4.6, reviews: 145, distance: "150m", price: "₹30–₹300", tag: "Govt Approved", items: ["Triphala", "Ashwagandha", "Chyawanprash"], verified: true },
  { id: "v6", name: "Krishna Store — Puja Items", category: "religious" as Category, rating: 4.7, reviews: 312, distance: "90m", price: "₹10–₹1000", tag: "24/7 Open", items: ["Flowers", "Diyas", "Camphor", "Agarbatti"], verified: true },
];

const catConfig: Record<Category, { label: string; emoji: string; color: string }> = {
  all: { label: "All", emoji: "🛒", color: "bg-slate-100 text-slate-700" },
  religious: { label: "Puja", emoji: "🪔", color: "bg-orange-50 text-orange-700" },
  clothing: { label: "Clothing", emoji: "👗", color: "bg-pink-50 text-pink-700" },
  food: { label: "Food", emoji: "🍛", color: "bg-green-50 text-green-700" },
  handicraft: { label: "Crafts", emoji: "🏺", color: "bg-amber-50 text-amber-700" },
  medicine: { label: "Ayurveda", emoji: "🌿", color: "bg-emerald-50 text-emerald-700" },
};

export function MarketplaceWidget() {
  const { trigger } = useHaptics();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Category>("all");
  const [search, setSearch] = useState("");

  const filtered = VENDORS.filter(v =>
    (filter === "all" || v.category === filter) &&
    (v.name.toLowerCase().includes(search.toLowerCase()) || v.items.some(i => i.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Marketplace</h2>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{VENDORS.length} vendors nearby</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vendors, items..."
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(catConfig) as Category[]).map(cat => (
          <button key={cat} onClick={() => { trigger("light"); setFilter(cat); }}
            className={cn("shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === cat ? "bg-[#FF7F00] text-white" : catConfig[cat].color)}>
            <span>{catConfig[cat].emoji}</span>
            {catConfig[cat].label}
          </button>
        ))}
      </div>

      {/* Vendor list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-6">No vendors found</p>
        )}
        {filtered.map((v, i) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-900 truncate">{v.name}</p>
                    {v.verified && <span className="shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center text-[9px] text-blue-600 font-bold">✓</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{v.rating} ({v.reviews})</span>
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{v.distance}</span>
                    <span className="flex items-center gap-0.5"><Tag className="h-3 w-3" />{v.price}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-xl bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700">{v.tag}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {v.items.slice(0, 4).map(item => (
                  <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{item}</span>
                ))}
                {v.items.length > 4 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-400">+{v.items.length - 4}</span>}
              </div>
            </div>
            <button
              onClick={() => { trigger("light"); toast({ description: `Opening ${v.name}` }); }}
              className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-3 text-sm font-medium text-[#FF7F00] hover:bg-orange-50"
            >
              View vendor <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
