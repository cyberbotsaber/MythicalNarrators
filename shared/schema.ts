import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
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

// Story schema for Mythika app
export const stories = pgTable("Story_Table", {
  id: serial("id").primaryKey(),
  story_title: text("story_title").notNull(),
  gogi_version: text("gogi_version").notNull(),
  tara_version: text("tara_version").notNull(),
  anaya_version: text("anaya_version").notNull(),
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
});

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;
