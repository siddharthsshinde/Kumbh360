import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import type { WeatherData, GeminiRequest } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  app.get("/api/news", async (_req, res) => {
    const news = await storage.getAllNews();
    res.json(news);
  });

  app.get("/api/kumbh-locations", async (_req, res) => {
    const locations = await storage.getKumbhLocations();
    res.json(locations);
  });

  // New endpoints for emergency transportation
  app.get("/api/shuttle-locations", async (_req, res) => {
    const shuttles = await storage.getShuttleLocations();
    res.json(shuttles);
  });

  app.get("/api/restrooms", async (_req, res) => {
    const restrooms = await storage.getRestrooms();
    res.json(restrooms);
  });

  app.get("/api/weather", async (_req, res) => {
    try {
      const API_KEY = process.env.OPENWEATHER_API_KEY;

      if (!API_KEY) {
        throw new Error("OpenWeather API key not found");
      }

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

      const mockWeather: WeatherData = {
        temperature: 23,
        condition: "Clear Sky",
        humidity: 39,
        windSpeed: 4.7
      };

      res.json(mockWeather);
    }
  });

  // New route for NLP queries using Gemini
  app.post("/api/nlp/query", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBon0OTRkC6324gW3BYpc1ziCCPbjuv0fQ";
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Create chat context with system prompt
      const prompt = `You are a helpful assistant for the Nashik Kumbh Mela 2025. Answer questions about locations, crowd management, facilities, and religious aspects of the event. Be precise and respectful.

Query: ${query}`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Store the query and response
        const queryId = await storage.storeUserQuery({
          query,
          response: text,
          sources: [], // Gemini doesn't provide source citations directly
          feedback: null
        });

        // Return the response to the client
        res.json({
          queryId,
          answer: text,
          sources: []
        });

      } catch (error) {
        console.error("Gemini API error:", error);
        res.status(500).json({ error: "Failed to generate response from Gemini API" });
      }

    } catch (error) {
      console.error("NLP Query error:", error);
      res.status(500).json({ error: "Failed to process NLP query" });
    }
  });

  // Route to submit feedback for an answer
  app.post("/api/nlp/feedback", async (req, res) => {
    try {
      const { queryId, feedback } = req.body;

      if (!queryId || typeof feedback !== "number" || feedback < 1 || feedback > 5) {
        return res.status(400).json({ error: "Valid queryId and feedback (1-5) are required" });
      }

      await storage.updateQueryFeedback(queryId, feedback);
      res.json({ success: true });

    } catch (error) {
      console.error("Feedback submission error:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  return httpServer;
}