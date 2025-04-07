import { users, type User, type InsertUser, stories, type Story, storySchedule, type StorySchedule, type InsertStorySchedule, type InsertStory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

// IStorage interface defines all the methods our storage classes must implement
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Story methods for Mythika app
  getStory(id: number): Promise<Story | undefined>;
  getLatestStory(): Promise<Story | undefined>;
  getAllStories(): Promise<Story[]>;
  createStory(story: InsertStory): Promise<Story>;
  getFeaturedStories(): Promise<Story[]>;
  getStoryForDate(date: Date): Promise<Story | undefined>;
  scheduleStory(schedule: InsertStorySchedule): Promise<StorySchedule>;
}

// DatabaseStorage implements storage using PostgreSQL database
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Story methods
  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }

  async getLatestStory(): Promise<Story | undefined> {
    // First check if there's a scheduled story for today
    const todayStory = await this.getStoryForDate(new Date());
    if (todayStory) return todayStory;
    
    // Otherwise, get the most recently added story
    const [story] = await db.select().from(stories).orderBy(desc(stories.date_added)).limit(1);
    return story;
  }

  async getAllStories(): Promise<Story[]> {
    return db.select().from(stories).orderBy(desc(stories.date_added));
  }

  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    return newStory;
  }

  async getFeaturedStories(): Promise<Story[]> {
    return db.select().from(stories).where(eq(stories.featured, true)).orderBy(desc(stories.date_added));
  }

  // Get story scheduled for a specific date
  async getStoryForDate(date: Date): Promise<Story | undefined> {
    // Format date to only compare year, month, day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find active schedule for the given date
    const schedules = await db
      .select()
      .from(storySchedule)
      .where(
        and(
          eq(storySchedule.active, true)
        )
      )
      .orderBy(desc(storySchedule.scheduled_date));
    
    // Find the closest schedule date that is before or equal to the requested date
    let targetSchedule = undefined;
    
    for (const schedule of schedules) {
      const scheduleDate = new Date(schedule.scheduled_date);
      
      // If the schedule is for today or a past date (closest to requested date)
      if (scheduleDate <= endOfDay) {
        targetSchedule = schedule;
        break;
      }
    }
    
    if (!targetSchedule) return undefined;
    
    // Get the associated story
    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, targetSchedule.story_id))
      .limit(1);
    
    return story;
  }

  // Schedule a story for a specific date
  async scheduleStory(scheduleData: InsertStorySchedule): Promise<StorySchedule> {
    const [schedule] = await db
      .insert(storySchedule)
      .values(scheduleData)
      .returning();
    
    return schedule;
  }
}

// Create and seed the database with initial story if needed
async function setupInitialData() {
  // Check if we have any stories
  const storiesCount = await db.select({ count: stories.id }).from(stories);
  
  // If no stories, add our initial story
  if (storiesCount.length === 0 || storiesCount[0].count === 0) {
    console.log("Initializing database with starter content...");
    
    // Insert the default Samudra Manthan story
    await db.insert(stories).values({
      story_title: "The Churning of the Ocean",
      story_origin: "Ancient India",
      story_category: "Puranas",
      featured: true,
      gogi_version: `Hey friends! Gogi here! Let me tell you an AMAZING story about gods and demons and a HUGE ocean of milk! *makes monkey sounds*

So, a long long time ago, the gods were super sad because they weren't immortal. Bummer, right? They really wanted this special drink called Amrita that would make them live forever! But guess what? It was hidden deep in the ocean of milk! Splash splash!

The gods had a brilliant idea - they decided to team up with their enemies, the demons! I know, crazy! Together they used a giant snake named Vasuki as a rope and a huge mountain called Mandara as a churning stick. They started pulling back and forth, like playing tug-of-war!

But oh no! The mountain started sinking! Everyone was like "Aaaah!" Then Lord Vishnu turned into a giant turtle and swam under the mountain to hold it up. How cool is that?!

As they churned, all sorts of amazing things came out! First was this super pretty goddess named Lakshmi. Then came a white elephant, a magical horse, and even a special cow! But there was also this SUPER scary poison that almost destroyed everything! Luckily, Lord Shiva drank it to save everyone. His throat turned blue, and that's why they call him Neelakantha - Blue Throat! Isn't that funny?

Finally, after all that hard work, a man appeared carrying the Amrita! The gods and demons started fighting over it. The clever gods tricked the demons and got to drink the Amrita all for themselves! Sneaky, sneaky!

And that's how the gods became immortal! *swings from imaginary tree* Wasn't that the most AWESOME story ever? Gogi out! *monkey backflip*`,
      tara_version: `Hello adventurers! I'm Tara, and we're about to explore one of the most EPIC quests in mythology - the Samudra Manthan, or The Churning of the Ocean of Milk!

Our adventure begins during a great crisis - the gods had lost their strength and immortality! They needed to find the Amrita, the nectar of immortality, which was hidden deep within the cosmic ocean of milk.

This was no ordinary mission - it required the greatest team-up in history! The gods formed an alliance with their enemies, the demons. Can you imagine? That would be like lions and tigers working together!

For their churning rope, they enlisted Vasuki, the king of serpents. And for the churning rod? They uprooted Mount Mandara! But as soon as they placed it in the ocean, it began to sink into the depths! 

Just when all seemed lost, Lord Vishnu transformed into a giant turtle - the Kurma avatar! He dived deep and positioned himself beneath the mountain, supporting it on his massive shell. The great churning began!

The gods held the tail end of the serpent while the demons held the head. They pulled back and forth with all their might, causing the mountain to spin and churn the cosmic ocean!

Then came the treasures! Fourteen precious things emerged from the depths - Airavata, the mighty white elephant! Kamadhenu, the wish-fulfilling cow! Ucchaihshravas, the seven-headed flying horse! Each treasure more amazing than the last!

But danger struck! A terrible poison called Halahala emerged, so deadly it threatened to destroy all creation! The brave Lord Shiva stepped forward and drank the poison to save everyone! His throat turned blue from holding the poison there - that's why we call him Neelakantha, the Blue-Throated One!

Finally, after much struggling, Dhanvantari, the divine physician, emerged with the pot of Amrita! The demons grabbed it and ran, but Lord Vishnu transformed into Mohini, a beautiful enchantress, and tricked the demons so the gods could drink the nectar and regain their immortality!

What an adventure! Remember, sometimes the greatest treasures require the hardest journeys and the most surprising allies!`,
      anaya_version: `Namaste, dear ones. I am Anaya, and today I will share with you the profound story of Samudra Manthan - the Churning of the Ocean of Milk.

Long ago, in the cosmic age, the devas (gods) faced a difficult challenge. They had lost their strength and immortality due to a sage's curse. To regain their divine power, they needed to find Amrita, the nectar of immortality, which lay hidden in the depths of Kshira Sagara, the cosmic ocean of milk.

This task was too great for the devas alone, so Lord Vishnu advised them to form an alliance with their eternal rivals, the asuras (demons). This teaches us an important lesson - sometimes we must cooperate even with those we consider different from us to achieve something greater.

Mount Mandara became their churning rod, and Vasuki, the cosmic serpent, became their rope. When the mountain began to sink, Lord Vishnu took the form of Kurma, the turtle, and supported the mountain on his shell. This shows us how stability is essential for any great undertaking.

As they churned, many treasures emerged. Each represents different aspects of life: Lakshmi, the goddess of wealth and prosperity; Dhanvantari, the divine physician holding knowledge of healing; Parijata, the celestial tree fulfilling wishes; and many more wonders.

However, not all was beautiful. A potent poison called Halahala also emerged, threatening all existence. Without hesitation, Lord Shiva consumed the poison to protect all beings, holding it in his throat which turned blue. This teaches us that sometimes we must accept difficult things to protect what we love.

When Dhanvantari finally appeared with the Amrita, conflict erupted between the devas and asuras. Lord Vishnu took the form of Mohini, an enchanting female form, and through righteous deception, ensured the nectar reached the devas.

The story of Samudra Manthan reminds us that life is a balance of sweet and bitter experiences. Like the ocean that was churned, our lives sometimes need to be stirred deeply before revealing their most precious gifts. It teaches us about cooperation, perseverance, sacrifice, and the continuous cycle of creation.

Remember, dear ones, within each of you lies both the potential for divinity and the capacity for understanding life's deeper meaning. May this ancient wisdom guide your path.`
    });
  }
}

// Initialize the storage implementation
export const storage = new DatabaseStorage();

// Setup initial data when the module loads
setupInitialData().catch(err => {
  console.error("Error setting up initial data:", err);
});
