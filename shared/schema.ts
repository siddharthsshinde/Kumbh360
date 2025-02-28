import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  location: jsonb("location").notNull(),
  address: text("address").notNull(),
  contact: text("contact"),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  number: text("number").notNull(),
  type: text("type").notNull(),
  address: text("address"),
  available24x7: boolean("available_24x7").default(true),
  zone: text("zone"),
});

export const crowdLevels = pgTable("crowd_levels", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  level: integer("level").notNull(),
  capacity: integer("capacity").notNull(),
  currentCount: integer("current_count").notNull(),
  status: text("status").notNull(),
  lastUpdated: text("last_updated").notNull(),
  recommendations: text("recommendations").notNull(),
});

// New table for crowd reports
export const crowdReports = pgTable("crowd_reports", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  reportedStatus: text("reported_status").notNull(), // 'light', 'moderate', 'heavy', 'critical'
  description: text("description"),
  timestamp: timestamp("timestamp").defaultNow(),
  verified: boolean("verified").default(false),
  userLocation: jsonb("user_location"), // Optional: {lat: number, lng: number}
});

export const insertFacilitySchema = createInsertSchema(facilities).omit({ id: true });
export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({ id: true });
export const insertCrowdLevelSchema = createInsertSchema(crowdLevels).omit({ id: true });
export const insertCrowdReportSchema = createInsertSchema(crowdReports).omit({ id: true, timestamp: true, verified: true });

export type Facility = typeof facilities.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type CrowdLevel = typeof crowdLevels.$inferSelect;
export type CrowdReport = typeof crowdReports.$inferSelect;