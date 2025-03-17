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
  const specialDates = {
    '2025-03-25': 2.0, // Main Shahi Snan
    '2025-04-08': 1.8, // Chaitra Purnima
    '2025-04-21': 1.7, // Mesh Sankranti
  };

  const dateStr = date.toISOString().split('T')[0];
  return specialDates[dateStr] || 1.0;
};

// Enhanced crowd simulation with realistic patterns
const simulateRealisticCrowds = (location: string, baseCount: number): number => {
  const now = new Date();
  const hour = now.getHours();

  // Combine multiple factors
  const timeFactor = getTimeFactor(hour, location);
  const weatherFactor = getWeatherImpact('pleasant'); // Replace with actual weather data
  const festivalFactor = getFestivalImpact(now);

  // Random variation (80-120% of calculated value)
  const randomFactor = 0.8 + Math.random() * 0.4;

  // Calculate final crowd count
  const simulatedCount = Math.round(
    baseCount * timeFactor * weatherFactor * festivalFactor * randomFactor
  );

  return Math.min(simulatedCount, baseCount * 2); // Cap at 200% of base count
};

// Enhanced heat pattern generation
const getEnhancedHeatPattern = (location: string, crowdLevel: number, hour: number) => {
  const basePattern = {
    radius: 45,
    blur: 35,
    maxZoom: 15,
    max: 120
  };

  // Location-specific patterns
  switch (location) {
    case "Ramkund":
      return {
        ...basePattern,
        radius: 50 + (crowdLevel * 5),
        gradient: {
          0.0: '#4ade80',
          0.2: '#22c55e',
          0.4: '#f59e0b',
          0.6: '#f97316',
          0.75: '#ef4444',
          0.85: '#b91c1c',
          0.95: '#7f1d1d'
        }
      };
    case "Kalaram Temple":
      return {
        ...basePattern,
        radius: 40 + (crowdLevel * 4),
        gradient: hour >= 18 ? {
          // Evening gradient
          0.0: '#818cf8',
          0.3: '#6366f1',
          0.5: '#4f46e5',
          0.7: '#4338ca',
          0.85: '#3730a3',
          0.95: '#312e81'
        } : {
          // Day gradient
          0.0: '#60a5fa',
          0.3: '#3b82f6',
          0.5: '#2563eb',
          0.7: '#1d4ed8',
          0.85: '#1e40af',
          0.95: '#1e3a8a'
        }
      };
    case "Tapovan":
      return {
        ...basePattern,
        radius: 55 + (crowdLevel * 6),
        gradient: {
          0.0: '#34d399',
          0.3: '#10b981',
          0.5: '#059669',
          0.7: '#047857',
          0.85: '#065f46',
          0.95: '#064e3b'
        }
      };
    default:
      return basePattern;
  }
};

// Update the dynamic area boundary calculation to be more realistic
const calculateDynamicBoundary = (center: L.LatLngExpression, crowdDensity: number): L.LatLngExpression[] => {
  const baseRadius = 0.002; // Base radius in degrees
  const points: L.LatLngExpression[] = [];
  const numPoints = 12; // Increased number of points for smoother boundaries

  // Create irregular polygon based on crowd density and time-based factors
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeOffset = (minute / 60) * Math.PI * 2; // Creates movement over time

  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPoints + timeOffset;
    // More dynamic radius variation based on time and crowd density
    const radiusVariation = 0.7 + Math.sin(angle + hour) * 0.3 + Math.random() * 0.3;
    const adjustedRadius = baseRadius * (1 + crowdDensity) * radiusVariation;

    const lat = (center as [number, number])[0] + Math.sin(angle) * adjustedRadius;
    const lng = (center as [number, number])[1] + Math.cos(angle) * adjustedRadius;
    points.push([lat, lng]);
  }

  // Close the polygon
  points.push(points[0]);
  return points;
};

// Enhanced flow indicators with more realistic patterns
const getFlowIndicators = (coordinates: [number, number], location: string, hour: number): L.LatLngExpression[][] => {
  const indicators: L.LatLngExpression[][] = [];
  const baseDistance = 0.001;
  const numIndicators = 5; // Increased number of indicators

  // Get minute-based variation for smooth transitions
  const minute = new Date().getMinutes();
  const timeOffset = (minute / 60) * Math.PI;

  for (let i = 0; i < numIndicators; i++) {
    let direction: [number, number];
    const distanceFactor = 1 + Math.sin(timeOffset + (i / numIndicators) * Math.PI) * 0.3;

    // Enhanced flow patterns based on location and time
    switch (location) {
      case "Ramkund":
        if (hour >= 4 && hour <= 9) {
          // Morning flow towards the ghat
          direction = [0, baseDistance * distanceFactor];
        } else if (hour >= 17 && hour <= 20) {
          // Evening flow away from ghat
          direction = [0, -baseDistance * distanceFactor];
        } else {
          // Circular movement during other times
          const angle = (i / numIndicators) * Math.PI * 2 + timeOffset;
          direction = [
            Math.sin(angle) * baseDistance * distanceFactor,
            Math.cos(angle) * baseDistance * distanceFactor
          ];
        }
        break;

      case "Kalaram Temple":
        if (hour >= 6 && hour <= 11) {
          // Morning prayer time flow
          direction = [baseDistance * distanceFactor, baseDistance * distanceFactor * 0.5];
        } else {
          // Radial flow pattern
          const angle = (i / numIndicators) * Math.PI + timeOffset;
          direction = [
            Math.cos(angle) * baseDistance * distanceFactor,
            Math.sin(angle) * baseDistance * distanceFactor
          ];
        }
        break;

      case "Tapovan":
        // Spiral flow pattern
        const angle = (i / numIndicators) * Math.PI * 2 + timeOffset;
        const spiralFactor = 1 + (i / numIndicators) * 0.5;
        direction = [
          Math.cos(angle) * baseDistance * distanceFactor * spiralFactor,
          Math.sin(angle) * baseDistance * distanceFactor * spiralFactor
        ];
        break;

      default:
        // Default circular flow
        const defaultAngle = (i / numIndicators) * Math.PI * 2 + timeOffset;
        direction = [
          Math.sin(defaultAngle) * baseDistance * distanceFactor,
          Math.cos(defaultAngle) * baseDistance * distanceFactor
        ];
    }

    indicators.push([
      coordinates,
      [coordinates[0] + direction[0], coordinates[1] + direction[1]]
    ]);
  }

  return indicators;
};

// Helper function to add enhanced density marker
interface DensityLevel {
  color: string;
  label: string;
}

const getDensityColor = (density: number): DensityLevel => {
  if (density >= 4) return { color: '#312e81', label: 'Severe' }; // indigo-900
  if (density >= 3) return { color: '#4338ca', label: 'Critical' }; // indigo-700
  if (density >= 2) return { color: '#6366f1', label: 'High' }; // indigo-500
  if (density >= 1) return { color: '#818cf8', label: 'Moderate' }; // indigo-400
  if (density >= 0.5) return { color: '#a5b4fc', label: 'Low' }; // indigo-300
  return { color: '#c7d2fe', label: 'Minimal' }; // indigo-200
};

const addEnhancedDensityMarker = (map: L.Map, coordinates: [number, number], level: CrowdLevel, simulatedCount: number, density: number, areaSize: number) => {
  const { color, label } = getDensityColor(density);

  L.marker(coordinates, {
    icon: L.divIcon({
      className: 'density-marker',
      html: `
        <div class="relative group">
          <div class="absolute -inset-1 rounded-lg bg-white opacity-75 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative flex items-center justify-center p-2 rounded-lg border-2 shadow-lg bg-white"
               style="border-color: ${color}">
            <div class="text-xs font-bold" style="color: ${color}">
              ${density.toFixed(1)}
              <span class="text-[10px] opacity-75">/m²</span>
            </div>
          </div>
        </div>
      `,
      iconSize: [48, 32],
      iconAnchor: [24, 16]
    })
  }).addTo(map)
    .bindPopup(`
    <div class="text-sm p-4">
      <div class="flex items-center justify-between border-b pb-2 mb-3">
        <h3 class="font-bold text-lg text-indigo-600">${level.location}</h3>
        <span class="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
          ${label}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-gray-50 p-2 rounded">
          <div class="text-xs text-gray-500">Current Count</div>
          <div class="font-semibold">${simulatedCount.toLocaleString()}</div>
        </div>
        <div class="bg-gray-50 p-2 rounded">
          <div class="text-xs text-gray-500">Area Size</div>
          <div class="font-semibold">${areaSize.toLocaleString()} m²</div>
        </div>
        <div class="bg-gray-50 p-2 rounded">
          <div class="text-xs text-gray-500">Density</div>
          <div class="font-semibold text-indigo-600">${density.toFixed(2)} /m²</div>
        </div>
        <div class="bg-gray-50 p-2 rounded">
          <div class="text-xs text-gray-500">Status</div>
          <div class="font-semibold" style="color: ${color}">${label}</div>
        </div>
      </div>

      <div class="rounded-lg p-3 bg-indigo-50 border border-indigo-100">
        <div class="font-medium text-indigo-700 mb-1">Crowd Management Status:</div>
        <div class="text-sm text-indigo-600">
          ${
            density >= 4 ? 'CRITICAL - Immediate crowd control measures in effect'
              : density >= 3 ? 'WARNING - Active monitoring and flow control in place'
                : density >= 2 ? 'CAUTION - Crowd management personnel deployed'
                  : density >= 1 ? 'MODERATE - Regular monitoring in effect'
                    : 'NORMAL - Standard operations'
          }
        </div>
      </div>

      ${density >= 3 ? `
        <div class="mt-3 p-2 bg-red-50 rounded border border-red-100 text-xs">
          <div class="font-medium text-red-700 mb-1">Emergency Protocol Active:</div>
          <div class="text-red-600">Follow official instructions and emergency exit routes.</div>
        </div>
      ` : ''}
    </div>
  `, {
    className: 'density-popup',
    maxWidth: 350
  });
};

// Get location-specific safety thresholds
const getSafetyThresholds = (location: string) => {
  // Different locations have different crowd handling capacities
  switch (location) {
    case "Ramkund":
      return {
        safe: 0.3,
        moderate: 0.5,
        crowded: 0.7,
        dangerous: 0.85
      };
    case "Kalaram Temple":
      return {
        safe: 0.25,
        moderate: 0.45,
        crowded: 0.65,
        dangerous: 0.8
      };
    case "Tapovan":
      return {
        safe: 0.35,
        moderate: 0.55,
        crowded: 0.75,
        dangerous: 0.9
      };
    case "Godavari Ghat":
      return {
        safe: 0.3,
        moderate: 0.5,
        crowded: 0.7,
        dangerous: 0.85
      };
    default:
      return {
        safe: 0.3,
        moderate: 0.5,
        crowded: 0.7,
        dangerous: 0.85
      };
  }
};

// Get location-specific heat patterns
const getHeatPattern = (location: string, crowdLevel: number) => {
  const basePattern = {
    radius: 45,
    blur: 35,
    maxZoom: 15,
    max: 120
  };

  // Customize heat patterns based on location
  switch (location) {
    case "Ramkund":
      return {
        ...basePattern,
        radius: 50 + (crowdLevel * 5),
        gradient: {
          0.0: '#4ade80',
          0.2: '#22c55e',
          0.4: '#f59e0b',
          0.6: '#f97316',
          0.75: '#ef4444',
          0.85: '#b91c1c',
          0.95: '#7f1d1d'
        }
      };
    case "Kalaram Temple":
      return {
        ...basePattern,
        radius: 40 + (crowdLevel * 4),
        gradient: {
          0.0: '#818cf8',
          0.3: '#6366f1',
          0.5: '#4f46e5',
          0.7: '#4338ca',
          0.85: '#3730a3',
          0.95: '#312e81'
        }
      };
    case "Tapovan":
      return {
        ...basePattern,
        radius: 55 + (crowdLevel * 6),
        gradient: {
          0.0: '#34d399',
          0.3: '#10b981',
          0.5: '#059669',
          0.7: '#047857',
          0.85: '#065f46',
          0.95: '#064e3b'
        }
      };
    default:
      return basePattern;
  }
};


type LocationCoordinates = Record<string, [number, number]>;
type LocationAreas = Record<string, number>;

// Define the coordinates map
const locationCoordinates: LocationCoordinates = {
  "Ramkund": [20.0059, 73.7913],
  "Kalaram Temple": [20.0064, 73.7904],
  "Tapovan": [20.0116, 73.7938],
  "Godavari Ghat": [20.0030, 73.7900],
  "Trimbakeshwar": [19.9322, 73.5309]
};

// Define the areas map
const locationAreas: LocationAreas = {
  "Ramkund": 5000,
  "Kalaram Temple": 3500,
  "Tapovan": 8000,
  "Godavari Ghat": 4000,
  "Trimbakeshwar": 6000
};

export function FacilityMap() {
  // For view modes - only one active at a time
  const [activeViewMode, setActiveViewMode] = useState<ViewMode>('facilities');

  // For facilities map
  const mapRef = useRef<L.Map | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLElement | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // For heatmap (integrated with the main map)
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  // For safety zones
  const safetyZonesRef = useRef<L.Circle[]>([]);

  // For density map
  const densityMapRef = useRef<L.Map | null>(null);
  const [densityMapContainer, setDensityMapContainer] = useState<HTMLElement | null>(null);

  // For area map
  const areaMapRef = useRef<L.Map | null>(null);
  const [areaMapContainer, setAreaMapContainer] = useState<HTMLElement | null>(null);

  // Helper function to toggle view modes
  const toggleViewMode = (mode: ViewMode) => {
    // If already active, turn it off and go back to base facilities view
    if (activeViewMode === mode) {
      setActiveViewMode('facilities');
    } else {
      setActiveViewMode(mode);
    }
  };

  // These computed properties help determine if specific views are active
  // Based on the currently selected view mode
  const showHeatLayer = activeViewMode === 'heatmap';
  const showSafetyZones = activeViewMode === 'safety';

  // For auxiliary maps (density and area) - now managed through view modes
  const showAuxiliaryMap = activeViewMode === 'density' || activeViewMode === 'area';
  const auxiliaryMapType = activeViewMode === 'density' ? 'density' :
    activeViewMode === 'area' ? 'area' : undefined;

  // Queries with increased real-time refresh rates
  const { data: facilities } = useQuery<Facility[]>({
    queryKey: ["/api/facilities"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: shuttles } = useQuery<Shuttle[]>({
    queryKey: ["/api/shuttle-locations"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: restrooms } = useQuery<Restroom[]>({
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

    // Set up interval for continuous updates
    const updateInterval = setInterval(() => {
      // Clear existing layers
      areaMapRef.current?.eachLayer(layer => {
        if (layer instanceof L.TileLayer) return;
        layer.remove();
      });

      // Get current time info for dynamic updates
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const timeOffset = (minute / 60) * Math.PI * 2;

      // Define the different zones for Kumbh Mela with dynamic boundaries
      const kumbhZones = [
        {
          name: "Main Ceremonial Area",
          center: [20.0059, 73.7913] as [number, number],
          basePoints: [
            [20.0067, 73.7920],
            [20.0080, 73.7915],
            [20.0075, 73.7900],
            [20.0062, 73.7892],
            [20.0045, 73.7902],
            [20.0050, 73.7916]
          ] as [number, number][],
          color: "#7c3aed",
          status: "Busy",
          crowdFactor: 0.8 + Math.sin(timeOffset) * 0.2
        },
        {
          name: "Accommodation Zone",
          center: [20.0116, 73.7938] as [number, number],
          basePoints: [
            [20.0130, 73.7950],
            [20.0145, 73.7940],
            [20.0140, 73.7925],
            [20.0125, 73.7920],
            [20.0105, 73.7930],
            [20.0110, 73.7945]
          ] as [number, number][],
          color: "#ea580c",
          status: hour >= 22 || hour <= 6 ? "Peak Hours" : "Available",
          crowdFactor: hour >= 22 || hour <= 6 ? 0.9 : 0.6
        },
        {
          name: "Parking & Transport Zone",
          center: [20.0030, 73.7900] as [number, number],
          basePoints: [
            [20.0040, 73.7910],
            [20.0050, 73.7905],
            [20.0045, 73.7890],
            [20.0030, 73.7880],
            [20.0020, 73.7885],
            [20.0025, 73.7900]
          ] as [number, number][],
          color: "#0d9488",
          status: (hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 19) ? "High Traffic" : "Normal Flow",
          crowdFactor: (hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 19) ? 0.85 : 0.5
        },
        {
          name: "Restricted Area",
          center: [20.0064, 73.7904] as [number, number],
          basePoints: [
            [20.0070, 73.7910],
            [20.0075, 73.7905],
            [20.0070, 73.7895],
            [20.0060, 73.7890],
            [20.0055, 73.7895],
            [20.0060, 73.7905]
          ] as [number, number][],
          color: "#dc2626",
          status: "Limited Access",
          crowdFactor: 0.3
        }
      ] as const;

      // Add dynamic polygons for each zone
      kumbhZones.forEach(zone => {
        // Calculate dynamic points with time-based movement
        const dynamicPoints = zone.basePoints.map(([lat, lng], index) => {
          const angle = (index / zone.basePoints.length) * Math.PI * 2 + timeOffset;
          const crowdOffset = zone.crowdFactor * 0.0002;
          const dynamicOffset = Math.sin(angle) * crowdOffset;

          return [
            lat + dynamicOffset * Math.cos(timeOffset),
            lng + dynamicOffset * Math.sin(timeOffset)
          ] as [number, number];
        });

        // Create polygon with dynamic properties
        const polygon = L.polygon(dynamicPoints, {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.2 + (zone.crowdFactor * 0.3),
          weight: 2,
          className: 'area-zone animate-pulse-slow'
        }).addTo(areaMapRef.current!);

        // Add animated label
        const labelOpacity = 0.7 + Math.sin(timeOffset) * 0.3;
        L.marker(zone.center, {
          icon: L.divIcon({
            className: 'area-label',
            html: `
              <div class="px-2 py-1 rounded-md text-white text-xs font-semibold shadow-md transform transition-all duration-500" 
                   style="background-color: ${zone.color}; white-space: nowrap; opacity: ${labelOpacity}">
                ${zone.name}
                <span class="ml-2 px-1.5 py0.5 bg-white/20 rounded-full text-xs">
                  ${zone.status}
                </span>
              </div>
            `,
            iconSize: [120, 24],
            iconAnchor: [60, 12]
          })
        }).addTo(areaMapRef.current!);

        // Enhanced popup with real-time information
        polygon.bindPopup(`
          <div class="text-sm p-3">
            <h3 class="font-bold border-b pb-1 mb-2" style="color: ${zone.color}">${zone.name}</h3>

            <div class="grid grid-cols-2 gap-y-2 mb-3">
              <div class="font-medium">Status:</div>
              <div class="font-semibold">${zone.status}</div>

              <div class="font-medium">Occupancy:</div>
              <div class="font-semibold">${Math.round(zone.crowdFactor * 100)}%</div>

              <div class="font-medium">Area Size:</div>
              <div class="font-semibold">${(Math.random() * 3 + 1).toFixed(1)} km²</div>
            </div>

            <div class="mt-2 text-xs p-2 rounded-md" 
                 style="background-color: ${zone.color}20; border: 1px solid ${zone.color}40; color: ${zone.color}">
              <div class="font-medium mb-1">Access Information:</div>
              ${getZoneAccessInfo(zone.name, hour)}
            </div>

            ${getEmergencyInfo(zone.name, zone.crowdFactor)}
          </div>
        `, {
          className: 'area-popup',
          maxWidth: 300
        });
      });

      // Update the mainSitesPath coordinates type
      const mainSitesPath: L.LatLngExpression[] = [
        [20.0059, 73.7913], // Ramkund
        [20.0064, 73.7904], // Kalaram Temple
        [20.0116, 73.7938], // Tapovan
        [20.0030, 73.7900]  // Godavari Ghat
      ];

      // Fix the polyline type and add proper coordinates
      L.polyline(mainSitesPath as L.LatLngExpression[], {
        color: '#FF7F00',
        weight: 3,
        opacity: 0.7 + Math.sin(timeOffset) * 0.3,
        dashArray: '5, 8',
        className: 'animated-path'
      }).addTo(areaMapRef.current!)
        .bindPopup(`
          <div class="text-sm p-3">
            <h3 class="font-bold text-[#FF7F00] border-b pb-1 mb-2">Pilgrimage Route</h3>
            <p class="text-xs mb-2">Official route connecting major sites</p>

            <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div class="bg-amber-50 p-2 rounded">
                <div class="text-amber-800 font-medium">Walking Time</div>
                <div class="text-amber-600">~40 minutes</div>
              </div>
              <div class="bg-amber-50 p-2 rounded">
                <div class="text-amber-800 font-medium">Distance</div>
                <div class="text-amber-600">2.5 km</div>
              </div>
            </div>

            <div class="text-xs text-gray-600">
              ${getRouteStatus(hour)}
            </div>
          </div>
        `);

    }, 2000); // Update every 2 seconds for smooth animations

    return () => {
      clearInterval(updateInterval);
    };
  }, [areaMapRef]);

  // Helper functions for area map
  const getZoneAccessInfo = (zoneName: string, hour: number): string => {
    switch (zoneName) {
      case "Restricted Area":
        return "Special permit required. Limited entry hours from 9 AM to 5 PM.";
      case "Main Ceremonial Area":
        return hour >= 4 && hour <= 22
          ? "Open to all devotees. Expected high crowd during ceremonial hours."
          : "Limited access during night hours. Security checkpoints active.";
      case "Accommodation Zone":
        return "Reserved for registered pilgrims. Security check at entry points.";
      default:
        return "Public access. Shuttle services run every 15 minutes.";
    }
  };

  const getEmergencyInfo = (zoneName: string, crowdFactor: number): string => {
    if (crowdFactor > 0.8) {
      return `
        <div class="mt-3 p-2 bg-red-50 rounded border border-red-100 text-xs">
          <div class="font-medium text-red-700 mb-1">High Occupancy Alert:</div>
          <div class="text-red-600">
            • Follow crowd management directions<br>
            • Use alternative routes if possible<br>
            • Emergency exits marked in green
          </div>
        </div>
      `;
    }
    return '';
  };

  const getRouteStatus = (hour: number): string => {
    if (hour >= 22 || hour <= 4) {
      return "⚠️ Night hours: Limited access, enhanced security patrols";
    }
    if (hour >= 4 && hour <= 9) {
      return "🌅 Morning rush: Heavy pilgrim movement expected";
    }
    if (hour >= 17 && hour <= 21) {
      return "🌆 Evening peak: Increased crowd flow";
    }
    return "✅ Normal hours: Regular movement flow";
  };

  // Update the density map
  useEffect(() => {
    if (!densityMapRef.current || !crowdLevels || crowdLevels.length === 0) return;

    // Set up interval for continuous updates
    const updateInterval = setInterval(() => {
      // Clear existing layers except base tile layer
      densityMapRef.current?.eachLayer(layer => {
        if (layer instanceof L.TileLayer) return;
        layer.remove();
      });

      const hour = new Date().getHours();
      const minute = new Date().getMinutes();

      crowdLevels.forEach(level => {
        const coordinates = locationCoordinates[level.location];
        if (!coordinates) return;

        // Enhanced crowd simulation with time-based variations
        const simulatedCount = simulateRealisticCrowds(level.location, level.currentCount);
        const areaSize = locationAreas[level.location] || 5000;
        const density = simulatedCount / areaSize;

        // Create dynamic boundary with time-based movement
        const boundaryPoints = calculateDynamicBoundary(coordinates, density);

        // Add animated density zone
        const densityZone = L.polygon(boundaryPoints, {
          color: getDensityColor(density).color,
          fillColor: getDensityColor(density).color,
          fillOpacity: 0.3 + (density * 0.1) + Math.sin(minute / 60 * Math.PI) * 0.1,
          weight: 2,
          className: 'density-zone animate-pulse-slow'
        }).addTo(densityMapRef.current!);

        // Add dynamic flow indicators
        if (getTimeFactor(hour, level.location) > 1.3) {
          const arrowPoints = getFlowIndicators(coordinates, level.location, hour);
          arrowPoints.forEach(([start, end], index) => {
            const opacity = 0.7 - (index / arrowPoints.length) * 0.5;
            L.polyline([start, end], {
              color: getDensityColor(density).color,
              weight: 2,
              opacity: opacity,
              dashArray: '5,10'
            }).addTo(densityMapRef.current!);
          });
        }

        // Add enhanced density marker
        addEnhancedDensityMarker(densityMapRef.current!, coordinates, level, simulatedCount, density, areaSize);
      });
    }, 2000); // Update every 2 seconds for smooth animations

    return () => {
      clearInterval(updateInterval);
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

    // Create safety zones for each crowd level location
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
      };

      // Add visual effects for crowded/dangerous zones
      if (pulsate) {
        circleOptions.dashArray = '5, 10';
      }

      const safetyZone = L.circle(coordinates, radius, circleOptions).addTo(mapRef.current!);

      // Enhanced popup content
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
              ? '<AlertTriangle class="w-5 h-5" style="color: ' + safetyColor + '" />'
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

        ${safetyLevel === 'dangerous' || safetyLevel === 'crowded' ? `
          <div class="mt-3 p-2 bg-red-50 rounded border border-red-100 text-xs">
            <div class="font-medium text-red-700 mb-1">Emergency Protocol:</div>
            <div class="text-red-600">${getEmergencyProtocol(level.location)}</div>
            <div class="mt-2 font-medium text-red-700">Emergency Contacts:</div>
            <div class="grid grid-cols-2 gap-1 mt-1">
              <div>Police: 100</div>
              <div>Ambulance: 108</div>
              <div>Control Room: 0253-2578500</div>
              <div>Local Help: ${getLocalEmergencyContact(level.location)}</div>
            </div>
          </div>
        ` : ''}
      </div>
    `, {
      className: `safety-popup safety-${safetyLevel}`,
      maxWidth: 350
    });

      // Add a pulsating marker for dangerous/crowded areas
      if (safetyLevel === 'dangerous' || safetyLevel === 'crowded') {
        L.marker(coordinates, {
          icon: L.divIcon({
            className: 'safety-alert-marker',
            html: `
              <div class="relative">
                <div class="absolute -inset-2 bg-${safetyLevel === 'dangerous' ? 'red' : 'orange'}-500 rounded-full animate-ping opacity-20"></div>
                <div class="relative flex h-4 w-4 items-center justify-center">
                  <span class="absolute inline-flex h-full w-full rounded-full ${safetyLevel === 'dangerous' ? 'bg-red-500' : 'bg-orange-500'} opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 ${safetyLevel === 'dangerous' ? 'bg-red-500' : 'bg-orange-500'}"></span>
                </div>
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(mapRef.current!);
      }

      safetyZonesRef.current.push(safetyZone);
    });
  }, [crowdLevels, mapRef, showSafetyZones]);

  // Update the heatmap effect to use location-specific patterns
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

      // Get location-specific heat pattern
      const heatPattern = getEnhancedHeatPattern(level.location, ratio, hour);

      // Create main heat point
      expandedHeatmapData.push([
        coordinates[0],
        coordinates[1],
        baseIntensity
      ]);

      // Add surrounding points with location-specific patterns
      const numPoints = Math.floor(10 + (ratio * 5)); // More points for higher density
      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints;
        const distance = 0.002 * (0.5 + Math.random() * 0.5); // Varying distances
        const newLat = coordinates[0] + Math.sin(angle) * distance;
        const newLng = coordinates[1] + Math.cos(angle) * distance;
        const intensity = baseIntensity * (0.3 + Math.random() * 0.4);

        expandedHeatmapData.push([newLat, newLng, intensity]);
      }

      // Add movement trails based on time of day
      if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        // Add directional heat trails during peak hours
        const trailDirection = hour < 12 ? 1 : -1;
        for (let i = 1; i <= 3; i++) {
          const trailLat = coordinates[0] + (0.001 * i * trailDirection);
          const trailLng = coordinates[1] + (0.001 * i);
          expandedHeatmapData.push([trailLat, trailLng, baseIntensity * (1 - (i * 0.2))]);
        }
      }
    });

    // Create enhanced heat layer with dynamic patterns
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

  }, [crowdLevels, facilities, mapRef, showHeatLayer]);

  // Helper functions for safety advisories
  const getLocationSpecificAdvisory = (location: string, safetyLevel: string) => {
    const baseAdvice = {
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

  const getEmergencyProtocol = (location: string) => {
    switch (location) {
      case "Ramkund":
        return "Use emergency exits near the northern steps. Emergency boats are stationed nearby.";
      case "Kalaram Temple":
        return "Exit through the western gate. Emergency response team at main entrance.";
      case "Tapovan":
        return "Follow the marked evacuation routes. Assembly point at the main parking area.";
      default:
        return "Follow official evacuation routes and stay with your group.";
    }
  };

  const getLocalEmergencyContact = (location: string) => {
    switch (location) {
      case "Ramkund": return "0253-2590171";
      case "Kalaram Temple": return "0253-2590172";
      case "Tapovan": return "0253-2590173";
      case "Godavari Ghat": return "0253-2590174";
      default: return "0253-2590170";
    }
  };

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

  interface Shuttle {
    coordinates: { lat: number; lng: number };
    routeName: string;
    currentLocation: string;
    nextStop: string;
    estimatedArrival: string;
    capacity: number;
    status: 'on-time' | 'delayed' | 'warning';
  }

  interface Restroom {
    coordinates: { lat: number; lng: number };
    location: string;
    nearestStop: string;
    status: 'operational' | 'maintenance' | 'closed';
    facilities: string[];
  }

  type SafetyLevel = 'safe' | 'moderate' | 'crowded' | 'dangerous';
  const safetyAdvice: Record<SafetyLevel, string> = {
    safe: 'Safe for all visitors. Easy movement and navigation.',
    moderate: 'Moderate crowding observed. Keep belongings secure.',
    crowded: 'High crowd density. Follow official directions.',
    dangerous: 'CRITICAL ALERT: Avoid this area. Emergency protocols active.'
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

          {/* Auxiliary map buttons */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => toggleViewMode('density')}
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
              onClick={() => toggleViewMode('area')}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap4">
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
                <span>Data updates in real-time every 10 seconds. Last updated: {new Date().toLocaleTimeString()}</span>
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
                      <path d="M20 6v12a2 2 0 0 1-2 2H2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"></path>
                      <circle cx="10" cy="14" r="2"></circle>
                      <circle cx="16" cy="16" r="2"></circle>
                    </svg>
                    <span>Density measured in people per square meter. Real-time updates every 10 seconds.</span>
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