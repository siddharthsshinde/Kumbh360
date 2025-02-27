import type { WeatherData } from "@shared/types";

export async function getWeather(): Promise<WeatherData> {
  try {
    const response = await fetch("/api/weather");
    if (!response.ok) throw new Error("Weather API error");
    return await response.json();
  } catch (error) {
    console.error("Weather fetch error:", error);
    return {
      temperature: 23,
      condition: "Clear Sky",
      humidity: 39,
      windSpeed: 4.7
    };
  }
}
