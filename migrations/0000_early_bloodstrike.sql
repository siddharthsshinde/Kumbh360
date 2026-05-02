CREATE TABLE "chat_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"messages" jsonb NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "crowd_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" text NOT NULL,
	"level" integer NOT NULL,
	"capacity" integer NOT NULL,
	"current_count" integer NOT NULL,
	"status" text NOT NULL,
	"last_updated" text NOT NULL,
	"recommendations" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "density_grid" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" integer NOT NULL,
	"grid_x" integer NOT NULL,
	"grid_y" integer NOT NULL,
	"density" integer NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "emergency_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"number" text NOT NULL,
	"type" text NOT NULL,
	"address" text,
	"available_24x7" boolean DEFAULT true,
	"zone" text
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" jsonb NOT NULL,
	"address" text NOT NULL,
	"contact" text
);
--> statement-breakpoint
CREATE TABLE "knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic" text NOT NULL,
	"content" text NOT NULL,
	"source" text,
	"last_updated" timestamp DEFAULT now(),
	"confidence" integer,
	"verified" boolean DEFAULT false,
	"embedding" jsonb,
	"keywords" text[]
);
--> statement-breakpoint
CREATE TABLE "location_pings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lat" text NOT NULL,
	"lng" text NOT NULL,
	"hex_id" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lost_found_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"item_description" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_phone" text NOT NULL,
	"location" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "response_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_type" text NOT NULL,
	"template" text NOT NULL,
	"variables" jsonb NOT NULL,
	"last_modified" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_emergency_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_number" text NOT NULL,
	"relationship" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"response" text NOT NULL,
	"sources" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"feedback" integer,
	"query_embedding" jsonb,
	"flagged_for_review" boolean DEFAULT false,
	"auto_learned" boolean DEFAULT false,
	"confidence" integer DEFAULT 0,
	"learned_from_gemini" boolean DEFAULT false
);
