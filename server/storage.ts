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

    // Different base utilization for each location
    const locationBaseUtilization = {
      "Ramkund": 0.7, // Typically more crowded
      "Kalaram Temple": 0.4, // Moderate crowds
      "Tapovan": 0.85, // Most crowded
      "Godavari Ghat": 0.3 // Least crowded
    };

    // Location-specific patterns and recommendations
    const locationPatterns = {
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
          overcrowded: "Please wait or visit Ramkund."
        }
      }
    };

    // Calculate different statuses for each location
    const newLevels = Object.entries(locationPatterns).map(([location, pattern], index) => {
      const baseUtilization = locationBaseUtilization[location];
      const currentHour = new Date().getHours();
      const isPeakHour = pattern.peakHours.includes(currentHour);

      // Add location-specific variation
      let utilization = baseUtilization + (Math.random() * 0.2 - 0.1);
      if (isPeakHour) {
        utilization = Math.min(utilization * 1.3, 1);
      }

      // Ensure each location has a different status by adding index-based offset
      utilization = (utilization + (index * 0.15)) % 1;

      const newCount = Math.floor(pattern.capacity * utilization);

      // Determine status based on adjusted utilization
      let status;
      if (utilization > 0.75) status = "overcrowded";
      else if (utilization > 0.5) status = "crowded";
      else if (utilization > 0.25) status = "moderate";
      else status = "safe";

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
  async getKumbhLocations() {
    // Update current status based on crowd levels
    const crowdLevels = await this.getAllCrowdLevels();

    return this.kumbhLocations.map(location => {
      const crowdInfo = crowdLevels.find(cl => cl.location === location.name);

      if (crowdInfo) {
        location.currentStatus = `${location.currentStatus} - ${crowdInfo.status.toUpperCase()}`;
      }

      location.lastUpdated = new Date().toISOString();
      return location;
    });
  }
}

export const storage = new MemStorage();