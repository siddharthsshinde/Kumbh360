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

    // Location-specific crowd patterns and recommendations
    const locationPatterns = {
      "Ramkund": {
        peakHours: [6, 7, 8, 17, 18, 19], // Morning and evening aarti times
        recommendations: {
          safe: "Ideal time for holy dip. Water level is suitable and crowd is manageable.",
          moderate: "Moderate crowds observed. Expect 15-20 minutes waiting time for ghat access.",
          crowded: "Heavy rush due to aarti preparations. Consider visiting after 2 hours.",
          overcrowded: "Extremely high footfall. Please wait or visit Godavari Ghat as an alternative."
        }
      },
      "Kalaram Temple": {
        peakHours: [8, 9, 10, 16, 17, 18],
        recommendations: {
          safe: "Perfect time for darshan. Temple is peaceful with minimal waiting.",
          moderate: "Regular devotee flow. Darshan queue is moving smoothly.",
          crowded: "High devotee turnout. Expected waiting time 45 minutes.",
          overcrowded: "Maximum capacity reached. Please plan visit during early morning hours."
        }
      },
      "Tapovan": {
        peakHours: [7, 8, 9, 16, 17, 18],
        recommendations: {
          safe: "Ideal time to explore the spiritual sites of Tapovan.",
          moderate: "Comfortable crowd levels. All areas accessible.",
          crowded: "High footfall near main meditation spots. Some areas restricted.",
          overcrowded: "Area at maximum capacity. Entry regulated for safety."
        }
      },
      "Godavari Ghat": {
        peakHours: [5, 6, 7, 17, 18, 19],
        recommendations: {
          safe: "Peaceful atmosphere for holy dip and meditation.",
          moderate: "Regular flow of devotees. All ghats accessible.",
          crowded: "Heavy rush at main ghat. Consider using adjacent ghats.",
          overcrowded: "Critical crowd density. Please wait for crowd dispersal."
        }
      }
    };

    this.crowdLevels = this.crowdLevels.map(level => {
      const locationPattern = locationPatterns[level.location];
      const currentHour = new Date().getHours();
      const isPeakHour = locationPattern.peakHours.includes(currentHour);

      // Calculate utilization based on location-specific patterns
      let baseUtilization;
      switch (update.status) {
        case "low": baseUtilization = 0.2 + (Math.random() * 0.2); break;
        case "moderate": baseUtilization = 0.4 + (Math.random() * 0.2); break;
        case "high": baseUtilization = 0.6 + (Math.random() * 0.2); break;
        case "critical": baseUtilization = 0.8 + (Math.random() * 0.2); break;
        default: baseUtilization = 0.4;
      }

      // Adjust for peak hours
      const utilization = isPeakHour ? 
        Math.min(baseUtilization * 1.5, 1) : baseUtilization;

      const newCount = Math.floor(level.capacity * utilization);

      // Determine status based on utilization
      let newStatus;
      if (utilization > 0.8) newStatus = "overcrowded";
      else if (utilization > 0.6) newStatus = "crowded";
      else if (utilization > 0.4) newStatus = "moderate";
      else newStatus = "safe";

      return {
        ...level,
        currentCount: newCount,
        status: newStatus,
        lastUpdated: update.lastUpdated,
        recommendations: locationPattern.recommendations[newStatus]
      };
    });

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