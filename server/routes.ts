import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStorySchema, insertStoryScheduleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get the latest story (today's story)
  app.get("/api/stories/latest", async (req, res) => {
    try {
      const story = await storage.getLatestStory();
      
      if (!story) {
        return res.status(404).json({ message: "No stories found" });
      }
      
      res.json(story);
    } catch (error) {
      console.error("Error fetching latest story:", error);
      res.status(500).json({ message: "Failed to fetch the latest story" });
    }
  });

  // Get a specific story by ID
  app.get("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid story ID" });
      }
      
      const story = await storage.getStory(id);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Failed to fetch the story" });
    }
  });

  // Get all stories
  app.get("/api/stories", async (req, res) => {
    try {
      const stories = await storage.getAllStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // Get featured stories
  app.get("/api/stories/featured", async (req, res) => {
    try {
      const stories = await storage.getFeaturedStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching featured stories:", error);
      res.status(500).json({ message: "Failed to fetch featured stories" });
    }
  });
  
  // Get story for a specific date
  app.get("/api/stories/bydate/:date", async (req, res) => {
    try {
      const dateParam = req.params.date;
      let date: Date;
      
      if (dateParam === 'today') {
        date = new Date();
      } else {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateParam)) {
          return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
        }
        date = new Date(dateParam);
      }
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date" });
      }
      
      const story = await storage.getStoryForDate(date);
      
      if (!story) {
        return res.status(404).json({ message: "No story scheduled for this date" });
      }
      
      res.json(story);
    } catch (error) {
      console.error("Error fetching story by date:", error);
      res.status(500).json({ message: "Failed to fetch story for date" });
    }
  });

  // Create a new story
  app.post("/api/stories", async (req, res) => {
    try {
      // Validate request body against the schema
      const result = insertStorySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid story data", 
          errors: result.error.format() 
        });
      }
      
      const newStory = await storage.createStory(result.data);
      res.status(201).json(newStory);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  // Schedule a story
  app.post("/api/stories/schedule", async (req, res) => {
    try {
      // Convert string date to Date object if needed
      const requestData = { ...req.body };
      if (typeof requestData.scheduled_date === 'string') {
        requestData.scheduled_date = new Date(requestData.scheduled_date);
        
        // Check if date is valid
        if (isNaN(requestData.scheduled_date.getTime())) {
          return res.status(400).json({ 
            message: "Invalid date format. Use ISO format (e.g. 2025-04-08T00:00:00.000Z)"
          });
        }
      }
      
      // Validate request body against the schema
      const result = insertStoryScheduleSchema.safeParse(requestData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid schedule data", 
          errors: result.error.format() 
        });
      }
      
      // Verify the story exists
      const story = await storage.getStory(result.data.story_id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      const schedule = await storage.scheduleStory(result.data);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error scheduling story:", error);
      res.status(500).json({ message: "Failed to schedule story" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
