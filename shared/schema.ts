import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // hotel, restaurant, hospital
  location: jsonb("location").notNull(), // {lat: number, lng: number}
  address: text("address").notNull(),
  contact: text("contact"),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  number: text("number").notNull(),
  type: text("type").notNull(), // police, ambulance, fire, etc.
});

export const crowdLevels = pgTable("crowd_levels", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  level: integer("level").notNull(), // 1-5
  timestamp: text("timestamp").notNull(),
});

export const insertFacilitySchema = createInsertSchema(facilities).omit({ id: true });
export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({ id: true });
export const insertCrowdLevelSchema = createInsertSchema(crowdLevels).omit({ id: true });

export type Facility = typeof facilities.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type CrowdLevel = typeof crowdLevels.$inferSelect;
