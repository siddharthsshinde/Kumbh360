import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAPILLARY_ACCESS_TOKEN = import.meta.env.VITE_MAPILLARY_CLIENT_TOKEN;
const MAPILLARY_AUTH_URL = 'https://www.mapillary.com/connect?client_id=9611319228912944';

interface Location {
  name: string;
  imageId: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
}

const NASHIK_LOCATIONS: Location[] = [
  {
    name: "Ramkund",
    imageId: "757434881633089",
    description: "Sacred bathing ghat on the Godavari River, where pilgrims perform holy rituals. Known for its spiritual significance during Kumbh Mela.",
    location: {
      lat: 20.0074901,
      lng: 73.79205090000005
    }
  },
  {
    name: "Kalaram Temple",
    imageId: "3398041944606843",
    description: "Historic black stone temple dedicated to Lord Rama in Panchavati area. Notable for its architectural beauty and religious importance.",
    location: {
      lat: 20.0064,
      lng: 73.7904
    }
  },
  {
    name: "Tapovan",
    imageId: "523157116754870",
    description: "Sacred area where Lord Rama stayed during exile. Features ancient caves and meditation spots surrounded by natural beauty.",
    location: {
      lat: 20.0116,
      lng: 73.7938
    }
  }
];

export function StreetView() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location>(NASHIK_LOCATIONS[0]);
  const [viewer, setViewer] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Mapillary Viewer script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/mapillary-js@4.1.1/dist/mapillary.min.js';
    script.async = true;
    script.onload = checkAuthAndInitialize;
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

  const checkAuthAndInitialize = async () => {
    try {
      if (!MAPILLARY_ACCESS_TOKEN) {
        console.error('Mapillary access token not found');
        handleAuthError();
        return;
      }

      const mly = new (window as any).Mapillary.Viewer({
        apiClient: MAPILLARY_ACCESS_TOKEN,
        container: 'street-view-container',
        imageId: selectedLocation.imageId,
      });

      mly.on('load', () => {
        setIsLoading(false);
        setIsAuthenticated(true);
        toast({
          title: "Street View Loaded",
          description: `Now viewing ${selectedLocation.name}`,
          variant: "default",
        });
      });

      mly.on('error', (error: any) => {
        console.error('Mapillary error:', error);
        if (error.toString().includes('authentication')) {
          handleAuthError();
        } else {
          toast({
            title: "Error",
            description: "Failed to load street view. Please try again.",
            variant: "destructive",
          });
        }
      });

      setViewer(mly);
    } catch (error) {
      console.error('Mapillary initialization error:', error);
      handleAuthError();
    }
  };

  const handleAuthError = () => {
    setIsAuthenticated(false);
    toast({
      title: "Authentication Required",
      description: "Please authenticate with Mapillary to view street images.",
      variant: "destructive",
    });
  };

  const handleAuth = () => {
    window.open(MAPILLARY_AUTH_URL, '_blank');
    toast({
      title: "Authentication Started",
      description: "Please complete the authentication in the new window.",
      variant: "default",
    });
  };

  const changeLocation = (location: Location) => {
    if (!isAuthenticated) {
      handleAuthError();
      return;
    }

    setIsLoading(true);
    setSelectedLocation(location);
    if (viewer) {
      viewer.moveTo(location.imageId).then(() => {
        setIsLoading(false);
        toast({
          title: "Location Changed",
          description: `Now viewing ${location.name}`,
          variant: "default",
        });
      }).catch((error: any) => {
        console.error('Error changing location:', error);
        toast({
          title: "Error",
          description: "Failed to load the selected location.",
          variant: "destructive",
        });
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
          {!isAuthenticated && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <Button
                onClick={handleAuth}
                className="bg-[#FF7F00] hover:bg-[#E67300] text-white"
              >
                Authenticate with Mapillary
              </Button>
            </div>
          )}
          <div
            id="street-view-container"
            className="w-full h-[500px] rounded-lg overflow-hidden"
          />
          {isLoading && isAuthenticated && (
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