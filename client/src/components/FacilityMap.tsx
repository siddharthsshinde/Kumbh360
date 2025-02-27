import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility } from "@shared/schema";
import type { Location } from "@shared/types";
import { useQuery } from "@tanstack/react-query";

// Custom icon function
const createCustomIcon = (type: string) => {
  const iconColors = {
    holy_site: "#FF7F00", // Saffron for temples and holy sites
    hospital: "#FF0000", // Red for hospitals
    hotel: "#138808", // Green for hotels
    temple: "#FF7F00", // Saffron for temples
  };

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${iconColors[type] || '#000080'}; 
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

  const { data: facilities } = useQuery<Facility[]>({
    queryKey: ["/api/facilities"],
  });

  // Initialize map when container is ready
  useEffect(() => {
    if (!mapContainer) return;

    if (!mapRef.current) {
      // Center on Ramkund, Nashik
      mapRef.current = L.map(mapContainer).setView([20.0059, 73.7913], 15);
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

  // Handle facilities data changes
  useEffect(() => {
    if (!mapRef.current || !facilities) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    facilities.forEach((facility) => {
      const location = facility.location as Location;
      if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
        const marker = L.marker(
          [location.lat, location.lng],
          { icon: createCustomIcon(facility.type) }
        )
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg">${facility.name}</h3>
              <p class="text-sm capitalize">${facility.type.replace('_', ' ')}</p>
              <p class="text-sm">${facility.address}</p>
              ${facility.contact ? `<p class="text-sm mt-2">📞 ${facility.contact}</p>` : ''}
            </div>
          `)
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
      }
    });
  }, [facilities]);

  return (
    <Card className="w-full h-[400px] overflow-hidden">
      <div 
        ref={(el) => setMapContainer(el)} 
        className="w-full h-full" 
      />
    </Card>
  );
}