import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import type { WeatherData } from "@shared/types";
import { insertCrowdReportSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/facilities", async (_req, res) => {
    try {
      const facilities = await storage.getAllFacilities();
      res.json(facilities);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/emergency-contacts", async (_req, res) => {
    try {
      const contacts = await storage.getAllEmergencyContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/crowd-levels", async (_req, res) => {
    try {
      const levels = await storage.getAllCrowdLevels();
      res.json(levels);
    } catch (error) {
      console.error("Error fetching crowd levels:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // New endpoint for crowd reports
  app.post("/api/crowd-reports", async (req, res) => {
    try {
      const reportData = insertCrowdReportSchema.parse(req.body);
      await storage.addCrowdReport(reportData);
      res.status(201).json({ message: "Report submitted successfully" });
    } catch (error) {
      console.error("Crowd report submission error:", error);
      res.status(400).json({ error: "Invalid report data" });
    }
  });

  app.get("/api/news", async (_req, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/weather", async (_req, res) => {
    try {
      const API_KEY = process.env.OPENWEATHER_API_KEY;

      if (!API_KEY) {
        throw new Error("OpenWeather API key not found");
      }

      // Coordinates for Nashik, India (where Kumbh Mela is held)
      const lat = 19.9975;
      const lon = 73.7898;

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status}`);
      }

      const data = await response.json();

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
      };

      res.json(weatherData);
    } catch (error) {
      console.error("Weather API error:", error);

      // Fallback to mock data if the API fails
      const mockWeather: WeatherData = {
        temperature: 23,
        condition: "Clear Sky",
        humidity: 39,
        windSpeed: 4.7
      };

      res.json(mockWeather);
    }
  });

  return httpServer;
}
