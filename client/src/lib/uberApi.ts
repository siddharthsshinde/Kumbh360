/**
 * Uber's developer API was discontinued in 2019.
 * Stub retained for import compatibility — UberRideBooking now uses deep links.
 */
export interface UberRideEstimate {
  productId: string;
  name: string;
  estimatedDuration: number;
  estimatedDistance: number;
  estimatedFare: { value: number; currency: string; displayAmount: string };
  surge: number;
  image: string;
  capacity: number;
}
export interface UberLocation { address: string; latitude: number; longitude: number; }
export interface UberProduct { productId: string; name: string; image: string; capacity: number; }
export interface UberRideRequest { pickupLocation: UberLocation; dropoffLocation: UberLocation; productId: string; }

export class UberApiClient {
  setCredentials(_k: string, _c: string): void {}
  async getProducts(_lat: number, _lng: number): Promise<UberProduct[]> { return []; }
  async getRideEstimates(_p: UberLocation, _d: UberLocation): Promise<UberRideEstimate[]> { return []; }
  async requestRide(_r: UberRideRequest): Promise<{ requestId: string }> { return { requestId: '' }; }
  getUberAppDeepLink(_p: UberLocation, _d: UberLocation): string { return 'https://m.uber.com/'; }
}
export const uberApiClient = new UberApiClient();
