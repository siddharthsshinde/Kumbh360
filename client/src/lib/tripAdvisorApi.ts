/**
 * TripAdvisor API Client for the Kumbh Mela App
 * 
 * This client handles interactions with the TripAdvisor API for hotel and accommodation data
 */

export interface TripAdvisorLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
}

export interface TripAdvisorHotel {
  id: string;
  name: string;
  location: TripAdvisorLocation;
  rating: number;
  price: {
    from: number;
    to: number;
    currency: string;
    displayPrice: string;
  };
  amenities: string[];
  images: {
    small: string;
    large: string;
  }[];
  description: string;
  type: string;
  availability: 'High' | 'Available' | 'Limited';
  contact: string;
  distance?: number; // Distance from a reference point (in km)
}

export interface TripAdvisorSearchParams {
  location?: string;
  latitude?: number;
  longitude?: number;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  rooms?: number;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  rating?: number;
  limit?: number;
}

class TripAdvisorApiClient {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.tripadvisor.com/api/v1';
  
  /**
   * Set the TripAdvisor API key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Check if API key is set
   */
  hasApiKey(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Search for hotels and accommodations near a location
   */
  async searchHotels(params: TripAdvisorSearchParams): Promise<TripAdvisorHotel[]> {
    if (!this.apiKey) {
      throw new Error('TripAdvisor API key not set');
    }
    
    try {
      // In a real implementation, we would call the TripAdvisor API
      // const url = `${this.baseUrl}/hotels/search?key=${this.apiKey}&location=${params.location}`;
      // const response = await fetch(url);
      // const data = await response.json();
      // return data.data;
      
      // For demo purposes, we'll throw an error to trigger our fallback data
      throw new Error('Using fallback data for demo purposes');
    } catch (error) {
      console.error('Error searching TripAdvisor hotels:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed information for a specific hotel by ID
   */
  async getHotelDetails(hotelId: string): Promise<TripAdvisorHotel> {
    if (!this.apiKey) {
      throw new Error('TripAdvisor API key not set');
    }
    
    try {
      // In a real implementation, we would call the TripAdvisor API
      // const url = `${this.baseUrl}/hotels/${hotelId}?key=${this.apiKey}`;
      // const response = await fetch(url);
      // const data = await response.json();
      // return data;
      
      // For demo purposes, we'll throw an error to trigger our fallback data
      throw new Error('Using fallback data for demo purposes');
    } catch (error) {
      console.error('Error getting hotel details:', error);
      throw error;
    }
  }
  
  /**
   * Get nearby hotels around coordinates (latitude, longitude)
   */
  async getNearbyHotels(
    latitude: number,
    longitude: number,
    radius: number = 5, // 5km radius
    limit: number = 10
  ): Promise<TripAdvisorHotel[]> {
    if (!this.apiKey) {
      throw new Error('TripAdvisor API key not set');
    }
    
    try {
      // In a real implementation, we would call the TripAdvisor API
      // const url = `${this.baseUrl}/hotels/nearby?key=${this.apiKey}&latitude=${latitude}&longitude=${longitude}&radius=${radius}&limit=${limit}`;
      // const response = await fetch(url);
      // const data = await response.json();
      // return data.data;
      
      // For demo purposes, we'll throw an error to trigger our fallback data
      throw new Error('Using fallback data for demo purposes');
    } catch (error) {
      console.error('Error getting nearby hotels:', error);
      throw error;
    }
  }
  
  /**
   * Calculate the distance (in km) between two sets of coordinates
   * using the Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const tripAdvisorApiClient = new TripAdvisorApiClient();