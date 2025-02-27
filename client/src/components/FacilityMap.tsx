import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility } from "@shared/schema";
import type { Location } from "@shared/types";
import { useQuery } from "@tanstack/react-query";

type FacilityType = "holy_site" | "hospital" | "hotel" | "temple";

// Custom icon function
const createCustomIcon = (type: string) => {
  const iconColors: Record<FacilityType, string> = {
    holy_site: "#FF7F00", // Saffron for temples and holy sites
    hospital: "#FF0000", // Red for hospitals
    hotel: "#138808", // Green for hotels
    temple: "#FF7F00", // Saffron for temples
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

  // Add markers when facilities data is available
  useEffect(() => {
    if (!mapRef.current || !facilities) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    facilities.forEach((facility) => {
      // Skip if filtering by type and this facility doesn't match
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
  }, [facilities, selectedType]);

  const facilityTypes = facilities ? 
    Array.from(new Set(facilities.map(f => f.type))) : 
    [];

  const handleFilterClick = (type: string | null) => {
    setSelectedType(type === selectedType ? null : type);
  };

  // Helper function to get human-readable type names
  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      holy_site: "Holy Sites",
      hospital: "Hospitals",
      hotel: "Hotels",
      temple: "Temples"
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

      <div className="p-2 text-xs text-gray-600 flex flex-wrap gap-x-4">
        <span className="font-semibold">Legend:</span>
        {facilityTypes.map(type => (
          <span key={type} className="flex items-center">
            <span 
              className="inline-block w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: getTypeColor(type) }}
            ></span>
            {getTypeName(type)}
          </span>
        ))}
      </div>
    </div>
  );
}