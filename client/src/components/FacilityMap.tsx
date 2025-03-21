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
import { AlertTriangle, MapPin, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type FacilityType = "holy_site" | "hospital" | "hotel" | "temple" | "shuttle_stop" | "restroom";

// Define the possible view modes
type ViewMode = 'facilities' | 'heatmap' | 'safety' | 'density' | 'area';

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

// Add new time-based crowd simulation functions
const getTimeFactor = (hour: number, location: string): number => {
  // Religious timings
  const isAartiTime = (hour >= 5 && hour <= 7) || (hour >= 18 && hour <= 19);
  const isPujaTime = (hour >= 8 && hour <= 11);

  // Location specific timing factors
  switch (location) {
    case "Ramkund":
      if (isAartiTime) return 1.8; // Peak during aarti
      if (hour >= 4 && hour <= 9) return 1.5; // Morning rush
      if (hour >= 17 && hour <= 20) return 1.4; // Evening rush
      return 1.0;

    case "Kalaram Temple":
      if (isPujaTime) return 1.6; // Peak during puja times
      if (hour >= 6 && hour <= 12) return 1.4; // Morning hours
      if (hour >= 16 && hour <= 19) return 1.3; // Evening hours
      return 1.0;

    case "Tapovan":
      if (hour >= 7 && hour <= 11) return 1.3; // Morning peak
      if (hour >= 16 && hour <= 19) return 1.4; // Evening peak
      return 1.0;

    case "Godavari Ghat":
      if (isAartiTime) return 1.7; // Peak during aarti
      if (hour >= 5 && hour <= 10) return 1.5; // Morning bathing time
      if (hour >= 16 && hour <= 19) return 1.4; // Evening rush
      return 1.0;

    default:
      return 1.0;
  }
};

const getWeatherImpact = (weather: string): number => {
  switch (weather.toLowerCase()) {
    case 'rain': return 0.7; // Reduced crowds in rain
    case 'extreme heat': return 0.8; // Reduced crowds in extreme heat
    case 'pleasant': return 1.2; // Increased crowds in good weather
    default: return 1.0;
  }
};

const getFestivalImpact = (date: Date): number => {
  // Special dates during Kumbh Mela
  const specialDates: Record<string, number> = {
    '2025-03-25': 2.0, // Main Shahi Snan
    '2025-04-08': 1.8, // Chaitra Purnima
    '2025-04-21': 1.7, // Mesh Sankranti
  };

  const dateStr = date.toISOString().split('T')[0];
  return specialDates[dateStr] || 1.0;
};

// Function to simulate realistic crowd movement based on time and location
const simulateRealisticCrowds = (location: string, baseCount: number): number => {
  const now = new Date();
  const hour = now.getHours();
  
  // Get various impact factors
  const timeFactor = getTimeFactor(hour, location);
  const weatherFactor = getWeatherImpact('pleasant'); // Placeholder for weather API
  const festivalFactor = getFestivalImpact(now);
  
  // Small random variation to simulate natural fluctuations
  const randomFactor = 0.9 + (Math.random() * 0.2);
  
  // Calculate the final count with all factors
  return Math.round(baseCount * timeFactor * weatherFactor * festivalFactor * randomFactor);
};

// Location coordinates for Kumbh Mela sites
type LocationCoordinates = Record<string, [number, number]>;
type LocationAreas = Record<string, number>;

const locationCoordinates: LocationCoordinates = {
  "Ramkund": [20.0059, 73.7913],
  "Kalaram Temple": [20.0068, 73.7902],
  "Tapovan": [20.0009, 73.7863],
  "Godavari Ghat": [20.0066, 73.7928],
  "Nashik Road Station": [19.9851, 73.7772],
  "CBS Bus Stand": [19.9990, 73.7869]
};

const locationAreas: LocationAreas = {
  "Ramkund": 5000, // square meters
  "Kalaram Temple": 8000,
  "Tapovan": 15000,
  "Godavari Ghat": 4000,
  "Nashik Road Station": 12000,
  "CBS Bus Stand": 10000
};

// Generate dynamic flow indicators based on time of day and location
const getFlowIndicators = (
  center: [number, number],
  location: string,
  hour: number
): [[number, number], [number, number]][] => {
  const flowArrows: [[number, number], [number, number]][] = [];
  
  // Direction vectors based on time of day
  let primaryDirection: [number, number] = [0, 0];
  let secondaryDirection: [number, number] = [0, 0];
  
  if (hour >= 5 && hour <= 10) {
    // Morning: people moving toward holy sites
    primaryDirection = [0.001, 0];
    secondaryDirection = [0, 0.001];
  } else if (hour >= 11 && hour <= 15) {
    // Midday: people moving around accommodation and food areas
    primaryDirection = [0, 0.001];
    secondaryDirection = [0.001, 0.001];
  } else if (hour >= 16 && hour <= 20) {
    // Evening: people moving back toward transportation
    primaryDirection = [-0.001, 0];
    secondaryDirection = [0, -0.001];
  } else {
    // Night: minimal movement
    primaryDirection = [0.0005, 0.0005];
    secondaryDirection = [-0.0005, 0.0005];
  }
  
  // Location-specific flow adjustments
  switch (location) {
    case "Ramkund":
      // More flow toward the water in morning, away in evening
      if (hour < 12) {
        primaryDirection[1] *= 1.5;
      } else {
        primaryDirection[1] *= -1.5;
      }
      break;
    case "Kalaram Temple":
      // Flow toward temple in morning, away in evening
      if (hour < 12) {
        primaryDirection[0] *= 1.2;
      } else {
        primaryDirection[0] *= -1.2;
      }
      break;
  }
  
  // Generate several flow arrows
  for (let i = 0; i < 5; i++) {
    // Start point with slight random offset
    const startLat = center[0] + (Math.random() * 0.001 - 0.0005);
    const startLng = center[1] + (Math.random() * 0.001 - 0.0005);
    
    // End point based on direction and some randomness
    const direction = i % 2 === 0 ? primaryDirection : secondaryDirection;
    const endLat = startLat + direction[0] * (0.8 + Math.random() * 0.4);
    const endLng = startLng + direction[1] * (0.8 + Math.random() * 0.4);
    
    flowArrows.push([
      [startLat, startLng],
      [endLat, endLng]
    ]);
  }
  
  return flowArrows;
};

// Enhanced density visualization with color coding
interface DensityLevel {
  color: string;
  label: string;
}

// Get color based on density level
const getDensityColor = (density: number): DensityLevel => {
  if (density < 0.5) return { color: '#4ade80', label: 'Low' }; // Green - low density
  if (density < 1.0) return { color: '#22c55e', label: 'Moderate' }; // Darker green - moderate
  if (density < 2.0) return { color: '#f59e0b', label: 'Medium' }; // Yellow - medium
  if (density < 3.0) return { color: '#f97316', label: 'High' }; // Orange - high
  if (density < 4.0) return { color: '#ef4444', label: 'Very High' }; // Red - very high
  if (density < 5.0) return { color: '#b91c1c', label: 'Crowded' }; // Dark red - crowded
  return { color: '#7f1d1d', label: 'Critical' }; // Very dark red - critical
};

// Calculate boundary dynamically for area polygons
const calculateAreaBoundary = (
  basePoints: [number, number][],
  timeOffset: number,
  crowdFactor: number
): [number, number][] => {
  return basePoints.map(point => {
    // Add dynamic movement to polygon boundaries based on time and crowd
    const variation = 0.0005 * crowdFactor * (Math.sin(timeOffset) * 0.5 + 0.5);
    
    // Different variation for each point to create organic movement
    const pointVariation = variation * (0.7 + Math.random() * 0.6);
    
    // Direction varies slightly for each point
    const direction = Math.random() * Math.PI * 2;
    
    return [
      point[0] + Math.sin(direction) * pointVariation,
      point[1] + Math.cos(direction) * pointVariation
    ] as [number, number];
  });
};

// Dynamic area zone definitions
interface AreaZone {
  name: string;
  center: [number, number];
  basePoints: [number, number][];
  color: string;
  status: string;
  crowdFactor: number;
}

// Base zone definitions
const getBaseZones = (): AreaZone[] => {
  return [
    {
      name: "Main Ceremonial Area",
      center: [20.0059, 73.7913],
      basePoints: [
        [20.0065, 73.7903],
        [20.0070, 73.7915],
        [20.0060, 73.7930],
        [20.0050, 73.7925],
        [20.0052, 73.7910]
      ],
      color: "#673ab7", // Purple
      status: "Active",
      crowdFactor: 0.8
    },
    {
      name: "Accommodation Zone",
      center: [20.0030, 73.7890],
      basePoints: [
        [20.0040, 73.7880],
        [20.0045, 73.7895],
        [20.0035, 73.7910],
        [20.0020, 73.7905],
        [20.0025, 73.7880]
      ],
      color: "#ff9800", // Orange
      status: "High Occupancy",
      crowdFactor: 0.7
    },
    {
      name: "Transport & Parking Zone",
      center: [20.0000, 73.7870],
      basePoints: [
        [20.0010, 73.7860],
        [20.0015, 73.7875],
        [19.9995, 73.7885],
        [19.9990, 73.7870]
      ],
      color: "#009688", // Teal
      status: "Moderate Flow",
      crowdFactor: 0.5
    },
    {
      name: "Restricted Area",
      center: [20.0075, 73.7935],
      basePoints: [
        [20.0080, 73.7930],
        [20.0085, 73.7940],
        [20.0075, 73.7950],
        [20.0065, 73.7940]
      ],
      color: "#f44336", // Red
      status: "Limited Access",
      crowdFactor: 0.3
    }
  ];
};

// Update crowd factors based on time of day and real crowd data
const getUpdatedZones = (hour: number, timeOffset: number, crowdLevels?: CrowdLevel[]): AreaZone[] => {
  const baseZones = getBaseZones();
  
  // Apply time-based crowd factor adjustments
  baseZones.forEach(zone => {
    // Base time-of-day adjustment
    let baseCrowdFactor = 0.5; // Default base crowd factor
    
    // If we have real crowd data, incorporate it
    if (crowdLevels && crowdLevels.length > 0) {
      // Find the nearest crowd level location to use for this zone
      let nearestLocation = '';
      let minDistance = Infinity;
      let crowdRatio = 0;
      
      // Map zone names to crowd level locations
      const zoneToLocationMap: Record<string, string> = {
        "Main Ceremonial Area": "Ramkund",
        "Accommodation Zone": "Tapovan",
        "Transport & Parking Zone": "Nashik Road Station",
        "Restricted Area": "Kalaram Temple"
      };
      
      const mappedLocation = zoneToLocationMap[zone.name];
      
      if (mappedLocation) {
        // Find this location in crowd levels
        const crowdInfo = crowdLevels.find(cl => cl.location === mappedLocation);
        if (crowdInfo) {
          // Calculate real-time density based on current count and capacity
          const simulatedCount = simulateRealisticCrowds(crowdInfo.location, crowdInfo.currentCount);
          crowdRatio = simulatedCount / crowdInfo.capacity;
          baseCrowdFactor = Math.min(1, crowdRatio * 1.2); // Scale appropriately
        }
      } else {
        // Use the nearest available crowd level data
        crowdLevels.forEach(cl => {
          if (locationCoordinates[cl.location]) {
            const locationCoord = locationCoordinates[cl.location];
            const zoneCoord = zone.center;
            
            // Simple distance calculation
            const dx = locationCoord[0] - zoneCoord[0];
            const dy = locationCoord[1] - zoneCoord[1];
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestLocation = cl.location;
              
              // Calculate crowd ratio
              const simulatedCount = simulateRealisticCrowds(cl.location, cl.currentCount);
              crowdRatio = simulatedCount / cl.capacity;
              baseCrowdFactor = Math.min(1, crowdRatio * 1.2); // Scale appropriately
            }
          }
        });
      }
    }
    
    // Apply time-of-day adjustments on top of the base crowd factor
    if (hour >= 5 && hour <= 9) {
      // Morning peak for ceremonial areas
      if (zone.name === "Main Ceremonial Area") {
        zone.crowdFactor = baseCrowdFactor * (0.8 + (Math.sin(timeOffset) * 0.15));
        zone.status = "Peak Hours";
      }
      // Morning activity for accommodation
      else if (zone.name === "Accommodation Zone") {
        zone.crowdFactor = baseCrowdFactor * (0.6 + (Math.sin(timeOffset) * 0.1));
        zone.status = "Active";
      }
      // High transport activity in morning
      else if (zone.name === "Transport & Parking Zone") {
        zone.crowdFactor = baseCrowdFactor * (0.7 + (Math.sin(timeOffset) * 0.2));
        zone.status = "High Flow";
      }
    }
    else if (hour >= 10 && hour <= 15) {
      // Midday adjustment - ceremonial areas busy
      if (zone.name === "Main Ceremonial Area") {
        zone.crowdFactor = baseCrowdFactor * (0.7 + (Math.sin(timeOffset) * 0.1));
        zone.status = "Active";
      }
      // Accommodation quieter during day
      else if (zone.name === "Accommodation Zone") {
        zone.crowdFactor = baseCrowdFactor * (0.4 + (Math.sin(timeOffset) * 0.1));
        zone.status = "Moderate Activity";
      }
      // Transport moderate during day
      else if (zone.name === "Transport & Parking Zone") {
        zone.crowdFactor = baseCrowdFactor * (0.5 + (Math.sin(timeOffset) * 0.1));
        zone.status = "Moderate Flow";
      }
    }
    else if (hour >= 16 && hour <= 20) {
      // Evening peak for ceremonial areas
      if (zone.name === "Main Ceremonial Area") {
        zone.crowdFactor = baseCrowdFactor * (0.9 + (Math.sin(timeOffset) * 0.1));
        zone.status = "Evening Aarti";
      }
      // Evening return to accommodation
      else if (zone.name === "Accommodation Zone") {
        zone.crowdFactor = baseCrowdFactor * (0.8 + (Math.sin(timeOffset) * 0.15));
        zone.status = "High Occupancy";
      }
      // High transport activity in evening
      else if (zone.name === "Transport & Parking Zone") {
        zone.crowdFactor = baseCrowdFactor * (0.7 + (Math.sin(timeOffset) * 0.15));
        zone.status = "High Flow";
      }
    }
    else {
      // Night time has reduced activity
      if (zone.name === "Main Ceremonial Area") {
        zone.crowdFactor = baseCrowdFactor * (0.3 + (Math.sin(timeOffset) * 0.05));
        zone.status = "Quiet Hours";
      }
      else if (zone.name === "Accommodation Zone") {
        zone.crowdFactor = baseCrowdFactor * (0.7 + (Math.sin(timeOffset) * 0.05));
        zone.status = "Rest Hours";
      }
      else if (zone.name === "Transport & Parking Zone") {
        zone.crowdFactor = baseCrowdFactor * (0.2 + (Math.sin(timeOffset) * 0.05));
        zone.status = "Low Activity";
      }
    }
    
    // Restricted area always has controlled access
    if (zone.name === "Restricted Area") {
      zone.crowdFactor = baseCrowdFactor * (0.3 + (Math.sin(timeOffset) * 0.05));
      zone.status = "Limited Access";
    }
    
    // Update status based on crowd factor
    if (zone.crowdFactor > 0.9) {
      zone.status = "CRITICAL - Extremely Crowded";
    } else if (zone.crowdFactor > 0.75) {
      zone.status = "ALERT - Very Crowded";
    } else if (zone.crowdFactor > 0.6) {
      zone.status = "High Occupancy";
    }
  });
  
  return baseZones;
};

// Information about zone access based on time
const getZoneAccessInfo = (zoneName: string, hour: number): string => {
  if (zoneName === "Main Ceremonial Area") {
    if (hour >= 4 && hour <= 9) return "Morning rituals in progress. Follow queue system for darshan.";
    if (hour >= 17 && hour <= 20) return "Evening aarti in progress. Expect delays and follow crowd management directions.";
    return "Normal access. Follow designated paths.";
  }
  
  if (zoneName === "Accommodation Zone") {
    if (hour >= 22 || hour <= 5) return "Quiet hours in effect. Please maintain silence.";
    return "Open access for registered pilgrims. Show identity badge at entry points.";
  }
  
  if (zoneName === "Transport & Parking Zone") {
    if (hour >= 6 && hour <= 10) return "Morning rush hour. Expect delays for shuttle services.";
    if (hour >= 16 && hour <= 20) return "Evening rush hour. Bus frequency increased.";
    return "Normal operations. Shuttle buses every 15 minutes.";
  }
  
  if (zoneName === "Restricted Area") {
    return "Access by permit only. Approach security personnel at checkpoints.";
  }
  
  return "Follow posted instructions and security personnel guidance.";
};

// Location-specific safety thresholds for determining alert levels
const getSafetyThresholds = (location: string) => {
  const baseThresholds = { safe: 0.4, moderate: 0.6, crowded: 0.8 };
  
  // Adjust thresholds based on location
  switch (location) {
    case "Ramkund": // Higher risk due to water proximity
      return { safe: 0.35, moderate: 0.55, crowded: 0.75 };
    case "Kalaram Temple": // More confined space
      return { safe: 0.3, moderate: 0.5, crowded: 0.7 };
    case "Tapovan": // More open area
      return { safe: 0.45, moderate: 0.65, crowded: 0.85 };
    default:
      return baseThresholds;
  }
};

// Enhanced marker for density visualization
const addEnhancedDensityMarker = (
  map: L.Map,
  coordinates: [number, number], 
  level: CrowdLevel, 
  simulatedCount: number, 
  density: number,
  areaSize: number
) => {
  // Get color based on density
  const { color, label } = getDensityColor(density);
  
  // Calculate size based on crowd level
  const radius = Math.max(20, Math.min(80, simulatedCount / 200));
  
  // Create outer circle with pulsing effect
  L.circle(coordinates, {
    radius: radius,
    color: color,
    fillColor: color,
    fillOpacity: 0.2,
    weight: 2
  }).addTo(map).bindPopup(`
    <div class="p-2">
      <h3 class="font-bold">${level.location}</h3>
      <div class="grid grid-cols-2 gap-2 text-sm mt-2">
        <div>Current Count:</div>
        <div class="font-semibold">${simulatedCount.toLocaleString()}</div>
        <div>Capacity:</div>
        <div class="font-semibold">${level.capacity.toLocaleString()}</div>
        <div>Density:</div>
        <div class="font-semibold">${density.toFixed(2)} people/m²</div>
        <div>Status:</div>
        <div class="font-semibold" style="color:${color}">${label}</div>
      </div>
    </div>
  `);
  
  // Add a label with crowd level
  L.marker(coordinates, {
    icon: L.divIcon({
      className: 'density-marker-label',
      html: `<div class="px-2 py-1 rounded-full text-xs font-bold text-white" style="background-color: ${color}">
              ${label}
            </div>`,
      iconSize: [80, 20],
      iconAnchor: [40, 10]
    })
  }).addTo(map);
};

export function FacilityMap(): JSX.Element {
  // For view modes - only one active at a time
  const [activeViewMode, setActiveViewMode] = useState<ViewMode>('facilities');

  // For facilities map
  const mapRef = useRef<L.Map | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLElement | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // For search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{name: string, type: string, location: {lat: number, lng: number}}[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // For heatmap (integrated with the main map)
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  // For safety zones
  const safetyZonesRef = useRef<L.Circle[]>([]);
  
  // For density grid visualization (integrated with main map)
  const densityGridLayersRef = useRef<L.Layer[]>([]);
  const [showDensityGrid, setShowDensityGrid] = useState(false);
  
  // For area zone visualization (integrated with main map)
  const areaZoneLayersRef = useRef<L.Layer[]>([]);
  const [showAreaZones, setShowAreaZones] = useState(false);
  
  // For WebSocket connection to get real-time density updates
  const wsRef = useRef<WebSocket | null>(null);
  const [densityData, setDensityData] = useState<any>(null);

  // Helper function to toggle view modes - ensuring all modes are mutually exclusive
  const toggleViewMode = (mode: ViewMode) => {
    // If already active, turn it off and go back to base facilities view
    if (activeViewMode === mode) {
      setActiveViewMode('facilities');
    } else {
      if (mode === 'density') {
        // If switching to density mode, enable density grid
        setShowDensityGrid(true);
        setShowAreaZones(false);
      } else if (mode === 'area') {
        // If switching to area mode, enable area zones
        setShowAreaZones(true);
        setShowDensityGrid(false);
      } else {
        // Turn off density grid and area zones when toggling to other modes
        setShowDensityGrid(false);
        setShowAreaZones(false);
      }
      setActiveViewMode(mode);
    }
  };

  // These computed properties help determine if specific views are active
  // Based on the currently selected view mode
  const showHeatLayer = activeViewMode === 'heatmap';
  const showSafetyZones = activeViewMode === 'safety';

  // Queries with increased real-time refresh rates
  const { data: facilities } = useQuery<Facility[]>({
    queryKey: ["/api/facilities"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: shuttles } = useQuery<any[]>({
    queryKey: ["/api/shuttle-locations"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: restrooms } = useQuery<any[]>({
    queryKey: ["/api/restrooms"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const { data: crowdLevels, isLoading: crowdLoading } = useQuery<CrowdLevel[]>({
    queryKey: ["/api/crowd-levels"],
    refetchInterval: 10000, // Refresh every 10 seconds for near real-time updates
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
  
  // Connect to WebSocket for real-time density updates
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    if (!wsRef.current) {
      console.log('Connecting to WebSocket for density updates...');
      wsRef.current = new WebSocket(wsUrl);
      
      // Handle connection open
      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };
      
      // Handle incoming messages
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'initial_density' || data.type === 'density_update') {
            console.log('Received density data:', data.type);
            setDensityData(data.data);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      // Handle errors
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      // Handle connection close
      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        wsRef.current = null;
      };
    }
    
    // Clean up WebSocket on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Handle density grid visualization based on WebSocket data
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear existing density grid layers
    densityGridLayersRef.current.forEach(layer => layer.remove());
    densityGridLayersRef.current = [];
    
    // Only proceed if density grid is enabled
    if (!showDensityGrid) return;
    
    // Guard against missing data
    if (!crowdLevels || crowdLevels.length === 0) return;

    try {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const timeOffset = (minute / 60) * Math.PI * 2;
        
      console.log("Rendering density grid");
      
      // Render density data from WebSocket if available
      if (densityData && densityData.grid && densityData.grid.length > 0) {
        console.log("Using WebSocket density data with", densityData.grid.length, "cells");
        
        // Create a map of location IDs to their names for lookup
        const locationIdMap: Record<number, string> = {};
        if (densityData.keyLocations) {
          Object.entries(densityData.keyLocations).forEach(([name, _]) => {
            const index = Object.keys(densityData.keyLocations).indexOf(name);
            locationIdMap[index] = name;
          });
        }
        
        // Group density grid data by locationId for more organized visualization
        const gridByLocation: Record<number, any[]> = {};
        
        densityData.grid.forEach((cell: any) => {
          if (!gridByLocation[cell.locationId]) {
            gridByLocation[cell.locationId] = [];
          }
          gridByLocation[cell.locationId].push(cell);
        });
        
        // Process each location group
        Object.entries(gridByLocation).forEach(([locationId, cells]) => {
          const locationName = locationIdMap[parseInt(locationId)] || `Area ${locationId}`;
          const locationCoord = locationCoordinates[locationName];
          
          if (!locationCoord) return;
          
          // Find the related crowd level for this location
          const levelData = crowdLevels.find(level => level.location === locationName);
          
          if (!levelData) return;
          
          // Draw a circle for the overall location density
          const avgDensity = cells.reduce((sum, cell) => sum + cell.density, 0) / cells.length;
          const { color, label } = getDensityColor(avgDensity / 100); // Normalize to 0-1 range
          
          if (mapRef.current) {
            // Draw the main location circle
            const densityCircle = L.circle(locationCoord, {
              color: color,
              fillColor: color,
              fillOpacity: 0.2 + (avgDensity / 100 * 0.3),
              weight: 2,
              radius: 250 + (avgDensity * 2),
              className: 'density-location-circle'
            }).addTo(mapRef.current);
            
            densityCircle.bindPopup(`
              <div class="text-xs p-2">
                <div class="font-semibold mb-1">${locationName}</div>
                <div>Average Density: ${(avgDensity / 100).toFixed(2)} people/m²</div>
                <div>Status: <span class="font-medium" style="color:${color}">${label}</span></div>
                <div>Grid Cells: ${cells.length}</div>
                <div class="mt-1 text-gray-500 text-[10px]">
                  Updated: ${new Date(densityData.timestamp).toLocaleTimeString()}
                </div>
              </div>
            `);
            
            densityGridLayersRef.current.push(densityCircle);
            
            // Add detailed grid cells for each location
            cells.forEach((cell) => {
              if (!cell.metadata) return;
              
              // Create grid cell polygons
              const centerLat = cell.metadata.lat;
              const centerLng = cell.metadata.lng;
              
              if (!centerLat || !centerLng) return;
              
              // Create a small polygon centered at the cell coordinates
              const halfSize = 0.0005; // Approximately 50 meters
              const cellCoords = [
                [centerLat - halfSize, centerLng - halfSize],
                [centerLat - halfSize, centerLng + halfSize],
                [centerLat + halfSize, centerLng + halfSize],
                [centerLat + halfSize, centerLng - halfSize]
              ];
              
              // Apply a time-based pulse effect
              const pulseEffect = Math.sin(timeOffset + Math.random()) * 0.1;
              const intensity = (cell.density / 100) + pulseEffect;
              
              const cellColor = cell.metadata.color || color;
              
              const polygon = L.polygon(cellCoords, {
                color: 'rgba(255,255,255,0.3)',
                fillColor: cellColor,
                fillOpacity: 0.1 + (intensity * 0.3),
                weight: 1
              });
              
              if (mapRef.current) {
                polygon.addTo(mapRef.current);
              }
              
              // Add class for styling
              if (polygon.getElement()) {
                polygon.getElement()?.classList.add('density-grid-cell');
              }
              
              densityGridLayersRef.current.push(polygon);
            });
            
            // Add flow arrows for high density areas
            if (avgDensity > 60) {
              const arrowPoints = getFlowIndicators(locationCoord, locationName, hour);
              arrowPoints.forEach(([start, end], index) => {
                const opacity = 0.7 - (index / arrowPoints.length) * 0.5;
                const polyline = L.polyline([start, end], {
                  color: color,
                  weight: 2,
                  opacity: opacity,
                  dashArray: '5,10'
                });
                
                if (mapRef.current) {
                  polyline.addTo(mapRef.current);
                }
                
                densityGridLayersRef.current.push(polyline);
              });
            }
          }
        });
      } else {
        // Fallback to using crowd level data if WebSocket data isn't available
        console.log("Using fallback density visualization");
        
        crowdLevels.forEach(level => {
          const coordinates = locationCoordinates[level.location];
          if (!coordinates) return;
          
          // Calculate density from crowd level data
          const simulatedCount = simulateRealisticCrowds(level.location, level.currentCount);
          const areaSize = locationAreas[level.location] || 5000;
          const density = simulatedCount / areaSize;
          
          // Get color based on density
          const { color, label } = getDensityColor(density);
          
          // Get thresholds specific to this location
          const thresholds = getSafetyThresholds(level.location);
          const ratio = simulatedCount / level.capacity;
          
          // Draw the density circle for this location
          if (mapRef.current) {
            const radius = 200 + (ratio * 200);
            
            const densityCircle = L.circle(coordinates, {
              color: color,
              fillColor: color,
              fillOpacity: 0.2 + (ratio * 0.2),
              weight: 2,
              radius: radius,
              className: 'density-grid-cell'
            }).addTo(mapRef.current);
            
            densityCircle.bindPopup(`
              <div class="text-xs p-2">
                <div class="font-semibold mb-1">${level.location} Area</div>
                <div>Estimated Count: ${simulatedCount.toLocaleString()} people</div>
                <div>Capacity: ${level.capacity.toLocaleString()}</div>
                <div>Density: ${density.toFixed(2)} people/m²</div>
                <div>Status: <span class="font-medium" style="color:${color}">${label}</span></div>
                <div class="mt-1 text-gray-500 text-[10px]">Updated: ${now.toLocaleTimeString()}</div>
                <div class="mt-1 text-amber-600 text-[10px]">(WebSocket data unavailable)</div>
              </div>
            `);
            
            densityGridLayersRef.current.push(densityCircle);
            
            // Generate grid cells for areas with moderate or higher crowd levels
            if (ratio > thresholds.moderate) {
              const gridCells = generateDensityGrid(coordinates, simulatedCount, areaSize, level.location);
              
              gridCells.forEach(({ cell, density }) => {
                const { color } = getDensityColor(density);
                const pulseEffect = Math.sin(timeOffset + Math.random()) * 0.1;
                
                const polygon = L.polygon(cell as L.LatLngExpression[], {
                  color: 'rgba(255,255,255,0.3)',
                  fillColor: color,
                  fillOpacity: 0.2 + (density * 0.15) + pulseEffect,
                  weight: 1
                });
                
                if (mapRef.current) {
                  polygon.addTo(mapRef.current);
                }
                
                if (polygon.getElement()) {
                  polygon.getElement()?.classList.add('density-grid-cell');
                }
                
                densityGridLayersRef.current.push(polygon);
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Error rendering density grid:", error);
    }
    
    // Set up interval for periodic updates
    const updateInterval = setInterval(() => {
      if (!mapRef.current || !showDensityGrid) {
        clearInterval(updateInterval);
        return;
      }
      
      // Re-render with latest data by triggering state update
      setDensityData((prevData: any) => {
        // Create a shallow copy to trigger a re-render
        if (prevData) return { ...prevData, timestamp: new Date().toISOString() };
        return prevData;
      });
    }, 10000);
    
    return () => clearInterval(updateInterval);
  }, [mapRef, showDensityGrid, densityData, crowdLevels]);

  // Handle area zones visualization on main map
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear existing area zone layers
    areaZoneLayersRef.current.forEach(layer => layer.remove());
    areaZoneLayersRef.current = [];
    
    // Only proceed if area zones are enabled
    if (!showAreaZones) return;
    
    const updateInterval = setInterval(() => {
      // Guard against null references
      if (!mapRef.current) {
        clearInterval(updateInterval);
        return;
      }
      
      try {
        // Clear existing area zone layers
        areaZoneLayersRef.current.forEach(layer => layer.remove());
        areaZoneLayersRef.current = [];

        // Get current time info for dynamic updates
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const timeOffset = (minute / 60) * Math.PI * 2;

        // Get updated zones with current time-based states
        // This incorporates realistic Kumbh Mela crowd movement patterns
        const zones = getUpdatedZones(hour, timeOffset, crowdLevels);

        // Add dynamic polygons for each zone
        zones.forEach(zone => {
          // Calculate dynamic boundary points
          const boundaryPoints = calculateAreaBoundary(zone.basePoints, timeOffset, zone.crowdFactor);

          // Create polygon with dynamic properties
          const polygon = L.polygon(boundaryPoints, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.2 + (zone.crowdFactor * 0.3),
            weight: 2
          });
          
          if (mapRef.current) {
            polygon.addTo(mapRef.current);
          }
          
          // Add class to element using DOM methods instead
          if (polygon.getElement()) {
            polygon.getElement()?.classList.add('area-zone', 'animate-pulse-slow');
          }
          
          areaZoneLayersRef.current.push(polygon);

          // Add animated label
          const labelOpacity = 0.7 + Math.sin(timeOffset) * 0.3;
          const marker = L.marker(zone.center, {
            icon: L.divIcon({
              className: 'area-label',
              html: `
              <div class="px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-lg transform transition-all duration-500" 
                   style="background-color: ${zone.color}; white-space: nowrap; opacity: ${labelOpacity}">
                ${zone.name}
                <span class="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-[10px]">
                  ${zone.status}
                </span>
              </div>
            `,
              iconSize: [150, 30],
              iconAnchor: [75, 15]
            })
          });
          
          if (mapRef.current) {
            marker.addTo(mapRef.current);
          }
          
          areaZoneLayersRef.current.push(marker);

          // Add interactive popup
          polygon.bindPopup(`
          <div class="text-sm p-4">
            <h3 class="font-bold text-lg border-b pb-2 mb-3" style="color: ${zone.color}">${zone.name}</h3>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-gray-50 p-2 rounded">
                <div class="text-xs text-gray-500">Status</div>
                <div class="font-semibold">${zone.status}</div>
              </div>
              <div class="bg-gray-50 p-2 rounded">
                <div class="text-xs text-gray-500">Occupancy</div>
                <div class="font-semibold">${Math.round(zone.crowdFactor * 100)}%</div>
              </div>
              <div class="bg-gray-50 p-2 rounded">
                <div class="text-xs text-gray-500">Area</div>
                <div class="font-semibold">${(Math.random() * 3 + 1).toFixed(1)} km²</div>
              </div>
              <div class="bg-gray-50 p-2 rounded">
                <div class="text-xs text-gray-500">Update Time</div>
                <div class="font-semibold">${now.toLocaleTimeString()}</div>
              </div>
            </div>

            <div class="rounded-lg p-3" style="background: ${zone.color}10; border: 1px solid ${zone.color}40">
              <div class="font-medium mb-1" style="color: ${zone.color}">Access Information:</div>
              <div class="text-sm" style="color: ${zone.color}">
                ${getZoneAccessInfo(zone.name, hour)}
              </div>
            </div>

            ${zone.crowdFactor > 0.8 ? `
              <div class="mt-3 p-2 bg-red-50 rounded border border-red-100 text-xs">
                <div class="font-medium text-red-700 mb-1">High Occupancy Alert:</div>
                <div class="text-red-600">
                  • Follow crowd management directions<br>
                  • Use alternative routes if possible<br>
                  • Emergency exits marked in green
                </div>
              </div>
            ` : ''}
          </div>
        `, {
            className: 'area-popup',
            maxWidth: 350
          });
        });

        // Add animated connection paths between zones
        if (mapRef.current) {
          zones.forEach((zone, index) => {
            if (index < zones.length - 1) {
              const nextZone = zones[index + 1];
              const polyline = L.polyline([zone.center, nextZone.center], {
                color: '#FF7F00',
                weight: 2,
                opacity: 0.5 + Math.sin(timeOffset) * 0.3,
                dashArray: '5, 8'
              });
              
              if (mapRef.current) {
                polyline.addTo(mapRef.current);
              }
              
              // Add class using DOM methods
              if (polyline.getElement()) {
                polyline.getElement()?.classList.add('connection-path', 'animate-pulse-slow');
              }
              
              areaZoneLayersRef.current.push(polyline);
            }
          });
        }
      } catch (error) {
        console.error("Error updating area zones:", error);
      }
    }, 10000); // Update every 10 seconds for real-time visualization

    return () => clearInterval(updateInterval);
  }, [showAreaZones, mapRef]);

  // Generate a grid of cells around a location
  const generateDensityGrid = (
    center: [number, number], 
    baseCount: number, 
    areaSize: number,
    location: string
  ): { cell: L.LatLngExpression[], density: number }[] => {
    // Configure grid
    const gridCellSize = 0.001; // Size of each grid cell in degrees (approximately 100m)
    const gridRadius = 0.005; // Radius around the center point to generate grid (approximately 500m)
    const numCells = Math.floor(gridRadius / gridCellSize) * 2; // Number of cells in each direction
    
    const now = new Date();
    const hour = now.getHours();
    const cells: { cell: L.LatLngExpression[], density: number }[] = [];
    
    // Calculate time-based variation factor
    const minute = now.getMinutes();
    const secondsElapsed = now.getSeconds() + (minute * 60);
    const timeFactor = 1 + Math.sin(secondsElapsed / 30 * Math.PI / 180) * 0.2;
    
    // Generate grid cells around the center point
    for (let i = -numCells/2; i < numCells/2; i++) {
      for (let j = -numCells/2; j < numCells/2; j++) {
        // Calculate the center of this grid cell
        const cellLat = center[0] + (i * gridCellSize);
        const cellLng = center[1] + (j * gridCellSize);
        
        // Calculate distance from center as a factor (0-1)
        const distanceFromCenter = Math.sqrt(i*i + j*j) / (numCells/2);
        
        // Calculate density for this cell
        // Density decreases as distance from center increases
        const baseDensity = baseCount / areaSize;
        
        // Direction-based density distribution based on time of day
        let directionFactor = 1.0;
        
        if (hour >= 4 && hour <= 9) {
          // Morning pattern - higher density to the east
          directionFactor += j > 0 ? 0.3 : -0.2;
        } else if (hour >= 17 && hour <= 20) {
          // Evening pattern - higher density to the west
          directionFactor += j < 0 ? 0.3 : -0.2;
        } else if (hour >= 11 && hour <= 15) {
          // Midday pattern - higher density to the south
          directionFactor += i < 0 ? 0.25 : -0.15;
        }
        
        // Location-specific crowd patterns based on authentic Kumbh Mela crowd dynamics
        switch (location) {
          case "Ramkund":
            // Ramkund - Main bathing ghat, critical ritual site with distinctive crowd patterns
            // Morning: Concentrated at water's edge for bathing rituals
            if (hour >= 4 && hour <= 10) {
              // During morning bathing hours - intense concentration near water
              directionFactor *= i < 0 ? 2.0 : 0.7; // Strong south preference for morning baths
              directionFactor *= Math.abs(i) < numCells/4 ? 1.5 : 0.8; // Concentrated in center
            } else if (hour >= 17 && hour <= 22) {
              // Evening aarti creates circular patterns around platforms
              const distFromCenter = Math.sqrt(i*i + j*j);
              if (distFromCenter < numCells/5) {
                directionFactor *= 1.8; // Center density during aarti
              } else if (distFromCenter < numCells/3) {
                directionFactor *= 1.4; // Ring of observers
              } else {
                directionFactor *= 0.7; // Less dense outside
              }
            } else {
              // General daytime pattern - high at water edge, fading outward
              directionFactor *= i < 0 ? 1.5 : 0.8; // South (water) preference
            }
            break;

          case "Kalaram Temple":
            // Temple shows queue-like patterns with lines extending east
            // Sacred space with linear entry patterns and circular inner courtyard
            if (hour >= 5 && hour <= 12) {
              // Morning worship times - long lines from east entrance
              if (j > 0) {
                // Eastern approach (entry path)
                directionFactor *= 1.8 - (Math.abs(j) / numCells/2) * 0.8; // Tapering queue from east
                directionFactor *= Math.abs(i) < numCells/6 ? 1.4 : 0.6; // Narrow queue
              } else {
                // Inside temple complex
                const distFromCenter = Math.sqrt(i*i + j*j);
                directionFactor *= distFromCenter < numCells/8 ? 1.7 : 0.8; // Dense core
              }
            } else if (hour >= 16 && hour <= 20) {
              // Evening worship - circular crowd in courtyard with radial paths
              const angle = Math.atan2(i, j);
              // Create 4 radial paths matching temple architecture
              const radialFactor = (Math.abs(Math.sin(angle * 2)) * 0.5) + 0.7;
              directionFactor *= radialFactor;
              // Central courtyard density
              const distFromCenter = Math.sqrt(i*i + j*j);
              if (distFromCenter < numCells/6) {
                directionFactor *= 1.5; // Crowded inner courtyard
              }
            } else {
              // Regular hours - concentrated inside temple complex
              directionFactor *= j < 0 ? 1.3 : 0.9; // Western side (temple interior)
            }
            break;

          case "Tapovan":
            // Tapovan - sprawling camping area with different density zones
            // Shows organic clustering around sacred spots with lower overall density
            if (hour >= 4 && hour <= 8) {
              // Early morning meditation - clusters around spiritual sites
              if ((i*i + j*j) % 3 < 1) { // Create meditation clusters
                directionFactor *= 1.4;
              } else {
                directionFactor *= 0.7;
              }
            } else if (hour >= 10 && hour <= 15) {
              // Daytime - scattered groups throughout with activity centers
              const distortion = Math.sin(i/2) * Math.cos(j/2); // Create organic pattern
              directionFactor *= 0.8 + Math.abs(distortion) * 0.6;
              // Northern activity centers
              if (i > 0 && Math.abs(j) < numCells/5) {
                directionFactor *= 1.3;
              }
            } else {
              // Evening - concentration around camp clusters
              // Simulate scattered camping groups with some empty spaces
              const campPattern = (Math.sin(i*3) * Math.cos(j*2)) > 0 ? 1.2 : 0.6;
              directionFactor *= campPattern;
            }
            break;

          case "Godavari Ghat":
            // Ghat has riverside movement patterns, flowing north to south
            // High density at specific ritual points along water
            if (hour >= 5 && hour <= 11) {
              // Morning bathing - concentrated spots along western edge with queues
              if (j < -numCells/4) { // Western edge (water)
                directionFactor *= 1.8; // Water edge density
                // Create 3 high-density bathing spots
                if (Math.abs(i % (numCells/3)) < numCells/8) {
                  directionFactor *= 1.5; // Ritual bathing spots
                }
              } else if (j < 0) {
                directionFactor *= 1.2; // Queueing area
                directionFactor *= 1.0 - (Math.abs(j) / numCells/2) * 0.5; // Tapers toward water
              } else {
                directionFactor *= 0.6; // Lower density away from water
              }
            } else if (hour >= 16 && hour <= 21) {
              // Evening ceremonies - concentrated in central area with viewing crowds
              const centralDist = Math.sqrt(Math.pow(i, 2) + Math.pow(j + numCells/8, 2)); // Center slightly toward water
              if (centralDist < numCells/5) {
                directionFactor *= 1.6; // Central ceremony area
              } else if (j < 0 && centralDist < numCells/3) {
                directionFactor *= 1.3; // Viewing crowds near water
              } else {
                directionFactor *= 0.7; // Lower density in periphery
              }
            } else {
              // Regular hours - higher at water, gradually decreasing
              directionFactor *= j < 0 ? 1.25 + (j / -numCells/2) * 0.5 : 0.75; // Gradient from water
            }
            break;
        }
        
        // Apply randomness to create more natural-looking patterns
        const randomFactor = 0.8 + Math.random() * 0.4;
        
        // Calculate final cell density
        const cellDensity = baseDensity * 
          (1 - (distanceFromCenter * 0.8)) * // Density decreases from center
          directionFactor * 
          timeFactor * 
          randomFactor;
        
        // Create cell boundary
        const cell = [
          [cellLat - gridCellSize/2, cellLng - gridCellSize/2],
          [cellLat - gridCellSize/2, cellLng + gridCellSize/2],
          [cellLat + gridCellSize/2, cellLng + gridCellSize/2],
          [cellLat + gridCellSize/2, cellLng - gridCellSize/2]
        ] as L.LatLngExpression[];
        
        // Only add cells with meaningful density
        if (cellDensity > 0.1) {
          cells.push({
            cell,
            density: cellDensity
          });
        }
      }
    }
    
    return cells;
  };

  // Helper functions for safety advisories
  const getLocationSpecificAdvisory = (location: string, safetyLevel: 'safe' | 'moderate' | 'crowded' | 'dangerous') => {
    const baseAdvice: Record<string, string> = {
      safe: 'Safe for all visitors. Easy movement and navigation.',
      moderate: 'Moderate crowding observed. Keep belongings secure.',
      crowded: 'High crowd density. Follow official directions.',
      dangerous: 'CRITICAL ALERT: Avoid this area. Emergency protocols active.'
    };

    // Add location-specific advice
    switch (location) {
      case "Ramkund":
        return safetyLevel === 'crowded' || safetyLevel === 'dangerous'
          ? `${baseAdvice[safetyLevel]} Use alternative ghats for rituals.`
          : baseAdvice[safetyLevel];
      case "Kalaram Temple":
        return safetyLevel === 'crowded' || safetyLevel === 'dangerous'
          ? `${baseAdvice[safetyLevel]} Consider visiting during off-peak hours.`
          : baseAdvice[safetyLevel];
      default:
        return baseAdvice[safetyLevel];
    }
  };

  // Update the heatmap layer when crowdLevels change
  useEffect(() => {
    if (!mapRef.current || !crowdLevels || crowdLevels.length === 0) return;

    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
      heatLayerRef.current = null;
    }

    if (!showHeatLayer) return;

    const expandedHeatmapData: [number, number, number][] = [];

    crowdLevels.forEach(level => {
      const coordinates = locationCoordinates[level.location];
      if (!coordinates) return;

      // Simulate dynamic crowd movement
      const simulatedCount = simulateRealisticCrowds(level.location, level.currentCount);
      const ratio = simulatedCount / level.capacity;
      const baseIntensity = ratio * 100;

      const hour = new Date().getHours();

      try {
        // Create main heat point
        expandedHeatmapData.push([
          coordinates[0],
          coordinates[1],
          baseIntensity > 0 ? baseIntensity : 1 // Ensure non-zero intensity
        ]);

        // Add surrounding points with location-specific patterns
        const numPoints = Math.min(20, Math.max(5, Math.floor(10 + (ratio * 5)))); // Limit points between 5-20
        for (let i = 0; i < numPoints; i++) {
          if (i >= numPoints) break; // Safety check to prevent infinite loops
          
          const angle = (Math.PI * 2 * i) / (numPoints || 1); // Prevent division by zero
          const distance = Math.min(0.002, Math.max(0.0001, 0.002 * (0.5 + Math.random() * 0.5))); // Limit distance
          const newLat = coordinates[0] + Math.sin(angle) * distance;
          const newLng = coordinates[1] + Math.cos(angle) * distance;
          const intensity = Math.max(1, baseIntensity * (0.3 + Math.random() * 0.4)); // Ensure non-zero intensity

          // Validate coordinates before adding
          if (isFinite(newLat) && isFinite(newLng) && isFinite(intensity)) {
            expandedHeatmapData.push([newLat, newLng, intensity]);
          }
        }

        // Add movement trails based on time of day
        if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 19)) {
          // Add directional heat trails during peak hours
          const trailDirection = hour < 12 ? 1 : -1;
          for (let i = 1; i <= 3; i++) {
            const trailLat = coordinates[0] + (0.001 * i * trailDirection);
            const trailLng = coordinates[1] + (0.001 * i);
            const trailIntensity = Math.max(1, baseIntensity * (1 - (i * 0.2))); // Ensure non-zero intensity
            
            // Validate coordinates before adding
            if (isFinite(trailLat) && isFinite(trailLng) && isFinite(trailIntensity)) {
              expandedHeatmapData.push([trailLat, trailLng, trailIntensity]);
            }
          }
        }
      } catch (error) {
        console.error("Error generating heatmap data:", error);
      }
    });

    // Create enhanced heat layer with dynamic patterns (only if we have data)
    if (expandedHeatmapData.length > 0 && mapRef.current) {
      try {
        heatLayerRef.current = L.heatLayer(expandedHeatmapData, {
          radius: 45,
          blur: 35,
          maxZoom: 15,
          max: 120,
          gradient: {
            0.0: '#4ade80',
            0.2: '#22c55e',
            0.4: '#f59e0b',
            0.6: '#f97316',
            0.75: '#ef4444',
            0.85: '#b91c1c',
            0.95: '#7f1d1d'
          }
        }).addTo(mapRef.current);
      } catch (error) {
        console.error("Error creating heat layer:", error);
      }
    }

  }, [crowdLevels, facilities, mapRef, showHeatLayer]);

  // Update facility markers when data changes or filter changes
  useEffect(() => {
    if (!mapRef.current || !facilities) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add facility markers
    facilities.forEach((facility) => {
      if (selectedType && facility.type !== selectedType) return;

      if (facility.location && typeof facility.location === 'object' && 'lat' in facility.location && 'lng' in facility.location) {
        const lat = Number(facility.location.lat);
        const lng = Number(facility.location.lng);
        
        if (!isNaN(lat) && !isNaN(lng) && mapRef.current) {
          const marker = L.marker(
            [lat, lng],
            { icon: createCustomIcon(facility.type) }
          );
          
          marker.addTo(mapRef.current)
            .bindPopup(
              `<b>${facility.name}</b><br>${facility.address || ''}<br>${
                facility.contact ? `Contact: ${facility.contact}` : ""
              }`
            );
          markersRef.current.push(marker);
        }
      }
    });

    // Add shuttle markers
    if (shuttles) {
      shuttles.forEach((shuttle) => {
        if (selectedType && selectedType !== 'shuttle_stop') return;
        
        if (shuttle.coordinates && typeof shuttle.coordinates === 'object' && 'lat' in shuttle.coordinates && 'lng' in shuttle.coordinates) {
          const lat = Number(shuttle.coordinates.lat);
          const lng = Number(shuttle.coordinates.lng);
          
          if (!isNaN(lat) && !isNaN(lng) && mapRef.current) {
            const marker = L.marker(
              [lat, lng],
              { icon: createCustomIcon('shuttle_stop') }
            );
            
            marker.addTo(mapRef.current)
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
          }
        }
      });
    }

    // Add restroom markers
    if (restrooms) {
      restrooms.forEach((restroom) => {
        if (selectedType && selectedType !== 'restroom') return;
        
        if (restroom.coordinates && typeof restroom.coordinates === 'object' && 'lat' in restroom.coordinates && 'lng' in restroom.coordinates) {
          const lat = Number(restroom.coordinates.lat);
          const lng = Number(restroom.coordinates.lng);
          
          if (!isNaN(lat) && !isNaN(lng) && mapRef.current) {
            const marker = L.marker(
              [lat, lng],
              { icon: createCustomIcon('restroom') }
            );
            
            marker.addTo(mapRef.current)
            .bindPopup(
              `<div class="text-sm">
                <h3 class="font-bold text-purple-600">${restroom.location}</h3>
                <p><b>Nearest Stop:</b> ${restroom.nearestStop}</p>
                <p class="mt-1"><span class="px-2 py-1 rounded text-xs ${
                restroom.status === 'operational' ? 'bg-green-100 text-green-700' :
                  restroom.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
              }">${restroom.status}</span></p>
                ${restroom.accessibility ? '<p class="mt-1"><span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Accessible</span></p>' : ''}
              </div>`
            );
            markersRef.current.push(marker);
          }
        }
      });
    }
  }, [facilities, shuttles, restrooms, selectedType, mapRef, createCustomIcon]);

  // Safety zones effect
  useEffect(() => {
    if (!mapRef.current || !crowdLevels || crowdLevels.length === 0) return;

    // Clear existing safety zones
    safetyZonesRef.current.forEach(zone => zone.remove());
    safetyZonesRef.current = [];

    if (!showSafetyZones) return;

    crowdLevels.forEach(level => {
      const coordinates = locationCoordinates[level.location];
      if (!coordinates) return;

      // Get location-specific thresholds
      const thresholds = getSafetyThresholds(level.location);

      // Simulate dynamic crowd movement
      const simulatedCount = simulateRealisticCrowds(level.location, level.currentCount);
      const ratio = simulatedCount / level.capacity;

      // Determine safety level with location-specific thresholds
      let safetyLevel: 'safe' | 'moderate' | 'crowded' | 'dangerous';
      let safetyColor: string;
      let pulsate = false;

      if (ratio < thresholds.safe) {
        safetyLevel = 'safe';
        safetyColor = '#10b981';
      } else if (ratio < thresholds.moderate) {
        safetyLevel = 'moderate';
        safetyColor = '#f59e0b';
      } else if (ratio < thresholds.crowded) {
        safetyLevel = 'crowded';
        safetyColor = '#f97316';
        pulsate = true;
      } else {
        safetyLevel = 'dangerous';
        safetyColor = '#ef4444';
        pulsate = true;
      }

      // Dynamic radius based on location and crowd level
      const baseRadius = 200;
      const locationMultiplier = level.location === "Ramkund" ? 1.2 :
        level.location === "Tapovan" ? 1.5 : 1;
      const radius = (baseRadius + (ratio * 200)) * locationMultiplier;

      // Enhanced circle options
      const circleOptions: L.CircleOptions = {
        color: safetyColor,
        fillColor: safetyColor,
        fillOpacity: 0.2 + (ratio * 0.2), // Opacity increases with crowd density
        weight: 2,
        className: `safety-zone ${pulsate ? 'animate-pulse-slow' : ''}`,
        radius: radius
      };

      // Add visual effects for crowded/dangerous zones
      if (pulsate) {
        circleOptions.dashArray = '5, 10';
      }

      let safetyZone: L.Circle = L.circle(coordinates, circleOptions);
      
      if (mapRef.current) {
        safetyZone.addTo(mapRef.current);
      }
      
      safetyZonesRef.current.push(safetyZone);
      
      // Add popup with safety info
      safetyZone.bindPopup(`
        <div class="text-sm p-4 max-w-sm">
          <div class="flex items-center justify-between border-b pb-2 mb-3">
            <h3 class="font-bold text-lg" style="color: ${safetyColor}">${level.location}</h3>
            <span class="px-2 py-1 rounded-full text-xs font-semibold" 
                  style="background: ${safetyColor}20; color: ${safetyColor}">
              ${safetyLevel.toUpperCase()}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-gray-50 p-2 rounded">
              <div class="text-xs text-gray-500">Current Count</div>
              <div class="font-semibold">${simulatedCount.toLocaleString()}</div>
            </div>
            <div class="bg-gray-50 p-2 rounded">
              <div class="text-xs text-gray-500">Capacity</div>
              <div class="font-semibold">${level.capacity.toLocaleString()}</div>
            </div>
            <div class="bg-gray-50 p-2 rounded">
              <div class="text-xs text-gray-500">Occupancy</div>
              <div class="font-semibold">${Math.round(ratio * 100)}%</div>
            </div>
            <div class="bg-gray-50 p-2 rounded">
              <div class="text-xs text-gray-500">Status</div>
              <div class="font-semibold" style="color: ${safetyColor}">
                ${safetyLevel.toUpperCase()}
              </div>
            </div>
          </div>

          <div class="rounded-lg p-3 flex gap-2 items-start" 
               style="background: ${safetyColor}10; border: 1px solid ${safetyColor}30">
            <div class="mt-1">
              ${safetyLevel === 'dangerous'
                ? '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ' + safetyColor + '"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
                : '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: ' + safetyColor + '"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
              }
            </div>
            <div>
              <div class="font-medium mb-1" style="color: ${safetyColor}">Safety Advisory:</div>
              <div class="text-sm" style="color: ${safetyColor}">
                ${getLocationSpecificAdvisory(level.location, safetyLevel)}
              </div>
            </div>
          </div>
        </div>
      `, {
        className: `safety-popup safety-${safetyLevel}`,
        maxWidth: 350
      });
    });
  }, [crowdLevels, mapRef, showSafetyZones, getLocationSpecificAdvisory, getSafetyThresholds, simulateRealisticCrowds, locationCoordinates]);

  // Get the different facility types for filters
  const facilityTypes = facilities
    ? Array.from(
        new Set(facilities.map((facility) => facility.type))
      ).sort()
    : [];

  // Handle filter click
  const handleFilterClick = (type: string | null) => {
    setSelectedType(type);
  };

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const results: {name: string, type: string, location: {lat: number, lng: number}}[] = [];

    // Search through facilities
    if (facilities) {
      facilities.forEach(facility => {
        if (
          facility.name?.toLowerCase().includes(lowercaseQuery) ||
          facility.address?.toLowerCase().includes(lowercaseQuery) ||
          facility.type?.toLowerCase().includes(lowercaseQuery) ||
          getTypeName(facility.type).toLowerCase().includes(lowercaseQuery)
        ) {
          if (facility.location && typeof facility.location === 'object' && 'lat' in facility.location && 'lng' in facility.location) {
            results.push({
              name: facility.name,
              type: facility.type,
              location: {
                lat: Number(facility.location.lat),
                lng: Number(facility.location.lng)
              }
            });
          }
        }
      });
    }

    // Search through shuttles
    if (shuttles) {
      shuttles.forEach(shuttle => {
        if (
          shuttle.routeName?.toLowerCase().includes(lowercaseQuery) ||
          shuttle.currentLocation?.toLowerCase().includes(lowercaseQuery) ||
          shuttle.nextStop?.toLowerCase().includes(lowercaseQuery)
        ) {
          if (shuttle.coordinates && typeof shuttle.coordinates === 'object' && 'lat' in shuttle.coordinates && 'lng' in shuttle.coordinates) {
            results.push({
              name: `${shuttle.routeName} (${shuttle.currentLocation})`,
              type: 'shuttle_stop',
              location: {
                lat: Number(shuttle.coordinates.lat),
                lng: Number(shuttle.coordinates.lng)
              }
            });
          }
        }
      });
    }

    // Search through restrooms
    if (restrooms) {
      restrooms.forEach(restroom => {
        if (
          restroom.location?.toLowerCase().includes(lowercaseQuery) ||
          restroom.nearestStop?.toLowerCase().includes(lowercaseQuery) ||
          restroom.status?.toLowerCase().includes(lowercaseQuery) ||
          'restroom'.includes(lowercaseQuery) ||
          'toilet'.includes(lowercaseQuery)
        ) {
          if (restroom.coordinates && typeof restroom.coordinates === 'object' && 'lat' in restroom.coordinates && 'lng' in restroom.coordinates) {
            results.push({
              name: `${restroom.location} Restroom${restroom.accessibility ? ' (Accessible)' : ''}`,
              type: 'restroom',
              location: {
                lat: Number(restroom.coordinates.lat),
                lng: Number(restroom.coordinates.lng)
              }
            });
          }
        }
      });
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  // Helper function to get type name for display
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

  // Toggle functions for visualization layers - ensuring they're mutually exclusive
  const toggleDensityGrid = () => {
    // If turning on density grid, turn off area zones and set view mode to density
    if (!showDensityGrid) {
      setShowAreaZones(false);
      setActiveViewMode('density');
    } else {
      // If turning off density grid, revert to facilities view mode
      setActiveViewMode('facilities');
    }
    setShowDensityGrid(!showDensityGrid);
  };
  
  const toggleAreaZones = () => {
    // If turning on area zones, turn off density grid and set view mode to area
    if (!showAreaZones) {
      setShowDensityGrid(false);
      setActiveViewMode('area');
    } else {
      // If turning off area zones, revert to facilities view mode
      setActiveViewMode('facilities');
    }
    setShowAreaZones(!showAreaZones);
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
              onClick={() => toggleViewMode('heatmap')}
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
              onClick={() => toggleViewMode('safety')}
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

          {/* New visualization toggles */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={toggleDensityGrid}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                showDensityGrid
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"></path>
                <circle cx="10" cy="14" r="2"></circle>
                <circle cx="16" cy="16" r="2"></circle>
              </svg>
              <span>Density Grid</span>
            </button>

            <button
              onClick={toggleAreaZones}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                showAreaZones
                  ? 'bg-violet-100 text-violet-800'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M18 14c0 5.657-4.343 8-8 8s-8-2.343-8-8a8 8 0 0 1 16 0Z"></path>
                <path d="M10 2v8"></path>
                <path d="M2 10h16"></path>
              </svg>
              <span>Area Zones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search functionality */}
      <div className="p-2 border-b">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for facilities, temples, services..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm w-full"
          />
          {isSearching ? (
            <div className="absolute left-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
          ) : (
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          )}
          {searchQuery.length > 0 && (
            <div className="absolute right-3 top-2.5">
              <button 
                className="h-4 w-4 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                ✕
              </button>
            </div>
          )}
          {searchQuery.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {searchResults.length === 0 && !isSearching && searchQuery.length >= 2 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  <span>No facilities found matching "{searchQuery}"</span>
                  <div className="text-xs mt-1">Try a different search term or browse the map</div>
                </div>
              ) : (
                searchResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    if (mapRef.current && result.location) {
                      mapRef.current.setView([result.location.lat, result.location.lng], 16);
                      setSearchQuery('');
                    }
                  }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: getTypeColor(result.type) }}
                  ></span>
                  <span>{result.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{getTypeName(result.type)}</span>
                </button>
              )))}
            </div>
          )}
        </div>
      </div>

      {/* Facility type filters */}
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
      
      {/* Info panels for visualization modes */}
      {showHeatLayer && (
        <div className="p-2 border-b">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium mb-1">Crowd Density Heatmap</div>
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
            <span>Data updates in real-time every 10 seconds. Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}
      
      {showDensityGrid && (
        <div className="p-2 border-b">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium mb-1">Population Density Grid</div>
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
            <span>Grid-based density visualization showing people per square meter. Each cell represents approximately 100m² area with real-time updates.</span>
          </div>
        </div>
      )}
      
      {showAreaZones && (
        <div className="p-2 border-b">
          <div className="flex items-center justify-between">
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
      )}

      {/* Main map container */}
      <div
        ref={setMapContainer}
        className="w-full h-[600px] rounded-b-lg z-0"
      />
    </div>
  );
}