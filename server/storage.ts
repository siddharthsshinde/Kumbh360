import type { Facility, EmergencyContact, CrowdLevel, CrowdReport } from "@shared/schema";
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
  addCrowdReport(report: Omit<CrowdReport, "id" | "timestamp" | "verified">): Promise<void>;
}

export class MemStorage implements IStorage {
  private crowdLevels: CrowdLevel[] = [];
  private crowdUpdates = kumbhData.crowdUpdates;
  private currentUpdateIndex = 0;
  private crowdReports: CrowdReport[] = [];

  private newsItems: {
    id: number;
    title: string;
    content: string;
    language: string;
    timestamp: string;
    category?: string;
  }[] = [];

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
        recommendations: "Peak hours approaching. Best to visit early morning."
      },
      {
        id: 2,
        location: "Kalaram Temple",
        level: 2,
        capacity: 5000,
        currentCount: 2000,
        status: "safe",
        lastUpdated: new Date().toISOString(),
        recommendations: "Good time for darshan. Temple aarti at 5:30 AM and 7 PM."
      },
      {
        id: 3,
        location: "Tapovan",
        level: 5,
        capacity: 8000,
        currentCount: 7500,
        status: "overcrowded",
        lastUpdated: new Date().toISOString(),
        recommendations: "Heavy congestion. Consider visiting after sunset."
      },
      {
        id: 4,
        location: "Godavari Ghat",
        level: 3,
        capacity: 15000,
        currentCount: 9000,
        status: "moderate",
        lastUpdated: new Date().toISOString(),
        recommendations: "Regular flow. All ghats accessible."
      }
    ];
  }

  async getAllCrowdLevels(): Promise<CrowdLevel[]> {
    const update = this.crowdUpdates[this.currentUpdateIndex];
    this.currentUpdateIndex = (this.currentUpdateIndex + 1) % this.crowdUpdates.length;

    // Different base utilization for each location
    const locationBaseUtilization: Record<string, number> = {
      "Ramkund": 0.7,
      "Kalaram Temple": 0.4,
      "Tapovan": 0.85,
      "Godavari Ghat": 0.3
    };

    // Location-specific patterns and recommendations
    const locationPatterns: Record<string, {
      peakHours: number[];
      capacity: number;
      recommendations: Record<string, string>;
    }> = {
      "Ramkund": {
        peakHours: [6, 7, 8, 17, 18, 19],
        capacity: 12000,
        recommendations: {
          safe: "Perfect time for holy dip. Water level is suitable.",
          moderate: "Moderate crowds at the ghat. Best to visit in next hour.",
          crowded: "Heavy rush due to ongoing aarti. Wait 2 hours.",
          overcrowded: "Maximum capacity reached. Use alternative ghats."
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
      const baseUtilization = locationBaseUtilization[location] || 0.5;
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

  async addCrowdReport(report: Omit<CrowdReport, "id" | "timestamp" | "verified">): Promise<void> {
    const newReport = {
      id: this.crowdReports.length + 1,
      timestamp: new Date(),
      verified: false,
      ...report
    };

    this.crowdReports.push(newReport);

    // Update crowd levels based on reports
    const recentReports = this.crowdReports
      .filter(r => r.location === report.location)
      .slice(-5);

    if (recentReports.length > 0) {
      const level = this.crowdLevels.find(l => l.location === report.location);
      if (level) {
        // Adjust crowd levels based on recent reports
        const reportImpact = {
          'light': 0.3,
          'moderate': 0.5,
          'heavy': 0.8,
          'critical': 1.0
        };

        const avgImpact = recentReports.reduce((sum, r) =>
          sum + reportImpact[r.reportedStatus as keyof typeof reportImpact], 0
        ) / recentReports.length;

        level.currentCount = Math.floor(level.capacity * avgImpact);
        level.status = report.reportedStatus === 'light' ? 'safe' :
                      report.reportedStatus === 'moderate' ? 'moderate' :
                      report.reportedStatus === 'heavy' ? 'crowded' : 'overcrowded';
        level.lastUpdated = new Date().toISOString();
      }
    }
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