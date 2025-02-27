import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Sun, Cloud, Wind, Droplets } from "lucide-react";
import { getWeather } from "@/lib/weather";
import type { WeatherData } from "@shared/types";

export function WeatherWidget() {
  const { t } = useTranslation();
  const { data: weather, isLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
  });

  if (isLoading || !weather) {
    return <Card className="w-full h-32 animate-pulse bg-gray-100" />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <Sun className="h-5 w-5 text-[#FF7F00]" />
        <span className="font-medium">{t("weather")}</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <span>{weather.temperature}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4" />
          <span>{weather.condition}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4" />
          <span>{weather.windSpeed} km/h</span>
        </div>
      </CardContent>
    </Card>
  );
}