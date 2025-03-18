import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import type { WeatherData, GeminiRequest, ChatMessage } from "@shared/schema";
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

  // Enhanced NLP query route with better error handling
  app.post("/api/nlp/query", async (req, res) => {
    try {
      const { query, sessionId } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      console.log("Processing query:", query);

      // First check if we have a similar query in our knowledge base
      const existingKnowledge = await storage.searchKnowledgeBase(query);
      let answer: string;
      let isFromKnowledgeBase = false;

      if (existingKnowledge) {
        console.log("Found in knowledge base:", existingKnowledge);
        answer = existingKnowledge.content;
        isFromKnowledgeBase = true;
      } else {
        console.log("Querying Gemini API");
        // If not found in knowledge base, use Gemini API
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBon0OTRkC6324gW3BYpc1ziCCPbjuv0fQ";
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        try {
          // Get chat history for context
          const chatHistory = sessionId ? await storage.getChatHistory(sessionId) : [];
          const recentMessages = chatHistory.slice(-5);

          console.log("Creating Gemini prompt with context");
          const formattedPrompt = {
            contents: [{
              parts: [{
                text: `You are a helpful assistant for the Nashik Kumbh Mela 2025. Your role is to assist visitors with information about locations, crowd management, facilities, and religious aspects of the event.

Previous conversation context:
${recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current question: ${query}

Provide specific, accurate information while being respectful of religious and cultural aspects. Include:
1. Relevant details about locations, timings, or facilities
2. Safety recommendations if applicable
3. Real-time crowd management advice when needed
4. Emergency contact information for relevant queries`
              }]
            }]
          };

          console.log("Sending request to Gemini API");
          const result = await model.generateContent(formattedPrompt.contents[0].parts[0].text);
          console.log("Received raw response from Gemini:", result);

          const response = await result.response;
          console.log("Processed response object:", response);

          answer = response.text();
          console.log("Final text response:", answer);

          // Store the new knowledge for future use
          await storage.storeKnowledgeBase({
            topic: query,
            content: answer,
            source: 'Gemini API',
            confidence: 85
          });
        } catch (geminiError: any) {
          console.error("Gemini API error:", geminiError);
          console.error("Error stack trace:", geminiError.stack);
          throw new Error(`Gemini API error: ${geminiError.message || 'Unknown error'}`);
        }
      }

      // Save chat history if sessionId is provided
      if (sessionId) {
        const userMessage: ChatMessage = {
          role: 'user',
          content: query,
          timestamp: new Date().toISOString(),
          metadata: {
            intent: determineQueryIntent(query)
          }
        };

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: answer,
          timestamp: new Date().toISOString(),
          metadata: {
            context: 'kumbh_mela_info',
            intent: 'response'
          }
        };

        await storage.saveChatMessage(sessionId, userMessage);
        await storage.saveChatMessage(sessionId, assistantMessage);
      }

      // Store the query and response
      const queryId = await storage.storeUserQuery({
        query,
        response: answer,
        sources: [isFromKnowledgeBase ? 'knowledge_base' : 'gemini_api'],
        feedback: null
      });

      res.json({
        queryId,
        answer,
        source: isFromKnowledgeBase ? 'knowledge_base' : 'gemini_api',
        context: {
          sessionId,
          messageCount: sessionId ? (await storage.getChatHistory(sessionId)).length : 0
        }
      });

    } catch (error: any) {
      console.error("NLP Query error:", error);
      console.error("Error stack trace:", error.stack);
      res.status(500).json({
        error: "Failed to process NLP query",
        details: error.message || 'Unknown error'
      });
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

  // Helper function to determine query intent
  function determineQueryIntent(query: string): string {
    const queryLower = query.toLowerCase();
    if (queryLower.includes('crowd') || queryLower.includes('people')) return 'crowd_info';
    if (queryLower.includes('emergency') || queryLower.includes('help')) return 'emergency';
    if (queryLower.includes('location') || queryLower.includes('where')) return 'location_info';
    return 'general';
  }

  // Add to existing routes
  app.get("/api/density-grid", async (_req, res) => {
    try {
      const densityGrid = await storage.calculateDensityGrid();
      res.json(densityGrid);
    } catch (error) {
      console.error("Error calculating density grid:", error);
      res.status(500).json({ error: "Failed to calculate density grid" });
    }
  });

  app.get("/api/density-grid/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      if (isNaN(locationId)) {
        return res.status(400).json({ error: "Invalid location ID" });
      }
      const densityGrid = await storage.getDensityGridForLocation(locationId);
      res.json(densityGrid);
    } catch (error) {
      console.error("Error fetching density grid:", error);
      res.status(500).json({ error: "Failed to fetch density grid" });
    }
  });

  return httpServer;
}