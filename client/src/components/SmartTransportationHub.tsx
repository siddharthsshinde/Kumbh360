import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Bus, Car, MapPin, ParkingCircle, Clock, Users, CreditCard, 
  ChevronRight, Loader2, IndianRupee, AlertTriangle, CheckCircle2
} from 'lucide-react';

interface ShuttleLocation {
  id: string;
  routeName: string;
  currentLocation: string;
  nextStop: string;
  estimatedArrival: string;
  capacity: string;
  status: "on-time" | "delayed" | "crowded";
  coordinates: { lat: number; lng: number };
}

interface ParkingLocation {
  id: string;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
  coordinates: { lat: number; lng: number };
  hourlyRate: number;
  distance: number; // distance to nearest major site in km
}

interface CarpoolListing {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  pricePerSeat: number;
  driverName: string;
  driverRating: number;
  vehicleInfo: string;
}

// Mock parking data - in a real app, this would come from an API
const PARKING_LOCATIONS: ParkingLocation[] = [
  {
    id: "P1",
    name: "Ramkund Central Parking",
    totalSpaces: 200,
    availableSpaces: 45,
    coordinates: { lat: 20.0059, lng: 73.7913 },
    hourlyRate: 50,
    distance: 0.3
  },
  {
    id: "P2",
    name: "Panchavati Parking Complex",
    totalSpaces: 350,
    availableSpaces: 120,
    coordinates: { lat: 20.0064, lng: 73.7904 },
    hourlyRate: 40,
    distance: 0.8
  },
  {
    id: "P3",
    name: "Tapovan Visitor Parking",
    totalSpaces: 150,
    availableSpaces: 30,
    coordinates: { lat: 20.0116, lng: 73.7938 },
    hourlyRate: 60,
    distance: 0.5
  },
  {
    id: "P4",
    name: "Godavari Riverside Parking",
    totalSpaces: 250,
    availableSpaces: 180,
    coordinates: { lat: 19.9975, lng: 73.7765 },
    hourlyRate: 30,
    distance: 1.2
  }
];

// Mock carpool listings - in a real app, this would come from an API
const CARPOOL_LISTINGS: CarpoolListing[] = [
  {
    id: "C1",
    from: "Mumbai",
    to: "Nashik Ramkund",
    departureTime: "05:00 AM, March 23",
    seatsTotal: 4,
    seatsAvailable: 2,
    pricePerSeat: 500,
    driverName: "Suresh P.",
    driverRating: 4.8,
    vehicleInfo: "Maruti Swift, White"
  },
  {
    id: "C2",
    from: "Pune",
    to: "Nashik Tapovan",
    departureTime: "06:30 AM, March 24",
    seatsTotal: 6,
    seatsAvailable: 3,
    pricePerSeat: 450,
    driverName: "Priya M.",
    driverRating: 4.7,
    vehicleInfo: "Toyota Innova, Silver"
  },
  {
    id: "C3",
    from: "Nashik Railway Station",
    to: "Trimbakeshwar Temple",
    departureTime: "07:00 AM, Today",
    seatsTotal: 3,
    seatsAvailable: 1,
    pricePerSeat: 150,
    driverName: "Rajesh K.",
    driverRating: 4.9,
    vehicleInfo: "Honda City, Blue"
  },
  {
    id: "C4",
    from: "Nashik CBS",
    to: "Panchavati Circle",
    departureTime: "08:15 AM, Today",
    seatsTotal: 4,
    seatsAvailable: 4,
    pricePerSeat: 80,
    driverName: "Anita S.",
    driverRating: 4.6,
    vehicleInfo: "Hyundai i20, Red"
  }
];

const AUTO_FARE_BASE = 30; // Base fare in rupees
const AUTO_FARE_PER_KM = 15; // Per km fare in rupees

export function SmartTransportationHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("shuttle");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [distance, setDistance] = useState(0);
  const [passengerCount, setPassengerCount] = useState(1);
  const [waitingTime, setWaitingTime] = useState(0);
  const [nightCharge, setNightCharge] = useState(false);
  const [luggageCharge, setLuggageCharge] = useState(false);
  const [selectedParkingFilter, setParkingFilter] = useState("all");
  const [carpoolFilters, setCarpoolFilters] = useState({
    maxPrice: 1000,
    minSeats: 1,
    today: false
  });
  
  // Shuttle data from API
  const { data: shuttleLocations, isLoading: isLoadingShuttles } = useQuery<ShuttleLocation[]>({
    queryKey: ['/api/shuttle-locations'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const POPULAR_ROUTES = [
    { from: "Nashik Railway Station", to: "Ramkund", distance: 7.2 },
    { from: "CBS", to: "Panchavati", distance: 4.5 },
    { from: "Municipal Corporation", to: "Trimbakeshwar", distance: 28 },
    { from: "Tapovan", to: "Kalaram Temple", distance: 2.8 },
    { from: "Nashik Road", to: "Godavari Ghat", distance: 6.5 }
  ];

  const calculateAutoFare = () => {
    if (!distance) return 0;
    
    let fare = AUTO_FARE_BASE + (distance * AUTO_FARE_PER_KM);
    
    // Add waiting charge if any (₹5 per minute after first 5 minutes)
    if (waitingTime > 5) {
      fare += (waitingTime - 5) * 5;
    }
    
    // Add night charge (25% extra between 11pm and 5am)
    if (nightCharge) {
      fare *= 1.25;
    }
    
    // Add luggage charge
    if (luggageCharge) {
      fare += 30;
    }
    
    // Additional passenger charge
    if (passengerCount > 3) {
      fare += (passengerCount - 3) * 10;
    }
    
    return Math.ceil(fare);
  };

  const handleRouteSelect = (routeString: string) => {
    const route = POPULAR_ROUTES.find(r => 
      `${r.from} to ${r.to}` === routeString
    );
    
    if (route) {
      setFromLocation(route.from);
      setToLocation(route.to);
      setDistance(route.distance);
    }
  };

  const handleBookCarpool = (carpoolId: string) => {
    toast({
      title: "Booking Request Sent",
      description: "The driver will confirm your request shortly.",
      variant: "default"
    });
  };

  // Filter parking locations based on selection
  const filteredParkingLocations = PARKING_LOCATIONS.filter(location => {
    if (selectedParkingFilter === "all") return true;
    if (selectedParkingFilter === "available" && location.availableSpaces > 0) return true;
    if (selectedParkingFilter === "nearby" && location.distance <= 1) return true;
    if (selectedParkingFilter === "affordable" && location.hourlyRate <= 40) return true;
    return false;
  });

  // Filter carpool listings based on selections
  const filteredCarpoolListings = CARPOOL_LISTINGS.filter(listing => {
    if (listing.pricePerSeat > carpoolFilters.maxPrice) return false;
    if (listing.seatsAvailable < carpoolFilters.minSeats) return false;
    if (carpoolFilters.today && !listing.departureTime.includes("Today")) return false;
    return true;
  });

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-[#FF7F00]">
          <Bus className="h-6 w-6" />
          Smart Transportation Hub
        </CardTitle>
        <CardDescription>
          All your transportation needs in one place - track shuttles, find parking, calculate fares, and join carpools
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="shuttle">
              <Bus className="h-4 w-4 mr-2 hidden sm:inline" />
              Shuttles
            </TabsTrigger>
            <TabsTrigger value="parking">
              <ParkingCircle className="h-4 w-4 mr-2 hidden sm:inline" />
              Parking
            </TabsTrigger>
            <TabsTrigger value="autofare">
              <IndianRupee className="h-4 w-4 mr-2 hidden sm:inline" />
              Auto Fare
            </TabsTrigger>
            <TabsTrigger value="carpool">
              <Car className="h-4 w-4 mr-2 hidden sm:inline" />
              Carpools
            </TabsTrigger>
          </TabsList>

          {/* Real-time Shuttle Tracking Tab */}
          <TabsContent value="shuttle" className="space-y-4">
            <div className="mb-4 p-3 bg-orange-50 rounded-lg text-sm">
              <div className="flex gap-2 items-center">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Live shuttle updates every 30 seconds</span>
              </div>
            </div>
            
            {isLoadingShuttles ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF7F00]" />
              </div>
            ) : (
              <div className="space-y-3">
                {shuttleLocations?.map(shuttle => (
                  <div 
                    key={shuttle.id} 
                    className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold flex items-center gap-1.5">
                          <Bus className="h-4 w-4 text-[#FF7F00]" /> 
                          {shuttle.routeName}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-blue-600" /> 
                            <span>Current: <span className="font-medium">{shuttle.currentLocation}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ChevronRight className="h-3.5 w-3.5 text-blue-600" /> 
                            <span>Next: <span className="font-medium">{shuttle.nextStop}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-blue-600" /> 
                            <span>ETA: <span className="font-medium">{shuttle.estimatedArrival}</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={
                          shuttle.status === 'on-time' ? 'outline' :
                          shuttle.status === 'delayed' ? 'destructive' : 'secondary'
                        }>
                          {shuttle.status}
                        </Badge>
                        <div className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
                          {shuttle.capacity} full
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-2 text-center">
                  <Button variant="link" className="text-[#FF7F00]">
                    View All Routes
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Parking Space Availability Tab */}
          <TabsContent value="parking" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Available Parking Spaces</h3>
              <Select 
                value={selectedParkingFilter} 
                onValueChange={setParkingFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter spaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="available">Available Now</SelectItem>
                  <SelectItem value="nearby">Nearby (less than 1km)</SelectItem>
                  <SelectItem value="affordable">Affordable (under ₹40/hr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              {filteredParkingLocations.map(parking => (
                <div 
                  key={parking.id} 
                  className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold flex items-center gap-1.5">
                        <ParkingCircle className="h-4 w-4 text-[#FF7F00]" /> 
                        {parking.name}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-blue-600" /> 
                          <span>{parking.distance} km to nearest site</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IndianRupee className="h-3.5 w-3.5 text-blue-600" /> 
                          <span>₹{parking.hourlyRate}/hour</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        parking.availableSpaces > parking.totalSpaces * 0.3 ? 'text-green-600' :
                        parking.availableSpaces > 0 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {parking.availableSpaces}
                      </div>
                      <div className="text-xs text-gray-600">
                        of {parking.totalSpaces} spaces
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        disabled={parking.availableSpaces === 0}
                      >
                        Reserve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Auto Rickshaw Fare Calculator Tab */}
          <TabsContent value="autofare" className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-lg">
              <h3 className="font-medium flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-amber-600" />
                Auto-Rickshaw Fare Calculator
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Calculate the expected fare based on distance and other factors
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="route-select">Choose a popular route:</Label>
                <Select 
                  onValueChange={handleRouteSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_ROUTES.map((route, index) => (
                      <SelectItem 
                        key={index} 
                        value={`${route.from} to ${route.to}`}
                      >
                        {route.from} to {route.to} ({route.distance} km)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-location">From:</Label>
                  <Input 
                    id="from-location"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    placeholder="Starting location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-location">To:</Label>
                  <Input 
                    id="to-location"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    placeholder="Destination"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km):</Label>
                <Input 
                  id="distance"
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={0.1}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="passengers">Passengers:</Label>
                  <span className="text-sm text-gray-600">{passengerCount}</span>
                </div>
                <Slider 
                  id="passengers"
                  min={1}
                  max={6}
                  step={1}
                  value={[passengerCount]}
                  onValueChange={(value) => setPassengerCount(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="waiting-time">Waiting time (minutes):</Label>
                  <span className="text-sm text-gray-600">{waitingTime} min</span>
                </div>
                <Slider 
                  id="waiting-time"
                  min={0}
                  max={30}
                  step={1}
                  value={[waitingTime]}
                  onValueChange={(value) => setWaitingTime(value[0])}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="night-charge"
                      checked={nightCharge}
                      onCheckedChange={setNightCharge}
                    />
                    <Label htmlFor="night-charge">Night charge (11pm-5am)</Label>
                  </div>
                  {nightCharge && <Badge variant="outline">+25%</Badge>}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="luggage-charge"
                      checked={luggageCharge}
                      onCheckedChange={setLuggageCharge}
                    />
                    <Label htmlFor="luggage-charge">Heavy luggage</Label>
                  </div>
                  {luggageCharge && <Badge variant="outline">+₹30</Badge>}
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Estimated Fare:</div>
                  <div className="text-xs text-gray-500">Per meter charge: ₹{AUTO_FARE_PER_KM}/km</div>
                </div>
                <div className="text-2xl font-bold text-[#FF7F00]">
                  ₹{calculateAutoFare()}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Carpool Matching Service Tab */}
          <TabsContent value="carpool" className="space-y-4">
            <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm">
              <div className="flex gap-2 items-center">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium">Share rides, save money, reduce congestion</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="space-y-1">
                <Label htmlFor="max-price">Max price per seat:</Label>
                <div className="flex items-center space-x-2">
                  <IndianRupee className="h-4 w-4 text-gray-500" />
                  <Select 
                    value={carpoolFilters.maxPrice.toString()}
                    onValueChange={(val) => setCarpoolFilters({
                      ...carpoolFilters,
                      maxPrice: parseInt(val)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">Any price</SelectItem>
                      <SelectItem value="100">Up to ₹100</SelectItem>
                      <SelectItem value="200">Up to ₹200</SelectItem>
                      <SelectItem value="500">Up to ₹500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="min-seats">Minimum seats needed:</Label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <Select 
                    value={carpoolFilters.minSeats.toString()}
                    onValueChange={(val) => setCarpoolFilters({
                      ...carpoolFilters,
                      minSeats: parseInt(val)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any seats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+ seat</SelectItem>
                      <SelectItem value="2">2+ seats</SelectItem>
                      <SelectItem value="3">3+ seats</SelectItem>
                      <SelectItem value="4">4+ seats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 self-end">
                <Switch 
                  id="today-only"
                  checked={carpoolFilters.today}
                  onCheckedChange={(checked) => setCarpoolFilters({
                    ...carpoolFilters,
                    today: checked
                  })}
                />
                <Label htmlFor="today-only">Today's rides only</Label>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredCarpoolListings.length > 0 ? (
                filteredCarpoolListings.map(carpool => (
                  <div 
                    key={carpool.id} 
                    className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{carpool.from} to {carpool.to}</h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-green-600" /> 
                            <span>{carpool.departureTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-green-600" /> 
                            <span>{carpool.seatsAvailable} of {carpool.seatsTotal} seats available</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Car className="h-3.5 w-3.5 text-green-600" /> 
                            <span>{carpool.vehicleInfo}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center">
                              <span className="font-medium mr-1">{carpool.driverName}</span>
                              <span className="text-yellow-500">★</span>
                              <span className="text-xs ml-1">{carpool.driverRating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center sm:items-end justify-center gap-2">
                        <div className="text-lg font-bold text-[#FF7F00]">
                          ₹{carpool.pricePerSeat}
                          <span className="text-xs font-normal text-gray-600">/seat</span>
                        </div>
                        <Button 
                          onClick={() => handleBookCarpool(carpool.id)}
                          disabled={carpool.seatsAvailable === 0}
                          className="w-full sm:w-auto"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Book Seat
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-medium">No matching carpools</h3>
                  <p className="text-sm text-gray-600 mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <Button variant="outline" className="mt-2">
                <Car className="h-4 w-4 mr-2" />
                Offer a Ride
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 text-sm text-gray-600 flex justify-between rounded-b-lg">
        <div className="flex items-center">
          <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
          Real-time data updated regularly
        </div>
        <Button variant="link" className="text-[#FF7F00] p-0">
          Transportation Help
        </Button>
      </CardFooter>
    </Card>
  );
}