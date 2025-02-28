import type { Facility, EmergencyContact, CrowdLevel } from "@shared/schema";

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

  private crowdLevels: CrowdLevel[] = [
    {
      id: 1,
      location: "Ramkund",
      level: 3,
      capacity: 10000,
      currentCount: 6000,
      status: "moderate",
      lastUpdated: new Date().toISOString(),
      recommendations: "Best time to visit: Early morning before 6 AM or evening after 7 PM"
    },
    {
      id: 2,
      location: "Kalaram Temple",
      level: 4,
      capacity: 5000,
      currentCount: 4200,
      status: "crowded",
      lastUpdated: new Date().toISOString(),
      recommendations: "Expect 30-45 minutes waiting time. Consider visiting after 2 PM"
    },
    {
      id: 3,
      location: "Tapovan",
      level: 2,
      capacity: 8000,
      currentCount: 3000,
      status: "safe",
      lastUpdated: new Date().toISOString(),
      recommendations: "Currently safe to visit with minimal waiting time"
    },
    {
      id: 4,
      location: "Godavari Ghat",
      level: 5,
      capacity: 15000,
      currentCount: 14000,
      status: "overcrowded",
      lastUpdated: new Date().toISOString(),
      recommendations: "Extremely crowded. Please wait for 2-3 hours or choose alternative ghats"
    }
  ];

  private newsItems: {
    id: number;
    title: string;
    content: string;
    language: string;
    timestamp: string;
    category?: string;
  }[] = [];

  constructor() {
    this.initNewsData();
  }

  async getAllCrowdLevels(): Promise<CrowdLevel[]> {
    // Simple random fluctuation for crowd levels
    this.crowdLevels = this.crowdLevels.map(level => {
      // Generate random fluctuation (-10% to +10% of capacity)
      const fluctuation = Math.floor((Math.random() * 0.2 - 0.1) * level.capacity);
      let newCount = level.currentCount + fluctuation;

      // Ensure count stays within reasonable bounds
      newCount = Math.max(Math.min(newCount, level.capacity * 1.2), level.capacity * 0.1);
      newCount = Math.floor(newCount);

      // Update status based on new count
      let newStatus = "safe";
      if (newCount > level.capacity * 0.9) {
        newStatus = "overcrowded";
      } else if (newCount > level.capacity * 0.7) {
        newStatus = "crowded";
      } else if (newCount > level.capacity * 0.5) {
        newStatus = "moderate";
      }

      return {
        ...level,
        currentCount: newCount,
        status: newStatus,
        lastUpdated: new Date().toISOString()
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
    return [
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