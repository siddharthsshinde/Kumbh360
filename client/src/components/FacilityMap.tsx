import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import L from "leaflet";
import type { Map, TileLayer, HeatLayer, Layer, Marker, Polygon, Polyline } from "leaflet";
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
  // For auxiliary maps (toggle between density and area)
  const [showAuxiliaryMap, setShowAuxiliaryMap] = useState(false);
  const [auxiliaryMapType, setAuxiliaryMapType] = useState<'density' | 'area'>('density');
  
  // For facilities map
  const mapRef = useRef<L.Map | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLElement | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // For heatmap (integrated with the main map)
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  
  // For safety zones
  const safetyZonesRef = useRef<L.Circle[]>([]);
  const [showSafetyZones, setShowSafetyZones] = useState(true);
  
  // For density map
  const densityMapRef = useRef<L.Map | null>(null);
  const [densityMapContainer, setDensityMapContainer] = useState<HTMLElement | null>(null);
  
  // For area map
  const areaMapRef = useRef<L.Map | null>(null);
  const [areaMapContainer, setAreaMapContainer] = useState<HTMLElement | null>(null);
  
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

  // Toggle for showing or hiding heat layer
  const [showHeatLayer, setShowHeatLayer] = useState(true);

  // Initialize density map when container is ready
  useEffect(() => {
    if (!densityMapContainer) return;

    if (!densityMapRef.current) {
      // Center on Ramkund, Nashik
      densityMapRef.current = L.map(densityMapContainer).setView([20.0059, 73.7913], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
      }).addTo(densityMapRef.current);
    }

    return () => {
      if (densityMapRef.current) {
        densityMapRef.current.remove();
        densityMapRef.current = null;
      }
    };
  }, [densityMapContainer]);

  // Initialize area map when container is ready
  useEffect(() => {
    if (!areaMapContainer) return;

    if (!areaMapRef.current) {
      // Center on Ramkund, Nashik
      areaMapRef.current = L.map(areaMapContainer).setView([20.0059, 73.7913], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
      }).addTo(areaMapRef.current);
    }

    return () => {
      if (areaMapRef.current) {
        areaMapRef.current.remove();
        areaMapRef.current = null;
      }
    };
  }, [areaMapContainer]);

  // Update the area map
  useEffect(() => {
    if (!areaMapRef.current) return;

    // Define the different zones for Kumbh Mela
    const kumbhZones = [
      {
        name: "Main Ceremonial Area",
        center: [20.0059, 73.7913], // Centered at Ramkund
        points: [
          [20.0067, 73.7920],
          [20.0080, 73.7915],
          [20.0075, 73.7900],
          [20.0062, 73.7892],
          [20.0045, 73.7902],
          [20.0050, 73.7916]
        ],
        color: "#7c3aed", // violet-600
        status: "Busy"
      },
      {
        name: "Accommodation Zone",
        center: [20.0116, 73.7938], // Centered at Tapovan
        points: [
          [20.0130, 73.7950],
          [20.0145, 73.7940],
          [20.0140, 73.7925],
          [20.0125, 73.7920],
          [20.0105, 73.7930],
          [20.0110, 73.7945]
        ],
        color: "#ea580c", // orange-600
        status: "Available"
      },
      {
        name: "Parking & Transport Zone",
        center: [20.0030, 73.7900], // Near Godavari Ghat
        points: [
          [20.0040, 73.7910],
          [20.0050, 73.7905],
          [20.0045, 73.7890],
          [20.0030, 73.7880],
          [20.0020, 73.7885],
          [20.0025, 73.7900]
        ],
        color: "#0d9488", // teal-600
        status: "Available"
      },
      {
        name: "Restricted Area",
        center: [20.0064, 73.7904], // Near Kalaram Temple
        points: [
          [20.0070, 73.7910],
          [20.0075, 73.7905],
          [20.0070, 73.7895],
          [20.0060, 73.7890],
          [20.0055, 73.7895],
          [20.0060, 73.7905]
        ],
        color: "#dc2626", // red-600
        status: "Limited Access"
      }
    ];

    // Add polygons for each zone
    kumbhZones.forEach(zone => {
      // Create polygon with zone properties
      const polygon = L.polygon(zone.points, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.2,
        weight: 2
      }).addTo(areaMapRef.current!);

      // Add a label for each zone
      L.marker(zone.center, {
        icon: L.divIcon({
          className: 'area-label',
          html: `
            <div class="px-2 py-1 rounded-md text-white text-xs font-semibold shadow-md" 
                 style="background-color: ${zone.color}; white-space: nowrap;">
              ${zone.name}
            </div>
          `,
          iconSize: [100, 20],
          iconAnchor: [50, 10]
        })
      }).addTo(areaMapRef.current!);

      // Add popup with zone information
      polygon.bindPopup(`
        <div class="text-sm p-2">
          <h3 class="font-bold border-b pb-1 mb-2" style="color: ${zone.color}">${zone.name}</h3>
          <div class="grid grid-cols-2 gap-y-2 mb-2">
            <div class="font-medium">Status:</div>
            <div class="font-semibold">${zone.status}</div>
            
            <div class="font-medium">Size:</div>
            <div class="font-semibold">${(Math.random() * 3 + 1).toFixed(1)} km²</div>
          </div>
          
          <div class="mt-2 text-xs p-2 rounded-md" style="background-color: ${zone.color}20; border: 1px solid ${zone.color}40; color: ${zone.color}">
            <div class="font-medium mb-1">Access Information:</div>
            ${zone.name === "Restricted Area" 
              ? "Special permit required. Limited entry hours from 9 AM to 5 PM." 
              : zone.name === "Main Ceremonial Area"
                ? "Open to all devotees. Expected high crowd during ceremonial hours."
                : zone.name === "Accommodation Zone"
                  ? "Reserved for registered pilgrims. Security check at entry points."
                  : "Public parking available. Shuttle services run every 15 minutes."
            }
          </div>
        </div>
      `, {
        className: 'area-popup',
        maxWidth: 300
      });
    });

    // Add path connecting the main sites
    const mainSitesPath = [
      [20.0059, 73.7913], // Ramkund
      [20.0064, 73.7904], // Kalaram Temple
      [20.0116, 73.7938], // Tapovan
      [20.0030, 73.7900]  // Godavari Ghat
    ];

    L.polyline(mainSitesPath, {
      color: '#FF7F00',
      weight: 3,
      opacity: 0.7,
      dashArray: '5, 8',
    }).addTo(areaMapRef.current!)
    .bindPopup(`
      <div class="text-sm p-2">
        <h3 class="font-bold text-[#FF7F00] border-b pb-1 mb-2">Pilgrimage Route</h3>
        <p class="text-xs mb-2">Official route connecting major sites at Kumbh Mela</p>
        <div class="bg-amber-50 p-2 rounded-md border border-amber-200 text-xs text-amber-800">
          Walking time: Approximately 40 minutes for the complete circuit
        </div>
      </div>
    `);

    return () => {
      areaMapRef.current?.eachLayer(layer => {
        if (layer instanceof L.TileLayer) return; // Keep the base map
        layer.remove();
      });
    };
  }, [areaMapRef]);

  // Update the density map
  useEffect(() => {
    if (!densityMapRef.current || !crowdLevels || crowdLevels.length === 0) return;
    
    // Location coordinates matching the ones from the heatmap
    const locationCoordinates: Record<string, [number, number]> = {
      "Ramkund": [20.0059, 73.7913],
      "Kalaram Temple": [20.0064, 73.7904],
      "Tapovan": [20.0116, 73.7938],
      "Godavari Ghat": [20.0030, 73.7900],
      "Trimbakeshwar": [19.9322, 73.5309]
    };
    
    // Approximate area sizes in square meters for each location
    const locationAreas: Record<string, number> = {
      "Ramkund": 5000,
      "Kalaram Temple": 3500,
      "Tapovan": 8000,
      "Godavari Ghat": 4000,
      "Trimbakeshwar": 6000
    };
    
    // Add circular areas for each location with density visualization
    crowdLevels.forEach(level => {
      const coordinates = locationCoordinates[level.location];
      if (!coordinates) return;
      
      // Calculate density (people per square meter)
      const area = locationAreas[level.location] || 5000; // Default to 5000 sq meters if not specified
      const density = level.currentCount / area;
      
      // Determine color based on density
      const densityColor = 
        density >= 4 ? '#3730a3' : // Very high density (dangerous)
        density >= 3 ? '#4338ca' : // High density
        density >= 2 ? '#4f46e5' : // Medium-high density
        density >= 1 ? '#6366f1' : // Medium density
        density >= 0.5 ? '#818cf8' : // Low-medium density
        density >= 0.2 ? '#a5b4fc' : // Low density
        '#c7d2fe'; // Very low density
      
      // Calculate radius based on area (rough estimation for circular representation)
      const radius = Math.sqrt(area / Math.PI);
      
      // Add a circle to represent the area with density-based coloring
      const circle = L.circle(coordinates, {
        radius: radius,
        color: densityColor,
        fillColor: densityColor,
        fillOpacity: 0.25 + (density * 0.1), // Opacity increases with density
        weight: 2
      }).addTo(densityMapRef.current!);
      
      // Add a marker with density information
      L.marker(coordinates, {
        icon: L.divIcon({
          className: 'density-marker',
          html: `
            <div class="flex items-center justify-center relative">
              <div class="absolute -z-10 w-10 h-10 rounded-full bg-white opacity-70"></div>
              <div class="flex items-center justify-center w-9 h-9 rounded-full border-2 shadow-lg" 
                style="background: linear-gradient(135deg, white, ${densityColor}20); border-color: ${densityColor};">
                <div class="text-xs font-bold" style="color: ${densityColor}">
                  ${density.toFixed(1)}
                </div>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      }).addTo(densityMapRef.current!)
      .bindPopup(`
        <div class="text-sm p-2">
          <h3 class="font-bold text-indigo-600 text-base border-b pb-1 mb-2">${level.location}</h3>
          <div class="grid grid-cols-2 gap-y-2 mb-2">
            <div class="font-medium">Current Count:</div>
            <div class="font-semibold">${level.currentCount.toLocaleString()}</div>
            
            <div class="font-medium">Area Size:</div>
            <div class="font-semibold">${area.toLocaleString()} m²</div>
            
            <div class="font-medium">Density:</div>
            <div class="font-semibold ${
              density >= 4 ? 'text-indigo-900' :
              density >= 2 ? 'text-indigo-700' :
              'text-indigo-500'
            }">${density.toFixed(2)} people/m²</div>
          </div>
          
          <div class="bg-indigo-50 p-2 rounded-md border border-indigo-200 mt-2 text-xs text-indigo-800">
            <div class="font-medium mb-1">Safety Level:</div>
            ${
              density >= 4 ? 'CRITICAL - Immediate crowd management required' :
              density >= 3 ? 'WARNING - High density, monitor carefully' :
              density >= 2 ? 'CAUTION - Medium-high density' :
              density >= 1 ? 'MODERATE - Comfortable movement limited' :
              'SAFE - Free movement possible'
            }
          </div>
        </div>
      `, {
        className: 'density-popup',
        maxWidth: 300
      });
    });
    
    return () => {
      densityMapRef.current?.eachLayer(layer => {
        if (layer instanceof L.TileLayer) return; // Keep the base map
        layer.remove();
      });
    };
  }, [crowdLevels, densityMapRef]);

  // Update the safety zones based on crowd levels
  useEffect(() => {
    if (!mapRef.current || !crowdLevels || crowdLevels.length === 0) return;
    
    // Remove existing safety zones if they exist
    safetyZonesRef.current.forEach(zone => zone.remove());
    safetyZonesRef.current = [];
    
    // Don't add safety zones if they're turned off
    if (!showSafetyZones) return;
    
    // Get location coordinates for each location
    const locationCoordinates: Record<string, [number, number]> = {
      "Ramkund": [20.0059, 73.7913],
      "Kalaram Temple": [20.0064, 73.7904],
      "Tapovan": [20.0116, 73.7938],
      "Godavari Ghat": [20.0030, 73.7900],
      "Trimbakeshwar": [19.9322, 73.5309]
    };
    
    // Create safety zones for each crowd level location
    crowdLevels.forEach(level => {
      const coordinates = locationCoordinates[level.location];
      if (!coordinates) return;
      
      // Calculate ratio of current crowd to capacity
      const ratio = level.currentCount / level.capacity;
      
      // Determine safety level based on crowd density
      let safetyLevel: 'safe' | 'moderate' | 'crowded' | 'dangerous';
      let safetyColor: string;
      let pulsate = false;
      
      if (ratio < 0.25) {
        safetyLevel = 'safe';
        safetyColor = '#10b981'; // emerald-500
      } else if (ratio < 0.5) {
        safetyLevel = 'moderate';
        safetyColor = '#f59e0b'; // amber-500
      } else if (ratio < 0.75) {
        safetyLevel = 'crowded';
        safetyColor = '#f97316'; // orange-500
        pulsate = true;
      } else {
        safetyLevel = 'dangerous';
        safetyColor = '#ef4444'; // red-500
        pulsate = true;
      }
      
      // Create a safety zone with appropriate styling
      const radius = 200 + (ratio * 200); // Size increases with crowd density
      // Use CircleOptions not CircleMarkerOptions for circles with radius in meters
      const circleOptions: L.CircleOptions = {
        color: safetyColor,
        fillColor: safetyColor,
        fillOpacity: 0.15,
        weight: 3,
      };
      
      // Add conditional options
      if (pulsate) {
        circleOptions.dashArray = '5, 10';
        circleOptions.className = 'animate-pulse-border';
      }
      
      const safetyZone = L.circle(coordinates, radius, circleOptions).addTo(mapRef.current!);
      
      // Add popup with safety information
      safetyZone.bindPopup(`
        <div class="text-sm p-2">
          <h3 class="font-bold text-base border-b pb-1 mb-2" style="color: ${safetyColor}">${level.location} - Safety Zone</h3>
          <div class="grid grid-cols-2 gap-y-2 mb-2">
            <div class="font-medium">Status:</div>
            <div class="font-semibold" style="color: ${safetyColor}">
              ${safetyLevel.toUpperCase()}
            </div>
            
            <div class="font-medium">Current Count:</div>
            <div class="font-semibold">${level.currentCount.toLocaleString()}</div>
            
            <div class="font-medium">Capacity:</div>
            <div class="font-semibold">${level.capacity.toLocaleString()}</div>
            
            <div class="font-medium">Occupancy:</div>
            <div class="font-semibold">${Math.round(ratio * 100)}%</div>
          </div>
          
          <div class="mt-2 text-xs p-2 rounded-md" style="background-color: ${safetyColor}15; border: 1px solid ${safetyColor}30; color: ${safetyColor}">
            <div class="font-medium mb-1">Safety Recommendations:</div>
            ${
              safetyLevel === 'safe' 
                ? 'Safe for all visitors. Easy movement and navigation.'
                : safetyLevel === 'moderate'
                  ? 'Moderate crowding. Keep belongings secure and stay aware of surroundings.'
                  : safetyLevel === 'crowded'
                    ? 'High crowd density. Move with caution and follow official directions. Not recommended for elderly or children.'
                    : 'DANGER ZONE. Avoid this area if possible. Follow all official instructions immediately.'
            }
          </div>
        </div>
      `, {
        className: 'safety-popup',
        maxWidth: 300
      });
      
      // Store reference to the safety zone
      safetyZonesRef.current.push(safetyZone);
    });
    
  }, [crowdLevels, mapRef, showSafetyZones]);

  // Update the heatmap based on crowd levels (integrated in main map)
  useEffect(() => {
    if (!mapRef.current || !crowdLevels || crowdLevels.length === 0) return;

    // Remove existing heat layer if it exists
    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
      heatLayerRef.current = null;
    }
    
    // Don't add heatmap layer if it's turned off
    if (!showHeatLayer) return;

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
    }).addTo(mapRef.current);
    
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
        }).addTo(mapRef.current!)
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
    
  }, [crowdLevels, facilities, mapRef, showHeatLayer]);

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
        
        <div className="flex gap-2">
          {/* Main map toggles */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowHeatLayer(!showHeatLayer)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${
                showHeatLayer ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              {showHeatLayer ? (
                <>
                  <Users className="h-4 w-4" />
                  <span>Hide Heatmap</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Show Heatmap</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowSafetyZones(!showSafetyZones)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${
                showSafetyZones ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              {showSafetyZones ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                  </svg>
                  <span>Hide Safety Zones</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8v8"></path>
                    <path d="M8 12h8"></path>
                  </svg>
                  <span>Show Safety Zones</span>
                </>
              )}
            </button>
          </div>
          
          {/* Auxiliary map buttons */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => {
                setAuxiliaryMapType('density');
                setShowAuxiliaryMap(!showAuxiliaryMap || auxiliaryMapType !== 'density');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                showAuxiliaryMap && auxiliaryMapType === 'density' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"></path>
                <circle cx="10" cy="14" r="2"></circle>
                <circle cx="16" cy="16" r="2"></circle>
              </svg>
              <span>Density</span>
            </button>
            
            <button
              onClick={() => {
                setAuxiliaryMapType('area');
                setShowAuxiliaryMap(!showAuxiliaryMap || auxiliaryMapType !== 'area');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                showAuxiliaryMap && auxiliaryMapType === 'area' 
                  ? 'bg-violet-100 text-violet-800' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M18 14c0 5.657-4.343 8-8 8s-8-2.343-8-8a8 8 0 0 1 16 0Z"></path>
                <path d="M10 2v8"></path>
                <path d="M2 10h16"></path>
              </svg>
              <span>Areas</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main map section (facilities or heatmap) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full">
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

          {showHeatLayer && (
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
          )}
          
          <div
            ref={setMapContainer}
            className="w-full h-[400px] rounded-b-lg z-0"
          />
        </div>
        
        {/* Auxiliary map (density or area) */}
        {showAuxiliaryMap && (
          <div className="w-full">
            {auxiliaryMapType === 'density' ? (
              <>
                <div className="p-2 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium mb-1">Population Density Map</div>
                      <div className="flex items-center mt-1 text-xs text-gray-600">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                        <span>Shows people per square meter across locations</span>
                      </div>
                    </div>
                    
                    {/* Density map legend */}
                    <div className="flex flex-col items-end">
                      <div className="h-6 w-64 rounded-md mb-1" 
                        style={{ 
                          background: 'linear-gradient(to right, #c7d2fe, #a5b4fc, #818cf8, #6366f1, #4f46e5, #4338ca, #3730a3)'
                        }}>
                      </div>
                      <div className="w-64 flex justify-between text-[10px] text-gray-600 px-1">
                        <span>0.1</span>
                        <span>0.5</span>
                        <span>1.0</span>
                        <span>2.0</span>
                        <span>3.0</span>
                        <span>4.0+</span>
                      </div>
                      <div className="w-64 flex justify-between text-[10px] mt-1 px-1">
                        <span className="bg-indigo-50 text-indigo-800 px-1 rounded">Low</span>
                        <span className="bg-indigo-100 text-indigo-800 px-1 rounded">Medium</span>
                        <span className="bg-indigo-200 text-indigo-800 px-1 rounded">Dense</span>
                        <span className="bg-indigo-300 text-indigo-900 px-1 rounded">Critical</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100 text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"></path>
                      <circle cx="10" cy="14" r="2"></circle>
                      <circle cx="16" cy="16" r="2"></circle>
                    </svg>
                    <span>Density measured in people per square meter. Data updates every 5 minutes.</span>
                  </div>
                </div>
                
                <div
                  ref={setDensityMapContainer}
                  className="w-full h-[400px] rounded-b-lg z-0"
                />
              </>
            ) : (
              <>
                <div className="p-2 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium mb-1">Area Coverage Map</div>
                      <div className="flex items-center mt-1 text-xs text-gray-600">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                        <span>Boundary areas of Kumbh Mela zones</span>
                      </div>
                    </div>
                    
                    {/* Area map legend */}
                    <div className="mt-1 text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 border border-violet-600 bg-violet-200 opacity-40"></span>
                        <span>Main Ceremonial Area</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 border border-orange-600 bg-orange-200 opacity-40"></span>
                        <span>Accomodation Zone</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 border border-teal-600 bg-teal-200 opacity-40"></span>
                        <span>Parking & Transport Zone</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 border border-red-600 bg-red-200 opacity-40"></span>
                        <span>Restricted Area</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100 text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M18 14c0 5.657-4.343 8-8 8s-8-2.343-8-8a8 8 0 0 1 16 0Z"></path>
                    </svg>
                    <span>Area boundaries show different zones and their specific purposes at the Kumbh Mela.</span>
                  </div>
                </div>
                
                <div
                  ref={setAreaMapContainer}
                  className="w-full h-[400px] rounded-b-lg z-0"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}