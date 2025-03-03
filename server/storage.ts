import type { Facility, EmergencyContact, CrowdLevel } from "@shared/schema";
import kumbhData from "../attached_assets/kumbh_mela_dataset.json";

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
}

export class MemStorage implements IStorage {
  private facilities: Facility[] = [
    {
      id: 1,
      name: "Ramkund",
      type: "holy_site",
      location: { lat: 20.0059, lng: 73.7913 },
      address: "Panchavati, Nashik, Maharashtra",
      contact: "",
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
      contact: "",
    },
    {
      id: 5,
      name: "Kalaram Temple",
      type: "temple",
      location: { lat: 20.0064, lng: 73.7904 },
      address: "Panchavati, Nashik, Maharashtra",
      contact: "",
    }
  ];

  private emergencyContacts: EmergencyContact[] = [
    {
      id: 1,
      name: "Nashik Police Control Room",
      number: "0253-2305200",
      type: "police",
      address: "Police Headquarters, Sharanpur Road, Nashik",
      available24x7: true,
      zone: "Central Nashik"
    },
    {
      id: 2,
      name: "Civil Hospital Nashik",
      number: "0253-2572038",
      type: "hospital",
      address: "Mumbai Naka, Nashik",
      available24x7: true,
      zone: "Mumbai Naka"
    },
    {
      id: 3,
      name: "Missing Person Help Desk",
      number: "1094",
      type: "missing_person",
      address: "Kumbh Mela Control Room, Panchavati",
      available24x7: true,
      zone: "Panchavati"
    }
  ];

  private crowdLevels: CrowdLevel[] = [];
  private crowdUpdates = kumbhData.crowdUpdates;
  private currentUpdateIndex = 0;

  private newsItems: {
    id: number;
    title: string;
    content: string;
    language: string;
    timestamp: string;
    category?: string;
  }[] = [];

  constructor() {
    this.initCrowdLevels();
    this.initNewsData();
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
    const update = this.crowdUpdates[this.currentUpdateIndex];
    this.currentUpdateIndex = (this.currentUpdateIndex + 1) % this.crowdUpdates.length;

    // Use timestamp to create varied crowd patterns over time
    const now = new Date();
    const timeSignature = now.getHours() + (now.getMinutes() / 60);
    
    // Forced different crowd levels for demonstration
    // Each location will have a different status
    const statusAssignment = {
      "Ramkund": "",
      "Kalaram Temple": "",
      "Tapovan": "",
      "Godavari Ghat": ""
    };
    
    // Assign a unique status to each location based on time
    const allStatuses = ["safe", "moderate", "crowded", "overcrowded"];
    const shuffledStatuses = [...allStatuses].sort(() => 0.5 - Math.random());
    
    let i = 0;
    for (const location in statusAssignment) {
      statusAssignment[location] = shuffledStatuses[i % 4];
      i++;
    }

    // Location-specific patterns and recommendations
    const locationPatterns = {
      "Ramkund": {
        baseLevel: 0.7, // Typically more crowded
        variance: 0.2,
        capacity: 12000,
        peakHours: [6, 7, 8, 17, 18, 19],
        recommendations: {
          safe: "Perfect time for holy dip. Water level is suitable and crowd is manageable.",
          moderate: "Moderate crowds at the ghat. Best to visit in next hour.",
          crowded: "Heavy rush due to ongoing aarti. Consider visiting after 2 hours.",
          overcrowded: "Maximum capacity reached. Please use alternative ghats."
        }
      },
      "Kalaram Temple": {
        baseLevel: 0.4, // Moderate crowds
        variance: 0.15,
        capacity: 5000,
        peakHours: [8, 9, 10, 16, 17, 18],
        recommendations: {
          safe: "Temple is peaceful with minimal waiting time.",
          moderate: "Regular darshan queue moving smoothly.",
          crowded: "Peak darshan time. 45-minute waiting expected.",
          overcrowded: "Heavy rush. Consider early morning darshan."
        }
      },
      "Tapovan": {
        baseLevel: 0.85, // Most crowded
        variance: 0.25,
        capacity: 8000,
        peakHours: [7, 8, 9, 16, 17, 18],
        recommendations: {
          safe: "Tranquil atmosphere for meditation.",
          moderate: "Good time to explore sacred sites.",
          crowded: "Limited access to meditation spots.",
          overcrowded: "Entry restricted. Visit alternative sites."
        }
      },
      "Godavari Ghat": {
        baseLevel: 0.3, // Least crowded
        variance: 0.1,
        capacity: 15000,
        peakHours: [5, 6, 7, 17, 18, 19],
        recommendations: {
          safe: "Peaceful time for holy dip and rituals.",
          moderate: "All ghats accessible with minimal waiting.",
          crowded: "Main ghat congested. Use side ghats.",
          overcrowded: "Please wait or visit Ramkund."
        }
      }
    };

    // Calculate crowd levels with forced different statuses
    const newLevels = Object.entries(locationPatterns).map(([location, pattern], index) => {
      const currentHour = new Date().getHours();
      const isPeakHour = pattern.peakHours.includes(currentHour);
      const status = statusAssignment[location];
      
      // Calculate utilization based on status
      let utilization;
      switch (status) {
        case "safe": utilization = 0.1 + (Math.random() * 0.15); break;
        case "moderate": utilization = 0.3 + (Math.random() * 0.15); break;
        case "crowded": utilization = 0.55 + (Math.random() * 0.15); break;
        case "overcrowded": utilization = 0.8 + (Math.random() * 0.15); break;
        default: utilization = 0.5;
      }
      
      // Time-based oscillation for more dynamic behavior
      const timeOscillation = Math.sin(timeSignature * Math.PI) * 0.1;
      utilization = Math.max(0.05, Math.min(0.95, utilization + timeOscillation));
      
      const newCount = Math.floor(pattern.capacity * utilization);
      
      return {
        id: index + 1,
        location,
        level: Math.ceil(utilization * 5),
        capacity: pattern.capacity,
        currentCount: newCount,
        status,
        lastUpdated: update.lastUpdated,
        recommendations: pattern.recommendations[status]
      };
    });

    this.crowdLevels = newLevels;
    return this.crowdLevels;
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
  private initNewsData() {
    this.newsItems = [
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
  }
}

export const storage = new MemStorage();