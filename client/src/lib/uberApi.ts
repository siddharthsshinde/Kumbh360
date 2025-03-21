import axios from 'axios';

// Define interfaces for Uber API
export interface UberRideEstimate {
  productId: string;
  name: string;
  estimatedDuration: number; // in seconds
  estimatedDistance: number; // in km
  estimatedFare: {
    value: number;
    currency: string;
    displayAmount: string;
  };
  surge: number;
  image: string;
  capacity: number;
}

export interface UberLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface UberRideRequest {
  pickupLocation: UberLocation;
  dropoffLocation: UberLocation;
  productId: string;
}

export interface UberProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  capacity: number;
}

// Uber API client class
class UberApiClient {
  private apiKey: string | null = null;
  private clientId: string | null = null;
  private baseUrl = 'https://api.uber.com/v1.2';

  // Method to set API key - should be called during component initialization
  setCredentials(apiKey: string, clientId: string) {
    this.apiKey = apiKey;
    this.clientId = clientId;
  }

  // Check if credentials are set
  hasCredentials(): boolean {
    return !!this.apiKey && !!this.clientId;
  }

  // Get estimates for ride based on pickup and dropoff locations
  async getRideEstimates(pickup: UberLocation, dropoff: UberLocation): Promise<UberRideEstimate[]> {
    if (!this.hasCredentials()) {
      throw new Error('Uber API credentials not set');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/estimates/price`, {
        params: {
          start_latitude: pickup.latitude,
          start_longitude: pickup.longitude,
          end_latitude: dropoff.latitude,
          end_longitude: dropoff.longitude,
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept-Language': 'en_US',
        }
      });

      // Transform the response to match our interface
      return response.data.prices.map((price: any) => ({
        productId: price.product_id,
        name: price.display_name,
        estimatedDuration: price.duration,
        estimatedDistance: price.distance,
        estimatedFare: {
          value: price.high_estimate, // Using high estimate for safety
          currency: price.currency_code,
          displayAmount: `${price.currency_code} ${price.high_estimate}`,
        },
        surge: price.surge_multiplier,
        image: '', // API doesn't provide this in price estimates, we'll get it from products
        capacity: 0, // API doesn't provide this in price estimates, we'll get it from products
      }));
    } catch (error) {
      console.error('Error fetching Uber ride estimates:', error);
      return [];
    }
  }

  // Get available Uber products in a given location
  async getProducts(latitude: number, longitude: number): Promise<UberProduct[]> {
    if (!this.hasCredentials()) {
      throw new Error('Uber API credentials not set');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/products`, {
        params: {
          latitude,
          longitude,
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      return response.data.products.map((product: any) => ({
        id: product.product_id,
        name: product.display_name,
        description: product.description,
        image: product.image,
        capacity: product.capacity,
      }));
    } catch (error) {
      console.error('Error fetching Uber products:', error);
      return [];
    }
  }

  // Request an Uber ride
  async requestRide(request: UberRideRequest): Promise<{ requestId: string; status: string }> {
    if (!this.hasCredentials()) {
      throw new Error('Uber API credentials not set');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/requests`, {
        product_id: request.productId,
        start_latitude: request.pickupLocation.latitude,
        start_longitude: request.pickupLocation.longitude,
        end_latitude: request.dropoffLocation.latitude,
        end_longitude: request.dropoffLocation.longitude,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        requestId: response.data.request_id,
        status: response.data.status,
      };
    } catch (error) {
      console.error('Error requesting Uber ride:', error);
      throw error;
    }
  }

  // Get deep link for Uber app
  getUberAppDeepLink(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
    productId?: string
  ): string {
    const params = new URLSearchParams({
      client_id: this.clientId || '',
      action: 'setPickup',
      pickup_latitude: pickupLat.toString(),
      pickup_longitude: pickupLng.toString(),
      dropoff_latitude: dropoffLat.toString(),
      dropoff_longitude: dropoffLng.toString(),
    });

    if (productId) {
      params.append('product_id', productId);
    }

    return `https://m.uber.com/ul/?${params.toString()}`;
  }
}

// Export a singleton instance
export const uberApiClient = new UberApiClient();