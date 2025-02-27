import type { Facility, EmergencyContact, CrowdLevel } from "@shared/schema";

export interface IStorage {
  getAllFacilities(): Promise<Facility[]>;
  getAllEmergencyContacts(): Promise<EmergencyContact[]>;
  getAllCrowdLevels(): Promise<CrowdLevel[]>;
}

export class MemStorage implements IStorage {
  private facilities: Facility[] = [
    {
      id: 1,
      name: "Ramkund",
      type: "holy_site",
      location: { lat: 20.0059, lng: 73.7913 },
      address: "Panchavati, Nashik",
      contact: null
    },
    {
      id: 2,
      name: "Kalaram Temple",
      type: "temple",
      location: { lat: 20.0067, lng: 73.7907 },
      address: "Panchavati, Nashik",
      contact: null
    },
    {
      id: 3,
      name: "Tapovan",
      type: "holy_site",
      location: { lat: 20.0118, lng: 73.7925 },
      address: "Tapovan, Nashik",
      contact: null
    },
    {
      id: 4,
      name: "Nashik Civil Hospital",
      type: "hospital",
      location: { lat: 19.9977, lng: 73.7898 },
      address: "Sharanpur Road, Nashik",
      contact: "0253-2572038"
    },
    {
      id: 5,
      name: "Hotel Panchavati",
      type: "hotel",
      location: { lat: 20.0062, lng: 73.7916 },
      address: "Panchavati, Nashik",
      contact: "+91-1234567890"
    },
    {
      id: 6,
      name: "Godavari Ghat",
      type: "holy_site",
      location: { lat: 20.0064, lng: 73.7909 },
      address: "Panchavati, Nashik",
      contact: null
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
      name: "Panchavati Police Station",
      number: "0253-2512833",
      type: "police",
      address: "Panchavati, Near Kalaram Temple",
      available24x7: true,
      zone: "Panchavati"
    },
    {
      id: 3,
      name: "Civil Hospital Nashik",
      number: "0253-2572038",
      type: "hospital",
      address: "Mumbai Naka, Nashik",
      available24x7: true,
      zone: "Mumbai Naka"
    },
    {
      id: 4,
      name: "KTHM Hospital",
      number: "0253-2580701",
      type: "hospital",
      address: "Gangapur Road, Nashik",
      available24x7: true,
      zone: "Gangapur Road"
    },
    {
      id: 5,
      name: "Missing Person Help Desk",
      number: "1094",
      type: "missing_person",
      address: "Kumbh Mela Control Room, Panchavati",
      available24x7: true,
      zone: "Panchavati"
    },
    {
      id: 6,
      name: "Ambulance Service",
      number: "108",
      type: "ambulance",
      address: "City-wide Service",
      available24x7: true,
      zone: "All Zones"
    },
    {
      id: 7,
      name: "Fire Brigade",
      number: "101",
      type: "fire",
      address: "Nashik Municipal Corporation",
      available24x7: true,
      zone: "Central Nashik"
    },
    {
      id: 8,
      name: "Disaster Management",
      number: "1078",
      type: "emergency",
      address: "District Collectorate, Nashik",
      available24x7: true,
      zone: "Central Nashik"
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

  async getAllFacilities(): Promise<Facility[]> {
    return this.facilities;
  }

  async getAllEmergencyContacts(): Promise<EmergencyContact[]> {
    return this.emergencyContacts;
  }

  async getAllCrowdLevels(): Promise<CrowdLevel[]> {
    // Randomly update crowd levels for more dynamic data
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
}

export const storage = new MemStorage();