
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, Wind, Droplets, ThermometerSun } from "lucide-react";
import type { WeatherData } from "@shared/types";

export function WeatherWidget() {
  const { t } = useTranslation();
  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 900000, // Refresh every 15 minutes
  });

  if (isLoading) {
    return <Card className="w-full h-32 animate-pulse bg-gray-100" />;
  }

  if (error || !weather) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">{t("Weather")}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{t("Failed to load weather data")}</p>
        </CardContent>
      </Card>
    );
  }

  // Select weather icon based on condition
  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase();
    if (condition.includes("rain") || condition.includes("drizzle")) {
      return <CloudRain className="h-10 w-10 text-blue-500" />;
    } else if (condition.includes("cloud")) {
      return <Cloud className="h-10 w-10 text-gray-500" />;
    } else {
      return <Sun className="h-10 w-10 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">{t("Weather")}</h3>
        <p className="text-xs text-gray-500">{t("Live updates from OpenWeather")}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon()}
            <div>
              <p className="text-2xl font-bold">{weather.temperature}°C</p>
              <p className="text-sm capitalize">{weather.condition}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-teal-500" />
              <span>{weather.windSpeed} m/s</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
