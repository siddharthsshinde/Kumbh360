
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, Wind, Droplets } from "lucide-react";
import type { WeatherData } from "@shared/types";

export function WeatherWidget() {
  const { t } = useTranslation();
  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 900000, // Refresh every 15 minutes
  });

  // Select weather icon and background based on condition
  const getWeatherStyles = (condition?: string) => {
    if (!condition) return { icon: Sun, bgClass: "from-blue-500 to-blue-400", textClass: "text-yellow-500" };
    
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
      return { 
        icon: CloudRain, 
        bgClass: "from-blue-700 to-blue-500", 
        textClass: "text-blue-200" 
      };
    } else if (conditionLower.includes("cloud")) {
      return { 
        icon: Cloud, 
        bgClass: "from-slate-500 to-slate-400", 
        textClass: "text-gray-200" 
      };
    } else {
      return { 
        icon: Sun, 
        bgClass: "from-blue-500 to-blue-400", 
        textClass: "text-yellow-300" 
      };
    }
  };

  const { icon: WeatherIcon, bgClass, textClass } = getWeatherStyles(weather?.condition);

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full h-36 overflow-hidden shadow-md rounded-lg border-none">
        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading weather data...</span>
        </div>
      </Card>
    );
  }

  // Error state
  if (error || !weather) {
    return (
      <Card className="w-full overflow-hidden shadow-md rounded-lg border-none">
        <div className="bg-red-50 p-4">
          <h3 className="text-lg font-semibold text-red-600">{t("Weather")}</h3>
          <p className="text-sm text-red-500">{t("Failed to load weather data")}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden shadow-md rounded-lg border-none card-hover">
      <div className={`bg-gradient-to-br ${bgClass} text-white p-4`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-semibold">{t("Weather in Nashik")}</h3>
            <p className="text-xs opacity-90">{new Date().toLocaleDateString()}</p>
          </div>
          <WeatherIcon className={`h-10 w-10 ${textClass}`} />
        </div>
        
        <div className="mt-4">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">{weather.temperature}</span>
            <span className="text-xl">°C</span>
          </div>
          <p className="text-sm capitalize mt-1">{weather.condition}</p>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/20">
          <div className="flex items-center gap-2">
            <Droplets className="h-3 w-3 text-blue-200" />
            <span className="whitespace-nowrap">Humidity: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-3 w-3 text-blue-200" />
            <span className="whitespace-nowrap">Wind: {weather.windSpeed} m/s</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
