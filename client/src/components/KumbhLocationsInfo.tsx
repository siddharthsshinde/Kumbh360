import React from 'react';
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Clock, Calendar, Info } from "lucide-react";
import { Badge } from "./ui/badge";

interface KumbhLocation {
  id: number;
  name: string;
  description: string;
  history: string;
  timings: {
    opening: string;
    closing: string;
    specialEvents?: string[];
  };
  currentStatus: string;
  lastUpdated: string;
}

export function KumbhLocationsInfo() {
  const { data: locations, isLoading } = useQuery<KumbhLocation[]>({
    queryKey: ["/api/kumbh-locations"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="w-full bg-white shadow-md p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF7F00]" />
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-md mb-4">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-[#FF7F00]">
          <span className="mr-2">🏯</span>
          Sacred Sites of Kumbh Mela
        </h2>

        <Tabs defaultValue={locations?.[0]?.name.toLowerCase() ?? "ramkund"}>
          <TabsList className="w-full flex overflow-x-auto pb-1 mb-2">
            {locations?.map((location) => (
              <TabsTrigger 
                key={location.id} 
                value={location.name.toLowerCase()}
                className="flex-1"
              >
                {location.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {locations?.map((location) => (
            <TabsContent 
              key={location.id} 
              value={location.name.toLowerCase()} 
              className="mt-2"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{location.name}</h3>
                  <Badge 
                    variant={location.currentStatus.includes("OVERCROWDED") ? "destructive" : 
                            location.currentStatus.includes("CROWDED") ? "secondary" : "default"}
                  >
                    {location.currentStatus}
                  </Badge>
                </div>

                <div className="text-sm space-y-2">
                  <p className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    {location.description}
                  </p>

                  <p className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    Open: {location.timings.opening} - {location.timings.closing}
                  </p>

                  {location.timings.specialEvents && (
                    <div className="mt-2">
                      <p className="font-medium text-[#FF7F00] mb-1">Special Events:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {location.timings.specialEvents.map((event, index) => (
                          <li key={index}>{event}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="font-medium text-[#FF7F00] mb-1">Historical Significance:</p>
                    <p className="text-gray-600">{location.history}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Last updated: {new Date(location.lastUpdated).toLocaleString()}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-xs text-gray-500 mt-4">
          <p>All these sacred sites will have special arrangements during Kumbh Mela 2025. 
             Crowd management systems will be in place. Please check the map for exact locations.</p>
        </div>
      </div>
    </Card>
  );
}