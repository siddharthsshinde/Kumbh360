import type { Facility, EmergencyContact, UserEmergencyContact, CrowdLevel, ChatHistory, ResponseTemplate, ChatMessage, DensityGrid, GridConfig } from "@shared/schema";
import { pipeline } from '@xenova/transformers';
import kumbhData from "../attached_assets/kumbh_mela_dataset.json";

// Initialize the embedding model
let embedder: any = null;
async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (normA * normB);
}

// Get embedding for a text string
async function getEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => !stopWords.has(word));
  return Array.from(new Set(words));
}

export interface IStorage {
  getAllFacilities(): Promise<Facility[]>;
  getAllEmergencyContacts(): Promise<EmergencyContact[]>;
  getAllCrowdLevels(): Promise<CrowdLevel[]>;
  getAllNews(): Promise<{
    id: number;
    title: string;
    content: string;
    language: string;
    timestamp: string;
    category?: string;
  }[]>;
  getKumbhLocations(): Promise<{
    id: number;
    name: string;
    description: string;
    history: string;
    timings: {
      opening: string;
      closing: string;
      specialEvents?: string[];
    };
    currentStatus: string;
    lastUpdated: string;
  }[]>;
  getShuttleLocations(): Promise<{
    id: string;
    routeName: string;
    currentLocation: string;
    nextStop: string;
    estimatedArrival: string;
    capacity: string;
    status: "on-time" | "delayed" | "crowded";
    coordinates: { lat: number; lng: number };
  }[]>;
  getRestrooms(): Promise<{
    id: string;
    location: string;
    nearestStop: string;
    status: "operational" | "maintenance" | "closed";
    accessibility: boolean;
    coordinates: { lat: number; lng: number };
    facilities?: string[];
  }[]>;
  storeUserQuery(data: {
    query: string;
    response: string;
    sources: string[];
    feedback?: number | null;
    confidence?: number;
    learnedFromGemini?: boolean;
    autoLearned?: boolean;
  }): Promise<number>; // Returns the query ID
  updateQueryFeedback(queryId: number, feedback: number): Promise<void>;
  getFlaggedQueriesForReview(): Promise<UserQuery[]>;
  addQueryToKnowledgeBase(queryId: number): Promise<void>; // Adds a user query to knowledge base
  getQueriesWithFeedback(feedbackValue: number): Promise<UserQuery[]>; // Get queries with specific feedback
  getKnowledgeBase(topic?: string): Promise<KnowledgeBase[]>;
  // New methods for enhanced chat functionality
  getChatHistory(sessionId: string): Promise<ChatMessage[]>;
  saveChatMessage(sessionId: string, message: ChatMessage): Promise<void>;
  getResponseTemplate(type: string): Promise<ResponseTemplate | null>;
  formatResponse(template: string, variables: Record<string, string>): string;
  storeKnowledgeBase(data: {
    topic: string;
    content: string;
    source?: string;
    confidence?: number;
  }): Promise<void>;
  searchKnowledgeBase(query: string): Promise<KnowledgeBase | null>;
  // User emergency contacts methods
  getUserEmergencyContacts(userId: string): Promise<UserEmergencyContact[]>;
  saveUserEmergencyContact(contact: Omit<UserEmergencyContact, 'id'>): Promise<number>;
  deleteUserEmergencyContact(contactId: number): Promise<void>;
  
  // SMS functionality
  sendSOSMessage(userId: string, location: Location, message: string, toControlRoom: boolean, toContacts: boolean): Promise<{success: boolean, error?: string}>;
  
  // New density grid methods
  calculateDensityGrid(config: GridConfig): Promise<DensityGrid[]>;
  getDensityGridForLocation(locationId: number): Promise<DensityGrid[]>;
  updateDensityGrid(locationId: number, density: number[][]): Promise<void>;
}

export interface KnowledgeBase {
  id: number;
  topic: string;
  content: string;
  source?: string;
  lastUpdated: string;
  confidence: number;
  verified: boolean;
  embedding?: number[];
  keywords?: string[];
  indexId?: number; // For vector indexing
}

interface UserQuery {
  id: number;
  query: string;
  response: string;
  sources: string[];
  timestamp: string;
  feedback: number | null;
  flaggedForReview?: boolean;
  autoLearned?: boolean;
  confidence?: number;
  learnedFromGemini?: boolean;
  queryEmbedding?: number[];
}


interface CrowdMigrationPattern {
  from: string;
  to: string;
  flowRate: number;
  timeRange: [number, number];
}

interface Location {
  lat: number;
  lng: number;
}

interface GridMetadata {
  lat: number;
  lng: number;
  color: string;
  nearestLocation?: string;
  distanceToNearest?: number;
  intensity?: number;
  timestamp: string;
}

export class MemStorage implements IStorage {
  private facilities: Facility[] = [
    {
      id: 1,
      name: "Ramkund",
      type: "holy_site",
      location: { lat: 20.0059, lng: 73.7913 },
      address: "Panchavati, Nashik, Maharashtra",
      contact: "+91 253-2590835",
    },
    {
      id: 2,
      name: "Civil Hospital",
      type: "hospital",
      location: { lat: 19.9975, lng: 73.7765 },
      address: "Mumbai Naka, Nashik, Maharashtra",
      contact: "0253-2572038",
    },
    {
      id: 3,
      name: "Hotel Panchavati",
      type: "hotel",
      location: { lat: 19.9985, lng: 73.7885 },
      address: "CBS, Nashik, Maharashtra",
      contact: "0253-2232299",
    },
    {
      id: 4,
      name: "Tapovan",
      type: "holy_site",
      location: { lat: 20.0116, lng: 73.7938 },
      address: "Tapovan, Nashik, Maharashtra",
      contact: "+91 253-2591567",
    },
    {
      id: 5,
      name: "Kalaram Temple",
      type: "temple",
      location: { lat: 20.0064, lng: 73.7904 },
      address: "Panchavati, Nashik, Maharashtra",
      contact: "+91 253-2590127",
    },
    {
      id: 6,
      name: "Trimbakeshwar Temple",
      type: "temple",
      location: { lat: 19.9322, lng: 73.5309 },
      address: "Trimbak, Nashik, Maharashtra",
      contact: "+91 253-2345678",
    },
    {
      id: 7,
      name: "Nashik Road Station Medical Center",
      type: "hospital",
      location: { lat: 19.9889, lng: 73.7828 },
      address: "Nashik Road, Maharashtra",
      contact: "0253-2465789",
    },
    {
      id: 8,
      name: "Hotel Ginger Nashik",
      type: "hotel",
      location: { lat: 19.9978, lng: 73.7890 },
      address: "Satpur, Nashik, Maharashtra",
      contact: "0253-6612000",
    },
    {
      id: 9,
      name: "Someshwar Temple",
      type: "temple",
      location: { lat: 20.0073, lng: 73.7884 },
      address: "Panchavati, Nashik, Maharashtra",
      contact: "+91 253-2591234",
    },
    {
      id: 10,
      name: "Emergency Response Center",
      type: "hospital",
      location: { lat: 20.0012, lng: 73.7899 },
      address: "Central Nashik, Maharashtra",
      contact: "0253-2345098",
    }
  ];

  private emergencyContacts: EmergencyContact[] = [
    {
      id: 1,
      name: "Nashik Police Control Room",
      number: "+919975854488",
      type: "police",
      address: "Police Headquarters, Sharanpur Road, Nashik",
      available24x7: true,
      zone: "Central Nashik"
    },
    {
      id: 2,
      name: "Civil Hospital Nashik",
      number: "+919975854488",
      type: "hospital",
      address: "Mumbai Naka, Nashik",
      available24x7: true,
      zone: "Mumbai Naka"
    },
    {
      id: 3,
      name: "Missing Person Help Desk",
      number: "+919975854488",
      type: "emergency",
      address: "Kumbh Mela Control Room, Panchavati",
      available24x7: true,
      zone: "Panchavati"
    }
  ];

  private crowdLevels: CrowdLevel[] = [];
  private crowdUpdates = kumbhData.crowdUpdates;
  private currentUpdateIndex = 0;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastDataRefresh: number = Date.now();

  // Track dynamic movement of crowds between locations
  private crowdMigrationPatterns: CrowdMigrationPattern[] = [
    // Pattern 1: Morning ritual flow - Godavari to Ramkund to Kalaram
    { from: "Godavari Ghat", to: "Ramkund", flowRate: 0.15, timeRange: [4, 10] },
    { from: "Ramkund", to: "Kalaram Temple", flowRate: 0.2, timeRange: [5, 11] },

    // Pattern 2: Midday visitor circulation
    { from: "Kalaram Temple", to: "Tapovan", flowRate: 0.1, timeRange: [11, 15] },
    { from: "Tapovan", to: "Godavari Ghat", flowRate: 0.15, timeRange: [12, 16] },

    // Pattern 3: Evening ceremonies
    { from: "Tapovan", to: "Ramkund", flowRate: 0.25, timeRange: [16, 20] },
    { from: "Godavari Ghat", to: "Ramkund", flowRate: 0.3, timeRange: [16, 20] },

    // Pattern 4: Night dispersal
    { from: "Ramkund", to: "Godavari Ghat", flowRate: 0.15, timeRange: [20, 23] },
    { from: "Kalaram Temple", to: "Godavari Ghat", flowRate: 0.1, timeRange: [19, 23] }
  ];

  private newsItems: {
    id: number;
    title: string;
    content: string;
    language: string;
    timestamp: string;
    category?: string;
  }[] = [];

  private kumbhLocations = [
    {
      id: 1,
      name: "Ramkund",
      description: "The most sacred bathing spot in Nashik where Lord Rama and Sita bathed during their exile.",
      history: "According to mythology, Lord Rama stayed here during his exile. The kund (reservoir) is believed to have special spiritual significance.",
      timings: {
        opening: "4:00 AM",
        closing: "10:00 PM",
        specialEvents: ["Morning Aarti at 5:30 AM", "Evening Aarti at 7:00 PM"]
      },
      currentStatus: "Open for devotees",
      lastUpdated: new Date().toISOString()
    },
    {
      id: 2,
      name: "Tapovan",
      description: "Ancient meditation site where Lord Rama, Sita and Lakshmana stayed during their exile.",
      history: "Tapovan is where sages have meditated for centuries. The serene environment makes it perfect for spiritual practices.",
      timings: {
        opening: "6:00 AM",
        closing: "6:00 PM",
        specialEvents: ["Meditation sessions at sunrise", "Evening prayers"]
      },
      currentStatus: "Open for visitors",
      lastUpdated: new Date().toISOString()
    },
    {
      id: 3,
      name: "Kalaram Temple",
      description: "Historic black stone temple dedicated to Lord Rama, featuring exquisite architecture.",
      history: "Built in 1788, this temple is known for its architectural beauty and religious significance.",
      timings: {
        opening: "5:00 AM",
        closing: "9:00 PM",
        specialEvents: ["Morning Aarti at 5:30 AM", "Evening Aarti at 7:00 PM", "Noon Bhog at 12:00 PM"]
      },
      currentStatus: "Open for darshan",
      lastUpdated: new Date().toISOString()
    },
    {
      id: 4,
      name: "Trimbakeshwar",
      description: "One of the 12 Jyotirlingas, where the Godavari River originates.",
      history: "This ancient temple is one of the holiest shrines of Lord Shiva, featuring unique three-faced lingam.",
      timings: {
        opening: "4:00 AM",
        closing: "11:00 PM",
        specialEvents: ["Special morning abhishek at 4:30 AM", "Night aarti at 10:00 PM"]
      },
      currentStatus: "Open for darshan",
      lastUpdated: new Date().toISOString()
    }
  ];

  private shuttleLocations = [
    {
      id: "S1",
      routeName: "Nashik Road → Ramkund",
      currentLocation: "Mumbai Naka",
      nextStop: "Panchavati",
      estimatedArrival: "5 mins",
      capacity: "50%",
      status: "on-time" as const,
      coordinates: { lat: 19.9889, lng: 73.7828 }
    },
    {
      id: "S2",
      routeName: "CBS → Tapovan",
      currentLocation: "Gangapur Road",
      nextStop: "Tapovan",
      estimatedArrival: "10 mins",
      capacity: "75%",
      status: "crowded" as const,
      coordinates: { lat: 20.0116, lng: 73.7938 }
    },
    {
      id: "S3",
      routeName: "Municipal Corp → Trimbakeshwar",
      currentLocation: "Cidco",
      nextStop: "Trimbakeshwar",
      estimatedArrival: "15 mins",
      capacity: "30%",
      status: "delayed" as const,
      coordinates: { lat: 19.9322, lng: 73.5309 }
    },
    {
      id: "S4",
      routeName: "Panchavati Circuit",
      currentLocation: "Kalaram Temple",
      nextStop: "Someshwar Temple",
      estimatedArrival: "7 mins",
      capacity: "40%",
      status: "on-time" as const,
      coordinates: { lat: 20.0064, lng: 73.7904 }
    },
    {
      id: "S5",
      routeName: "Nashik City Special",
      currentLocation: "Civil Hospital",
      nextStop: "CBS",
      estimatedArrival: "12 mins",
      capacity: "60%",
      status: "on-time" as const,
      coordinates: { lat: 19.9975, lng: 73.7765 }
    },
    {
      id: "S6",
      routeName: "Holy Sites Express",
      currentLocation: "Someshwar",
      nextStop: "Ramkund",
      estimatedArrival: "8 mins",
      capacity: "85%",
      status: "crowded" as const,
      coordinates: { lat: 20.0073, lng: 73.7884 }
    }
  ];

  private restrooms = [
    {
      id: "R1",
      location: "Ramkund Complex",
      nearestStop: "Ramkund Bus Stop",
      status: "operational" as const,
      accessibility: true,
      coordinates: { lat: 20.0059, lng: 73.7913 },
      facilities: ["Baby Change", "Wheelchair Access", "24/7"]
    },
    {
      id: "R2",
      location: "Panchavati Market",
      nearestStop: "Panchavati Circle",
      status: "operational" as const,
      accessibility: true,
      coordinates: { lat: 20.0064, lng: 73.7904 },
      facilities: ["Wheelchair Access"]
    },
    {
      id: "R3",
      location: "Tapovan Area",
      nearestStop: "Tapovan Bus Stand",
      status: "maintenance" as const,
      accessibility: true,
      coordinates: { lat: 20.0116, lng: 73.7938 },
      facilities: ["Baby Change", "Wheelchair Access"]
    },
    {
      id: "R4",
      location: "CBS Complex",
      nearestStop: "Central Bus Station",
      status: "operational" as const,
      accessibility: true,
      coordinates: { lat: 19.9985, lng: 73.7885 },
      facilities: ["Baby Change", "Wheelchair Access", "24/7"]
    },
    {
      id: "R5",
      location: "Trimbakeshwar Temple",
      nearestStop: "Trimbak Bus Stand",
      status: "operational" as const,
      accessibility: true,
      coordinates: { lat: 19.9322, lng: 73.5309 },
      facilities: ["Wheelchair Access", "24/7"]
    },
    {
      id: "R6",
      location: "Nashik Road Station",
      nearestStop: "Railway Station",
      status: "operational" as const,
      accessibility: true,
      coordinates: { lat: 19.9889, lng: 73.7828 },
      facilities: ["Baby Change", "Wheelchair Access", "24/7"]
    },
    {
      id: "R7",
      location: "Someshwar Temple Complex",
      nearestStop: "Someshwar Stop",
      status: "operational" as const,
      accessibility: true,
      coordinates: { lat: 20.0073, lng: 73.7884 },
      facilities: ["Wheelchair Access"]
    },
    {
      id: "R8",
      location: "Civil Hospital Area",
      nearestStop: "Hospital Gate",
      status: "operational" as const,
      accessibility: true,
      coordinates: { lat: 19.9975, lng: 73.7765 },
      facilities: ["Baby Change", "Wheelchair Access", "24/7", "Medical Aid"]
    }
  ];

  private knowledgeBaseItems: KnowledgeBase[] = [];
  private userQueriesData: UserQuery[] = [];
  private queryIdCounter = 1;
  private chatHistories: Record<string, ChatMessage[]> = {};
  private responseTemplates: ResponseTemplate[] = [
    {
      id: 1,
      templateType: 'location_info',
      template: '{{location}} is {{status}}. Current crowd level is {{crowdLevel}}. {{recommendations}}',
      variables: ['location', 'status', 'crowdLevel', 'recommendations'],
      lastModified: new Date().toISOString()
    },
    {
      id: 2,
      templateType: 'emergency_response',
      template: 'For immediate assistance at {{location}}, contact {{contact}}. {{additionalInfo}}',
      variables: ['location', 'contact', 'additionalInfo'],
      lastModified: new Date().toISOString()
    }
  ];

  private userEmergencyContacts: UserEmergencyContact[] = [];
  private densityGridData: DensityGrid[] = [];
  private readonly keyLocations = {
    "Ramkund": { lat: 20.0059, lng: 73.7913, radius: 0.5 },
    "Tapovan": { lat: 20.0116, lng: 73.7938, radius: 0.3 },
    "Kalaram Temple": { lat: 20.0064, lng: 73.7904, radius: 0.4 },
    "Trimbakeshwar": { lat: 19.9322, lng: 73.5309, radius: 0.6 }
  };

  private gridConfig: GridConfig = {
    gridSize: 100, // Increased for better resolution
    boundaries: {
      north: 20.0116, // Tapovan
      south: 19.9322, // Trimbakeshwar
      east: 73.7938, // Tapovan
      west: 73.5309, // Trimbakeshwar
    },
    resolution: 50, // Reduced for finer granularity
  };

  constructor() {
    this.initCrowdLevels();
    // Initialize with default news items immediately
    this.setDefaultNewsItems();
    // Then fetch real news asynchronously
    this.initNewsData().catch(err => {
      console.error("Error initializing news data:", err);
    });
  }

  private initCrowdLevels() {
    this.crowdLevels = [
      {
        id: 1,
        location: "Ramkund",
        level: 4,
        capacity: 12000,
        currentCount: 8000,
        status: "crowded",
        lastUpdated: new Date().toISOString(),
        recommendations: "Peak hours approaching. Plan your visit during early morning (4 AM - 6 AM) for peaceful darshan."
      },
      {
        id: 2,
        location: "Kalaram Temple",
        level: 2,
        capacity: 5000,
        currentCount: 2000,
        status: "safe",
        lastUpdated: new Date().toISOString(),
        recommendations: "Good time for darshan. Temple aarti starts at 5:30 AM and 7:00 PM."
      },
      {
        id: 3,
        location: "Tapovan",
        level: 5,
        capacity: 8000,
        currentCount: 7500,
        status: "overcrowded",
        lastUpdated: new Date().toISOString(),
        recommendations: "Area experiencing heavy congestion. Consider visiting after sunset or early morning tomorrow."
      },
      {
        id: 4,
        location: "Godavari Ghat",
        level: 3,
        capacity: 15000,
        currentCount: 9000,
        status: "moderate",
        lastUpdated: new Date().toISOString(),
        recommendations: "Moderate crowds expected. Best time to visit would be in the next 2 hours."
      }
    ];
  }

  async getAllCrowdLevels(): Promise<CrowdLevel[]> {
    // Only update data if it's been at least 5 seconds since last refresh
    const now = Date.now();
    if (now - this.lastDataRefresh > 5000) {
      this.updateDynamicCrowdData();
      this.lastDataRefresh = now;
    }

    return this.crowdLevels;
  }

  private updateDynamicCrowdData() {
    const update = this.crowdUpdates[this.currentUpdateIndex];
    this.currentUpdateIndex = (this.currentUpdateIndex + 1) % this.crowdUpdates.length;

    // Add type for location keys
    type LocationKey = "Ramkund" | "Kalaram Temple" | "Tapovan" | "Godavari Ghat";
    type CrowdStatus = "safe" | "moderate" | "crowded" | "overcrowded";

    // Different base utilization for each location with proper typing
    const locationBaseUtilization: Record<LocationKey, number> = {
      "Ramkund": 0.7,
      "Kalaram Temple": 0.4,
      "Tapovan": 0.85,
      "Godavari Ghat": 0.3
    };

    // Location-specific patterns and recommendations
    const locationPatterns: Record<LocationKey, {
      peakHours: number[];
      capacity: number;
      recommendations: Record<CrowdStatus, string>;
    }> = {
      "Ramkund": {
        peakHours: [6, 7, 8, 17, 18, 19],
        capacity: 12000,
        recommendations: {
          safe: "Perfect time for holy dip. Water level is suitable and crowd is manageable.",
          moderate: "Moderate crowds at the ghat. Best to visit in next hour.",
          crowded: "Heavy rush due to ongoing aarti. Consider visiting after 2 hours.",
          overcrowded: "Maximum capacity reached. Please use alternative ghats."
        }
      },
      "Kalaram Temple": {
        peakHours: [8, 9, 10, 16, 17, 18],
        capacity: 5000,
        recommendations: {
          safe: "Temple is peaceful with minimal waiting time.",
          moderate: "Regular darshan queue moving smoothly.",
          crowded: "Peak darshan time. 45-minute waiting expected.",
          overcrowded: "Heavy rush. Consider early morning darshan."
        }
      },
      "Tapovan": {
        peakHours: [7, 8, 9, 16, 17, 18],
        capacity: 8000,
        recommendations: {
          safe: "Tranquil atmosphere for meditation.",
          moderate: "Good time to explore sacred sites.",
          crowded: "Limited access to meditation spots.",
          overcrowded: "Entry restricted. Visit alternative sites."
        }
      },
      "Godavari Ghat": {
        peakHours: [5, 6, 7, 17, 18, 19],
        capacity: 15000,
        recommendations: {
          safe: "Peaceful time for holy dip and rituals.",
          moderate: "All ghats accessible with minimal waiting.",
          crowded: "Main ghat congested. Use side ghats.",
          overcrowded: "Extremely crowded. Entry regulated."
        }
      }
    };

    // Create data structure to track crowd numbers
    const crowdNumbers: Record<LocationKey, number> = {
      "Ramkund": 0,
      "Kalaram Temple": 0,
      "Tapovan": 0,
      "Godavari Ghat": 0
    };

    // Calculate base crowd levels with proper typing
    Object.entries(locationPatterns).forEach(([location, pattern]) => {
      const key = location as LocationKey;
      const baseUtilization = locationBaseUtilization[key];
      const currentHour = new Date().getHours();
      const isPeakHour = pattern.peakHours.includes(currentHour);

      let utilization = baseUtilization + (Math.random() * 0.2 - 0.1);
      if (isPeakHour) {
        utilization = Math.min(utilization * 1.3, 1);
      }

      crowdNumbers[key] = Math.floor(pattern.capacity * utilization);
    });

    // Now apply crowd migrations based on time of day
    const currentHour = new Date().getHours();

    // Find applicable migration patterns for current hour
    this.crowdMigrationPatterns.forEach(pattern => {
      const [startHour, endHour] = pattern.timeRange;

      // Check if this migration pattern applies to current time
      if (currentHour >= startHour && currentHour <= endHour) {
        // Calculate number of people moving from source to destination
        const movingCount = Math.floor(crowdNumbers[pattern.from] * pattern.flowRate);

        // Remove people from source location
        crowdNumbers[pattern.from] -= movingCount;

        // Add people to destination location
        crowdNumbers[pattern.to] += movingCount;
      }
    });

    Object.keys(crowdNumbers).forEach(location => {
      const key = location as LocationKey;
      const variation = Math.floor(crowdNumbers[key] * (Math.random() * 0.1 - 0.05));
      crowdNumbers[key] += variation;
      crowdNumbers[key] = Math.max(0, crowdNumbers[key]);
    });

    // Calculate different statuses for each location with proper typing
    const newLevels = Object.entries(locationPatterns).map(([location, pattern], index) => {
      const key = location as LocationKey;
      const currentCount = crowdNumbers[key];
      const utilization = currentCount / pattern.capacity;

      let status: CrowdStatus;
      // Adjust thresholds to provide better gradation
      if (utilization > 0.9) status = "overcrowded";
      else if (utilization > 0.65) status = "crowded";
      else if (utilization > 0.35) status = "moderate";
      else status = "safe";

      // Cap level between 1-5 for consistent UI representation
      const level = Math.max(1, Math.min(5, Math.ceil(utilization * 10)));

      return {
        id: index + 1,
        location: key,
        level: level,
        capacity: pattern.capacity,
        currentCount: Math.max(0, currentCount), // Ensure non-negative
        status,
        lastUpdated: update.lastUpdated,
        recommendations: pattern.recommendations[status]
      };
    });

    this.crowdLevels = newLevels;
  }

  async getAllFacilities(): Promise<Facility[]> {
    return this.facilities;
  }

  async getAllEmergencyContacts(): Promise<EmergencyContact[]> {
    return this.emergencyContacts;
  }

  async getAllNews(): Promise<{
    id: number;
    title: string;
    content: string;
    language: string;
    timestamp: string;
    category?: string;
  }[]> {
    return this.newsItems;
  }
  private async initNewsData() {
    try {
      const API_KEY = process.env.NEWSAPI_KEY;
      
      if (!API_KEY) {
        console.error("NewsAPI key not found");
        // Fallback data in case API key is missing
        this.setDefaultNewsItems();
        return;
      }
      
      // Static essential Kumbh Mela event news should always be available
      const essentialNews = [
        {
          id: 1,
          title: "Special Ganga Aarti Tonight",
          content: "A special Ganga Aarti will be performed tonight at Ramkund at 7 PM. All devotees are welcome.",
          language: "en",
          timestamp: new Date().toISOString(),
          category: "Event"
        },
        {
          id: 2,
          title: "Traffic Diversion on Main Road",
          content: "Due to high footfall, traffic has been diverted from Godavari Bridge to Tapovan Road. Please use alternate routes.",
          language: "en",
          timestamp: new Date().toISOString(),
          category: "Transport"
        }
      ];
      
      // Attempt to fetch news from NewsAPI
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=Kumbh+Mela+OR+Nashik+OR+Festival+India&language=en&sortBy=publishedAt&apiKey=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.articles?.length || 0} news items from NewsAPI`);
      
      // Transform NewsAPI data to our format
      const apiNewsItems = data.articles?.map((article: any, index: number) => ({
        id: essentialNews.length + index + 1,
        title: article.title,
        content: article.description || article.content || "No content available",
        language: "en", // NewsAPI provides language in the query, all items will be "en"
        timestamp: article.publishedAt || new Date().toISOString(),
        category: this.categorizeNewsArticle(article.title, article.description),
        imageUrl: article.urlToImage || null // Include image URL from NewsAPI
      })) || [];
      
      // Combine essential news with API news
      this.newsItems = [...essentialNews, ...apiNewsItems];
      
      // Set up automatic refresh of news data every 30 minutes
      setTimeout(() => this.refreshNewsData(), 30 * 60 * 1000);
      
    } catch (error) {
      console.error("Error fetching news from NewsAPI:", error);
      // Fallback to default news items in case of error
      this.setDefaultNewsItems();
    }
  }
  
  private categorizeNewsArticle(title: string, description: string): string {
    const combinedText = `${title} ${description}`.toLowerCase();
    
    // Define category keywords
    const categoryKeywords: Record<string, string[]> = {
      "Emergency": ["emergency", "alert", "warning", "evacuate", "accident", "disaster", "critical"],
      "Transport": ["transport", "traffic", "road", "vehicle", "bus", "train", "route", "travel"],
      "Event": ["event", "ceremony", "festival", "celebration", "ritual", "performance", "program"],
      "Weather": ["weather", "rain", "flood", "temperature", "storm", "hot", "cold", "climate"],
      "Health": ["health", "medical", "hospital", "doctor", "patient", "treatment", "injury", "cure"]
    };
    
    // Check for keywords and return matching category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        return category;
      }
    }
    
    // Default category
    return "General";
  }
  
  private setDefaultNewsItems() {
    this.newsItems = [
      {
        id: 1,
        title: "Special Ganga Aarti Tonight",
        content: "A special Ganga Aarti will be performed tonight at Ramkund at 7 PM. All devotees are welcome.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Event",
        imageUrl: "https://images.unsplash.com/photo-1630169161596-fa2296d5c67a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2874&q=80"
      },
      {
        id: 2,
        title: "Traffic Diversion on Main Road",
        content: "Due to high footfall, traffic has been diverted from Godavari Bridge to Tapovan Road. Please use alternate routes.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Transport",
        imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2864&q=80"
      }
    ];
  }
  
  private async refreshNewsData() {
    console.log('Refreshing news data from NewsAPI');
    await this.initNewsData();
  }
  async getKumbhLocations() {
    // Update current status based on crowd levels
    const crowdLevels = await this.getAllCrowdLevels();

    return this.kumbhLocations.map(location => {
      const crowdInfo = crowdLevels.find(cl => cl.location === location.name);

      if (crowdInfo) {
        // Replace the current status instead of appending
        location.currentStatus = `Open for devotees - ${crowdInfo.status.toUpperCase()}`;
      }

      location.lastUpdated = new Date().toISOString();
      return location;
    });
  }
  async getShuttleLocations() {
    // Simulate real-time updates by randomly updating some values
    return this.shuttleLocations.map(shuttle => {
      const randomDelay = Math.random() > 0.7;
      const randomCrowd = Math.random() > 0.6;

      return {
        ...shuttle,
        estimatedArrival: randomDelay ? `${Math.floor(Math.random() * 10 + 5)} mins` : shuttle.estimatedArrival,
        capacity: randomCrowd ? `${Math.floor(Math.random() * 50 + 50)}%` : shuttle.capacity,
        status: randomDelay ? "delayed" as const :
          randomCrowd ? "crowded" as const :
            "on-time" as const
      };
    });
  }

  async getRestrooms() {
    // Randomly update some restroom statuses to simulate real-time updates
    return this.restrooms.map(restroom => {
      const random = Math.random();
      return {
        ...restroom,
        status: random > 0.8 ? "maintenance" as const :
          random > 0.95 ? "closed" as const :
                        "operational" as const
      };
    });
  }
  async storeUserQuery(data: {
    query: string;
    response: string;
    sources: string[];
    feedback?: number | null;
    confidence?: number;
    learnedFromGemini?: boolean;
    autoLearned?: boolean;
  }): Promise<number> {
    const queryId = this.queryIdCounter++;

    // Check the knowledge base first
    const kbResult = await this.searchKnowledgeBase(data.query);
    if (kbResult) {
      data.response = kbResult.content;
      data.sources = [kbResult.source || 'Internal Knowledge Base'];
      // If we have a knowledge base match, confidence is higher
      data.confidence = data.confidence || 90;
    }

    // Check if query is about crowd levels
    if (data.query.toLowerCase().includes('crowd') || data.query.toLowerCase().includes('people')) {
      const crowdLevels = await this.getAllCrowdLevels();
      const relevantUpdates = crowdLevels
        .filter(level => level.status === 'critical' || level.status === 'high')
        .map(level => `${level.location}: ${level.status} (${level.recommendations})`);

      if (relevantUpdates.length > 0) {
        data.response += '\n\nImportant crowd updates:\n' + relevantUpdates.join('\n');
      }
    }

    // Store the enhanced query with all new fields
    this.userQueriesData.push({
      id: queryId,
      query: data.query,
      response: data.response,
      sources: data.sources,
      timestamp: new Date().toISOString(),
      feedback: data.feedback || null,
      confidence: data.confidence || 70, // Default confidence if not provided
      learnedFromGemini: data.learnedFromGemini || false,
      autoLearned: data.autoLearned || false,
      flaggedForReview: false // Not flagged by default
    } as any); // Using 'any' since the UserQuery type might not be updated yet

    return queryId;
  }

  async updateQueryFeedback(queryId: number, feedback: number): Promise<void> {
    const query = this.userQueriesData.find(q => q.id === queryId);
    if (query) {
      query.feedback = feedback;
      
      // If feedback is negative (👎), flag it for review
      if (feedback < 0) {
        (query as any).flaggedForReview = true;
      }
    }
  }

  async getFlaggedQueriesForReview(): Promise<UserQuery[]> {
    return this.userQueriesData.filter(q => (q as any).flaggedForReview === true);
  }

  async addQueryToKnowledgeBase(queryId: number): Promise<void> {
    const query = this.userQueriesData.find(q => q.id === queryId);
    if (query) {
      // Add the query and response to the knowledge base
      await this.storeKnowledgeBase({
        topic: query.query,
        content: query.response,
        source: "User Feedback",
        confidence: 85 // Higher confidence since it was verified
      });
      
      // Mark query as auto-learned
      (query as any).autoLearned = true;
    }
  }

  async getQueriesWithFeedback(feedbackValue: number): Promise<UserQuery[]> {
    return this.userQueriesData.filter(q => q.feedback === feedbackValue);
  }

  async getKnowledgeBase(topic?: string): Promise<KnowledgeBase[]> {
    if (topic) {
      return this.knowledgeBaseItems.filter(item =>
        item.topic.toLowerCase().includes(topic.toLowerCase())
      );
    }
    return this.knowledgeBaseItems;
  }
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return this.chatHistories[sessionId] || [];
  }

  async saveChatMessage(sessionId: string, message: ChatMessage): Promise<void> {
    if (!this.chatHistories[sessionId]) {
      this.chatHistories[sessionId] = [];
    }
    this.chatHistories[sessionId].push(message);
  }

  async getResponseTemplate(type: string): Promise<ResponseTemplate | null> {
    return this.responseTemplates.find(t => t.templateType === type) || null;
  }

  formatResponse(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
  }

  async storeKnowledgeBase(data: {
    topic: string;
    content: string;
    source?: string;
    confidence?: number;
  }): Promise<void> {
    try {
      // Generate embedding for the new content
      const text = data.topic + ' ' + data.content;
      const embedding = await getEmbedding(text);
      const keywords = extractKeywords(text);

      this.knowledgeBaseItems.push({
        id: this.knowledgeBaseItems.length + 1,
        topic: data.topic,
        content: data.content,
        source: data.source || '',
        lastUpdated: new Date().toISOString(),
        confidence: data.confidence || 80,
        verified: false,
        embedding,
        keywords
      });
    } catch (error) {
      console.error('Error storing knowledge base item:', error);
      // Store without embedding if generation fails
      this.knowledgeBaseItems.push({
        id: this.knowledgeBaseItems.length + 1,
        topic: data.topic,
        content: data.content,
        source: data.source || '',
        lastUpdated: new Date().toISOString(),
        confidence: data.confidence || 80,
        verified: false
      });
    }
  }

  async searchKnowledgeBase(query: string): Promise<KnowledgeBase | null> {
    try {
      // Get embedding for the query
      const queryEmbedding = await getEmbedding(query);
      const queryKeywords = extractKeywords(query);

      // First, try keyword-based filtering
      const keywordMatches = this.knowledgeBaseItems.filter(item => {
        const itemKeywords = item.keywords || extractKeywords(item.topic + ' ' + item.content);
        return queryKeywords.some(keyword =>
          itemKeywords.some(itemKeyword => itemKeyword.includes(keyword))
        );
      });

      if (keywordMatches.length === 0) {
        return null;
      }

      // For keyword matches, compute semantic similarity
      const similarities = await Promise.all(
        keywordMatches.map(async item => {
          const itemEmbedding = item.embedding || await getEmbedding(item.topic + ' ' + item.content);
          return {
            item,
            similarity: cosineSimilarity(queryEmbedding, itemEmbedding)
          };
        })
      );

      // Sort by similarity and return the best match if it exceeds threshold
      const bestMatch = similarities.sort((a, b) => b.similarity - a.similarity)[0];
      return bestMatch.similarity > 0.7 ? bestMatch.item : null;

    } catch (error) {
      console.error('Error in semantic search:', error);
      // Fallback to basic text matching if semantic search fails
      return this.knowledgeBaseItems.find(item =>
        item.topic.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase())
      ) || null;
    }
  }
  async calculateDensityGrid(config: GridConfig = this.gridConfig): Promise<DensityGrid[]> {
    const crowdLevels = await this.getAllCrowdLevels();
    const newDensityData: DensityGrid[] = [];

    // Calculate cells based on boundaries and resolution
    const latDiff = config.boundaries.north - config.boundaries.south;
    const lngDiff = config.boundaries.east - config.boundaries.west;
    const cellSizeLat = latDiff / config.gridSize;
    const cellSizeLng = lngDiff / config.gridSize;

    // Generate density grid
    for (let x = 0; x < config.gridSize; x++) {
      for (let y = 0; y < config.gridSize; y++) {
        // Calculate cell center coordinates
        const lat = config.boundaries.south + (y + 0.5) * cellSizeLat;
        const lng = config.boundaries.west + (x + 0.5) * cellSizeLng;

        // Find nearest crowd levels and calculate density
        let totalDensity = 0;
        let totalWeight = 0;
        let nearestLocation = '';
        let minDistance = Infinity;

        // Check influence from key locations
        for (const [locationName, locationData] of Object.entries(this.keyLocations)) {
          const dlat = lat - locationData.lat;
          const dlng = lng - locationData.lng;
          const distance = Math.sqrt(dlat * dlat + dlng * dlng);

          // Find nearest location
          if (distance < minDistance) {
            minDistance = distance;
            nearestLocation = locationName;
          }

          // Calculate influence based on distance and location's radius
          const influence = Math.max(0, 1 - distance / locationData.radius);
          if (influence > 0) {
            const crowdInfo = crowdLevels.find(level => level.location === locationName);
            if (crowdInfo) {
              const weight = influence * influence; // Square for stronger local effect
              totalWeight += weight;
              totalDensity += (crowdInfo.currentCount / crowdInfo.capacity) * 100 * weight;
            }
          }
        }

        // Calculate final density value with enhanced weighting
        const density = totalWeight > 0 ? Math.min(100, Math.round(totalDensity / totalWeight)) : 0;

        // Enhanced metadata for visualization
        const metadata: GridMetadata = {
          lat,
          lng,
          color: this.getDensityColor(density),
          nearestLocation,
          distanceToNearest: minDistance,
          intensity: density / 100, // For opacity/intensity visualization
          timestamp: new Date().toISOString()
        };

        newDensityData.push({
          id: this.densityGridData.length + 1,
          locationId: Object.keys(this.keyLocations).indexOf(nearestLocation),
          gridX: x,
          gridY: y,
          density,
          timestamp: new Date(),
          metadata
        });
      }
    }

    this.densityGridData = newDensityData;
    return newDensityData;
  }

  async getDensityGridForLocation(locationId: number): Promise<DensityGrid[]> {
    return this.densityGridData.filter(cell => cell.locationId === locationId);
  }

  async updateDensityGrid(locationId: number, density: number[][]): Promise<void> {
    const existingCells = this.densityGridData.filter(cell => cell.locationId === locationId);

    density.forEach((row, x) => {
      row.forEach((value, y) => {
        const cell = existingCells.find(c => c.gridX === x && c.gridY === y);
        if (cell) {
          cell.density = value;
          cell.timestamp = new Date();
          if (cell.metadata) {
            cell.metadata.color = this.getDensityColor(value);
            cell.metadata.timestamp = new Date().toISOString();
          }
        }
      });
    });
  }

  private getDensityColor(density: number): string {
    // Enhanced color gradient for better visualization
    if (density < 20) return '#00ff00'; // Green
    if (density < 40) return '#90ee90'; // Light green
    if (density < 60) return '#ffff00'; // Yellow
    if (density < 80) return '#ffa500'; // Orange
    return '#ff0000'; // Red
  }

  // User emergency contacts methods
  async getUserEmergencyContacts(userId: string): Promise<UserEmergencyContact[]> {
    return this.userEmergencyContacts.filter(contact => contact.userId === userId);
  }

  async saveUserEmergencyContact(contact: Omit<UserEmergencyContact, 'id'>): Promise<number> {
    const id = this.userEmergencyContacts.length > 0 
      ? Math.max(...this.userEmergencyContacts.map(c => c.id)) + 1 
      : 1;
    
    const newContact: UserEmergencyContact = {
      id,
      ...contact,
      createdAt: new Date()
    };
    
    this.userEmergencyContacts.push(newContact);
    return id;
  }

  async deleteUserEmergencyContact(contactId: number): Promise<void> {
    const index = this.userEmergencyContacts.findIndex(c => c.id === contactId);
    if (index !== -1) {
      this.userEmergencyContacts.splice(index, 1);
    }
  }

  // SMS functionality
  async sendSOSMessage(
    userId: string, 
    location: Location, 
    message: string, 
    toControlRoom: boolean, 
    toContacts: boolean
  ): Promise<{success: boolean, error?: string}> {
    try {
      // Check if Twilio credentials are available
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      
      if (!accountSid || !authToken || !twilioPhone) {
        return {
          success: false,
          error: "Twilio credentials not found. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables."
        };
      }

      // Import Twilio and initialize client
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);
      
      // Create the SOS message with location information
      const locationText = `Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
      const fullMessage = `EMERGENCY SOS: ${message}\n${locationText}\nSent from Kumbh Mela Companion App`;
      
      let sentMessages = 0;
      
      // Send to control room if requested
      if (toControlRoom) {
        // Get emergency contacts for control room
        const controlRoomContacts = this.emergencyContacts.filter(
          contact => contact.type === 'police' || contact.type === 'emergency'
        );
        
        for (const contact of controlRoomContacts) {
          await client.messages.create({
            body: `[CONTROL ROOM ALERT] ${fullMessage}`,
            from: twilioPhone,
            to: contact.number
          });
          sentMessages++;
        }
      }
      
      // Send to user's emergency contacts if requested
      if (toContacts) {
        const userContacts = await this.getUserEmergencyContacts(userId);
        
        for (const contact of userContacts) {
          await client.messages.create({
            body: fullMessage,
            from: twilioPhone,
            to: contact.contactNumber
          });
          sentMessages++;
        }
      }
      
      return {
        success: true,
        error: sentMessages > 0 ? undefined : "No messages sent. Please add emergency contacts or select to send to control room."
      };
    } catch (error) {
      console.error("Error sending SOS messages:", error);
      return {
        success: false,
        error: `Failed to send SOS messages: ${error.message || 'Unknown error'}`
      };
    }
  }
}

export const storage = new MemStorage();