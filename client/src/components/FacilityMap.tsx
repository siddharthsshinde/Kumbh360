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
    refetchInterval: 10000, // Refresh every 10 seconds
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
    
    // Create heat layer with the data
    heatLayerRef.current = L.heatLayer(expandedHeatmapData, {
      radius: 35, // Size of each point in the heatmap
      blur: 30, // Blur effect
      maxZoom: 15, // Maximum zoom level for the heatmap
      max: 100, // Maximum possible intensity
      gradient: {
        0.0: '#3c0', // Green for low crowd
        0.3: '#FFA500', // Orange for moderate crowd
        0.6: '#F03E3E', // Red for high crowd
        0.8: '#7F0000'  // Dark red for very high crowd
      }
    }).addTo(heatmapRef.current);
    
    // Add location markers to heatmap for reference
    Object.entries(locationCoordinates).forEach(([location, coordinates]) => {
      const crowdLevel = crowdLevels.find(level => level.location === location);
      
      if (crowdLevel) {
        // Create a marker with popup showing crowd info
        L.marker(coordinates as [number, number], {
          icon: L.divIcon({
            className: 'crowd-marker',
            html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 ${
              crowdLevel.status === 'overcrowded' ? 'border-red-600' :
              crowdLevel.status === 'crowded' ? 'border-orange-500' :
              crowdLevel.status === 'moderate' ? 'border-yellow-500' :
              'border-green-500'
            } text-xs font-bold">
              ${Math.round((crowdLevel.currentCount / crowdLevel.capacity) * 100)}%
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        }).addTo(heatmapRef.current!)
        .bindPopup(`
          <div class="text-sm p-1">
            <h3 class="font-bold text-[#FF7F00]">${location}</h3>
            <p><b>Status:</b> <span class="${
              crowdLevel.status === 'overcrowded' ? 'text-red-600 font-bold' :
              crowdLevel.status === 'crowded' ? 'text-orange-500 font-bold' :
              crowdLevel.status === 'moderate' ? 'text-yellow-600' :
              'text-green-600'
            }">${crowdLevel.status.toUpperCase()}</span></p>
            <p><b>Current:</b> ${crowdLevel.currentCount.toLocaleString()}</p>
            <p><b>Capacity:</b> ${crowdLevel.capacity.toLocaleString()}</p>
            <p class="mt-2 text-xs border-t pt-1 text-gray-700">${crowdLevel.recommendations}</p>
          </div>
        `);
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
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Crowd Density</div>
              <div className="flex items-center gap-1">
                <div className="flex items-center text-xs">
                  <span className="inline-block w-3 h-3 rounded-full mr-1 bg-green-500"></span>
                  Low
                </div>
                <div className="flex items-center text-xs">
                  <span className="inline-block w-3 h-3 rounded-full mr-1 bg-yellow-500"></span>
                  Moderate
                </div>
                <div className="flex items-center text-xs">
                  <span className="inline-block w-3 h-3 rounded-full mr-1 bg-orange-500"></span>
                  High
                </div>
                <div className="flex items-center text-xs">
                  <span className="inline-block w-3 h-3 rounded-full mr-1 bg-red-600"></span>
                  Very High
                </div>
              </div>
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-600">
              <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
              <span>Click on markers to see real-time crowd information at each location</span>
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