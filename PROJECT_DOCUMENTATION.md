# Kumbh360 - Complete Detailed Project Documentation

## 📚 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Features & Implementation](#5-features--implementation)
6. [API Integrations](#6-api-integrations)
7. [Core Modules](#7-core-modules)
8. [API Endpoints](#8-api-endpoints)
9. [Setup & Configuration](#9-setup--configuration)
10. [Deployment Guide](#10-deployment-guide)
11. [Testing & Quality Assurance](#11-testing--quality-assurance)
12. [Performance & Optimization](#12-performance--optimization)
13. [Security Implementation](#13-security-implementation)
14. [Troubleshooting Guide](#14-troubleshooting-guide)
15. [Code Examples](#15-code-examples)

---

## Project Overview

**Kumbh360** is a comprehensive digital companion application for the Kumbh Mela, one of the world's largest religious gatherings. The application provides real-time crowd management, intelligent chatbot assistance, emergency services, transportation booking, and multilingual support to help pilgrims navigate the event safely and efficiently.

**Target Users:**
- Pilgrims attending the Kumbh Mela
- Vendors and service providers
- Event administrators and control room operators

**Key Objectives:**
- Enhance pilgrim safety through real-time crowd monitoring
- Provide intelligent assistance via AI-powered chatbot
- Facilitate emergency response and communication
- Offer multilingual support for diverse audience
- Enable transportation and accommodation booking

---

## Technology Stack

### Frontend
- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite 5.4.14
- **Routing:** Wouter 3.3.5
- **State Management:** TanStack React Query 5.60.5
- **UI Components:** 
  - Radix UI (Comprehensive component library)
  - Tailwind CSS 3.4.14 for styling
  - Framer Motion 11.13.1 for animations
  - Lucide React for icons
- **Maps:**
  - Leaflet 1.9.4 with Leaflet.heat for heatmaps
  - Mapbox GL 3.10.0
- **Forms:** React Hook Form 7.53.1 with Zod validation
- **Internationalization:** i18next 24.2.2, react-i18next 15.4.1

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js 4.21.2
- **WebSocket:** ws 8.18.0 for real-time communication
- **Database:** 
  - Neon Serverless PostgreSQL (@neondatabase/serverless 0.10.4)
  - Drizzle ORM 0.39.1
- **AI/ML:**
  - Google Generative AI 0.22.0 (Gemini API)
  - Xenova Transformers 2.17.2
  - FAISS-node 0.5.1 (Vector search)
- **Caching:** Redis (ioredis 5.6.0)
- **Session Management:** Express-session with MemoryStore

### Languages & Runtime
- **Primary Language:** TypeScript 5.6.3
- **Module System:** ES Modules
- **Development Server:** TSX 4.19.1 (TypeScript Execute)

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  (React + TypeScript + Vite)                               │
│  • UI Components (Radix UI + Tailwind)                     │
│  • State Management (React Query)                          │
│  • Real-time Updates (WebSocket Client)                    │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────┴────────────────────────────────────────────┐
│                      Server Layer                           │
│  (Express.js + Node.js + TypeScript)                       │
│  • REST API Routes                                         │
│  • WebSocket Server (Real-time crowd updates)              │
│  • Middleware (Session, Auth, Error Handling)              │
└────────────────┬────────────────────────────────────────────┘
                 │
     ┌───────────┴───────────┬─────────────────┬──────────────┐
     │                       │                 │              │
┌────▼─────┐      ┌─────────▼──────┐  ┌──────▼──────┐  ┌────▼─────┐
│ Database │      │ AI/ML Services │  │ Cache Layer │  │ External │
│ Layer    │      │                │  │  (Redis)    │  │   APIs   │
│          │      │ • RAG Gemini   │  │             │  │          │
│ • Neon   │      │ • Vector Search│  │ • Query     │  │ • Gemini │
│   PostgreSQL    │ • Translation  │  │   Results   │  │ • Weather│
│ • Drizzle ORM   │ • Recommender  │  │ • Embeddings│  │ • News   │
│                │ • Crowd Predict│  │ • Responses │  │ • Twilio │
└─────────────────┴────────────────┴───────────────┘  └──────────┘
```

### Data Flow

1. **User Interaction:**
   - User interacts with React components
   - React Query manages API calls and caching
   - WebSocket client receives real-time updates

2. **Request Processing:**
   - Express routes handle API requests
   - Middleware validates and processes requests
   - Services perform business logic

3. **AI/ML Processing:**
   - RAG Gemini Service processes chatbot queries
   - Vector Search finds relevant context
   - Translation Service handles multilingual support
   - Recommendation Engine provides personalized suggestions

4. **Real-time Updates:**
   - WebSocket server broadcasts crowd density updates every 5 seconds
   - Alert Manager sends emergency notifications
   - Clients receive and update UI in real-time

---

## Features & Functionality

### 1. **AI-Powered Chatbot (Kumbh Mela Guide)**

**Technology:** Google Gemini AI with RAG (Retrieval-Augmented Generation)

**Capabilities:**
- **Intelligent Query Processing:** Uses Gemini 1.5 Pro model for natural language understanding
- **Context-Aware Responses:** Maintains conversation history and context
- **Knowledge Base Integration:** Searches through comprehensive Kumbh Mela knowledge base
- **Vector Search:** FAISS-based similarity search for relevant information retrieval
- **Semantic Understanding:** TF-IDF and entity extraction for intent recognition
- **Multilingual Support:** Automatic language detection and translation to 11+ languages
- **Response Feedback:** Thumbs up/down for continuous improvement
- **Smart Recommendations:** Personalized suggestions based on user context

**Implementation Location:**
- Frontend: `client/src/components/ChatInterface.tsx`
- Backend: `server/rag-gemini.ts`, `server/vector-search.ts`
- API Endpoint: `POST /api/nlp/query`

**How It Works:**
1. User sends a query in any supported language
2. System detects language and translates to English if needed
3. Vector search retrieves relevant context from knowledge base (Top 5 results with 60% similarity threshold)
4. RAG system combines query + context + chat history
5. Gemini API generates contextual response
6. Response is translated back to user's language
7. Follow-up suggestions are generated

**Key Features:**
- **Context Relevance Decay:** Higher-ranked results get more weight (85% decay factor)
- **Term Matching Enhancement:** Boost relevance by 20% for keyword matches
- **Conversation Management:** Maintains first exchange + recent 4 messages + topic summary
- **Caching:** Responses and embeddings cached for performance

### 2. **Real-Time Crowd Monitoring**

**Technology:** WebSocket, FAISS Vector Database, Predictive Analytics

**Capabilities:**
- **Live Density Grid:** Real-time crowd density visualization on interactive map
- **Location-Based Updates:** Separate crowd levels for major locations:
  - Ramkund
  - Tapovan
  - Kalaram Temple
  - Trimbakeshwar
  - Panchavati
- **Predictive Analytics:** Crowd level prediction using historical patterns
- **Peak Hour Detection:** Identifies high-traffic times (6-9 AM, 4-7 PM)
- **Alert System:** Automatic warnings when crowd levels reach thresholds
  - Warning: 70% capacity
  - Critical: 90% capacity
- **Heatmap Visualization:** Color-coded density maps using Leaflet.heat

**Implementation Location:**
- Frontend: `client/src/components/KumbhMelaMap.tsx`, `client/src/components/CrowdLevel.tsx`
- Backend: `server/routes.ts` (WebSocket server), `server/crowd-predictor.ts`
- API Endpoints: `GET /api/crowd-levels`, `GET /api/density-grid`, WebSocket: `/ws`

**How It Works:**
1. Server calculates density grid every 5 seconds
2. Grid divided into cells with metadata (nearest location, GPS coordinates)
3. Crowd Predictor analyzes historical data and predicts levels
4. Alert Manager checks thresholds and sends warnings
5. WebSocket broadcasts updates to all connected clients
6. Clients update maps and UI in real-time

### 3. **Emergency Services & SOS**

**Technology:** Twilio SMS API, Geolocation API

**Capabilities:**
- **Emergency Contact Management:** Users can add personal emergency contacts
- **SOS Alert System:** Quick emergency button with customizable message
- **Location Sharing:** Automatic GPS coordinates with SOS messages
- **Dual Notification:**
  - Send to personal emergency contacts
  - Send to control room/emergency services
- **SMS Delivery:** Via Twilio API to multiple recipients
- **Emergency Contact Directory:** Predefined list of police, medical, fire services

**Implementation Location:**
- Frontend: `client/src/components/EmergencyContacts.tsx`, `client/src/pages/home.tsx` (SOS dialog)
- Backend: `server/storage.ts` (sendSOSMessage method)
- API Endpoints: 
  - `POST /api/sos-message`
  - `GET /api/user-emergency-contacts/:userId`
  - `POST /api/user-emergency-contacts`
  - `DELETE /api/user-emergency-contacts/:contactId`
  - `GET /api/emergency-contacts`

**How It Works:**
1. User clicks SOS/Emergency button
2. Dialog prompts for emergency message
3. Browser requests current GPS location
4. User selects notification preferences (contacts/control room)
5. Server validates Twilio credentials
6. Constructs message with location coordinates
7. Sends SMS via Twilio to selected recipients
8. Confirms successful delivery to user

**Twilio Integration:**
```typescript
// Required Environment Variables
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### 4. **Smart Transportation Hub**

**Technology:** Uber API Integration (Optional)

**Capabilities:**
- **Ride Booking:** Book Uber/Ola rides directly from app
- **Fare Estimates:** Get price estimates before booking
- **Common Locations:** Quick select for major Kumbh locations
- **Multiple Ride Types:** UberGo, UberX, UberXL, etc.
- **Real-time Availability:** Check available drivers and ETAs
- **Route Optimization:** Suggest best routes based on traffic
- **Shuttle Information:** Details on official shuttle services
- **Transportation Guide:** General transport tips and options

**Implementation Location:**
- Frontend: 
  - `client/src/components/UberRideBooking.tsx`
  - `client/src/components/SmartTransportationHub.tsx`
  - `client/src/components/TransportationGuide.tsx`
  - `client/src/lib/uberApi.ts`
- API Endpoints: `GET /api/shuttle-locations`

**Common Pickup/Dropoff Locations:**
- Ramkund (20.0059°N, 73.7913°E)
- Nashik Railway Station (19.9947°N, 73.7777°E)
- Trimbakeshwar Temple (19.9321°N, 73.5308°E)
- Panchavati (20.0064°N, 73.7904°E)
- Tapovan (20.0116°N, 73.7938°E)
- Kalaram Temple (19.9977°N, 73.7901°E)

### 5. **Multilingual Translation Service**

**Technology:** Google Gemini API

**Capabilities:**
- **11 Supported Languages:**
  - English (en)
  - Hindi (hi)
  - Marathi (mr)
  - Gujarati (gu)
  - Bengali (bn)
  - Tamil (ta)
  - Telugu (te)
  - Kannada (kn)
  - Malayalam (ml)
  - Punjabi (pa)
  - Urdu (ur)
- **Automatic Language Detection:** Detects user's language from text
- **Real-time Translation:** Translates chatbot responses
- **UI Translation:** i18next for interface translations
- **Caching:** Translated content cached for performance
- **Fallback Handling:** Defaults to English if translation fails

**Implementation Location:**
- Frontend: `client/src/components/LanguageSelector.tsx`, `client/src/lib/i18n.ts`
- Backend: `server/translation-service.ts`
- API Endpoints:
  - `POST /api/translate/detect-language`
  - `POST /api/translate`

**How It Works:**
1. User selects language or system auto-detects
2. All chatbot queries translated to English for processing
3. Gemini generates response in English
4. Response translated to user's selected language
5. UI elements translated via i18next
6. All translations cached for 24 hours

### 6. **Accommodation Booking**

**Capabilities:**
- **Accommodation Finder:** Search nearby hotels, guesthouses, tent cities
- **Availability Checker:** Real-time availability status
- **Filtering Options:** By price, rating, distance, amenities
- **Booking Management:** Book and manage accommodations
- **Location Proximity:** Shows distance from major ghats

**Implementation Location:**
- Frontend: 
  - `client/src/components/AccommodationFinder.tsx`
  - `client/src/components/AccommodationBookingSheet.tsx`
- API Endpoints:
  - `GET /api/accommodations/:id/availability`
  - `POST /api/accommodations/book`

### 7. **Weather Information**

**Technology:** OpenWeather API

**Capabilities:**
- **Current Weather:** Temperature, conditions, humidity
- **Location-Based:** Weather for Nashik/Kumbh area
- **Real-time Updates:** Automatic refresh
- **Weather Icons:** Visual weather representation
- **Fallback Data:** Mock data if API unavailable

**Implementation Location:**
- Frontend: `client/src/components/WeatherWidget.tsx`
- Backend: `server/routes.ts`
- API Endpoint: `GET /api/weather`

**OpenWeather Integration:**
```typescript
// Required Environment Variable
OPENWEATHER_API_KEY=your_api_key

// API Call
GET https://api.openweathermap.org/data/2.5/weather
?lat=20.0059&lon=73.7913&appid=${API_KEY}&units=metric
```

### 8. **News & Updates**

**Technology:** NewsAPI

**Capabilities:**
- **Latest News:** Kumbh Mela and India-related news
- **Automatic Updates:** Refreshes every 1 hour
- **Image Support:** News articles with images
- **Source Attribution:** Shows news source and timestamp
- **Fallback Content:** Mock news if API unavailable

**Implementation Location:**
- Frontend: `client/src/components/NewsWidget.tsx`
- Backend: `server/storage.ts` (fetchKumbhMelaNews method)
- API Endpoint: `GET /api/news`

**NewsAPI Integration:**
```typescript
// Required Environment Variable
NEWSAPI_KEY=your_api_key

// API Call
GET https://newsapi.org/v2/everything
?q=Kumbh+Mela+OR+Nashik+OR+Festival+India
&language=en&sortBy=publishedAt&apiKey=${API_KEY}
```

### 9. **Smart Recommendation Engine**

**Technology:** Machine Learning Algorithm with Multi-factor Analysis

**Capabilities:**
- **Personalized Recommendations:** Based on user history and context
- **Real-time Crowd Consideration:** Suggests less crowded alternatives
- **Time-aware Suggestions:** Optimal visit times for locations
- **Weather-based Recommendations:** Adapts to weather conditions
- **Distance Optimization:** Suggests nearby facilities
- **Multiple Recommendation Types:**
  - Location recommendations
  - Time recommendations
  - Route recommendations
  - Activity recommendations
  - Safety recommendations
  - Food/water recommendations
  - Accommodation recommendations
  - Transportation recommendations

**Implementation Location:**
- Backend: `server/recommendation-engine.ts`
- API Endpoint: `POST /api/recommendations`

**Recommendation Algorithm Weights:**
- Crowd Level: 35%
- User History: 25%
- Time of Day: 20%
- Weather: 10%
- Distance: 10%

**How It Works:**
1. Analyzes chat history to extract user interests
2. Gets current crowd levels and facility data
3. Considers time of day and peak hours
4. Applies weighting algorithm
5. Ranks recommendations by confidence score
6. Returns top N recommendations with priority levels

### 10. **Lost & Found Service**

**Capabilities:**
- **Report Lost Items/Persons:** Submit lost reports with descriptions
- **Search Database:** Search for found items/persons
- **Location Tracking:** Where items were lost/found
- **Contact Information:** Connect finders with owners
- **Image Support:** Upload photos of lost/found items

**Implementation Location:**
- Frontend: `client/src/components/LostAndFound.tsx`

### 11. **Interactive Maps & Facilities**

**Technology:** Leaflet, Mapbox, Google Street View

**Capabilities:**
- **Facility Map:** Shows locations of:
  - Toilets/Restrooms
  - Medical centers
  - Police stations
  - Food stalls
  - Water stations
  - ATMs
  - Parking areas
- **Street View Integration:** Virtual tours of locations
- **Interactive Markers:** Click for facility details
- **Route Planning:** Get directions to facilities
- **Heatmap Overlay:** Crowd density visualization

**Implementation Location:**
- Frontend:
  - `client/src/components/FacilityMap.tsx`
  - `client/src/components/KumbhMelaMap.tsx`
  - `client/src/components/StreetView.tsx`
- API Endpoints:
  - `GET /api/facilities`
  - `GET /api/restrooms`
  - `GET /api/shuttle-locations`

### 12. **Food & Water Safety**

**Capabilities:**
- **Safe Food Vendors:** List of verified food stalls
- **Water Stations:** Locations of safe drinking water
- **Hygiene Ratings:** Vendor hygiene scores
- **Safety Tips:** Food and water safety guidelines
- **Allergen Information:** Food allergen warnings

**Implementation Location:**
- Frontend: `client/src/components/FoodWaterSafety.tsx`

### 13. **Community Features**

**Capabilities:**
- **Prayer Submission:** Submit and share prayers
- **Community Wall:** Share experiences and photos
- **Event Notifications:** Upcoming ceremonies and events
- **Group Formation:** Connect with other pilgrims
- **Language Groups:** Connect by language preference

**Implementation Location:**
- Frontend:
  - `client/src/components/CommunityFeatures.tsx`
  - `client/src/components/PrayerSubmission.tsx`

### 14. **Safety Suggestions**

**Technology:** Real-time Analysis

**Capabilities:**
- **Crowd-based Alerts:** Warnings about overcrowded areas
- **Route Suggestions:** Safer alternative routes
- **Time Recommendations:** Best times to visit locations
- **Emergency Preparedness:** Safety tips and guidelines
- **Lost Contact Recovery:** Help if separated from group

**Implementation Location:**
- Frontend: `client/src/components/RealTimeSafetySuggestion.tsx`
- Backend: `server/alert-manager.ts`

---

## API Integrations

### 1. **Google Gemini API** 
**Purpose:** AI/ML capabilities, NLP, Translation

**Models Used:**
- `gemini-1.5-pro`: Chatbot, Translation, Language Detection
- `text-embedding-004`: Vector embeddings (768 dimensions)

**Endpoints:**
- `generateContent`: Generate chatbot responses
- `embedContent`: Create vector embeddings

**Usage in Project:**
- RAG-based chatbot (`server/rag-gemini.ts`)
- Translation service (`server/translation-service.ts`)
- Vector search embeddings (`server/vector-search.ts`)

**Environment Variable:**
```bash
GEMINI_API_KEY=your_gemini_api_key
```

**Rate Limits & Optimization:**
- Implements caching for responses (2 hours TTL)
- Embeddings cached for 24 hours
- Retry logic with exponential backoff
- Timeout handling (30 seconds)

### 2. **OpenWeather API**
**Purpose:** Real-time weather data

**Endpoint:**
```
GET https://api.openweathermap.org/data/2.5/weather
```

**Parameters:**
- `lat`: Latitude (20.0059 for Nashik)
- `lon`: Longitude (73.7913 for Nashik)
- `appid`: API key
- `units`: metric (Celsius)

**Response Data:**
- Temperature
- Weather condition
- Humidity
- Wind speed
- Weather description

**Environment Variable:**
```bash
OPENWEATHER_API_KEY=your_openweather_key
```

### 3. **NewsAPI**
**Purpose:** Latest Kumbh Mela news

**Endpoint:**
```
GET https://newsapi.org/v2/everything
```

**Parameters:**
- `q`: Kumbh+Mela+OR+Nashik+OR+Festival+India
- `language`: en
- `sortBy`: publishedAt
- `apiKey`: API key

**Refresh Interval:** 1 hour

**Environment Variable:**
```bash
NEWSAPI_KEY=your_newsapi_key
```

### 4. **Twilio SMS API**
**Purpose:** Emergency SMS notifications

**Features:**
- Send emergency alerts
- Notify multiple contacts
- Include GPS coordinates
- Control room notifications

**Required Credentials:**
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

**Implementation:**
```typescript
const client = twilio(accountSid, authToken);
await client.messages.create({
  body: 'EMERGENCY SOS: [message] Location: [lat, lng]',
  from: twilioPhone,
  to: recipientNumber
});
```

### 5. **Uber API** (Optional)
**Purpose:** Ride booking integration

**Features:**
- Product availability
- Price estimates
- Ride booking
- Real-time tracking

**Environment Variables:**
```bash
VITE_UBER_API_KEY=your_uber_api_key
VITE_UBER_CLIENT_ID=your_uber_client_id
```

**Note:** Implementation present but requires API credentials for activation

---

## Core Modules

### 1. **RAG Gemini Service** (`server/rag-gemini.ts`)

**Purpose:** Retrieval-Augmented Generation for intelligent chatbot

**Key Classes:**
- `RAGGeminiService` (Singleton)

**Key Methods:**
```typescript
initialize(apiKey: string): void
chat(query: string, chatHistory: ChatMessage[], context?: any): Promise<string>
retrieveContext(query: string): Promise<string>
formatChatHistory(chatHistory: ChatMessage[]): Content[]
```

**Features:**
- Vector search for relevant context (max 5 items, 60% threshold)
- Context relevance decay (85% factor)
- Chat history management (keeps first + last 4 + topic summary)
- Response caching (2 hours TTL)
- Conversation continuation tracking
- Error handling and fallbacks

**Configuration:**
- Max output tokens: 1024
- Max context items: 5
- Min similarity threshold: 0.60
- Context relevance decay: 0.85

### 2. **Vector Search Manager** (`server/vector-search.ts`)

**Purpose:** FAISS-based similarity search for knowledge base

**Key Technologies:**
- FAISS (Facebook AI Similarity Search)
- Google Gemini embeddings (768 dimensions)

**Key Methods:**
```typescript
initialize(knowledgeBase: KnowledgeBase[], apiKey?: string): Promise<void>
search(query: string, k: number, threshold?: number): Promise<KnowledgeBase[]>
addKnowledgeBaseToIndex(knowledgeBase: KnowledgeBase[]): Promise<void>
getEmbedding(text: string): Promise<number[]>
```

**Features:**
- IndexFlatL2 for L2 distance metric
- Automatic embedding generation
- Similarity threshold filtering
- Fallback to TF-IDF if embeddings unavailable
- Efficient batch processing

**Performance:**
- Embeddings cached for 24 hours
- Parallel embedding generation
- Singleton pattern for efficiency

### 3. **Translation Service** (`server/translation-service.ts`)

**Purpose:** Multilingual support via Gemini API

**Key Methods:**
```typescript
initialize(apiKey: string): void
detectLanguage(text: string): Promise<string>
translate(text: string, targetLang: string, sourceLang?: string): Promise<string>
```

**Supported Languages:** 11 languages (en, hi, mr, gu, bn, ta, te, kn, ml, pa, ur)

**Features:**
- Automatic language detection
- Translation caching (24 hours)
- Retry logic (max 2 attempts)
- Timeout handling (30 seconds)
- Fallback to English

**Optimization:**
- Short text handling (< 2 chars defaults to English)
- Cached results for repeated translations
- Error recovery mechanisms

### 4. **Recommendation Engine** (`server/recommendation-engine.ts`)

**Purpose:** Personalized recommendations using ML

**Algorithm Factors:**
```typescript
WEIGHT_CROWD_LEVEL = 0.35
WEIGHT_USER_HISTORY = 0.25
WEIGHT_TIME_OF_DAY = 0.20
WEIGHT_WEATHER = 0.10
WEIGHT_DISTANCE = 0.10
```

**Time Slots:**
- Early Morning (4-7 AM): 30% crowd factor
- Morning (7-11 AM): 70% crowd factor
- Mid-day (11 AM-2 PM): 80% crowd factor
- Afternoon (2-5 PM): 60% crowd factor
- Evening (5-8 PM): 90% crowd factor
- Night (8 PM-12 AM): 50% crowd factor
- Late Night (12-4 AM): 20% crowd factor

**Crowd Thresholds:**
- Low: < 30%
- Moderate: 30-60%
- High: 60-80%
- Critical: > 80%

**Recommendation Types:**
1. Location (least crowded alternatives)
2. Time (optimal visit times)
3. Route (safer/faster paths)
4. Activity (based on interests)
5. Safety (emergency info)
6. Food (nearby vendors)
7. Accommodation (availability)
8. Transportation (booking options)

**Key Methods:**
```typescript
generateRecommendations(
  sessionId: string,
  chatHistory: ChatMessage[],
  currentLocation?: Location,
  intent?: string,
  maxRecommendations: number = 3
): Promise<Recommendation[]>
```

### 5. **Crowd Predictor** (`server/crowd-predictor.ts`)

**Purpose:** Predict crowd levels using historical data

**Algorithm:**
```typescript
predictedLevel = baseLevel * peakHourMultiplier * weatherImpact * eventImpact
```

**Peak Hours:** 6-9 AM, 4-7 PM (1.5x multiplier)

**Factors:**
- Historical crowd data
- Time of day
- Weather conditions
- Special events
- Day of week

**Output:** Predicted crowd level (1-5 scale)

### 6. **Alert Manager** (`server/alert-manager.ts`)

**Purpose:** Real-time crowd alerts via WebSocket

**Thresholds:**
- Warning: 70% capacity
- Critical: 90% capacity

**Alert Types:**
- Emergency: Critical overcrowding
- Warning: High crowd levels

**Delivery:** WebSocket broadcast to all connected clients

### 7. **Cache Manager** (`server/cache-manager.ts`)

**Purpose:** Redis-based caching layer

**Cache Types:**
- Query Results: 1 hour TTL
- Gemini Responses: 2 hours TTL
- Embeddings: 24 hours TTL
- Translations: 24 hours TTL

**Features:**
- Optional Redis integration (falls back to memory)
- Type-specific TTL configurations
- Automatic cache invalidation
- Error handling and fallbacks

### 8. **Storage Service** (`server/storage.ts`)

**Purpose:** Data persistence and business logic

**Key Features:**
- Knowledge base management
- Crowd level calculations
- Density grid generation
- News fetching and caching
- Emergency contact management
- SOS message handling
- Accommodation bookings
- Facility information

**Key Methods:**
```typescript
getKnowledgeBase(): Promise<KnowledgeBase[]>
calculateDensityGrid(): Promise<DensityGrid[]>
getAllCrowdLevels(): Promise<CrowdLevel[]>
getAllNews(): Promise<News[]>
sendSOSMessage(...): Promise<{success: boolean, error?: string}>
getUserEmergencyContacts(userId: string): Promise<EmergencyContact[]>
```

---

## Setup & Configuration

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- PostgreSQL database (optional, uses Neon serverless)
- Redis server (optional, for caching)

### Installation

1. **Clone Repository:**
```bash
cd Kumbh360Main-17-version-1
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Environment Configuration:**

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=your_neon_postgres_url

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# OpenWeather API
OPENWEATHER_API_KEY=your_openweather_key

# NewsAPI
NEWSAPI_KEY=your_newsapi_key

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Uber API (Optional)
VITE_UBER_API_KEY=your_uber_key
VITE_UBER_CLIENT_ID=your_uber_client_id

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
```

4. **Database Setup:**
```bash
npm run db:push
```

5. **Run Development Server:**
```bash
npm run dev
```

The application will be available at: **http://localhost:5000**

### Production Build

```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```

### Scripts

```json
{
  "dev": "tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

---

## API Endpoints

### Chat & NLP

#### POST `/api/nlp/query`
**Purpose:** Process chatbot queries with RAG

**Request Body:**
```json
{
  "query": "What are the timings for Ramkund?",
  "chatHistory": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Namaste!"}
  ],
  "context": {
    "location": {"lat": 20.0059, "lng": 73.7913},
    "language": "en"
  }
}
```

**Response:**
```json
{
  "response": "Ramkund is open 24/7...",
  "suggestions": ["Tell me about Tapovan", "Safety tips"],
  "queryId": 123
}
```

#### POST `/api/nlp/feedback`
**Purpose:** Submit feedback on chatbot responses

**Request Body:**
```json
{
  "queryId": 123,
  "feedback": 1
}
```

#### POST `/api/nlp/embed`
**Purpose:** Generate embeddings for text

**Request Body:**
```json
{
  "text": "Kumbh Mela information"
}
```

#### GET `/api/nlp/status`
**Purpose:** Check NLP service status

**Response:**
```json
{
  "nlpServiceReady": true,
  "ragServiceReady": true,
  "translationServiceReady": true,
  "vectorSearchReady": true
}
```

### Translation

#### POST `/api/translate/detect-language`
**Purpose:** Detect language of text

**Request Body:**
```json
{
  "text": "नमस्ते"
}
```

**Response:**
```json
{
  "language": "hi"
}
```

#### POST `/api/translate`
**Purpose:** Translate text

**Request Body:**
```json
{
  "text": "Hello",
  "targetLanguage": "hi",
  "sourceLanguage": "en"
}
```

**Response:**
```json
{
  "translatedText": "नमस्ते",
  "targetLanguage": "hi"
}
```

### Crowd & Safety

#### GET `/api/density-grid`
**Purpose:** Get real-time crowd density grid

**Response:**
```json
[
  {
    "lat": 20.0059,
    "lng": 73.7913,
    "density": 0.75,
    "metadata": {
      "nearestLocation": "Ramkund",
      "address": "Panchavati, Nashik"
    }
  }
]
```

#### GET `/api/crowd-levels`
**Purpose:** Get crowd levels for all locations

**Response:**
```json
[
  {
    "location": "Ramkund",
    "level": 4,
    "capacity": 10000,
    "currentCount": 8500,
    "lastUpdated": "2026-03-09T10:30:00Z"
  }
]
```

#### POST `/api/recommendations`
**Purpose:** Get personalized recommendations

**Request Body:**
```json
{
  "sessionId": "user123",
  "chatHistory": [...],
  "currentLocation": {"lat": 20.0059, "lng": 73.7913},
  "intent": "visit",
  "maxRecommendations": 3
}
```

### Emergency

#### GET `/api/emergency-contacts`
**Purpose:** Get emergency service contacts

**Response:**
```json
[
  {
    "name": "Police Control Room",
    "number": "100",
    "type": "police"
  }
]
```

#### GET `/api/user-emergency-contacts/:userId`
**Purpose:** Get user's personal emergency contacts

#### POST `/api/user-emergency-contacts`
**Purpose:** Add emergency contact

**Request Body:**
```json
{
  "userId": "user123",
  "contactName": "John Doe",
  "contactNumber": "+919876543210",
  "relationship": "Family"
}
```

#### DELETE `/api/user-emergency-contacts/:contactId`
**Purpose:** Remove emergency contact

#### POST `/api/sos-message`
**Purpose:** Send emergency SOS alert

**Request Body:**
```json
{
  "userId": "user123",
  "location": {"lat": 20.0059, "lng": 73.7913},
  "message": "Need immediate help",
  "toControlRoom": true,
  "toContacts": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "SOS message sent successfully"
}
```

### Facilities & Information

#### GET `/api/facilities`
**Purpose:** Get all facilities (toilets, medical, etc.)

#### GET `/api/restrooms`
**Purpose:** Get restroom locations

#### GET `/api/shuttle-locations`
**Purpose:** Get shuttle bus locations and schedules

#### GET `/api/kumbh-locations`
**Purpose:** Get major Kumbh Mela locations with info

#### GET `/api/weather`
**Purpose:** Get current weather for Nashik

**Response:**
```json
{
  "temperature": 28,
  "condition": "Sunny",
  "humidity": 65
}
```

#### GET `/api/news`
**Purpose:** Get latest Kumbh Mela news

**Response:**
```json
[
  {
    "title": "Kumbh Mela 2025 begins",
    "description": "Millions gather...",
    "url": "https://...",
    "imageUrl": "https://...",
    "publishedAt": "2026-03-09T08:00:00Z"
  }
]
```

### Accommodation

#### GET `/api/accommodations/:id/availability`
**Purpose:** Check accommodation availability

#### POST `/api/accommodations/book`
**Purpose:** Book accommodation

**Request Body:**
```json
{
  "accommodationId": 1,
  "userId": "user123",
  "checkIn": "2026-03-10",
  "checkOut": "2026-03-12",
  "guests": 2
}
```

### WebSocket

#### WebSocket `/ws`
**Purpose:** Real-time updates

**Message Types:**

1. **Initial Density:**
```json
{
  "type": "initial_density",
  "data": {...}
}
```

2. **Density Update:**
```json
{
  "type": "density_update",
  "data": {
    "grid": [...],
    "crowdLevels": [...],
    "timestamp": "2026-03-09T10:30:00Z"
  }
}
```

3. **Crowd Alert:**
```json
{
  "type": "crowd_alert",
  "data": {
    "type": "warning",
    "location": "Ramkund",
    "message": "High crowd levels...",
    "timestamp": "2026-03-09T10:30:00Z"
  }
}
```

---

## Performance Optimizations

### 1. **Caching Strategy**
- Query results: 1 hour
- Gemini responses: 2 hours
- Embeddings: 24 hours
- Translations: 24 hours
- News: 1 hour refresh

### 2. **Database**
- Connection pooling via Drizzle ORM
- Neon serverless for auto-scaling
- Indexed queries for crowd levels

### 3. **WebSocket**
- Efficient broadcasting to multiple clients
- 5-second update intervals
- Selective updates (only changed data)

### 4. **API Rate Limiting**
- Gemini API: Retry with exponential backoff
- External APIs: Cached responses
- Timeout handling: 30 seconds

### 5. **Frontend**
- React Query for data caching
- Lazy loading of components
- Optimized re-renders
- Service worker for offline support

---

## Security Considerations

1. **API Keys:** Stored in environment variables, never committed
2. **Input Validation:** All user inputs validated and sanitized
3. **SQL Injection:** Protected via Drizzle ORM
4. **XSS Prevention:** React's built-in XSS protection
5. **CORS:** Configured for specific origins
6. **Session Management:** Express-session with secure cookies
7. **Rate Limiting:** Implemented for API endpoints
8. **HTTPS:** Required in production

---

## Future Enhancements

1. **Mobile App:** React Native version
2. **Offline Mode:** Progressive Web App with service workers
3. **AR Navigation:** Augmented reality for wayfinding
4. **Voice Assistant:** Hands-free interaction
5. **Payment Integration:** For bookings and donations
6. **Social Features:** Enhanced community engagement
7. **Analytics Dashboard:** For administrators
8. **Multi-Event Support:** Extend to other Kumbh locations

---

## Troubleshooting

### Common Issues

1. **Gemini API not working:**
   - Check `GEMINI_API_KEY` is set correctly
   - Verify API quota not exceeded
   - Check internet connectivity

2. **WebSocket disconnects:**
   - Ensure port 5000 is open
   - Check firewall settings
   - Verify server is running

3. **Translations failing:**
   - Translation service falls back to English
   - Check Gemini API status
   - Clear cache and retry

4. **SOS messages not sending:**
   - Verify Twilio credentials
   - Check phone number format (+country code)
   - Ensure sufficient Twilio credit

5. **Database connection issues:**
   - Verify `DATABASE_URL` is correct
   - Check database server status
   - Run `npm run db:push` to sync schema

---

## Support & Contact

For issues, questions, or contributions, please contact the development team.

**Project Repository:** Kumbh360Main-17-version-1

**License:** MIT

---

## Conclusion

Kumbh360 is a comprehensive digital solution that combines modern web technologies, AI/ML capabilities, and real-time data processing to enhance the Kumbh Mela experience for millions of pilgrims. The application demonstrates the power of technology in managing large-scale events while maintaining focus on user safety, accessibility, and cultural sensitivity.

**Key Achievements:**
- ✅ Intelligent AI chatbot with 11-language support
- ✅ Real-time crowd monitoring and predictions
- ✅ Emergency services with SMS integration
- ✅ Smart recommendations engine
- ✅ Comprehensive facility mapping
- ✅ Transportation and accommodation booking
- ✅ Community engagement features

**Technologies Showcased:**
- TypeScript & React for robust UI
- Express.js for scalable backend
- Google Gemini AI for NLP & translation
- FAISS for vector search
- WebSocket for real-time updates
- Redis for caching
- PostgreSQL for data persistence

The project exemplifies best practices in full-stack development, API integration, real-time systems, and AI-powered applications.
