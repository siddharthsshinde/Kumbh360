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
      name: "Police Control Room",
      number: "100",
      type: "police"
    },
    {
      id: 2,
      name: "Ambulance Service",
      number: "108",
      type: "ambulance"
    },
    {
      id: 3,
      name: "Fire Brigade",
      number: "101",
      type: "fire"
    },
    {
      id: 4,
      name: "Disaster Management",
      number: "1078",
      type: "emergency"
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
    return this.crowdLevels;
  }
}

export const storage = new MemStorage();