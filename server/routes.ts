import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import type { GeminiRequest, ChatMessage, DensityGrid, UserEmergencyContact } from "@shared/schema";
import type { WeatherData } from "../shared/types";
import { insertUserEmergencyContactSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { vectorSearchManager } from './vector-search';
import { cacheManager, CacheType } from './cache-manager';
import { ragGeminiService } from './rag-gemini';
import { translationService, SUPPORTED_LANGUAGES } from './translation-service';
import { log } from './vite';
import { CrowdPredictor } from './crowd-predictor';
import { AlertManager } from './alert-manager';
import { recommendationEngine, RecommendationType } from './recommendation-engine';

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Broadcast density updates to all connected clients
  function broadcastDensityUpdate(data: any) {
    console.log('Broadcasting density update to', wss.clients.size, 'clients');
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'density_update',
          data
        }));
      }
    });
  }

  // Set up periodic density updates
  setInterval(async () => {
    try {
      const densityGrid = await storage.calculateDensityGrid();
      const crowdLevels = await storage.getAllCrowdLevels();
      
      // Add predictive analytics
      const predictions = crowdLevels.map(level => ({
        ...level,
        predictedLevel: CrowdPredictor.predictCrowdLevel(
          crowdLevels,
          level.location,
          new Date()
        )
      }));

      // Check for alerts
      crowdLevels.forEach(level => {
        AlertManager.checkAndSendAlerts(level, wss.clients);
      });

      // Group by nearest location for better visualization
      const groupedData = densityGrid.reduce((acc: any, cell: DensityGrid) => {
        const location = cell.metadata?.nearestLocation;
        if (location) {
          if (!acc[location]) {
            acc[location] = [];
          }
          acc[location].push(cell);
        }
        return acc;
      }, {});

      const updateData = {
        grid: densityGrid,
        groupedByLocation: groupedData,
        crowdLevels,
        timestamp: new Date().toISOString(),
        keyLocations: {
          "Ramkund": { lat: 20.0059, lng: 73.7913 },
          "Tapovan": { lat: 20.0116, lng: 73.7938 },
          "Kalaram Temple": { lat: 20.0064, lng: 73.7904 },
          "Trimbakeshwar": { lat: 19.9322, lng: 73.5309 }
        }
      };

      console.log('Calculated new density grid:', {
        gridSize: densityGrid.length,
        locations: Object.keys(groupedData),
        timestamp: updateData.timestamp
      });

      broadcastDensityUpdate(updateData);
    } catch (error) {
      console.error('Error updating density grid:', error);
    }
  }, 5000); // Update every 5 seconds

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    // Send initial density data
    storage.calculateDensityGrid().then(densityGrid => {
      ws.send(JSON.stringify({
        type: 'initial_density',
        data: {
          grid: densityGrid,
          timestamp: new Date().toISOString()
        }
      }));
    }).catch(error => {
      console.error('Error sending initial density data:', error);
    });

    ws.on('error', console.error);
  });

  // Enhanced density grid REST endpoints
  app.get("/api/density-grid", async (_req, res) => {
    try {
      const densityGrid = await storage.calculateDensityGrid();
      console.log('Calculating density grid for HTTP request...');

      const groupedData = densityGrid.reduce((acc: any, cell: DensityGrid) => {
        const location = (cell.metadata as { nearestLocation?: string } | null)?.nearestLocation;
        if (location) {
          if (!acc[location]) {
            acc[location] = [];
          }
          acc[location].push(cell);
        }
        return acc;
      }, {});

      const response = {
        grid: densityGrid,
        groupedByLocation: groupedData,
        timestamp: new Date().toISOString(),
        keyLocations: {
          "Ramkund": { lat: 20.0059, lng: 73.7913 },
          "Tapovan": { lat: 20.0116, lng: 73.7938 },
          "Kalaram Temple": { lat: 20.0064, lng: 73.7904 },
          "Trimbakeshwar": { lat: 19.9322, lng: 73.5309 }
        }
      };

      console.log('Sending density grid response:', {
        gridSize: densityGrid.length,
        locations: Object.keys(groupedData)
      });

      res.json(response);
    } catch (error) {
      console.error("Error calculating density grid:", error);
      res.status(500).json({ error: "Failed to calculate density grid" });
    }
  });

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

  // Accommodation booking API - real-time availability and booking
  app.get("/api/accommodations/:id/availability", async (req, res) => {
    try {
      const { id } = req.params;
      const { checkIn, checkOut } = req.query;
      if (!id || !checkIn || !checkOut || typeof checkIn !== "string" || typeof checkOut !== "string") {
        return res.status(400).json({ error: "accommodation id, checkIn and checkOut are required" });
      }
      const available = await storage.checkAccommodationAvailability(id, checkIn, checkOut);
      res.json({ available, checkIn, checkOut });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  app.post("/api/accommodations/book", async (req, res) => {
    try {
      const {
        accommodationId,
        accommodationName,
        checkIn,
        checkOut,
        rooms,
        guests,
        guestName,
        guestEmail,
        guestPhone,
        totalPrice
      } = req.body;
      if (!accommodationId || !accommodationName || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone || totalPrice == null) {
        return res.status(400).json({ error: "Missing required booking fields" });
      }
      const available = await storage.checkAccommodationAvailability(accommodationId, checkIn, checkOut);
      if (!available) {
        return res.status(409).json({ error: "Selected dates are no longer available" });
      }
      const { id } = await storage.createAccommodationBooking({
        accommodationId,
        accommodationName,
        checkIn,
        checkOut,
        rooms: rooms || 1,
        guests: guests || 1,
        guestName,
        guestEmail,
        guestPhone,
        totalPrice: Number(totalPrice),
        status: "confirmed"
      });
      res.status(201).json({ success: true, bookingId: id });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });
  
  // Smart recommendations endpoint
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { sessionId, location, intent, chatHistory } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      
      // Get personalized recommendations based on user context and other factors
      const recommendations = await recommendationEngine.generateRecommendations(
        sessionId,
        chatHistory || [],
        location,
        intent
      );
      
      // Format recommendations for easy consumption
      const formattedRecommendations = {
        recommendations,
        formattedText: recommendationEngine.formatRecommendationsForChat(recommendations)
      };
      
      res.json(formattedRecommendations);
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ 
        error: "Failed to generate recommendations", 
        details: error.message || "Unknown error" 
      });
    }
  });
  
  // User emergency contacts routes
  app.get("/api/user-emergency-contacts/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const contacts = await storage.getUserEmergencyContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching user emergency contacts:", error);
      res.status(500).json({ error: "Failed to fetch user emergency contacts" });
    }
  });
  
  app.post("/api/user-emergency-contacts", async (req, res) => {
    try {
      const result = insertUserEmergencyContactSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid contact data", 
          details: result.error.format() 
        });
      }
      
      const contactId = await storage.saveUserEmergencyContact(result.data);
      res.status(201).json({ id: contactId });
    } catch (error) {
      console.error("Error saving user emergency contact:", error);
      res.status(500).json({ error: "Failed to save user emergency contact" });
    }
  });
  
  app.delete("/api/user-emergency-contacts/:contactId", async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      if (isNaN(contactId)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      
      await storage.deleteUserEmergencyContact(contactId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user emergency contact:", error);
      res.status(500).json({ error: "Failed to delete user emergency contact" });
    }
  });
  
  // SOS messaging route
  app.post("/api/sos-message", async (req, res) => {
    try {
      const { userId, location, message, toControlRoom, toContacts } = req.body;
      
      if (!userId || !location || !message) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          required: ["userId", "location", "message"] 
        });
      }
      
      // Check if we need to send to either control room or contacts
      if (!toControlRoom && !toContacts) {
        return res.status(400).json({ 
          error: "Either toControlRoom or toContacts must be true" 
        });
      }
      
      // Validate location structure
      if (!location.lat || !location.lng) {
        return res.status(400).json({ 
          error: "Invalid location format. Requires lat and lng properties." 
        });
      }
      
      // Send SOS message
      const result = await storage.sendSOSMessage(
        userId, 
        location, 
        message, 
        !!toControlRoom, 
        !!toContacts
      );
      
      if (!result.success) {
        return res.status(500).json({ error: result.error || "Failed to send SOS message" });
      }
      
      res.json({ 
        success: true, 
        message: "SOS message sent successfully",
        info: result.success ? undefined : result.error
      });
    } catch (error: any) {
      console.error("Error sending SOS message:", error);
      res.status(500).json({ 
        error: "Failed to send SOS message", 
        details: error.message || "Unknown error"
      });
    }
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

  // Enhanced NLP query route with RAG and caching
  app.post("/api/nlp/query", async (req, res) => {
    try {
      const { query, sessionId, imageData, targetLanguage } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      log("Processing query:", 'api');

      // Initialize translation service if needed
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (targetLanguage && GEMINI_API_KEY && !translationService.isInitialized) {
        translationService.initialize(GEMINI_API_KEY);
      }

      // Detect language and translate to English for processing if needed
      let processedQuery = query;
      let detectedLanguage = 'en';
      
      if (translationService.isInitialized) {
        // Detect the language of the original query
        detectedLanguage = await translationService.detectLanguage(query);
        log(`Detected language: ${detectedLanguage}`, 'translation');
        
        // If not in English, translate to English for better processing
        if (detectedLanguage !== 'en') {
          processedQuery = await translationService.translateText(query, 'en', detectedLanguage);
          log(`Translated query for processing: ${processedQuery}`, 'translation');
        }
      }

      // ===============================================
      // STEP 1: Check if the answer exists in the database
      // ===============================================
      
      // First check for exact match in the cache
      const cacheKey = `query-${processedQuery}-${sessionId || ''}-${targetLanguage || 'en'}`;
      const cachedResponse = await cacheManager.get(CacheType.GEMINI_RESPONSES, cacheKey);
      
      if (cachedResponse) {
        log("Using cached response", 'api');
        return res.json({
          ...cachedResponse,
          fromCache: true,
          source: 'cache'
        });
      }
      
      // Initialize variables for response
      let answer: string;
      let source: string;
      let knowledgeBaseId: number | null = null;
      let queryConfidence: number = 0;
      let isLearned: boolean = false;

      // Handle image data separately (special case)
      if (imageData && typeof imageData === 'string') {
        // Initialize Gemini RAG service if needed
        if (!ragGeminiService.isInitialized) {
          const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
          if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is required for image processing" });
          }
          ragGeminiService.initialize(GEMINI_API_KEY);
        }
        
        // Process image-based query directly with Gemini
        const imageBase64 = imageData.replace(/^data:image\/\w+;base64,/, '');
        answer = await ragGeminiService.processImageInput(imageBase64, query);
        source = 'gemini_vision';
        
        // We don't store image-based queries in the knowledge base
        // as they're highly contextual to the specific image
      } else {
        // Step 1a: Check for a direct match in the knowledge base using vector search
        log("Searching knowledge base for similar questions...", 'api');
        const matchingKnowledge = await vectorSearchManager.search(processedQuery, 3, 0.80);
        
        if (matchingKnowledge.length > 0 && matchingKnowledge[0].confidence >= 80) {
          // We found a good match in the knowledge base
          log("Found highly relevant match in knowledge base", 'api');
          answer = matchingKnowledge[0].content;
          source = 'knowledge_base';
          knowledgeBaseId = matchingKnowledge[0].id;
          queryConfidence = matchingKnowledge[0].confidence;
          
          // Log if this was a learned answer
          isLearned = matchingKnowledge[0].source?.includes('Gemini') || false;
          if (isLearned) {
            log("Using previously learned answer from Gemini", 'api');
          }
        } else {
          // ===============================================
          // STEP 2: If no match, query Gemini API
          // ===============================================
          log("No good match found, using Gemini to generate response", 'api');
          
          // Initialize Gemini RAG service if needed
          if (!ragGeminiService.isInitialized) {
            const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
            if (!GEMINI_API_KEY) {
              return res.status(500).json({ error: "Gemini API key is required for RAG" });
            }
            ragGeminiService.initialize(GEMINI_API_KEY);
          }
          
          // Get chat history for context
          const chatHistory = sessionId ? await storage.getChatHistory(sessionId) : [];
          
          // Generate RAG-enhanced response from Gemini
          answer = await ragGeminiService.generateRAGResponse(processedQuery, chatHistory, {
            temperature: 0.7,
            topK: 40,
            topP: 0.95
          });
          
          source = 'gemini_new';
          queryConfidence = 85; // Set confidence for new Gemini responses
          
          // ===============================================
          // STEP 3: Store the Gemini response for future queries
          // ===============================================
          log("Storing new knowledge from Gemini response", 'api');
          
          // Store the new response in the knowledge base
          await storage.storeKnowledgeBase({
            topic: processedQuery,
            content: answer,
            source: 'Gemini RAG - Automatic Learning',
            confidence: queryConfidence
          });
          
          isLearned = true;
        }
      }

      // Save chat history if sessionId is provided
      if (sessionId) {
        const userMessage: ChatMessage = {
          role: 'user',
          content: query,
          timestamp: new Date().toISOString(),
          metadata: {
            intent: determineQueryIntent(query),
            hasImage: !!imageData
          }
        };

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: answer,
          timestamp: new Date().toISOString(),
          metadata: {
            context: 'kumbh_mela_info',
            intent: 'response',
            source
          }
        };

        await storage.saveChatMessage(sessionId, userMessage);
        await storage.saveChatMessage(sessionId, assistantMessage);
      }

      // Generate smart recommendations based on the query and intent
      let smartRecommendations = '';
      
      try {
        // Check if we have enough context to generate recommendations
        if (sessionId) {
          // Determine intent from the query
          const intent = determineQueryIntent(query);
          
          // Get chat history for context
          const chatHistory = await storage.getChatHistory(sessionId);
          
          // Generate personalized recommendations
          const recommendations = await recommendationEngine.generateRecommendations(
            sessionId,
            chatHistory,
            undefined, // location not known from chatbot
            intent
          );
          
          // Format recommendations as text
          if (recommendations.length > 0) {
            smartRecommendations = recommendationEngine.formatRecommendationsForChat(recommendations);
          }
        }
      } catch (recError) {
        log(`Error generating recommendations: ${recError}`, 'api');
        // Continue without recommendations if there's an error
      }
      
      // Append recommendations to the answer if available
      if (smartRecommendations) {
        answer = `${answer}\n\n${smartRecommendations}`;
      }

      // Store the query and response
      const queryId = await storage.storeUserQuery({
        query,
        response: answer,
        sources: [source],
        feedback: null
      });

      // Translate the answer if needed
      let finalAnswer = answer;
      
      // If a target language is provided and it's not English, translate the answer
      if (targetLanguage && targetLanguage !== 'en' && translationService.isInitialized) {
        try {
          log(`Translating answer to ${targetLanguage}`, 'translation');
          finalAnswer = await translationService.translateText(answer, targetLanguage, 'en');
          log('Answer translated successfully', 'translation');
        } catch (translationError) {
          log(`Error translating answer: ${translationError}`, 'translation');
          // Continue with original answer if translation fails
          finalAnswer = answer;
        }
      }
      
      const responseData = {
        queryId,
        answer: finalAnswer,
        originalAnswer: targetLanguage && targetLanguage !== 'en' ? answer : undefined,
        source,
        knowledgeBaseId,
        isLearned,  // Adding information about whether this is a learned answer
        confidence: queryConfidence, // Adding confidence score for the answer
        context: {
          sessionId,
          messageCount: sessionId ? (await storage.getChatHistory(sessionId)).length : 0,
          intent: determineQueryIntent(query),
          originalLanguage: detectedLanguage,
          targetLanguage: targetLanguage || 'en'
        }
      };
      
      // Cache the response
      await cacheManager.set(CacheType.GEMINI_RESPONSES, cacheKey, responseData);

      res.json(responseData);

    } catch (error: any) {
      log(`NLP Query error: ${error}`, 'api');
      log(`Error stack trace: ${error.stack}`, 'api');
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
  
  // Server-side embeddings endpoint for fallback when client-side fails
  app.post("/api/nlp/embed", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      // Get embeddings from the vector search manager
      const embedding = await vectorSearchManager.getEmbedding(text);
      
      return res.json({ embedding });
    } catch (error) {
      console.error("Error generating embeddings:", error);
      return res.status(500).json({ 
        error: "Failed to generate embeddings",
        details: (error as Error).message 
      });
    }
  });
  
  // Status endpoint to check if Gemini API is available
  app.get("/api/nlp/status", async (_req, res) => {
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      const available = !!GEMINI_API_KEY && ragGeminiService.isInitialized;
      res.json({ available });
    } catch (error) {
      console.error("API status check error:", error);
      res.json({ available: false });
    }
  });
  
  // Translation endpoints
  
  // Initialize translation service when first called
  const initTranslationService = () => {
    if (!translationService.isInitialized) {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is required for translation");
      }
      translationService.initialize(GEMINI_API_KEY);
    }
  };
  
  // Language detection endpoint
  app.post("/api/translate/detect-language", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }
      
      initTranslationService();
      
      const detectedLanguage = await translationService.detectLanguage(text);
      
      res.json({
        text,
        detectedLanguage,
        languageName: SUPPORTED_LANGUAGES[detectedLanguage as keyof typeof SUPPORTED_LANGUAGES] || "Unknown"
      });
    } catch (error: any) {
      log(`Language detection error: ${error}`, 'translation');
      res.status(500).json({
        error: "Failed to detect language",
        details: error.message || 'Unknown error'
      });
    }
  });
  
  // Text translation endpoint
  app.post("/api/translate/text", async (req, res) => {
    try {
      const { text, targetLanguage, sourceLanguage } = req.body;
      
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }
      
      if (!targetLanguage || typeof targetLanguage !== "string") {
        return res.status(400).json({ error: "Target language is required" });
      }
      
      initTranslationService();
      
      const translatedText = await translationService.translateText(
        text,
        targetLanguage,
        sourceLanguage || null
      );
      
      res.json({
        originalText: text,
        translatedText,
        sourceLanguage: sourceLanguage || await translationService.detectLanguage(text),
        targetLanguage
      });
    } catch (error: any) {
      log(`Translation error: ${error}`, 'translation');
      res.status(500).json({
        error: "Failed to translate text",
        details: error.message || 'Unknown error'
      });
    }
  });
  
  // Chat message translation endpoint
  app.post("/api/translate/message", async (req, res) => {
    try {
      const { message, targetLanguage } = req.body;
      
      if (!message || typeof message.content !== "string") {
        return res.status(400).json({ error: "Message with content is required" });
      }
      
      if (!targetLanguage || typeof targetLanguage !== "string") {
        return res.status(400).json({ error: "Target language is required" });
      }
      
      initTranslationService();
      
      const translatedMessage = await translationService.translateMessage(
        message,
        targetLanguage
      );
      
      res.json({
        originalMessage: message,
        translatedMessage
      });
    } catch (error: any) {
      log(`Message translation error: ${error}`, 'translation');
      res.status(500).json({
        error: "Failed to translate message",
        details: error.message || 'Unknown error'
      });
    }
  });
  
  // Knowledge base expansion endpoint using Gemini
  app.post("/api/knowledge/expand", async (req, res) => {
    try {
      const { query, autoLearn = false } = req.body;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Valid query is required" });
      }
      
      log("Processing knowledge expansion for: " + query, 'api');
      
      // Check if Gemini API is available
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return res.status(503).json({ 
          error: "Gemini API key is not configured", 
          success: false 
        });
      }
      
      // Initialize Gemini if not already initialized
      if (!ragGeminiService.isInitialized) {
        ragGeminiService.initialize(GEMINI_API_KEY);
      }
      
      // Generate an enhanced answer for the query using RAG
      const enhancedAnswer = await ragGeminiService.generateRAGResponse(query, [], {
        temperature: 0.3,   // Use a relatively low temperature for factual content
        topK: 50,           // Consider more candidates from the model
        topP: 0.95,         // Include a wider range of token probabilities
      });
      
      if (!enhancedAnswer) {
        return res.status(500).json({
          error: "Failed to generate enhanced answer",
          success: false
        });
      }
      
      log("Generated enhanced answer for knowledge base", 'api');
      
      // Store the answer in the knowledge base for future use
      await storage.storeKnowledgeBase({
        topic: query,
        content: enhancedAnswer,
        source: autoLearn ? 'Gemini RAG (Auto-learned)' : 'Gemini RAG (Manual)',
        confidence: 0.85 // High confidence since this is a specially generated answer
      });
      
      // Return the enhanced answer
      res.json({
        success: true,
        answer: enhancedAnswer,
        source: 'gemini_rag',
        autoLearned: autoLearn
      });
      
    } catch (error: any) {
      console.error("Knowledge expansion error:", error);
      res.status(500).json({
        error: "Failed to expand knowledge base",
        details: error.message || "Unknown error",
        success: false
      });
    }
  });
  
  // New endpoint for simplified thumbs up/down feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const { query, response, feedback, sources = [] } = req.body;
      
      if (!query || !response || feedback === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Validate the feedback value (1 for thumbs up, -1 for thumbs down)
      if (feedback !== 1 && feedback !== -1) {
        return res.status(400).json({ error: 'Feedback must be 1 (thumbs up) or -1 (thumbs down)' });
      }
      
      // Store the user query and feedback in the database
      const queryId = await storage.storeUserQuery({
        query,
        response,
        sources,
        feedback,
        confidence: 0.5, // Default confidence value
        learnedFromGemini: false
      });
      
      // If feedback is negative, flag it for review
      if (feedback < 0) {
        // This query could be used by admins to improve the knowledge base
        console.log(`Negative feedback received for query: "${query}"`);
        console.log(`Response that received negative feedback: "${response}"`);
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Feedback stored successfully',
        queryId
      });
    } catch (error) {
      console.error('Error handling feedback:', error);
      res.status(500).json({ error: 'Failed to store feedback' });
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

  app.get("/api/density-grid/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      if (isNaN(locationId)) {
        return res.status(400).json({ error: "Invalid location ID" });
      }

      console.log(`Fetching density grid for location ID: ${locationId}`);

      const densityGrid = await storage.getDensityGridForLocation(locationId);
      const crowdLevels = await storage.getAllCrowdLevels();

      // Get location name from keyLocations array
      const locations = ["Ramkund", "Tapovan", "Kalaram Temple", "Trimbakeshwar"];
      const locationName = locations[locationId];

      if (!locationName) {
        return res.status(404).json({ error: "Location not found" });
      }

      const crowdInfo = crowdLevels.find(level => level.location === locationName);

      console.log(`Found crowd info for ${locationName}:`, crowdInfo);

      const response = {
        grid: densityGrid,
        location: locationName,
        crowdInfo,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching density grid:", error);
      res.status(500).json({ error: "Failed to fetch density grid" });
    }
  });

  return httpServer;
}