import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

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
  const mapRef = useRef<L.Map | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLElement | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

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
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Initialize map when container is ready
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
    <div className="w-full bg-white rounded-lg shadow-md">
      <h2 className="p-3 text-xl font-semibold border-b text-[#FF7F00]">
        <span className="mr-2">🗺️</span>
        Kumbh Mela Locations
      </h2>

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
    </div>
  );
}