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
      name: "Hotel Panchavati",
      type: "hotel",
      location: { lat: 20.0059, lng: 73.7913 },
      address: "Panchavati, Nashik",
      contact: "+91-1234567890"
    }
  ];

  private emergencyContacts: EmergencyContact[] = [
    {
      id: 1,
      name: "Police Control Room",
      number: "100",
      type: "police"
    }
  ];

  private crowdLevels: CrowdLevel[] = [
    {
      id: 1,
      location: "Ramkund",
      level: 3,
      timestamp: new Date().toISOString()
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
