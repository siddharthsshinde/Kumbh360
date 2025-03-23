import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import { storage } from "./storage";
import { vectorSearchManager } from "./vector-search";
import { cacheManager, CacheType } from "./cache-manager";
import { ragGeminiService } from "./rag-gemini";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize the cache manager
  cacheManager.initialize({ 
    enabled: true,
    url: process.env.REDIS_URL, 
    ttl: {
      [CacheType.QUERY_RESULTS]: 3600, // 1 hour
      [CacheType.GEMINI_RESPONSES]: 7200, // 2 hours
      [CacheType.EMBEDDINGS]: 86400, // 24 hours
    }
  });
  
  // Initialize vector search with knowledge base data
  const knowledgeBase = await storage.getKnowledgeBase();
  await vectorSearchManager.initialize(knowledgeBase, process.env.GEMINI_API_KEY);
  
  // Initialize RAG Gemini service if API key is available
  if (process.env.GEMINI_API_KEY) {
    try {
      ragGeminiService.initialize(process.env.GEMINI_API_KEY);
      log('RAG Gemini service initialized successfully', 'server');
    } catch (error) {
      log(`Failed to initialize RAG Gemini service: ${error}`, 'server');
    }
  } else {
    log('No Gemini API key found, RAG service will be initialized on first use', 'server');
  }
  
  // Register all routes
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
