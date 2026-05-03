import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Eye } from "lucide-react";
import type { WeatherData } from "@shared/types";
import { cn } from "@/lib/utils";

function getWeatherConfig(condition?: string) {
  const c = condition?.toLowerCase() ?? "";
  if (c.includes("rain") || c.includes("drizzle")) {
    return { icon: CloudRain, gradient: "from-blue-600 to-blue-700", accent: "bg-blue-500/20", iconColor: "text-blue-100" };
  }
  if (c.includes("cloud")) {
    return { icon: Cloud, gradient: "from-slate-500 to-slate-600", accent: "bg-slate-400/20", iconColor: "text-slate-200" };
  }
  return { icon: Sun, gradient: "from-sky-500 to-blue-600", accent: "bg-yellow-400/20", iconColor: "text-yellow-300" };
}

export function WeatherWidget() {
  const { t } = useTranslation();
  const { data: weather, isLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 900000,
  });

  if (isLoading) {
    return (
      <div className="h-40 animate-pulse rounded-[2rem] bg-gradient-to-br from-slate-200 to-slate-100" />
    );
  }

  if (!weather) {
    return (
      <div className="p-5">
        <p className="text-sm text-slate-500">Weather unavailable</p>
      </div>
    );
  }

  const { icon: WeatherIcon, gradient, iconColor } = getWeatherConfig(weather.condition);

  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-5 text-white", gradient)}>
      {/* Background decoration */}
      <div className="pointer-events-none absolute right-4 top-4 h-24 w-24 opacity-15 [background-image:radial-gradient(circle,white,transparent_70%)]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Nashik Weather</p>
            <p className="mt-0.5 text-xs text-white/60">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
          </div>
          <WeatherIcon className={cn("h-10 w-10 drop-shadow", iconColor)} />
        </div>

        {/* Temperature */}
        <div className="mt-3 flex items-end gap-2">
          <span className="text-5xl font-bold tracking-tight">{weather.temperature}</span>
          <span className="mb-2 text-2xl font-light text-white/80">°C</span>
        </div>
        <p className="mt-0.5 text-sm font-medium capitalize text-white/90">{weather.condition}</p>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/20 pt-3">
          {[
            { icon: Droplets, label: "Humidity", value: `${weather.humidity}%` },
            { icon: Wind, label: "Wind", value: `${weather.windSpeed} m/s` },
            { icon: Thermometer, label: "Feels like", value: `${Math.round(weather.temperature - 2)}°` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <Icon className="h-3.5 w-3.5 text-white/60" />
              <p className="text-xs font-bold text-white">{value}</p>
              <p className="text-[10px] text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
