import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const MAPILLARY_ACCESS_TOKEN = 'MLY|9611319228912944|29e109c6564d3af0177a71111877bb0e';

interface Location {
  name: string;
  imageId: string;
  description: string;
}

const NASHIK_LOCATIONS: Location[] = [
  {
    name: "Ramkund",
    imageId: "2299343675291665",
    description: "Sacred bathing ghat on the Godavari River"
  },
  {
    name: "Kalaram Temple",
    imageId: "3398041944606843",
    description: "Historic temple in Panchavati area"
  },
  {
    name: "Tapovan",
    imageId: "523157116754870",
    description: "Sacred area where Lord Rama stayed during exile"
  }
];

export function StreetView() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location>(NASHIK_LOCATIONS[0]);
  const [viewer, setViewer] = useState<any>(null);

  useEffect(() => {
    // Load Mapillary Viewer script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/mapillary-js@4.1.1/dist/mapillary.min.js';
    script.async = true;
    script.onload = initializeViewer;
    document.body.appendChild(script);

    // Load Mapillary CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/mapillary-js@4.1.1/dist/mapillary.min.css';
    document.head.appendChild(link);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(link);
      if (viewer) {
        viewer.remove();
      }
    };
  }, []);

  const initializeViewer = () => {
    const mly = new (window as any).Mapillary.Viewer({
      apiClient: MAPILLARY_ACCESS_TOKEN,
      container: 'street-view-container',
      imageId: selectedLocation.imageId,
    });

    setViewer(mly);
    setIsLoading(false);

    mly.on('load', () => {
      setIsLoading(false);
    });
  };

  const changeLocation = (location: Location) => {
    setIsLoading(true);
    setSelectedLocation(location);
    if (viewer) {
      viewer.moveTo(location.imageId).then(() => {
        setIsLoading(false);
      });
    }
  };

  return (
    <Card className="p-4 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center text-[#FF7F00]">
          Nashik Street View
        </h2>

        <div className="flex gap-2 justify-center mb-4">
          {NASHIK_LOCATIONS.map((location) => (
            <Button
              key={location.imageId}
              onClick={() => changeLocation(location)}
              variant={selectedLocation.imageId === location.imageId ? "default" : "outline"}
              className={selectedLocation.imageId === location.imageId ? "bg-[#FF7F00] text-white" : ""}
            >
              {location.name}
            </Button>
          ))}
        </div>

        <div className="relative">
          <div
            id="street-view-container"
            className="w-full h-[500px] rounded-lg overflow-hidden"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF7F00]" />
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 mt-2">
          {selectedLocation.description}
        </p>
      </div>
    </Card>
  );
}