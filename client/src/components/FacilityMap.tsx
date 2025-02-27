import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility } from "@shared/schema";
import type { Location } from "@shared/types";
import { useQuery } from "@tanstack/react-query";

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
      mapRef.current = L.map(mapContainer).setView([20.0059, 73.7913], 13);
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
        const marker = L.marker([location.lat, location.lng])
          .bindPopup(
            `<b>${facility.name}</b><br>${facility.type}<br>${facility.address}`
          )
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