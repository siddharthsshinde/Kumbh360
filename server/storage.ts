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

  private crowdLevels: CrowdLevel[] = [];
  private newsItems: {
    id: number;
    title: string;
    content: string;
    language: string;
    timestamp: string;
    category: string;
  }[] = [];

  // Historical crowd data for trend analysis
  private crowdHistory: Map<string, { timestamp: number; count: number }[]> = new Map();

  // Event schedule affecting crowd levels
  private events = [
    {
      name: "Morning Aarti",
      location: "Ramkund",
      time: 6, // 6 AM
      crowdMultiplier: 1.5
    },
    {
      name: "Evening Aarti",
      location: "Ramkund",
      time: 19, // 7 PM
      crowdMultiplier: 1.8
    },
    // Add more scheduled events
  ];

  constructor() {
    this.initSampleData();
    this.initNewsData();
    this.initCrowdLevels();
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

    // Initialize crowd history
    this.crowdLevels.forEach(level => {
      this.crowdHistory.set(level.location, []);
    });
  }

  private getTimeBasedCrowdFactor(location: string): number {
    const hour = new Date().getHours();

    // Base factors for different times of day
    if (hour >= 4 && hour < 8) return 1.2; // Early morning rush
    if (hour >= 8 && hour < 11) return 1.0; // Morning
    if (hour >= 11 && hour < 16) return 0.7; // Afternoon (less crowded)
    if (hour >= 16 && hour < 20) return 1.5; // Evening rush
    return 0.5; // Night time
  }

  private getEventImpact(location: string): number {
    const currentHour = new Date().getHours();

    // Check for events happening now
    const currentEvents = this.events.filter(event =>
      event.location === location &&
      Math.abs(event.time - currentHour) <= 1
    );

    return currentEvents.reduce((acc, event) => acc * event.crowdMultiplier, 1);
  }

  private analyzeRecentTrend(location: string): {
    trend: 'increasing' | 'decreasing' | 'stable';
    rate: number;
  } {
    const history = this.crowdHistory.get(location) || [];
    if (history.length < 2) return { trend: 'stable', rate: 0 };

    const recent = history.slice(-5); // Last 5 readings
    const changes = recent.slice(1).map((curr, i) =>
      (curr.count - recent[i].count) / recent[i].count
    );

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

    return {
      trend: avgChange > 0.1 ? 'increasing' : avgChange < -0.1 ? 'decreasing' : 'stable',
      rate: avgChange
    };
  }

  private getTimeBasedRecommendation(location: string, status: string, hour: number): string {
    let baseRecommendation = "Best time to visit: ";

    // Early morning recommendation (4 AM - 8 AM)
    if (hour >= 11 && hour < 16) {
      baseRecommendation += "Early morning before 6 AM or evening after 7 PM. ";
    } else if (hour >= 16 && hour < 20) {
      baseRecommendation += "Consider waiting until after 8 PM for lower crowds. ";
    } else if (hour >= 20 || hour < 4) {
      baseRecommendation += "Current time is good, crowd levels are typically low. ";
    } else {
      baseRecommendation += "Early morning before 6 AM or evening after 7 PM. ";
    }

    // Add status-based recommendations
    switch (status) {
      case "overcrowded":
        return baseRecommendation + "Currently OVERCROWDED. Please expect 1+ hour waiting times.";
      case "crowded":
        return baseRecommendation + "Currently CROWDED. Consider alternative locations or waiting times.";
      case "moderate":
        return baseRecommendation + "Moderate crowds, manageable waiting times.";
      case "safe":
        return baseRecommendation + "Currently safe to visit with minimal waiting time.";
      default:
        return baseRecommendation;
    }
  }

  private updateCrowdRecommendations(level: CrowdLevel, trend: { trend: string, rate: number }) {
    const hour = new Date().getHours();
    const baseRecommendation = this.getTimeBasedRecommendation(level.location, level.status, hour);

    const trendInfo = trend.trend !== 'stable'
      ? `Crowd is ${trend.trend} (${Math.abs(trend.rate * 100).toFixed(1)}% ${trend.trend === 'increasing' ? 'up' : 'down'}). `
      : 'Crowd levels are stable. ';

    // Special warnings for high-risk times
    let specialWarning = '';
    if ((hour >= 16 && hour < 20) && (level.status === "crowded" || level.status === "overcrowded")) {
      specialWarning = "⚠️ Evening peak time. Extended waiting times expected. ";
    }

    level.recommendations = `${baseRecommendation} ${trendInfo} ${specialWarning}`.trim();
  }

  async getAllCrowdLevels(): Promise<CrowdLevel[]> {
    this.crowdLevels = this.crowdLevels.map(level => {
      // Get current trend
      const trend = this.analyzeRecentTrend(level.location);

      // Calculate dynamic factors
      const timeFactor = this.getTimeBasedCrowdFactor(level.location);
      const eventImpact = this.getEventImpact(level.location);
      const weatherImpact = 1.0; // Could be enhanced with real weather data

      // Add some randomness (-5% to +5%)
      const randomFactor = 1 + (Math.random() * 0.1 - 0.05);

      // Calculate new count with all factors
      let newCount = Math.floor(
        level.currentCount * timeFactor * eventImpact * weatherImpact * randomFactor
      );

      // Ensure count stays within reasonable bounds
      newCount = Math.max(Math.min(newCount, level.capacity * 1.2), level.capacity * 0.1);

      // Update status based on new count
      let newStatus = "safe";
      if (newCount > level.capacity * 0.9) {
        newStatus = "overcrowded";
      } else if (newCount > level.capacity * 0.7) {
        newStatus = "crowded";
      } else if (newCount > level.capacity * 0.5) {
        newStatus = "moderate";
      }

      // Store in history for trend analysis
      const history = this.crowdHistory.get(level.location) || [];
      history.push({ timestamp: Date.now(), count: newCount });
      if (history.length > 100) history.shift(); // Keep last 100 readings
      this.crowdHistory.set(level.location, history);

      // Create updated level with new data
      const updatedLevel = {
        ...level,
        currentCount: newCount,
        status: newStatus,
        lastUpdated: new Date().toISOString()
      };

      // Update recommendations based on all factors
      this.updateCrowdRecommendations(updatedLevel, trend);

      return updatedLevel;
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
    category: string;
  }[]> {
    return this.newsItems;
  }

  private initSampleData() {
    // Initialize sample data
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
}

export const storage = new MemStorage();