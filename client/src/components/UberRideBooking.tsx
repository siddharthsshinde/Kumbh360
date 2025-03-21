import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Car, MapPin, Navigation, Clock, DollarSign, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uberApiClient, UberRideEstimate, UberLocation, UberProduct } from '../lib/uberApi';

interface UberRideBookingProps {
  className?: string;
}

export function UberRideBooking({ className }: UberRideBookingProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [step, setStep] = useState<'location' | 'ride-options' | 'confirmation'>('location');
  
  // Pickup and dropoff locations
  const [pickup, setPickup] = useState<UberLocation>({
    address: '',
    latitude: 0,
    longitude: 0
  });
  const [dropoff, setDropoff] = useState<UberLocation>({
    address: '',
    latitude: 0,
    longitude: 0
  });
  
  // Products and estimates
  const [products, setProducts] = useState<UberProduct[]>([]);
  const [estimates, setEstimates] = useState<UberRideEstimate[]>([]);
  const [selectedRide, setSelectedRide] = useState<string>('');
  
  // Nashik Kumbh Mela common locations for quick selection
  const COMMON_LOCATIONS = [
    {
      name: 'Ramkund',
      address: 'Ramkund, Panchavati, Nashik',
      latitude: 20.0059,
      longitude: 73.7913
    },
    {
      name: 'Nashik Railway Station',
      address: 'Nashik Railway Station, Nashik',
      latitude: 19.9947,
      longitude: 73.7777
    },
    {
      name: 'Trimbakeshwar Temple',
      address: 'Trimbakeshwar Temple, Trimbak',
      latitude: 19.9321,
      longitude: 73.5308
    },
    {
      name: 'Panchavati',
      address: 'Panchavati, Nashik',
      latitude: 20.0064,
      longitude: 73.7904
    },
    {
      name: 'Tapovan',
      address: 'Tapovan, Nashik',
      latitude: 20.0116,
      longitude: 73.7938
    },
    {
      name: 'Kalaram Temple',
      address: 'Kalaram Temple, Panchavati, Nashik',
      latitude: 19.9977,
      longitude: 73.7901
    }
  ];
  
  useEffect(() => {
    // Check if we already have the API key and client ID
    checkForCredentials();
  }, []);
  
  const checkForCredentials = async () => {
    try {
      // Check if we have environment variables for Uber API
      const uberApiKey = import.meta.env.VITE_UBER_API_KEY;
      const uberClientId = import.meta.env.VITE_UBER_CLIENT_ID;
      
      if (uberApiKey && uberClientId) {
        uberApiClient.setCredentials(uberApiKey, uberClientId);
        setHasCredentials(true);
      } else {
        // If not set, we'll need to request them
        setHasCredentials(false);
        requestCredentials();
      }
    } catch (error) {
      console.error('Error checking for Uber credentials:', error);
      setHasCredentials(false);
      requestCredentials();
    }
  };
  
  const requestCredentials = () => {
    toast({
      title: "Uber API credentials needed",
      description: "Please provide your Uber API key and client ID to enable ride booking",
      variant: "destructive"
    });
  };
  
  const handleLocationSelect = (locationType: 'pickup' | 'dropoff', locationName: string) => {
    const selectedLocation = COMMON_LOCATIONS.find(loc => loc.name === locationName);
    
    if (selectedLocation) {
      if (locationType === 'pickup') {
        setPickup({
          address: selectedLocation.address,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        });
      } else {
        setDropoff({
          address: selectedLocation.address,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        });
      }
    }
  };
  
  const getLocationCoordinates = async (address: string, type: 'pickup' | 'dropoff') => {
    // In a real app, you would use a geocoding service here
    // For demo, we'll use a simplified approach
    try {
      setIsLoading(true);
      
      // Try to match with common locations first
      const matchedLocation = COMMON_LOCATIONS.find(loc => 
        loc.name.toLowerCase().includes(address.toLowerCase()) || 
        loc.address.toLowerCase().includes(address.toLowerCase())
      );
      
      if (matchedLocation) {
        if (type === 'pickup') {
          setPickup({
            address: matchedLocation.address,
            latitude: matchedLocation.latitude,
            longitude: matchedLocation.longitude
          });
        } else {
          setDropoff({
            address: matchedLocation.address,
            latitude: matchedLocation.latitude,
            longitude: matchedLocation.longitude
          });
        }
      } else {
        // Use the center of Nashik as fallback with a small random offset for demo
        const offset = Math.random() * 0.01;
        const nashikCenter = {
          latitude: 19.9975 + offset,
          longitude: 73.7765 + offset
        };
        
        if (type === 'pickup') {
          setPickup({
            address,
            latitude: nashikCenter.latitude,
            longitude: nashikCenter.longitude
          });
        } else {
          setDropoff({
            address,
            latitude: nashikCenter.latitude,
            longitude: nashikCenter.longitude
          });
        }
        
        toast({
          title: "Using approximate location",
          description: "Exact coordinates not found - using an approximate location",
          variant: "default"
        });
      }
    } catch (error) {
      console.error(`Error getting ${type} coordinates:`, error);
      toast({
        title: "Location Error",
        description: `Could not find coordinates for ${address}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearchRides = async () => {
    if (!pickup.address || !dropoff.address) {
      toast({
        title: "Missing location",
        description: "Please enter both pickup and dropoff locations",
        variant: "destructive"
      });
      return;
    }
    
    if (!hasCredentials) {
      requestCredentials();
      return;
    }
    
    try {
      setIsLoading(true);
      
      // If this were a real implementation, you would call:
      // const productResults = await uberApiClient.getProducts(pickup.latitude, pickup.longitude);
      // const estimateResults = await uberApiClient.getRideEstimates(pickup, dropoff);
      
      // For demo purposes, we'll use mock data
      const mockProducts = [
        { id: 'uber-x', name: 'UberX', description: 'Affordable rides for 1-4 people', image: '/uber-x.png', capacity: 4 },
        { id: 'uber-xl', name: 'UberXL', description: 'Affordable rides for up to 6 people', image: '/uber-xl.png', capacity: 6 },
        { id: 'uber-comfort', name: 'Uber Comfort', description: 'Newer cars with extra legroom', image: '/uber-comfort.png', capacity: 4 },
        { id: 'uber-black', name: 'Uber Black', description: 'Premium rides in luxury cars', image: '/uber-black.png', capacity: 4 }
      ];
      
      const mockEstimates = [
        {
          productId: 'uber-x',
          name: 'UberX',
          estimatedDuration: 900, // 15 minutes
          estimatedDistance: 5.2,
          estimatedFare: {
            value: 145,
            currency: 'INR',
            displayAmount: '₹145-180'
          },
          surge: 1.0,
          image: '/uber-x.png',
          capacity: 4
        },
        {
          productId: 'uber-xl',
          name: 'UberXL',
          estimatedDuration: 900,
          estimatedDistance: 5.2,
          estimatedFare: {
            value: 210,
            currency: 'INR',
            displayAmount: '₹210-250'
          },
          surge: 1.0,
          image: '/uber-xl.png',
          capacity: 6
        },
        {
          productId: 'uber-comfort',
          name: 'Uber Comfort',
          estimatedDuration: 900,
          estimatedDistance: 5.2,
          estimatedFare: {
            value: 190,
            currency: 'INR',
            displayAmount: '₹190-230'
          },
          surge: 1.0,
          image: '/uber-comfort.png',
          capacity: 4
        },
        {
          productId: 'uber-black',
          name: 'Uber Black',
          estimatedDuration: 900,
          estimatedDistance: 5.2,
          estimatedFare: {
            value: 320,
            currency: 'INR',
            displayAmount: '₹320-380'
          },
          surge: 1.0,
          image: '/uber-black.png',
          capacity: 4
        }
      ];
      
      setProducts(mockProducts);
      setEstimates(mockEstimates);
      setStep('ride-options');
    } catch (error) {
      console.error('Error searching for rides:', error);
      toast({
        title: "Error searching rides",
        description: "Could not fetch ride options at this time",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectRide = (productId: string) => {
    setSelectedRide(productId);
  };
  
  const handleBookRide = () => {
    if (!selectedRide) {
      toast({
        title: "Select a ride",
        description: "Please select a ride option first",
        variant: "destructive"
      });
      return;
    }
    
    if (!hasCredentials) {
      requestCredentials();
      return;
    }
    
    // In a real app, you would now:
    // 1. Call the Uber API to request a ride
    // 2. Get back a ride request ID and status
    // 3. Redirect to the Uber app or provide booking confirmation
    
    // For our demo, we'll just show a confirmation and link to the Uber app
    const uberAppUrl = uberApiClient.getUberAppDeepLink(
      pickup.latitude,
      pickup.longitude,
      dropoff.latitude,
      dropoff.longitude,
      selectedRide
    );
    
    toast({
      title: "Ride Booked!",
      description: "Your Uber ride has been booked. Check your Uber app for details.",
      variant: "default"
    });
    
    // In a real app, you might open the Uber app here
    // window.open(uberAppUrl, '_blank');
    
    setStep('confirmation');
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };
  
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        {!hasCredentials && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm">
            <p className="text-yellow-800">
              To use Uber ride booking, you need to provide your Uber API credentials.
              Please contact the administrator to set up this feature.
            </p>
          </div>
        )}
        
        {step === 'location' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Book an Uber Ride</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="pickup">Pickup Location</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="pickup"
                    placeholder="Enter pickup location"
                    value={pickup.address}
                    onChange={(e) => setPickup({...pickup, address: e.target.value})}
                    className="flex-1"
                  />
                  <Select 
                    onValueChange={(value) => handleLocationSelect('pickup', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Choose location" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_LOCATIONS.map(loc => (
                        <SelectItem key={loc.name} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="dropoff">Dropoff Location</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="dropoff"
                    placeholder="Enter dropoff location"
                    value={dropoff.address}
                    onChange={(e) => setDropoff({...dropoff, address: e.target.value})}
                    className="flex-1"
                  />
                  <Select 
                    onValueChange={(value) => handleLocationSelect('dropoff', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Choose location" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_LOCATIONS.map(loc => (
                        <SelectItem key={loc.name} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4"
                onClick={handleSearchRides}
                disabled={isLoading || !pickup.address || !dropoff.address}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching for rides...
                  </>
                ) : (
                  <>
                    <Car className="mr-2 h-4 w-4" />
                    Find Available Rides
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {step === 'ride-options' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select a Ride</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStep('location')}
              >
                Change Locations
              </Button>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">{pickup.address}</span>
                </div>
                <div className="hidden sm:block text-orange-600">→</div>
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">{dropoff.address}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {estimates.map((estimate) => (
                <div 
                  key={estimate.productId}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRide === estimate.productId 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                  onClick={() => handleSelectRide(estimate.productId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Car className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <h4 className="font-medium">{estimate.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(estimate.estimatedDuration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{estimate.capacity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{estimate.estimatedFare.displayAmount}</div>
                    <div className="text-sm text-gray-600">{estimate.estimatedDistance} km</div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full mt-4"
              onClick={handleBookRide}
              disabled={!selectedRide}
            >
              Book {selectedRide && estimates.find(e => e.productId === selectedRide)?.name}
            </Button>
          </div>
        )}
        
        {step === 'confirmation' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Car className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold">Ride Booked!</h3>
            
            <p className="text-gray-600">
              Your Uber ride has been requested. You'll receive updates in the Uber app.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{pickup.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{dropoff.address}</span>
              </div>
              {selectedRide && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ride type:</span>
                  <span className="font-medium">
                    {estimates.find(e => e.productId === selectedRide)?.name}
                  </span>
                </div>
              )}
              {selectedRide && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated fare:</span>
                  <span className="font-medium">
                    {estimates.find(e => e.productId === selectedRide)?.estimatedFare.displayAmount}
                  </span>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <Button
                className="w-full"
                onClick={() => setStep('location')}
              >
                Book Another Ride
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}