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
        level: 3,
        capacity: 10000,
        currentCount: 6000,
        status: "moderate",
        lastUpdated: new Date().toISOString(),
        recommendations: ""
      },
      {
        id: 2,
        location: "Kalaram Temple",
        level: 4,
        capacity: 5000,
        currentCount: 4200,
        status: "moderate",
        lastUpdated: new Date().toISOString(),
        recommendations: ""
      },
      {
        id: 3,
        location: "Tapovan",
        level: 2,
        capacity: 8000,
        currentCount: 3000,
        status: "moderate",
        lastUpdated: new Date().toISOString(),
        recommendations: ""
      },
      {
        id: 4,
        location: "Godavari Ghat",
        level: 5,
        capacity: 15000,
        currentCount: 14000,
        status: "high",
        lastUpdated: new Date().toISOString(),
        recommendations: ""
      }
    ];
  }

  async getAllCrowdLevels(): Promise<CrowdLevel[]> {
    const update = this.crowdUpdates[this.currentUpdateIndex];
    this.currentUpdateIndex = (this.currentUpdateIndex + 1) % this.crowdUpdates.length;

    this.crowdLevels = this.crowdLevels.map(level => {
      let currentStatus = update.status;
      let currentRecommendations = update.recommendations;

      let utilizationPercentage;
      switch (currentStatus) {
        case "low":
          utilizationPercentage = 0.3 + (Math.random() * 0.2); 
          break;
        case "moderate":
          utilizationPercentage = 0.5 + (Math.random() * 0.2); 
          break;
        case "high":
          utilizationPercentage = 0.7 + (Math.random() * 0.2); 
          break;
        case "critical":
          utilizationPercentage = 0.9 + (Math.random() * 0.1); 
          break;
        default:
          utilizationPercentage = 0.5; 
      }

      const newCount = Math.floor(level.capacity * utilizationPercentage);

      let mappedStatus;
      switch (currentStatus) {
        case "low": mappedStatus = "safe"; break;
        case "moderate": mappedStatus = "moderate"; break;
        case "high": mappedStatus = "crowded"; break;
        case "critical": mappedStatus = "overcrowded"; break;
        default: mappedStatus = "moderate";
      }

      return {
        ...level,
        currentCount: newCount,
        status: mappedStatus,
        lastUpdated: update.lastUpdated,
        recommendations: currentRecommendations
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