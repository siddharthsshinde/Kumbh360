/**
 * Smart Recommendations Engine for Kumbh Mela Chatbot
 * 
 * This module implements personalized recommendation capabilities for the Kumbh Mela chatbot,
 * taking into account crowd levels, user context, time of day, and previous interactions.
 */

import { ChatMessage, Location } from '@shared/types';
import { CrowdLevel, Facility } from '@shared/schema';
import { storage } from './storage';
import { log } from './vite';
import { cacheManager, CacheType } from './cache-manager';

// Define recommendation weight factors
const WEIGHT_CROWD_LEVEL = 0.35;
const WEIGHT_USER_HISTORY = 0.25;
const WEIGHT_TIME_OF_DAY = 0.20;
const WEIGHT_WEATHER = 0.10;
const WEIGHT_DISTANCE = 0.10;

// Define time slot classifications
const TIME_SLOTS = {
  EARLY_MORNING: { name: 'early morning', start: 4, end: 7, crowdFactor: 0.3 },
  MORNING: { name: 'morning', start: 7, end: 11, crowdFactor: 0.7 },
  MID_DAY: { name: 'mid-day', start: 11, end: 14, crowdFactor: 0.8 },
  AFTERNOON: { name: 'afternoon', start: 14, end: 17, crowdFactor: 0.6 },
  EVENING: { name: 'evening', start: 17, end: 20, crowdFactor: 0.9 },
  NIGHT: { name: 'night', start: 20, end: 24, crowdFactor: 0.5 },
  LATE_NIGHT: { name: 'late night', start: 0, end: 4, crowdFactor: 0.2 }
};

// Define crowd threshold levels
const CROWD_THRESHOLD = {
  LOW: 0.3,
  MODERATE: 0.6,
  HIGH: 0.8
};

// Recommendation types
export enum RecommendationType {
  LOCATION = 'location',
  TIME = 'time',
  ROUTE = 'route',
  ACTIVITY = 'activity',
  SAFETY = 'safety',
  FOOD = 'food',
  ACCOMMODATION = 'accommodation',
  TRANSPORTATION = 'transportation'
}

// Recommendation interface
export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  confidence: number;
  locationId?: number;
  timeFrame?: string;
  crowdLevel?: string;
  distance?: number;
  source?: string;
  priority: number; // 1 (highest) to 5 (lowest)
}

class RecommendationEngine {
  private static instance: RecommendationEngine;
  private userHistory: Map<string, {
    visitedLocations: Set<string>;
    interests: Map<string, number>;
    previousRecommendations: Recommendation[];
    interactionCount: number;
  }> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  /**
   * Generate personalized recommendations based on user context and real-time data
   */
  public async generateRecommendations(
    sessionId: string,
    chatHistory: ChatMessage[],
    currentLocation?: Location,
    intent?: string,
    maxRecommendations: number = 3
  ): Promise<Recommendation[]> {
    try {
      // Get necessary data
      const crowdLevels = await storage.getAllCrowdLevels();
      const facilities = await storage.getAllFacilities();
      
      // Initialize user history if not exists
      if (!this.userHistory.has(sessionId)) {
        this.userHistory.set(sessionId, {
          visitedLocations: new Set<string>(),
          interests: new Map<string, number>(),
          previousRecommendations: [],
          interactionCount: 0
        });
      }
      
      // Update user context based on chat history
      await this.updateUserContext(sessionId, chatHistory);
      
      // Generate all possible recommendations
      const allRecommendations: Recommendation[] = [];
      
      // Add location recommendations based on crowd levels
      const locationRecs = await this.getLocationRecommendations(
        sessionId, 
        crowdLevels, 
        facilities, 
        currentLocation
      );
      allRecommendations.push(...locationRecs);
      
      // Add time-based recommendations
      const timeRecs = this.getTimeRecommendations(crowdLevels);
      allRecommendations.push(...timeRecs);
      
      // Add intent-specific recommendations
      if (intent) {
        const intentRecs = await this.getIntentBasedRecommendations(
          intent, 
          sessionId, 
          currentLocation
        );
        allRecommendations.push(...intentRecs);
      }
      
      // Add safety recommendations based on crowd levels
      const safetyRecs = this.getSafetyRecommendations(crowdLevels);
      allRecommendations.push(...safetyRecs);
      
      // Filter and rank recommendations
      const rankedRecommendations = this.rankRecommendations(
        allRecommendations,
        sessionId,
        intent
      );
      
      // Store recommendations in user history
      const userContext = this.userHistory.get(sessionId)!;
      userContext.previousRecommendations = rankedRecommendations.slice(0, maxRecommendations);
      userContext.interactionCount++;
      
      // Return top recommendations
      return rankedRecommendations.slice(0, maxRecommendations);
    } catch (error) {
      log(`Error generating recommendations: ${error}`, 'recommendation-engine');
      return [];
    }
  }

  /**
   * Update user context based on chat history
   */
  private async updateUserContext(
    sessionId: string,
    chatHistory: ChatMessage[]
  ): Promise<void> {
    const userContext = this.userHistory.get(sessionId)!;
    
    // Process only user messages to understand interests
    const userMessages = chatHistory.filter(msg => msg.role === 'user');
    
    // Extract location mentions and interests from user messages
    for (const message of userMessages) {
      // Extract location mentions
      const mentionedLocations = this.extractLocationMentions(message.content);
      mentionedLocations.forEach(location => userContext.visitedLocations.add(location));
      
      // Extract interests
      const interests = this.extractInterests(message.content);
      interests.forEach((weight, interest) => {
        const currentWeight = userContext.interests.get(interest) || 0;
        userContext.interests.set(interest, currentWeight + weight);
      });
    }
  }

  /**
   * Extract location mentions from text
   * Enhanced to handle grammatically imperfect queries
   */
  private extractLocationMentions(text: string): string[] {
    const locations: string[] = [];
    const locationKeywords = [
      'Ramkund', 'Kalaram Temple', 'Tapovan', 'Godavari Ghat', 'Trimbakeshwar',
      'Panchavati', 'Someshwar', 'Ardhkumbh'
    ];
    
    // Clean the text to handle grammatical errors and extra spaces
    const lowercaseText = text.toLowerCase()
      .replace(/\s+/g, ' ')                  // Replace multiple spaces with single space
      .replace(/\s?to\s?in\s?/g, ' to ')     // Fix "to in" grammar error
      .replace(/\s?in\s?to\s?/g, ' to ')     // Fix "in to" grammar error
      .replace(/\s?best\s?time\s?/g, ' ')    // Remove "best time" for location extraction
      .trim();
    
    // Check for exact location matches first
    for (const location of locationKeywords) {
      if (lowercaseText.includes(location.toLowerCase())) {
        locations.push(location);
      }
    }
    
    // If no locations found, check for partial matches and common variations
    if (locations.length === 0) {
      // Common misspellings and variations
      const locationVariations: Record<string, string[]> = {
        'Ramkund': ['ram kund', 'ram ghat', 'ramkunda', 'ram-kund', 'ramghat'],
        'Tapovan': ['tapovan ghat', 'tapovanam', 'tapo-van'],
        'Trimbakeshwar': ['trimbak', 'trimbakeswar', 'trimbak temple', 'triambak'],
        'Kalaram Temple': ['kala ram', 'kalaramji', 'kala ram temple']
      };
      
      // Check each variation
      for (const [location, variations] of Object.entries(locationVariations)) {
        for (const variation of variations) {
          if (lowercaseText.includes(variation)) {
            locations.push(location);
            break;
          }
        }
      }
      
      // Context-based detection for imperfect queries
      if (locations.length === 0) {
        if (lowercaseText.includes('ramkund') || lowercaseText.includes('ram') || 
            lowercaseText.includes('kund') || lowercaseText.includes('ghat')) {
          locations.push('Ramkund');
        } else if (lowercaseText.includes('temple') || lowercaseText.includes('mandir')) {
          locations.push('Kalaram Temple');
        } else if (lowercaseText.includes('visit') && !lowercaseText.includes('location')) {
          // Default to Ramkund for general visit queries with no specific location
          locations.push('Ramkund');
        }
      }
    }
    
    return locations;
  }

  /**
   * Extract user interests from text
   */
  private extractInterests(text: string): Map<string, number> {
    const interests = new Map<string, number>();
    const interestKeywords = {
      'religious': ['prayer', 'ritual', 'holy', 'dip', 'sacred', 'spiritual', 'blessing', 'temple'],
      'cultural': ['history', 'tradition', 'art', 'heritage', 'cultural', 'festival'],
      'food': ['food', 'eat', 'restaurant', 'cuisine', 'meal', 'hungry', 'dinner', 'lunch'],
      'safety': ['safe', 'security', 'crowd', 'emergency', 'accident', 'help'],
      'transportation': ['travel', 'bus', 'train', 'transport', 'car', 'reach', 'taxi', 'uber']
    };
    
    const lowercaseText = text.toLowerCase();
    
    // Check for each interest type
    Object.entries(interestKeywords).forEach(([interest, keywords]) => {
      let interestWeight = 0;
      keywords.forEach(keyword => {
        if (lowercaseText.includes(keyword.toLowerCase())) {
          interestWeight += 0.2; // Increase weight for each matching keyword
        }
      });
      
      if (interestWeight > 0) {
        interests.set(interest, interestWeight);
      }
    });
    
    return interests;
  }

  /**
   * Get location recommendations based on crowd levels and user history
   */
  private async getLocationRecommendations(
    sessionId: string,
    crowdLevels: CrowdLevel[],
    facilities: Facility[],
    userLocation?: Location
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const userContext = this.userHistory.get(sessionId)!;
    
    // Sort locations by crowd levels (ascending)
    const sortedByLowCrowd = [...crowdLevels].sort((a, b) => {
      const aRatio = a.currentCount / a.capacity;
      const bRatio = b.currentCount / b.capacity;
      return aRatio - bRatio;
    });
    
    // Get least crowded locations
    const leastCrowdedLocations = sortedByLowCrowd.slice(0, 3);
    
    for (const location of leastCrowdedLocations) {
      // Calculate crowd ratio
      const crowdRatio = location.currentCount / location.capacity;
      let crowdLevel = 'low';
      if (crowdRatio > CROWD_THRESHOLD.HIGH) {
        crowdLevel = 'high';
      } else if (crowdRatio > CROWD_THRESHOLD.MODERATE) {
        crowdLevel = 'moderate';
      }
      
      // Skip if already in user's visited locations and we have enough recommendations
      if (userContext.visitedLocations.has(location.location) && recommendations.length >= 2) {
        continue;
      }
      
      // Get corresponding facility for additional info
      const facility = facilities.find(f => f.name === location.location);
      
      // Create recommendation
      const recommendation: Recommendation = {
        type: RecommendationType.LOCATION,
        title: `Visit ${location.location}`,
        description: `${location.location} currently has ${crowdLevel} crowd levels (${Math.round(crowdRatio * 100)}% capacity). ${location.recommendations}`,
        confidence: 0.8 - crowdRatio, // Higher confidence for less crowded places
        locationId: location.id,
        crowdLevel,
        priority: crowdRatio < CROWD_THRESHOLD.MODERATE ? 1 : 3 // Higher priority for less crowded places
      };
      
      // Add distance info if user location is available
      if (userLocation && facility) {
        const distance = this.calculateDistance(
          userLocation.lat, userLocation.lng,
          (facility.location as { lat: number; lng: number }).lat,
          (facility.location as { lat: number; lng: number }).lng
        );
        recommendation.distance = distance;
        recommendation.description += ` It's about ${distance.toFixed(1)} km from your current location.`;
      }
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }

  /**
   * Get time-based recommendations based on crowd levels
   */
  private getTimeRecommendations(crowdLevels: CrowdLevel[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const currentHour = new Date().getHours();
    
    // Find the current time slot
    let currentSlot = TIME_SLOTS.MID_DAY; // Default
    Object.values(TIME_SLOTS).forEach(slot => {
      if (currentHour >= slot.start && currentHour < slot.end) {
        currentSlot = slot;
      }
    });
    
    // Find best time slots based on crowd factor
    const bestTimeSlots = Object.values(TIME_SLOTS)
      .filter(slot => slot.crowdFactor < 0.5)
      .sort((a, b) => a.crowdFactor - b.crowdFactor);
    
    // Add general timing recommendations for all major locations
    // This is more comprehensive and helps with queries like "Best time to visit Ramkund"
    const keyLocations = ["Ramkund", "Tapovan", "Kalaram Temple", "Trimbakeshwar"];
    
    keyLocations.forEach(locationName => {
      const locationData = crowdLevels.find(level => level.location === locationName);
      
      if (locationData) {
        const crowdRatio = locationData.currentCount / locationData.capacity;
        let bestTimeDescription = '';
        let bestTimeSlot = null;
        
        // Location-specific best times based on historical data and real-time crowd analysis
        switch (locationName) {
          case "Ramkund":
            bestTimeSlot = TIME_SLOTS.EARLY_MORNING;
            bestTimeDescription = 
              "The best time to visit Ramkund is early morning (4:00-7:00 AM) when the crowd is minimal " +
              "and you can experience the spiritual atmosphere peacefully. Late night (after 10:00 PM) " +
              "is also good for a less crowded experience.";
            break;
          case "Kalaram Temple":
            bestTimeSlot = TIME_SLOTS.MID_DAY;
            bestTimeDescription = 
              "For Kalaram Temple, mid-day (11:00 AM-2:00 PM) on weekdays tends to be less crowded. " +
              "Avoid weekends and festival days when possible.";
            break;
          case "Tapovan":
            bestTimeSlot = TIME_SLOTS.EVENING;
            bestTimeDescription = 
              "Tapovan is best visited in the evening (5:00-7:00 PM) when it's less crowded and the " +
              "atmosphere is serene. Early morning is also a good option.";
            break;
          case "Trimbakeshwar":
            bestTimeSlot = TIME_SLOTS.MORNING;
            bestTimeDescription = 
              "Visit Trimbakeshwar in the morning (7:00-10:00 AM) to avoid crowds. This is when " +
              "the temple is relatively less crowded and you can have a peaceful darshan.";
            break;
          default:
            // Use general best times for other locations
            bestTimeSlot = bestTimeSlots[0];
            bestTimeDescription = 
              `For ${locationName}, ${bestTimeSlot.name} (${bestTimeSlot.start}:00-${bestTimeSlot.end}:00) ` +
              "is typically less crowded and would provide a better experience.";
        }
        
        // Adjust confidence based on current crowds
        let confidence = 0.8;
        if (crowdRatio > CROWD_THRESHOLD.HIGH) {
          confidence = 0.9; // Higher confidence when recommending times for very crowded places
        } else if (crowdRatio < CROWD_THRESHOLD.LOW) {
          confidence = 0.7; // Lower confidence when already not crowded
        }
        
        recommendations.push({
          type: RecommendationType.TIME,
          title: `Best time to visit ${locationName}`,
          description: bestTimeDescription,
          confidence: confidence,
          locationId: locationData.id,
          timeFrame: bestTimeSlot ? `${bestTimeSlot.start}:00-${bestTimeSlot.end}:00` : undefined,
          priority: 1 // Higher priority for time recommendations
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Get safety recommendations based on crowd levels
   */
  private getSafetyRecommendations(crowdLevels: CrowdLevel[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Find overcrowded locations that need safety warnings
    const overcrowdedLocations = crowdLevels.filter(location => {
      const ratio = location.currentCount / location.capacity;
      return ratio > CROWD_THRESHOLD.HIGH;
    });
    
    if (overcrowdedLocations.length > 0) {
      // Create a safety recommendation
      recommendations.push({
        type: RecommendationType.SAFETY,
        title: 'Important Safety Tip',
        description: `Be extra cautious as ${overcrowdedLocations.map(l => l.location).join(', ')} ${overcrowdedLocations.length === 1 ? 'is' : 'are'} very crowded right now. Keep your belongings secure and stay with your group.`,
        confidence: 0.9,
        priority: 1 // High priority for safety
      });
    }
    
    return recommendations;
  }

  /**
   * Get recommendations based on user's expressed intent
   */
  private async getIntentBasedRecommendations(
    intent: string,
    sessionId: string,
    userLocation?: Location
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const userContext = this.userHistory.get(sessionId)!;
    
    switch (intent) {
      case 'religious':
        // Recommend religious activities
        recommendations.push({
          type: RecommendationType.ACTIVITY,
          title: 'Participate in Aarti Ceremony',
          description: 'The evening Aarti ceremony at Ramkund offers a spiritually enriching experience. It starts at 7:00 PM daily.',
          confidence: 0.8,
          timeFrame: '7:00 PM',
          priority: userContext.interests.get('religious') ? 1 : 3
        });
        break;
        
      case 'transportation':
        // Recommend transportation options
        const facilities = await storage.getAllFacilities();
        const shuttles = await storage.getShuttleLocations();
        
        // If user location available, recommend nearest shuttle
        if (userLocation && shuttles.length > 0) {
          // Find nearest shuttle
          let nearestShuttle = shuttles[0];
          let minDistance = Number.MAX_VALUE;
          
          for (const shuttle of shuttles) {
            const distance = this.calculateDistance(
              userLocation.lat, userLocation.lng,
              shuttle.coordinates.lat, shuttle.coordinates.lng
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestShuttle = shuttle;
            }
          }
          
          recommendations.push({
            type: RecommendationType.TRANSPORTATION,
            title: 'Nearest Shuttle Stop',
            description: `The nearest shuttle stop is at ${nearestShuttle.currentLocation} (${minDistance.toFixed(1)} km away), with the next shuttle heading to ${nearestShuttle.nextStop} arriving at ${nearestShuttle.estimatedArrival}.`,
            confidence: 0.85,
            distance: minDistance,
            priority: 2
          });
        } else {
          // General transportation recommendation
          recommendations.push({
            type: RecommendationType.TRANSPORTATION,
            title: 'Shuttle Service Available',
            description: 'Free shuttle services connect all major Kumbh sites. Look for the designated shuttle stops marked on your map.',
            confidence: 0.7,
            priority: 3
          });
        }
        break;
        
      case 'food':
        // Recommend food options
        recommendations.push({
          type: RecommendationType.FOOD,
          title: 'Food and Water Safety',
          description: 'For safe eating, visit the Annakshetra (community kitchen) near Ramkund or the verified food stalls with green safety certifications. Always drink bottled or purified water.',
          confidence: 0.75,
          priority: 2
        });
        break;
        
      default:
        // No specific recommendations for this intent
        break;
    }
    
    return recommendations;
  }

  /**
   * Rank recommendations based on multiple factors
   */
  private rankRecommendations(
    recommendations: Recommendation[],
    sessionId: string,
    intent?: string
  ): Recommendation[] {
    const userContext = this.userHistory.get(sessionId)!;
    
    // Calculate scores for each recommendation
    const scoredRecommendations = recommendations.map(rec => {
      let score = rec.confidence * 0.5; // Base score from confidence
      
      // Prioritize based on user interests
      if (rec.type === RecommendationType.LOCATION || rec.type === RecommendationType.ACTIVITY) {
        const interestFactor = userContext.interests.get('religious') || 0;
        score += interestFactor * 0.2;
      } else if (rec.type === RecommendationType.FOOD) {
        const interestFactor = userContext.interests.get('food') || 0;
        score += interestFactor * 0.2;
      } else if (rec.type === RecommendationType.TRANSPORTATION) {
        const interestFactor = userContext.interests.get('transportation') || 0;
        score += interestFactor * 0.2;
      }
      
      // Prioritize based on intent match
      if (intent) {
        if ((intent === 'religious' && rec.type === RecommendationType.LOCATION) ||
            (intent === 'transportation' && rec.type === RecommendationType.TRANSPORTATION) ||
            (intent === 'food' && rec.type === RecommendationType.FOOD)) {
          score += 0.2;
        }
      }
      
      // Prioritize based on recommendation priority
      score += (1 / rec.priority) * 0.3;
      
      // Deprioritize recommendations user has already seen
      const previouslyRecommended = userContext.previousRecommendations.some(
        prevRec => prevRec.title === rec.title
      );
      
      if (previouslyRecommended) {
        score -= 0.3;
      }
      
      return { recommendation: rec, score };
    });
    
    // Sort by score (descending)
    return scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .map(item => item.recommendation);
  }

  /**
   * Calculate distance between two geographical points (Haversine formula)
   */
  private calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Format recommendation for chatbot response
   */
  public formatRecommendationsForChat(recommendations: Recommendation[]): string {
    if (recommendations.length === 0) {
      return '';
    }
    
    let response = '**Smart Recommendations:**\n\n';
    
    recommendations.forEach((rec, index) => {
      response += `${index + 1}. **${rec.title}**: ${rec.description}\n\n`;
    });
    
    return response;
  }
}

// Export singleton instance
export const recommendationEngine = RecommendationEngine.getInstance();