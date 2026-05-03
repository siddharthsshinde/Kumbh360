import { useEffect, useState } from "react";
import { AlertTriangle, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  text: string;
  level: "warning" | "info" | "safe";
}

const SUGGESTIONS: Suggestion[] = [
  { text: "Tapovan is currently crowded. Hold children's hands tightly.", level: "warning" },
  { text: "Crowd alert at Ramkund. Maintain physical contact with children at all times.", level: "warning" },
  { text: "Safety tip: Use child identification wristbands available at info kiosks.", level: "info" },
  { text: "High crowd density at Ramkund. Keep children close to you.", level: "warning" },
  { text: "Take a photo of your child each morning to remember today's clothing.", level: "info" },
  { text: "Trimbakeshwar road is clear. Good time to visit.", level: "safe" },
  { text: "Hydration alert: Drink water every 30 minutes in this heat.", level: "info" },
  { text: "Medical camp available near Gate 4. Seek help if needed.", level: "info" },
];

const levelConfig = {
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    textColor: "text-amber-900",
    subColor: "text-amber-700",
    label: "Safety Alert",
  },
  info: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: Info,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-100",
    textColor: "text-sky-900",
    subColor: "text-sky-700",
    label: "Tip",
  },
  safe: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: Shield,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    textColor: "text-emerald-900",
    subColor: "text-emerald-700",
    label: "All Clear",
  },
};

export function RealTimeSafetySuggestion() {
  const [current, setCurrent] = useState<Suggestion>(SUGGESTIONS[0]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(i => {
        const next = (i + 1) % SUGGESTIONS.length;
        setCurrent(SUGGESTIONS[next]);
        return next;
      });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const cfg = levelConfig[current.level];
  const Icon = cfg.icon;

  return (
    <div className={cn("flex items-start gap-3 p-4", cfg.bg)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5", cfg.iconBg)}>
        <Icon className={cn("h-4 w-4", cfg.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn("text-xs font-bold uppercase tracking-wide", cfg.iconColor)}>{cfg.label}</p>
          <span className="h-1 w-1 rounded-full bg-current opacity-40" />
          <p className="text-[11px] text-slate-400">Live</p>
        </div>
        <p className={cn("text-sm font-medium leading-relaxed", cfg.textColor)}>
          {current.text}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex flex-col gap-1 shrink-0 mt-1">
        {SUGGESTIONS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i === idx
                ? cn("w-3", cfg.iconColor.replace("text-", "bg-"))
                : "w-1 bg-slate-200",
            )}
          />
        ))}
      </div>
    </div>
  );
}
