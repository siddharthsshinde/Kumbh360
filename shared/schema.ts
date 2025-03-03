import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Define the location type
export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type Location = z.infer<typeof locationSchema>;

export const insertFacilitySchema = createInsertSchema(facilities).omit({ id: true });
export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({ id: true });
export const insertCrowdLevelSchema = createInsertSchema(crowdLevels).omit({ id: true });

export type Facility = typeof facilities.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type CrowdLevel = typeof crowdLevels.$inferSelect;