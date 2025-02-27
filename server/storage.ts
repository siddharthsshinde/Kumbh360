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
    category: string;
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
    },
    {
      id: 6,
      name: "Ganga Ghat",
      type: "holy_site",
      location: { lat: 20.0053, lng: 73.7923 },
      address: "Godavari River, Nashik, Maharashtra",
      contact: "",
    },
    {
      id: 7,
      name: "Trimbakeshwar Temple",
      type: "temple",
      location: { lat: 19.9321, lng: 73.5299 },
      address: "Trimbak, Nashik, Maharashtra",
      contact: "",
    },
    {
      id: 8,
      name: "Kushavarta Kund",
      type: "holy_site",
      location: { lat: 19.9327, lng: 73.5311 },
      address: "Trimbak, Nashik, Maharashtra",
      contact: "",
    },
    {
      id: 9,
      name: "Someshwar Temple",
      type: "temple",
      location: { lat: 20.0004, lng: 73.7856 },
      address: "Someshwar, Nashik, Maharashtra",
      contact: "",
    },
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
  private newsItems: {
    id: number;
    title: string;
    content: string;
    language: string;
    timestamp: string;
    category: string;
  }[];

  constructor() {
    // Initialize with some sample data
    this.initSampleData();
    this.initNewsData();
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
      },
      {
        id: 3,
        title: "Cultural Program at 5 PM",
        content: "A cultural dance program showcasing traditional folk dances will be held near Kalaram Temple at 5 PM.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Culture"
      },
      {
        id: 4,
        title: "EMERGENCY: Water Level Rising",
        content: "Due to recent rainfall, the water level in Godavari river is rising. Authorities advise caution near the ghats. Please follow safety instructions.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Emergency"
      },
      {
        id: 5,
        title: "आज रात विशेष गंगा आरती",
        content: "आज शाम 7 बजे रामकुंड पर एक विशेष गंगा आरती का आयोजन किया जाएगा। सभी भक्तों का स्वागत है।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Event"
      },
      {
        id: 6,
        title: "मुख्य सड़क पर यातायात मार्ग परिवर्तन",
        content: "अधिक भीड़ के कारण, गोदावरी ब्रिज से तपोवन रोड तक यातायात को डायवर्ट कर दिया गया है। कृपया वैकल्पिक मार्गों का उपयोग करें।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Transport"
      },
      {
        id: 7,
        title: "आपातकालीन: जल स्तर बढ़ रहा है",
        content: "हाल की बारिश के कारण, गोदावरी नदी का जल स्तर बढ़ रहा है। अधिकारियों ने घाटों के पास सावधानी बरतने की सलाह दी है। कृपया सुरक्षा निर्देशों का पालन करें।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Emergency"
      },
      {
        id: 8,
        title: "आज रात्री विशेष गंगा आरती",
        content: "आज संध्याकाळी 7 वाजता रामकुंड येथे एक विशेष गंगा आरती केली जाईल. सर्व भक्तांचे स्वागत आहे.",
        language: "mr",
        timestamp: new Date().toISOString(),
        category: "Event"
      },
      {
        id: 9,
        title: "मुख्य रस्त्यावर वाहतूक वळवणे",
        content: "जास्त गर्दीमुळे, गोदावरी पुलावरून तपोवन रस्त्यापर्यंत वाहतूक वळवली गेली आहे. कृपया पर्यायी मार्गांचा वापर करा.",
        language: "mr",
        timestamp: new Date().toISOString(),
        category: "Transport"
      },
      {
        id: 10,
        title: "आपत्कालीन: पाणी पातळी वाढत आहे",
        content: "अलीकडील पावसामुळे, गोदावरी नदीची पाणी पातळी वाढत आहे. अधिकाऱ्यांनी घाटांजवळ सावधगिरी बाळगण्याचा सल्ला दिला आहे. कृपया सुरक्षा निर्देशांचे पालन करा.",
        language: "mr",
        timestamp: new Date().toISOString(),
        category: "Emergency"
      }
    ];
  }

  private initSampleData() {
  }

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

  async getAllNews(): Promise<{
    id: number;
    title: string;
    content: string;
    language: string;
    timestamp: string;
    category: string;
  }[]> {
    return this.newsItems;
  }
}

export const storage = new MemStorage();