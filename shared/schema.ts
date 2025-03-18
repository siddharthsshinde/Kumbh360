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
});

export const userQueries = pgTable("user_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  sources: jsonb("sources").notNull(), // Array of source URLs
  timestamp: timestamp("timestamp").defaultNow(),
  feedback: integer("feedback"), // User feedback score (1-5)
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
export const insertCrowdLevelSchema = createInsertSchema(crowdLevels).omit({ id: true });

// New schemas for NLP features
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({ id: true, lastUpdated: true });
export const insertUserQuerySchema = createInsertSchema(userQueries).omit({ id: true, timestamp: true });

// Existing types
export type Facility = typeof facilities.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type CrowdLevel = typeof crowdLevels.$inferSelect;

// New types
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type UserQuery = typeof userQueries.$inferSelect;

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