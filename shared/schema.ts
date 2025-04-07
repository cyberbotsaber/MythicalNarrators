import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Enhanced story schema for Mythika app
export const stories = pgTable("Story_Table", {
  id: serial("id").primaryKey(),
  story_title: text("story_title").notNull(),
  story_origin: text("story_origin"),  // Which region/culture the story comes from (e.g., "South India", "Gujarat")
  story_category: text("story_category"), // Category like "Ramayana", "Mahabharata", "Puranas", "Folk Tales"
  gogi_version: text("gogi_version").notNull(),
  tara_version: text("tara_version").notNull(),
  anaya_version: text("anaya_version").notNull(),
  featured: boolean("featured").default(false), // Whether this story should be highlighted
  date_added: timestamp("date_added").defaultNow(), // When the story was added to the system
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  date_added: true,
});

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

// Admin interface schema - for controlling which story is displayed on which day
export const storySchedule = pgTable("story_schedule", {
  id: serial("id").primaryKey(),
  story_id: integer("story_id").notNull().references(() => stories.id),
  scheduled_date: timestamp("scheduled_date").notNull(),
  active: boolean("active").default(true),
});

export const insertStoryScheduleSchema = createInsertSchema(storySchedule).omit({
  id: true,
});

export type InsertStorySchedule = z.infer<typeof insertStoryScheduleSchema>;
export type StorySchedule = typeof storySchedule.$inferSelect;
