import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing tables remain unchanged
export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // hotel, restaurant, hospital, shuttle_stop, restroom
  location: jsonb("location").notNull(), // {lat: number, lng: number}
  address: text("address").notNull(),
  contact: text("contact"),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  number: text("number").notNull(),
  type: text("type").notNull(), // police, ambulance, fire, missing_person, etc.
  address: text("address"),
  available24x7: boolean("available_24x7").default(true),
  zone: text("zone"), // Area/zone of Nashik
});

// Table for storing user emergency contacts
export const userEmergencyContacts = pgTable("user_emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Can be a session ID or device ID
  contactName: text("contact_name").notNull(),
  contactNumber: text("contact_number").notNull(),
  relationship: text("relationship"), // family, friend, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const crowdLevels = pgTable("crowd_levels", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  level: integer("level").notNull(), // 1-5
  capacity: integer("capacity").notNull(), // Max capacity for the location
  currentCount: integer("current_count").notNull(), // Current number of people
  status: text("status").notNull(), // "safe", "moderate", "crowded", "overcrowded"
  lastUpdated: text("last_updated").notNull(),
  recommendations: text("recommendations").notNull(),
});

// New tables for NLP enhancement
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  source: text("source"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  confidence: integer("confidence"), // 0-100
  verified: boolean("verified").default(false),
  embedding: jsonb("embedding"), // Store text embeddings for semantic search
  keywords: text("keywords").array(), // Store extracted keywords for better matching
});

export const userQueries = pgTable("user_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  sources: jsonb("sources").notNull(), // Array of source URLs
  timestamp: timestamp("timestamp").defaultNow(),
  feedback: integer("feedback"), // 1 for 👍, -1 for 👎, null for no feedback
  queryEmbedding: jsonb("query_embedding"), // Store query embeddings for semantic matching
  flaggedForReview: boolean("flagged_for_review").default(false), // Flag for review if user gives negative feedback
  autoLearned: boolean("auto_learned").default(false), // Whether this was auto-added to knowledge base
  confidence: integer("confidence").default(0), // Confidence score of the matching/response (0-100)
  learnedFromGemini: boolean("learned_from_gemini").default(false), // Whether response came from Gemini
});

// Enhanced chat history table
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  messages: jsonb("messages").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  metadata: jsonb("metadata"),
});

// Structured response format
export const responseTemplates = pgTable("response_templates", {
  id: serial("id").primaryKey(),
  templateType: text("template_type").notNull(), // e.g., 'location_info', 'crowd_update', 'emergency'
  template: text("template").notNull(),
  variables: jsonb("variables").notNull(), // Required variables for template
  lastModified: timestamp("last_modified").defaultNow(),
});

// Define the location type
export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type Location = z.infer<typeof locationSchema>;

// Existing schemas
export const insertFacilitySchema = createInsertSchema(facilities).omit({ id: true });
export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({ id: true });
export const insertUserEmergencyContactSchema = createInsertSchema(userEmergencyContacts).omit({ id: true, createdAt: true });
export const insertCrowdLevelSchema = createInsertSchema(crowdLevels).omit({ id: true });

// New schemas for NLP features
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({ id: true, lastUpdated: true });
export const insertUserQuerySchema = createInsertSchema(userQueries).omit({ id: true, timestamp: true });

// Enhanced schemas
export const insertChatHistorySchema = createInsertSchema(chatHistory).omit({ id: true, lastUpdated: true });
export const insertResponseTemplateSchema = createInsertSchema(responseTemplates).omit({ id: true, lastModified: true });

// Existing types
export type Facility = typeof facilities.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type UserEmergencyContact = typeof userEmergencyContacts.$inferSelect;
export type CrowdLevel = typeof crowdLevels.$inferSelect;

// New types
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type UserQuery = typeof userQueries.$inferSelect;

// Enhanced types
export type ChatHistory = typeof chatHistory.$inferSelect;
export type ResponseTemplate = typeof responseTemplates.$inferSelect;

// Gemini API types
export const geminiMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({
    text: z.string()
  }))
});

export const geminiRequestSchema = z.object({
  contents: z.array(z.object({
    parts: z.array(z.object({
      text: z.string()
    }))
  })),
  generationConfig: z.object({
    temperature: z.number().optional(),
    topK: z.number().optional(),
    topP: z.number().optional(),
    maxOutputTokens: z.number().optional(),
  }).optional()
});

export type GeminiMessage = z.infer<typeof geminiMessageSchema>;
export type GeminiRequest = z.infer<typeof geminiRequestSchema>;

// Message format for chat
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
  metadata: z.object({
    context: z.string().optional(),
    location: z.string().optional(),
    intent: z.string().optional(),
  }).optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Add density grid types
export const densityGrid = pgTable("density_grid", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  gridX: integer("grid_x").notNull(),
  gridY: integer("grid_y").notNull(),
  density: integer("density").notNull(), // 0-100
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"), // Additional info like heat map color
});

// Add to existing types
export const insertDensityGridSchema = createInsertSchema(densityGrid).omit({ id: true, timestamp: true });
export type DensityGrid = typeof densityGrid.$inferSelect;

// Add grid config type
export const gridConfigSchema = z.object({
  gridSize: z.number(),
  boundaries: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }),
  resolution: z.number(), // meters per grid cell
});

export type GridConfig = z.infer<typeof gridConfigSchema>;