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
  private baseUrl = 'https://tripadvisor16.p.rapidapi.com/api/v1';
  
  /**
   * Set the TripAdvisor API key (RapidAPI key)
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
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.location) queryParams.append('locationId', params.location);
      if (params.checkIn) queryParams.append('checkIn', params.checkIn);
      if (params.checkOut) queryParams.append('checkOut', params.checkOut);
      if (params.adults) queryParams.append('adults', params.adults.toString());
      if (params.rooms) queryParams.append('rooms', params.rooms.toString());
      if (params.limit) queryParams.append('pageSize', params.limit.toString());
      
      const url = `${this.baseUrl}/hotels/searchHotels?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`RapidAPI TripAdvisor API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform RapidAPI response to our interface format
      return this.transformHotelsResponse(data);
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
      const url = `${this.baseUrl}/hotels/getHotelDetails?id=${hotelId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`RapidAPI TripAdvisor API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform RapidAPI response to our interface format
      return this.transformHotelDetail(data);
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
      // First, we need to search for a location ID near these coordinates
      const geoUrl = `${this.baseUrl}/hotels/searchLocation?query=nearby&latitude=${latitude}&longitude=${longitude}`;
      
      const geoResponse = await fetch(geoUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
        }
      });
      
      if (!geoResponse.ok) {
        throw new Error(`RapidAPI TripAdvisor API error: ${geoResponse.status} ${geoResponse.statusText}`);
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData.data || geoData.data.length === 0) {
        throw new Error('No locations found near the provided coordinates');
      }
      
      // Get the first location ID
      const locationId = geoData.data[0].locationId;
      
      // Now search for hotels in that location
      const params: TripAdvisorSearchParams = {
        location: locationId,
        limit: limit
      };
      
      return await this.searchHotels(params);
    } catch (error) {
      console.error('Error getting nearby hotels:', error);
      throw error;
    }
  }
  
  /**
   * Transform RapidAPI hotel search response to our interface format
   */
  private transformHotelsResponse(apiResponse: any): TripAdvisorHotel[] {
    if (!apiResponse.data || !apiResponse.data.data) {
      return [];
    }
    
    return apiResponse.data.data.map((hotel: any) => {
      try {
        return {
          id: hotel.id || `hotel-${Math.random().toString(36).substring(2, 9)}`,
          name: hotel.title || 'Unnamed Accommodation',
          location: {
            id: hotel.locationId || '',
            name: hotel.address || '',
            latitude: hotel.latitude || 0,
            longitude: hotel.longitude || 0,
            address: hotel.address || '',
            city: hotel.address?.split(',')[0] || '',
            country: 'India'
          },
          rating: hotel.bubbleRating?.rating || 0,
          price: {
            from: hotel.priceForDisplay ? parseInt(hotel.priceForDisplay.replace(/[^0-9]/g, '')) : 1000,
            to: hotel.priceForDisplay ? parseInt(hotel.priceForDisplay.replace(/[^0-9]/g, '')) * 1.5 : 2000,
            currency: 'INR',
            displayPrice: hotel.priceForDisplay || '₹1,000'
          },
          amenities: hotel.amenities || ['WiFi', 'Parking', 'Air Conditioning'],
          images: [
            {
              small: hotel.cardPhotos?.[0]?.sizes?.urlTemplate?.replace('{width}', '250').replace('{height}', '150') || '',
              large: hotel.cardPhotos?.[0]?.sizes?.urlTemplate?.replace('{width}', '500').replace('{height}', '300') || ''
            }
          ],
          description: hotel.secondaryInfo || 'Comfortable accommodation near Kumbh Mela',
          type: hotel.type || 'Hotel',
          availability: hotel.availability || 'Available',
          contact: hotel.contactInfo?.phoneNumber || '+91 1234567890',
          distance: hotel.distance || this.calculateDistance(19.997454, 73.790919, hotel.latitude || 0, hotel.longitude || 0) // Distance from Trimbakeshwar
        };
      } catch (e) {
        console.error('Error transforming hotel data:', e);
        return null;
      }
    }).filter(Boolean);
  }
  
  /**
   * Transform RapidAPI hotel detail response to our interface format
   */
  private transformHotelDetail(apiResponse: any): TripAdvisorHotel {
    const hotel = apiResponse.data;
    
    if (!hotel) {
      throw new Error('Invalid hotel detail response');
    }
    
    return {
      id: hotel.locationId || `hotel-${Math.random().toString(36).substring(2, 9)}`,
      name: hotel.name || 'Unnamed Accommodation',
      location: {
        id: hotel.locationId || '',
        name: hotel.address?.address_string || '',
        latitude: hotel.latitude || 0,
        longitude: hotel.longitude || 0,
        address: hotel.address?.address_string || '',
        city: hotel.address?.city || '',
        country: hotel.address?.country || 'India'
      },
      rating: hotel.rating || 0,
      price: {
        from: hotel.price || 1000,
        to: hotel.price ? hotel.price * 1.5 : 2000,
        currency: 'INR',
        displayPrice: hotel.price ? `₹${hotel.price}` : '₹1,000'
      },
      amenities: hotel.amenities?.map((a: any) => a.name) || ['WiFi', 'Parking', 'Air Conditioning'],
      images: hotel.photos?.map((photo: any) => ({
        small: photo.images?.small?.url || '',
        large: photo.images?.large?.url || ''
      })) || [{ small: '', large: '' }],
      description: hotel.description || 'Comfortable accommodation near Kumbh Mela',
      type: hotel.hotel_class ? `${hotel.hotel_class}-Star Hotel` : 'Hotel',
      availability: 'Available',
      contact: hotel.phone || '+91 1234567890',
      distance: hotel.distance || 0
    };
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