# Mythika: Indian Mythological Stories for Children

<img width="218" alt="image" src="https://github.com/user-attachments/assets/1c35e4a2-0e14-43eb-98fa-c900b0e5d7ec" />


Mythika is a mobile-friendly web application designed to introduce children ages 6-14 to the rich world of Indian mythology through interactive storytelling. Each story is narrated by three distinct characters, each with their own storytelling style, bringing ancient Puranic tales to life in a way that's engaging and educational.

## 📱 Live Demo

Visit [Mythika Stories](https://mythika-stories.replit.app) to experience the application.

## ✨ Features

- **Three Unique Narrators**: Choose between Gogi the Monkey (fun & playful), Tara the Explorer (adventurous & educational), or Anaya the Wise (thoughtful & philosophical)
- **Voice Narration**: Built-in text-to-speech functionality with adjustable reading speed for each narrator
- **Authentic Indian Design**: Beautiful UI with temple-inspired borders, mandala backgrounds, and traditional motifs
- **Mobile-First Design**: Fully responsive interface that works on all devices
- **Database-Backed**: PostgreSQL database with scheduled story rotation
- **Admin API**: REST API for adding and managing stories

## 🧩 Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, Shadcn/UI components
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS with custom Indian-themed components

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mythika.git
   cd mythika
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/mythika
   ```

4. Push schema to the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:5000 in your browser

## 📚 Adding Stories

Stories can be added through the API endpoints:

### Add a new story:
```bash
curl -X POST http://localhost:5000/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "story_title": "Story Title Here",
    "story_origin": "Region of India",
    "story_category": "Category",
    "featured": true,
    "gogi_version": "Gogi's version of the story...",
    "tara_version": "Tara's version of the story...",
    "anaya_version": "Anaya's version of the story..."
  }'
```

### Schedule a story for a specific date:
```bash
curl -X POST http://localhost:5000/api/stories/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "story_id": 2,
    "scheduled_date": "2025-04-15T00:00:00.000Z",
    "active": true
  }'
```

## 🔄 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stories` | GET | Get all stories |
| `/api/stories` | POST | Add a new story |
| `/api/stories/:id` | GET | Get story by ID |
| `/api/stories/latest` | GET | Get today's featured story |
| `/api/stories/featured` | GET | Get all featured stories |
| `/api/stories/bydate/:date` | GET | Get story for specific date (format: YYYY-MM-DD) |
| `/api/stories/schedule` | POST | Schedule a story for a specific date |

## 🎨 UI Components

The application features custom-designed UI components with an authentic Indian aesthetic:

- Temple-inspired borders
- Diya (Indian lamp) icon
- Mandala backgrounds
- Traditional Indian color palette (saffron, green, white, and purple)
- Indian-styled fonts (Yatra One for headers, Tiro Devanagari Sanskrit for content)

## 🗣️ Narration Module

Each storyteller character has a unique voice configuration:

- **Gogi the Monkey**: Energetic voice with higher pitch and faster pace
- **Tara the Explorer**: Clear, standard voice at normal pace
- **Anaya the Wise**: Thoughtful voice with slightly lower pitch and slower pace

The narration module allows children to:
- Play/pause/stop the narration
- Adjust the reading speed
- Experience the story through audio while following along with the text

## 📅 Story Scheduling System

The application features a scheduling system that displays different stories on different dates:

1. Stories can be scheduled for specific dates
2. If no story is scheduled for today, the app shows the most recently added story
3. Featured stories can be highlighted in the UI

## 📱 Responsive Design

The application is fully responsive and works on:
- Mobile phones (portrait and landscape)
- Tablets
- Desktop computers

## 📋 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Illustrations and characters inspired by Indian artistic traditions
- Story content adapted from various Puranic sources with child-friendly language
- UI design elements inspired by traditional Indian temple architecture
