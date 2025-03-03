import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Bus, IndianRupee, Timer } from 'lucide-react';

interface ShuttleLocation {
  id: string;
  routeName: string;
  currentLocation: string;
  nextStop: string;
  estimatedArrival: string;
  capacity: string;
  status: "on-time" | "delayed" | "crowded";
}

interface RestRoom {
  id: string;
  location: string;
  nearestStop: string;
  status: "operational" | "maintenance" | "closed";
  accessibility: boolean;
}

const FARE_PER_KM = 5; // Base fare in rupees per kilometer
const EMERGENCY_NUMBERS = {
  "Medical Emergency Transport": "108",
  "Police Emergency Transport": "100",
  "Kumbh Special Helpline": "1098",
  "Women's Safety Helpline": "1090"
};

const MAJOR_ROUTES = [
  { id: "R1", name: "Nashik Road → Ramkund", distance: 7 },
  { id: "R2", name: "CBS → Tapovan", distance: 5 },
  { id: "R3", name: "Municipal Corp → Trimbakeshwar", distance: 15 },
  { id: "R4", name: "Panchavati → Someshwar", distance: 8 }
];

export function EmergencyTransport() {
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [passengerCount, setPassengerCount] = useState<number>(1);

  const { data: shuttleLocations, isLoading: isLoadingShuttles } = useQuery<ShuttleLocation[]>({
    queryKey: ['/api/shuttle-locations'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: restrooms, isLoading: isLoadingRestrooms } = useQuery<RestRoom[]>({
    queryKey: ['/api/restrooms'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const calculateFare = (routeId: string, passengers: number) => {
    const route = MAJOR_ROUTES.find(r => r.id === routeId);
    if (!route) return 0;
    return Math.ceil(route.distance * FARE_PER_KM * (passengers > 3 ? 0.9 : 1)); // 10% discount for groups > 3
  };

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-xl font-semibold text-[#FF7F00] flex items-center gap-2">
        <Bus className="h-6 w-6" />
        Emergency Transportation Hub
      </h2>

      {/* Fare Calculator */}
      <div className="space-y-2 border-b pb-4">
        <h3 className="font-medium flex items-center gap-2">
          <IndianRupee className="h-4 w-4" />
          Quick Fare Calculator
        </h3>
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedRoute} onValueChange={setSelectedRoute}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select route" />
            </SelectTrigger>
            <SelectContent>
              {MAJOR_ROUTES.map(route => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={passengerCount}
            onChange={(e) => setPassengerCount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="w-[100px]"
            placeholder="Passengers"
          />
          <div className="flex items-center gap-2 text-lg">
            <span>Fare: ₹{calculateFare(selectedRoute, passengerCount)}</span>
          </div>
        </div>
      </div>

      {/* Live Shuttle Tracking */}
      <div className="space-y-2 border-b pb-4">
        <h3 className="font-medium flex items-center gap-2">
          <Timer className="h-4 w-4" />
          Live Shuttle Status
        </h3>
        {isLoadingShuttles ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-2">
            {shuttleLocations?.map(shuttle => (
              <div key={shuttle.id} className="bg-gray-50 p-2 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{shuttle.routeName}</p>
                    <p className="text-sm text-gray-600">Current: {shuttle.currentLocation}</p>
                    <p className="text-sm text-gray-600">Next: {shuttle.nextStop}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-sm ${
                    shuttle.status === 'on-time' ? 'bg-green-100 text-green-700' :
                    shuttle.status === 'delayed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {shuttle.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restroom Locations */}
      <div className="space-y-2 border-b pb-4">
        <h3 className="font-medium">Public Restrooms</h3>
        {isLoadingRestrooms ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-2">
            {restrooms?.map(restroom => (
              <div key={restroom.id} className="bg-gray-50 p-2 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{restroom.location}</p>
                    <p className="text-sm text-gray-600">Near: {restroom.nearestStop}</p>
                    {restroom.accessibility && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Wheelchair Accessible
                      </span>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-sm ${
                    restroom.status === 'operational' ? 'bg-green-100 text-green-700' :
                    restroom.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {restroom.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Contact Numbers */}
      <div className="space-y-2">
        <h3 className="font-medium">Emergency Transport Contacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(EMERGENCY_NUMBERS).map(([service, number]) => (
            <div key={service} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
              <span>{service}</span>
              <Button variant="link" className="text-[#FF7F00]" onClick={() => {
                window.open(`tel:${number}`, '_self')
              }}>
                {number}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
