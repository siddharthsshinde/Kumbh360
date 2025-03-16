import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import type { Facility, CrowdLevel } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { AlertTriangle, MapPin, Users } from "lucide-react";

type FacilityType = "holy_site" | "hospital" | "hotel" | "temple" | "shuttle_stop" | "restroom";

// Custom icon function
const createCustomIcon = (type: string) => {
  const iconColors: Record<FacilityType, string> = {
    holy_site: "#FF7F00", // Saffron for temples and holy sites
    hospital: "#FF0000", // Red for hospitals
    hotel: "#138808", // Green for hotels
    temple: "#FF7F00", // Saffron for temples
    shuttle_stop: "#0000FF", // Blue for shuttle stops
    restroom: "#800080", // Purple for restrooms
  };

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${iconColors[type as FacilityType] || '#000080'}; 
                      width: 12px; 
                      height: 12px; 
                      border-radius: 50%; 
                      border: 2px solid white;
                      box-shadow: 0 0 4px rgba(0,0,0,0.5);">
           </div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

export function FacilityMap() {
  // For all maps
  const [activeMap, setActiveMap] = useState<'facilities' | 'heatmap'>('facilities');
  
  // For facilities map
  const mapRef = useRef<L.Map | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLElement | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // For heatmap
  const heatmapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  const [heatmapContainer, setHeatmapContainer] = useState<HTMLElement | null>(null);
  
  // Queries
  const { data: facilities } = useQuery<Facility[]>({
    queryKey: ["/api/facilities"],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: shuttles } = useQuery({
    queryKey: ["/api/shuttle-locations"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: restrooms } = useQuery({
    queryKey: ["/api/restrooms"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: crowdLevels, isLoading: crowdLoading } = useQuery<CrowdLevel[]>({
    queryKey: ["/api/crowd-levels"],
    refetchInterval: 300000, // Refresh every 5 minutes (300,000 ms)
  });

  // Initialize facilities map when container is ready
  useEffect(() => {
    if (!mapContainer) return;

    if (!mapRef.current) {
      // Center on Ramkund, Nashik
      mapRef.current = L.map(mapContainer).setView([20.0059, 73.7913], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapContainer]);

  // Initialize heatmap when container is ready
  useEffect(() => {
    if (!heatmapContainer) return;

    if (!heatmapRef.current) {
      // Center on Ramkund, Nashik
      heatmapRef.current = L.map(heatmapContainer).setView([20.0059, 73.7913], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
      }).addTo(heatmapRef.current);
    }

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.remove();
        heatmapRef.current = null;
      }
    };
  }, [heatmapContainer]);

  // Update the heatmap based on crowd levels
  useEffect(() => {
    if (!heatmapRef.current || !crowdLevels || crowdLevels.length === 0) return;

    // Remove existing heat layer if it exists
    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
    }

    // Get location coordinates for each location
    const locationCoordinates: Record<string, [number, number]> = {
      "Ramkund": [20.0059, 73.7913],
      "Kalaram Temple": [20.0064, 73.7904],
      "Tapovan": [20.0116, 73.7938],
      "Godavari Ghat": [20.0030, 73.7900],
      "Trimbakeshwar": [19.9322, 73.5309]
    };

    // Create heatmap data points with intensity based on crowd levels
    const heatmapData = crowdLevels.map(level => {
      const coordinates = locationCoordinates[level.location];
      if (!coordinates) return null;
      
      // Calculate intensity based on level.currentCount / level.capacity
      const ratio = level.currentCount / level.capacity;
      const intensity = ratio * 100; // Scale for better visualization
      
      return [
        coordinates[0], 
        coordinates[1], 
        intensity
      ] as [number, number, number];
    }).filter(Boolean) as [number, number, number][];

    // Add some surrounding points to create a more natural heatmap effect
    const expandedHeatmapData = [...heatmapData];
    
    // For each main point, add some surrounding points with lower intensity
    heatmapData.forEach(point => {
      const [lat, lng, intensity] = point;
      // Add 5-10 surrounding points with decreasing intensity
      for (let i = 0; i < 8; i++) {
        const offset = 0.002 * Math.random(); // Random offset within ~200m
        const direction = Math.random() * Math.PI * 2; // Random direction
        const newLat = lat + Math.sin(direction) * offset;
        const newLng = lng + Math.cos(direction) * offset;
        const newIntensity = intensity * (0.3 + Math.random() * 0.4); // 30-70% of original intensity
        
        expandedHeatmapData.push([newLat, newLng, newIntensity]);
      }
    });

    // Add key landmarks with fixed lower intensity to ensure visibility
    facilities?.forEach(facility => {
      if (facility.type === 'holy_site' || facility.type === 'temple') {
        expandedHeatmapData.push([
          facility.location.lat,
          facility.location.lng,
          5 // Base intensity to ensure visibility
        ]);
      }
    });
    
    // Create heat layer with the data - improved visual aesthetics
    heatLayerRef.current = L.heatLayer(expandedHeatmapData, {
      radius: 45, // Increased size of each point in the heatmap
      blur: 35, // Increased blur effect for smoother transitions
      maxZoom: 15, // Maximum zoom level for the heatmap
      max: 120, // Increased max intensity for more vibrant colors
      gradient: {
        0.0: '#4ade80', // Bright green for very low crowd
        0.2: '#22c55e', // Medium green for low crowd
        0.4: '#f59e0b', // Amber for moderate crowd
        0.6: '#f97316', // Orange for medium-high crowd
        0.75: '#ef4444', // Red for high crowd
        0.85: '#b91c1c', // Dark red for very high crowd
        0.95: '#7f1d1d'  // Deep red for critical crowding
      }
    }).addTo(heatmapRef.current);
    
    // Add location markers to heatmap for reference
    Object.entries(locationCoordinates).forEach(([location, coordinates]) => {
      const crowdLevel = crowdLevels.find(level => level.location === location);
      
      if (crowdLevel) {
        // Create a marker with popup showing crowd info - enhanced visuals
        const crowdPercentage = Math.round((crowdLevel.currentCount / crowdLevel.capacity) * 100);
        const statusColor = 
          crowdLevel.status === 'overcrowded' ? '#b91c1c' :
          crowdLevel.status === 'crowded' ? '#f97316' :
          crowdLevel.status === 'moderate' ? '#f59e0b' :
          '#22c55e';
        
        L.marker(coordinates as [number, number], {
          icon: L.divIcon({
            className: 'crowd-marker',
            html: `
              <div class="flex items-center justify-center relative">
                <div class="absolute -z-10 w-10 h-10 rounded-full bg-white opacity-70"></div>
                <div class="flex items-center justify-center w-9 h-9 rounded-full border-3 shadow-lg" 
                  style="background: linear-gradient(135deg, white, ${statusColor}20); border-color: ${statusColor};">
                  <div class="text-xs font-bold" style="color: ${statusColor}; text-shadow: 0 0 2px white;">
                    ${crowdPercentage}%
                  </div>
                </div>
                ${crowdLevel.status === 'overcrowded' || crowdLevel.status === 'crowded' ? 
                  `<div class="absolute -top-1 -right-1 animate-pulse">
                    <span class="relative flex h-3 w-3">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>` 
                : ''}
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          })
        }).addTo(heatmapRef.current!)
        .bindPopup(`
          <div class="text-sm p-2">
            <h3 class="font-bold text-[#FF7F00] text-base border-b pb-1 mb-2">${location}</h3>
            <div class="grid grid-cols-2 gap-y-2 mb-2">
              <div class="font-medium">Status:</div>
              <div class="font-semibold ${
                crowdLevel.status === 'overcrowded' ? 'text-red-600' :
                crowdLevel.status === 'crowded' ? 'text-orange-500' :
                crowdLevel.status === 'moderate' ? 'text-yellow-600' :
                'text-green-600'
              }">${crowdLevel.status.toUpperCase()}</div>
              
              <div class="font-medium">Current:</div>
              <div class="font-semibold">${crowdLevel.currentCount.toLocaleString()}</div>
              
              <div class="font-medium">Capacity:</div>
              <div class="font-semibold">${crowdLevel.capacity.toLocaleString()}</div>
              
              <div class="font-medium">Density:</div>
              <div class="font-semibold">${crowdPercentage}%</div>
            </div>
            
            <div class="bg-amber-50 p-2 rounded-md border border-amber-200 mt-2 text-xs text-amber-800">
              <div class="font-medium mb-1">Recommendations:</div>
              ${crowdLevel.recommendations}
            </div>
            
            <div class="text-center text-xs text-gray-500 mt-2">
              Updates every 5 minutes
            </div>
          </div>
        `, {
          className: 'crowd-popup',
          maxWidth: 300
        });
      }
    });
    
  }, [crowdLevels, facilities, heatmapRef]);

  // Add markers when data is available
  useEffect(() => {
    if (!mapRef.current || !facilities) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add facility markers
    facilities.forEach((facility) => {
      if (selectedType && facility.type !== selectedType) return;

      const marker = L.marker(
        [facility.location.lat, facility.location.lng],
        { icon: createCustomIcon(facility.type) }
      )
        .addTo(mapRef.current!)
        .bindPopup(
          `<b>${facility.name}</b><br>${facility.address}<br>${
            facility.contact ? `Contact: ${facility.contact}` : ""
          }`
        );
      markersRef.current.push(marker);
    });

  // Add shuttle markers
  shuttles?.forEach((shuttle) => {
    if (selectedType && selectedType !== 'shuttle_stop') return;

    const marker = L.marker(
      [shuttle.coordinates.lat, shuttle.coordinates.lng],
      { icon: createCustomIcon('shuttle_stop') }
    )
      .addTo(mapRef.current!)
      .bindPopup(
        `<div class="text-sm">
          <h3 class="font-bold text-blue-600">${shuttle.routeName}</h3>
          <p><b>Current:</b> ${shuttle.currentLocation}</p>
          <p><b>Next:</b> ${shuttle.nextStop}</p>
          <p><b>Arrival:</b> ${shuttle.estimatedArrival}</p>
          <p><b>Capacity:</b> ${shuttle.capacity}</p>
          <p class="mt-1"><span class="px-2 py-1 rounded text-xs ${
            shuttle.status === 'on-time' ? 'bg-green-100 text-green-700' :
            shuttle.status === 'delayed' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }">${shuttle.status}</span></p>
        </div>`
      );
    markersRef.current.push(marker);
  });

  // Add restroom markers
  restrooms?.forEach((restroom) => {
    if (selectedType && selectedType !== 'restroom') return;

    const marker = L.marker(
      [restroom.coordinates.lat, restroom.coordinates.lng],
      { icon: createCustomIcon('restroom') }
    )
      .addTo(mapRef.current!)
      .bindPopup(
        `<div class="text-sm">
          <h3 class="font-bold text-purple-600">Public Restroom</h3>
          <p><b>Location:</b> ${restroom.location}</p>
          <p><b>Nearest Stop:</b> ${restroom.nearestStop}</p>
          <p class="mt-1"><span class="px-2 py-1 rounded text-xs ${
            restroom.status === 'operational' ? 'bg-green-100 text-green-700' :
            restroom.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }">${restroom.status}</span></p>
          <div class="mt-2">
            ${restroom.facilities.map(f => 
              `<span class="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs mr-1 mb-1">${f}</span>`
            ).join('')}
          </div>
        </div>`
      );
    markersRef.current.push(marker);
  });

  }, [facilities, shuttles, restrooms, selectedType]);

  const facilityTypes = [
    ...new Set([
      ...(facilities?.map(f => f.type) || []),
      'shuttle_stop',
      'restroom'
    ])
  ];

  const handleFilterClick = (type: string | null) => {
    setSelectedType(type === selectedType ? null : type);
  };

  // Helper function to get human-readable type names
  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      holy_site: "Holy Sites",
      hospital: "Hospitals",
      hotel: "Hotels",
      temple: "Temples",
      shuttle_stop: "Shuttle Stops",
      restroom: "Restrooms"
    };
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Helper function to get icon color for legend
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      holy_site: "#FF7F00",
      hospital: "#FF0000",
      hotel: "#138808",
      temple: "#FF7F00",
      shuttle_stop: "#0000FF",
      restroom: "#800080"
    };
    return colors[type] || "#000080";
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md mb-8">
      <div className="p-3 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold text-[#FF7F00] flex items-center">
          <span className="mr-2">🗺️</span>
          Kumbh Mela Map
        </h2>
        
        <Tabs value={activeMap} className="w-auto" onValueChange={(val) => setActiveMap(val as 'facilities' | 'heatmap')}>
          <TabsList className="grid grid-cols-2 w-[260px]">
            <TabsTrigger value="facilities" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Facilities</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Crowd Heatmap</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {activeMap === 'facilities' && (
        <>
          <div className="p-2 border-b flex flex-wrap gap-2">
            <button 
              className={`text-xs px-3 py-1 rounded-full ${selectedType === null ? 'bg-[#FF7F00] text-white' : 'bg-gray-200'}`}
              onClick={() => handleFilterClick(null)}
            >
              All
            </button>
            {facilityTypes.map(type => (
              <button 
                key={type}
                className={`text-xs px-3 py-1 rounded-full flex items-center ${selectedType === type ? 'bg-[#FF7F00] text-white' : 'bg-gray-200'}`}
                onClick={() => handleFilterClick(type)}
              >
                <span 
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: getTypeColor(type) }}
                ></span>
                {getTypeName(type)}
              </button>
            ))}
          </div>

          <div
            ref={setMapContainer}
            className="w-full h-[400px] rounded-b-lg z-0"
          />
        </>
      )}
      
      {activeMap === 'heatmap' && (
        <>
          <div className="p-2 border-b">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium mb-1">Crowd Density</div>
                <div className="flex items-center mt-1 text-xs text-gray-600">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                  <span>Click markers for details</span>
                </div>
              </div>
              
              {/* Enhanced gradient legend */}
              <div className="flex flex-col items-end">
                <div className="h-6 w-64 rounded-md mb-1" 
                  style={{ 
                    background: 'linear-gradient(to right, #4ade80, #22c55e, #f59e0b, #f97316, #ef4444, #b91c1c, #7f1d1d)'
                  }}>
                </div>
                <div className="w-64 flex justify-between text-[10px] text-gray-600 px-1">
                  <span>0%</span>
                  <span>20%</span>
                  <span>40%</span>
                  <span>60%</span>
                  <span>80%</span>
                  <span>100%</span>
                </div>
                <div className="w-64 flex justify-between text-[10px] mt-1 px-1">
                  <span className="bg-green-100 text-green-800 px-1 rounded">Safe</span>
                  <span className="bg-yellow-100 text-yellow-800 px-1 rounded">Moderate</span>
                  <span className="bg-orange-100 text-orange-800 px-1 rounded">Crowded</span>
                  <span className="bg-red-100 text-red-800 px-1 rounded">Critical</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100 text-blue-800">
              <Users className="h-3 w-3 mr-1" />
              <span>Data updates every 5 minutes. Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div
            ref={setHeatmapContainer}
            className="w-full h-[400px] rounded-b-lg z-0"
          />
        </>
      )}
    </div>
  );
}