import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import type { WeatherData } from "@shared/types";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/facilities", async (_req, res) => {
    const facilities = await storage.getAllFacilities();
    res.json(facilities);
  });

  app.get("/api/emergency-contacts", async (_req, res) => {
    const contacts = await storage.getAllEmergencyContacts();
    res.json(contacts);
  });

  app.get("/api/crowd-levels", async (_req, res) => {
    const levels = await storage.getAllCrowdLevels();
    res.json(levels);
  });

  app.get("/api/weather", async (_req, res) => {
    const mockWeather: WeatherData = {
      temperature: 23,
      condition: "Clear Sky",
      humidity: 39,
      windSpeed: 4.7
    };
    res.json(mockWeather);
  });

  return httpServer;
}
